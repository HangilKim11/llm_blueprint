/* ============================================================
 * P07 · Layer stack — the sheet tilts into 3-D; ghost layer
 * plates rush past while the SAME column rides in the middle.
 * ============================================================ */
(function () {
  "use strict";
  const NS = window.LLMBP;
  const { el } = NS;

  const PLATES = 6;
  const GAP = 190;

  NS.phases.push({
    id: "s07",
    span: 2.8,

    build(tl, ctx, A) {
      const { world, chipLayer } = A;
      const totalLayers = (ctx.config.model && ctx.config.model.layers) || 28;

      if (A.tmpFfn.note) tl.to(A.tmpFfn.note, { autoAlpha: 0, duration: 0.35 });

      /* ghost plates around the column */
      const size = Math.min(A.W, A.H) * 0.62;
      const plates = [];
      for (let i = 0; i < PLATES; i++) {
        const p = el("div", "plate", null, world);
        el("span", "plate__lab", "TRANSFORMER BLOCK", p);
        const units = el("div", "plate__units", null, p);
        el("div", null, "SELF-ATTENTION", units);
        el("div", null, "FFN", units);
        gsap.set(p, {
          width: size, height: size,
          left: (A.W - size) / 2, top: (A.H - size) / 2,
          z: -i * GAP - 60, autoAlpha: 0,
        });
        plates.push(p);
      }

      const counter = el("div", "stack-counter pipe-anno", null, A.stage);
      const cNum = el("b", null, "LAYER 01", counter);
      el("span", "label", `/ ${String(totalLayers).padStart(2, "0")} ` + ctx.i18n.t("ui.stackLab"), counter);
      gsap.set(counter, { autoAlpha: 0 });

      /* 1 · tilt into isometric view */
      tl.to(world, {
        rotateX: 54, rotateZ: -38, scale: 0.9, duration: 1.4, ease: "power2.inOut",
      }, "+=0.1")
        .to(plates, { autoAlpha: 1, duration: 0.5, stagger: 0.06 }, "<+=0.5")
        .to(counter, { autoAlpha: 1, duration: 0.4 }, "<")
        .to(chipLayer, { scale: 0.8, transformOrigin: "50% 50%", duration: 1.0 }, "<");

      /* 2 · descend through the layers */
      const drv = { z: 0 };
      const travel = GAP * (PLATES - 1.2);
      tl.to(drv, {
        z: travel, duration: 4.2, ease: "none",
        onUpdate: () => {
          plates.forEach((p, i) => {
            const z = -i * GAP - 60 + drv.z;
            gsap.set(p, {
              z,
              autoAlpha: z > 30 ? Math.max(0, 1 - (z - 30) / 120)
                : Math.min(1, 1 + z / (GAP * PLATES)),
            });
          });
          const k = Math.min(totalLayers, 1 + Math.floor((drv.z / travel) * (totalLayers - 1)));
          cNum.textContent = "LAYER " + String(k).padStart(2, "0");
          const t = drv.z / travel;
          A.qChips.forEach((c) => {
            c.vec.style.filter = `hue-rotate(${22 - t * 52}deg) saturate(${1.2 + t * 0.3})`;
          });
        },
      }, ">-0.2");

      /* 3 · level out — flat drawing again */
      tl.to(plates, { autoAlpha: 0, duration: 0.5 })
        .to(counter, { autoAlpha: 0, duration: 0.4 }, "<")
        .to(world, { rotateX: 0, rotateZ: 0, scale: 1, duration: 1.2, ease: "power2.inOut" }, "<")
        .to(chipLayer, { scale: 1, duration: 1.2, ease: "power2.inOut" }, "<")
        .to({}, { duration: 0.4 });
    },
  });
})();
