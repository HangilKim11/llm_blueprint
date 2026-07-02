/* ============================================================
 * S00 · Intro — title block, question picker, chat mock
 * ============================================================ */
(function () {
  "use strict";
  const NS = window.LLMBP;
  const { el } = NS;

  NS.scenes.push({
    id: "s00",
    section: "#sc-intro",
    span: 0,
    rail: false,

    build(stage, tl, ctx) {
      const { i18n, config } = ctx;
      this.buildGrid(ctx);
      this.buildChat(ctx);
      i18n.apply(document.querySelector("#sc-intro"));
    },

    /* ---------- question grid (only the current UI language) ---------- */
    buildGrid(ctx) {
      const grid = document.querySelector("#q-grid");
      NS.clear(grid);
      const lang = ctx.i18n.lang;
      const qs = ctx.allData.filter((q) => q.lang === lang);

      qs.forEach((q, idx) => {
        const card = el("button", "q-card", null, grid);
        card.type = "button";
        el("span", "q-card__id", `Q-${lang.toUpperCase()}-0${idx + 1}`, card);
        card.appendChild(document.createTextNode(q.question));
        if (ctx.data && ctx.data.id === q.id) card.classList.add("selected");
        card.addEventListener("click", () => ctx.onSelect(q.id));
      });

      /* custom input (fork mode) */
      const zone = document.querySelector("#q-custom-zone");
      NS.clear(zone);
      if (!ctx.customEnabled) return;

      const openBtn = el("button", "q-card q-custom", null, zone);
      openBtn.type = "button";
      el("span", "q-card__id", "Q-CUSTOM", openBtn);
      const openLabel = el("span", null, "", openBtn);
      openLabel.dataset.i18n = "ui.customOpen";

      const form = el("div", "custom-form", null, zone);
      const qIn = el("textarea", null, null, form);
      qIn.rows = 1;
      qIn.setAttribute("data-i18n-attr", "placeholder:ui.customQPh");
      const aIn = el("textarea", null, null, form);
      aIn.rows = 2;
      aIn.setAttribute("data-i18n-attr", "placeholder:ui.customAPh");
      const row = el("div", "row", null, form);
      const go = el("button", "btn-bp btn-bp--amber", null, row);
      go.type = "button";
      go.dataset.i18n = "ui.customGo";
      const hint = el("span", "label", null, row);
      hint.dataset.i18n = "ui.customHint";

      openBtn.addEventListener("click", () => form.classList.toggle("open"));
      go.addEventListener("click", () => {
        const q = qIn.value.trim();
        if (!q) { qIn.focus(); return; }
        ctx.onCustom(q, aIn.value.trim());
      });
    },

    /* ---------- chat mock with typing animation ---------- */
    buildChat(ctx) {
      const mock = document.querySelector("#chat-mock");
      NS.clear(mock);
      if (!ctx.data) return;

      const label = el("div", "chat-mock__label label label--cyan", null, mock);
      label.dataset.i18n = "ui.chatLabel";
      const box = el("div", "chat-input", null, mock);
      const txt = el("div", "chat-input__text", null, box);
      const caret = el("span", "caret", null, null);
      const send = el("div", "chat-input__send", "➤", box);

      const full = ctx.data.question;
      txt.textContent = "";
      txt.appendChild(caret);

      if (NS.reducedMotion) {
        txt.textContent = full;
        return;
      }
      const state = { n: 0 };
      gsap.to(state, {
        n: full.length,
        duration: Math.min(2.2, 0.08 * full.length + 0.4),
        ease: "none",
        delay: 0.35,
        snap: { n: 1 },
        onUpdate() {
          txt.textContent = full.slice(0, state.n);
          txt.appendChild(caret);
        },
        onComplete() {
          gsap.fromTo(send, { scale: 1 }, {
            scale: 1.12, duration: 0.5, repeat: 3, yoyo: true, ease: "power1.inOut",
          });
        },
      });
    },
  });
})();
