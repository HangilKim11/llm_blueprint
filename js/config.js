/* ============================================================
 * LLM Blueprint — configuration
 * Fork users: this is the only file you need to touch.
 * ============================================================ */
window.LLMBP_CONFIG = {

  /* Show a "custom question" card on the intro screen.
   * false = preset questions only (hosted demo mode).
   * true  = visitors can type their own question (+ optional answer)
   *         and watch it go through the pipeline.
   * Tip: appending ?custom=1 to the URL also enables it. */
  enableCustomInput: false,

  /* REAL-VALUES MODE (optional).
   * Deploy workers/llm-proxy.js to your own Cloudflare account,
   * then put the worker URL here. Custom questions will use a real
   * model: real answer, real tokens, real top-k probabilities.
   * Empty string = approximate offline mode (no server needed).
   * apiSharedKey must match the SHARED_KEY secret if you set one. */
  apiEndpoint: "",
  apiSharedKey: "",

  /* Footer links. Empty string hides the entry. */
  author: {
    name:   "Hangil Kim",
    blog:   "https://han-co.com/",
    email:  "kim.hangil.ds@gmail.com",
    github: "https://github.com/HangilKim11/llm_blueprint",
  },

  /* UI language on first visit: "auto" | "ko" | "ja" | "en" */
  defaultLang: "auto",

  /* Question preselected on load (any id in data/questions.data.js).
   * Overridable with ?q=<id> in the URL. */
  defaultQuestion: "sky-ko",

  /* Illustrative model shown in scene 7 (layer descent). */
  model: { layers: 28, dims: 16 },
};
