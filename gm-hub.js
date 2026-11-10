/* GamnaMarks — صفحة الاختيار: العب اللعبة أو روحي لأوراق العمل مباشرة
   تصميم وإعداد د. أماني ياسين داود
   - بالصفحة الرئيسية (index.html): لما الطالبة تختار لعبة بتطلعلها صفحة فيها خيارين
       🎮 العب اللعبة      📝 أوراق العمل مباشرة (مع ملاحظة: بدون لعب ما في نقاط)
   - جوّا اللعبة: إذا اختارت أوراق العمل، بعد ما تكتب اسمها بتنفتح أوراق العمل لحالها
     وعلاماتها بتنحفظ عند المعلمة عادي، بس ما بتاخد نقاط بمسابقة النقاط
   - بينضاف تلقائياً مع gm-report.js بكل لعبة، وبالصفحة الرئيسية بسطر:
       <script src="gm-hub.js" defer></script>
   - لعبة جديدة؟ ضيفي سطرها بقائمة WS تحت (اسم الملف بدون .html) */
(function () {
  if (window.GMHub) return;

  /* ===== أوراق العمل بكل لعبة =====
     pre: تنظيف شاشات البداية (فيديو المقدمة…) قبل فتح الورقة
     ws:  [اسم الورقة, الكود اللي بيفتحها]  — إذا في أكثر من ورقة بتختار الطالبة */
  var WS = {
    'aladdin':        { ws: [['أوراق العمل', "openWorksheets()"]] },
    'archimedes-lab': { ws: [['ورقة العمل العادية', "openWS('n')"], ['ورقة التحدي الصعبة', "openWS('h')"]] },
    'babgino':        { ws: [['ورقة عمل المرحلة الأولى', "startWsQuiz('easy');worksheetEasyScreen.classList.remove('hidden')"],
                             ['ورقة عمل المرحلة الثانية', "startGenWorksheet(2);document.getElementById('genWsScreen').classList.remove('hidden')"],
                             ['ورقة عمل المرحلة الثالثة', "startGenWorksheet(3);document.getElementById('genWsScreen').classList.remove('hidden')"]] },
    'castle':         { ws: [['ورقة العمل', "go('pgWin');buildWin();var q=document.getElementById('quizSection'),n=q&&q.previousElementSibling;while(n){n.style.display='none';n=n.previousElementSibling;}window.scrollTo(0,0)"]] },
    'cosette-grammar':{ ws: [['أوراق العمل', "document.getElementById('toWs1').click()"]] },
    'ifclauses':      { ws: [['أوراق التمرين', "screenWorksheets()"]] },
    'island':         { ws: [['ورقة العمل الأولى', "P(13)"], ['ورقة العمل الثانية', "P(14)"]] },
    'kanaan':         { pre: "var b=document.querySelector('#videoContainer button');if(b)b.click()", ws: [['أوراق العمل', "scrWS(1)"]] },
    'khaleej_alabtal':{ ws: [['أوراق العمل', "openWorksheetPicker()"]] },
    'lesson2':        { ws: [['أوراق العمل', "showWS1()"]] },
    'maya':           { ws: [['أوراق العمل', "showWS1()"]] },
    'lock':           { ws: [['ورقة العمل', "go(30)"]] },
    'lumo':           { ws: [['ورقة العمل الأساسية', "openWS('easy')"], ['ورقة العمل المتقدمة', "openWS('hard')"]] },
    'noona':          { ws: [['أوراق العمل', "showWS(1)"]] },
    'noran':          { pre: "document.querySelectorAll('body>video').forEach(function(v){try{v.pause()}catch(e){}v.remove()});document.querySelectorAll('body>button').forEach(function(b){if(/تخطي|تشغيل المقدمة/.test(b.textContent))b.remove()})",
                        ws: [['أوراق العمل', "goScreen('ws');loadSheet('students')"]] },
    'nutrihouse':     { ws: [['أوراق العمل', "document.getElementById('toWs1').click()"]] },
    'room-zero':      { ws: [['أوراق العمل', "document.getElementById('toWs1').click()"]] },
    'room90':         { ws: [['أوراق العمل', "G.worksheet(0)"]] },
    'sally':          { pre: "if(typeof stopIntroCSS==='function')stopIntroCSS();var o=document.getElementById('vidOverlay');if(o&&o.classList.contains('show')&&typeof closeIntro==='function')closeIntro()", ws: [['أوراق العمل', "openWS(1)"]] },
    'samplex':        { pre: "var b=document.getElementById('cineSkip');var c=document.getElementById('cine');if(b&&c&&getComputedStyle(c).display!=='none'&&!c.hidden)b.click()",
                        ws: [['أوراق العمل', "var t=document.getElementById('wsPre');t=t&&t.parentNode;if(t){t.scrollIntoView({block:'center'});t.style.outline='3px solid #FFC145';t.style.borderRadius='14px';t.style.outlineOffset='4px';}"]] },
    'silent-machine': { ws: [['أوراق العمل', "show('worksheets')"]] },
    'sirr-alkhait':   { ws: [['أوراق العمل', "openWs()"]] },
    'smurfs':         { pre: "if(typeof skipIntro==='function'){var s=document.getElementById('introScreen');if(s&&s.style.display!=='none')skipIntro()}", ws: [['أوراق العمل', "go(7)"]] },
    'tawjeeh':        { ws: [['ورقة العمل', "document.getElementById('toSheet').click()"]] },
    'wiam':           { ws: [['أوراق العمل', "WSS={sheet:1,i:0,score:0,total:0,locked:false};go('ws');renderWS()"]] }
  };

  var NOTE = 'إذا رحتي لأوراق العمل بدون ما تلعبي، <b>ما رح تاخدي أي نقاط</b> بمسابقة النقاط — بس علامتك بتنحفظ عند المعلمة.';

  function pageOf(href) { return String(href || '').split(/[?#]/)[0].split('/').pop().replace(/\.html?$/i, ''); }
  var PAGE = pageOf(location.pathname) || 'index';
  function ss(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) { return null; } }
  function run(code) { try { new Function(code)(); return true; } catch (e) { try { console.warn('GMHub', e); } catch (x) {} return false; } }

  function css() {
    if (document.getElementById('gmHubCss')) return;
    var s = document.createElement('style'); s.id = 'gmHubCss';
    s.textContent =
      '#gmHub{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:16px;direction:rtl;' +
      'background:radial-gradient(800px 500px at 80% -10%,#4b2a8f 0%,transparent 60%),radial-gradient(600px 500px at 0% 110%,#1d6f7d 0%,transparent 55%),#0b0a1f;' +
      'font-family:"Baloo Bhaijaan 2","Cairo","Segoe UI",Tahoma,sans-serif;color:#fff;overflow-y:auto}' +
      '#gmHub .hubCard{width:min(440px,100%);text-align:center}' +
      '#gmHub .hubThumb{width:96px;height:96px;border-radius:24px;margin:0 auto 10px;overflow:hidden;background:#ffffff14;display:flex;align-items:center;justify-content:center;font-size:52px;box-shadow:0 10px 30px #0006}' +
      '#gmHub .hubThumb img{width:100%;height:100%;object-fit:cover}' +
      '#gmHub h2{margin:0 0 4px;font-size:24px;line-height:1.3}' +
      '#gmHub .hubSub{color:#c9c3ff;font-size:15px;margin-bottom:18px}' +
      '#gmHub .hubBtn{display:flex;align-items:center;gap:12px;width:100%;border:none;border-radius:20px;padding:16px 18px;margin:0 0 12px;cursor:pointer;font-family:inherit;text-align:right;color:#fff;box-shadow:0 8px 22px #0005;transition:transform .15s}' +
      '#gmHub .hubBtn:active{transform:scale(.97)}' +
      '#gmHub .hubBtn .ic{font-size:36px;line-height:1}' +
      '#gmHub .hubBtn b{display:block;font-size:20px}' +
      '#gmHub .hubBtn small{display:block;font-size:13.5px;opacity:.9;font-weight:600;margin-top:2px}' +
      '#gmHub .hubPlay{background:linear-gradient(135deg,#22c55e,#0ea5e9)}' +
      '#gmHub .hubWs{background:linear-gradient(135deg,#f59e0b,#ef4444)}' +
      '#gmHub .hubAlt{background:#ffffff14;border:1px solid #ffffff2e;box-shadow:none}' +
      '#gmHub .hubNote{background:#fff7e6;color:#7a4a00;border:2px solid #f59e0b;border-radius:16px;padding:10px 12px;font-size:14.5px;line-height:1.7;margin:2px 0 14px;text-align:right}' +
      '#gmHub .hubBack{background:none;border:none;color:#c9c3ff;font-family:inherit;font-size:15px;cursor:pointer;padding:8px 14px;text-decoration:underline}' +
      '#gmWsBar{position:fixed;bottom:10px;left:50%;transform:translateX(-50%);z-index:2147483300;direction:rtl;display:flex;align-items:center;gap:8px;max-width:calc(100vw - 150px);' +
      'background:#7a4a00f2;color:#fff;border:1px solid #f59e0b;border-radius:999px;padding:5px 6px 5px 12px;font:700 12.5px/1.3 "Baloo Bhaijaan 2","Cairo",Tahoma,sans-serif;box-shadow:0 6px 18px #0007}' +
      '#gmWsBar button{border:none;border-radius:999px;background:#22c55e;color:#04210f;font:800 12.5px "Baloo Bhaijaan 2","Cairo",Tahoma,sans-serif;padding:5px 10px;cursor:pointer;white-space:nowrap}';
    (document.head || document.documentElement).appendChild(s);
  }
  function stop(el) { ['click', 'touchstart', 'touchend', 'pointerdown', 'pointerup', 'mousedown', 'mouseup', 'keydown'].forEach(function (ev) { el.addEventListener(ev, function (e) { e.stopPropagation(); }); }); }
  function openHub(html) {
    css(); closeHub();
    var box = document.createElement('div'); box.id = 'gmHub';
    box.innerHTML = '<div class="hubCard">' + html + '</div>';
    document.body.appendChild(box); stop(box);
    return box;
  }
  function closeHub() { var o = document.getElementById('gmHub'); if (o) o.remove(); }

  /* ================= الصفحة الرئيسية ================= */
  function setupIndex() {
    document.addEventListener('click', function (e) {
      var card = e.target && e.target.closest && e.target.closest('a.game-card');
      if (!card || card.__gmHubGo) return;
      var href = card.getAttribute('href') || '', key = pageOf(href);
      if (!WS[key]) return;                       /* لعبة بدون أوراق عمل: بتفتح عادي */
      e.preventDefault(); e.stopImmediatePropagation();
      var title = (card.querySelector('.game-title') || {}).textContent || '';
      var img = card.querySelector('.game-thumb img');
      var thumb = img ? '<img src="' + img.getAttribute('src') + '" alt="">' : '🎮';
      var box = openHub(
        '<div class="hubThumb">' + thumb + '</div>' +
        '<h2>' + esc(title) + '</h2><div class="hubSub">شو حابة تعملي؟</div>' +
        '<button class="hubBtn hubPlay" id="gmHubPlay"><span class="ic">🎮</span><span><b>العبي اللعبة</b><small>العبي، حلّي أوراق العمل بالآخر، واجمعي النقاط ⭐</small></span></button>' +
        '<button class="hubBtn hubWs" id="gmHubWs"><span class="ic">📝</span><span><b>أوراق العمل مباشرة</b><small>بدون لعب — حلّي أوراق العمل بس</small></span></button>' +
        '<div class="hubNote">⚠️ <b>ملاحظة:</b> ' + NOTE + '</div>' +
        '<button class="hubBack" id="gmHubBack">↩ رجوع للألعاب</button>');
      box.querySelector('#gmHubBack').onclick = closeHub;
      box.querySelector('#gmHubPlay').onclick = function () {
        ss('gm_ws_' + key, null); closeHub();
        card.__gmHubGo = true;
        try { card.click(); } finally { card.__gmHubGo = false; }
      };
      box.querySelector('#gmHubWs').onclick = function () {
        ss('gm_ws_' + key, '1'); closeHub();
        location.href = href.split('#')[0] + (href.indexOf('?') >= 0 ? '&' : '?') + 'gmws=1';
      };
    }, true);
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ================= جوّا اللعبة ================= */
  function wsMode() {
    var m = location.search.match(/[?&]gmws=([01])/);
    if (m) ss('gm_ws_' + PAGE, m[1] === '1' ? '1' : null);
    return ss('gm_ws_' + PAGE) === '1';
  }
  function backToPlay() {
    ss('gm_ws_' + PAGE, null);
    location.href = location.pathname.split('/').pop() + '?gmws=0';
  }
  function bar() {
    css();
    if (document.getElementById('gmWsBar')) return;
    var b = document.createElement('div'); b.id = 'gmWsBar';
    b.innerHTML = '<span>📝 بدون لعب = بدون نقاط</span><button>🎮 العبي</button>';
    document.body.appendChild(b); stop(b);
    b.querySelector('button').onclick = backToPlay;
  }
  function openSheet(code) {
    var cfg = WS[PAGE];
    closeHub();
    if (cfg.pre) run(cfg.pre);
    run(code);
    /* شاشات البداية المتأخرة (فيديو المقدمة) ما تغطّي الورقة */
    if (cfg.pre) [700, 2000, 4000].forEach(function (t) { setTimeout(function () { run(cfg.pre); }, t); });
  }
  function pick() {
    var cfg = WS[PAGE];
    if (cfg.pre) run(cfg.pre);
    if (cfg.ws.length === 1) { openSheet(cfg.ws[0][1]); return; }
    var h = '<div class="hubThumb">📝</div><h2>أوراق العمل</h2><div class="hubSub">اختاري الورقة اللي بدك تحلّيها</div>';
    cfg.ws.forEach(function (w, i) {
      h += '<button class="hubBtn hubWs" data-i="' + i + '"><span class="ic">' + (i + 1) + '</span><span><b>' + esc(w[0]) + '</b></span></button>';
    });
    h += '<div class="hubNote">⚠️ ' + NOTE + '</div>' +
      '<button class="hubBtn hubAlt" id="gmHubPlay"><span class="ic">🎮</span><span><b>بدّي ألعب اللعبة</b><small>وأجمع النقاط</small></span></button>';
    var box = openHub(h);
    Array.prototype.forEach.call(box.querySelectorAll('[data-i]'), function (btn) {
      btn.onclick = function () { openSheet(cfg.ws[+btn.getAttribute('data-i')][1]); };
    });
    box.querySelector('#gmHubPlay').onclick = backToPlay;
  }
  function setupGame() {
    if (!WS[PAGE] || !wsMode()) return;
    window.GM_WS_ONLY = true;
    bar();
    var started = false;
    function go() { if (started) return; started = true; setTimeout(pick, 600); }
    /* بنستنى الطالبة تكتب اسمها (gm-report.js) وبعدين بنفتح الورقة */
    if (window.GMReport && window.GMReport.started && window.GMReport.started()) go();
    else if (window.GMReport) document.addEventListener('gm-player-ready', go);
    else setTimeout(go, 1500);
  }

  window.GMHub = { WS: WS, wsOnly: function () { return !!window.GM_WS_ONLY; }, pick: pick };

  function init() { if (document.getElementById('gamesGrid')) setupIndex(); else setupGame(); }
  if (document.body) init(); else document.addEventListener('DOMContentLoaded', init);
})();
