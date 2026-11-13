/* סרגל נגישות – אגם של טעמים
   שומר העדפות בדפדפן המשתמש בלבד (localStorage), ללא שליחת מידע לשום גורם. */
(function () {
  'use strict';
  var KEY = 'agam-a11y';
  var root = document.documentElement;
  var state = { fs: 0, contrast: false, gray: false, links: false, font: false, spacing: false, cursor: false, nomotion: false };
  try { Object.assign(state, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}

  var TOGGLES = [
    ['contrast', 'ניגודיות גבוהה', '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 3a9 9 0 0 0 0 18Z" fill="currentColor"/>'],
    ['gray', 'גווני אפור', '<rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 12h18" stroke="currentColor" stroke-width="2"/>'],
    ['links', 'הדגשת קישורים', '<path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1m2 4a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'],
    ['font', 'גופן קריא', '<path d="M5 19 11 5h2l6 14M8 14h8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'],
    ['spacing', 'ריווח שורות', '<path d="M9 6h11M9 12h11M9 18h11M5 5v14m0-14L3 7m2-2 2 2M5 19l-2-2m2 2 2-2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'],
    ['cursor', 'סמן גדול', '<path d="M5 3l14 8-6 1.500L10 19z" fill="currentColor"/>'],
    ['nomotion', 'עצירת אנימציות', '<rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/>']
  ];

  function apply() {
    root.classList.remove('a11y-fs1', 'a11y-fs2', 'a11y-fs3');
    if (state.fs > 0) root.classList.add('a11y-fs' + state.fs);
    TOGGLES.forEach(function (t) { root.classList.toggle('a11y-' + t[0], !!state[t[0]]); });
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
    document.dispatchEvent(new CustomEvent('a11y-change', { detail: state }));
  }
  apply();

  function build() {
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'a11y-btn'; btn.id = 'a11yBtn';
    btn.setAttribute('aria-label', 'תפריט נגישות');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'a11yPanel');
    btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="4.500" r="2.200" fill="currentColor"/><path d="M4 8.500c5 1.300 11 1.300 16 0M12 9.500V14m0 0-3.500 6.500M12 14l3.500 6.500" fill="none" stroke="currentColor" stroke-width="2.200" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    var panel = document.createElement('div');
    panel.className = 'a11y-panel'; panel.id = 'a11yPanel'; panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-labelledby', 'a11yTitle');
    var html = '<h2><span id="a11yTitle">התאמות נגישות</span><button type="button" class="a11y-close" aria-label="סגירת תפריט הנגישות">×</button></h2><div class="a11y-grid">';
    html += '<button type="button" data-act="fs+"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19 9 6h1l5 13M6 15h7M17 8h5M19.500 5.500v5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>הגדלת טקסט</button>';
    html += '<button type="button" data-act="fs-"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19 9 6h1l5 13M6 15h7M17 8h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>הקטנת טקסט</button>';
    TOGGLES.forEach(function (t) {
      html += '<button type="button" data-toggle="' + t[0] + '" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true">' + t[2] + '</svg>' + t[1] + '</button>';
    });
    html += '<button type="button" class="wide" data-act="reset">איפוס כל ההתאמות</button></div>';
    html += '<p class="sr-only" id="a11yLive" role="status" aria-live="polite"></p>';
    html += '<a href="accessibility.html">הצהרת נגישות</a>';
    panel.innerHTML = html;
    document.body.appendChild(btn);
    document.body.appendChild(panel);

    var live = panel.querySelector('#a11yLive');
    function sync() {
      panel.querySelectorAll('[data-toggle]').forEach(function (b) {
        b.setAttribute('aria-pressed', state[b.dataset.toggle] ? 'true' : 'false');
      });
    }
    function open(o) {
      panel.hidden = !o;
      btn.setAttribute('aria-expanded', o ? 'true' : 'false');
      if (o) panel.querySelector('.a11y-close').focus(); else btn.focus();
    }
    sync();
    btn.addEventListener('click', function () { open(panel.hidden); });
    panel.querySelector('.a11y-close').addEventListener('click', function () { open(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) { open(false); }
    });
    document.addEventListener('click', function (e) {
      if (!panel.hidden && !panel.contains(e.target) && !btn.contains(e.target)) { panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); }
    });
    panel.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var msg = '';
      if (b.dataset.toggle) {
        state[b.dataset.toggle] = !state[b.dataset.toggle];
        msg = b.textContent.trim() + (state[b.dataset.toggle] ? ' – הופעל' : ' – כובה');
      } else if (b.dataset.act === 'fs+') { state.fs = Math.min(3, state.fs + 1); msg = 'גודל טקסט: רמה ' + state.fs + ' מתוך 3'; }
      else if (b.dataset.act === 'fs-') { state.fs = Math.max(0, state.fs - 1); msg = 'גודל טקסט: רמה ' + state.fs + ' מתוך 3'; }
      else if (b.dataset.act === 'reset') {
        state = { fs: 0, contrast: false, gray: false, links: false, font: false, spacing: false, cursor: false, nomotion: false };
        msg = 'כל ההתאמות אופסו';
      } else return;
      apply(); sync(); live.textContent = msg;
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
