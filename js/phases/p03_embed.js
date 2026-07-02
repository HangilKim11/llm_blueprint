/* ============================================================
 * P03 · Embedding — every chip flips over: its back face is a
 * number array. The chips then stack into a matrix column.
 * ============================================================ */
(function () {
  "use strict";
  const NS = window.LLMBP;
  const { el, svg, prepDraw } = NS;
  const DIMS = 16;

  NS.phases.push({
    id: "s03",
    span: 2.6,

    build(tl, ctx, A) {
      const { qChips, chipLayer } = A;
      const { i18n } = ctx;
      const n = qChips.length;

      /* clean up tokenize leftovers */
      const T = A.tmpTok;
      tl.to([T.badge, T.note, T.compare].filter(Boolean).concat(qChips.map((c) => c.idTag)),
        { autoAlpha: 0, duration: 0.4 });

      /* 1 · flip: text face -> vector face (width unifies to VEC_W) */
      qChips.forEach((c, i) => {
        const at = 0.5 + i * 0.10;
        tl.to(c.el, { rotateY: 90, duration: 0.4, ease: "power2.in" }, at)
          .set(c.text, { autoAlpha: 0 }, at + 0.4)
          .set(c.vec, { autoAlpha: 1 }, at + 0.4)
          .to(c.el, { width: A.VEC_W, duration: 0.01 }, at + 0.4)
          .to(c.el, { rotateY: 0, duration: 0.4, ease: "power2.out" }, at + 0.41);
      });

      /* 2 · gather into a column (matrix) with word labels */
      const col = A.layoutColumn(n, { gapY: A.MOBILE ? 6 : 8 });
      A.rowLabs = qChips.map((c, i) => {
        const lab = el("span", "row-lab", c.tk.t, chipLayer);
        gsap.set(lab, { x: col.pos[i].x - 104, y: col.pos[i].y + 8, autoAlpha: 0 });
        return lab;
      });
      qChips.forEach((c, i) => {
        tl.to(c.el, {
          x: col.pos[i].x, y: col.pos[i].y,
          duration: 1.1, ease: "power2.inOut",
        }, "gather");
      });
      tl.to(A.rowLabs, { autoAlpha: 1, duration: 0.5, stagger: 0.05 }, "gather+=0.7");

      const mLab = el("div", "label label--cyan pipe-anno", `${n} × 4096 … ` + i18n.t("ui.matrixLab"), chipLayer);
      gsap.set(mLab, { x: A.W / 2 - 140, y: col.pos[0].y - 56, autoAlpha: 0 });
      tl.to(mLab, { autoAlpha: 1, duration: 0.5 }, "gather+=0.9");

      /* 3 · toy semantic space cameo (transient) */
      const sem = el("div", "sem-space", null, chipLayer);
      el("div", "label label--cyan", i18n.t("ui.semTitle"), sem).style.marginBottom = "8px";
      const S = svg("svg", { viewBox: "0 0 300 260", style: "width:100%;border:1px solid var(--line-faint);" }, sem);
      svg("path", { d: "M 30 230 L 280 230 M 30 230 L 30 20", stroke: "var(--line-soft)", "stroke-width": "1", fill: "none" }, S);
      const words = i18n.t("ui.semWords").split(",");
      const coords = [[95, 95], [130, 120], [80, 140], [240, 200]];
      const dots = coords.map(([x, y], k) => {
        const g = svg("g", { opacity: 0 }, S);
        svg("circle", { cx: x, cy: y, r: 4, fill: k < 3 ? "var(--cyan)" : "var(--amber)" }, g);
        const t = svg("text", { x: x + 9, y: y + 4, fill: "var(--ink-dim)", "font-size": "12" }, g);
        t.textContent = words[k] || "";
        return g;
      });
      const ring = svg("ellipse", {
        cx: 102, cy: 118, rx: 58, ry: 52, fill: "none",
        stroke: "var(--cyan)", "stroke-dasharray": "4 5", opacity: 0.7,
      }, S);
      el("div", "label sem-note", i18n.t("ui.semNote"), sem);
      gsap.set(sem, { x: A.W - 372, y: A.H / 2 - 130, autoAlpha: 0 });
      prepDraw(ring);

      tl.to(sem, { autoAlpha: 1, duration: 0.6 }, "gather+=1.0")
        .to(dots, { opacity: 1, duration: 0.35, stagger: 0.1 })
        .to(ring, { strokeDashoffset: 0, duration: 0.9, ease: "power1.inOut" })
        .to({}, { duration: 0.6 });

      A.tmpEmbed = { sem, mLab };
      A.col = col;
    },
  });
})();
