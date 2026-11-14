/* אגם של טעמים – סוכריות מרחפות, כותרת קינטית, קרוסלה תלת-ממדית, רצועות נעות */
(function () {
  'use strict';
  var D = document, R = D.documentElement, W = window;
  var $ = function (s, c) { return (c || D).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || D).querySelectorAll(s)); };
  var hasG = typeof W.gsap !== 'undefined' && typeof W.ScrollTrigger !== 'undefined';
  var MO = R.classList.contains('mo') && hasG;
  if (!MO) { R.classList.remove('mo'); R.classList.remove('intro-on'); R.classList.add('static'); }
  var FINE = W.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var NM0 = R.classList.contains('a11y-nomotion');
  var WA = 'https://wa.me/972502282850?text=';
  var vw = function () { return R.clientWidth || W.innerWidth || 1280; };
  var vh = function () { return W.innerHeight || R.clientHeight || 720; };
  var rnd = function (a, b) { return a + Math.random() * (b - a); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lenis = null;

  var yEl = $('#year'); if (yEl) yEl.textContent = new Date().getFullYear();

  /* טקסט מעגלי בחותמת – אות אחר אות, נגד כיוון השעון כדי שייקרא מימין לשמאל */
  (function () {
    var g = $('#badgeTxt'); if (!g) return;
    var s = 'הטעם שלא תשכחו ✺ אגם של טעמים ✺ ', out = '';
    for (var i = 0; i < s.length; i++) if (s[i] !== ' ') out += '<text transform="rotate(' + (-i * 360 / s.length).toFixed(2) + ') translate(0 -66)">' + s[i] + '</text>';
    g.innerHTML = out;
  })();

  /* ---------- תפריט ---------- */
  var hdr = $('#hdr'), mbtn = $('#mbtn'), nav = $('#nav');
  function setMenu(o) {
    nav.classList.toggle('open', o);
    mbtn.setAttribute('aria-expanded', o ? 'true' : 'false');
    mbtn.setAttribute('aria-label', o ? 'סגירת תפריט' : 'פתיחת תפריט');
    if (lenis) { if (o) lenis.stop(); else lenis.start(); }
  }
  mbtn.addEventListener('click', function () { setMenu(mbtn.getAttribute('aria-expanded') !== 'true'); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  D.addEventListener('keydown', function (e) { if (e.key === 'Escape' && mbtn.getAttribute('aria-expanded') === 'true') { setMenu(false); mbtn.focus(); } });
  var navLinks = $$('.nav a[href^="#"]');
  if ('IntersectionObserver' in W) {
    var nio = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (!x.isIntersecting) return;
        navLinks.forEach(function (l) { if (l.getAttribute('href') === '#' + x.target.id) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current'); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(function (l) { var t = $(l.getAttribute('href')); if (t) nio.observe(t); });
  }
  D.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]'); if (!a) return;
    var id = a.getAttribute('href'), t = id.length > 1 ? $(id) : null; if (!t) return;
    e.preventDefault();
    var top = id === '#top' ? 0 : t.getBoundingClientRect().top + W.scrollY - 10;
    if (lenis) lenis.scrollTo(top, { duration: 1.3 }); else W.scrollTo(0, top);
    if (id !== '#top') { if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }
  });

  /* ---------- גלריה מוגדלת ---------- */
  var lb = $('#lb'), lastTile = null;
  $('#galRows').addEventListener('click', function (e) {
    var b = e.target.closest('.tile'); if (!b || !lb.showModal) return;
    lastTile = b;
    var im = $('img', lb); im.src = b.dataset.full; im.alt = b.dataset.cap;
    $('p', lb).textContent = b.dataset.cap;
    lb.showModal();
  });
  lb.setAttribute('data-lenis-prevent', '');
  $('button', lb).addEventListener('click', function () { lb.close(); });
  lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
  lb.addEventListener('close', function () { if (lastTile && lastTile.focus) lastTile.focus(); });

  /* ---------- טופס ← קישור וואטסאפ ---------- */
  (function () {
    var send = $('#waSend'), status = $('#formStatus'), dateEl = $('#f-date'), t = new Date();
    dateEl.min = t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2);
    var rules = {
      'f-name': function (v) { return v.trim().length < 2 ? 'נא למלא שם מלא (לפחות שתי אותיות).' : ''; },
      'f-product': function (v) { return !v ? 'נא לבחור מה תרצו להזמין.' : ''; }
    };
    function check(id) {
      var el = $('#' + id), msg = rules[id](el.value);
      $('#e-' + id.slice(2)).textContent = msg;
      if (msg) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
      return !msg;
    }
    function build() {
      var lines = ['היי, אשמח להזמין מאגם של טעמים 🍰', 'שם: ' + $('#f-name').value.trim(), 'הזמנה: ' + $('#f-product').value];
      if (dateEl.value) { var d = dateEl.value.split('-'); lines.push('לתאריך: ' + d[2] + '.' + d[1] + '.' + d[0]); }
      var n = $('#f-notes').value.trim(); if (n) lines.push('פרטים: ' + n);
      send.href = WA + encodeURIComponent(lines.join('\n'));
    }
    Object.keys(rules).forEach(function (id) {
      $('#' + id).addEventListener('blur', function () { check(id); });
      $('#' + id).addEventListener('input', function () { if ($('#' + id).hasAttribute('aria-invalid')) check(id); });
    });
    $('#orderForm').addEventListener('input', build);
    $('#orderForm').addEventListener('submit', function (e) { e.preventDefault(); send.click(); });
    send.addEventListener('click', function (e) {
      var bad = Object.keys(rules).filter(function (id) { return !check(id); });
      if (bad.length) { e.preventDefault(); status.textContent = ''; $('#' + bad[0]).focus(); return; }
      build();
      status.textContent = 'ההודעה מוכנה. אם וואטסאפ לא נפתח, אפשר לשלוח הודעה למספר 050-2282850.';
    });
  })();

  /* העתקת מספר הטלפון */
  (function () {
    var b = $('#copyPhone'), st = $('#copyStat'), txt = $('#phoneTxt'); if (!b) return;
    b.addEventListener('click', function () {
      var ok = function () { b.textContent = 'הועתק ✓'; st.textContent = 'מספר הטלפון הועתק'; setTimeout(function () { b.textContent = 'העתקת המספר'; }, 2200); };
      var fallback = function () { var r = D.createRange(); r.selectNodeContents(txt); var s = W.getSelection(); s.removeAllRanges(); s.addRange(r); st.textContent = 'המספר סומן, אפשר להעתיק אותו'; };
      try { navigator.clipboard.writeText('0502282850').then(ok, fallback); } catch (e) { fallback(); }
    });
  })();

  /* שינוי "עצירת אנימציות" בסרגל הנגישות – טעינה מחדש במצב המתאים */
  D.addEventListener('a11y-change', function (e) { if (e.detail && !!e.detail.nomotion !== NM0) W.location.reload(); });

  if (!MO) return;

  /* ==========================================================
     מכאן – תנועה
     ========================================================== */
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  if (W.Lenis) { lenis = new Lenis({ lerp: .1, smoothWheel: true, wheelMultiplier: .95 }); lenis.on('scroll', ScrollTrigger.update); }

  var mx = -9999, my = -9999, mAct = -99, tNow = 0, vel = 0, lastY = W.scrollY;
  W.addEventListener('pointermove', function (e) { if (e.pointerType === 'touch') return; mx = e.clientX; my = e.clientY; mAct = tNow; }, { passive: true });
  D.addEventListener('pointerleave', function () { mx = my = -9999; });

  /* ---------- סוכריות מרחפות ---------- */
  var sp = $('#sp'), sx = sp.getContext('2d'), SW = 0, SH = 0, DPR = 1, bits = [];
  var COL = ['#E8245F', '#FFD447', '#FF7FA5', '#7BD3B5', '#FFFFFF', '#2A120B'];
  function spSize() { DPR = Math.min(W.devicePixelRatio || 1, 2); SW = vw(); SH = vh(); sp.width = Math.round(SW * DPR); sp.height = Math.round(SH * DPR); }
  function spInit() {
    var n = Math.round(clamp(SW * SH / 15000, 34, 110)); bits = [];
    for (var i = 0; i < n; i++) {
      var bx = rnd(-.35, .35), by = rnd(-.35, .2);
      bits.push({ x: rnd(0, SW), y: rnd(0, SH), vx: bx, vy: by, bx: bx, by: by, a: rnd(0, 6.28), va: rnd(-.012, .012), l: rnd(8, 19), w: rnd(3.2, 6), z: rnd(.35, 1.4), c: COL[i % COL.length] });
    }
  }
  function spDraw(k, dy) {
    sx.setTransform(DPR, 0, 0, DPR, 0, 0); sx.clearRect(0, 0, SW, SH); sx.lineCap = 'round'; sx.globalAlpha = .92;
    for (var i = 0; i < bits.length; i++) {
      var b = bits[i], dx = b.x - mx, dyy = b.y - my, d2 = dx * dx + dyy * dyy;
      if (d2 < 25600) { var d = Math.sqrt(d2) || 1, f = (160 - d) / 160 * 1.9; b.vx += dx / d * f; b.vy += dyy / d * f; b.va += rnd(-.03, .03); }
      b.vx += (b.bx - b.vx) * .035; b.vy += (b.by - b.vy) * .035; b.va *= .985;
      b.x += b.vx * k; b.y += b.vy * k - dy * b.z * .32; b.a += b.va * k + dy * .0022 * b.z;
      if (b.x < -30) b.x = SW + 30; else if (b.x > SW + 30) b.x = -30;
      if (b.y < -30) b.y = SH + 30; else if (b.y > SH + 30) b.y = -30;
      var c = Math.cos(b.a) * b.l * .5, s = Math.sin(b.a) * b.l * .5;
      sx.strokeStyle = b.c; sx.lineWidth = b.w; sx.beginPath(); sx.moveTo(b.x - c, b.y - s); sx.lineTo(b.x + c, b.y + s); sx.stroke();
    }
  }
  spSize(); spInit();

  /* ---------- כותרת קינטית: עובי האות משתנה לפי מרחק מהעכבר ---------- */
  var kins = [];
  $$('[data-kin]').forEach(function (h) {
    var chs = [];
    $$('.kl', h).forEach(function (line) {
      var t = line.textContent; line.textContent = '';
      t.split('').forEach(function (c) {
        if (c === ' ') { line.appendChild(D.createTextNode(' ')); return; }
        var s = D.createElement('span'); s.className = 'ch'; s.textContent = c; s.setAttribute('aria-hidden', 'true');
        line.appendChild(s); chs.push({ el: s, w: 900, last: 900 });
      });
    });
    var k = { el: h, chs: chs, vis: true }; kins.push(k);
    if ('IntersectionObserver' in W) new IntersectionObserver(function (en) { k.vis = en[0].isIntersecting; }).observe(h);
  });
  function kinDraw(time) {
    var useMouse = FINE && time - mAct < 2.5, rad = SW * .3;
    for (var j = 0; j < kins.length; j++) {
      var k = kins[j]; if (!k.vis) continue;
      for (var i = 0; i < k.chs.length; i++) {
        var c = k.chs[i], target;
        if (useMouse) { var r = c.el.getBoundingClientRect(), d = Math.hypot(mx - (r.left + r.width / 2), my - (r.top + r.height / 2)), t = clamp(1 - d / rad, 0, 1); target = 220 + 680 * t; }
        else target = 580 + 320 * Math.sin(time * 2.1 - i * .6);
        c.w += (target - c.w) * .13;
        var v = Math.round(c.w / 10) * 10;
        if (v !== c.last) { c.last = v; c.el.style.fontWeight = v; }
      }
    }
  }

  /* ---------- רצועות נעות ---------- */
  var mqs = [], galPaused = false, galRows = $('#galRows');
  function mqBuild() {
    mqs = [];
    $$('.mq').forEach(function (m) {
      var t = $('.mq-t', m);
      $$('[data-clone]', t).forEach(function (c) { c.remove(); });
      var orig = $$(':scope > *', t), w = t.getBoundingClientRect().width; if (!w) return;
      var reps = Math.ceil(vw() * 1.3 / w) + 1;
      for (var r = 0; r < reps; r++) orig.forEach(function (o) {
        var c = o.cloneNode(true); c.setAttribute('data-clone', ''); c.setAttribute('aria-hidden', 'true');
        if (c.tagName === 'BUTTON') c.tabIndex = -1;
        t.appendChild(c);
      });
      var sp0 = +m.dataset.mq || 50;
      mqs.push({ t: t, w: w, x: sp0 < 0 ? -w : 0, sp: sp0, gal: galRows.contains(m) });
    });
  }
  function mqDraw(dt) {
    var boost = 1 + Math.min(7, Math.abs(vel) * .14), sk = clamp(vel * .12, -7, 7);
    for (var i = 0; i < mqs.length; i++) {
      var m = mqs[i];
      if (!(m.gal && galPaused)) {
        m.x -= m.sp * boost * dt;
        if (m.x <= -m.w) m.x += m.w; else if (m.x > 0) m.x -= m.w;
      }
      m.t.style.transform = 'translate3d(' + m.x.toFixed(1) + 'px,0,0) skewX(' + (m.gal && galPaused ? 0 : sk).toFixed(2) + 'deg)';
    }
  }
  var gp = $('#galPause'), userPause = false, focusPause = false;
  function syncPause() { galPaused = userPause || focusPause; }
  gp.addEventListener('click', function () {
    userPause = !userPause; gp.setAttribute('aria-pressed', userPause ? 'true' : 'false'); gp.textContent = userPause ? 'הפעלת התנועה' : 'עצירת התנועה'; syncPause();
  });
  galRows.addEventListener('focusin', function (e) {
    focusPause = true; syncPause();
    var b = e.target.closest('.tile'); if (!b) return;
    var r = b.getBoundingClientRect(), m = mqs.filter(function (q) { return q.t.contains(b); })[0];
    if (m && (r.left < 0 || r.right > vw())) m.x += vw() / 2 - (r.left + r.width / 2);
  });
  galRows.addEventListener('focusout', function () { focusPause = false; syncPause(); });

  /* ---------- סמן ---------- */
  var cur = $('.cur'), cx = 0, cy = 0, cs = 1, csT = 1;
  if (FINE) {
    D.addEventListener('pointerover', function (e) { csT = e.target.closest && e.target.closest('a,button,summary,.pc,input,select,textarea') ? 3.4 : 1; });
  }
  function curDraw() {
    if (!FINE || mx < -999) { cur.style.opacity = 0; return; }
    cx += (mx - cx) * .22; cy += (my - cy) * .22; cs += (csT - cs) * .18;
    cur.style.opacity = 1; cur.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0) scale(' + cs.toFixed(2) + ')';
  }

  /* ---------- לולאה אחת לכל התנועה ---------- */
  function frame(time, delta) {
    tNow = time;
    if (lenis) lenis.raf(time * 1000);
    var y = W.scrollY, dy = y - lastY; lastY = y;
    if (Math.abs(dy) > 400) dy = 0;
    vel += (dy - vel) * .18;
    var dt = Math.min(delta, 60) / 1000;
    spDraw(dt * 60, dy); kinDraw(time); mqDraw(dt); curDraw(); springStep(dt); if (reelDraw) reelDraw();
  }
  gsap.ticker.add(frame);
  /* נקודת בדיקה: הרצת פריים ידנית כשהדפדפן מקפיא את השעון */
  W.__agam = { step: function (time, delta) { frame(time, delta); if (introTick && !introDone) introTick(time, delta); } };

  /* ---------- כניסת ה-Hero ---------- */
  function heroIn() {
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.hero .ch', { yPercent: 130, rotate: function () { return rnd(-28, 28); }, opacity: 0, duration: 1.05, ease: 'back.out(1.7)', stagger: .055 }, 0)
      .from('.pill', { yPercent: -260, duration: .9, clearProps: 'transform' }, .2)
      .from('.hero-top .chip', { y: -30, opacity: 0, rotate: -8, duration: .6, stagger: .08 }, .25)
      .from('.hero .cap', { scale: 0, rotation: '+=120', duration: 1.15, ease: 'back.out(1.5)', stagger: .13 }, .3)
      .from('.hero-row > *', { y: 44, opacity: 0, duration: .8, stagger: .12 }, .6)
      .from('.badge', { scale: 0, rotation: -200, duration: 1, ease: 'back.out(2)' }, .75)
      .add(function () {
        $$('.hero .cap').forEach(function (c, i) { if (c._held) return; c._float = gsap.to(c, { y: i % 2 ? 16 : -16, duration: 2.6 + i * .5, ease: 'sine.inOut', yoyo: true, repeat: -1 }); });
      });
  }

  /* ---------- תמונות שאפשר לגרור ולזרוק: מעקב 1:1 מנקודת האחיזה, מסירת מהירות, וקפיץ שמחזיר הביתה ---------- */
  var springs = [];
  function initThrow() {
    if (!FINE) return;
    $$('.hero .cap').forEach(function (c) {
      var s = { el: c, x: 0, y: 0, vx: 0, vy: 0, drag: false, gx: 0, gy: 0, hist: [] };
      c.classList.add('grab');
      c.addEventListener('pointerdown', function (e) {
        if (e.button) return;
        c._held = true;
        if (c._float) { c._float.kill(); c._float = null; }
        s.x = +gsap.getProperty(c, 'x') || 0; s.y = +gsap.getProperty(c, 'y') || 0;
        c.setPointerCapture(e.pointerId);
        s.drag = true; s.vx = s.vy = 0; s.gx = e.clientX - s.x; s.gy = e.clientY - s.y; s.hist = [[e.clientX, e.clientY, performance.now()]];
        c.classList.add('held');
        if (springs.indexOf(s) < 0) springs.push(s);
        e.preventDefault();
      });
      c.addEventListener('pointermove', function (e) {
        if (!s.drag) return;
        s.x = e.clientX - s.gx; s.y = e.clientY - s.gy;
        s.hist.push([e.clientX, e.clientY, performance.now()]); if (s.hist.length > 6) s.hist.shift();
        gsap.set(c, { x: s.x, y: s.y });
      });
      var up = function () {
        if (!s.drag) return; s.drag = false; c.classList.remove('held');
        var h = s.hist, a = h[0], b = h[h.length - 1], dt = Math.max(16, b[2] - a[2]) / 1000;
        if (performance.now() - b[2] > 90) { s.vx = s.vy = 0; } else { s.vx = (b[0] - a[0]) / dt; s.vy = (b[1] - a[1]) / dt; }
      };
      c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
    });
  }
  function springStep(dt) {
    if (!springs.length) return;
    var w = 2 * Math.PI / .5, k = w * w, cd = 2 * .55 * w;     /* קפיץ עם תנופה: מעט קפיצי, כי קדמה לו זריקה */
    for (var i = springs.length - 1; i >= 0; i--) {
      var s = springs[i]; if (s.drag) continue;
      for (var n = 0; n < 3; n++) { var h = dt / 3; s.vx += (-k * s.x - cd * s.vx) * h; s.vy += (-k * s.y - cd * s.vy) * h; s.x += s.vx * h; s.y += s.vy * h; }
      if (Math.abs(s.x) + Math.abs(s.y) < .4 && Math.abs(s.vx) + Math.abs(s.vy) < 5) { s.x = s.y = 0; springs.splice(i, 1); }
      gsap.set(s.el, { x: s.x, y: s.y });
    }
  }

  /* ---------- סרטון גלילה: 120 פריימים שנוצרו ב-HyperFrames ומצוירים על קנבס לפי מיקום הגלילה ---------- */
  var reelDraw = null;
  function initReel() {
    var pin = $('#reelPin'), cv = $('#reelCv'), still = $('#reelStill'), bar = $('#reelBar'); if (!pin || !cv) return;
    var ctx = cv.getContext('2d'), N = 120, imgs = new Array(N), okF = new Array(N), target = 0, curF = 0, drawn = -1, cw = 0, ch = 0;
    var src = function (i) { return 'assets/reel/f' + ('00' + (i + 1)).slice(-3) + '.webp'; };
    function size() {
      var d = Math.min(W.devicePixelRatio || 1, 1.5), w = Math.round(cv.clientWidth * d), hh = Math.round(cv.clientHeight * d);
      if (w && hh && (cv.width !== w || cv.height !== hh)) { cv.width = w; cv.height = hh; drawn = -1; }
      cw = cv.width; ch = cv.height;
    }
    function load(i) { if (imgs[i]) return; var im = new Image(); imgs[i] = im; im.onload = function () { okF[i] = true; if (drawn < 0) drawn = -2; }; im.src = src(i); }
    function nearest(i) { for (var d = 0; d < N; d++) { if (okF[i - d]) return i - d; if (okF[i + d]) return i + d; } return -1; }
    reelDraw = function () {
      curF += (target - curF) * .22;
      var i = nearest(clamp(Math.round(curF), 0, N - 1)); if (i < 0 || i === drawn || !cw) return;
      var im = imgs[i], s = Math.max(cw / im.naturalWidth, ch / im.naturalHeight), w = im.naturalWidth * s, hh = im.naturalHeight * s;
      ctx.drawImage(im, (cw - w) / 2, (ch - hh) / 2, w, hh);
      if (drawn < 0 && still) still.classList.add('off');
      drawn = i;
    };
    size(); load(0); load(N - 1);
    /* טעינה מדורגת: קודם כל פריים שמיני, ואז ממלאים את הרווחים */
    var queue = [];
    for (var stp = 8; stp >= 1; stp = stp >> 1) for (var q = 0; q < N; q += stp) if (queue.indexOf(q) < 0) queue.push(q);
    var qi = 0, pump = function () { var n = 0; while (qi < queue.length && n < 6) { load(queue[qi++]); n++; } if (qi < queue.length) setTimeout(pump, 110); };
    if (D.readyState === 'complete') pump(); else W.addEventListener('load', pump);
    ScrollTrigger.create({
      trigger: pin, start: 'top top', end: function () { return '+=' + Math.round(vh() * 3.2); }, pin: true, invalidateOnRefresh: true,
      onRefresh: size,
      onUpdate: function (self) { target = self.progress * (N - 1); if (bar) bar.style.transform = 'scaleX(' + self.progress.toFixed(4) + ')'; }
    });
    W.addEventListener('resize', size);
  }

  /* ---------- פיצול כותרות למילים ---------- */
  function split(el) {
    var txt = el.textContent.trim(); el.setAttribute('aria-label', txt);
    el.innerHTML = txt.split(/\s+/).map(function (w) { return '<span class="wd" aria-hidden="true"><span>' + w + '</span></span>'; }).join(' ');
    return $$('.wd > span', el);
  }

  /* ---------- קרוסלה תלת-ממדית ---------- */
  function initRing() {
    var pin = $('#ringPin'), ring = $('#ring'), cards = $$('.pc', ring), n = cards.length, step = 360 / n, rad = 300, curI = -1, st;
    var data = cards.map(function (c) { return { t: $('h3', c).textContent, p: $('.pc-txt p', c).textContent, g: $('.tag', c).textContent, o: c.dataset.order }; });
    R.classList.add('ring-on');
    function size() {
      var mobile = vw() < 900, cw = Math.round(mobile ? Math.min(250, vw() * .56) : clamp(vw() * .2, 220, 310)), ch = Math.round(Math.min(cw * 1.34, vh() * (mobile ? .36 : .6)));
      cw = Math.round(Math.min(cw, ch / 1.2));
      rad = Math.round(cw / 2 / Math.tan(Math.PI / n)) + (mobile ? 22 : 54);
      pin.style.setProperty('--rw', cw + 'px'); pin.style.setProperty('--rh', ch + 'px');
      cards.forEach(function (c, i) { c.style.transform = 'rotateY(' + (-i * step).toFixed(3) + 'deg) translateZ(' + rad + 'px)'; });
    }
    function render(a) {
      ring.style.transform = 'translateZ(' + (-rad) + 'px) rotateY(' + a.toFixed(3) + 'deg)';
      for (var i = 0; i < n; i++) {
        var d = ((a - i * step) % 360 + 540) % 360 - 180;
        cards[i].style.setProperty('--dim', (clamp((1 - Math.cos(d * Math.PI / 180)) * 1.5, 0, .82)).toFixed(3));
      }
    }
    function show(i, quick) {
      if (i === curI) return; var dir = i > curI ? 1 : -1; curI = i; var d = data[i];
      $('#rdNum').textContent = '0' + (i + 1); $('#rNow').textContent = '0' + (i + 1);
      $('#rdTitle').textContent = d.t; $('#rdText').textContent = d.p; $('#rdTag').textContent = d.g;
      $('#rdOrder').href = WA + encodeURIComponent('היי, אשמח להזמין מאגם של טעמים: ' + d.o);
      if (quick) return;
      gsap.fromTo('#rdTitle', { yPercent: 115 * dir, rotate: 5 * dir }, { yPercent: 0, rotate: 0, duration: .55, ease: 'power3.out', overwrite: true });
      gsap.fromTo('#rdText,#rdTag', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .45, stagger: .06, overwrite: true });
    }
    function go(i) {
      i = clamp(i, 0, n - 1); if (!st) return;
      var y = st.start + (st.end - st.start) * (i / (n - 1)) + 1;
      if (lenis) lenis.scrollTo(y, { duration: .9 }); else W.scrollTo(0, y);
    }
    size(); render(0); show(0, true);
    st = ScrollTrigger.create({
      trigger: pin, start: 'top top', end: function () { return '+=' + Math.round(vh() * .5 * (n - 1)); }, pin: true, invalidateOnRefresh: true,
      onRefresh: function () { size(); },
      onUpdate: function (self) {
        var seg = self.progress * (n - 1), i = Math.min(n - 2, Math.floor(seg)), f = seg - i;
        f = f < .5 ? 4 * f * f * f : 1 - Math.pow(-2 * f + 2, 3) / 2;      /* האטה ליד כל מוצר */
        render((i + f) * step);
        show(Math.round(seg));
      }
    });
    $('#rPrev').addEventListener('click', function () { go(curI - 1); });
    $('#rNext').addEventListener('click', function () { go(curI + 1); });
    var dragged = false;
    cards.forEach(function (c, i) { c.addEventListener('click', function () { if (!dragged) go(i); }); });

    /* גרירה: מעקב 1:1, והקרנת התנופה לנקודת העצירה כדי לבחור לאיזה מוצר לנחות */
    var stage = $('.ring-stage', pin), dr = null;
    var seg = function () { return (st.end - st.start) / (n - 1); };
    var perPx = function () { return seg() / (rad * step * Math.PI / 180); };
    stage.addEventListener('pointerdown', function (e) { if (e.button || !st) return; dragged = false; dr = { x: e.clientX, y0: W.scrollY, id: e.pointerId, moved: false, hist: [[e.clientX, performance.now()]] }; });
    stage.addEventListener('pointermove', function (e) {
      if (!dr) return; var dx = e.clientX - dr.x;
      if (!dr.moved) { if (Math.abs(dx) < 10) return; dr.moved = dragged = true; try { stage.setPointerCapture(dr.id); } catch (er) {} if (lenis) lenis.stop(); stage.classList.add('held'); }
      dr.hist.push([e.clientX, performance.now()]); if (dr.hist.length > 6) dr.hist.shift();
      W.scrollTo(0, clamp(dr.y0 + dx * perPx(), st.start + 1, st.end - 1));
    });
    var rUp = function () {
      if (!dr) return; var d = dr; dr = null; stage.classList.remove('held');
      if (!d.moved) return;
      var h = d.hist, a = h[0], b = h[h.length - 1], dt = Math.max(16, b[1] - a[1]) / 1000, v = performance.now() - b[1] > 90 ? 0 : (b[0] - a[0]) / dt;
      var proj = (v / 1000) * .992 / (1 - .992);                       /* הקרנת תנופה בדעיכה מעריכית */
      var target = clamp(Math.round((W.scrollY + proj * perPx() - st.start) / seg()), 0, n - 1);
      if (lenis) lenis.start();
      go(target);
      setTimeout(function () { dragged = false; }, 60);
    };
    stage.addEventListener('pointerup', rUp); stage.addEventListener('pointercancel', rUp);
  }

  /* ---------- אנימציות גלילה ---------- */
  var scrollReady = false;
  function initScroll() {
    if (scrollReady) return; scrollReady = true;
    var touch = W.matchMedia('(pointer: coarse)').matches, SC = touch ? .5 : true;
    var once = function (el, start) { return { trigger: el, start: start || 'top 88%' }; };

    /* ניווט שנעלם בגלילה למטה */
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: function (s) {
      var hide = s.direction === 1 && W.scrollY > 320 && mbtn.getAttribute('aria-expanded') !== 'true';
      hdr.classList.toggle('hide', hide);
    } });

    /* Hero */
    var hT = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: SC };
    $$('.hero .cap').forEach(function (c) { gsap.to(c, { yPercent: -(+c.dataset.depth || 20) * 1.6, rotation: '+=' + ((+c.dataset.depth || 20) > 0 ? 24 : -24), ease: 'none', scrollTrigger: hT }); });
    gsap.to('.hero .kin', { yPercent: 14, ease: 'none', scrollTrigger: hT });
    if (FINE) {
      var qs = $$('.hero .cap img').map(function (im) { gsap.set(im, { scale: 1.22 }); return { x: gsap.quickTo(im, 'x', { duration: .7, ease: 'power3' }), y: gsap.quickTo(im, 'y', { duration: .7, ease: 'power3' }) }; });
      $('.hero').addEventListener('pointermove', function (e) {
        var px = e.clientX / vw() - .5, py = e.clientY / vh() - .5;
        qs.forEach(function (q, i) { var d = [26, -34, 44][i] || 20; q.x(px * d); q.y(py * d); });
      });
    }

    /* כותרות */
    $$('[data-split]').forEach(function (h) {
      gsap.from(split(h), { yPercent: 118, rotate: 7, duration: .95, ease: 'power4.out', stagger: .08, immediateRender: false, scrollTrigger: once(h) });
    });
    $$('.eyebrow').forEach(function (e) { gsap.from(e, { scale: 0, rotation: -30, duration: .7, ease: 'back.out(2.4)', immediateRender: false, scrollTrigger: once(e, 'top 92%') }); });
    $$('.rv').forEach(function (e) { gsap.from(e, { y: 44, opacity: 0, duration: .85, ease: 'power3.out', immediateRender: false, scrollTrigger: once(e, 'top 92%') }); });
    $$('.pop').forEach(function (e) {
      var i = Array.prototype.indexOf.call(e.parentNode.children, e);
      gsap.from(e, { scale: .55, rotation: (i % 2 ? 1 : -1) * 12, y: 60, opacity: 0, duration: .85, delay: (i % 3) * .09, ease: 'back.out(1.7)', immediateRender: false, scrollTrigger: once(e, 'top 94%') });
    });

    /* אודות */
    var q = $('[data-words]');
    if (q) {
      var txt = q.textContent.trim(); q.setAttribute('aria-label', txt);
      q.innerHTML = txt.split(/\s+/).map(function (w) { return '<span aria-hidden="true">' + w + '</span>'; }).join(' ');
      gsap.fromTo($$('span', q), { color: '#C2A68F' }, { color: '#2A120B', stagger: .12, ease: 'none', scrollTrigger: { trigger: q, start: 'top 84%', end: 'bottom 48%', scrub: SC } });
    }
    $$('[data-par]').forEach(function (c) { gsap.fromTo(c, { yPercent: -(+c.dataset.par) * .25 }, { yPercent: (+c.dataset.par) * .25, rotation: '+=' + ((+c.dataset.par) > 0 ? 10 : -10), ease: 'none', scrollTrigger: { trigger: '.about-a', start: 'top bottom', end: 'bottom top', scrub: SC } }); });
    $$('.stk').forEach(function (s, i) { gsap.from(s, { scale: 0, rotation: i ? 60 : -60, duration: .8, delay: .2 + i * .15, ease: 'back.out(2.6)', immediateRender: false, scrollTrigger: once('.about-a', 'top 70%') }); });

    /* קלפי השלבים – הטיה תלת-ממדית */
    if (FINE) $$('.step').forEach(function (s) {
      s.addEventListener('pointermove', function (e) {
        var r = s.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        gsap.to(s, { rotationY: px * 16, rotationX: -py * 14, transformPerspective: 700, duration: .4, ease: 'power2.out', overwrite: 'auto' });
      });
      s.addEventListener('pointerleave', function () { gsap.to(s, { rotationY: 0, rotationX: 0, duration: .9, ease: 'elastic.out(1,.5)', overwrite: 'auto' }); });
    });

    /* כפתורים מגנטיים */
    if (FINE) $$('.mag').forEach(function (b) {
      b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * .32, y: (e.clientY - r.top - r.height / 2) * .32, duration: .35, ease: 'power3.out', overwrite: 'auto' }); });
      b.addEventListener('pointerleave', function () { gsap.to(b, { x: 0, y: 0, duration: .8, ease: 'elastic.out(1,.4)', overwrite: 'auto' }); });
    });

    /* שובל תמונות אחרי העכבר */
    var mani = $('.mani'), trail = $('#trail');
    if (FINE && mani && trail) {
      var pool = [], ti = 0, lx = -999, ly = -999, srcs = [1, 3, 6, 2, 4, 7, 9];
      for (var i = 0; i < 8; i++) { var im = new Image(); im.alt = ''; im.decoding = 'async'; im.src = 'assets/gallery/' + srcs[i % srcs.length] + '-m.webp'; trail.appendChild(im); pool.push(im); }
      mani.addEventListener('pointermove', function (e) {
        var r = mani.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        if (Math.hypot(x - lx, y - ly) < 120) return; lx = x; ly = y;
        var im = pool[ti++ % pool.length], rot = rnd(-28, 28);
        gsap.killTweensOf(im);
        gsap.set(im, { x: x - im.offsetWidth / 2, y: y - im.offsetHeight / 2, rotation: rot - 30, scale: .2, opacity: 1 });
        gsap.to(im, { scale: 1, rotation: rot, duration: .5, ease: 'back.out(2.2)' });
        gsap.to(im, { y: '+=190', rotation: rot + 40, opacity: 0, duration: .75, delay: .6, ease: 'power2.in' });
      });
    }

    /* שאלות – פתיחה רכה */
    $$('.faq-list details').forEach(function (d) {
      d.addEventListener('toggle', function () { if (d.open) gsap.from($('.ans', d), { height: 0, opacity: 0, duration: .45, ease: 'power3.out', clearProps: 'height' }); });
    });

    gsap.from('.form', { y: 90, rotation: 3, opacity: 0, duration: 1, ease: 'back.out(1.4)', immediateRender: false, scrollTrigger: once('.form', 'top 90%') });
    gsap.from('.foot .ch', { yPercent: 120, opacity: 0, rotate: function () { return rnd(-20, 20); }, duration: .9, ease: 'back.out(1.7)', stagger: .05, immediateRender: false, scrollTrigger: once('.foot', 'top 85%') });

    initReel();
    initRing();
    initThrow();
    mqBuild();
    ScrollTrigger.refresh();
  }

  /* ==========================================================
     פתיחה: הסוכריות מתאספות לשם "אגם של טעמים" ומתפוצצות החוצה
     ========================================================== */
  var intro = $('#intro'), introOn = R.classList.contains('intro-on'), introDone = !introOn, introTl = null, introTick = null;
  function lock(on) { [hdr, $('#main'), $('.foot'), $('.wa'), $('#a11yBtn'), $('#a11yPanel')].forEach(function (n) { if (n) { if (on) n.setAttribute('inert', ''); else n.removeAttribute('inert'); } }); }
  function finishIntro() {
    if (introDone) return; introDone = true;
    if (introTl) introTl.kill(); if (introTick) gsap.ticker.remove(introTick);
    R.classList.remove('intro-on'); lock(false);
    try { sessionStorage.setItem('agam-intro3', '1'); } catch (e) {}
    ScrollTrigger.refresh();
  }
  function skipIntro() {
    if (introDone) return;
    try { $('#introVid').pause(); } catch (e) {}
    heroIn();
    gsap.to(intro, { opacity: 0, duration: .4, onComplete: function () { finishIntro(); $('#main').focus({ preventScroll: true }); } });
  }
  function playIntro() {
    /* סרטון הפתיחה נוצר ב-HyperFrames: גרסה לרוחב למחשב וגרסה אנכית לנייד */
    W.scrollTo(0, 0); lock(true);
    var v = $('#introVid'), started = false, ending = false, port = vh() > vw() * 1.05;
    var end = function () {
      if (introDone || ending) return; ending = true;
      heroIn();
      gsap.to(intro, { opacity: 0, duration: .6, ease: 'power2.out', onComplete: function () { try { v.pause(); } catch (e) {} finishIntro(); } });
    };
    v.addEventListener('playing', function () { started = true; });
    v.addEventListener('timeupdate', function () { if (v.currentTime > 6.6) end(); });
    v.addEventListener('ended', end);
    v.addEventListener('error', end);
    v.src = 'assets/video/' + (port ? 'intro-port.mp4' : 'intro-land.mp4');
    try { var pr = v.play(); if (pr && pr.catch) pr.catch(end); } catch (e) { end(); }
    setTimeout(function () { if (!started) end(); }, 4000);
  }

  $('#iSkip').addEventListener('click', skipIntro);
  D.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !introDone) skipIntro(); });
  W.addEventListener('resize', function () { spSize(); if (scrollReady) mqBuild(); });
  W.addEventListener('load', function () { if (scrollReady) { mqBuild(); ScrollTrigger.refresh(); } });

  function boot() {
    initScroll();
    if (introOn) { playIntro(); setTimeout(function () { if (!introDone) { intro.style.display = 'none'; finishIntro(); } }, 15000); }
    else heroIn();
  }
  var booted = false, go = function () { if (!booted) { booted = true; boot(); } };
  if (D.fonts && D.fonts.load) { Promise.all([D.fonts.load('700 100px Karantina', 'אגם של טעמים'), D.fonts.load('900 100px Heebo', 'אגם')]).then(go, go); setTimeout(go, 1600); }
  else go();
})();
