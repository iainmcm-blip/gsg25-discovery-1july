/* ============================================================
   GSG25 Strategic Discovery — interactions
   ============================================================ */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach(function (e) { e.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- Count-up numbers ---------- */
  function fmt(n, decimals, prefix, suffix, comma) {
    var s = decimals ? n.toFixed(decimals) : Math.round(n).toString();
    if (comma) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (prefix || '') + s + (suffix || '');
  }
  function initCount() {
    var nums = document.querySelectorAll('[data-count]');
    if (!nums.length) return;
    if (reduce || !('IntersectionObserver' in window)) {
      nums.forEach(function (el) {
        var t = parseFloat(el.getAttribute('data-count'));
        var d = parseInt(el.getAttribute('data-dec') || '0', 10);
        el.textContent = fmt(t, d, el.getAttribute('data-prefix'), el.getAttribute('data-suffix'), el.hasAttribute('data-comma'));
      });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target; io.unobserve(el);
        var target = parseFloat(el.getAttribute('data-count'));
        var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
        var pre = el.getAttribute('data-prefix'), suf = el.getAttribute('data-suffix');
        var comma = el.hasAttribute('data-comma');
        var dur = 1400, start = null;
        function step(ts) {
          if (start === null) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = fmt(target * eased, dec, pre, suf, comma);
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = fmt(target, dec, pre, suf, comma);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    nums.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Scroll progress bar ---------- */
  function initProgress() {
    var bar = document.querySelector('.nav-prog');
    if (!bar) return;
    function upd() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var p = max > 0 ? (h.scrollTop || document.body.scrollTop) / max : 0;
      bar.style.width = (p * 100) + '%';
    }
    document.addEventListener('scroll', upd, { passive: true });
    upd();
  }

  /* ---------- Mobile menu ---------- */
  function initMenu() {
    var btn = document.getElementById('menu-btn');
    var menu = document.getElementById('menu');
    if (!btn || !menu) return;
    btn.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { menu.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); });
    });
  }

  /* ---------- Accordions (competitors, etc.) ---------- */
  function initAcc() {
    document.querySelectorAll('.acc-head').forEach(function (head) {
      head.addEventListener('click', function () {
        var acc = head.closest('.acc');
        var open = acc.classList.toggle('open');
        head.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
  }

  /* ---------- Strategic A/B toggle ---------- */
  function initToggle() {
    var group = document.querySelector('[data-toggle-group]');
    if (!group) return;
    var btns = group.querySelectorAll('.toggle-btn');
    var panels = document.querySelectorAll('[data-opt]');
    function show(key) {
      btns.forEach(function (b) { b.setAttribute('aria-selected', b.getAttribute('data-opt-btn') === key ? 'true' : 'false'); });
      panels.forEach(function (p) {
        var match = p.getAttribute('data-opt') === key;
        p.style.display = match ? '' : 'none';
        if (match) { p.classList.remove('in'); void p.offsetWidth; p.classList.add('in'); }
      });
    }
    btns.forEach(function (b) { b.addEventListener('click', function () { show(b.getAttribute('data-opt-btn')); }); });
    show(btns[0].getAttribute('data-opt-btn'));
  }

  /* ---------- Active chapter in nav ---------- */
  function initActiveNav() {
    var path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav a.chip').forEach(function (a) {
      var href = a.getAttribute('href');
      if (href === path) a.setAttribute('aria-current', 'page');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initReveal(); initCount(); initProgress(); initMenu();
    initAcc(); initToggle(); initActiveNav();
  });
})();

/* ============================================================
   Present mode — keyboard-driven, cross-page, presenter notes
   ============================================================ */
(function () {
  'use strict';
  var PAGES = ['index.html','01-founders-vision.html','02-landscape.html','03-competitive.html',
    '04-brand-audit.html','05-voices.html','06-recommendation.html','07-next-steps.html'];
  var NAMES = {
    'index.html':'Cover','01-founders-vision.html':'Founder’s Vision','02-landscape.html':'Landscape',
    '03-competitive.html':'Competitive','04-brand-audit.html':'Brand Audit',
    '05-voices.html':'Voices','06-recommendation.html':'The Strategic Recommendation',
    '07-next-steps.html':'Next Steps'
  };
  /* Facilitator notes keyed by file -> beat index (beats = sections in DOM order) */
  var NOTES = {
    'index.html': {
      0: 'Open here. Frame it: “Rather than slides, we walk the evidence together — to the territory it points to, and the decision we make as a group.”',
      1: 'Research status: everything is complete. This is the territory-confirmation meeting.',
      2: 'The three findings — and what each means for GSG at 25.',
      3: 'The path we’ll walk — seven short sections, building to the decision.'
    },
    '01-founders-vision.html': {
      0: 'Section 01 — start with the conviction the brand was built on.',
      1: 'Atul’s own words on the founding problem. Let him react and expand.',
      2: 'Five beliefs that pre-date the strategy — they ARE the strategy.',
      3: '25 years of proof. Land the Deming Prize (world first) and the non-selective 37.2.',
      4: 'External validation — none of it self-awarded.'
    },
    '02-landscape.html': {
      0: 'Section 02 — the opportunity is now.',
      1: 'Land the scale: the local learner is the growth story — GSG’s home turf.',
      2: 'Three trends, all pointing GSG’s way — and how GSG already lives each.'
    },
    '03-competitive.html': {
      0: 'Section 03 — where everyone stands.',
      1: 'Five groups, all carrying for-profit equity. GSG is the outlier: no external investor.',
      2: 'THE pivotal beat. Walk the map; land on the green — Accessible Excellence. Each tile has the recommended move.'
    },
    '04-brand-audit.html': {
      0: 'Section 04 — the distance between what GSG says and what it has built.',
      1: 'Says vs built — the gap is the opportunity. SmartLearn = 45,000 students.',
      2: 'The opportunity: arm the line with proof; make SmartLearn the signature.'
    },
    '05-voices.html': {
      0: 'Section 05 — primary research complete. Three voices, one direction.',
      1: 'The programme: staff survey (13 responses) + three depth interviews.',
      2: 'Survey picture: accessible beat elite 2:1; awareness + consistency gaps to fix internally.',
      3: 'Converge vs diverge: the territory resonates; internal alignment is the prerequisite.',
      4: 'THE moment. Three insiders, unprompted, describe Accessible Excellence in their own words.'
    },
    '06-recommendation.html': {
      0: 'Section 06 — the decision.',
      1: 'The four brand truths, then the future-forward framing.',
      2: 'State the recommendation plainly: Accessible Excellence, “Learn Limitless” retained as the signature line.',
      3: 'Toggle A vs B live with Atul if useful — the research backs B.',
      4: 'Proven vs qualified — the editorial discipline. This earns trust.',
      5: 'Guardrails — what we will NOT do. Discipline is the strategy.'
    },
    '07-next-steps.html': {
      0: 'Section 07 — owners, actions, timing.',
      1: 'Confirm the territory TODAY; make the commitments in the room.',
      2: 'Close: where the evidence points — next stop is Atul’s sign-off, then creative.'
    }
  };

  function fileName() { return location.pathname.split('/').pop() || 'index.html'; }
  function pageIndex() { var i = PAGES.indexOf(fileName()); return i < 0 ? 0 : i; }

  var beats = [], idx = 0, hud, brand, notesPanel, notesOpen = false, progress;

  function collectBeats() {
    beats = Array.prototype.filter.call(document.body.children, function (el) {
      return el.tagName === 'SECTION' && !el.hasAttribute('data-present-skip');
    });
  }
  function fmt(el) {
    var t = parseFloat(el.getAttribute('data-count')) || 0;
    var d = parseInt(el.getAttribute('data-dec') || '0', 10);
    var pre = el.getAttribute('data-prefix') || '', suf = el.getAttribute('data-suffix') || '';
    var s = d ? t.toFixed(d) : Math.round(t).toString();
    if (el.hasAttribute('data-comma')) s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    el.textContent = pre + s + suf;
  }
  function setActive(i) {
    idx = Math.max(0, Math.min(beats.length - 1, i));
    beats.forEach(function (b, k) { b.classList.toggle('is-active', k === idx); });
    var b = beats[idx];
    b.querySelectorAll('[data-count]').forEach(fmt);
    window.scrollTo(0, 0);
    cascade(b);
    updateHud();
  }
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function cascade(b) {
    var els = b.querySelectorAll('.reveal');
    if (reduceMotion) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    els.forEach(function (e) { e.classList.remove('in'); e.style.transitionDelay = ''; });
    void b.offsetWidth; // reflow so removal registers before re-adding
    els.forEach(function (e, i) {
      e.style.transitionDelay = Math.min(i * 0.09, 1.25) + 's';
      e.classList.add('in');
    });
  }
  function chapterLabel() {
    var f = fileName(), m = f.match(/^(\d\d)-/);
    return (m ? 'Section ' + m[1] + ' · ' : '') + (NAMES[f] || '');
  }
  function updateHud() {
    if (progress) progress.style.width = (((idx + 1) / beats.length) * 100) + '%';
    if (hud) {
      hud.querySelector('.label').textContent = chapterLabel();
      hud.querySelector('.count').textContent = (idx + 1) + ' / ' + beats.length;
    }
    if (notesPanel) {
      var n = (NOTES[fileName()] || {})[idx];
      notesPanel.querySelector('p').textContent = n || '—';
    }
  }
  function go(file, resume) {
    try { localStorage.setItem('gsgResume', resume); } catch (e) {}
    location.href = file;
  }
  function next() {
    if (idx < beats.length - 1) setActive(idx + 1);
    else { var p = pageIndex(); if (p < PAGES.length - 1) go(PAGES[p + 1], 'first'); }
  }
  function prev() {
    if (idx > 0) setActive(idx - 1);
    else { var p = pageIndex(); if (p > 0) go(PAGES[p - 1], 'last'); }
  }
  function enter(resume) {
    collectBeats(); if (!beats.length) return;
    document.body.classList.add('present');
    setActive(resume === 'last' ? beats.length - 1 : 0);
  }
  function exit() {
    document.body.classList.remove('present');
    beats.forEach(function (b) { b.classList.remove('is-active'); });
    document.querySelectorAll('.reveal').forEach(function (e) { e.style.transitionDelay = ''; });
    if (notesPanel) notesPanel.classList.remove('open');
    notesOpen = false;
    try { localStorage.removeItem('gsgResume'); } catch (e) {}
  }
  function toggleNotes() { notesOpen = !notesOpen; notesPanel.classList.toggle('open', notesOpen); }

  function buildChrome() {
    progress = document.createElement('div'); progress.className = 'present-progress';
    document.body.appendChild(progress);

    brand = document.createElement('div'); brand.className = 'present-brand';
    brand.innerHTML = '<img src="assets/gsg-mark.svg" alt=""><span>GSG25 · Strategic Discovery</span>';
    document.body.appendChild(brand);

    hud = document.createElement('div'); hud.className = 'present-hud';
    hud.innerHTML =
      '<div class="seg"><span class="label"></span></div>' +
      '<div class="seg"><button data-act="prev" aria-label="Previous">‹</button>' +
      '<span class="count"></span><button data-act="next" aria-label="Next">›</button></div>' +
      '<div class="seg"><span class="hint">N notes · Esc exit</span>' +
      '<button data-act="notes" aria-label="Notes">N</button>' +
      '<button data-act="exit" aria-label="Exit">✕</button></div>';
    document.body.appendChild(hud);
    hud.addEventListener('click', function (e) {
      var btn = e.target.closest('button'); if (!btn) return;
      var a = btn.getAttribute('data-act');
      if (a === 'next') next(); else if (a === 'prev') prev();
      else if (a === 'notes') toggleNotes(); else if (a === 'exit') exit();
    });

    notesPanel = document.createElement('div'); notesPanel.className = 'present-notes';
    notesPanel.innerHTML = '<h4>Facilitator notes</h4><p>—</p>';
    document.body.appendChild(notesPanel);
  }

  function injectControls() {
    var bar = document.querySelector('.nav .nav-bar') || document.querySelector('.nav .maxw');
    if (!bar) return;
    var menuBtn = bar.querySelector('#menu-btn');
    var wrap = document.createElement('span'); wrap.className = 'present-controls';
    wrap.innerHTML =
      '<button class="present-btn solid" data-present title="Present (P)">▶ Present</button>';
    if (menuBtn) bar.insertBefore(wrap, menuBtn); else bar.appendChild(wrap);
    wrap.querySelector('[data-present]').addEventListener('click', function () { enter('first'); });
  }

  function onKey(e) {
    if (!document.body.classList.contains('present')) {
      if ((e.key === 'p' || e.key === 'P') && !/input|textarea/i.test((e.target.tagName || ''))) enter('first');
      return;
    }
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev(); }
    else if (e.key === 'Escape') { exit(); }
    else if (e.key === 'n' || e.key === 'N') { toggleNotes(); }
    else if (e.key === 'f' || e.key === 'F') {
      if (!document.fullscreenElement) { if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen(); }
      else if (document.exitFullscreen) document.exitFullscreen();
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    buildChrome(); injectControls();
    document.addEventListener('keydown', onKey);
    var resume = null;
    try { resume = localStorage.getItem('gsgResume'); if (resume) localStorage.removeItem('gsgResume'); } catch (e) {}
    if (resume) enter(resume); // only auto-resumes when arriving via cross-page next/prev
  });
})();

/* ============================================================
   GSG25 — Animation & Interaction Enhancements
   ============================================================ */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var noHover = window.matchMedia('(hover: none)').matches;

  /* ---- Nav scroll shadow ---- */
  function initNavScrolled() {
    var nav = document.querySelector('header.nav');
    if (!nav) return;
    function upd() { nav.classList.toggle('scrolled', window.pageYOffset > 8); }
    window.addEventListener('scroll', upd, { passive: true });
    upd();
  }

  /* ---- Ring motif parallax ---- */
  /* Translates the .ring-motif containers at different rates to create depth */
  function initRingParallax() {
    var rings = document.querySelectorAll('.ring-motif');
    if (!rings.length || reduce) return;
    function upd() {
      var s = window.pageYOffset;
      rings.forEach(function (r, i) {
        var rate = i % 2 === 0 ? 0.055 : -0.04;
        r.style.transform = 'translateY(' + (s * rate).toFixed(1) + 'px)';
      });
    }
    window.addEventListener('scroll', upd, { passive: true });
    upd();
  }

  /* ---- Card 3D perspective tilt on mousemove ---- */
  function initCardTilt() {
    if (reduce || noHover) return;
    document.querySelectorAll('.card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width  - 0.5;
        var y = (e.clientY - r.top)  / r.height - 0.5;
        card.style.transform =
          'translateY(-5px) perspective(600px) rotateX(' + (-y * 8).toFixed(2) + 'deg) rotateY(' + (x * 8).toFixed(2) + 'deg)';
        card.style.boxShadow = '0 22px 54px -18px rgba(11,23,48,.42)';
        card.style.borderColor = 'rgba(20,93,171,.18)';
        card.style.transition =
          'transform 0.07s ease, box-shadow 0.07s ease, border-color 0.07s ease';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
        card.style.boxShadow = '';
        card.style.borderColor = '';
        card.style.transition = '';
      });
    });
  }

  /* ---- Stat landing pulse — fires once when count-up settles ---- */
  function initStatPulse() {
    if (reduce) return;
    var nums = document.querySelectorAll('[data-count]');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var el = en.target;
        /* Count-up takes ~1400ms; pulse fires as it lands */
        setTimeout(function () {
          el.classList.add('stat-land');
          el.addEventListener('animationend', function () {
            el.classList.remove('stat-land');
          }, { once: true });
        }, 1480);
      });
    }, { threshold: 0.5 });
    nums.forEach(function (el) { io.observe(el); });
  }

  /* ---- Ambient gradient in dark sections ---- */
  function initDarkAmbient() {
    document.querySelectorAll('section.dark').forEach(function (sec) {
      if (sec.querySelector('.gsg-dark-ambient')) return;
      var g = document.createElement('div');
      g.className = 'gsg-dark-ambient';
      /* randomise the animation phase per section so they don't all drift in sync */
      var delay = -(Math.floor(sec.dataset.darkIdx || 0) * 4.5);
      g.style.animationDelay = delay + 's';
      sec.insertBefore(g, sec.firstChild);
    });
    /* tag each section so delays differ */
    var darks = document.querySelectorAll('section.dark');
    darks.forEach(function (s, i) { s.dataset.darkIdx = i; });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNavScrolled();
    initRingParallax();
    initCardTilt();
    initStatPulse();
    initDarkAmbient();
  });
})();
