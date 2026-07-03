/* ============================================================
 * LLM Blueprint — real-values client
 *
 * Two ways to get REAL model output for custom questions:
 *   1. config.apiEndpoint  -> your Cloudflare Worker
 *      (workers/llm-proxy.js; key stays server-side; public-safe)
 *   2. js/config.local.js  -> direct browser call to an
 *      OpenAI-compatible API. LOCAL USE ONLY — the key would be
 *      readable in the page source if you ever published it.
 *
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

  /* ---------- OpenAI logprobs -> page data (shared transform) ---------- */

  function tokText(entry) {
    if (entry.bytes && entry.bytes.length) {
      try {
        return new TextDecoder("utf-8", { fatal: false })
          .decode(new Uint8Array(entry.bytes));
      } catch (e) { /* fall through */ }
    }
    return entry.token || "";
  }

  function transformOpenAI(data) {
    const choice = data.choices && data.choices[0];
    const content = (choice && choice.logprobs && choice.logprobs.content) || [];
    const steps = content.map((tk) => {
      const chosenText = tokText(tk);
      const cands = (tk.top_logprobs || []).map((c) => ({
        t: tokText(c),
        p: Math.round(Math.exp(c.logprob) * 1000) / 1000,
      }));
      if (!cands.some((c) => c.t === chosenText)) {
        cands.push({ t: chosenText, p: Math.round(Math.exp(tk.logprob) * 1000) / 1000 });
      }
      cands.sort((a, b) => b.p - a.p);
      const top = cands.slice(0, 5);
      const chosen = Math.max(0, top.findIndex((c) => c.t === chosenText));
      const others = Math.max(0, 1 - top.reduce((s, c) => s + c.p, 0));
      return { topK: top, others: Math.round(others * 1000) / 1000, chosen };
    });
    return {
      model: data.model,
      answer: (choice && choice.message && choice.message.content) || "",
      answerTokens: content.map((tk) => ({ t: tokText(tk) })),
      steps,
    };
  }

  /* ---------- backends ---------- */

  async function callWorker(question, config) {
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
    return data;   /* worker already returns the transformed shape */
  }

  async function callDirect(question, local) {
    const res = await fetch(
      (local.baseUrl || "https://api.openai.com/v1") + "/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + local.openaiKey,
        },
        body: JSON.stringify({
          model: local.model || "gpt-4o-mini",
          max_tokens: 90,
          temperature: 0.7,
          logprobs: true,
          top_logprobs: 5,
          messages: [
            {
              role: "system",
              content:
                "Answer in the same language as the question, in 2-3 short, " +
                "friendly sentences suitable for a general audience. No lists, no markdown.",
            },
            { role: "user", content: question },
          ],
        }),
      }
    );
    if (!res.ok) throw new Error("openai " + res.status);
    return transformOpenAI(await res.json());
  }

  /* true when any real backend is available */
  NS.hasRealBackend = function (config) {
    const local = window.LLMBP_CONFIG_LOCAL;
    return !!(config.apiEndpoint ||
      (local && local.openaiKey && local.openaiKey.indexOf("REPLACE") === -1));
  };

  /* Ask a real model; returns QuestionData for the pipeline. */
  NS.fetchRealQuestion = async function (question, config) {
    const local = window.LLMBP_CONFIG_LOCAL;
    const data = config.apiEndpoint
      ? await callWorker(question, config)
      : await callDirect(question, local);

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
