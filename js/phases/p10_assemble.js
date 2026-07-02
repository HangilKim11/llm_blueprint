/* ============================================================
 * P10 · Assemble — EOS stops the loop; the answer chips close
 * ranks and fuse into a chat bubble. Drawing approved.
 * ============================================================ */
(function () {
  "use strict";
  const NS = window.LLMBP;
  const { el } = NS;

  NS.phases.push({
    id: "s10",
    span: 2.2,

    build(tl, ctx, A) {
      const { qChips, aChips, chipLayer } = A;
      const { data } = ctx;
      const L = A.tmpLoop;
      const G = A.gauge;

      /* 1 · EOS token pops at the end of the strip, machinery stops */
      const lastPos = A.comboPos.aPos[aChips.length - 1];
      const eos = el("div", "chip eos-chip", "<|end|>", chipLayer);
      gsap.set(eos, {
        x: lastPos.x + A.comboPos.aW[aChips.length - 1] + 8,
        y: lastPos.y, fontSize: 12, autoAlpha: 0, scale: 0.5,
      });
      tl.to(eos, { autoAlpha: 1, scale: 1, duration: 0.45, ease: "back.out(2)" })
        .to([L.map, L.prog, G.root].filter(Boolean), { autoAlpha: 0, duration: 0.5 }, "<+=0.2");

      const stamp = el("div", "stamp pipe-anno", "APPROVED · EOS", chipLayer);
      gsap.set(stamp, {
        x: A.MOBILE ? A.W / 2 - 80 : A.W / 2 + 140,
        y: A.MOBILE ? A.H * 0.58 : A.H * 0.62,
        autoAlpha: 0, scale: 1.8, rotate: -24,
      });
      tl.to(stamp, { autoAlpha: 1, scale: 1, rotate: -8, duration: 0.5, ease: "back.out(2)" });

      /* 2 · question chips condense into the question bubble */
      const qBubble = el("div", "chat-final__q pipe-bubble", data.question, chipLayer);
      const qbW = Math.min(A.W * (A.MOBILE ? 0.8 : 0.5), 480);
      const qAnchor = A.MOBILE ? A.W - 16 : A.W / 2 + 340;
      const qY = A.MOBILE ? A.H * 0.24 : A.H * 0.30;
      /* right-aligned to the answer column, like a chat UI */
      gsap.set(qBubble, {
        x: qAnchor, xPercent: -100, y: qY,
        maxWidth: qbW, autoAlpha: 0,
      });
      qChips.forEach((c, i) => {
        tl.to(c.el, {
          x: qAnchor - 120, y: qY + 8,
          autoAlpha: 0, scale: 0.5, duration: 0.8, ease: "power2.in",
        }, "fuseQ+=" + i * 0.02);
      });
      tl.to(qBubble, { autoAlpha: 1, duration: 0.5 }, "fuseQ+=0.7");

      /* 3 · answer chips close ranks in the centre */
      const packW = aChips.map((c) => A.comboPos.aW[aChips.indexOf(c)]);
      const packMaxW = A.MOBILE ? A.W * 0.86 : Math.min(A.W * 0.62, 620);
      const packed = A.layoutStrip(packW, {
        cy: A.MOBILE ? A.H * 0.46 : A.H * 0.52, gap: 0, maxW: packMaxW, lineH: 34,
      });
      tl.to(eos, { autoAlpha: 0, scale: 0.4, duration: 0.4 }, "pack");
      aChips.forEach((c, i) => {
        tl.to(c.el, {
          x: packed.pos[i].x, y: packed.pos[i].y,
          borderColor: "rgba(0,0,0,0)", backgroundColor: "rgba(0,0,0,0)",
          color: "#eaf6ff", duration: 1.1, ease: "power2.inOut",
        }, "pack+=" + (i * 0.008));
      });
      tl.to(stamp, { autoAlpha: 0.3, duration: 0.6 }, "pack+=0.5");

      /* 4 · crossfade into the real bubble */
      const aBubble = el("div", "chat-final__a pipe-bubble", data.answer, chipLayer);
      const abW = packMaxW + 44;
      gsap.set(aBubble, {
        x: A.W / 2 - abW / 2,
        y: (A.MOBILE ? A.H * 0.46 : A.H * 0.52) - packed.h / 2 - 16,
        width: abW, autoAlpha: 0,
      });
      tl.to(aChips.map((c) => c.el), { autoAlpha: 0, duration: 0.5 }, "+=0.3")
        .to(aBubble, { autoAlpha: 1, duration: 0.6 }, "<+=0.15")
        .to({}, { duration: 1.0 });
    },
  });
})();
