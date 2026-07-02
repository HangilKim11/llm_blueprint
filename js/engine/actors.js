/* ============================================================
 * LLM Blueprint — persistent actors
 * One set of token chips lives through the WHOLE pipeline and
 * only morphs (position / face / styling) between phases.
 * ============================================================ */
(function () {
  "use strict";
  const NS = (window.LLMBP = window.LLMBP || {});
  const { el, svg } = NS;

  const VEC_CELLS = 8;
  const VEC_W = 108;          /* uniform chip width when showing its vector */
  const CHIP_H = 38;          /* fixed chip height (keeps rows tidy) */

  /* Build the persistent cast for one pipeline run. */
  NS.buildActors = function (stage, ctx) {
    const W = stage.clientWidth || window.innerWidth;
    const H = stage.clientHeight || window.innerHeight;
    const MOBILE = W < 700;
    /* on phones the caption card docks at the bottom, so the action
       happens higher up the stage */
    const CY = H * (MOBILE ? 0.38 : 0.5);

    /* world: tiltable 3-D container that holds everything that must
       keep existing across phases */
    const world = el("div", "pipe-world", null, stage);
    const svgLayer = svg("svg", {
      class: "pipe-svg", viewBox: `0 0 ${W} ${H}`,
      width: "100%", height: "100%",
    }, world);
    const chipLayer = el("div", "chip-layer", null, world);

    /* frame that wraps the chips while they read as one solid strip */
    const frame = el("div", "strip-frame", null, chipLayer);

    const mkChip = (tk, extraCls) => {
      const chip = el("div", "chip " + (extraCls || ""), null, chipLayer);
      const text = el("span", "chip__text", null, chip);
      text.textContent = tk.t;
      const vec = el("span", "chip__vec", null, chip);
      vec.appendChild(NS.vecStrip(tk.id, VEC_CELLS, 10, 16));
      const id = el("span", "tok__id num", "#" + tk.id, chip);
      return { el: chip, text, vec, idTag: id, tk, w: 0 };
    };

    const qChips = ctx.data.tokens.map((tk) => mkChip(tk));
    const aChips = ctx.data.answerTokens.map((tk) => {
      const c = mkChip(tk, "chip--ans");
      gsap.set(c.el, { autoAlpha: 0 });
      return c;
    });

    /* measure natural text widths once (chips are in DOM, hidden ok) */
    const measure = () => {
      [...qChips, ...aChips].forEach((c) => {
        c.el.style.width = "auto";
        c.w = Math.ceil(c.el.getBoundingClientRect().width) || 40;
      });
    };
    measure();

    return {
      stage, world, svgLayer, chipLayer, frame,
      qChips, aChips, W, H, VEC_W, CHIP_H,
      MOBILE, CY,

      /* ---------- layout calculators (px, chip top-left coords) ---------- */

      /* single-line / wrapping strip, centred on (cx, cy) */
      layoutStrip(widths, { cx = W / 2, cy = CY, gap = 0, maxW = W * 0.86, lineH = 54 } = {}) {
        const lines = [[]];
        let lw = 0;
        widths.forEach((w, i) => {
          if (lw + w + gap > maxW && lines[lines.length - 1].length) {
            lines.push([]); lw = 0;
          }
          lines[lines.length - 1].push(i);
          lw += w + gap;
        });
        const pos = new Array(widths.length);
        const totalH = lines.length * lineH;
        lines.forEach((line, li) => {
          const lineW = line.reduce((s, i) => s + widths[i], 0) + gap * (line.length - 1);
          let x = cx - lineW / 2;
          for (const i of line) {
            pos[i] = { x, y: cy - totalH / 2 + li * lineH };
            x += widths[i] + gap;
          }
        });
        return { pos, w: Math.min(maxW, widths.reduce((s, w) => s + w + gap, 0)), h: totalH };
      },

      /* vertical column of uniform rows, centred on cx */
      layoutColumn(count, { cx = W / 2, cy = CY, gapY = 10, rowH = CHIP_H } = {}) {
        const totalH = count * rowH + (count - 1) * gapY;
        const pos = [];
        for (let i = 0; i < count; i++) {
          pos.push({ x: cx - VEC_W / 2, y: cy - totalH / 2 + i * (rowH + gapY) });
        }
        return { pos, totalH, rowH, gapY };
      },

      /* tween chips to a layout in one call */
      toLayout(tl, chips, pos, vars, at) {
        chips.forEach((c, i) => {
          tl.to(c.el, { x: pos[i].x, y: pos[i].y, ...(vars || {}) }, at);
        });
      },

      setLayout(chips, pos, vars) {
        chips.forEach((c, i) => {
          gsap.set(c.el, { x: pos[i].x, y: pos[i].y, ...(vars || {}) });
        });
      },
    };
  };
})();
