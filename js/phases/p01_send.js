/* ============================================================
 * P01 · Send — the question rises from the chat and solidifies
 * into ONE strip at stage centre. (The chips already exist —
 * they just sit flush so the strip reads as a single block.)
 * ============================================================ */
(function () {
  "use strict";
  const NS = window.LLMBP;
  const { el } = NS;

  NS.phases.push({
    id: "s01",
    span: 1.5,

    build(tl, ctx, A) {
      const { qChips, frame, chipLayer } = A;
      const widths = qChips.map((c) => c.w);

      /* initial: flush strip (single block) at centre */
      const strip = A.layoutStrip(widths, { gap: 0 });
      A.setLayout(qChips, strip.pos);
      qChips.forEach((c) => {
        gsap.set(c.el, { width: c.w });
        gsap.set(c.vec, { autoAlpha: 0 });
        gsap.set(c.idTag, { autoAlpha: 0 });
      });
      /* bounding box works for single- and multi-line (mobile) strips */
      const minX = Math.min(...strip.pos.map((p) => p.x));
      const maxX = Math.max(...strip.pos.map((p, i) => p.x + widths[i]));
      A.stripBBox = {
        x: minX, y: strip.pos[0].y,
        w: maxX - minX, h: strip.h - (54 - A.CHIP_H),
      };

      /* frame around the strip — starts styled like a chat bubble */
      const bb = A.stripBBox;
      gsap.set(frame, {
        x: bb.x - 22, y: bb.y - 13,
        width: bb.w + 44, height: bb.h + 26,
        borderRadius: 18, borderColor: "rgba(127,219,255,0.9)",
        backgroundColor: "rgba(127,219,255,0.10)",
      });

      /* transient annotations */
      const anno = el("div", "label label--cyan pipe-anno", "INPUT · RAW TEXT", chipLayer);
      gsap.set(anno, { x: bb.x - 22, y: bb.y - 52, autoAlpha: 0 });
      const dim = el("div", "label num pipe-anno", `L = ${ctx.data.question.length} CHARS`, chipLayer);
      gsap.set(dim, { x: bb.x + bb.w / 2 - 60, y: bb.y + bb.h + 26, autoAlpha: 0 });
      const clampL = el("div", "pipe-clamp", "▹", chipLayer);
      const clampR = el("div", "pipe-clamp", "◃", chipLayer);
      gsap.set(clampL, { x: bb.x - 52, y: bb.y + 4, autoAlpha: 0 });
      gsap.set(clampR, { x: bb.x + bb.w + 30, y: bb.y + 4, autoAlpha: 0 });
      A.tmpSend = { anno, dim, clampL, clampR };

      /* whole layer floats up from "the chat" */
      gsap.set(chipLayer, { y: A.H * 0.42, autoAlpha: 0, scale: 0.94 });

      tl.to(chipLayer, { autoAlpha: 1, y: A.H * 0.3, duration: 0.7, ease: "power2.out" })
        .to(chipLayer, { y: 0, scale: 1, duration: 1.4, ease: "power2.inOut" })
        /* bubble -> engineering strip */
        .to(frame, {
          borderRadius: 2, borderColor: "rgba(234,246,255,0.30)",
          backgroundColor: "rgba(127,219,255,0.04)", duration: 0.8,
        }, ">-0.3")
        .to([clampL, clampR], { autoAlpha: 1, duration: 0.4 }, "<+=0.3")
        .to([anno, dim], { autoAlpha: 1, duration: 0.5 }, "<")
        .to({}, { duration: 0.5 });
    },
  });
})();
