/* ============================================================
 * LLM Blueprint — client-side heuristic tokenizer
 * Mirrors tools/generate_data.py (heuristic-v1) so that custom
 * questions behave like the baked presets. Approximate GPT-style
 * splits; run generate_data.py with tiktoken for real o200k ids.
 * ============================================================ */
(function () {
  "use strict";
  const NS = (window.LLMBP = window.LLMBP || {});

  /* ---- deterministic hash / fake id ---- */
  function fnv1a(str) {
    let h = 0x811c9dc5;
    const bytes = new TextEncoder().encode(str);
    for (const b of bytes) {
      h ^= b;
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h >>> 0;
  }
  const fakeId = (tok) => (fnv1a(tok) % 199998) + 1;

  /* ---- script matchers (kept in sync with generate_data.py) ---- */
  const KO_SUFFIX2 = ["가요", "나요", "어요", "아요", "세요", "지요", "까요", "네요",
    "예요", "에요", "니다", "는데", "지만", "면서", "이며"];
  const KO_PART1 = new Set("은는이가을를에의도만와과로서요죠고며");
  const JA_PART1 = new Set("はがをにのとももでへやか");

  const RE = {
    space:  /^\s+/,
    latin:  /^[A-Za-z]+/,
    digit:  /^[0-9]+/,
    hangul: /^[가-힯]+/,
    kanji:  /^[㐀-鿿々]+/,
    hira:   /^[぀-ゟー]+/,
    kata:   /^[゠-ヿー]+/,
    punct:  /^[^\w\s぀-ヿ㐀-鿿가-힯]/,
  };

  const chunk = (s, n) => {
    const out = [];
    for (let i = 0; i < s.length; i += n) out.push(s.slice(i, i + n));
    return out;
  };

  function splitHangul(run) {
    for (const suf of KO_SUFFIX2) {
      if (run.length > 2 && run.endsWith(suf)) {
        return splitHangul(run.slice(0, -2)).concat([suf]);
      }
    }
    if (run.length > 1 && KO_PART1.has(run[run.length - 1])) {
      return splitHangul(run.slice(0, -1)).concat([run[run.length - 1]]);
    }
    return chunk(run, 2);
  }

  function splitHira(run) {
    const out = [];
    if (run.length > 1 && JA_PART1.has(run[0])) {
      out.push(run[0]);
      run = run.slice(1);
    }
    return out.concat(chunk(run, 2));
  }

  const RULES = [
    [RE.latin,  (s) => (s.length > 6 ? chunk(s, 4) : [s])],
    [RE.digit,  (s) => chunk(s, 3)],
    [RE.hangul, splitHangul],
    [RE.kanji,  (s) => chunk(s, 2)],
    [RE.kata,   (s) => chunk(s, 3)],
    [RE.hira,   splitHira],
    [RE.punct,  (s) => [s]],
  ];

  /* GPT-style: a leading space is glued onto the following token. */
  function tokenizeText(text) {
    const toks = [];
    let pendingSpace = "", i = 0;
    outer: while (i < text.length) {
      const rest = text.slice(i);
      let m = rest.match(RE.space);
      if (m) { pendingSpace = " "; i += m[0].length; continue; }
      for (const [regex, splitter] of RULES) {
        m = rest.match(regex);
        if (m) {
          const pieces = splitter(m[0]);
          pieces[0] = pendingSpace + pieces[0];
          pendingSpace = "";
          toks.push(...pieces);
          i += m[0].length;
          continue outer;
        }
      }
      toks.push(pendingSpace + rest[0]);
      pendingSpace = "";
      i += 1;
    }
    return toks;
  }

  NS.tokenize = (text) => tokenizeText(text).map((t) => ({ t, id: fakeId(t) }));

  /* ---- language detection (for custom input) ---- */
  NS.detectLang = function (text) {
    if (/[가-힯]/.test(text)) return "ko";
    if (/[぀-ヿ]/.test(text)) return "ja";
    if (/[㐀-鿿]/.test(text)) return "ja"; // kanji only -> assume ja
    return "en";
  };

  /* ---- seeded RNG (mulberry32) ---- */
  NS.rng = function (seedStr) {
    let a = fnv1a(seedStr);
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  NS.hash = fnv1a;

  /* ---- build a full QuestionData object from arbitrary input ---- */
  const POOL = {
    ko: ["그리고", "하지만", "왜냐하면", "빛", "공기", "물", "우리", "아주",
      "조금", "이렇게", "때문에", "다른", "사람", "여러", "가장", "다시"],
    ja: ["そして", "しかし", "なぜなら", "光", "空気", "水", "私たち", "とても",
      "少し", "このように", "ため", "他の", "人", "色々", "最も", "また"],
    en: [" and", " but", " because", " light", " air", " water", " the", " very",
      " some", " this", " so", " other", " people", " many", " most", " then"],
  };
  const FALLBACK_ANSWER = {
    ko: "좋은 질문이에요. 이 데모는 미리 준비된 답만 알고 있어서, 지금은 이 문장이 조립되는 과정을 대신 보여드릴게요.",
    ja: "いい質問ですね。このデモは用意された答えしか知らないので、今はこの文章が組み立てられる過程をお見せします。",
    en: "Good question. This demo only knows its prepared answers, so instead it will show you how this very sentence gets assembled.",
  };

  NS.buildCustomQuestion = function (question, answer, lang) {
    lang = lang || NS.detectLang(question);
    answer = (answer || "").trim() || FALLBACK_ANSWER[lang];
    const tokens = NS.tokenize(question);
    const answerTokens = NS.tokenize(answer);
    const rand = NS.rng("custom:" + question);

    /* attention: link last content token -> first content token + neighbours */
    const content = tokens
      .map((tk, i) => ({ i, len: tk.t.trim().length }))
      .filter((x) => x.len > 1);
    const highlights = [];
    if (content.length >= 2) {
      highlights.push({
        from: content[content.length - 1].i,
        to: content[0].i, w: 0.85, label: "",
      });
      if (content.length >= 3) {
        highlights.push({
          from: content[Math.floor(content.length / 2)].i,
          to: content[0].i, w: 0.6, label: "",
        });
      }
    }

    /* top-k steps, same recipe as the baker */
    const texts = answerTokens.map((t) => t.t);
    const steps = answerTokens.map((tok, i) => {
      const chosenP = Math.round((0.34 + rand() * 0.44) * 100) / 100;
      const pool = POOL[lang].filter((c) => c !== tok.t)
        .concat(texts.filter((t, j) => j !== i && t.trim() && t !== tok.t));
      /* shuffle */
      for (let k = pool.length - 1; k > 0; k--) {
        const j = Math.floor(rand() * (k + 1));
        [pool[k], pool[j]] = [pool[j], pool[k]];
      }
      const seen = new Set([tok.t.trim()]);
      const distract = [];
      for (const c of pool) {
        const key = c.trim();
        if (key && !seen.has(key)) { distract.push(c); seen.add(key); }
        if (distract.length === 4) break;
      }
      const remain = 1 - chosenP;
      const ws = distract.map(() => rand()).sort((a, b) => b - a);
      const wsum = ws.reduce((s, w) => s + w, 0) || 1;
      const topK = [{ t: tok.t, p: chosenP }].concat(
        distract.map((d, k) => ({
          t: d, p: Math.round(remain * 0.72 * (ws[k] / wsum) * 1000) / 1000,
        }))
      );
      const others = Math.max(0, 1 - topK.reduce((s, x) => s + x.p, 0));
      return { topK, others: Math.round(others * 1000) / 1000 };
    });

    return {
      id: "custom", lang, group: null, question, answer,
      tokens, answerTokens,
      attention: { highlights, procedural: "distance-decay" },
      steps, notes: null, isCustom: true,
    };
  };
})();
