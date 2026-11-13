/* אגם של טעמים – עמוד הבית: פתיחה, תמונה נוזלית, אנימציות גלילה */
(function () {
  'use strict';
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var hasGsap = typeof window.gsap !== 'undefined';
  var prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function motionOff() { return prefersReduce || root.classList.contains('a11y-nomotion') || !hasGsap; }
  var WA = 'https://wa.me/972502282850?text=';

  var y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  /* ---------- כותרת ותפריט ---------- */
  var header = $('.site-header'), toggle = $('.menu-toggle'), nav = $('#nav'), lenis = null;
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 24); }
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  function setMenu(open) {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'סגירת תפריט' : 'פתיחת תפריט');
    if (lenis) { if (open) lenis.stop(); else lenis.start(); }
  }
  toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
  });

  var links = $$('.nav-link[href^="#"]');
  if ('IntersectionObserver' in window) {
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

  /* קישורי "להזמין את זה" – הודעת וואטסאפ מוכנה לכל מוצר */
  $$('[data-order]').forEach(function (a) {
    a.href = WA + encodeURIComponent('היי, אשמח להזמין מאגם של טעמים: ' + a.dataset.order);
  });

  /* ---------- גלריה: הגדלת תמונה ---------- */
  var lb = $('#lightbox'), lastTile = null;
  $$('#galleryGrid .tile button').forEach(function (b) {
    b.addEventListener('click', function () {
      if (!lb || !lb.showModal) return;
      lastTile = b;
      var li = $('img', lb);
      li.src = b.dataset.full; li.alt = $('img', b).alt;
      $('p', lb).textContent = b.dataset.cap;
      lb.showModal();
    });
  });
  if (lb) {
    lb.setAttribute('data-lenis-prevent', '');
    $('.lb-close', lb).addEventListener('click', function () { lb.close(); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener('close', function () { if (lastTile) lastTile.focus(); });
  }

  /* ---------- טופס הזמנה ← וואטסאפ ---------- */
  var form = $('#orderForm');
  if (form) {
    var dateEl = $('#f-date');
    var t = new Date(); dateEl.min = t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2);
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
      window.open(WA + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
      status.textContent = 'וואטסאפ נפתח בחלון חדש עם ההודעה שלכם. נשאר רק ללחוץ "שליחה".';
    });
  }

  /* ==========================================================
     האגם – תמונה נוזלית ב-WebGL: אדוות מתחת לעכבר ומעבר נוזלי בין תמונות
     ========================================================== */
  var Lake = (function () {
    var el = $('#lake'); if (!el) return null;
    var canvas = $('.lake-gl', el), capEl = $('#lakeCap'), numEl = $('#lakeNum'), btn = $('#lakeToggle');
    var SRC = [
      ['assets/gallery/1.webp', 'בבקה שוקולד ועוגת פרג'],
      ['assets/gallery/6.webp', 'טירמיסו'],
      ['assets/gallery/2.webp', 'עוגת קרם ושוקולד'],
      ['assets/gallery/3.webp', 'עוגת גבינה ופירות יער']
    ];
    var gl, U = {}, tex = [], asp = [], cur = 0, nxt = 0, tStart = -1, DUR = 1.7, HOLD = 5.2;
    var drops = new Float32Array(18), di = 0, lastDrop = 0, lastX = -1, lastY = -1;
    var raf = 0, on = false, inView = true, userPaused = false, clock = 0, lastNow = 0, nextSlideAt = HOLD, nextAuto = 1.2, ok = false;
    for (var k = 0; k < 6; k++) drops[k * 3 + 2] = -99;

    var VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    var FS = [
      'precision mediump float;',
      'uniform sampler2D uA,uB;uniform vec2 uRes;uniform float uAspA,uAspB,uT,uP;uniform vec3 uD[6];',
      'vec2 cov(vec2 uv,float ia){float ca=uRes.x/uRes.y;vec2 s=ca>ia?vec2(1.,ia/ca):vec2(ca/ia,1.);return (uv-.5)*s+.5;}',
      'void main(){',
      ' vec2 uv=gl_FragCoord.xy/uRes;uv.y=1.-uv.y;',
      ' vec2 q=(uv-.5)*2.;float a=atan(q.y,q.x);float r=length(q);',
      ' float edge=.93+.03*sin(3.*a+uT*.55)+.02*sin(5.*a-uT*.4)+.012*sin(8.*a+uT*.9);',
      ' float mask=smoothstep(edge,edge-.012,r);',
      ' vec2 as=vec2(uRes.x/uRes.y,1.);vec2 disp=vec2(0.);float shine=0.;',
      ' for(int i=0;i<6;i++){vec3 d=uD[i];float age=uT-d.z;if(age>0.&&age<3.2){',
      '  vec2 v=(uv-d.xy)*as;float dist=length(v);float ring=age*.4;',
      '  float w=exp(-pow((dist-ring)*8.,2.))*exp(-age*1.3);float s=sin((dist-ring)*44.);',
      '  disp+=normalize(v+1e-5)*s*w*.024;shine+=s*w;}}',
      ' disp+=.0022*vec2(sin(uv.y*14.+uT*.9),cos(uv.x*12.+uT*.7));',
      ' vec2 c=(uv-.5)*as;float dc=length(c);float front=uP*1.5;',
      ' float band=exp(-pow((dc-front)*6.,2.))*step(.0001,uP);',
      ' disp+=normalize(c+1e-5)*band*.06*sin((dc-front)*36.);',
      ' vec3 ca=texture2D(uA,cov(uv+disp,uAspA)).rgb;vec3 cb=texture2D(uB,cov(uv+disp,uAspB)).rgb;',
      ' float m=smoothstep(front-.05,front+.05,dc);',
      ' vec3 col=mix(cb,ca,m);col+=shine*.1+band*.1;',
      ' float rim=smoothstep(edge-.16,edge,r);col*=1.-rim*.2;',
      ' gl_FragColor=vec4(col*mask,mask);}'
    ].join('\n');

    function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (gl.getShaderParameter(s, gl.COMPILE_STATUS)) return s; if (window.console) console.warn('lake shader:', gl.getShaderInfoLog(s)); return null; }
    function loadTex(i, cb) {
      if (tex[i]) { if (cb) cb(); return; }
      var im = new Image();
      im.onload = function () {
        var tx = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tx);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, im);
        tex[i] = tx; asp[i] = im.naturalWidth / im.naturalHeight;
        if (cb) cb();
      };
      im.src = SRC[i][0];
    }
    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2), w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
      if (w && h && (canvas.width !== w || canvas.height !== h)) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
    }
    function drop(x, y) { drops[di * 3] = x; drops[di * 3 + 1] = y; drops[di * 3 + 2] = clock; di = (di + 1) % 6; }
    function label() {
      if (capEl) capEl.textContent = SRC[nxt][1];
      if (numEl) numEl.textContent = '0' + (nxt + 1);
    }
    function frame(now) {
      raf = 0;
      if (!on) return;
      var dt = Math.min(.05, (now - lastNow) / 1000); lastNow = now; clock += dt;
      if (clock > nextAuto) { drop(.2 + Math.random() * .6, .2 + Math.random() * .6); nextAuto = clock + 2.2 + Math.random() * 1.6; }
      var p = 0;
      if (tStart >= 0) {
        p = (clock - tStart) / DUR;
        if (p >= 1) { cur = nxt; tStart = -1; p = 0; nextSlideAt = clock + HOLD; }
        else p = p * p * (3 - 2 * p);
      } else if (clock > nextSlideAt) {
        var n = (cur + 1) % SRC.length;
        if (tex[n]) { nxt = n; tStart = clock; label(); loadTex((n + 1) % SRC.length); }
      }
      resize();
      gl.uniform2f(U.uRes, canvas.width, canvas.height);
      gl.uniform1f(U.uT, clock); gl.uniform1f(U.uP, p);
      gl.uniform3fv(U.uD, drops);
      var b = tStart >= 0 ? nxt : cur;
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex[cur]);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tex[b]);
      gl.uniform1f(U.uAspA, asp[cur]); gl.uniform1f(U.uAspB, asp[b]);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(frame);
    }
    function sync() {
      var should = ok && inView && !userPaused && !document.hidden && !motionOff();
      if (should && !on) { on = true; lastNow = performance.now(); raf = requestAnimationFrame(frame); }
      else if (!should && on) { on = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
      el.classList.toggle('gl-on', ok && !motionOff());
    }
    function init() {
      try { gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false }); } catch (e) { gl = null; }
      if (!gl) return fail();
      var vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
      if (!vs || !fs) return fail();
      var pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
      if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return fail();
      gl.useProgram(pr);
      var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      ['uA', 'uB', 'uRes', 'uAspA', 'uAspB', 'uT', 'uP', 'uD'].forEach(function (n) { U[n] = gl.getUniformLocation(pr, n); });
      gl.uniform1i(U.uA, 0); gl.uniform1i(U.uB, 1);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); ok = false; sync(); });
      loadTex(0, function () { ok = true; sync(); loadTex(1); });

      el.addEventListener('pointermove', function (e) {
        if (!on) return;
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, yy = (e.clientY - r.top) / r.height;
        var far = Math.abs(x - lastX) + Math.abs(yy - lastY);
        if (far > .07 && clock - lastDrop > .09) { drop(x, yy); lastDrop = clock; lastX = x; lastY = yy; nextAuto = clock + 3; }
      });
      el.addEventListener('pointerdown', function (e) {
        if (!on) return;
        var r = el.getBoundingClientRect(); drop((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
      });
      if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { inView = en[0].isIntersecting; sync(); }).observe(el);
      document.addEventListener('visibilitychange', sync);
      if (btn) btn.addEventListener('click', function () {
        userPaused = !userPaused;
        btn.setAttribute('aria-pressed', userPaused ? 'true' : 'false');
        btn.setAttribute('aria-label', userPaused ? 'הפעלת חילוף התמונות' : 'עצירת חילוף התמונות');
        sync();
      });
    }
    function fail() { ok = false; if (btn) btn.hidden = true; var n = $('.lake-num'); if (n) n.hidden = true; }
    init();
    return { sync: sync };
  })();

  /* ==========================================================
     אנימציות גלילה
     ========================================================== */
  var animsOn = false, lenisTick = null, bobTween = null;
  var CLEAR = '.hero-title .in,.swash,.kicker,.hero .lead,.hero-cta,.facts li,.seal,.berry,.note-hero,.lake-ui,.lake,.hero-copy,.tape-row,.qw,.polaroid,' +
    '.h2,.rv,.card,.card-img img,.step,.drips,.pool-img,.pool-img img,.pool-text span,.col,.tile button,.tile img,.contact-box,.wordmark span,.progress,.faq-list details';

  function splitWords(el, cls) {
    if (el.dataset.split) return $$('.' + cls, el);
    el.dataset.split = '1';
    var words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = words.map(function (w) { return '<span class="' + cls + '" aria-hidden="true">' + w + '</span>'; }).join(' ');
    return $$('.' + cls, el);
  }

  function heroIn(withLake) {
    if (motionOff()) return;
    var tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.from('.hero-title .in', { yPercent: 115, rotate: 4, duration: 1.2, stagger: .13 }, 0)
      .from('.swash', { scaleX: 0, transformOrigin: '100% 50%', duration: .9, ease: 'power2.inOut' }, .7)
      .from('.kicker', { y: 20, autoAlpha: 0, duration: .7 }, .1)
      .from('.hero .lead,.hero-cta', { y: 30, autoAlpha: 0, duration: .9, stagger: .1 }, .55)
      .from('.facts li', { y: 20, autoAlpha: 0, duration: .6, stagger: .08 }, .85)
      .from('.seal', { scale: 0, rotate: -160, duration: 1.1, ease: 'back.out(1.6)' }, .5)
      .from('.berry.b1,.berry.b2', { y: -140, scale: 0, rotate: 90, duration: 1.1, ease: 'bounce.out', stagger: .15 }, .6)
      .from('.note-hero', { autoAlpha: 0, x: 30, rotate: -18, duration: .8, ease: 'back.out(2)' }, 1.1)
      .from('.lake-ui', { y: 30, autoAlpha: 0, duration: .8 }, .9);
    if (withLake) tl.from('.lake', { scale: .7, autoAlpha: 0, duration: 1.4, ease: 'expo.out' }, 0);
  }

  function initScroll() {
    if (motionOff() || animsOn) return;
    animsOn = true;
    gsap.registerPlugin(ScrollTrigger);
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.config({ ignoreMobileResize: true });
    var touch = window.matchMedia('(pointer: coarse)').matches, SC = touch ? .5 : true;
    var desktop = window.matchMedia('(min-width: 821px)').matches;

    if (window.Lenis && !lenis) {
      lenis = new Lenis({ lerp: .09, smoothWheel: true, wheelMultiplier: .95 });
      lenis.on('scroll', ScrollTrigger.update);
      lenisTick = function (t) { lenis.raf(t * 1000); };
      gsap.ticker.add(lenisTick);
    }

    gsap.to('.progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: SC } });

    /* Hero – יציאה */
    var hT = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: SC };
    gsap.to('.hero-copy', { yPercent: -10, ease: 'none', scrollTrigger: hT });
    gsap.to('.berry.b1', { y: -160, rotate: 60, ease: 'none', scrollTrigger: hT });
    gsap.to('.berry.b2', { y: -90, rotate: -50, ease: 'none', scrollTrigger: hT });
    gsap.to('.seal', { y: -70, ease: 'none', scrollTrigger: hT });

    /* סרטים */
    $$('.tape-row').forEach(function (row, i) {
      if (!row.dataset.dup) { row.dataset.dup = '1'; var html = row.innerHTML; row.innerHTML = html + html + html + html; }
      gsap.fromTo(row, { xPercent: i ? 30 : 0 }, { xPercent: i ? 0 : 30, ease: 'none', scrollTrigger: { trigger: '.tapes', start: 'top bottom', end: 'bottom top', scrub: SC } });
    });

    /* אודות */
    var q = $('.quote');
    if (q) {
      var qw = splitWords(q, 'qw');
      gsap.fromTo(qw, { color: '#E0C8B4' }, { color: '#3A1D12', stagger: .12, ease: 'none', scrollTrigger: { trigger: q, start: 'top 82%', end: 'bottom 45%', scrub: SC } });
    }
    gsap.from('.p-a', { y: 120, rotate: 22, autoAlpha: 0, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '.about-art', start: 'top 78%' } });
    gsap.from('.p-b', { y: 160, rotate: -26, autoAlpha: 0, duration: 1.2, delay: .18, ease: 'power3.out', scrollTrigger: { trigger: '.about-art', start: 'top 78%' } });
    gsap.from('.berry.b3', { scale: 0, rotate: -200, duration: 1, delay: .5, ease: 'back.out(2)', scrollTrigger: { trigger: '.about-art', start: 'top 78%' } });

    /* כותרות וחשיפות כלליות */
    $$('.h2').forEach(function (h) {
      gsap.from(h, { yPercent: 35, clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'power4.out', scrollTrigger: { trigger: h, start: 'top 88%' } });
    });
    var rv = $$('.sec-head > :not(.h2),.about-text > :not(.h2):not(.quote),.faq-side > :not(.h2),.contact-info > :not(.h2),.order-form,.more-note,.how-cta,.gallery .center,.footer-grid > *');
    rv.forEach(function (e) { e.classList.add('rv'); });
    gsap.set(rv, { y: 36, autoAlpha: 0 });
    ScrollTrigger.batch(rv, { start: 'top 90%', once: true, onEnter: function (b) { gsap.to(b, { y: 0, autoAlpha: 1, duration: .9, ease: 'power3.out', stagger: .09, overwrite: true }); } });
    gsap.set('.faq-list details', { y: 30, autoAlpha: 0 });
    ScrollTrigger.batch('.faq-list details', { start: 'top 92%', once: true, onEnter: function (b) { gsap.to(b, { y: 0, autoAlpha: 1, duration: .8, ease: 'power3.out', stagger: .08, overwrite: true }); } });

    /* קלפים נערמים */
    var cards = $$('.stack .card');
    cards.forEach(function (card, i) {
      var img = $('.card-img img', card);
      gsap.fromTo(img, { scale: 1.28 }, { scale: 1.04, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'top 20%', scrub: SC } });
      var next = cards[i + 1];
      if (next) gsap.to(card, { scale: .9, '--dim': .38, ease: 'none', scrollTrigger: { trigger: next, start: 'top 95%', end: 'top 18%', scrub: SC } });
    });

    /* איך מזמינים */
    gsap.from('.step', { y: 80, autoAlpha: 0, rotate: function (i) { return [5, -3, 4][i]; }, duration: 1, ease: 'back.out(1.4)', stagger: .14, scrollTrigger: { trigger: '.steps', start: 'top 82%' } });
    gsap.fromTo('.drips', { scaleY: .12 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.how', start: 'bottom 95%', end: 'bottom 35%', scrub: SC } });

    /* אגם שנפתח */
    var pool = $('.pool');
    if (pool) {
      var pi = $('.pool-img'), st = { r: 0 };
      var setClip = function () { pi.style.clipPath = 'circle(' + st.r.toFixed(1) + 'px at 50% 50%)'; };
      var r0 = function () { return Math.min(window.innerWidth, window.innerHeight) * .17; };
      var r1 = function () { return Math.hypot(window.innerWidth, window.innerHeight) * .52; };
      st.r = r0(); setClip();
      var ptl = gsap.timeline({ scrollTrigger: { trigger: pool, start: 'top top', end: '+=130%', pin: true, scrub: SC, invalidateOnRefresh: true } });
      ptl.fromTo(st, { r: r0 }, { r: r1, ease: 'power2.in', duration: 1, onUpdate: setClip }, 0)
        .fromTo('.pool-img img', { scale: 1.5 }, { scale: 1, ease: 'none', duration: 1 }, 0)
        .from('.pool-text .pt1', { yPercent: 80, autoAlpha: 0, duration: .35, ease: 'power3.out' }, .55)
        .from('.pool-text .pt2', { yPercent: 80, autoAlpha: 0, rotate: -6, duration: .35, ease: 'power3.out' }, .75);
    }

    /* גלריה */
    $$('#galleryGrid .tile button').forEach(function (b) {
      gsap.from(b, { clipPath: 'inset(100% 0 0 0 round 24px)', duration: 1.1, ease: 'power4.out', scrollTrigger: { trigger: b, start: 'top 92%' } });
      gsap.from($('img', b), { scale: 1.35, duration: 1.4, ease: 'power3.out', scrollTrigger: { trigger: b, start: 'top 92%' } });
    });
    if (desktop) {
      var gT = { trigger: '#galleryGrid', start: 'top bottom', end: 'bottom top', scrub: SC };
      $$('#galleryGrid .col').forEach(function (c, i) { gsap.fromTo(c, { y: [60, -30, 110][i] }, { y: [-60, 40, -110][i], ease: 'none', scrollTrigger: gT }); });
    }

    /* יצירת קשר ופוטר */
    gsap.from('.contact-box', { scale: .9, y: 80, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '.contact-box', start: 'top 90%' } });
    gsap.from('.wordmark span', { yPercent: 90, autoAlpha: 0, rotate: 6, stagger: .12, ease: 'power3.out', duration: 1.1, scrollTrigger: { trigger: '.site-footer', start: 'top 80%' } });

    /* קישורי עוגן – גלילה רכה */
    ScrollTrigger.refresh();
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]'); if (!a || !lenis) return;
    var id = a.getAttribute('href'); if (id.length < 2) { e.preventDefault(); lenis.scrollTo(0); return; }
    var target = $(id); if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: -70, duration: 1.4 });
    history.pushState(null, '', id);
    if (target.tabIndex < 0) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });

  function killAnims() {
    if (!hasGsap) return;
    if (window.ScrollTrigger) ScrollTrigger.getAll().forEach(function (s) { s.kill(true); });
    gsap.globalTimeline.getChildren(true, true, true).forEach(function (t) { t.kill(); });
    gsap.set(CLEAR, { clearProps: 'all' });
    if (lenis) { gsap.ticker.remove(lenisTick); lenis.destroy(); lenis = null; }
    animsOn = false;
  }

  /* ==========================================================
     פתיחה
     ========================================================== */
  var intro = $('#intro'), page = $('#page'), introDone = !root.classList.contains('intro-on'), introTl = null;

  function lockPage(lock) {
    [page, $('#a11yBtn'), $('#a11yPanel')].forEach(function (n) { if (n) { if (lock) n.setAttribute('inert', ''); else n.removeAttribute('inert'); } });
  }
  function cleanupIntro() {
    if (introDone) return;
    introDone = true;
    if (introTl) introTl.kill();
    if (bobTween) bobTween.kill();
    root.classList.remove('intro-on');
    lockPage(false);
    try { sessionStorage.setItem('agam-intro', '1'); } catch (e) {}
    initScroll();
  }
  function skipIntro() {
    if (introDone) return;
    if (introTl) introTl.kill();
    lockPage(false);
    heroIn(true);
    gsap.to(intro, { autoAlpha: 0, duration: .45, onComplete: function () { cleanupIntro(); $('#main').focus({ preventScroll: true }); } });
  }

  function dripPath(W, H, seed) {
    /* שפה תחתונה של רוטב עם טיפות נוטפות */
    var rnd = function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    var n = Math.max(6, Math.round(W / 130)), step = (W + 100) / n, d = 'M-50 ' + (-H * 1.3) + 'H' + (W + 50) + 'V0', maxL = 0;
    for (var i = n - 1; i >= 0; i--) {
      var cx = -50 + step * (i + .5) + (rnd() - .5) * step * .3, hw = step * (.14 + rnd() * .12), L = H * (.08 + rnd() * rnd() * .42), f = hw * .9;
      if (L < hw * 2.4) L = hw * 2.4;
      if (L > maxL) maxL = L;
      d += 'L' + (cx + hw + f).toFixed(1) + ' 0Q' + (cx + hw).toFixed(1) + ' 0 ' + (cx + hw).toFixed(1) + ' ' + f.toFixed(1) +
        'V' + (L - hw).toFixed(1) + 'A' + hw.toFixed(1) + ' ' + hw.toFixed(1) + ' 0 0 1 ' + (cx - hw).toFixed(1) + ' ' + (L - hw).toFixed(1) +
        'V' + f.toFixed(1) + 'Q' + (cx - hw).toFixed(1) + ' 0 ' + (cx - hw - f).toFixed(1) + ' 0';
    }
    return { d: d + 'L-50 0Z', max: maxL };
  }

  function playIntro() {
    if (introDone) return;
    if (motionOff()) { root.classList.remove('intro-on'); introDone = true; return; }
    window.scrollTo(0, 0);
    lockPage(true);
    var W = intro.clientWidth || window.innerWidth || 1280, H = intro.clientHeight || window.innerHeight || 720;
    var svg = $('.i-pour'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    var back = dripPath(W, H, 7), front = dripPath(W, H, 31), maxL = Math.max(back.max, front.max) + 30;
    svg.innerHTML = '<path class="pb" d="' + back.d + '" fill="#9E1530"/><path class="pf" d="' + front.d + '" fill="#C8243F"/>';

    var title = $('.i-title');
    title.innerHTML = title.textContent.trim().split(' ').map(function (w) {
      return '<span style="display:inline-block;white-space:nowrap">' + w.split('').map(function (c) { return '<span class="ch">' + c + '</span>'; }).join('') + '</span>';
    }).join(' ');
    var chars = $$('.ch', title), lakeEl = $('.i-lake'), count = $('.i-count b'), c = { v: 0 }, clip = { r: 0 };
    var cy = H * .71, setClip = function () { lakeEl.style.clipPath = 'circle(' + clip.r.toFixed(1) + 'px at 50% ' + cy + 'px)'; };
    var R = Math.min(W, H) * (W < 700 ? .3 : .19);

    gsap.set('.pb,.pf', { y: -maxL });
    gsap.set(lakeEl, { width: W, height: H });
    setClip();
    gsap.set(chars, { yPercent: 130, autoAlpha: 0 });

    var tl = introTl = window.__agamIntro = gsap.timeline({ onComplete: cleanupIntro });
    tl.from('.i-meta', { autoAlpha: 0, y: -14, duration: .6 }, 0)
      .to(c, { v: 100, duration: 2.3, ease: 'power1.inOut', onUpdate: function () { count.textContent = Math.round(c.v); } }, 0)
      .from('.i-pre .w>span', { yPercent: 115, duration: .9, stagger: .14, ease: 'power4.out' }, .1)
      /* הרוטב נשפך */
      .to('.pb', { y: 0, duration: .7, ease: 'power2.out' }, .95)
      .to('.pf', { y: -maxL * .25, duration: .7, ease: 'power2.out' }, 1.05)
      .to('.pb', { y: H + maxL * .2, duration: 1.05, ease: 'power2.in' }, 1.5)
      .to('.pf', { y: H + 10, duration: 1.1, ease: 'power2.in' }, 1.62)
      .set('.i-pre', { autoAlpha: 0 }, 2.7)
      .to('.i-meta', { color: '#FBF3E6', duration: .3 }, 2.2)
      /* השם צף על הרוטב */
      .to(chars, { yPercent: 0, autoAlpha: 1, duration: 1.2, ease: 'elastic.out(1,.55)', stagger: .055, rotate: 0 }, 2.5)
      .fromTo(chars, { rotate: function (i) { return (i % 2 ? 1 : -1) * 22; } }, { rotate: 0, duration: 1.2, ease: 'elastic.out(1,.5)', stagger: .055 }, 2.5)
      .to('.i-tag', { opacity: 1, y: 0, duration: .7, ease: 'power3.out' }, 3.25)
      /* אגם נפתח */
      .to(clip, { r: R, duration: 1, ease: 'back.out(1.7)', onUpdate: setClip }, 3.7)
      .fromTo('.i-lake img', { scale: 1.5 }, { scale: 1.15, duration: 2.2, ease: 'power2.out' }, 3.7)
      .fromTo('.i-rings circle', { scale: .5, opacity: .9 }, { scale: 3.4, opacity: 0, duration: 1.7, ease: 'power2.out', stagger: .24 }, 3.75)
      /* האגם מציף את המסך */
      .to(clip, { r: Math.hypot(W, H), duration: .95, ease: 'power3.in', onUpdate: setClip }, 5.05)
      .to(chars, { yPercent: -60, autoAlpha: 0, duration: .5, ease: 'power2.in', stagger: .02 }, 5.05)
      .to('.i-tag,.i-meta,.i-skip', { autoAlpha: 0, duration: .4 }, 5.05)
      .to('.i-lake img', { scale: 1, duration: .95, ease: 'power2.inOut' }, 5.05)
      /* התמונה נוחתת במקומה באתר */
      .add(function () {
        intro.style.background = 'transparent'; svg.style.display = 'none';
        lakeEl.style.clipPath = 'none';
        lockPage(false);
        var r = $('#lake').getBoundingClientRect();
        heroIn(false);
        gsap.to(lakeEl, { left: r.left, top: r.top, width: r.width, height: r.height, borderRadius: '50%', duration: 1.15, ease: 'power3.inOut' });
        gsap.to(lakeEl, { autoAlpha: 0, duration: .45, delay: 1.1 });
      }, 6.0)
      .to({}, { duration: 1.6 }, 6.0);
    gsap.set('.i-tag', { y: 18 });
    bobTween = gsap.to(chars, { y: -7, duration: 1.1, ease: 'sine.inOut', yoyo: true, repeat: 5, stagger: { each: .09, from: 'random' }, delay: 3.6 });
  }

  var skipBtn = $('#introSkip');
  if (skipBtn) skipBtn.addEventListener('click', skipIntro);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !introDone) skipIntro(); });

  function boot() {
    if (!introDone) {
      playIntro();
      setTimeout(function () { if (!introDone && (!introTl || introTl.progress() < .05)) skipIntro(); }, 15000);
    } else {
      heroIn(true);
      initScroll();
    }
  }
  if (!hasGsap) { root.classList.remove('intro-on'); introDone = true; }
  else if (document.fonts && document.fonts.ready) {
    var booted = false, go = function () { if (!booted) { booted = true; boot(); } };
    document.fonts.ready.then(go); setTimeout(go, 1400);
  } else boot();

  window.addEventListener('load', function () { if (window.ScrollTrigger && animsOn) ScrollTrigger.refresh(); });

  /* שינוי העדפות נגישות בזמן אמת */
  document.addEventListener('a11y-change', function () {
    if (motionOff()) { if (!introDone) { root.classList.remove('intro-on'); introDone = true; if (introTl) introTl.kill(); lockPage(false); } killAnims(); }
    else if (introDone) initScroll();
    if (Lake) Lake.sync();
  });
})();
