/* ============================================================
 * P02 · Tokenize — cut lines score the SAME strip, the pieces
 * drift apart, and every piece gets its part number.
 * ============================================================ */
(function () {
  "use strict";
  const NS = window.LLMBP;
  const { el } = NS;

  NS.phases.push({
    id: "s02",
    span: 2.4,

    build(tl, ctx, A) {
      const { qChips, frame, chipLayer } = A;
      const { data, i18n } = ctx;
      const widths = qChips.map((c) => c.w);
      const padded = widths.map((w) => w + 20);      /* room for the box */
      const flush = A.layoutStrip(widths, { gap: 0 });
      /* extra line height on mobile so the id tags never touch the next row */
      const apart = A.layoutStrip(padded, { gap: 16, lineH: A.MOBILE ? 72 : 54 });

      /* cut lines at the flush boundaries */
      const cuts = [];
      for (let i = 0; i < qChips.length - 1; i++) {
        const c = el("i", "pipe-cut", "✂", chipLayer);
        gsap.set(c, {
          x: flush.pos[i].x + widths[i] - 1,
          y: flush.pos[i].y - 16,
          autoAlpha: 0, scaleY: 0.2, transformOrigin: "top",
        });
        cuts.push(c);
      }

      /* transient: count badge / question note / language comparison */
      const badge = el("div", "tok-count-badge pipe-anno", null, chipLayer);
      const bNum = el("b", "num", "0", badge);
      el("span", "label", i18n.t("ui.tokens"), badge);
      gsap.set(badge, { x: A.W / 2 - 60, y: A.H * 0.16, autoAlpha: 0 });

      let note = null;
      if (data.notes && !(A.MOBILE && data.group === "sky")) {
        note = el("div", "pipe-note", i18n.t(data.notes), chipLayer);
        if (A.MOBILE) {
          note.style.width = A.W - 32 + "px";
          gsap.set(note, { x: 16, y: A.CY + 140, autoAlpha: 0 });
        } else {
          gsap.set(note, { x: A.W / 2 - 260, y: A.H * 0.74, autoAlpha: 0 });
        }
      }

      let compare = null;
      if (data.group === "sky") {
        compare = el("div", "lang-compare", null, chipLayer);
        el("h4", null, i18n.t("ui.compareTitle"), compare);
        for (const q of ctx.allData.filter((x) => x.group === "sky")) {
          const row = el("div", "row", null, compare);
          const lab = el("div", "label", null, row);
          el("span", null, q.lang.toUpperCase(), lab);
          el("b", "num", q.tokens.length + " tok", lab);
          const cells = el("div", "cells", null, row);
          q.tokens.forEach((tk) => {
            const cc = el("i", null, null, cells);
            cc.style.width = Math.max(10, tk.t.trim().length * 9) + "px";
            if (q.id === data.id) cc.style.background = "var(--amber)";
          });
        }
        el("div", "label", i18n.t("ui.compareNote"), compare).style.cssText =
          "text-transform:none;letter-spacing:.02em;margin-top:4px;color:var(--ink-faint);";
        if (A.MOBILE) {
          compare.style.width = Math.min(320, A.W - 24) + "px";
          gsap.set(compare, { x: (A.W - Math.min(320, A.W - 24)) / 2, y: A.CY + 130, autoAlpha: 0 });
        } else {
          gsap.set(compare, { x: A.W - 360, y: A.H / 2 - 120, autoAlpha: 0 });
        }
      }

      /* ---------- choreography ---------- */
      const S = A.tmpSend;

      /* clear the send annotations, draw the cut lines */
      tl.to([S.anno, S.dim, S.clampL, S.clampR], { autoAlpha: 0, duration: 0.4 })
        .to(cuts, {
          autoAlpha: 1, scaleY: 1, duration: 0.5,
          stagger: { each: 0.07 }, ease: "power1.out",
        }, "<+=0.2");

      /* the block splits: chips drift to the spaced layout */
      qChips.forEach((c, i) => {
        tl.to(c.el, {
          x: apart.pos[i].x, y: apart.pos[i].y, width: padded[i],
          borderColor: "rgba(234,246,255,0.30)",
          backgroundColor: "rgba(127,219,255,0.05)",
          duration: 1.2, ease: "power2.inOut",
        }, "split");
      });
      tl.to(frame, { autoAlpha: 0, duration: 0.6 }, "split")
        .to(cuts, { autoAlpha: 0, duration: 0.4 }, "split+=0.55");

      /* part numbers stamp on + counter */
      tl.to(qChips.map((c) => c.idTag), {
        autoAlpha: 1, y: 2, duration: 0.45,
        stagger: 0.06, ease: "back.out(1.8)",
      }, ">-0.1");
      const cnt = { n: 0 };
      tl.to(badge, { autoAlpha: 1, duration: 0.4 }, "<")
        .to(cnt, {
          n: data.tokens.length, duration: 0.8, ease: "none", snap: { n: 1 },
          onUpdate: () => { bNum.textContent = cnt.n; },
        }, "<");

      if (note) tl.to(note, { autoAlpha: 1, duration: 0.5 }, "+=0.2");
      if (compare) {
        tl.to(compare, {
          autoAlpha: 1, x: A.MOBILE ? "+=0" : "-=20", duration: 0.7,
        }, note ? "<" : "+=0.2");
      }
      tl.to({}, { duration: 0.7 });

      /* keep for the next phase to clean up */
      A.tmpTok = { badge, note, compare };
      A.colState = { apart, widths };
    },
  });
})();
