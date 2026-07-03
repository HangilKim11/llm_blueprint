/* ============================================================
 * LLM Blueprint — bootstrap
 * ============================================================ */
(function () {
  "use strict";
  const NS = window.LLMBP;

  document.addEventListener("DOMContentLoaded", () => {
    const config = window.LLMBP_CONFIG;
    const allData = window.LLMBP_DATA.questions;
    const params = new URLSearchParams(location.search);

    /* ---------- state ---------- */
    const state = {
      data:
        allData.find((q) => q.id === params.get("q")) ||
        allData.find((q) => q.id === config.defaultQuestion) ||
        allData[0],
    };
    const customEnabled = config.enableCustomInput || params.get("custom") === "1";

    /* ---------- i18n ---------- */
    NS.i18n.init(config.defaultLang);
    document.documentElement.lang = NS.i18n.lang;

    document.querySelectorAll(".lang-toggle button").forEach((b) => {
      b.addEventListener("click", () => {
        NS.i18n.set(b.dataset.lang);
      });
    });
    /* dynamic scene text needs a rebuild on language change */
    NS.i18n.onChange(() => NS.director.rebuild(ctx));

    /* ---------- context handed to every scene ---------- */
    const ctx = {
      get data() { return state.data; },
      allData,
      config,
      customEnabled,
      i18n: NS.i18n,
      onSelect(id) {
        const q = allData.find((x) => x.id === id);
        if (!q || q === state.data) return;
        state.data = q;
        NS.director.rebuild(ctx);
        history.replaceState(null, "", "?q=" + id);
      },
      async onCustom(question, answer, onDone) {
        /* real-values mode when a proxy endpoint or a local key is
           configured; graceful fallback to the offline approximation */
        if (NS.hasRealBackend(config) && !answer) {
          try {
            state.data = await NS.fetchRealQuestion(question, config);
          } catch (e) {
            console.warn("real-values proxy failed, using approximation:", e);
            state.data = NS.buildCustomQuestion(question, answer);
          }
        } else {
          state.data = NS.buildCustomQuestion(question, answer);
        }
        if (onDone) onDone(state.data);
        NS.director.rebuild(ctx);
        const chat = document.querySelector("#chat-mock");
        if (chat) chat.scrollIntoView({ behavior: "smooth", block: "center" });
      },
    };

    /* ---------- go ---------- */
    NS.i18n.apply();
    NS.director.init(ctx);
  });
})();
