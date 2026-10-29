/* =====================================================================
   GamnaMarks — اللعب الأونلاين الجماعي  (gm-live.js)
   كل طالبة من تلفونها، بنفس الوقت، بشخصية مختلفة
   وضعين:  🤝 تعاون (فريق واحد)   🏁 تنافس (مين الأولى)
   تصميم وإعداد د. أماني ياسين داود

   طريقة الاستعمال بأي لعبة:
     <script src="gm-live.js"></script>
     GMLive.open({ game:'island', total:12, lvl:'normal', onStart:function(cfg){...}, onBack:function(){...} });
     GMLive.report({ step:3, pts:1100, mis:1, done:false, won:false });
     GMLive.mountBoard(document.getElementById('مكان'));   // لوحة السباق داخل شاشة اللعب
     GMLive.resultHTML();                                   // الترتيب النهائي لشاشة النتيجة
   ===================================================================== */
(function () {
  'use strict';
  if (window.GMLive) return;

  var FB_CONFIG = {
    apiKey: "AIzaSyADxQ7-3UDxYD3VTOoVrn7d6516_5bqd5Y",
    authDomain: "cursed-castle-bb43b.firebaseapp.com",
    projectId: "cursed-castle-bb43b",
    storageBucket: "cursed-castle-bb43b.firebasestorage.app",
    messagingSenderId: "458563878259",
    appId: "1:458563878259:web:715ce9f960b2972ccd9906"
  };
  var SDK = 'https://www.gstatic.com/firebasejs/10.12.0/';
  /* أول مكان للتخزين، ولو قواعد الفايربيس رفضته بنستعمل مكان غرف نوران المجرّب */
  var STORES = [{ coll: 'gm_live', pre: '' }, { coll: 'noran_rooms', pre: 'gml_' }];

  var CHARS = [
    { e: '🧕', n: 'البطلة' }, { e: '👧', n: 'الصغيرة' }, { e: '👩‍🦱', n: 'المغامرة' }, { e: '👦', n: 'البطل' },
    { e: '🧑‍🚀', n: 'رائدة الفضاء' }, { e: '🧙‍♀️', n: 'الساحرة' }, { e: '🦸‍♀️', n: 'الخارقة' }, { e: '🧜‍♀️', n: 'حورية البحر' },
    { e: '🧑‍🔬', n: 'العالمة' }, { e: '🥷', n: 'النينجا' }, { e: '🦁', n: 'الأسد' }, { e: '🐬', n: 'الدلفين' }
  ];
  var COLORS = ['#ffc107', '#4caf50', '#29b6f6', '#ef5350', '#ab47bc', '#ff7043', '#26c6da', '#ec407a', '#9ccc65', '#ffa726', '#7e57c2', '#78909c'];

  var S = {
    fb: null, st: STORES[0], code: '', pid: '', name: '', av: '🧕', host: false, spec: false,
    mode: 'coop', lvl: 'normal', total: 12, state: '', players: {}, room: null,
    unsub: [], cfg: {}, started: false, mine: { step: 0, pts: 0, mis: 0, done: false, won: false, runs: 0 },
    lastSent: '', toasts: {}, boards: []
  };

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function lsGet(k) { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
  function now() { return Date.now(); }
  function ms(t) { return t && t.toMillis ? t.toMillis() : (typeof t === 'number' ? t : 0); }

  /* ---------------- Firebase ---------------- */
  var fbP = null;
  function initFB() {
    if (S.fb) return Promise.resolve(S.fb);
    if (window.GMLIVE_TEST_FB) { S.fb = window.GMLIVE_TEST_FB; return Promise.resolve(S.fb); } /* للتجربة فقط */
    if (fbP) return fbP;
    fbP = (async function () {
      try {
        var a = await import(SDK + 'firebase-app.js');
        var f = await import(SDK + 'firebase-firestore.js');
        var app; try { app = a.getApp('gmlive'); } catch (e) { app = a.initializeApp(FB_CONFIG, 'gmlive'); }
        S.fb = Object.assign({ db: f.getFirestore(app) }, f);
        var saved = lsGet('gml_store'); if (saved === '1') S.st = STORES[1];
        return S.fb;
      } catch (e) { console.warn('[GMLive] Firebase off', e); fbP = null; return null; }
    })();
    return fbP;
  }
  function roomDoc(code) { var f = S.fb; return f.doc(f.db, S.st.coll, S.st.pre + (code || S.code)); }
  function plColl() { var f = S.fb; return f.collection(f.db, S.st.coll, S.st.pre + S.code, 'players'); }
  function plDoc(pid) { var f = S.fb; return f.doc(f.db, S.st.coll, S.st.pre + S.code, 'players', pid || S.pid); }
  function denied(e) { return e && (e.code === 'permission-denied' || /permission/i.test(String(e.message || e))); }
  /* بتجرب العملية، ولو انرفضت بتنقل للمكان الاحتياطي وبتعيد */
  async function withStore(fn) {
    try { return await fn(); }
    catch (e) {
      if (denied(e) && S.st === STORES[0]) { S.st = STORES[1]; lsSet('gml_store', '1'); return await fn(); }
      throw e;
    }
  }

  /* ---------------- CSS ---------------- */
  function css() {
    if ($('gmlCss')) return;
    var s = document.createElement('style'); s.id = 'gmlCss';
    s.textContent = [
      '.gml-ov{position:fixed;inset:0;z-index:2147482600;display:none;align-items:center;justify-content:center;padding:14px;background:rgba(5,0,16,.94);font-family:Tajawal,Arial,sans-serif;direction:rtl}',
      '.gml-ov.on{display:flex}',
      '.gml-box{width:100%;max-width:520px;max-height:94vh;overflow:auto;background:linear-gradient(160deg,#10233a,#070d1c);border:2px solid #29b6f6;border-radius:20px;padding:18px 16px;color:#fff;box-shadow:0 0 40px rgba(41,182,246,.25);text-align:center}',
      '.gml-h{font-family:Amiri,serif;font-size:clamp(1.25rem,5vw,1.7rem);color:#4fc3f7;margin-bottom:6px;text-shadow:0 0 16px rgba(79,195,247,.5)}',
      '.gml-sub{font-size:.92rem;color:rgba(220,240,255,.85);margin:4px 0 10px;line-height:1.7}',
      '.gml-in{width:100%;padding:11px 14px;margin:5px 0;border-radius:12px;border:2px solid rgba(79,195,247,.45);background:rgba(0,0,0,.35);color:#fff;font-family:inherit;font-size:1.05rem;text-align:center;box-sizing:border-box}',
      '.gml-code-in{font-size:1.8rem;letter-spacing:8px;font-weight:900}',
      '.gml-chars{display:grid;grid-template-columns:repeat(6,1fr);gap:6px;margin:6px 0 10px}',
      '.gml-ch{font-size:1.7rem;padding:6px 0;border-radius:12px;border:2px solid rgba(255,255,255,.15);background:rgba(255,255,255,.05);cursor:pointer;line-height:1.2}',
      '.gml-ch.sel{border-color:#ffc107;background:rgba(255,193,7,.2);transform:scale(1.08)}',
      '.gml-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:8px 0}',
      '.gml-card{background:rgba(255,255,255,.06);border:2px solid rgba(79,195,247,.35);border-radius:14px;padding:12px 8px;cursor:pointer;color:#fff;font-family:inherit}',
      '.gml-card .e{font-size:1.9rem}.gml-card b{display:block;color:#4fc3f7;font-size:1.05rem;margin:3px 0}.gml-card span{font-size:.78rem;color:rgba(255,255,255,.72);line-height:1.5}',
      '.gml-card.sel{background:rgba(79,195,247,.2);border-color:#4fc3f7;transform:scale(1.03)}',
      '.gml-btn{display:block;width:100%;max-width:340px;margin:10px auto 0;padding:13px;border:none;border-radius:40px;background:linear-gradient(135deg,#0288d1,#4fc3f7);color:#001220;font-family:inherit;font-weight:900;font-size:1.05rem;cursor:pointer}',
      '.gml-btn.alt{background:rgba(255,255,255,.08);color:rgba(255,255,255,.8);border:1px solid rgba(255,255,255,.25);font-weight:700}',
      '.gml-btn.gold{background:linear-gradient(135deg,#ff8f00,#ffc107);color:#1a1000}',
      '.gml-btn:disabled{opacity:.45;cursor:default}',
      '.gml-code{font-size:2.6rem;font-weight:900;letter-spacing:10px;color:#ffc107;background:rgba(0,0,0,.35);border:2px dashed #ffc107;border-radius:16px;padding:6px 10px;margin:8px auto;display:inline-block;direction:ltr}',
      '.gml-tag{display:inline-block;background:rgba(79,195,247,.18);border:1px solid #4fc3f7;color:#b3e5fc;border-radius:20px;padding:3px 12px;font-size:.85rem;margin:2px}',
      '.gml-pl{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:10px 0}',
      '.gml-pc{background:rgba(255,255,255,.07);border:2px solid var(--c);border-radius:14px;padding:6px 10px;min-width:72px}',
      '.gml-pc .e{font-size:1.8rem}.gml-pc .n{font-size:.8rem;font-weight:700;max-width:90px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.gml-chk{display:flex;align-items:center;justify-content:center;gap:8px;font-size:.9rem;color:#ffe082;margin:8px 0;cursor:pointer}',
      '.gml-chk input{width:20px;height:20px}',
      '.gml-err{color:#ef9a9a;font-size:.88rem;min-height:1.2em;margin-top:6px}',
      '.gml-cd{position:fixed;inset:0;z-index:2147482700;display:none;align-items:center;justify-content:center;flex-direction:column;background:rgba(0,0,0,.85);color:#ffc107;font-family:Tajawal,Arial,sans-serif}',
      '.gml-cd.on{display:flex}.gml-cd b{font-size:7rem;font-weight:900;text-shadow:0 0 40px #ffc107;animation:gmlPop .9s ease}',
      '.gml-cd span{color:#fff;font-size:1.1rem;margin-top:10px}',
      '@keyframes gmlPop{0%{transform:scale(2.2);opacity:0}40%{transform:scale(1);opacity:1}100%{transform:scale(.9);opacity:.8}}',
      /* board */
      '.gml-board{box-sizing:border-box;width:100%;direction:rtl;font-family:Tajawal,Arial,sans-serif;background:rgba(0,20,40,.75);border:1.5px solid rgba(79,195,247,.45);border-radius:14px;padding:8px 10px 6px;margin:0 auto 8px;max-width:520px;color:#fff;cursor:pointer}',
      '.gml-bh{display:flex;justify-content:space-between;align-items:center;font-size:.78rem;color:#b3e5fc;font-weight:700;margin-bottom:4px;gap:6px}',
      '.gml-track{position:relative;height:74px;margin:0 18px}',
      '.gml-rail{position:absolute;left:0;right:0;top:62px;height:6px;border-radius:6px;background:repeating-linear-gradient(90deg,#8d6e63 0 10px,#5d4037 10px 14px)}',
      '.gml-fill{position:absolute;right:0;top:62px;height:6px;border-radius:6px;background:linear-gradient(270deg,#4caf50,#ffc107);transition:width .6s}',
      '.gml-end{position:absolute;top:48px;font-size:1.25rem}',
      '.gml-av{position:absolute;transform:translateX(50%);text-align:center;transition:right .7s ease;line-height:1}',
      '.gml-av .e{font-size:1.45rem;display:block;filter:drop-shadow(0 0 4px var(--c))}',
      '.gml-av .n{font-size:.58rem;font-weight:900;color:var(--c);white-space:nowrap;max-width:54px;overflow:hidden;text-overflow:ellipsis;display:block}',
      '.gml-av.me .e{font-size:1.75rem}.gml-av.done .e:after{content:"✅";font-size:.7rem;position:absolute;top:-4px;left:-6px}',
      '.gml-river{margin:2px 0 4px;border-radius:12px;overflow:hidden;background:linear-gradient(180deg,#0b4f6c,#063a52);border:1px solid rgba(79,195,247,.35)}',
      '.gml-river.many{max-height:230px;overflow-y:auto}',
      '.gml-team{position:relative;height:18px;background:rgba(0,0,0,.35);border-bottom:1px solid rgba(255,255,255,.12)}',
      '.gml-team i{position:absolute;right:0;top:0;bottom:0;background:linear-gradient(270deg,#8d6e63,#ffc107);transition:width .6s}',
      '.gml-team span{position:relative;font-size:.68rem;font-weight:900;color:#fff;line-height:18px;text-shadow:0 0 4px #000}',
      '.gml-lane{display:flex;align-items:center;gap:3px;padding:3px 4px;border-bottom:1px dashed rgba(255,255,255,.12);background:repeating-linear-gradient(90deg,rgba(255,255,255,.03) 0 12px,transparent 12px 24px)}',
      '.gml-lane:last-child{border-bottom:none}',
      '.gml-lane.me{background:rgba(255,193,7,.16);box-shadow:inset 0 0 0 1.5px rgba(255,193,7,.7)}',
      '.gml-lane .ln{flex:0 0 46px;font-size:.62rem;font-weight:900;color:var(--c);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:right}',
      '.gml-lane .cells{flex:1;display:flex;justify-content:space-between;align-items:flex-end;min-width:0}',
      '.gml-cell{position:relative;flex:1;text-align:center;height:30px;display:flex;align-items:flex-end;justify-content:center}',
      '.gml-cell .t{font-size:.82rem;line-height:1;opacity:.95}',
      '.gml-cell.past .t{opacity:.28;filter:grayscale(1)}',
      '.gml-cell.shore .t,.gml-cell.goal .t{font-size:.95rem}',
      '.gml-cell .who{position:absolute;bottom:9px;left:50%;transform:translateX(-50%);font-size:1.15rem;line-height:1;filter:drop-shadow(0 0 4px var(--c)) drop-shadow(0 2px 1px #000);z-index:2}',
      '.gml-lane.me .gml-cell .who{font-size:1.35rem}',
      '.gml-cell .who.hop{animation:gmlHop .7s ease}',
      '@keyframes gmlHop{0%{transform:translate(60%,0)}45%{transform:translate(-10%,-16px)}100%{transform:translate(-50%,0)}}',
      '.gml-bf{font-size:.78rem;color:#ffe082;text-align:center;margin-top:2px}',
      '.gml-rows{margin-top:6px}',
      '.gml-row{display:grid;grid-template-columns:26px 34px 1fr auto;align-items:center;gap:6px;background:rgba(255,255,255,.05);border-radius:10px;padding:5px 7px;margin:4px 0;font-size:.82rem;text-align:right}',
      '.gml-row.me{background:rgba(255,193,7,.14);border:1px solid rgba(255,193,7,.5)}',
      '.gml-row .r{font-weight:900;color:#ffc107;text-align:center}.gml-row .e{font-size:1.4rem;text-align:center}',
      '.gml-pb{height:6px;border-radius:6px;background:rgba(255,255,255,.12);overflow:hidden;margin-top:3px}.gml-pb i{display:block;height:100%;background:var(--c);transition:width .6s}',
      '.gml-row .s{font-size:.72rem;color:rgba(255,255,255,.75);text-align:left;white-space:nowrap}',
      '#gmlChip{position:fixed;top:62px;right:12px;z-index:99996;display:none;background:rgba(2,30,55,.92);border:2px solid #4fc3f7;color:#fff;border-radius:30px;padding:6px 12px;font-family:Tajawal,Arial,sans-serif;font-weight:900;font-size:.9rem;cursor:pointer;box-shadow:0 0 14px rgba(79,195,247,.4)}',
      '#gmlToast{position:fixed;top:62px;left:50%;transform:translateX(-50%) translateY(-20px);z-index:2147482650;opacity:0;pointer-events:none;background:linear-gradient(135deg,#0288d1,#4fc3f7);color:#001220;font-family:Tajawal,Arial,sans-serif;font-weight:900;font-size:.95rem;border-radius:30px;padding:8px 18px;transition:all .35s;max-width:90vw;text-align:center}',
      '#gmlToast.on{opacity:1;transform:translateX(-50%) translateY(0)}',
      '.gml-final{background:rgba(79,195,247,.1);border:1.5px solid #4fc3f7;border-radius:14px;padding:10px;margin:10px 0;text-align:center}',
      '.gml-final .t{font-size:1.15rem;font-weight:900;color:#ffc107;margin-bottom:4px}'
    ].join('\n');
    document.head.appendChild(s);
  }

  /* ---------------- UI helpers ---------------- */
  var ov, box, cd, chip, toastEl, fullOv;
  function build() {
    if (ov) return;
    css();
    ov = document.createElement('div'); ov.className = 'gml-ov'; ov.id = 'gmlOv';
    box = document.createElement('div'); box.className = 'gml-box'; ov.appendChild(box);
    document.body.appendChild(ov);
    cd = document.createElement('div'); cd.className = 'gml-cd'; document.body.appendChild(cd);
    chip = document.createElement('div'); chip.id = 'gmlChip'; chip.onclick = function () { openFull(); }; document.body.appendChild(chip);
    toastEl = document.createElement('div'); toastEl.id = 'gmlToast'; document.body.appendChild(toastEl);
    fullOv = document.createElement('div'); fullOv.className = 'gml-ov'; fullOv.id = 'gmlFull';
    fullOv.innerHTML = '<div class="gml-box"><div class="gml-h" id="gmlFT">🏁 لوحة الغرفة</div><div class="gml-sub" id="gmlFS"></div><div id="gmlFB"></div><button class="gml-btn alt" id="gmlFC">رجوع للعبة ←</button><button class="gml-btn alt" id="gmlFH" style="display:none">🏠 إنهاء المتابعة والرجوع للرئيسية</button></div>';
    document.body.appendChild(fullOv);
    $('gmlFC').onclick = function () { fullOv.classList.remove('on'); };
    $('gmlFH').onclick = function () { if (confirm('أكيد بدك تطلعي من المتابعة؟')) { leave(); location.href = S.cfg.home || 'index.html'; } };
  }
  function toast(msg, key) {
    if (key) { if (S.toasts[key]) return; S.toasts[key] = 1; }
    toastEl.textContent = msg; toastEl.classList.add('on');
    clearTimeout(toastEl._t); toastEl._t = setTimeout(function () { toastEl.classList.remove('on'); }, 2600);
  }
  function show(html) { box.innerHTML = html; ov.classList.add('on'); box.scrollTop = 0; }
  function hide() { ov.classList.remove('on'); }
  function err(m) { var e = $('gmlErr'); if (e) e.textContent = m || ''; }
  function modeName(m) { return m === 'race' ? '🏁 تنافس' : '🤝 تعاون'; }
  function lvlName(l) { return l === 'hard' ? '🔥 صعب' : (l === 'easy' ? '🟢 سهل' : '🙂 عادي'); }

  /* ---------------- screen 1: name + character ---------------- */
  function viewMe() {
    S.name = S.name || lsGet('gml_name') || lsGet('gm_student_name') || '';
    S.av = lsGet('gml_av') || S.av;
    show(
      '<div class="gml-h">🌐 العبي أونلاين مع صاحباتك</div>' +
      '<div class="gml-sub">كل وحدة من تلفونها، بنفس الوقت، وكل وحدة بشخصيتها 🎭</div>' +
      '<input class="gml-in" id="gmlName" maxlength="18" placeholder="اكتبي اسمك" value="' + esc(S.name) + '">' +
      '<div class="gml-sub" style="margin:8px 0 2px">🎭 اختاري شخصيتك:</div>' +
      '<div class="gml-chars" id="gmlChars">' + CHARS.map(function (c) { return '<button class="gml-ch' + (c.e === S.av ? ' sel' : '') + '" data-e="' + c.e + '" title="' + c.n + '">' + c.e + '</button>'; }).join('') + '</div>' +
      '<button class="gml-btn gold" id="gmlNew">➕ أنشئي غرفة جديدة</button>' +
      '<button class="gml-btn" id="gmlJoin">🔑 ادخلي بكود غرفة</button>' +
      '<div class="gml-err" id="gmlErr"></div>' +
      '<button class="gml-btn alt" id="gmlBack">→ رجوع لطرق اللعب</button>'
    );
    box.querySelectorAll('.gml-ch').forEach(function (b) {
      b.onclick = function () { S.av = b.getAttribute('data-e'); box.querySelectorAll('.gml-ch').forEach(function (x) { x.classList.toggle('sel', x === b); }); };
    });
    function takeName() {
      var v = ($('gmlName').value || '').trim();
      if (!v) { err('اكتبي اسمك أول 🙂'); $('gmlName').focus(); return false; }
      if (window.PVChat && PVChat.badName && PVChat.badName(v)) { err('اختاري اسم مناسب لو سمحتي'); return false; }
      S.name = v; lsSet('gml_name', v); lsSet('gml_av', S.av); return true;
    }
    $('gmlNew').onclick = function () { if (takeName()) viewCreate(); };
    $('gmlJoin').onclick = function () { if (takeName()) viewJoin(); };
    $('gmlBack').onclick = function () { hide(); if (S.cfg.onBack) S.cfg.onBack(); };
  }

  /* ---------------- screen 2a: create ---------------- */
  function viewCreate() {
    var m = 'coop';
    show(
      '<div class="gml-h">➕ غرفة جديدة</div>' +
      '<div class="gml-sub">اختاري طريقة اللعب للغرفة كلها:</div>' +
      '<div class="gml-grid">' +
      '<button class="gml-card sel" data-m="coop"><div class="e">🤝</div><b>تعاون</b><span>كلنا فريق واحد، وكل إجابة صح بتبني جسر الفريق</span></button>' +
      '<button class="gml-card" data-m="race"><div class="e">🏁</div><b>تنافس</b><span>سباق! مين أول وحدة بتحرّر فارس</span></button>' +
      '</div>' +
      '<div class="gml-sub">المستوى: <span class="gml-tag">' + lvlName(S.lvl) + '</span></div>' +
      '<label class="gml-chk"><input type="checkbox" id="gmlSpec"> 👩‍🏫 أنا المعلمة، بتابع بس وما بلعب</label>' +
      '<button class="gml-btn gold" id="gmlMake">🚀 أنشئي الغرفة</button>' +
      '<div class="gml-err" id="gmlErr"></div>' +
      '<button class="gml-btn alt" id="gmlBack">→ رجوع</button>'
    );
    box.querySelectorAll('.gml-card').forEach(function (c) {
      c.onclick = function () { m = c.getAttribute('data-m'); box.querySelectorAll('.gml-card').forEach(function (x) { x.classList.toggle('sel', x === c); }); };
    });
    $('gmlBack').onclick = viewMe;
    $('gmlMake').onclick = async function () {
      var btn = $('gmlMake'); btn.disabled = true; err('');
      var f = await initFB();
      if (!f) { btn.disabled = false; err('ما في اتصال بالإنترنت، جربي كمان مرة'); return; }
      try {
        var code = '';
        for (var i = 0; i < 6; i++) {
          code = String(Math.floor(10000 + Math.random() * 90000));
          var ex = await withStore(function () { return f.getDoc(roomDoc(code)); });
          if (!ex.exists() || (now() - (ex.data().created || 0)) > 6 * 3600 * 1000) break;
        }
        S.code = code; S.host = true; S.spec = $('gmlSpec').checked; S.mode = m;
        S.pid = 'p' + now().toString(36) + Math.random().toString(36).slice(2, 6);
        await withStore(function () {
          return f.setDoc(roomDoc(), { game: S.cfg.game || 'game', mode: m, lvl: S.lvl, host: S.pid, hostName: S.name, state: 'lobby', created: now(), startAt: 0 });
        });
        await writeMe(true);
        listen(); viewLobby();
      } catch (e) { console.warn(e); btn.disabled = false; err('صار خلل بإنشاء الغرفة، جربي كمان مرة'); }
    };
  }

  /* ---------------- screen 2b: join ---------------- */
  function viewJoin() {
    show(
      '<div class="gml-h">🔑 ادخلي الغرفة</div>' +
      '<div class="gml-sub">اكتبي الكود اللي على تلفون صاحبتك أو المعلمة:</div>' +
      '<input class="gml-in gml-code-in" id="gmlCode" inputmode="numeric" maxlength="5" placeholder="•••••">' +
      '<button class="gml-btn gold" id="gmlGoIn">✅ ادخلي</button>' +
      '<div class="gml-err" id="gmlErr"></div>' +
      '<button class="gml-btn alt" id="gmlBack">→ رجوع</button>'
    );
    $('gmlBack').onclick = viewMe;
    setTimeout(function () { var c = $('gmlCode'); if (c) c.focus(); }, 80);
    $('gmlGoIn').onclick = async function () {
      var code = ($('gmlCode').value || '').replace(/\D/g, '');
      if (code.length !== 5) { err('الكود 5 أرقام'); return; }
      var btn = $('gmlGoIn'); btn.disabled = true; err('');
      var f = await initFB();
      if (!f) { btn.disabled = false; err('ما في اتصال بالإنترنت، جربي كمان مرة'); return; }
      try {
        var d = await withStore(function () { return f.getDoc(roomDoc(code)); });
        if (!d.exists() && S.st === STORES[0]) { S.st = STORES[1]; d = await f.getDoc(roomDoc(code)); if (!d.exists()) S.st = STORES[0]; else lsSet('gml_store', '1'); }
        if (!d.exists()) { btn.disabled = false; err('ما لقيت غرفة بهاد الكود 🤔'); return; }
        var r = d.data();
        if (r.game && S.cfg.game && r.game !== S.cfg.game) { btn.disabled = false; err('هاي الغرفة للعبة ثانية'); return; }
        if (r.state === 'end') { btn.disabled = false; err('هاي الغرفة خلصت'); return; }
        S.code = code; S.host = false; S.spec = false; S.mode = r.mode; S.lvl = r.lvl || 'normal';
        /* رقم اللاعبة محفوظ لهاي الصفحة بس، عشان لو حدّثت الصفحة ترجع بنفس مكانها */
        var ssk = 'gml_pid_' + code, sp = '';
        try { sp = sessionStorage.getItem(ssk) || ''; } catch (e) { }
        S.pid = sp || ('p' + now().toString(36) + Math.random().toString(36).slice(2, 6));
        try { sessionStorage.setItem(ssk, S.pid); } catch (e) { }
        await writeMe(true);
        listen(); viewLobby();
      } catch (e) { console.warn(e); btn.disabled = false; err('صار خلل بالدخول، جربي كمان مرة'); }
    };
  }

  /* ---------------- lobby ---------------- */
  function playersArr() {
    var a = Object.keys(S.players).map(function (k) { return S.players[k]; });
    a.sort(function (x, y) { return (x.j || 0) - (y.j || 0); });
    a.forEach(function (p, i) { p.c = COLORS[i % COLORS.length]; });
    return a;
  }
  function viewLobby() {
    if (S.started) return;
    var pl = playersArr();
    var players = pl.filter(function (p) { return !p.spec; });
    show(
      '<div class="gml-h">🏠 غرفة اللعب</div>' +
      '<div class="gml-sub">' + (S.host ? 'خلّي صاحباتك يدخلوا بهاد الكود:' : 'إنتِ جوّا الغرفة 🎉') + '</div>' +
      '<div class="gml-code">' + esc(S.code) + '</div>' +
      '<div><span class="gml-tag">' + modeName(S.mode) + '</span><span class="gml-tag">' + lvlName(S.lvl) + '</span><span class="gml-tag">👥 ' + players.length + '</span></div>' +
      '<div class="gml-pl">' + pl.map(function (p) {
        return '<div class="gml-pc" style="--c:' + p.c + '"><div class="e">' + (p.spec ? '👩‍🏫' : esc(p.av)) + '</div><div class="n">' + esc(p.n) + (p.id === S.pid ? ' (أنا)' : '') + '</div>' +
          (p.host ? '<div style="font-size:.65rem;color:#ffc107">👑 صاحبة الغرفة</div>' : '') + '</div>';
      }).join('') + '</div>' +
      '<div class="gml-sub" style="font-size:.82rem">' + (S.mode === 'race'
        ? '🏁 كل وحدة بتجاوب على أسئلتها، والأسرع بتحرير فارس هي الفائزة. بتشوفوا بعض على مسار السباق!'
        : '🤝 كلكم فريق واحد: كل إجابة صح من أي وحدة بتبني جسر الفريق، والفوز لما الكل يحرّر فارس!') + '</div>' +
      (S.host
        ? '<button class="gml-btn gold" id="gmlStart"' + (players.length ? '' : ' disabled') + '>▶️ يلا نبلّش كلنا!</button>' +
          (players.length < 2 ? '<div class="gml-sub" style="font-size:.8rem;color:#ffe082">⏳ استني صاحباتك يدخلوا...</div>' : '')
        : '<div class="gml-sub" style="color:#ffe082">⏳ استني ' + esc((S.room && S.room.hostName) || 'صاحبة الغرفة') + ' تبلّش اللعبة...</div>') +
      '<div class="gml-err" id="gmlErr"></div>' +
      '<button class="gml-btn alt" id="gmlLeave">🚪 اطلعي من الغرفة</button>'
    );
    if ($('gmlStart')) $('gmlStart').onclick = async function () {
      this.disabled = true;
      try { await S.fb.updateDoc(roomDoc(), { state: 'play', startAt: now() }); }
      catch (e) { this.disabled = false; err('ما زبط، جربي كمان مرة'); }
    };
    $('gmlLeave').onclick = function () { leave(); viewMe(); };
  }

  /* ---------------- data ---------------- */
  async function writeMe(first) {
    var f = S.fb; if (!f || !S.code) return;
    var m = S.mine;
    var d = { id: S.pid, n: S.name, av: S.av, spec: !!S.spec, host: !!S.host, step: m.step, total: S.total, pts: m.pts, mis: m.mis, done: !!m.done, won: !!m.won, runs: m.runs, last: now() };
    if (first) d.j = now();
    if (m.done && !m.finSent) { d.finAt = f.serverTimestamp(); m.finSent = true; }
    try { await withStore(function () { return f.setDoc(plDoc(), d, { merge: true }); }); } catch (e) { console.warn('[GMLive] write', e); }
  }
  function listen() {
    stopListen();
    var f = S.fb;
    S.unsub.push(f.onSnapshot(roomDoc(), function (d) {
      if (!d.exists()) return;
      S.room = d.data(); S.mode = S.room.mode; S.lvl = S.room.lvl || S.lvl;
      if (S.room.state === 'play' && !S.started) begin();
      else if (!S.started) viewLobby();
    }, function () { }));
    S.unsub.push(f.onSnapshot(plColl(), function (snap) {
      var old = S.players; S.players = {};
      snap.forEach(function (x) { var p = x.data(); S.players[p.id || x.id] = p; });
      events(old);
      if (!S.started && ov.classList.contains('on')) viewLobby();
      renderBoards();
    }, function () { }));
    clearInterval(S.hb); S.hb = setInterval(function () { if (S.code) writeMe(false); }, 20000);
    clearInterval(S.vt); S.vt = setInterval(function () { if (S.started) renderBoards(); }, 1500);
  }
  function stopListen() { S.unsub.forEach(function (u) { try { u(); } catch (e) { } }); S.unsub = []; clearInterval(S.hb); clearInterval(S.vt); }
  function leave() {
    var f = S.fb, code = S.code, pid = S.pid;
    stopListen();
    if (f && code && !S.started) { try { f.deleteDoc(plDoc(pid)); } catch (e) { } }
    S.code = ''; S.players = {}; S.started = false; S.room = null; S.toasts = {};
    if (chip) chip.style.display = 'none';
  }

  /* أحداث بين اللاعبات: مين جاوبت صح، مين خلّصت، مين سبقت */
  function events(old) {
    if (!S.started) return;
    Object.keys(S.players).forEach(function (k) {
      var p = S.players[k], o = old[k]; if (!o || k === S.pid || p.spec) return;
      if (p.done && !o.done) toast(p.av + ' ' + p.n + (p.won ? ' حرّرت فارس! 🏆' : ' خلّصت المغامرة'), 'fin' + k);
      else if (S.mode === 'coop' && p.step > o.step && p.step < S.total) toast('💚 ' + p.n + ' جاوبت صح وبنت قطعة من جسر الفريق!');
      else if (S.mode === 'race' && p.step > o.step && p.step > S.mine.step && o.step <= S.mine.step && !S.mine.done) toast('⚡ ' + p.n + ' سبقتك! يلا شدّي حيلك 💪');
      if (p.runs > (o.runs || 0)) toast('😱 ' + p.n + ' رجعت من البداية' + (S.mode === 'coop' ? '، شجّعوها!' : ''));
    });
    if (S.mode === 'coop') {
      var pl = playersArr().filter(function (p) { return !p.spec; });
      if (pl.length && pl.every(function (p) { return p.done; })) toast('🤝🏆 الفريق كله خلّص وحرّر فارس! برافو عليكم', 'teamdone');
    }
  }

  /* ---------------- start ---------------- */
  function begin() {
    S.started = true; hide();
    S.mine = { step: 0, pts: 0, mis: 0, done: false, won: false, runs: 0 };
    var n = 3; cd.classList.add('on');
    function tick() {
      cd.innerHTML = '<b>' + (n > 0 ? n : 'يلا!') + '</b><span>' + modeName(S.mode) + ' · الغرفة ' + esc(S.code) + '</span>';
      if (n < 0) { cd.classList.remove('on'); go(); return; }
      n--; setTimeout(tick, 900);
    }
    tick();
  }
  function go() {
    chip.style.display = 'block'; renderBoards();
    if (window.PVChat && PVChat.startWith) { try { PVChat.startWith('L' + S.code, S.name, S.host ? 'teacher' : 'student'); } catch (e) { } }
    if (S.spec) { openFull(true); return; }
    if (S.cfg.onStart) S.cfg.onStart({ name: S.name, av: S.av, lvl: S.lvl, mode: S.mode, code: S.code, host: S.host });
  }

  /* ---------------- boards ---------------- */
  function ranked() {
    var pl = playersArr().filter(function (p) { return !p.spec; });
    return pl.slice().sort(function (a, b) {
      if (a.done !== b.done) return a.done ? -1 : 1;
      if (a.done && b.done) { if (a.won !== b.won) return a.won ? -1 : 1; return (ms(a.finAt) || 9e15) - (ms(b.finAt) || 9e15); }
      return (b.step - a.step) || (b.pts - a.pts);
    });
  }
  function teamPct(pl) {
    if (!pl.length) return 0;
    var s = 0; pl.forEach(function (p) { s += Math.min(p.step, S.total); });
    return Math.round(s / (S.total * pl.length) * 100);
  }
  function boardHTML(full) {
    var r = ranked(), pl = playersArr().filter(function (p) { return !p.spec; });
    var meRank = 0; r.forEach(function (p, i) { if (p.id === S.pid) meRank = i + 1; });
    var tp = teamPct(pl), sumPts = 0; pl.forEach(function (p) { sumPts += p.pts || 0; });
    var head = S.mode === 'coop'
      ? '<span>🤝 تعاون · ' + pl.length + ' لاعبات</span><span>💚 قوة الفريق ' + sumPts + '</span>'
      : '<span>🏁 تنافس · ' + pl.length + ' لاعبات</span><span>' + (meRank ? '🎯 مركزك ' + meRank + ' من ' + r.length : '') + '</span>';
    /* النهر: كل بنت إلها حارة فيها تماسيحها، والكل بنفس المشهد */
    S.prev = S.prev || {};
    var track = '<div class="gml-river' + (pl.length > 6 ? ' many' : '') + '">' +
      (S.mode === 'coop' ? '<div class="gml-team"><i style="width:' + tp + '%"></i><span>🌉 جسر الفريق ' + tp + '%</span></div>' : '') +
      pl.map(function (p) {
        var st = Math.max(0, Math.min(p.step || 0, S.total));
        var hop = S.prev[p.id] != null && st > S.prev[p.id];
        var cells = '';
        for (var k = 0; k <= S.total; k++) {
          var thing = k === 0 ? '🏝️' : (k === S.total ? (p.done && p.won ? '🏆' : '👹') : '🐊');
          var cls = 'gml-cell' + (k < st ? ' past' : '') + (k === 0 ? ' shore' : '') + (k === S.total ? ' goal' : '');
          cells += '<span class="' + cls + '"><span class="t">' + thing + '</span>' +
            (k === st ? '<span class="who' + (hop ? ' hop' : '') + '" style="--c:' + p.c + '">' + esc(p.av) + '</span>' : '') + '</span>';
        }
        return '<div class="gml-lane' + (p.id === S.pid ? ' me' : '') + (p.done ? ' done' : '') + '" style="--c:' + p.c + '">' +
          '<span class="ln">' + esc(p.n) + (p.done ? ' ✅' : '') + '</span><span class="cells">' + cells + '</span></div>';
      }).join('') + '</div>';
    if (!full) pl.forEach(function (p) { S.prev[p.id] = Math.max(0, Math.min(p.step || 0, S.total)); });
    var foot = S.mode === 'coop'
      ? '<div class="gml-bf">🤝 كل إجابة صح من أي وحدة بتبني جسر الفريق · اضغطي للتفاصيل</div>'
      : '<div class="gml-bf">' + (r[0] ? '👑 بالمقدمة: ' + esc(r[0].av + ' ' + r[0].n) : '') + ' · اضغطي للتفاصيل</div>';
    var rows = '';
    if (full) {
      rows = '<div class="gml-rows">' + r.map(function (p, i) {
        var pct = Math.min(100, Math.round(Math.min(p.step, S.total) / S.total * 100));
        var stale = !p.done && (now() - (p.last || 0)) > 60000;
        var st = p.done ? (p.won ? '✅ حرّرت فارس' : '🏁 خلّصت') : (stale ? '💤 مش متصلة' : '🎮 ' + Math.min(p.step, S.total) + '/' + S.total);
        return '<div class="gml-row' + (p.id === S.pid ? ' me' : '') + '" style="--c:' + p.c + '"><span class="r">' + (S.mode === 'race' ? (i + 1) : '•') + '</span><span class="e">' + esc(p.av) + '</span>' +
          '<div><b>' + esc(p.n) + '</b><div class="gml-pb"><i style="width:' + pct + '%"></i></div></div>' +
          '<span class="s">' + st + '<br>💚' + (p.pts || 0) + ' · ❌' + (p.mis || 0) + (p.runs ? ' · 🔄' + p.runs : '') + '</span></div>';
      }).join('') + '</div>';
    }
    return '<div class="gml-bh">' + head + '</div>' + track + (full ? rows : foot);
  }
  function renderBoards() {
    if (!S.started) return;
    S.boards.forEach(function (el) { if (el && el.isConnected) el.innerHTML = boardHTML(false); });
    if (fullOv && fullOv.classList.contains('on')) { $('gmlFB').innerHTML = boardHTML(true); fullSub(); }
    if (chip) {
      var vis = S.boards.some(function (el) { return el && el.isConnected && el.offsetParent !== null; });
      chip.style.display = vis ? 'none' : 'block';
      var r = ranked(), me = 0; r.forEach(function (p, i) { if (p.id === S.pid) me = i + 1; });
      chip.textContent = S.mode === 'coop' ? '🤝 الفريق ' + teamPct(r) + '%' : (S.spec ? '🏁 ' + r.length + ' لاعبات' : '🏁 مركزك ' + me + '/' + r.length);
    }
  }
  function fullSub() {
    $('gmlFS').innerHTML = '<span class="gml-tag">الغرفة ' + esc(S.code) + '</span><span class="gml-tag">' + modeName(S.mode) + '</span><span class="gml-tag">' + lvlName(S.lvl) + '</span>';
  }
  function openFull(spec) {
    if (!S.started) return;
    $('gmlFT').textContent = spec || S.spec ? '👩‍🏫 متابعة الغرفة مباشرة' : (S.mode === 'coop' ? '🤝 الفريق' : '🏁 السباق');
    $('gmlFC').style.display = (spec || S.spec) ? 'none' : 'block';
    $('gmlFH').style.display = (spec || S.spec) ? 'block' : 'none';
    $('gmlFB').innerHTML = boardHTML(true); fullSub(); fullOv.classList.add('on');
  }

  /* ---------------- public API ---------------- */
  window.GMLive = {
    open: function (cfg) {
      S.cfg = cfg || {}; S.total = S.cfg.total || 12; S.lvl = S.cfg.lvl || 'normal';
      build(); initFB(); viewMe();
    },
    active: function () { return S.started && !S.spec; },
    mode: function () { return S.started ? S.mode : ''; },
    report: function (o) {
      if (!S.started || S.spec) return;
      var m = S.mine, wasDone = m.done;
      if (o.step < m.step && !m.done) m.runs++;
      if (!m.done) { m.step = o.step; m.pts = o.pts; m.mis = o.mis; }
      if (o.done && !m.done) { m.done = true; m.won = !!o.won; m.pts = o.pts; m.step = o.won ? S.total : m.step; }
      var key = [m.step, m.pts, m.mis, m.done, m.runs].join('|');
      if (key === S.lastSent) return;
      S.lastSent = key;
      var me = S.players[S.pid]; if (me) { me.step = m.step; me.pts = m.pts; me.mis = m.mis; me.done = m.done; me.won = m.won; me.runs = m.runs; if (m.done && !me.finAt) me.finAt = now(); }
      renderBoards(); writeMe(false);
      if (m.done && !wasDone) {
        setTimeout(function () {
          var r = ranked(), rk = 0; r.forEach(function (p, i) { if (p.id === S.pid) rk = i + 1; });
          if (S.mode === 'race') toast(m.won ? '🏆 حرّرتي فارس! ترتيبك ' + rk + ' من ' + r.length : 'خلّصتي! ترتيبك ' + rk + ' من ' + r.length);
          else toast('🤝 خلّصتي دورك! شوفي صاحباتك وين وصلوا');
        }, 1500);
      }
    },
    mountBoard: function (el) {
      if (!el) return; build();
      el.classList.add('gml-board'); el.onclick = function () { openFull(); };
      if (S.boards.indexOf(el) === -1) S.boards.push(el);
      el.style.display = S.started && !S.spec ? '' : 'none';
      renderBoards();
    },
    refresh: function () { S.boards.forEach(function (el) { el.style.display = S.started && !S.spec ? '' : 'none'; }); renderBoards(); },
    resultHTML: function () {
      if (!S.started) return '';
      var r = ranked(), pl = playersArr().filter(function (p) { return !p.spec; });
      var rk = 0; r.forEach(function (p, i) { if (p.id === S.pid) rk = i + 1; });
      var t = S.mode === 'race'
        ? (rk === 1 && S.mine.won ? '👑 إنتِ الأولى بالسباق!' : '🏁 ترتيبك بالسباق: ' + rk + ' من ' + r.length)
        : (pl.every(function (p) { return p.done; }) ? '🤝🏆 الفريق كله حرّر فارس!' : '🤝 جسر الفريق: ' + teamPct(pl) + '%');
      return '<div class="gml-final"><div class="t">' + t + '</div>' + boardHTML(true) + '</div>';
    },
    leave: leave
  };
})();
