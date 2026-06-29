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
  var PAGES = ['index.html','01-landscape.html','02-competitive.html','03-brand-audit.html',
    '04-founders-vision.html','05-voices.html','06-brand-truths.html',
    '07-strategic-implications.html','08-next-steps.html'];
  var NAMES = {
    'index.html':'Cover','01-landscape.html':'Landscape','02-competitive.html':'Competitive',
    '03-brand-audit.html':'Brand Audit','04-founders-vision.html':'Founder’s Vision',
    '05-voices.html':'Voices','06-brand-truths.html':'Brand Truths',
    '07-strategic-implications.html':'The Strategic Recommendation','08-next-steps.html':'Next Steps'
  };
  /* Facilitator notes keyed by file -> beat index (beats = sections in DOM order) */
  var NOTES = {
    'index.html': {
      0: 'Open here. Frame it: “Rather than 30 slides, we built the discovery into your own brand. Research is complete — here is the evidence and our recommendation.”',
      1: 'Research status: everything is complete. This is the territory-confirmation meeting.',
      2: 'The six findings — from the opportunity to the decision required today.',
      3: 'Our evidence standard: every claim rated and sourced — including Accessible Excellence, now research-confirmed.',
      4: 'The path we’ll walk — eight short sections, building to the decision.'
    },
    '01-landscape.html': {
      0: 'Section 01 — the opportunity is now.',
      1: 'Land the scale: the local learner is the growth story — GSG’s home turf.',
      2: 'Three trends, all pointing GSG’s way. Connected explicitly in Section 07.'
    },
    '02-competitive.html': {
      0: 'Section 02 — where everyone stands.',
      1: 'Five groups, all private. Nobody sits where GSG could — none combine access with non-selective proof.',
      2: 'The “Thrive” flag — a live landmine. We must not use Cognita’s word.',
      3: 'THE pivotal beat. Walk the map; land on the green — Accessible Excellence.'
    },
    '03-brand-audit.html': {
      0: 'Section 03 — you already say it.',
      1: '“Learn Limitless” is live and the manifesto is published — but not deployed beyond the website.',
      2: 'Read the manifesto aloud. Let it breathe — then: deployed on exactly one page.',
      3: 'Says vs built — the distance is the opportunity. (SmartLearn now stated as 45,000 students.)',
      4: 'Two visual systems in parallel — the most urgent fix before any creative begins.'
    },
    '04-founders-vision.html': {
      0: 'Section 04 — the conviction beneath the brand.',
      1: 'Atul’s own words. Let him react and expand.',
      2: 'Five beliefs that pre-date the strategy — they ARE the strategy.',
      3: '25 years of proof. The non-selective 37.2 is the hardest number to argue with.',
      4: 'External validation — none of it self-awarded.'
    },
    '05-voices.html': {
      0: 'Section 05 — primary research complete. Three voices, one direction.',
      1: 'The programme: staff survey (13 responses) + three depth interviews.',
      2: 'Survey picture: accessible beat elite 2:1; awareness + consistency gaps to fix internally.',
      3: 'Converge vs diverge: the territory resonates; internal alignment is the prerequisite.',
      4: 'THE moment. Three insiders, unprompted, describe Accessible Excellence in their own words.'
    },
    '06-brand-truths.html': {
      0: 'Section 06 — five brand truths, each confirmed by at least two of three interviewees.',
      1: 'Walk the five. Truth 01 (Accessible Excellence) and 05 (the alumni) are the emotional anchors.'
    },
    '07-strategic-implications.html': {
      0: 'Section 07 — the decision. Both options framed, but research confirms Option B.',
      1: 'State the recommendation plainly: Accessible Excellence, with “Learn Limitless” retained as the signature line.',
      2: 'Toggle A vs B live with Atul if useful — the research backs B.',
      3: 'Honest assessment — what is proven vs still becoming. This earns trust.',
      4: 'Guardrails — what we will NOT do. Discipline is the strategy.'
    },
    '08-next-steps.html': {
      0: 'Section 08 — owners, actions, timing.',
      1: 'Confirm the territory TODAY; make the commitments in the room.',
      2: 'Close: territory confirmed — next stop is Atul’s sign-off, then creative.'
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
      '<button class="present-btn" data-pdf title="Save as PDF">PDF</button>' +
      '<button class="present-btn solid" data-present title="Present (P)">▶ Present</button>';
    if (menuBtn) bar.insertBefore(wrap, menuBtn); else bar.appendChild(wrap);
    wrap.querySelector('[data-present]').addEventListener('click', function () { enter('first'); });
    wrap.querySelector('[data-pdf]').addEventListener('click', function () { window.print(); });
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
