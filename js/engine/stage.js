/* ============================================================
 * LLM Blueprint — stage utilities
 * DOM/SVG helpers, procedural visuals derived from token ids.
 * ============================================================ */
(function () {
  "use strict";
  const NS = (window.LLMBP = window.LLMBP || {});
  const SVGNS = "http://www.w3.org/2000/svg";

  /* ---------- DOM ---------- */
  NS.el = function (tag, cls, html, parent) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    if (parent) parent.appendChild(e);
    return e;
  };

  NS.svg = function (tag, attrs, parent) {
    const e = document.createElementNS(SVGNS, tag);
    for (const k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };

  NS.clear = (node) => { while (node.firstChild) node.removeChild(node.firstChild); };

  /* Prepare an svg path for draw-on animation; returns its length. */
  NS.prepDraw = function (path) {
    const len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;
    return len;
  };

  /* ---------- procedural vectors ----------
   * Every token id deterministically maps to a pattern of values in
   * [-1, 1], so the same token always shows the same "vector". */
  NS.vecValues = function (id, dims) {
    const rand = NS.rng("vec:" + id);
    const out = [];
    for (let i = 0; i < dims; i++) out.push(Math.round((rand() * 2 - 1) * 100) / 100);
    return out;
  };

  /* Build a heatmap strip element for a token id. */
  NS.vecStrip = function (id, dims, cellW, cellH) {
    const wrap = NS.el("div", "vec");
    const vals = NS.vecValues(id, dims);
    for (const v of vals) {
      const c = NS.el("i", null, null, wrap);
      if (cellW) { c.style.width = cellW + "px"; }
      if (cellH) { c.style.height = cellH + "px"; }
      c.style.opacity = (0.12 + Math.abs(v) * 0.78).toFixed(2);
      if (v < 0) c.style.background = "var(--violet)";
    }
    return wrap;
  };

  /* 2-D "semantic" coordinates for the mini scatter (procedural). */
  NS.semCoords = function (id) {
    const rand = NS.rng("sem:" + id);
    return { x: rand(), y: rand() };
  };

  /* ---------- misc ---------- */
  NS.reducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  NS.formatPct = (p) => (p * 100).toFixed(p >= 0.1 ? 0 : 1) + "%";

  /* Quadratic bezier point (for the loop conveyor flight). */
  NS.qBezier = function (p0, p1, p2, t) {
    const u = 1 - t;
    return {
      x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
      y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
    };
  };

  /* Center of el relative to a container. */
  NS.centerIn = function (el, container) {
    const a = el.getBoundingClientRect();
    const b = container.getBoundingClientRect();
    return { x: a.left - b.left + a.width / 2, y: a.top - b.top + a.height / 2 };
  };
})();
