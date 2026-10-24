/* GamnaMarks — التقرير النهائي الموحّد لكل لعبة
   - بيسأل الطالب عن اسمه وصفّه أول ما تفتح اللعبة
   - بيحسب الوقت الفعلي للعب (بدون وقت التوقف اللحظي أو لما الصفحة مسكّرة)
   - بيلتقط العلامات والإجابات الصح والغلط تلقائياً
   - بيعرض شاشة نهائية فيها كل شي، وبيحفظها على الجهاز وعند المعلمة (Firebase)
   سطر الإضافة في أي لعبة:  <script src="gm-report.js" defer></script>
   للألعاب اللي بدها دقة أكثر:  GMReport.add('ورقة العمل 1', 8, 10) / GMReport.correct() / GMReport.wrong() / GMReport.finish() */
(function () {
  if (window.GMReport) return;

  var PROJECT = 'cursed-castle-bb43b';
  var API_KEY = 'AIzaSyADxQ7-3UDxYD3VTOoVrn7d6516_5bqd5Y';
  var COLL = 'gm_reports';
  var BASE = 'https://firestore.googleapis.com/v1/projects/' + PROJECT + '/databases/(default)/documents/' + COLL;
  var LS_LOCAL = 'gm_reports_local';
  var LS_QUEUE = 'gm_reports_queue';
  var LS_NAME = 'gm_student_name';
  var LS_CLASS = 'gm_student_class';

  var page = (location.pathname.split('/').pop() || 'game').replace(/\.html?$/i, '');
  var sc = document.currentScript;
  var GAME = (sc && sc.getAttribute('data-game')) || '';

  var S = {
    id: page + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    name: '', klass: '', started: 0, active: 0, lastTick: 0,
    autoScore: 0, setScore: null, correct: 0, wrong: 0, sections: [], finished: false, saved: false
  };

  function ls(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; }
  }
  function lsJSON(k, def) { try { return JSON.parse(ls(k) || '') || def; } catch (e) { return def; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function gameName() {
    if (GAME) return GAME;
    var t = (document.title || page).replace(/\s*[|\-–—]\s*(GamnaMarks|PlayVerse).*$/i, '').trim();
    return t || page;
  }

  /* ---------- الوقت ---------- */
  var nativeInterval = window.setInterval;
  function isPaused() { return document.hidden || document.documentElement.classList.contains('gm-paused') || !S.started || S.finished; }
  function tick() {
    var now = Date.now();
    if (S.lastTick && !isPaused()) S.active += Math.min(now - S.lastTick, 2000);
    S.lastTick = now;
  }
  function fmtTime(ms) {
    var s = Math.round(ms / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60);
    s = s % 60; m = m % 60;
    return (h ? h + ' س ' : '') + (m ? m + ' د ' : '') + s + ' ث';
  }

  /* ---------- التقاط العلامات تلقائياً ---------- */
  var SCORE_SEL = '[id*="score" i],[class*="score" i],[id*="point" i],[class*="point" i],[id*="nuqat" i],[data-score]';
  function scanScore() {
    if (!S.started || S.finished) return;
    var els = document.querySelectorAll(SCORE_SEL), best = S.autoScore;
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.closest && el.closest('#gmRep,#gmRepName')) continue;
      if (el.children.length > 3) continue;
      if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') continue;
      var m = (el.textContent || '').replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); }).match(/-?\d{1,6}/);
      if (m) { var n = parseInt(m[0], 10); if (n > best && n < 100000) best = n; }
    }
    S.autoScore = best;
  }

  var RX_OK = /(^|[\s_-])(correct|right|success|is-correct|ans-ok|true)($|[\s_-])/i;
  var RX_NO = /(^|[\s_-])(wrong|incorrect|error|fail|is-wrong|ans-bad|false)($|[\s_-])/i;
  var marked = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
  var lastWrongAt = 0;
  function onClassChange(el, oldCls) {
    if (!S.started || S.finished || !marked) return;
    if (el.closest && el.closest('#gmRep,#gmRepName,#gmCtl,#gmPause')) return;
    var cls = typeof el.className === 'string' ? el.className : (el.getAttribute('class') || '');
    var was = oldCls || '';
    var now = Date.now(), prev = marked.get(el) || 0;
    if (now - prev < 1500) return;
    if (RX_NO.test(cls) && !RX_NO.test(was)) { S.wrong++; lastWrongAt = now; marked.set(el, now); }
    else if (RX_OK.test(cls) && !RX_OK.test(was)) {
      if (now - lastWrongAt < 600) return; /* إظهار الإجابة الصحيحة بعد الغلط — ما بتنحسب */
      S.correct++; marked.set(el, now);
    }
  }
  function watch() {
    if (!window.MutationObserver) return;
    new MutationObserver(function (list) {
      for (var i = 0; i < list.length; i++) {
        var r = list[i];
        if (r.type === 'attributes' && r.attributeName === 'class') onClassChange(r.target, r.oldValue);
      }
    }).observe(document.body, { attributes: true, attributeFilter: ['class'], attributeOldValue: true, subtree: true });
  }

  /* ---------- الحساب النهائي ---------- */
  function totals() {
    tick(); scanScore();
    var got = 0, max = 0;
    S.sections.forEach(function (x) { got += x.got; max += x.max; });
    var score = S.setScore != null ? S.setScore : (S.sections.length ? got : S.autoScore);
    var answered = S.correct + S.wrong;
    var pct = null;
    if (max > 0) pct = Math.round(got / max * 100);
    else if (answered > 0) pct = Math.round(S.correct / answered * 100);
    var rating = pct == null ? (score > 0 ? 'أكمل/ت اللعب 👏' : 'بداية — كمّل/ي المحاولة') :
      pct >= 90 ? 'ممتاز 🌟' : pct >= 80 ? 'جيد جداً 👍' : pct >= 65 ? 'جيد ✔' : pct >= 50 ? 'مقبول' : 'بحاجة لمتابعة 💪';
    var stars = pct == null ? 0 : pct >= 90 ? 5 : pct >= 80 ? 4 : pct >= 65 ? 3 : pct >= 50 ? 2 : 1;
    return { score: score, got: got, max: max, answered: answered, pct: pct, rating: rating, stars: stars };
  }
  function record() {
    var t = totals();
    return {
      id: S.id, game: gameName(), page: page, name: S.name || 'بدون اسم', klass: S.klass || '',
      date: new Date().toISOString(), timeMs: S.active, timeText: fmtTime(S.active),
      score: t.score, correct: S.correct, wrong: S.wrong, pct: t.pct, rating: t.rating,
      sections: S.sections.slice(), finished: !!S.finished
    };
  }

  /* ---------- الحفظ ---------- */
  function toFields(r) {
    var f = {};
    Object.keys(r).forEach(function (k) {
      var v = r[k];
      if (k === 'sections') v = JSON.stringify(v);
      if (v === null || v === undefined) f[k] = { nullValue: null };
      else if (typeof v === 'number') f[k] = Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
      else if (typeof v === 'boolean') f[k] = { booleanValue: v };
      else f[k] = { stringValue: String(v) };
    });
    return f;
  }
  function pushRemote(r, keepalive) {
    if (!window.fetch) return Promise.reject();
    return fetch(BASE + '/' + encodeURIComponent(r.id) + '?key=' + API_KEY, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: toFields(r) }), keepalive: !!keepalive
    }).then(function (res) { if (!res.ok) throw new Error(res.status); return true; });
  }
  function saveLocal(r) {
    var all = lsJSON(LS_LOCAL, []).filter(function (x) { return x.id !== r.id; });
    all.push(r);
    if (all.length > 500) all = all.slice(-500);
    ls(LS_LOCAL, JSON.stringify(all));
  }
  function queue(r) {
    var q = lsJSON(LS_QUEUE, []).filter(function (x) { return x.id !== r.id; });
    q.push(r); ls(LS_QUEUE, JSON.stringify(q));
  }
  function flushQueue() {
    var q = lsJSON(LS_QUEUE, []);
    if (!q.length || !navigator.onLine) return;
    q.forEach(function (r) {
      pushRemote(r).then(function () {
        ls(LS_QUEUE, JSON.stringify(lsJSON(LS_QUEUE, []).filter(function (x) { return x.id !== r.id; })));
      }).catch(function () {});
    });
  }
  function save(keepalive) {
    if (!S.started) return Promise.resolve(false);
    var r = record();
    saveLocal(r);
    return pushRemote(r, keepalive).then(function () { S.saved = true; return true; })
      .catch(function () { queue(r); return false; });
  }

  /* ---------- الواجهة ---------- */
  function css() {
    if (document.getElementById('gmRepCss')) return;
    var st = document.createElement('style');
    st.id = 'gmRepCss';
    st.textContent =
      '#gmRepName,#gmRep{position:fixed;inset:0;z-index:2147483645;display:flex;align-items:center;justify-content:center;padding:16px;' +
      'background:rgba(8,10,28,.88);direction:rtl;font-family:Tajawal,"Segoe UI",system-ui,sans-serif;color:#fff;overflow:auto}' +
      '.gmCard{width:100%;max-width:440px;background:linear-gradient(160deg,#1d2457,#2b1a4f);border:1.5px solid rgba(255,255,255,.25);' +
      'border-radius:22px;padding:22px 20px;box-shadow:0 18px 50px rgba(0,0,0,.5);text-align:center;margin:auto}' +
      '.gmCard h2{margin:4px 0 4px;font-size:23px;font-weight:800}' +
      '.gmCard .gmSub{opacity:.8;font-size:14px;margin-bottom:14px}' +
      '.gmCard input{all:unset;box-sizing:border-box;width:100%;padding:13px 14px;margin:6px 0;border-radius:12px;background:rgba(255,255,255,.1);' +
      'border:1.5px solid rgba(255,255,255,.3);font-size:17px;text-align:right;color:#fff}' +
      '.gmCard input::placeholder{color:rgba(255,255,255,.55)}' +
      '.gmBtn{all:unset;box-sizing:border-box;cursor:pointer;display:inline-block;padding:12px 20px;border-radius:999px;font-weight:800;font-size:16px;' +
      'margin:5px 3px;touch-action:manipulation;background:rgba(255,255,255,.12);border:1.5px solid rgba(255,255,255,.45);color:#fff}' +
      '.gmBtn.gmMain{background:linear-gradient(90deg,#ff8a3d,#ff4f8b);border-color:transparent}' +
      '.gmBtn.gmFull{width:100%;text-align:center;margin-top:10px}' +
      '.gmGrid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0}' +
      '.gmBox{background:rgba(255,255,255,.08);border-radius:14px;padding:10px 6px}' +
      '.gmBox b{display:block;font-size:22px;margin-top:2px}' +
      '.gmBox span{font-size:13px;opacity:.75}' +
      '.gmRate{font-size:21px;font-weight:800;margin:6px 0 2px}' +
      '.gmStars{font-size:24px;letter-spacing:3px;color:#ffd34d}' +
      '.gmTbl{width:100%;border-collapse:collapse;margin:8px 0;font-size:14px}' +
      '.gmTbl td{padding:7px 6px;border-bottom:1px solid rgba(255,255,255,.12);text-align:right}' +
      '.gmTbl td:last-child{text-align:left;font-weight:700}' +
      '.gmMeta{font-size:14px;opacity:.85;line-height:1.7}' +
      '.gmNote{font-size:13px;margin-top:8px;opacity:.85;min-height:18px}' +
      '#gmRepBtn{all:unset;position:fixed;left:8px;bottom:12px;z-index:2147483600;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;' +
      'cursor:pointer;background:rgba(20,24,48,.8);border:1.5px solid rgba(255,255,255,.55);font-size:20px;box-shadow:0 3px 10px rgba(0,0,0,.35);' +
      'touch-action:manipulation;-webkit-tap-highlight-color:transparent}' +
      '@media print{body>*:not(#gmRep){display:none!important}#gmRep{position:static;background:#fff;color:#000}' +
      '#gmRep .gmCard{background:#fff;color:#000;border:1px solid #999;box-shadow:none}#gmRep .gmBtn,#gmRep .gmNote{display:none}' +
      '#gmRep .gmBox{background:#f1f1f1}#gmRep .gmTbl td{border-color:#ccc}}';
    (document.head || document.documentElement).appendChild(st);
  }
  function stopBubble(el) {
    ['click', 'pointerdown', 'touchstart', 'mousedown', 'keydown', 'keyup', 'keypress'].forEach(function (ev) {
      el.addEventListener(ev, function (e) { e.stopPropagation(); });
    });
  }

  function askName() {
    css();
    var box = document.createElement('div');
    box.id = 'gmRepName';
    box.innerHTML = '<div class="gmCard"><div style="font-size:46px">🎮</div><h2>أهلاً فيك!</h2>' +
      '<div class="gmSub">' + esc(gameName()) + '<br>اكتب/ي اسمك عشان تنحفظ علاماتك ووقتك</div>' +
      '<input id="gmInName" maxlength="40" placeholder="الاسم الثلاثي" autocomplete="name">' +
      '<input id="gmInClass" maxlength="20" placeholder="الصف والشعبة (مثلاً: التاسع أ)">' +
      '<button class="gmBtn gmMain gmFull" id="gmGo">ابدأ اللعب ▶</button>' +
      '<div class="gmNote" id="gmNameNote"></div></div>';
    document.body.appendChild(box);
    stopBubble(box);
    var inN = box.querySelector('#gmInName'), inC = box.querySelector('#gmInClass');
    inN.value = ls(LS_NAME) || ''; inC.value = ls(LS_CLASS) || '';
    var go = function () {
      var n = inN.value.trim();
      if (n.length < 2) { box.querySelector('#gmNameNote').textContent = 'لازم تكتب/ي اسمك أول ✍'; inN.focus(); return; }
      S.name = n; S.klass = inC.value.trim();
      ls(LS_NAME, S.name); ls(LS_CLASS, S.klass);
      S.started = Date.now(); S.lastTick = Date.now();
      box.remove();
      save();
    };
    box.querySelector('#gmGo').onclick = go;
    inN.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
    inC.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
  }

  function showReport(opts) {
    opts = opts || {};
    if (!S.started) { askName(); return; }
    css();
    var old = document.getElementById('gmRep'); if (old) old.remove();
    var r = record(), t = totals();
    var rows = r.sections.map(function (x) {
      return '<tr><td>' + esc(x.label) + '</td><td>' + x.got + ' / ' + x.max + '</td></tr>';
    }).join('');
    var prev = lsJSON(LS_LOCAL, []).filter(function (x) {
      return x.id !== r.id && x.page === r.page && x.name === r.name && (x.timeMs || 0) > 0;
    }).sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); }).slice(0, 5);
    var prevRows = prev.map(function (x) {
      var dd = new Date(x.date);
      return '<tr><td>' + dd.toLocaleDateString('ar-EG') + '</td><td>' + x.score + ' نقطة · ' + esc(x.timeText) +
        (x.pct != null ? ' · ' + x.pct + '%' : '') + '</td></tr>';
    }).join('');
    var d = new Date();
    var box = document.createElement('div');
    box.id = 'gmRep';
    box.innerHTML = '<div class="gmCard">' +
      '<div style="font-size:44px">🏅</div><h2>التقرير النهائي</h2>' +
      '<div class="gmMeta"><b>' + esc(r.name) + '</b>' + (r.klass ? ' — ' + esc(r.klass) : '') + '<br>' +
      '🎮 ' + esc(r.game) + '<br>📅 ' + d.toLocaleDateString('ar-EG') + ' — ' + d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) + '</div>' +
      '<div class="gmRate">' + esc(t.rating) + '</div>' +
      (t.stars ? '<div class="gmStars">' + '★'.repeat(t.stars) + '<span style="opacity:.3">' + '★'.repeat(5 - t.stars) + '</span></div>' : '') +
      '<div class="gmGrid">' +
      '<div class="gmBox"><span>⭐ مجموع النقاط</span><b>' + r.score + (t.max ? ' / ' + t.max : '') + '</b></div>' +
      '<div class="gmBox"><span>⏱ الوقت المستغرق</span><b style="font-size:18px">' + esc(r.timeText) + '</b></div>' +
      '<div class="gmBox"><span>✅ إجابات صحيحة</span><b>' + r.correct + '</b></div>' +
      '<div class="gmBox"><span>❌ إجابات خاطئة</span><b>' + r.wrong + '</b></div>' +
      '</div>' +
      (t.pct != null ? '<div class="gmBox" style="margin-bottom:8px"><span>📈 نسبة الأداء</span><b>' + t.pct + '%</b></div>' : '') +
      (rows ? '<table class="gmTbl">' + rows + '</table>' : '') +
      (prevRows ? '<div class="gmMeta" style="margin-top:10px"><b>📜 محاولاتك السابقة بهاي اللعبة</b></div><table class="gmTbl">' + prevRows + '</table>' : '') +
      '<div class="gmNote" id="gmSaveNote">⏳ جاري الحفظ...</div>' +
      '<div>' +
      (opts.leaving ? '<button class="gmBtn gmMain" id="gmLeave">🏠 متابعة للرئيسية</button>' : '<button class="gmBtn gmMain" id="gmBack">↩ رجوع للعبة</button>') +
      '<button class="gmBtn" id="gmPrint">🖨 طباعة / PDF</button>' +
      (opts.leaving ? '<button class="gmBtn" id="gmBack">↩ رجوع للعبة</button>' : '<button class="gmBtn" id="gmHome2">🏠 الرئيسية</button>') +
      '</div></div>';
    document.body.appendChild(box);
    stopBubble(box);
    var note = box.querySelector('#gmSaveNote');
    save().then(function (ok) {
      note.textContent = ok ? '✔ انحفظ التقرير وانبعث للمعلمة' : '✔ انحفظ على الجهاز — رح ينبعث للمعلمة أول ما يرجع النت';
    });
    var goHome = function () { save(true); try { (window.top || window).location.href = 'index.html'; } catch (e) { location.href = 'index.html'; } };
    box.querySelector('#gmBack').onclick = function () { box.remove(); };
    box.querySelector('#gmPrint').onclick = function () { window.print(); };
    var h = box.querySelector('#gmHome2'); if (h) h.onclick = goHome;
    var l = box.querySelector('#gmLeave'); if (l) l.onclick = goHome;
  }

  function addButton() {
    if (document.getElementById('gmRepBtn')) return;
    var b = document.createElement('button');
    b.id = 'gmRepBtn'; b.title = 'تقريري'; b.setAttribute('aria-label', 'تقريري'); b.textContent = '📊';
    document.body.appendChild(b);
    stopBubble(b);
    b.onclick = function () { showReport(); };
  }

  /* زر 🏠 تبع gm-controls: نعرض التقرير قبل ما نطلع */
  function hookHome() {
    document.addEventListener('click', function (e) {
      var t = e.target && e.target.closest && e.target.closest('#gmHomeBtn,#gmPauseHome');
      if (!t || !S.started) return;
      e.stopImmediatePropagation(); e.preventDefault();
      var p = document.getElementById('gmPause'); if (p) p.style.display = 'none';
      document.documentElement.classList.remove('gm-paused');
      showReport({ leaving: true });
    }, true);
  }

  /* ---------- الواجهة البرمجية للألعاب ---------- */
  window.GMReport = {
    add: function (label, got, max) {
      got = Number(got) || 0; max = Number(max) || 0;
      var ex = S.sections.filter(function (x) { return x.label === label; })[0];
      if (ex) { ex.got = got; ex.max = max; } else S.sections.push({ label: String(label), got: got, max: max });
    },
    score: function (n) { S.setScore = Number(n) || 0; },
    correct: function (n) { S.correct += (n == null ? 1 : n); },
    wrong: function (n) { S.wrong += (n == null ? 1 : n); },
    finish: function () { S.finished = true; showReport(); },
    show: function () { showReport(); },
    data: record
  };

  function init() {
    watch(); addButton(); hookHome();
    if (!S.started) askName();
    nativeInterval(tick, 1000);
    nativeInterval(scanScore, 1500);
    nativeInterval(function () { if (S.started && !S.finished) save(); }, 60000);
    flushQueue();
    window.addEventListener('online', flushQueue);
    window.addEventListener('pagehide', function () { save(true); });
    document.addEventListener('visibilitychange', function () { if (document.hidden) save(true); });
  }
  if (document.body) init(); else document.addEventListener('DOMContentLoaded', init);
})();
