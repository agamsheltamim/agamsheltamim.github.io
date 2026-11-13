/* אגם של טעמים – אינטראקציות ואנימציות */
(function () {
  'use strict';
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var hasGsap = typeof window.gsap !== 'undefined';
  var prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function motionOff() { return prefersReduce || root.classList.contains('a11y-nomotion') || !hasGsap; }

  var y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  /* ---------- כותרת ותפריט נייד ---------- */
  var header = $('.site-header'), toggle = $('.menu-toggle'), nav = $('#nav');
  function onScroll() { if (header) header.classList.toggle('scrolled', window.scrollY > 24); }
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  function setMenu(open) {
    if (!toggle) return;
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'סגירת תפריט' : 'פתיחת תפריט');
  }
  if (toggle) {
    toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
    });
  }

  /* סימון הקישור הפעיל בניווט */
  var links = $$('.nav-link[href^="#"]');
  if ('IntersectionObserver' in window && links.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (l) {
          if (l.getAttribute('href') === '#' + en.target.id) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (l) { var t = $(l.getAttribute('href')); if (t) io.observe(t); });
  }

  /* ---------- גלריה: הגדלת תמונה ---------- */
  var lb = $('#lightbox'), lastTile = null;
  $$('#galleryGrid .tile button').forEach(function (b) {
    b.addEventListener('click', function () {
      if (!lb || !lb.showModal) return;
      lastTile = b;
      var li = $('img', lb), src = $('img', b);
      li.src = b.dataset.full; li.alt = src.alt;
      $('p', lb).textContent = b.dataset.cap;
      lb.showModal();
    });
  });
  if (lb) {
    $('.lb-close', lb).addEventListener('click', function () { lb.close(); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener('close', function () { if (lastTile) lastTile.focus(); });
  }

  /* ---------- טופס הזמנה ← וואטסאפ ---------- */
  var form = $('#orderForm');
  if (form) {
    var dateEl = $('#f-date');
    if (dateEl) { var t = new Date(); dateEl.min = t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2); }
    var rules = {
      'f-name': function (v) { return v.trim().length < 2 ? 'נא למלא שם מלא (לפחות שתי אותיות).' : ''; },
      'f-product': function (v) { return !v ? 'נא לבחור מה תרצו להזמין.' : ''; }
    };
    var check = function (id) {
      var el = $('#' + id), err = $('#e-' + id.slice(2)), msg = rules[id](el.value);
      err.textContent = msg;
      if (msg) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
      return !msg;
    };
    Object.keys(rules).forEach(function (id) {
      $('#' + id).addEventListener('blur', function () { check(id); });
      $('#' + id).addEventListener('input', function () { if ($('#' + id).hasAttribute('aria-invalid')) check(id); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = Object.keys(rules).filter(function (id) { return !check(id); });
      var status = $('#formStatus');
      if (bad.length) { status.textContent = ''; $('#' + bad[0]).focus(); return; }
      var lines = ['היי, אשמח להזמין מאגם של טעמים 🍰', 'שם: ' + $('#f-name').value.trim(), 'הזמנה: ' + $('#f-product').value];
      if (dateEl.value) { var d = dateEl.value.split('-'); lines.push('לתאריך: ' + d[2] + '.' + d[1] + '.' + d[0]); }
      var notes = $('#f-notes').value.trim(); if (notes) lines.push('פרטים: ' + notes);
      window.open('https://wa.me/972502282850?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
      status.textContent = 'וואטסאפ נפתח בחלון חדש עם ההודעה שלכם. נשאר רק ללחוץ "שליחה".';
    });
  }

  /* ==========================================================
     אנימציות גלילה
     ========================================================== */
  var scrollAnimsOn = false, hsTween = null, lenis = null, lenisTick = null;
  var CLEAR = '[data-reveal],[data-step],.info-list li,.faq-list details,.hero-art,.hero-text,.about-card,.about-mini,.about-badge,.drip,' +
    '.hero h1 .line > span,.hero-kicker,.hero-ribbon-wrap,.hero .lead,.hero-cta,.hero-meta,.arch,.arch img,.hero-seal,.hero .float,' +
    '.sw,.statement-sub,.statement-text,.tw > span,.mq-row,.deco,.steps-line,.scroll-progress,.hs-track,.panel,.panel-intro > *,' +
    '.bigshot-frame,.bigshot-frame img,.bigshot-text span,#galleryGrid .tile,#galleryGrid .tile img,' +
    '.hero-media,.hero-media .slides,.hero-media .slide,.hero-media .slide img,.hero-copy-in,.hero-badge,.hero h1 .ch,.hero-tagline,.slide-ui,.lw,.btn,.tile button';

  function initScrollAnims() {
    if (motionOff() || scrollAnimsOn) return;
    scrollAnimsOn = true;
    gsap.registerPlugin(ScrollTrigger);
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.config({ ignoreMobileResize: true });
    var touch = window.matchMedia('(pointer: coarse)').matches, SC = touch ? .5 : true;
    var desktop = window.matchMedia('(min-width: 900px)').matches;

    /* פס התקדמות */
    gsap.to('.scroll-progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: SC } });

    /* גלילה חלקה */
    if (window.Lenis && !lenis) {
      lenis = new Lenis({ lerp: .085, smoothWheel: true, wheelMultiplier: .95 });
      lenis.on('scroll', ScrollTrigger.update);
      lenisTick = function (t) { lenis.raf(t * 1000); };
      gsap.ticker.add(lenisTick);
    }

    /* Hero – פרלקסה ביציאה */
    if ($('.hero-v3')) {
      var hsT = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
      gsap.to('.hero-media .slides', { yPercent: 12, ease: 'none', scrollTrigger: hsT });
      gsap.to('.hero-copy-in', { yPercent: -18, opacity: .1, ease: 'none', scrollTrigger: hsT });
      gsap.to('.hero-badge', { yPercent: -70, rotate: 120, ease: 'none', scrollTrigger: hsT });
    }

    /* פס טקסט שנע עם הגלילה */
    $$('.mq-row').forEach(function (row, i) {
      var sp = row.firstElementChild;
      if (!row.dataset.dup) { row.dataset.dup = '1'; for (var k = 0; k < 3; k++) row.appendChild(sp.cloneNode(true)); }
      gsap.fromTo(row, { xPercent: i ? 0 : 55 }, { xPercent: i ? 55 : 0, ease: 'none', scrollTrigger: { trigger: '.marquee', start: 'top bottom', end: 'bottom top', scrub: SC } });
    });

    /* אודות */
    if ($('.about-card')) {
      gsap.fromTo('.about-card', { rotate: -8 }, { rotate: -1, ease: 'none', scrollTrigger: { trigger: '.about-grid', start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.fromTo('.about-mini', { yPercent: 40, rotate: -14 }, { yPercent: -30, rotate: 12, ease: 'none', scrollTrigger: { trigger: '.about-grid', start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.from('.about-badge', { scale: 0, rotate: -160, duration: 1.1, ease: 'elastic.out(1,.55)', scrollTrigger: { trigger: '.about-card', start: 'top 70%', once: true } });
    }

    /* מסך "הטעם שלא תשכחו" – ננעץ ונבנה תוך כדי גלילה */
    if ($('.statement')) {
      var st = gsap.timeline({ scrollTrigger: { trigger: '.statement', start: 'top top', end: '+=150%', pin: true, scrub: SC, anticipatePin: 1 } });
      st.from('.statement .sw', { opacity: .06, yPercent: 60, scale: 1.5, rotate: -6, duration: 1, stagger: .8, ease: 'power3.out' })
        .from('.statement-sub', { opacity: 0, y: 30, duration: .8 }, '-=.2')
        .to('.statement-text', { scale: 1.06, duration: 1, ease: 'none' }, '-=.4');
      var dur = st.duration();
      $$('.statement .deco').forEach(function (d) {
        st.to(d, { y: function () { return parseFloat(d.dataset.speed) * window.innerHeight * .78; }, rotate: parseFloat(d.dataset.rot), ease: 'none', duration: dur }, 0);
      });
    }

    /* מוצרים – מעבר אופקי נעוץ (מחשב) */
    var show = $('.showcase'), track = $('.hs-track');
    if (show && track) {
      if (desktop) {
        show.classList.add('is-pinned');
        $('#hs').removeAttribute('tabindex');
        var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
        hsTween = gsap.to(track, { x: dist, ease: 'none',
          scrollTrigger: { trigger: show, start: 'top top', end: function () { return '+=' + dist(); }, pin: true, scrub: SC, invalidateOnRefresh: true, anticipatePin: 1 } });
        $$('.panel', track).forEach(function (pn, i) {
          gsap.from(pn, { yPercent: i % 2 ? 14 : -10, rotate: i % 2 ? 3 : -3, ease: 'none',
            scrollTrigger: { containerAnimation: hsTween, trigger: pn, start: 'right left', end: 'left 55%', scrub: true } });
        });
        gsap.from('.panel-intro > *', { y: 40, opacity: 0, duration: .9, stagger: .12, ease: 'power3.out', scrollTrigger: { trigger: show, start: 'top 70%', once: true } });
        /* מיקוד מקלדת בפריט שמחוץ למסך – גוללים אליו */
        track.addEventListener('focusin', function (e) {
          var stg = hsTween && hsTween.scrollTrigger; if (!stg) return;
          var pn = e.target.closest('.panel'); if (!pn) return;
          var r = pn.getBoundingClientRect();
          if (r.left >= 0 && r.right <= window.innerWidth) return;
          var all = $$('.panel', track), idx = all.indexOf(pn);
          window.scrollTo(0, stg.start + (stg.end - stg.start) * ((idx + 1) / all.length));
        });
      } else {
        gsap.from('.hs-track > li', { y: 60, opacity: 0, duration: .9, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: show, start: 'top 75%', once: true } });
      }
    }

    /* תמונה שנפתחת בקשת למסך מלא */
    if ($('.bigshot')) {
      var bt = gsap.timeline({ scrollTrigger: { trigger: '.bigshot', start: 'top top', end: '+=130%', pin: true, scrub: SC, anticipatePin: 1 } });
      bt.fromTo('.bigshot-frame', { clipPath: desktop ? 'inset(14% 32% 14% 32% round 400px 400px 30px 30px)' : 'inset(20% 14% 20% 14% round 300px 300px 24px 24px)' },
          { clipPath: 'inset(0% 0% 0% 0% round 0px 0px 0px 0px)', ease: 'power1.inOut', duration: 1 })
        .fromTo('.bigshot-frame img', { scale: 1.4 }, { scale: 1, ease: 'none', duration: 1.3 }, 0)
        .from('.bigshot-text span', { yPercent: 110, duration: .5, stagger: .18, ease: 'power3.out' }, .65);
    }

    /* עיטורים מרחפים בפרלקסה */
    $$('.section > .deco').forEach(function (d) {
      gsap.to(d, { y: function () { return parseFloat(d.dataset.speed) * 260; }, rotate: parseFloat(d.dataset.rot), ease: 'none',
        scrollTrigger: { trigger: d.parentNode, start: 'top bottom', end: 'bottom top', scrub: SC } });
    });

    /* כותרות: מילה-מילה */
    $$('.section-title').forEach(function (h) {
      if (h.closest('.panel-intro')) return;
      if (!h.dataset.split) {
        h.dataset.split = '1';
        h.innerHTML = h.textContent.trim().split(/\s+/).map(function (w) { return '<span class="tw"><span>' + w + '</span></span>'; }).join(' ');
      }
      gsap.from($$('.tw > span', h), { yPercent: 115, rotate: 5, duration: 1, ease: 'power4.out', stagger: .09, scrollTrigger: { trigger: h, start: 'top 88%', once: true } });
    });

    /* איך מזמינים */
    if ($('.steps-line')) gsap.from('.steps-line', { scaleX: 0, ease: 'none', scrollTrigger: { trigger: '.steps-wrap', start: 'top 80%', end: 'top 30%', scrub: SC } });
    if ($('.drip')) gsap.from('.drip', { scaleY: .15, transformOrigin: 'top', ease: 'none', scrollTrigger: { trigger: '.how', start: 'top 95%', end: 'top 35%', scrub: true } });

    /* גלריה: חשיפה בווילון + תנועה פנימית */
    $$('#galleryGrid .tile').forEach(function (t, i) {
      gsap.from(t, { clipPath: 'inset(100% 0% 0% 0% round 20px)', y: 60, duration: 1.2, ease: 'power4.out', delay: (i % 4) * .08, scrollTrigger: { trigger: t, start: 'top 94%', once: true } });
      gsap.fromTo($('img', t), { yPercent: -7, scale: 1.18 }, { yPercent: 7, scale: 1.18, ease: 'none', scrollTrigger: { trigger: t, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    /* חשיפות כלליות */
    $$('[data-reveal]').forEach(function (el) {
      if (el.tagName === 'DETAILS') return;
      var dir = el.dataset.reveal, from = { opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 86%', once: true } };
      if (dir === 'left') from.x = -70; else if (dir === 'right') from.x = 70; else from.y = 40;
      gsap.from(el, from);
    });
    [['[data-step]', '.steps'], ['.info-list li', '.info-list'], ['.faq-list details', '.faq-list']].forEach(function (p) {
      if (!$(p[1])) return;
      gsap.from(p[0], { opacity: 0, y: 70, scale: .9, rotate: function (i) { return i % 2 ? 2 : -2; }, duration: 1, ease: 'back.out(1.4)', stagger: .12, clearProps: 'transform',
        scrollTrigger: { trigger: p[1], start: 'top 82%', once: true } });
    });

    /* אודות – משפט שנדלק מילה-מילה */
    var lead = $('.about-text .lead');
    if (lead) {
      if (!lead.dataset.split) {
        lead.dataset.split = '1';
        lead.innerHTML = lead.textContent.trim().split(/\s+/).map(function (w) { return '<span class="lw">' + w + '</span>'; }).join(' ');
      }
      gsap.fromTo($$('.lw', lead), { opacity: .16 }, { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: lead, start: 'top 85%', end: 'top 38%', scrub: true } });
    }

    /* עכבר: כפתורים מגנטיים, הטיית תמונות ופרלקסה בפתיח */
    if (window.matchMedia('(hover:hover) and (pointer:fine)').matches && !root.dataset.pointerFx) {
      root.dataset.pointerFx = '1';
      $$('.btn-primary, .btn-light, .btn-ghost').forEach(function (b) {
        b.addEventListener('pointermove', function (e) {
          if (motionOff()) return;
          var r = b.getBoundingClientRect();
          gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * .28, y: (e.clientY - r.top - r.height / 2) * .4, duration: .35, ease: 'power2.out', overwrite: 'auto' });
        });
        b.addEventListener('pointerleave', function () { if (hasGsap) gsap.to(b, { x: 0, y: 0, duration: .7, ease: 'elastic.out(1,.45)', overwrite: 'auto' }); });
      });
      $$('#galleryGrid .tile button, .panel').forEach(function (el) {
        el.addEventListener('pointermove', function (e) {
          if (motionOff()) return;
          var r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
          gsap.to(el, { rotateY: px * 9, rotateX: -py * 9, transformPerspective: 900, duration: .4, ease: 'power2.out', overwrite: 'auto' });
        });
        el.addEventListener('pointerleave', function () { if (hasGsap) gsap.to(el, { rotateY: 0, rotateX: 0, duration: .8, ease: 'elastic.out(1,.55)', overwrite: 'auto' }); });
      });
      var hero = $('.hero');
      if (hero) hero.addEventListener('pointermove', function (e) {
        if (motionOff()) return;
        var x = e.clientX / window.innerWidth - .5, yy = e.clientY / window.innerHeight - .5;
        gsap.to('.hero-media .slides', { x: x * -26, duration: 1.1, ease: 'power2.out', overwrite: 'auto' });
        gsap.to('.hero-badge', { x: x * 30, y: yy * 22, duration: 1, ease: 'power2.out', overwrite: 'auto' });
      });
    }
  }

  function killAnims() {
    if (!hasGsap) return;
    if (window.ScrollTrigger) ScrollTrigger.getAll().forEach(function (s) { s.kill(true); });
    gsap.globalTimeline.getChildren(true, true, true).forEach(function (t) { t.kill(); });
    gsap.set(CLEAR, { clearProps: 'all' });
    var show = $('.showcase'); if (show) { show.classList.remove('is-pinned'); $('#hs').setAttribute('tabindex', '0'); }
    stopSlides();
    if (lenis) { gsap.ticker.remove(lenisTick); lenis.destroy(); lenis = null; }
    hsTween = null; scrollAnimsOn = false;
  }

  /* ---------- תמונות מתחלפות בפתיח ---------- */
  var slideCall = null, slideIdx = 0, slidesPaused = false;
  function stopSlides() { if (slideCall) { slideCall.kill(); slideCall = null; } }
  function slideNext() {
    var slides = $$('.hero-media .slide'); if (slides.length < 2) return;
    var cur = slides[slideIdx]; slideIdx = (slideIdx + 1) % slides.length; var nx = slides[slideIdx];
    gsap.set(nx, { zIndex: 2, clipPath: 'inset(100% 0% 0% 0%)' }); nx.classList.add('is-on');
    gsap.fromTo($('img', nx), { scale: 1.32 }, { scale: 1.05, duration: 6.5, ease: 'none', overwrite: true });
    gsap.to(nx, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.35, ease: 'power4.inOut', onComplete: function () {
      cur.classList.remove('is-on'); gsap.set(cur, { clearProps: 'zIndex,clipPath' }); gsap.set(nx, { zIndex: 1 });
    } });
    var num = $('#slideNum'); if (num) num.textContent = '0' + (slideIdx + 1);
  }
  function startSlides() {
    stopSlides();
    if (motionOff() || slidesPaused || !$('.hero-media')) return;
    slideCall = gsap.delayedCall(4.6, function () { slideNext(); startSlides(); });
  }
  var slideBtn = $('#slideToggle');
  if (slideBtn) slideBtn.addEventListener('click', function () {
    slidesPaused = !slidesPaused;
    slideBtn.setAttribute('aria-pressed', slidesPaused ? 'true' : 'false');
    slideBtn.setAttribute('aria-label', slidesPaused ? 'הפעלת חילוף התמונות' : 'עצירת חילוף התמונות');
    if (slidesPaused) stopSlides(); else startSlides();
  });
  document.addEventListener('visibilitychange', function () { if (document.hidden) stopSlides(); else startSlides(); });

  function heroIn(delay) {
    if (motionOff() || !$('.hero-v3')) return;
    $$('.hero h1 .line > span').forEach(function (sp) {
      if (sp.dataset.split) return; sp.dataset.split = '1';
      sp.innerHTML = sp.textContent.split('').map(function (c) { return c === ' ' ? ' ' : '<span class="ch">' + c + '</span>'; }).join('');
    });
    var tl = gsap.timeline({ delay: delay || 0, defaults: { ease: 'power4.out' }, onComplete: startSlides });
    tl.fromTo('.hero-media', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'power4.inOut', clearProps: 'clipPath' }, 0)
      .from('.hero-media .slide.is-on img', { scale: 1.5, duration: 2.4, ease: 'power2.out' }, 0)
      .from('.hero-kicker', { y: 20, opacity: 0, duration: .7 }, .3)
      .from('.hero h1 .ch', { yPercent: 125, rotate: 12, duration: 1.1, stagger: .055 }, .35)
      .from('.hero-tagline', { opacity: 0, x: 50, duration: .9 }, 1)
      .from('.hero .lead, .hero-cta, .hero-meta', { y: 28, opacity: 0, duration: .8, stagger: .1 }, 1.1)
      .from('.hero-badge', { scale: 0, rotate: -220, duration: 1.3, ease: 'elastic.out(1,.6)' }, 1.1)
      .from('.slide-ui, .hero-v3 .scroll-cue', { opacity: 0, y: 20, duration: .6 }, 1.5);
  }

  /* ==========================================================
     מסך פתיחה – טריילר
     ========================================================== */
  var intro = $('#intro'), page = $('#page'), introTl = null, introDone = false;
  function finishIntro(instant) {
    if (introDone) return; introDone = true;
    try { sessionStorage.setItem('agam-intro', '1'); } catch (e) {}
    if (page) page.removeAttribute('inert');
    function cleanup() { root.classList.remove('intro-on'); if (intro) intro.remove(); if (window.ScrollTrigger) ScrollTrigger.refresh(); }
    if (introTl) introTl.kill();
    if (instant || !hasGsap) { cleanup(); initScrollAnims(); return; }
    var out = gsap.timeline({ onComplete: cleanup });
    out.to('.intro-stage', { scale: 1.18, opacity: 0, duration: .5, ease: 'power2.in' })
       .to('.intro-skip,.intro-bar,.intro-glow,.intro-grain,.in-shots,.in-kicker,.in-bars', { opacity: 0, duration: .35 }, 0)
       .to('.in-half.l', { xPercent: -101, duration: 1.15, ease: 'power4.inOut' }, .3)
       .to('.in-half.r', { xPercent: 101, duration: 1.15, ease: 'power4.inOut' }, .3)
       .add(function () { heroIn(0); initScrollAnims(); }, .45);
    var main = $('#main'); if (document.activeElement === $('#introSkip') && main) main.focus({ preventScroll: true });
  }

  function buildIntro() {
    if (introDone) return;
    $$('.intro-title .w').forEach(function (w) {
      w.innerHTML = w.textContent.split('').map(function (c) { return '<span class="ch">' + c + '</span>'; }).join('');
    });
    var ring = $('.in-ring'), len = 2 * Math.PI * 158;
    gsap.set(ring, { strokeDasharray: len, strokeDashoffset: len });
    gsap.set('.in-sparks use, .in-flower', { transformOrigin: '50% 50%', transformBox: 'fill-box' });
    gsap.set('.intro-stage', { opacity: 0 });

    var shots = $$('.in-shot'), T0 = 1.55, STEP = 1.1, E = T0 + shots.length * STEP + .15;
    var tl = introTl = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: function () { finishIntro(false); } });
    tl.from('.in-kicker i', { scaleX: 0, duration: .9, ease: 'power2.inOut' }, .1)
      .from('.in-kicker span', { opacity: 0, letterSpacing: '1.1em', duration: 1, stagger: .15 }, .15)
      .to('.in-kicker', { opacity: 0, scale: 1.08, duration: .35, ease: 'power2.in' }, 1.25);
    shots.forEach(function (sh, i) {
      var t = T0 + i * STEP;
      tl.fromTo(sh, { clipPath: i % 2 ? 'inset(0% 100% 0% 0%)' : 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .75, ease: 'power4.inOut' }, t)
        .fromTo($('img', sh), { scale: 1.35, xPercent: i % 2 ? -4 : 4 }, { scale: 1.08, xPercent: 0, duration: 2, ease: 'power2.out' }, t)
        .from($('b', sh), { yPercent: 115, rotate: 6, duration: .7, ease: 'power4.out' }, t + .3);
    });
    tl.to('.in-shots', { clipPath: 'inset(0% 0% 100% 0%)', duration: .75, ease: 'power4.inOut' }, E)
      .to('.in-bars i', { scaleY: 0, duration: .7, ease: 'power3.inOut', transformOrigin: function (i) { return i ? '50% 100%' : '50% 0%'; } }, E)
      .set('.intro-stage', { opacity: 1 }, E + .2)
      .to('.intro-glow', { opacity: 1, duration: 1.2, ease: 'power1.inOut' }, E + .2)
      .from('.in-sparks use', { scale: 0, opacity: 0, rotate: -90, duration: .7, stagger: .07, ease: 'back.out(2.5)' }, E + .3)
      .to(ring, { strokeDashoffset: 0, duration: 1, ease: 'power2.inOut' }, E + .3)
      .from('.in-dots', { opacity: 0, rotate: -50, transformOrigin: '50% 50%', duration: 1.2 }, E + .4)
      .from('.intro-cake', { scale: .3, opacity: 0, filter: 'blur(18px)', duration: 1, ease: 'expo.out' }, E + .45)
      .from('.intro-cake img', { scale: 1.5, duration: 2, ease: 'power2.out' }, E + .45)
      .from('.in-mac', { y: -420, opacity: 0, rotate: function (i) { return i % 2 ? 50 : -50; }, transformOrigin: '50% 50%', transformBox: 'fill-box', duration: .85, stagger: .09, ease: 'bounce.out' }, E + .75)
      .from('.in-flower', { scale: 0, rotate: 180, duration: .6, stagger: .08, ease: 'back.out(3)' }, E + 1.3)
      .from('.intro-title .ch', { yPercent: 120, rotate: 8, duration: .85, stagger: .05, ease: 'power4.out' }, E + .95)
      .from('.intro-ribbon', { scaleX: 0, opacity: 0, duration: .6, ease: 'back.out(1.8)' }, E + 1.75)
      .from('.intro-tag', { opacity: 0, y: 14, letterSpacing: '.8em', duration: .9 }, E + 2)
      .to('.intro-emblem', { scale: 1.05, duration: 1.6, ease: 'sine.inOut' }, E + 1.6)
      .to({}, { duration: .35 });
    tl.to('.intro-bar', { scaleX: 1, duration: tl.duration(), ease: 'none' }, 0);
    window.__agamIntro = tl;
  }

  function playIntro() {
    if (!intro || !root.classList.contains('intro-on')) { heroIn(.1); initScrollAnims(); if (motionOff()) return; return; }
    if (!hasGsap || motionOff()) { finishIntro(true); return; }
    if (page) page.setAttribute('inert', '');
    window.scrollTo(0, 0);
    gsap.ticker.lagSmoothing(0);
    var skip = $('#introSkip');
    skip.addEventListener('click', function () { finishIntro(false); });
    document.addEventListener('keydown', function onKey(e) {
      if (e.key === 'Escape' && !introDone) { finishIntro(false); document.removeEventListener('keydown', onKey); }
    });
    try { skip.focus({ preventScroll: true }); } catch (e) {}
    /* מחכים שתמונות הפתיחה ייטענו (עד 2.5 שניות) ואז מתחילים */
    var imgs = $$('#intro img'), started = false;
    function go() { if (started) return; started = true; buildIntro(); }
    if (document.readyState === 'complete') go(); else window.addEventListener('load', go);
    setTimeout(go, 2500);
  }

  /* רשת ביטחון: אם משהו נתקע – הפתיחה תמיד נסגרת */
  setTimeout(function () { if (!introDone && root.classList.contains('intro-on')) finishIntro(true); }, 16000);

  document.addEventListener('a11y-change', function (e) {
    if (e.detail.nomotion) { if (!introDone && root.classList.contains('intro-on')) finishIntro(true); killAnims(); }
    else if (introDone || !root.classList.contains('intro-on')) { initScrollAnims(); startSlides(); }
  });

  /* קישורי עוגן עם הגלילה החלקה */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || !lenis || a.classList.contains('skip-link')) return;
    var id = a.getAttribute('href'); if (id.length < 2) return;
    var t = id === '#top' ? null : $(id);
    if (id !== '#top' && !t) return;
    e.preventDefault();
    lenis.scrollTo(t || 0, { offset: t ? -70 : 0, duration: 1.5 });
    if (t) { if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }
    try { history.replaceState(null, '', id); } catch (err) {}
  });
  ['#a11yPanel', '#nav', '#lightbox'].forEach(function (sel) { var el = $(sel); if (el) el.setAttribute('data-lenis-prevent', ''); });
  if (lb) {
    lb.addEventListener('close', function () { if (lenis) lenis.start(); });
    $$('#galleryGrid .tile button').forEach(function (b) { b.addEventListener('click', function () { if (lenis) lenis.stop(); }); });
  }

  playIntro();
  window.addEventListener('load', function () {
    if (window.ScrollTrigger && scrollAnimsOn) ScrollTrigger.refresh();
    /* טעינה מוקדמת של תמונות הפתיח כדי שהמעבר ביניהן לא ייתקע */
    $$('.hero-media .slide img').forEach(function (im) { im.loading = 'eager'; if (im.decode) im.decode().catch(function () {}); });
  });
})();
