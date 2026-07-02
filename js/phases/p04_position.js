/* ============================================================
 * P04 · Positional encoding — position stamps + a wave sweeps
 * down the SAME column, leaving a phase pattern on each row.
 * ============================================================ */
(function () {
  "use strict";
  const NS = window.LLMBP;
  const { el, svg, prepDraw } = NS;

  NS.phases.push({
    id: "s04",
    span: 1.6,

    build(tl, ctx, A) {
      const { qChips, chipLayer } = A;
      const col = A.col;
      const n = qChips.length;

      /* clean embed cameo */
      tl.to([A.tmpEmbed.sem, A.tmpEmbed.mLab], { autoAlpha: 0, duration: 0.4 });

      /* position stamps + per-row stripes (persist dimly onwards) */
      const stamps = [], overlays = [];
      qChips.forEach((c, i) => {
        const st = el("span", "pos-tag num pipe-anno", "#" + i, chipLayer);
        gsap.set(st, { x: col.pos[i].x + A.VEC_W + 12, y: col.pos[i].y + 9, autoAlpha: 0 });
        stamps.push(st);
        const ov = el("div", "pos-stripes", null, c.el);
        ov.style.backgroundPosition = `${(i * 6) % 17}px 0`;
        gsap.set(ov, { autoAlpha: 0 });
        overlays.push(ov);
      });

      /* vertical wave passing down beside the column (left of labels) */
      const x = col.pos[0].x - 150;
      const y0 = col.pos[0].y - 10;
      const y1 = col.pos[n - 1].y + A.CHIP_H + 10;
      let d = `M ${x} ${y0}`;
      for (let y = y0; y <= y1; y += 4) d += ` L ${x + Math.sin((y - y0) / 14) * 10} ${y}`;
      const wave = svg("path", {
        d, stroke: "var(--amber)", "stroke-width": "1.5", fill: "none",
      }, A.svgLayer);
      prepDraw(wave);

      const lab = el("div", "label label--amber pipe-anno", "+ POSITIONAL ENCODING", chipLayer);
      gsap.set(lab, { x, y: y0 - 34, autoAlpha: 0 });

      tl.to(lab, { autoAlpha: 1, duration: 0.4 })
        .to(wave, { strokeDashoffset: 0, duration: 1.3, ease: "power1.inOut" }, "<")
        .to(stamps, { autoAlpha: 1, x: "-=6", duration: 0.4, stagger: 0.07, ease: "back.out(2)" }, "<+=0.3")
        .to(overlays, { autoAlpha: 0.55, duration: 0.7, stagger: 0.05 }, "<+=0.2")
        .to(overlays, { autoAlpha: 0.22, duration: 0.5 })
        .to(wave, { opacity: 0, duration: 0.4 }, "<")
        .to({}, { duration: 0.5 });

      A.tmpPos = { stamps, lab };
    },
  });
})();
