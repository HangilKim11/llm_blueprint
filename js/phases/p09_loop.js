/* ============================================================
 * P09 · Autoregressive loop — the sampled token flies back and
 * is appended to the SAME strip; the pipeline strobes again for
 * every new token, then fast-forwards to the full answer.
 * ============================================================ */
(function () {
  "use strict";
  const NS = window.LLMBP;
  const { el, qBezier } = NS;

  const FULL_STEPS = 3;
  const SMALL = 13 / 17;      /* font shrink ratio for the working strip */
  const SLACK = 14;           /* width slack = visual padding inside the box */

  NS.phases.push({
    id: "s09",
    span: 3.6,

    build(tl, ctx, A) {
      const { qChips, aChips, chipLayer } = A;
      const { data, i18n } = ctx;

      /* base chip font differs on mobile (14px) — derive the real ratio */
      const baseFs = parseFloat(getComputedStyle(qChips[0].el).fontSize) || 17;
      const ratio = Math.min(SMALL * (17 / baseFs), 1);
      const shrunk = (c) => Math.round(c.w * ratio + SLACK);
      const qW = qChips.map(shrunk);
      const aW = aChips.map(shrunk);
      const combo = A.layoutStrip([...qW, ...aW], {
        cy: A.MOBILE ? A.H * 0.24 : A.H * 0.24,
        gap: A.MOBILE ? 4 : 6,
        maxW: A.W * (A.MOBILE ? 0.94 : 0.82),
        lineH: A.MOBILE ? 38 : 46,
      });
      const qPos = combo.pos.slice(0, qW.length);
      const aPos = combo.pos.slice(qW.length);

      /* pre-place answer chips at their future slots (invisible) */
      aChips.forEach((c, i) => {
        gsap.set(c.el, {
          x: aPos[i].x, y: aPos[i].y, width: aW[i],
          fontSize: 13, autoAlpha: 0,
        });
        gsap.set(c.vec, { autoAlpha: 0 });
        gsap.set(c.idTag, { autoAlpha: 0 });
      });

      /* ---------- 1 · reset the stage: gauge to mini, strip to top ---------- */
      const G = A.gauge;
      tl.to([G.stamp, G.wire], { autoAlpha: 0, duration: 0.3 })
        .to(A.rowLabs, { autoAlpha: 0, duration: 0.3 }, "<");

      /* q chips flip back to words and fly to the top strip */
      qChips.forEach((c, i) => {
        const at = 0.35 + i * 0.05;
        tl.to(c.el, { rotateY: 90, duration: 0.25, ease: "power2.in" }, at)
          .set(c.vec, { autoAlpha: 0 }, at + 0.25)
          .set(c.text, { autoAlpha: 1 }, at + 0.25)
          .to(c.el, {
            rotateY: 0, x: qPos[i].x, y: qPos[i].y,
            width: qW[i], fontSize: 13, scale: 1, autoAlpha: 1,
            boxShadow: "0 0 0 rgba(0,0,0,0)",
            duration: 0.9, ease: "power2.inOut",
          }, at + 0.26);
      });

      const gScale = A.MOBILE ? 0.78 : 0.78;
      const gMini = A.MOBILE
        ? { x: (A.W - G.gW * gScale) / 2, y: A.H * 0.42 }
        : { x: A.W - G.gW * 0.78 - 24, y: A.H * 0.52 };
      tl.to(G.root, {
        x: gMini.x, y: gMini.y, scale: gScale, transformOrigin: "top left",
        duration: 1.0, ease: "power2.inOut",
      }, 0.6);

      /* pipeline mini-map (desktop only — no room on phones) */
      let map = null, nodes = [];
      if (!A.MOBILE) {
        map = el("div", "loop-map pipe-anno", null, chipLayer);
        nodes = ["TOKENIZE", "EMBED", "ATTENTION", "FFN", "SOFTMAX"].map((t) => {
          const d = el("div", "loop-map__node", null, map);
          el("i", null, null, d);
          d.appendChild(document.createTextNode(t));
          return d;
        });
        gsap.set(map, { x: 24, y: A.H * 0.52, autoAlpha: 0 });
        tl.to(map, { autoAlpha: 1, duration: 0.4 }, 1.2);
      }

      const flyer = el("div", "loop-flyer", null, chipLayer);
      const prog = el("div", "loop-progress pipe-anno", null, chipLayer);
      const pNum = el("b", null, "", prog);
      el("span", "label", " " + i18n.t("ui.loopCount"), prog);
      gsap.set(prog, {
        x: A.MOBILE ? 16 : 24,
        y: A.MOBILE ? A.H * 0.42 - 34 : A.H * 0.42,
        autoAlpha: 0,
      });

      const lightPass = (at, speed) => {
        nodes.forEach((nd, k) => {
          const dot = nd.querySelector("i");
          tl.to(nd, { color: "#7fdbff", duration: 0.08 }, at + k * speed)
            .to(dot, { borderColor: "#7fdbff", backgroundColor: "#7fdbff", duration: 0.08 }, "<")
            .to(nd, { color: "rgba(234,246,255,0.32)", duration: 0.14 }, at + k * speed + 0.2)
            .to(dot, { borderColor: "rgba(234,246,255,0.32)", backgroundColor: "rgba(0,0,0,0)", duration: 0.14 }, "<");
        });
      };

      /* retarget the existing gauge rows for step s */
      const setStep = (at, s) => {
        const cands = data.steps[s].topK;
        G.rows.forEach((r, i) => {
          const c = cands[i] || { t: "", p: 0 };
          tl.set(r.tok, { textContent: c.t.trim() || "␣" }, at);
          tl.to(r.bar, { width: (c.p * 100).toFixed(1) + "%", duration: 0.45, ease: "power2.out" }, at + 0.05);
          tl.set(r.pct, { textContent: (c.p * 100).toFixed(1) + "%" }, at + 0.3);
        });
        tl.to(G.oBar, { width: (data.steps[s].others * 100).toFixed(1) + "%", duration: 0.45 }, at + 0.05);
      };

      /* ---------- 2 · full cycles ---------- */
      let t = 1.7;
      const gaugeAnchor = { x: gMini.x + G.gW * 0.35, y: gMini.y + 40 };
      for (let s = 0; s < Math.min(FULL_STEPS, aChips.length); s++) {
        lightPass(t, 0.13);
        setStep(t + 0.35, s);

        /* flight from the gauge to the next empty slot */
        const target = { x: aPos[s].x + aW[s] / 2, y: aPos[s].y + A.CHIP_H / 2 };
        const P0 = gaugeAnchor;
        const P1 = { x: (P0.x + target.x) / 2, y: Math.min(P0.y, target.y) - 120 };
        const drv = { k: 0 };
        tl.set(flyer, { textContent: data.answerTokens[s].t.trim() || "␣" }, t + 1.0)
          .to(flyer, { autoAlpha: 1, duration: 0.1 }, t + 1.0)
          .to(drv, {
            k: 1, duration: 0.65, ease: "power1.inOut",
            onUpdate: () => {
              const p = qBezier(P0, P1, target, drv.k);
              gsap.set(flyer, { x: p.x - 20, y: p.y - 14 });
            },
          }, t + 1.05)
          .to(flyer, { autoAlpha: 0, duration: 0.12 }, t + 1.6)
          .fromTo(aChips[s].el, { autoAlpha: 0, scale: 0.5 },
            { autoAlpha: 1, scale: 1, duration: 0.3, ease: "back.out(2)" }, t + 1.62);
        t += 2.1;
      }

      /* ---------- 3 · fast-forward the rest ---------- */
      tl.to(prog, { autoAlpha: 1, duration: 0.3 }, t);
      const rest = aChips.slice(FULL_STEPS);
      const ffDur = Math.max(1.4, rest.length * 0.06);
      rest.forEach((c, i) => {
        tl.to(c.el, { autoAlpha: 1, duration: 0.1 },
          t + 0.3 + (i / Math.max(rest.length, 1)) * ffDur);
      });
      const cnt = { n: Math.min(FULL_STEPS, aChips.length) };
      tl.to(cnt, {
        n: aChips.length, duration: ffDur, ease: "none", snap: { n: 1 },
        onUpdate: () => { pNum.textContent = `TOKEN ${cnt.n} / ${aChips.length}`; },
      }, t + 0.3);
      for (let r = 0; r < 4; r++) lightPass(t + 0.35 + r * 0.45, 0.06);

      tl.to({}, { duration: 0.7 });

      A.tmpLoop = { map, prog, flyer };
      A.comboPos = { qPos, aPos, qW, aW };
    },
  });
})();
