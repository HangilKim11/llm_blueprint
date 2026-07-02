/* ============================================================
 * LLM Blueprint — i18n
 * UI language (ko/ja/en) is independent from the question language.
 * Strings live in data/captions.js -> window.LLMBP_CAPTIONS.
 * ============================================================ */
(function () {
  "use strict";
  const NS = (window.LLMBP = window.LLMBP || {});
  const LANGS = ["ko", "ja", "en"];

  const i18n = {
    lang: "en",
    listeners: [],

    init(defaultLang) {
      let lang = defaultLang;
      if (lang === "auto" || !LANGS.includes(lang)) {
        const nav = (navigator.language || "en").slice(0, 2);
        lang = LANGS.includes(nav) ? nav : "en";
      }
      const url = new URLSearchParams(location.search).get("lang");
      if (LANGS.includes(url)) lang = url;
      this.lang = lang;
    },

    /* t("s02.title") -> localized string; t(obj) -> obj[lang] */
    t(key) {
      if (key == null) return "";
      if (typeof key === "object") return key[this.lang] || key.en || "";
      const parts = key.split(".");
      let cur = window.LLMBP_CAPTIONS;
      for (const p of parts) {
        cur = cur && cur[p];
        if (cur == null) return key;
      }
      if (typeof cur === "object") return cur[this.lang] || cur.en || "";
      return cur;
    },

    set(lang) {
      if (!LANGS.includes(lang) || lang === this.lang) return;
      this.lang = lang;
      this.apply();
      document.documentElement.lang = lang;
      this.listeners.forEach((fn) => fn(lang));
    },

    onChange(fn) { this.listeners.push(fn); },

    /* Fill every [data-i18n] element. Values may contain <em>/<code>. */
    apply(root) {
      (root || document).querySelectorAll("[data-i18n]").forEach((el) => {
        el.innerHTML = this.t(el.getAttribute("data-i18n"));
      });
      (root || document).querySelectorAll("[data-i18n-attr]").forEach((el) => {
        /* format: "placeholder:key" */
        const [attr, key] = el.getAttribute("data-i18n-attr").split(":");
        el.setAttribute(attr, this.t(key));
      });
      document.querySelectorAll(".lang-toggle button").forEach((b) => {
        b.classList.toggle("active", b.dataset.lang === this.lang);
      });
    },
  };

  NS.i18n = i18n;
})();
