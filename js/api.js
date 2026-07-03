/* ============================================================
 * LLM Blueprint — real-values client
 *
 * When config.apiEndpoint is set, custom questions are answered
 * by a real model (via workers/llm-proxy.js): real answer text,
 * real answer tokens, real per-token top-k probabilities.
 * Question tokenization uses js-tiktoken (real o200k) loaded
 * lazily from a CDN, with the local heuristic as fallback.
 * Attention stays a conceptual reconstruction — APIs don't
 * expose attention weights.
 * ============================================================ */
(function () {
  "use strict";
  const NS = (window.LLMBP = window.LLMBP || {});

  let encPromise = null;

  /* real o200k tokenizer, loaded on first use (~3 MB, cached) */
  function loadEncoder() {
    if (!encPromise) {
      encPromise = (async () => {
        const [{ Tiktoken }, ranks] = await Promise.all([
          import("https://esm.sh/js-tiktoken@1.0.15/lite"),
          import("https://esm.sh/js-tiktoken@1.0.15/ranks/o200k_base"),
        ]);
        return new Tiktoken(ranks.default || ranks);
      })().catch((e) => {
        console.warn("js-tiktoken unavailable, falling back to heuristic:", e);
        encPromise = null;
        return null;
      });
    }
    return encPromise;
  }

  /* encode + decode per id; merge byte-split CJK pieces for display */
  function realTokens(enc, text) {
    const ids = enc.encode(text);
    const out = [];
    let carryIds = [];
    for (const id of ids) {
      carryIds.push(id);
      const s = enc.decode(carryIds);
      if (!s.includes("�")) {
        out.push({ t: s, id: carryIds[0], n: carryIds.length });
        carryIds = [];
      }
    }
    if (carryIds.length) out.push({ t: "�", id: carryIds[0], n: carryIds.length });
    return { tokens: out, count: ids.length };
  }

  /* procedural attention over arbitrary tokens (same as tokenizer.js) */
  function attentionFor(tokens) {
    const content = tokens
      .map((tk, i) => ({ i, len: tk.t.trim().length }))
      .filter((x) => x.len > 1);
    const highlights = [];
    if (content.length >= 2) {
      highlights.push({
        from: content[content.length - 1].i, to: content[0].i, w: 0.85, label: "",
      });
      if (content.length >= 3) {
        highlights.push({
          from: content[Math.floor(content.length / 2)].i, to: content[0].i, w: 0.6, label: "",
        });
      }
    }
    return { highlights, procedural: "distance-decay" };
  }

  /* Ask the worker for a real answer + real probabilities. */
  NS.fetchRealQuestion = async function (question, config) {
    const res = await fetch(config.apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        ...(config.apiSharedKey ? { key: config.apiSharedKey } : {}),
      }),
    });
    if (!res.ok) throw new Error("proxy " + res.status);
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    /* question tokens: real o200k if possible, heuristic otherwise */
    let qTokens, realTok = false;
    const enc = await loadEncoder();
    if (enc) {
      qTokens = realTokens(enc, question).tokens;
      realTok = true;
    } else {
      qTokens = NS.tokenize(question);
    }

    const answerTokens = (data.answerTokens || []).map((tk) => ({
      t: tk.t,
      id: NS.hash("ans:" + tk.t) % 199998 + 1,   /* visual seed only */
    }));

    return {
      id: "custom-real",
      lang: NS.detectLang(question),
      group: null,
      question,
      answer: data.answer,
      tokens: qTokens,
      answerTokens,
      attention: attentionFor(qTokens),
      steps: data.steps || [],
      notes: null,
      isCustom: true,
      isReal: true,
      realTokenizer: realTok,
      model: data.model,
    };
  };
})();
