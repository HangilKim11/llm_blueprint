/* ============================================================
 * P05 · Attention — arcs connect the rows of the SAME column:
 * every token reaches back to earlier tokens (causal).
 * ============================================================ */
(function () {
  "use strict";
  const NS = window.LLMBP;
  const { el, svg, prepDraw } = NS;

  NS.phases.push({
    id: "s05",
    span: 2.8,

    build(tl, ctx, A) {
      const { qChips, chipLayer, svgLayer } = A;
      const { data } = ctx;
      const col = A.col;
      const n = qChips.length;
      const rowY = (i) => col.pos[i].y + A.CHIP_H / 2;
      const xR = col.pos[0].x + A.VEC_W + 4;
      const xL = col.pos[0].x - 4;

      /* keep the pos stamps out of the way */
      tl.to(A.tmpPos.stamps.concat([A.tmpPos.lab]), { autoAlpha: 0, duration: 0.35 });

      const bulgeUnit = Math.min(30, A.W * 0.05);
      const arc = (i, j, side, color, wgt, dash) => {
        const x = side > 0 ? xR : xL;
        const bulge = side * (26 + Math.abs(i - j) * bulgeUnit);
        const p = svg("path", {
          d: `M ${x} ${rowY(j)} C ${x + bulge} ${rowY(j)}, ${x + bulge} ${rowY(i)}, ${x} ${rowY(i)}`,
          stroke: color, fill: "none",
          "stroke-width": (0.6 + wgt * 3.2).toFixed(2),
          opacity: (0.10 + wgt * 0.5).toFixed(2),
          ...(dash ? { "stroke-dasharray": "5 6" } : {}),
        }, svgLayer);
        return p;
      };

      /* head 1 (right side): distance-decay, top-3 previous per token */
      const head1 = [];
      for (let i = 1; i < n; i++) {
        const js = [];
        for (let j = 0; j < i; j++) js.push([j, Math.exp(-0.5 * (i - j))]);
        js.sort((a, b) => b[1] - a[1]);
        js.slice(0, 3).forEach(([j, w]) => head1.push(arc(i, j, 1, "var(--cyan)", w * 0.55)));
      }

      /* curated highlights + note flags */
      const hi = [], flags = [];
      (data.attention.highlights || []).forEach((h) => {
        if (h.from >= n || h.to >= n || h.from === h.to) return;
        hi.push(arc(h.from, h.to, 1, "var(--amber)", h.w));
        const f = el("div", "attn-flag", null, chipLayer);
        f.textContent = `${data.tokens[h.from].t.trim()} → ${data.tokens[h.to].t.trim()}`;
        const bulge = 30 + Math.abs(h.from - h.to) * bulgeUnit;
        gsap.set(f, {
          x: Math.min(xR + bulge + 10, A.W - 90),
          y: (rowY(h.from) + rowY(h.to)) / 2 - 10,
          autoAlpha: 0,
        });
        flags.push(f);
      });

      /* heads 2 & 3 (left side): other perspectives */
      const head2 = [], head3 = [];
      for (let i = 1; i < n; i++) {
        head2.push(arc(i, Math.max(0, i - 2), -1, "var(--violet)", 0.32, true));
        head3.push(arc(i, 0, -1, "rgba(127,219,255,0.75)", 0.2, true));
      }

      const legend = el("div", "head-legend pipe-anno", null, chipLayer);
      [["var(--cyan)", "HEAD 1"], ["var(--violet)", "HEAD 2"], ["rgba(127,219,255,.6)", "HEAD 3"]]
        .forEach(([c, t]) => {
          const s = el("span", null, null, legend);
          el("i", null, null, s).style.background = c;
          s.appendChild(document.createTextNode(t));
        });
      el("span", "label", "… × 32", legend);
      gsap.set(legend, { x: A.W / 2 - 130, y: col.pos[0].y - 58, autoAlpha: 0 });

      /* ---------- choreography ---------- */
      [...head1, ...hi, ...head2, ...head3].forEach(prepDraw);
      gsap.set([...head2, ...head3], { opacity: 0 });

      tl.to(head1, {
        strokeDashoffset: 0, duration: 1.5,
        stagger: { each: 0.05 }, ease: "power1.inOut",
      }, "+=0.1")
        .to(hi, { strokeDashoffset: 0, duration: 1.0, stagger: 0.3, ease: "power1.inOut" }, "+=0.2")
        .to(flags, { autoAlpha: 1, duration: 0.5, stagger: 0.25 }, "<+=0.4")
        .to(legend, { autoAlpha: 1, duration: 0.4 }, "+=0.3")
        .to(head2, { opacity: 1, strokeDashoffset: 0, duration: 0.9, stagger: 0.04 }, "<")
        .to(head3, { opacity: 1, strokeDashoffset: 0, duration: 0.9, stagger: 0.04 }, "<+=0.3")
        .to({}, { duration: 0.8 });

      A.tmpAttn = { arcs: [...head1, ...hi, ...head2, ...head3], flags, legend };
    },
  });
})();
