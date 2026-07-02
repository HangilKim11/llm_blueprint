/* ============================================================
 * S11 · Recap — full pipeline drawing (clickable), restart,
 * disclaimer and footer links.
 * ============================================================ */
(function () {
  "use strict";
  const NS = window.LLMBP;
  const { el, svg } = NS;

  const STAGES = [
    ["s01", "INPUT"], ["s02", "TOKENIZE"], ["s03", "EMBED"],
    ["s04", "POSITION"], ["s05", "ATTENTION"], ["s06", "FFN"],
    ["s07", "× N LAYERS"], ["s08", "SOFTMAX"], ["s09", "SAMPLE ⟲"], ["s10", "OUTPUT"],
  ];

  const ICONS = {
    blog: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.9 5.7 3.9 9S14.5 18.4 12 21c-2.5-2.6-3.9-5.7-3.9-9S9.5 5.6 12 3z"/></svg>',
    email: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m4 7 8 6 8-6"/></svg>',
    github: '<svg viewBox="0 0 24 24"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/></svg>',
  };

  NS.scenes.push({
    id: "s11",
    section: "#sc-recap",
    span: 0,
    rail: true,

    build(stage, tl, ctx) {
      const { i18n, config } = ctx;
      const wrap = document.querySelector(".recap__wrap");
      const mapBox = wrap.querySelector(".recap__map");
      NS.clear(mapBox);

      /* --- pipeline drawing --- */
      const W = 1180, H = 190, n = STAGES.length;
      const NY = 108, NH = 50;                    /* node band */
      const S = svg("svg", { viewBox: `0 0 ${W} ${H}` }, mapBox);
      const bw = 96, gap = (W - 40 - n * bw) / (n - 1);
      const nodeX = (i) => 20 + i * (bw + gap);

      /* arrowhead markers */
      const defs = svg("defs", {}, S);
      const mkMarker = (id, color) => {
        const m = svg("marker", {
          id, viewBox: "0 0 10 10", refX: "8", refY: "5",
          markerWidth: "7", markerHeight: "7", orient: "auto-start-reverse",
        }, defs);
        svg("path", { d: "M 1 1 L 8 5 L 1 9", fill: "none", stroke: color, "stroke-width": "1.4" }, m);
      };
      mkMarker("arr-c", "rgba(234,246,255,0.45)");
      mkMarker("arr-a", "#ffb454");

      STAGES.forEach(([id, lab], i) => {
        const x = nodeX(i);
        const g = svg("g", { class: "recap-node" }, S);
        svg("rect", {
          x, y: NY, width: bw, height: NH, rx: 1,
          "vector-effect": "non-scaling-stroke",
        }, g);
        /* blueprint corner ticks */
        svg("path", {
          d: `M ${x} ${NY + 9} V ${NY} H ${x + 9} M ${x + bw} ${NY + NH - 9} V ${NY + NH} H ${x + bw - 9}`,
          stroke: "var(--cyan)", "stroke-width": "1.4", fill: "none", opacity: 0.85,
          "vector-effect": "non-scaling-stroke",
        }, g);
        /* index number */
        const num = svg("text", {
          x: x + 7, y: NY + 15,
          style: "fill:var(--amber);font-size:8.5px;letter-spacing:1px;",
        }, g);
        num.textContent = String(i + 1).padStart(2, "0");
        const t = svg("text", {
          x: x + bw / 2, y: NY + NH / 2 + 8, "text-anchor": "middle",
        }, g);
        t.textContent = lab;
        if (i < n - 1) {
          svg("line", {
            x1: x + bw + 5, y1: NY + NH / 2, x2: x + bw + gap - 7, y2: NY + NH / 2,
            stroke: "rgba(234,246,255,0.35)", "stroke-width": "1.1",
            "marker-end": "url(#arr-c)", "vector-effect": "non-scaling-stroke",
          }, S);
        }
        g.addEventListener("click", () => NS.director.scrollToScene(id));
      });

      /* loop-back: SAMPLE -> TOKENIZE (the autoregressive return path) */
      const x9 = nodeX(8) + bw / 2, x2 = nodeX(1) + bw / 2;
      const apexY = 44;
      svg("path", {
        d: `M ${x9} ${NY - 4} C ${x9} ${apexY}, ${x2} ${apexY}, ${x2} ${NY - 8}`,
        stroke: "var(--amber)", fill: "none", "stroke-width": "1.2",
        "stroke-dasharray": "5 5", opacity: 0.85, "marker-end": "url(#arr-a)",
        "vector-effect": "non-scaling-stroke",
      }, S);
      /* label chip sitting on the arc, solid backing so dashes never cross it */
      const midX = (x9 + x2) / 2, midY = 52;
      const labG = svg("g", {}, S);
      const labText = svg("text", {
        x: midX, y: midY + 4, "text-anchor": "middle",
        fill: "var(--amber)", "font-size": "11.5",
      }, labG);
      labText.textContent = "⟲  " + i18n.t("ui.recapLoop");
      try {
        const bb = labText.getBBox();
        const bg = svg("rect", {
          x: bb.x - 12, y: bb.y - 7, width: bb.width + 24, height: bb.height + 14,
          fill: "#081d31", stroke: "rgba(255,180,84,0.55)", "stroke-width": "1", rx: 1,
          "vector-effect": "non-scaling-stroke",
        }, labG);
        labG.insertBefore(bg, labText);
      } catch (e) { /* getBBox unavailable in headless tests */ }

      /* --- actions --- */
      const actions = wrap.querySelector(".recap__actions");
      NS.clear(actions);
      const again = el("button", "btn-bp", null, actions);
      again.dataset.i18n = "ui.tryAnother";
      again.addEventListener("click", () => NS.director.scrollTop());
      if (config.author.github) {
        const gh = el("a", "btn-bp", null, actions);
        gh.href = config.author.github;
        gh.target = "_blank";
        gh.rel = "noopener";
        gh.dataset.i18n = "ui.viewSource";
      }

      /* --- footer links --- */
      const links = document.querySelector(".footer__links");
      NS.clear(links);
      const a = config.author;
      const entries = [
        ["blog", a.blog, "BLOG"],
        ["email", a.email ? "mailto:" + a.email : "", a.email],
        ["github", a.github, "GITHUB"],
      ];
      for (const [icon, href, label] of entries) {
        if (!href) continue;
        const link = el("a", null, ICONS[icon] + `<span>${label}</span>`, links);
        link.href = href;
        if (icon !== "email") { link.target = "_blank"; link.rel = "noopener"; }
      }
      const meta = document.querySelector(".footer__meta");
      const tokMeta = (window.LLMBP_DATA.meta.tokenizer || "").toUpperCase();
      meta.innerHTML =
        `LLM BLUEPRINT · ${new Date().getFullYear()}` +
        (a.name ? ` · DRAWN BY ${a.name}` : "") +
        ` · TOKENIZER ${tokMeta}`;

      i18n.apply(document.querySelector("#sc-recap"));
    },
  });
})();
