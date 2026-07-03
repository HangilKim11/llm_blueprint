/* ============================================================
 * LOCAL-ONLY real-values config (no server needed).
 *
 * 1. Copy this file to  js/config.local.js
 * 2. Put your OpenAI-compatible API key below
 * 3. Open index.html — custom questions now use the real model
 *
 * ⚠ SECURITY — READ THIS
 *   js/config.local.js is .gitignore'd on purpose. NEVER commit it
 *   and NEVER deploy it to a public site: anyone could read your
 *   key from the page source. For anything public, use the
 *   Cloudflare Worker instead (workers/llm-proxy.js), which keeps
 *   the key server-side.
 * ============================================================ */
window.LLMBP_CONFIG_LOCAL = {
  openaiKey: "sk-REPLACE_ME",
  model: "gpt-4o-mini",
  // baseUrl: "https://api.openai.com/v1",   // change for Azure/compatible APIs
};
