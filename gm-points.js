/* GamnaMarks — مسابقة النقاط الشهرية
   تصميم وإعداد د. أماني ياسين داود
   - النقاط بتنحسب تلقائياً من تقرير كل لعبة (gm-report.js) — ما في داعي تعديل الألعاب
   - كل شهر في فائزة وحدة للتطبيق كله، والنقاط الشهرية بتبلش من صفر أول كل شهر
   - الجوائز: 100 شهادة تقدير (للكل) · 300 هدية · 500 علامة إضافية (لطالبات د. أماني بس)
   - الزائرة بتاخذ لقب جاهز (ما في كتابة أسماء)، وطالبات د. أماني بيظهروا باسمهن الأول
   سطر الإضافة بأي صفحة:  <script src="gm-points.js" defer></script>
   لوحة المسابقة جوّا عنصر:  <div data-gmp-board></div>
   شارة النقاط العائمة:      <script src="gm-points.js" data-badge="1" defer></script> */
(function () {
  if (window.GMPoints) return;

  var PROJECT = 'cursed-castle-bb43b';
  var API_KEY = 'AIzaSyADxQ7-3UDxYD3VTOoVrn7d6516_5bqd5Y';
  var DOCS = 'https://firestore.googleapis.com/v1/projects/' + PROJECT + '/databases/(default)/documents';
  var COLL = 'gm_points';

  /* ===== قواعد النقاط (بتقدري تغيريها من هون) ===== */
  var RULES = {
    minPlayMs: 30000,      /* أقل من نص دقيقة لعب ما بينحسب */
    perTwoMin: 1,          /* نقطة لكل دقيقتين لعب */
    timeMax: 15,           /* أعلى نقاط وقت بالجلسة */
    perCorrect: 2,         /* لكل إجابة صحيحة */
    correctMax: 30,
    trophy: 30,            /* إنهاء اللعبة / الكأس */
    ws1: 10, ws2: 20, wsExtra: 15,  /* أوراق العمل (حسب العلامة) */
    sessionMax: 100,       /* أعلى نقاط بالجلسة الوحدة */
    gameDayMax: 100        /* أعلى نقاط من نفس اللعبة باليوم */
  };
  var TIERS = [
    { pts: 100, key: 'cert', icon: '📜', label: 'شهادة تقدير', who: 'all' },
    { pts: 300, key: 'gift', icon: '🎁', label: 'هدية', who: 'student' },
    { pts: 500, key: 'mark', icon: '⭐', label: 'علامة إضافية', who: 'student' }
  ];

  /* ألقاب جاهزة للزائرات (بدل كتابة الاسم) */
  var NICKS = ['نجمة لامعة ⭐', 'صقر سريع 🦅', 'عالمة صغيرة 🔬', 'فراشة ملونة 🦋', 'قمر منير 🌙', 'نحلة نشيطة 🐝',
    'زيتونة خضراء 🫒', 'دلفين ذكي 🐬', 'كوكب بعيد 🪐', 'وردة جورية 🌹', 'بطلة الألغاز 🧩', 'مكتشفة النجوم 🔭',
    'سنبلة ذهبية 🌾', 'غيمة بيضاء ☁️', 'شمس الصباح 🌞', 'لؤلؤة البحر 🦪', 'مخترعة صغيرة 💡', 'قارئة نهمة 📚',
    'حمامة السلام 🕊️', 'نخلة عالية 🌴', 'بوصلة الطريق 🧭', 'شلال صافي 💧', 'مجرة سعيدة 🌌', 'ياسمينة بيضاء 🤍',
    'برتقالة يافا 🍊', 'ريشة فنانة 🎨', 'سهم الحكمة 🎯', 'مغامرة شجاعة 🗺️', 'خلية نشيطة 🧬', 'بركان الأفكار 🌋'];

  var LS_PROF = 'gm_pts_profile', LS_DEV = 'gm_pts_device', LS_BAN = 'gm_pts_banned';

  /* ---------- أدوات ---------- */
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }
  function lsJ(k, d) { try { return JSON.parse(ls(k) || '') || d; } catch (e) { return d; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function hash(str) {
    var a = 0x811c9dc5, b = 0x01000193;
    for (var i = 0; i < str.length; i++) { var c = str.charCodeAt(i); a = Math.imul(a ^ c, 16777619) >>> 0; b = Math.imul(b ^ c, 2246822519) >>> 0; }
    return a.toString(36) + b.toString(36);
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function monthKey(d) { d = d || new Date(); return d.getFullYear() + pad(d.getMonth() + 1); }
  function prevMonthKey() { var d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 1); return monthKey(d); }
  function dayKey(d) { d = d || new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  var MONTHS = ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'];
  function monthName(mk) { return MONTHS[+String(mk).slice(4) - 1] + ' ' + String(mk).slice(0, 4); }
  function normName(s) { return String(s || '').replace(/[ً-ْـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').trim().split(/\s+/)[0] || ''; }
  function firstName(s) { return String(s || '').trim().split(/\s+/)[0] || ''; }
  function claimCode(pid, mk, key) { var h = hash(pid + '|' + mk + '|' + key), n = 0; for (var i = 0; i < h.length; i++) n = (n * 31 + h.charCodeAt(i)) % 9000; return 'GM-' + (1000 + n); }

  function deviceId() {
    var id = ls(LS_DEV);
    if (!id) { id = Date.now().toString(36) + Math.random().toString(36).slice(2, 10); ls(LS_DEV, id); }
    return id;
  }
  function randomNick() { return NICKS[Math.floor(Math.random() * NICKS.length)] + ' ' + (10 + Math.floor(Math.random() * 90)); }
  function guestProfile() {
    var p = lsJ(LS_PROF, null);
    if (p && p.type === 'guest' && p.pid) return p;
    var old = p && p.nick;
    return { pid: 'gu_' + deviceId(), type: 'guest', nick: old || randomNick(), name: '', klass: '' };
  }
  function profile() {
    var p = lsJ(LS_PROF, null);
    if (!p || !p.pid) { p = guestProfile(); ls(LS_PROF, JSON.stringify(p)); }
    return p;
  }
  function saveProfile(p) { ls(LS_PROF, JSON.stringify(p)); renderAll(); }
  function displayOf(p) { return p.type === 'student' ? firstName(p.name) : (p.nick || 'لاعبة'); }
  function verifiedOf(p) { return p.type === 'student' || p.type === 'google'; }
  function logKey(pid) { return 'gm_pts_log_' + pid; }

  /* ---------- حساب النقاط من تقرير اللعبة ---------- */
  function wsWeight(label) {
    if (/إضاف|اضاف|extra/i.test(label)) return RULES.wsExtra;
    if (/متقدم|الثاني|ثانية|2|٢|advanced/i.test(label)) return RULES.ws2;
    return RULES.ws1;
  }
  function calc(rec) {
    var t = Math.min(RULES.timeMax, Math.floor((rec.timeMs || 0) / 120000) * RULES.perTwoMin);
    var c = Math.min(RULES.correctMax, (rec.correct || 0) * RULES.perCorrect);
    var w = 0, secs = rec.sections || [];
    if (typeof secs === 'string') { try { secs = JSON.parse(secs); } catch (e) { secs = []; } }
    secs.forEach(function (x) {
      if (!/ورق|worksheet/i.test(x.label || '') || !(x.max > 0)) return;
      w += Math.round(wsWeight(x.label) * Math.max(0, Math.min(1, x.got / x.max)));
    });
    var f = rec.finished ? RULES.trophy : 0;
    var n = Math.min(RULES.sessionMax, t + c + w + f);
    var parts = [];
    if (t) parts.push('⏱' + t); if (c) parts.push('✅' + c); if (w) parts.push('📝' + w); if (f) parts.push('🏆' + f);
    return { n: n, b: parts.join(' ') };
  }

  /* مجموع الشهر من السجل، مع حد أعلى لكل لعبة باليوم */
  function monthTotals(log) {
    var byGD = {}, months = {};
    (log || []).forEach(function (e) {
      if (!e || !e.d) return;
      var k = e.d + '|' + e.p;
      byGD[k] = (byGD[k] || 0) + (e.n || 0);
    });
    Object.keys(byGD).forEach(function (k) {
      var d = k.split('|')[0], mk = d.slice(0, 4) + d.slice(5, 7);
      months[mk] = (months[mk] || 0) + Math.min(RULES.gameDayMax, byGD[k]);
    });
    return months;
  }
  function mergeLogs(a, b) {
    var m = {};
    (a || []).concat(b || []).forEach(function (e) {
      if (!e || !e.s) return;
      if (!m[e.s] || (e.n || 0) > (m[e.s].n || 0)) m[e.s] = e;
    });
    var cutoff = prevMonthKey();
    return Object.keys(m).map(function (k) { return m[k]; })
      .filter(function (e) { return (e.d || '').slice(0, 4) + (e.d || '').slice(5, 7) >= cutoff; })
      .sort(function (x, y) { return (x.d + x.s).localeCompare(y.d + y.s); }).slice(-400);
  }

  /* ---------- قاعدة البيانات ---------- */
  function fv(v) {
    if (v == null) return { nullValue: null };
    if (typeof v === 'boolean') return { booleanValue: v };
    if (typeof v === 'number') return { integerValue: String(Math.round(v)) };
    return { stringValue: String(v) };
  }
  function unf(f) {
    var o = {};
    Object.keys(f || {}).forEach(function (k) {
      var x = f[k];
      o[k] = 'integerValue' in x ? +x.integerValue : 'doubleValue' in x ? +x.doubleValue : 'booleanValue' in x ? x.booleanValue : 'stringValue' in x ? x.stringValue : null;
    });
    return o;
  }
  function getDoc(pid) {
    return fetch(DOCS + '/' + COLL + '/' + encodeURIComponent(pid) + '?key=' + API_KEY).then(function (r) {
      if (r.status === 404) return {};
      if (!r.ok) throw new Error(r.status);
      return r.json().then(function (j) { return unf(j.fields); });
    });
  }
  function patchDoc(pid, obj) {
    var fields = {}, mask = [];
    Object.keys(obj).forEach(function (k) { fields[k] = fv(obj[k]); mask.push('updateMask.fieldPaths=' + encodeURIComponent(k)); });
    return fetch(DOCS + '/' + COLL + '/' + encodeURIComponent(pid) + '?key=' + API_KEY + '&' + mask.join('&'), {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: fields }), keepalive: true
    }).then(function (r) { if (!r.ok) throw new Error(r.status); return true; });
  }
  function topOf(mk, limit) {
    return fetch(DOCS + ':runQuery?key=' + API_KEY, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ structuredQuery: { from: [{ collectionId: COLL }], orderBy: [{ field: { fieldPath: 'm' + mk }, direction: 'DESCENDING' }], limit: limit || 60 } })
    }).then(function (r) { return r.ok ? r.json() : []; }).then(function (rows) {
      return (rows || []).filter(function (x) { return x.document; }).map(function (x) {
        var o = unf(x.document.fields); o.pid = x.document.name.split('/').pop(); o.pts = o['m' + mk] || 0; return o;
      }).filter(function (o) { return !o.banned && o.pts > 0; });
    });
  }

  /* ---------- المزامنة ---------- */
  var syncTimer = null, syncing = false;
  function scheduleSync(ms) { clearTimeout(syncTimer); syncTimer = setTimeout(sync, ms == null ? 2500 : ms); }
  function sync() {
    if (syncing || !window.fetch || (navigator.onLine === false)) return;
    var p = profile();
    if (ls(LS_BAN) === p.pid) return;
    syncing = true;
    getDoc(p.pid).then(function (doc) {
      if (doc.banned) { ls(LS_BAN, p.pid); renderAll(); return; }
      var srv = []; try { srv = JSON.parse(doc.log || '[]'); } catch (e) {}
      var log = mergeLogs(srv, lsJ(logKey(p.pid), []));
      ls(logKey(p.pid), JSON.stringify(log));
      var months = {}; try { months = JSON.parse(doc.months || '{}'); } catch (e) {}
      var mt = monthTotals(log);
      Object.keys(mt).forEach(function (k) { months[k] = Math.max(months[k] || 0, mt[k]); });
      var total = 0; Object.keys(months).forEach(function (k) { total += months[k]; });
      var out = { display: displayOf(p), type: p.type, klass: p.type === 'student' ? p.klass : '', verified: verifiedOf(p),
        log: JSON.stringify(log), months: JSON.stringify(months), total: total, updated: new Date().toISOString() };
      Object.keys(months).forEach(function (k) { if (k >= prevMonthKey()) out['m' + k] = months[k]; });
      return patchDoc(p.pid, out);
    }).then(function () { syncing = false; renderAll(); }, function () { syncing = false; });
  }

  /* ---------- ربط اللاعبة بالتقرير ---------- */
  /* بتنادى من gm-report.js لما الطالبة تدخل */
  function onPlayer(name, klass, isRoster) {
    var p = lsJ(LS_PROF, null);
    if (isRoster) {
      var np = { pid: 'st_' + hash(klass + '|' + name), type: 'student', name: name, klass: klass, nick: p && p.nick };
      if (!p || p.pid !== np.pid) saveProfile(np);
      return;
    }
    /* لعبة بدون قوائم: إذا الجهاز لطالبة واسم اللاعبة مختلف، بنحسبها زائرة (جهاز مشترك) */
    if (p && p.type === 'student' && normName(p.name) !== normName(name)) {
      saveProfile(guestProfile()); toast('🎮 لقبك بالمسابقة: ' + profile().nick);
    } else if (!p) { profile(); toast('🎮 لقبك بالمسابقة: ' + profile().nick); }
  }
  function award(rec) {
    if (!rec || !rec.id || (rec.timeMs || 0) < RULES.minPlayMs) return;
    var p = profile();
    if (ls(LS_BAN) === p.pid) return;
    var c = calc(rec); if (!c.n) return;
    var log = lsJ(logKey(p.pid), []);
    var ex = log.filter(function (e) { return e.s === rec.id; })[0];
    if (ex && ex.n >= c.n) return;
    var before = monthPoints();
    if (ex) { ex.n = c.n; ex.b = c.b; }
    else log.push({ s: rec.id, d: dayKey(new Date(rec.date || Date.now())), p: rec.page || '', g: String(rec.game || '').slice(0, 60), n: c.n, b: c.b });
    ls(logKey(p.pid), JSON.stringify(mergeLogs(log, [])));
    var after = monthPoints();
    if (after > before) {
      toast('⭐ +' + (after - before) + ' نقطة · مجموعك هالشهر ' + after);
      TIERS.forEach(function (t) { if (before < t.pts && after >= t.pts && tierOk(t, p)) setTimeout(function () { toast(t.icon + ' مبروك! وصلتي ' + t.pts + ' نقطة: ' + t.label); }, 2600); });
    }
    renderAll(); scheduleSync();
  }
  function monthPoints(mk) {
    var p = profile();
    return monthTotals(lsJ(logKey(p.pid), []))[mk || monthKey()] || 0;
  }
  function tierOk(t, p) { return t.who === 'all' || p.type === 'student'; }

  /* ---------- الدخول بحساب Google (اختياري) ---------- */
  var FB_VER = '10.12.2';
  function loadScript(src) { return new Promise(function (res, rej) { var s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }
  function googleSignIn() {
    var go = function () {
      if (!firebase.apps.length) firebase.initializeApp({ apiKey: API_KEY, authDomain: PROJECT + '.firebaseapp.com', projectId: PROJECT });
      return firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider());
    };
    var ready = window.firebase && firebase.auth ? Promise.resolve() :
      loadScript('https://www.gstatic.com/firebasejs/' + FB_VER + '/firebase-app-compat.js').then(function () { return loadScript('https://www.gstatic.com/firebasejs/' + FB_VER + '/firebase-auth-compat.js'); });
    return ready.then(go).then(function (res) {
      var old = profile();
      var np = { pid: 'go_' + res.user.uid, type: 'google', nick: old.nick || randomNick(), name: '', klass: '' };
      /* نقاط الزائرة على هاد الجهاز بتنتقل للحساب (الإيميل نفسه ما بينحفظ) */
      if (old.type === 'guest') ls(logKey(np.pid), JSON.stringify(mergeLogs(lsJ(logKey(np.pid), []), lsJ(logKey(old.pid), []))));
      saveProfile(np); scheduleSync(0);
      toast('✅ تم التأكيد بحساب Google');
    }).catch(function (e) {
      toast('⚠️ ما زبط الدخول بـ Google — جربي مرة ثانية');
      if (window.console) console.warn('GMPoints Google sign-in:', e);
    });
  }

  /* ---------- الواجهة ---------- */
  var cssDone = false;
  function css() {
    if (cssDone) return; cssDone = true;
    var s = document.createElement('style');
    s.textContent =
      '.gmp,.gmp *{box-sizing:border-box;font-family:"Baloo Bhaijaan 2","Segoe UI",Tahoma,sans-serif}' +
      '.gmp{direction:rtl;color:#fff;width:100%;max-width:460px;margin:12px auto;background:linear-gradient(160deg,#1d1342,#120b2b);border:1px solid rgba(167,139,250,.35);border-radius:22px;padding:14px;box-shadow:0 10px 30px rgba(0,0,0,.35);text-align:right}' +
      '.gmp h3{margin:0 0 8px;font-size:19px;text-align:center;background:linear-gradient(90deg,#fcd34d,#f472b6,#a78bfa);-webkit-background-clip:text;background-clip:text;color:transparent}' +
      '.gmp .gmpSub{font-size:13px;opacity:.8;text-align:center;margin-bottom:10px}' +
      '.gmpWin{background:linear-gradient(90deg,rgba(252,211,77,.18),rgba(244,114,182,.15));border:1px solid rgba(252,211,77,.45);border-radius:16px;padding:10px;text-align:center;margin-bottom:10px}' +
      '.gmpWin b{font-size:20px;color:#fcd34d}' +
      '.gmpRow{display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:12px;background:rgba(255,255,255,.05);margin-bottom:5px;font-size:15px}' +
      '.gmpRow .r{width:28px;text-align:center;font-size:18px}.gmpRow .n{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.gmpRow .p{font-weight:800;color:#fcd34d}' +
      '.gmpRow.me{outline:2px solid #a78bfa;background:rgba(167,139,250,.15)}' +
      '.gmpMe{display:flex;justify-content:space-between;align-items:center;gap:8px;background:rgba(59,130,246,.15);border-radius:14px;padding:10px;margin:10px 0;font-size:15px}' +
      '.gmpMe b{font-size:22px;color:#7dd3fc}' +
      '.gmpBar{height:9px;border-radius:9px;background:rgba(255,255,255,.12);overflow:hidden;margin-top:6px}.gmpBar i{display:block;height:100%;background:linear-gradient(90deg,#3b82f6,#8b5cf6,#ec4899)}' +
      '.gmpTiers{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:8px 0}' +
      '.gmpTier{text-align:center;background:rgba(255,255,255,.06);border-radius:14px;padding:8px 4px;font-size:13px;line-height:1.35}' +
      '.gmpTier .i{font-size:26px;display:block}.gmpTier b{display:block;color:#fcd34d;font-size:15px}.gmpTier.got{background:rgba(34,197,94,.2);outline:1px solid #22c55e}' +
      '.gmpTier .c{display:block;margin-top:3px;font-size:12px;color:#86efac;direction:ltr}' +
      '.gmpHow{font-size:14px;line-height:1.8;background:rgba(255,255,255,.04);border-radius:14px;padding:8px 12px;margin-top:8px}' +
      '.gmpBtns{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}' +
      '.gmpBtn{flex:1;min-width:120px;padding:9px;border:none;border-radius:14px;cursor:pointer;color:#fff;font-weight:800;font-size:14px;background:rgba(255,255,255,.1)}' +
      '.gmpBtn.main{background:linear-gradient(90deg,#3b82f6,#8b5cf6,#ec4899)}' +
      '.gmpTag{font-size:11px;padding:1px 6px;border-radius:8px;background:rgba(255,255,255,.12);margin-inline-start:4px}' +
      '.gmpNote{font-size:12px;opacity:.75;text-align:center;margin-top:8px;line-height:1.6}' +
      '#gmpToast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:2147483600;background:#1d1342;color:#fff;border:1px solid #a78bfa;border-radius:16px;padding:10px 16px;font-size:15px;direction:rtl;box-shadow:0 8px 24px rgba(0,0,0,.4);transition:opacity .4s;max-width:90vw;text-align:center;font-family:"Baloo Bhaijaan 2",Tahoma,sans-serif}' +
      '#gmpBadge{position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:2147483300;border:none;border-radius:20px;padding:6px 12px;cursor:pointer;color:#fff;font-weight:800;font-size:14px;background:linear-gradient(90deg,#8b5cf6,#ec4899);box-shadow:0 4px 14px rgba(0,0,0,.35);font-family:"Baloo Bhaijaan 2",Tahoma,sans-serif}' +
      '#gmpModal{position:fixed;inset:0;z-index:2147483500;background:rgba(5,3,15,.75);display:flex;align-items:flex-start;justify-content:center;overflow:auto;padding:16px}' +
      '#gmpModal .gmp{margin-top:20px}' +
      '.gmpPick{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:8px 0}' +
      '#gmpCert{position:fixed;inset:0;z-index:2147483550;background:#fff;color:#2d1b69;display:flex;align-items:center;justify-content:center;direction:rtl;padding:20px}' +
      '#gmpCert .box{border:8px double #8b5cf6;border-radius:24px;padding:30px;max-width:620px;width:100%;text-align:center;font-family:"Baloo Bhaijaan 2",Tahoma,sans-serif}' +
      '#gmpPromo{position:fixed;inset:0;z-index:2147483450;background:rgba(5,3,15,.82);display:flex;align-items:center;justify-content:center;padding:16px;animation:gmpFade .35s ease}' +
      '@keyframes gmpFade{from{opacity:0}}' +
      '#gmpPromo .pc{position:relative;overflow:hidden;width:100%;max-width:400px;text-align:center;direction:rtl;color:#fff;border-radius:26px;padding:22px 16px 16px;background:linear-gradient(160deg,#2a1660,#160c35 60%,#3a0f3f);border:2px solid rgba(252,211,77,.6);box-shadow:0 0 40px rgba(252,211,77,.35);animation:gmpPop .5s cubic-bezier(.2,1.4,.4,1)}' +
      '@keyframes gmpPop{from{transform:scale(.6);opacity:0}}' +
      '#gmpPromo .cup{font-size:86px;line-height:1;display:inline-block;filter:drop-shadow(0 0 18px rgba(252,211,77,.8));animation:gmpCup 2.2s ease-in-out infinite}' +
      '@keyframes gmpCup{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-10px) rotate(4deg)}}' +
      '#gmpPromo h2{font-size:24px;margin:6px 0 2px;background:linear-gradient(90deg,#fcd34d,#f472b6,#a78bfa);-webkit-background-clip:text;background-clip:text;color:transparent}' +
      '#gmpPromo .t{font-size:16px;opacity:.92;margin-bottom:12px;line-height:1.6}' +
      '#gmpPromo .pz{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:12px}' +
      '#gmpPromo .pz div{background:rgba(255,255,255,.08);border-radius:16px;padding:9px 4px;font-size:13px;animation:gmpPop .6s backwards}' +
      '#gmpPromo .pz div:nth-child(2){animation-delay:.15s}#gmpPromo .pz div:nth-child(3){animation-delay:.3s}' +
      '#gmpPromo .pz i{font-style:normal;font-size:30px;display:block}#gmpPromo .pz b{display:block;font-size:17px;color:#fcd34d}' +
      '#gmpPromo .crown{background:linear-gradient(90deg,rgba(252,211,77,.2),rgba(244,114,182,.2));border-radius:14px;padding:9px;font-size:15px;margin-bottom:12px}' +
      '#gmpPromo .st{position:absolute;color:#fcd34d;animation:gmpTw 2s ease-in-out infinite;pointer-events:none}' +
      '@keyframes gmpTw{0%,100%{opacity:.2;transform:scale(.7)}50%{opacity:1;transform:scale(1.2)}}' +
      '@media print{body>*:not(#gmpCert){display:none!important}#gmpCert .noPrint{display:none}}';
    document.head.appendChild(s);
  }
  function toast(msg) {
    if (!document.body) return;
    css();
    var t = document.getElementById('gmpToast');
    if (!t) { t = document.createElement('div'); t.id = 'gmpToast'; document.body.appendChild(t); }
    t.textContent = msg; t.style.opacity = '1';
    clearTimeout(t._h); t._h = setTimeout(function () { t.style.opacity = '0'; }, 3800);
  }
  function badgeTxt(p, name) {
    var ic = p.type === 'student' ? '🏫' : p.type === 'google' ? '✅' : '👤';
    return esc(name) + '<span class="gmpTag">' + ic + '</span>';
  }

  var cache = { cur: null, prev: null, at: 0 };
  function loadBoards(force) {
    if (!window.fetch) return Promise.resolve(cache);
    if (!force && cache.cur && Date.now() - cache.at < 60000) return Promise.resolve(cache);
    return Promise.all([topOf(monthKey(), 60), topOf(prevMonthKey(), 30)]).then(function (r) {
      cache = { cur: r[0], prev: r[1], at: Date.now() }; return cache;
    }).catch(function () { return cache; });
  }

  function boardHTML(c) {
    var p = profile(), mine = monthPoints(), mk = monthKey();
    var banned = ls(LS_BAN) === p.pid;
    var winner = (c.prev || []).filter(function (x) { return x.verified; })[0];
    var list = (c.cur || []).slice(0, 10);
    var nextT = TIERS.filter(function (t) { return mine < t.pts && tierOk(t, p); })[0];
    var h = '<h3>🏆 مسابقة نقاط GamnaMarks</h3><div class="gmpSub">العبي، حلّي أوراق العمل، واجمعي نقاط — فائزة جديدة كل شهر!</div>';
    h += winner ? '<div class="gmpWin">👑 فائزة شهر ' + esc(monthName(prevMonthKey())) + '<br><b>' + badgeTxt(winner, winner.display) + '</b> — ' + winner.pts + ' نقطة</div>'
                : '<div class="gmpWin">👑 فائزة شهر ' + esc(monthName(mk)) + ' بتنعلن أول الشهر الجاي — إنتِ ممكن تكوني هي!</div>';
    h += '<div class="gmpMe"><div>' + (banned ? '🚫 هاد الحساب موقوف من المعلمة' : 'نقاطك هالشهر<br><span style="font-size:13px;opacity:.8">' + badgeTxt(p, displayOf(p)) + '</span>') + '</div><b>' + mine + ' ⭐</b></div>';
    if (nextT && !banned) h += '<div style="font-size:13px">باقيلك ' + (nextT.pts - mine) + ' نقطة لـ ' + nextT.icon + ' ' + nextT.label + '</div><div class="gmpBar"><i style="width:' + Math.min(100, Math.round(mine / nextT.pts * 100)) + '%"></i></div>';
    h += '<div class="gmpTiers">' + TIERS.map(function (t) {
      var ok = tierOk(t, p), got = ok && mine >= t.pts && !banned;
      return '<div class="gmpTier' + (got ? ' got' : '') + '"><span class="i">' + t.icon + '</span><b>' + t.pts + '</b>' + t.label +
        (t.who === 'student' ? '<br><span style="font-size:11px;opacity:.7">لطالبات د. أماني</span>' : '') +
        (got ? '<span class="c">' + claimCode(p.pid, mk, t.key) + '</span>' : '') + '</div>';
    }).join('') + '</div>';
    if (TIERS.some(function (t) { return mine >= t.pts && tierOk(t, p); }) && !banned)
      h += '<div class="gmpNote">🔐 الكود الأخضر هو كود جائزتك — ورجيه للمعلمة عشان تستلميها</div>';
    h += '<div style="margin-top:10px;font-weight:800">🔥 الأعلى هالشهر</div>';
    if (!list.length) h += '<div class="gmpNote">لسا ما حدا جمع نقاط هالشهر — كوني الأولى! 🚀</div>';
    list.forEach(function (x, i) {
      h += '<div class="gmpRow' + (x.pid === p.pid ? ' me' : '') + '"><span class="r">' + (['🥇', '🥈', '🥉'][i] || (i + 1)) + '</span><span class="n">' + badgeTxt(x, x.display) + '</span><span class="p">' + x.pts + '</span></div>';
    });
    h += '<div class="gmpHow"><b>⭐ كيف تجمعي نقاط؟</b><br>' +
      '🏆 إنهاء اللعبة والكأس: ' + RULES.trophy + ' نقطة<br>' +
      '📝 ورقة العمل 1: حتى ' + RULES.ws1 + ' · ورقة العمل 2: حتى ' + RULES.ws2 + '<br>' +
      '➕ ورقة عمل إضافية: حتى ' + RULES.wsExtra + ' (اختيارية، لزيادة نقاطك)<br>' +
      '✅ كل إجابة صحيحة: ' + RULES.perCorrect + ' · ⏱ كل دقيقتين لعب: ' + RULES.perTwoMin + '<br>' +
      '<span style="font-size:12px;opacity:.75">أعلى نقاط من نفس اللعبة باليوم: ' + RULES.gameDayMax + ' · النقاط الشهرية بتبلش من جديد أول كل شهر</span></div>';
    h += '<div class="gmpBtns">' +
      (p.type === 'guest' ? '<button class="gmpBtn" data-gmp="nick">🎭 غيّري لقبك</button><button class="gmpBtn main" data-gmp="google">✅ تأكيد بحساب Google</button>' : '') +
      (p.type === 'google' ? '<button class="gmpBtn" data-gmp="nick">🎭 غيّري لقبك</button>' : '') +
      (mine >= TIERS[0].pts && !banned ? '<button class="gmpBtn" data-gmp="cert">📜 شهادتي</button>' : '') +
      '</div>';
    h += '<div class="gmpNote">🏫 طالبات د. أماني: ادخلي أي لعبة من ألعاب صفّك بكودك السري، وبتنربط نقاطك باسمك تلقائياً.<br>' +
      '✅ فائزة الشهر لازم تكون طالبة أو حساب مأكّد · 👤 الزائرات بيظهروا بلقب، والإيميل ما بينحفظ ولا بيظهر لحدا.</div>';
    return h;
  }
  function bind(el) {
    Array.prototype.forEach.call(el.querySelectorAll('[data-gmp]'), function (b) {
      b.onclick = function (e) {
        e.stopPropagation();
        var a = b.getAttribute('data-gmp');
        if (a === 'google') googleSignIn();
        else if (a === 'nick') pickNick();
        else if (a === 'cert') showCert();
        else if (a === 'close') closeModal();
      };
    });
  }
  var boards = [];
  function mountBoard(el) {
    css(); el.classList.add('gmp');
    if (boards.indexOf(el) < 0) boards.push(el);
    el.innerHTML = boardHTML(cache); bind(el);
    loadBoards().then(function () { el.innerHTML = boardHTML(cache); bind(el); });
  }
  function renderAll() {
    boards.forEach(function (el) { if (document.body.contains(el)) { el.innerHTML = boardHTML(cache); bind(el); } });
    var b = document.getElementById('gmpBadge'); if (b) b.textContent = '⭐ ' + monthPoints() + ' نقطة';
  }
  function pickNick() {
    var p = profile();
    var m = document.getElementById('gmpModal');
    var box = document.createElement('div'); box.className = 'gmp';
    var opts = []; while (opts.length < 8) { var n = randomNick(); if (opts.indexOf(n) < 0) opts.push(n); }
    box.innerHTML = '<h3>🎭 اختاري لقبك</h3><div class="gmpSub">لقبك الحالي: ' + esc(p.nick || '') + '</div><div class="gmpPick">' +
      opts.map(function (n, i) { return '<button class="gmpBtn" data-i="' + i + '">' + esc(n) + '</button>'; }).join('') +
      '</div><div class="gmpBtns"><button class="gmpBtn" id="gmpMore">🔄 ألقاب ثانية</button><button class="gmpBtn" id="gmpX">إغلاق</button></div>';
    openModal(box);
    Array.prototype.forEach.call(box.querySelectorAll('[data-i]'), function (b) {
      b.onclick = function () { var q = profile(); q.nick = opts[+b.getAttribute('data-i')]; saveProfile(q); scheduleSync(0); closeModal(); if (m) openBoardModal(); toast('🎭 لقبك الجديد: ' + q.nick); };
    });
    box.querySelector('#gmpMore').onclick = pickNick;
    box.querySelector('#gmpX').onclick = closeModal;
  }
  function openModal(inner) {
    css(); closeModal();
    var m = document.createElement('div'); m.id = 'gmpModal';
    m.onclick = function (e) { if (e.target === m) closeModal(); };
    ['click', 'pointerdown', 'touchstart', 'mousedown', 'keydown'].forEach(function (ev) { m.addEventListener(ev, function (e) { e.stopPropagation(); }); });
    m.appendChild(inner); document.body.appendChild(m);
  }
  function closeModal() { var m = document.getElementById('gmpModal'); if (m) m.remove(); boards = boards.filter(function (el) { return document.body.contains(el); }); }
  function openBoardModal() {
    var el = document.createElement('div');
    var wrap = document.createElement('div'); wrap.appendChild(el);
    var x = document.createElement('button'); x.className = 'gmpBtn'; x.textContent = '✖ إغلاق'; x.style.cssText = 'display:block;margin:0 auto 20px;max-width:200px';
    x.onclick = closeModal;
    openModal(wrap); mountBoard(el); wrap.appendChild(x);
    loadBoards(true).then(renderAll);
  }
  function showCert() {
    css();
    var p = profile(), mk = monthKey(), mine = monthPoints();
    var c = document.createElement('div'); c.id = 'gmpCert';
    c.innerHTML = '<div class="box"><div style="font-size:54px">📜</div><h1 style="margin:6px 0;color:#7c3aed">شهادة تقدير</h1>' +
      '<p style="font-size:20px;line-height:1.9">تمنح منصة GamnaMarks هذه الشهادة إلى<br><b style="font-size:28px;color:#db2777">' + esc(displayOf(p)) + '</b><br>' +
      'تقديراً لجهودها المتميزة في التعلم باللعب وجمعها <b>' + mine + '</b> نقطة<br>خلال شهر ' + esc(monthName(mk)) + '</p>' +
      '<p style="font-size:16px;margin-top:14px">د. أماني ياسين داود</p><p style="font-size:13px;opacity:.7;direction:ltr">' + claimCode(p.pid, mk, 'cert') + '</p>' +
      '<div class="noPrint" style="margin-top:16px"><button class="gmpBtn main" id="gmpPr" style="max-width:200px">🖨 طباعة / PDF</button> <button class="gmpBtn" id="gmpCx" style="max-width:200px;color:#2d1b69;background:#eee">إغلاق</button></div></div>';
    document.body.appendChild(c);
    c.querySelector('#gmpPr').onclick = function () { window.print(); };
    c.querySelector('#gmpCx').onclick = function () { c.remove(); };
  }
  function addBadge() {
    if (document.getElementById('gmpBadge')) return;
    css();
    var b = document.createElement('button'); b.id = 'gmpBadge'; b.title = 'مسابقة النقاط';
    b.textContent = '⭐ ' + monthPoints() + ' نقطة';
    ['click', 'pointerdown', 'touchstart', 'mousedown'].forEach(function (ev) { b.addEventListener(ev, function (e) { e.stopPropagation(); }); });
    b.onclick = openBoardModal;
    document.body.appendChild(b);
  }

  /* إعلان المسابقة أول ما تفتح الصفحة (مرة باليوم) */
  function promo(force) {
    if (!force && ls('gm_pts_promo') === dayKey()) return;
    ls('gm_pts_promo', dayKey());
    css();
    var m = document.createElement('div'); m.id = 'gmpPromo';
    var stars = ''; for (var i = 0; i < 10; i++) stars += '<span class="st" style="top:' + Math.round(Math.random() * 90) + '%;left:' + Math.round(Math.random() * 92) + '%;animation-delay:' + (Math.random() * 2).toFixed(1) + 's;font-size:' + (10 + Math.round(Math.random() * 12)) + 'px">✦</span>';
    m.innerHTML = '<div class="pc">' + stars +
      '<div class="cup">🏆</div><h2>مسابقة GamnaMarks الشهرية</h2>' +
      '<div class="t">العبي، حلّي أوراق العمل، واجمعي نقاط<br>وكل ما تجمعي أكثر بتربحي أكثر! ✨</div>' +
      '<div class="pz"><div><i>📜</i><b>100</b>شهادة تقدير</div><div><i>🎁</i><b>300</b>هدية</div><div><i>⭐</i><b>500</b>علامة إضافية</div></div>' +
      '<div class="crown" id="gmpPromoWin">👑 فائزة جديدة كل شهر — ليش ما تكوني إنتِ؟</div>' +
      '<div class="gmpBtns"><button class="gmpBtn" id="gmpPromoMore">📋 التفاصيل</button><button class="gmpBtn main" id="gmpPromoGo">يلا نبلّش! 🚀</button></div>' +
      '<div class="gmpNote">🎁 الهدية والعلامة الإضافية لطالبات د. أماني</div></div>';
    m.onclick = function (e) { if (e.target === m) m.remove(); };
    document.body.appendChild(m);
    m.querySelector('#gmpPromoGo').onclick = function () { m.remove(); };
    m.querySelector('#gmpPromoMore').onclick = function () {
      m.remove();
      var b = document.querySelector('[data-gmp-board]');
      if (b && b.scrollIntoView) b.scrollIntoView({ behavior: 'smooth' }); else openBoardModal();
    };
    loadBoards().then(function (c) {
      var w = (c.prev || []).filter(function (x) { return x.verified; })[0], lead = (c.cur || [])[0];
      var el = document.getElementById('gmpPromoWin'); if (!el) return;
      if (w) el.innerHTML = '👑 فائزة ' + esc(monthName(prevMonthKey())) + ': <b>' + esc(w.display) + '</b> — ' + w.pts + ' نقطة';
      else if (lead) el.innerHTML = '🔥 المتصدرة هالشهر: <b>' + esc(lead.display) + '</b> — ' + lead.pts + ' نقطة<br>بتقدري تسبقيها؟';
    });
  }

  window.GMPoints = {
    promo: promo,
    award: award, onPlayer: onPlayer, profile: profile, monthPoints: monthPoints,
    mount: mountBoard, open: openBoardModal, badge: addBadge, sync: sync, google: googleSignIn,
    _calc: calc, _totals: monthTotals, _code: claimCode, RULES: RULES, TIERS: TIERS
  };

  var me = document.currentScript;
  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-gmp-board]'), mountBoard);
    if (me && me.getAttribute('data-badge')) addBadge();
    if (me && me.getAttribute('data-promo')) setTimeout(function () { promo(); }, 700);
    scheduleSync(1500);
    window.addEventListener('online', function () { scheduleSync(500); });
  }
  if (document.body) init(); else document.addEventListener('DOMContentLoaded', init);
})();
