/* ============================================================
 * LLM Blueprint — scroll director (continuous-stage edition)
 *
 * The whole pipeline is ONE pinned section driven by ONE master
 * timeline. A persistent cast of chips (see actors.js) morphs
 * through every phase; only the caption cards are swapped.
 *
 * Phase module contract (js/phases/*.js):
 *   LLMBP.phases.push({
 *     id:   "s02",              // caption card + rail key
 *     span: 2.5,                // scroll weight (≈ viewport heights)
 *     build(tl, ctx, A) {}      // append tweens to a phase-local tl
 *   });
 * Static scene contract unchanged (intro / recap): LLMBP.scenes.
 * ============================================================ */
(function () {
  "use strict";
  const NS = (window.LLMBP = window.LLMBP || {});
  NS.scenes = NS.scenes || [];
  NS.phases = NS.phases || [];

  const director = {
    ctx: null,
    masterST: null,
    masterTl: null,
    phaseMarks: {},          /* id -> [startFrac, endFrac] */
    actors: null,

    init(ctx) {
      this.ctx = ctx;
      gsap.registerPlugin(ScrollTrigger);
      this.buildStatics();
      this.buildPipeline();
      this.buildRail();

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => this.rebuild());
      }
      window.addEventListener("load", () => ScrollTrigger.refresh());
      /* rebuild only on real width changes (height jitter from browser
         chrome or screenshots must NOT reset the pipeline) */
      let rt = null;
      let lastW = window.innerWidth;
      window.addEventListener("resize", () => {
        if (window.innerWidth === lastW) return;
        clearTimeout(rt);
        rt = setTimeout(() => {
          if (window.innerWidth !== lastW) {
            lastW = window.innerWidth;
            this.rebuild();
          }
        }, 350);
      });
    },

    buildStatics() {
      for (const scene of NS.scenes) {
        const section = document.querySelector(scene.section);
        if (!section) continue;
        const stage = section.querySelector(".scene__stage");
        if (stage) NS.clear(stage);
        scene.build(stage, null, this.ctx);
      }
    },

    buildPipeline() {
      const section = document.querySelector("#sc-pipeline");
      if (!section) return;
      const stage = section.querySelector(".scene__stage");
      NS.clear(stage);

      const A = (this.actors = NS.buildActors(stage, this.ctx));
      const tl = (this.masterTl = gsap.timeline({ paused: true }));
      const cards = {};
      section.querySelectorAll(".phase-card").forEach((c) => {
        cards[c.dataset.phase] = c;
        gsap.set(c, { autoAlpha: 0, y: 14 });
      });

      /* build phases sequentially on the master timeline */
      const total = NS.phases.reduce((s, p) => s + p.span, 0);
      for (const phase of NS.phases) {
        const t0 = tl.duration();
        /* caption in */
        const card = cards[phase.id];
        if (card) {
          tl.to(card, { autoAlpha: 1, y: 0, duration: 0.35 }, t0);
        }
        /* each phase gets its own NESTED timeline so that the time
           positions used inside build() stay phase-local */
        const sub = gsap.timeline();
        phase.build(sub, this.ctx, A);
        tl.add(sub, t0);
        /* caption out (except the last phase) */
        if (card && phase !== NS.phases[NS.phases.length - 1]) {
          tl.to(card, { autoAlpha: 0, y: -10, duration: 0.3 });
        }
        tl.addLabel("end-" + phase.id);
      }

      /* phase boundaries as fractions of the real timeline duration */
      this.phaseMarks = {};
      let prev = 0;
      const dur = tl.duration() || 1;
      for (const phase of NS.phases) {
        const end = (tl.labels["end-" + phase.id] || dur) / dur;
        this.phaseMarks[phase.id] = [prev, end];
        prev = end;
      }

      if (NS.reducedMotion) {
        document.body.classList.add("reduced");
        tl.progress(1).pause();
        return;
      }

      this.masterST = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=" + Math.round(total * 100) + "%",
        pin: true,
        scrub: 0.8,
        animation: tl,
        anticipatePin: 1,
        onUpdate: (self) => this.updateRail(self.progress),
      });
    },

    rebuild(ctx) {
      this.ctx = ctx || this.ctx;
      if (this.masterST) { this.masterST.kill(); this.masterST = null; }
      if (this.masterTl) { this.masterTl.kill(); this.masterTl = null; }
      /* caption cards are static HTML — restore before re-pinning */
      document.querySelectorAll("#sc-pipeline .phase-card").forEach((c) => {
        gsap.set(c, { clearProps: "all" });
      });
      this.buildStatics();
      this.buildPipeline();
      ScrollTrigger.refresh();
      /* snap the fresh timeline straight to the current scroll position
         so a rebuild never leaves the stage in a half-way state */
      if (this.masterST && this.masterTl) {
        this.masterTl.progress(this.masterST.progress);
      }
      this.updateRail(this.masterST ? this.masterST.progress : 0);
    },

    /* ---------- progress rail ---------- */
    buildRail() {
      const rail = document.querySelector(".rail");
      if (!rail) return;
      NS.clear(rail);
      const items = [...NS.phases.map((p) => p.id), "s11"];
      for (const id of items) {
        const b = document.createElement("button");
        b.dataset.phase = id;
        b.setAttribute("aria-label", id);
        const tip = document.createElement("span");
        tip.className = "tip";
        tip.dataset.i18n = "rail." + id;
        b.appendChild(tip);
        b.addEventListener("click", () => this.scrollToPhase(id));
        rail.appendChild(b);
      }
      NS.i18n.apply(rail);

      const intro = document.querySelector("#sc-intro");
      if (intro && !NS.reducedMotion) {
        ScrollTrigger.create({
          trigger: intro,
          start: "bottom 70%",
          onEnter: () => rail.classList.add("visible"),
          onLeaveBack: () => rail.classList.remove("visible"),
        });
      } else {
        rail.classList.add("visible");
      }
    },

    updateRail(progress) {
      let active = null;
      for (const id in this.phaseMarks) {
        const [a, b] = this.phaseMarks[id];
        if (progress >= a && progress < b) { active = id; break; }
      }
      if (progress >= 0.999) active = "s11";
      document.querySelectorAll(".rail button").forEach((b) => {
        b.classList.toggle("active", b.dataset.phase === active);
      });
    },

    scrollToPhase(id) {
      if (id === "s11") {
        const el = document.querySelector("#sc-recap");
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: "smooth" });
        return;
      }
      const mark = this.phaseMarks[id];
      if (!mark || !this.masterST) return;
      const st = this.masterST;
      const y = st.start + (st.end - st.start) * (mark[0] + 0.02);
      window.scrollTo({ top: y, behavior: "smooth" });
    },

    scrollTop() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    },

    /* kept for recap map compatibility */
    scrollToScene(id) { this.scrollToPhase(id); },
  };

  NS.director = director;
})();
