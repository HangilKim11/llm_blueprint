/* ============================================================
 * LLM Blueprint — real-values proxy (Cloudflare Worker)
 *
 * Turns a question into { answer, steps[] } with REAL per-token
 * top-k probabilities (logprobs) from an OpenAI-compatible API.
 * The API key stays here, server-side — never in the page.
 *
 * Deploy (from the workers/ directory):
 *   npx wrangler deploy
 *   npx wrangler secret put OPENAI_API_KEY
 *   # optional abuse guard:
 *   npx wrangler secret put SHARED_KEY
 *
 * Then set js/config.js -> apiEndpoint to the worker URL.
 * ============================================================ */

const MODEL = "gpt-4o-mini";
const MAX_TOKENS = 90;
const TOP_LOGPROBS = 5;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });

/* logprob entry -> display text (bytes-safe for CJK) */
function tokText(entry) {
  if (entry.bytes && entry.bytes.length) {
    try {
      return new TextDecoder("utf-8", { fatal: false })
        .decode(new Uint8Array(entry.bytes));
    } catch (e) { /* fall through */ }
  }
  return entry.token || "";
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (request.method !== "POST") return json({ error: "POST only" }, 405);

    let body;
    try { body = await request.json(); }
    catch (e) { return json({ error: "invalid JSON" }, 400); }

    const question = (body.question || "").trim().slice(0, 300);
    if (!question) return json({ error: "question required" }, 400);

    /* optional shared key so strangers can't burn your quota */
    if (env.SHARED_KEY && body.key !== env.SHARED_KEY) {
      return json({ error: "unauthorized" }, 401);
    }
    if (!env.OPENAI_API_KEY) return json({ error: "OPENAI_API_KEY not set" }, 500);

    const upstream = await fetch(
      (env.OPENAI_BASE_URL || "https://api.openai.com/v1") + "/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: env.MODEL || MODEL,
          max_tokens: MAX_TOKENS,
          temperature: 0.7,
          logprobs: true,
          top_logprobs: TOP_LOGPROBS,
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

    if (!upstream.ok) {
      const detail = await upstream.text();
      return json({ error: "upstream " + upstream.status, detail: detail.slice(0, 300) }, 502);
    }

    const data = await upstream.json();
    const choice = data.choices && data.choices[0];
    const content = choice?.logprobs?.content || [];

    /* per output token: real top-k candidates, probability = exp(logprob) */
    const steps = content.map((tk) => {
      const chosenText = tokText(tk);
      const cands = (tk.top_logprobs || []).map((c) => ({
        t: tokText(c),
        p: Math.round(Math.exp(c.logprob) * 1000) / 1000,
      }));
      /* ensure the sampled token is present, then sort by probability */
      if (!cands.some((c) => c.t === chosenText)) {
        cands.push({ t: chosenText, p: Math.round(Math.exp(tk.logprob) * 1000) / 1000 });
      }
      cands.sort((a, b) => b.p - a.p);
      const top = cands.slice(0, TOP_LOGPROBS);
      const chosen = Math.max(0, top.findIndex((c) => c.t === chosenText));
      const others = Math.max(0, 1 - top.reduce((s, c) => s + c.p, 0));
      return {
        topK: top,
        others: Math.round(others * 1000) / 1000,
        chosen,
      };
    });

    return json({
      model: data.model || MODEL,
      answer: choice?.message?.content || "",
      answerTokens: content.map((tk) => ({ t: tokText(tk) })),
      steps,
    });
  },
};
