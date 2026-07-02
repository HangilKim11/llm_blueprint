/* ============================================================
 * P06 · Feed-forward — one exemplar row is pulled aside and
 * literally expanded ×4, filtered by the activation, folded
 * back, then the same treatment ripples through every row.
 * ============================================================ */
(function () {
  "use strict";
  const NS = window.LLMBP;
  const { el, svg, prepDraw } = NS;

  const EXP_CELLS = 32;      /* 8 dims -> "×4" expansion */

  NS.phases.push({
    id: "s06",
    span: 2.4,

    build(tl, ctx, A) {
      const { qChips, chipLayer, svgLayer } = A;
      const { i18n } = ctx;
      const col = A.col;
      const n = qChips.length;
      const SHIFT = A.MOBILE ? 0 : Math.min(190, A.W * 0.13);

      /* attention wires dissolve — the column remains */
      const AT = A.tmpAttn;
      tl.to(AT.arcs, { opacity: 0, duration: 0.5 })
        .to([...AT.flags, AT.legend], { autoAlpha: 0, duration: 0.35 }, "<");

      /* 1 · make room: the whole column slides left */
      const exIdx = Math.min(2, n - 1);
      const ex = qChips[exIdx];
      qChips.forEach((c) => tl.to(c.el, { x: "-=" + SHIFT, duration: 0.8, ease: "power2.inOut" }, "room"));
      A.rowLabs.forEach((l) => tl.to(l, { x: "-=" + SHIFT, duration: 0.8, ease: "power2.inOut" }, "room"));

      /* geometry for the workshop area (desktop: right side / mobile: below) */
      const exX = col.pos[exIdx].x - SHIFT;
      const exY = col.pos[exIdx].y;
      const cellW = A.MOBILE ? 8 : 11;
      const wsW = EXP_CELLS * cellW + 4;
      const wsX = A.MOBILE ? (A.W - wsW) / 2 : A.W / 2 + 30;
      const wsY = A.MOBILE
        ? col.pos[n - 1].y + A.CHIP_H + 44
        : exY + (A.CHIP_H - 20) / 2;

      /* callout from the exemplar row into the workshop */
      const callout = svg("path", {
        d: A.MOBILE
          ? `M ${exX + A.VEC_W / 2} ${exY + A.CHIP_H + 2} V ${wsY - 10}`
          : `M ${exX + A.VEC_W + 6} ${exY + A.CHIP_H / 2} H ${wsX - 14}`,
        stroke: "var(--cyan)", "stroke-width": "1", "stroke-dasharray": "4 5", fill: "none",
      }, svgLayer);
      prepDraw(callout);

      /* expanded strip: 32 cells, born from the exemplar's seed */
      const exp = el("div", "ffn-exp", null, chipLayer);
      const rand = NS.rng("ffnexp:" + ex.tk.id);
      const cells = [];
      for (let i = 0; i < EXP_CELLS; i++) {
        const c = el("i", null, null, exp);
        const v = rand() * 2 - 1;
        c.style.opacity = (0.15 + Math.abs(v) * 0.75).toFixed(2);
        if (v < 0) c.style.background = "var(--violet)";
        cells.push(c);
      }
      gsap.set(exp, {
        x: wsX, y: wsY, width: wsW,
        autoAlpha: 0, scaleX: 0.25, transformOrigin: "left center",
      });

      /* three step labels under the workshop */
      const steps = el("div", "ffn-steps", null, chipLayer);
      if (A.MOBILE) steps.style.cssText += "flex-direction:column;gap:5px;";
      const stepEls = ["ffnStep1", "ffnStep2", "ffnStep3"].map((k) => {
        const s = el("span", null, i18n.t("ui." + k), steps);
        return s;
      });
      gsap.set(steps, { x: wsX, y: wsY + 30, autoAlpha: 0 });

      let note = null;
      if (!A.MOBILE) {
        note = el("div", "pipe-note", i18n.t("ui.ffnNote"), chipLayer);
        gsap.set(note, { x: A.W / 2 - 260, y: A.H * 0.82, autoAlpha: 0 });
      }

      /* 2 · EXPAND — the row unfolds into 4× width */
      tl.to(ex.el, { boxShadow: "0 0 20px -4px rgba(127,219,255,.8)", duration: 0.4 })
        .to(callout, { strokeDashoffset: 0, duration: 0.5, ease: "power1.in" }, "<")
        .to([exp, steps], { autoAlpha: 1, duration: 0.3 })
        .add(() => {}, "+=0.05")
        .to(stepEls[0], { color: "#7fdbff", duration: 0.25 }, "<")
        .to(exp, { scaleX: 1, duration: 1.1, ease: "power2.out" }, "<");

      /* 3 · ACTIVATION — weak signals die, strong ones pass */
      const order = cells.map((c, i) => i).sort(() => rand() - 0.5);
      const dead = order.slice(0, Math.floor(EXP_CELLS * 0.45));
      const alive = order.slice(Math.floor(EXP_CELLS * 0.45));
      tl.to(stepEls[0], { color: "rgba(234,246,255,0.35)", duration: 0.3 }, "+=0.3")
        .to(stepEls[1], { color: "#ffb454", duration: 0.25 }, "<")
        .to(dead.map((i) => cells[i]), {
          opacity: 0.05, backgroundColor: "#39536b", duration: 0.6,
          stagger: { each: 0.02, from: "random" },
        }, "<")
        .to(alive.map((i) => cells[i]), {
          opacity: 1, duration: 0.6, stagger: { each: 0.02, from: "random" },
        }, "<");

      /* 4 · COMPRESS — fold back into the same row, now transformed */
      tl.to(stepEls[1], { color: "rgba(234,246,255,0.35)", duration: 0.3 }, "+=0.35")
        .to(stepEls[2], { color: "#7fdbff", duration: 0.25 }, "<")
        .to(exp, { scaleX: 0.22, x: wsX - 10, autoAlpha: 0, duration: 0.9, ease: "power2.in" }, "<")
        .to(callout, { opacity: 0, duration: 0.4 }, "<+=0.4")
        .to(ex.vec, { filter: "hue-rotate(22deg) saturate(1.2)", duration: 0.4 }, "<")
        .to(ex.el, { scale: 1.12, duration: 0.22, yoyo: true, repeat: 1, ease: "power1.inOut" }, "<");

      /* 5 · ripple through every other row */
      const allLab = el("div", "label label--cyan pipe-anno", i18n.t("ui.ffnAll"), chipLayer);
      gsap.set(allLab, { x: exX, y: col.pos[n - 1].y + A.CHIP_H + 26, autoAlpha: 0 });
      tl.to(allLab, { autoAlpha: 1, duration: 0.3 }, "+=0.2");
      if (note) tl.to(note, { autoAlpha: 1, duration: 0.5 }, "<");
      qChips.forEach((c, i) => {
        if (i === exIdx) return;
        const at = "ripple+=" + (i * 0.08);
        tl.to(c.el, { scaleX: 1.14, duration: 0.14, yoyo: true, repeat: 1, ease: "power1.inOut" }, at)
          .to(c.vec, { filter: "hue-rotate(22deg) saturate(1.2)", duration: 0.3 }, at);
      });

      /* 6 · tidy up: column returns to centre */
      tl.to([steps, allLab], { autoAlpha: 0, duration: 0.35 }, "+=0.4")
        .to(ex.el, { boxShadow: "0 0 0 rgba(0,0,0,0)", duration: 0.4 }, "<");
      qChips.forEach((c) => tl.to(c.el, { x: "+=" + SHIFT, duration: 0.8, ease: "power2.inOut" }, "return"));
      A.rowLabs.forEach((l) => tl.to(l, { x: "+=" + SHIFT, duration: 0.8, ease: "power2.inOut" }, "return"));
      tl.to({}, { duration: 0.4 });

      A.tmpFfn = { note };
    },
  });
})();
