/* GamnaMarks — أزرار موحّدة لكل الألعاب: الشاشة الرئيسية + التوقف اللحظي
   يُحمَّل أول شيء في <head> حتى يقدر يوقف المؤقتات والحركة والصوت. */
(function () {
  if (window.__gmControls) return;
  window.__gmControls = true;

  var HOME_URL = 'index.html';
  /* data-gm="home,pause" يحدد أي زر يظهر (بدونه يظهر الاثنين) */
  var cfg = ((document.currentScript && document.currentScript.getAttribute('data-gm')) || 'home,pause').split(',');
  var SHOW_HOME = cfg.indexOf('home') > -1, SHOW_PAUSE = cfg.indexOf('pause') > -1;
  var paused = false;
  var queuedTimeouts = [];
  var queuedFrames = [];
  var pausedMedia = [];
  var audioCtxs = [];
  var suspendedCtxs = [];

  /* ---- المؤقتات: setTimeout / setInterval ---- */
  var _setTimeout = window.setTimeout.bind(window);
  var _setInterval = window.setInterval.bind(window);
  window.setTimeout = function (fn, ms) {
    var args = Array.prototype.slice.call(arguments, 2);
    if (typeof fn !== 'function') return _setTimeout.apply(window, arguments);
    var wrapped = function () {
      if (paused) { queuedTimeouts.push(function () { fn.apply(window, args); }); return; }
      fn.apply(window, args);
    };
    return _setTimeout(wrapped, ms);
  };
  window.setInterval = function (fn, ms) {
    var args = Array.prototype.slice.call(arguments, 2);
    if (typeof fn !== 'function') return _setInterval.apply(window, arguments);
    return _setInterval(function () { if (!paused) fn.apply(window, args); }, ms);
  };

  /* ---- الحركة: requestAnimationFrame ---- */
  if (window.requestAnimationFrame) {
    var _raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = function (cb) {
      return _raf(function (t) {
        if (paused) { queuedFrames.push(cb); return; }
        cb(t);
      });
    };
  }

  /* ---- الأصوات المولّدة: AudioContext ---- */
  ['AudioContext', 'webkitAudioContext'].forEach(function (name) {
    var Orig = window[name];
    if (!Orig) return;
    var Wrapped = function () {
      var ctx = new (Function.prototype.bind.apply(Orig, [null].concat(Array.prototype.slice.call(arguments))))();
      audioCtxs.push(ctx);
      return ctx;
    };
    Wrapped.prototype = Orig.prototype;
    try { window[name] = Wrapped; } catch (e) {}
  });

  function pauseGame() {
    if (paused) return;
    paused = true;
    pausedMedia = [];
    document.querySelectorAll('audio,video').forEach(function (m) {
      if (!m.paused) { try { m.pause(); pausedMedia.push(m); } catch (e) {} }
    });
    suspendedCtxs = [];
    audioCtxs.forEach(function (c) {
      if (c.state === 'running') { try { c.suspend(); suspendedCtxs.push(c); } catch (e) {} }
    });
    if (window.speechSynthesis && speechSynthesis.speaking) { try { speechSynthesis.pause(); } catch (e) {} }
    document.documentElement.classList.add('gm-paused');
    overlay.style.display = 'flex';
  }

  function resumeGame() {
    if (!paused) return;
    paused = false;
    overlay.style.display = 'none';
    document.documentElement.classList.remove('gm-paused');
    pausedMedia.forEach(function (m) { try { var p = m.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {} });
    pausedMedia = [];
    suspendedCtxs.forEach(function (c) { try { c.resume(); } catch (e) {} });
    suspendedCtxs = [];
    if (window.speechSynthesis) { try { speechSynthesis.resume(); } catch (e) {} }
    var t = queuedTimeouts; queuedTimeouts = [];
    t.forEach(function (fn) { try { fn(); } catch (e) { console.error(e); } });
    var f = queuedFrames; queuedFrames = [];
    f.forEach(function (cb) { window.requestAnimationFrame(cb); });
  }

  window.GMControls = { pause: pauseGame, resume: resumeGame, isPaused: function () { return paused; } };

  /* ---- الواجهة ---- */
  var overlay;
  function build() {
    if (document.getElementById('gmCtl')) return;
    var css = document.createElement('style');
    css.textContent =
      '#gmCtl{position:fixed;left:8px;top:50%;transform:translateY(-50%);z-index:2147483600;display:flex;flex-direction:column;gap:8px;direction:rtl}' +
      '#gmCtl button{all:unset;box-sizing:border-box;width:42px;height:42px;border-radius:50%;display:grid;place-items:center;cursor:pointer;' +
      'background:rgba(20,24,48,.78);color:#fff;font:700 19px/1 system-ui,sans-serif;border:1.5px solid rgba(255,255,255,.55);' +
      'box-shadow:0 3px 10px rgba(0,0,0,.35);-webkit-tap-highlight-color:transparent;touch-action:manipulation;opacity:.85}' +
      '#gmCtl button:active{transform:scale(.92)}' +
      'html.gm-paused *{animation-play-state:paused!important}' +
      '#gmPause{position:fixed;inset:0;z-index:2147483646;display:none;align-items:center;justify-content:center;flex-direction:column;gap:18px;' +
      'background:rgba(8,10,28,.86);color:#fff;font-family:Tajawal,system-ui,sans-serif;direction:rtl;text-align:center;padding:20px}' +
      '#gmPause .gmT{font-size:30px;font-weight:800}' +
      '#gmPause .gmS{font-size:16px;opacity:.8}' +
      '#gmPause .gmRow{display:flex;gap:12px;flex-wrap:wrap;justify-content:center}' +
      '#gmPause button{all:unset;cursor:pointer;padding:14px 28px;border-radius:999px;font:800 18px Tajawal,system-ui,sans-serif;touch-action:manipulation}' +
      '#gmPause #gmResume{background:#7de0d6;color:#10223a}' +
      '#gmPause #gmPauseHome{background:rgba(255,255,255,.12);color:#fff;border:1.5px solid rgba(255,255,255,.5)}';
    (document.head || document.documentElement).appendChild(css);

    var bar = document.createElement('div');
    bar.id = 'gmCtl';
    bar.innerHTML = (SHOW_HOME ? '<button id="gmHomeBtn" title="الشاشة الرئيسية" aria-label="الشاشة الرئيسية">🏠</button>' : '') +
                    (SHOW_PAUSE ? '<button id="gmPauseBtn" title="توقف لحظي" aria-label="توقف لحظي">⏸</button>' : '');
    document.body.appendChild(bar);

    overlay = document.createElement('div');
    overlay.id = 'gmPause';
    overlay.innerHTML = '<div style="font-size:54px">⏸</div><div class="gmT">اللعبة متوقفة</div>' +
      '<div class="gmS">الوقت والحركة والصوت متوقفين لحد ما تكملوا</div>' +
      '<div class="gmRow"><button id="gmResume">▶ متابعة</button><button id="gmPauseHome">🏠 الشاشة الرئيسية</button></div>';
    document.body.appendChild(overlay);

    var stop = function (e) { e.stopPropagation(); };
    ['click', 'pointerdown', 'touchstart', 'mousedown', 'keydown'].forEach(function (ev) {
      bar.addEventListener(ev, stop);
      overlay.addEventListener(ev, stop);
    });

    var goHome = function () {
      if (confirm('بدك ترجعي للشاشة الرئيسية؟ اللعبة رح تنتهي.')) {
        try { (window.top || window).location.href = HOME_URL; } catch (e) { location.href = HOME_URL; }
      }
    };
    if (SHOW_HOME) document.getElementById('gmHomeBtn').onclick = goHome;
    document.getElementById('gmPauseHome').onclick = goHome;
    if (SHOW_PAUSE) document.getElementById('gmPauseBtn').onclick = pauseGame;
    document.getElementById('gmResume').onclick = resumeGame;
  }

  if (document.body) build();
  else document.addEventListener('DOMContentLoaded', build);
})();
