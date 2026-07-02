/* ============================================================
 * P08 · Output head — the LAST row of the same column plugs
 * into a probability gauge: logits, then softmax.
 * ============================================================ */
(function () {
  "use strict";
  const NS = window.LLMBP;
  const { el, svg, prepDraw } = NS;

  NS.phases.push({
    id: "s08",
    span: 2.4,

    build(tl, ctx, A) {
      const { qChips, chipLayer, svgLayer } = A;
      const { data, i18n } = ctx;
      const n = qChips.length;
      const step = data.steps[0];
      const cands = step.topK;

      /* 1 · the sentence has been read: dim all rows except the last */
      const others = qChips.slice(0, -1);
      const last = qChips[n - 1];
      const lastY = A.MOBILE ? A.H * 0.12 : A.H * 0.2;
      tl.to(others.map((c) => c.el), {
        autoAlpha: 0.16, x: "-=" + A.W * 0.22, duration: 0.9, ease: "power2.inOut",
      }, "focus")
        .to(A.rowLabs.slice(0, -1), { autoAlpha: 0.15, x: "-=" + A.W * 0.22, duration: 0.9 }, "focus")
        .to(last.el, {
          x: A.W / 2 - A.VEC_W / 2, y: lastY, scale: 1.15,
          boxShadow: "0 0 26px -6px rgba(127,219,255,.8)", duration: 1.0, ease: "power2.inOut",
        }, "focus")
        .to(A.rowLabs[n - 1], {
          x: A.W / 2 - A.VEC_W / 2 - (A.MOBILE ? 78 : 104), y: lastY + 8,
          duration: 1.0, ease: "power2.inOut",
        }, "focus");

      /* 2 · gauge panel fades in beneath, wire connects */
      const gauge = el("div", "gauge pipe-gauge", null, chipLayer);
      const head = el("div", "gauge__title", null, gauge);
      const mode = el("span", "label label--cyan", "LOGITS · RAW SCORES", head);
      el("span", "label", i18n.t("ui.gaugeTitle"), head);

      const logits = cands.map((c) => 4 + Math.log(Math.max(c.p, 1e-4)));
      const lmin = Math.min(...logits), lmax = Math.max(...logits);
      const logitW = (v) => 15 + ((v - lmin) / (lmax - lmin || 1)) * 78;

      const rows = cands.map((c, i) => {
        const row = el("div", "gauge__row", null, gauge);
        const tok = el("span", "gauge__tok", c.t.trim() || "␣", row);
        const track = el("div", "gauge__track", null, row);
        const bar = el("div", "gauge__bar", null, track);
        const pct = el("span", "gauge__pct num", logits[i].toFixed(2), row);
        return { row, tok, bar, pct, c, logit: logits[i] };
      });
      const oRow = el("div", "gauge__row dim", null, gauge);
      el("span", "gauge__tok", "…" + i18n.t("ui.others"), oRow);
      const oBar = el("div", "gauge__bar", null, el("div", "gauge__track", null, oRow));
      oBar.style.background = "var(--ink-faint)";
      const oPct = el("span", "gauge__pct num", "", oRow);
      gsap.set(oRow, { autoAlpha: 0 });   /* logits stage: hidden */

      const gW = Math.min(560, A.W * (A.MOBILE ? 0.94 : 0.6));
      const gaugeY = A.MOBILE ? A.H * 0.26 : A.H * 0.38;
      gsap.set(gauge, { x: A.W / 2 - gW / 2, y: gaugeY, width: gW, autoAlpha: 0 });

      const wire = svg("path", {
        d: `M ${A.W / 2} ${lastY + A.CHIP_H + 4} L ${A.W / 2} ${gaugeY - 6}`,
        stroke: "var(--cyan)", "stroke-width": "1.5", fill: "none",
      }, svgLayer);
      prepDraw(wire);
      rows.forEach((r) => gsap.set(r.bar, { width: "0%" }));
      gsap.set(oBar, { width: "0%" });

      tl.to(wire, { strokeDashoffset: 0, duration: 0.5, ease: "power1.in" })
        .to(gauge, { autoAlpha: 1, duration: 0.6 })
        .to(rows.map((r) => r.bar), {
          width: (i) => logitW(rows[i].logit) + "%",
          duration: 0.9, stagger: 0.1, ease: "power2.out",
        }, "+=0.1");

      /* 3 · softmax */
      const pcts = rows.map((r) => ({ v: r.logit }));
      tl.add("softmax", "+=0.5");
      tl.to(mode, { autoAlpha: 0, duration: 0.2 }, "softmax-=0.2")
        .set(mode, { textContent: "SOFTMAX · PROBABILITIES" }, "softmax")
        .to(mode, { autoAlpha: 1, duration: 0.25 }, "softmax");
      rows.forEach((r, i) => {
        tl.to(r.bar, { width: (r.c.p * 100).toFixed(1) + "%", duration: 0.9, ease: "power2.inOut" }, "softmax");
        tl.to(pcts[i], {
          v: r.c.p * 100, duration: 0.9, ease: "power2.inOut",
          onUpdate: () => { r.pct.textContent = pcts[i].v.toFixed(1) + "%"; },
        }, "softmax");
      });
      tl.to(oRow, { autoAlpha: 0.55, duration: 0.4 }, "softmax")
        .to(oBar, { width: (step.others * 100).toFixed(1) + "%", duration: 0.9 }, "softmax")
        .set(oPct, { textContent: (step.others * 100).toFixed(1) + "%" }, "softmax+=0.45");

      /* 4 · winner */
      const stamp = el("div", "stamp pipe-anno", "NEXT TOKEN", chipLayer);
      gsap.set(stamp, {
        x: A.MOBILE ? A.W / 2 - 70 : A.W / 2 + gW / 2 + 18,
        y: A.MOBILE ? gaugeY + 300 : A.H * 0.40,
        autoAlpha: 0, scale: 1.6, rotate: -22,
      });
      tl.to(rows[0].bar, { backgroundColor: "#ffb454", opacity: 0.95, duration: 0.35 }, "+=0.2")
        .to(rows[0].tok, { color: "#ffb454", duration: 0.35 }, "<")
        .to(stamp, { autoAlpha: 1, scale: 1, rotate: -8, duration: 0.45, ease: "back.out(2)" })
        .to({}, { duration: 0.6 });

      A.gauge = { root: gauge, rows, oBar, oPct, mode, wire, stamp, gW };
    },
  });
})();
