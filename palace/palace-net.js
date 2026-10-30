// ============================================================
//  اللعب الجماعي لقصر المغذيات — مجموعات من 6 طالبات
//  Firebase Realtime Database (مشروع cursed-castle-bb43b)
//  الملف الأصلي: Assets/Editor/palace-net.js.txt (البناء بينسخه جنب index.html باسم palace-net.js)
// ============================================================
(function () {
  var FB = {
    apiKey: "AIzaSyADxQ7-3UDxYD3VTOoVrn7d6516_5bqd5Y",
    authDomain: "cursed-castle-bb43b.firebaseapp.com",
    databaseURL: "https://cursed-castle-bb43b-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "cursed-castle-bb43b",
    storageBucket: "cursed-castle-bb43b.firebasestorage.app",
    messagingSenderId: "458563878259",
    appId: "1:458563878259:web:715ce9f960b2972ccd9906"
  };
  var MAX = 6;
  var COLORS = ['#66a0ff', '#ff80d1', '#6bf27a', '#ffa347', '#bd85ff', '#fff24d'];
  var CNAMES = ['الأزرق', 'الوردي', 'الأخضر', 'البرتقالي', 'البنفسجي', 'الأصفر'];
  var STALE = 45000;   // طالبة ما وصل منها إشي من 45 ثانية = طالعة

  var cfg = null, db = null, room = null, me = null, wins = 0, myWin = false;
  var queue = {}, order = [];

  var net = window.palaceNet = {
    config: function () { return cfg ? JSON.stringify(cfg) : ''; },
    send: function (x, y, z, r, mv, k) {
      if (!me) return;
      me.update({ x: +x.toFixed(2), y: +y.toFixed(2), z: +z.toFixed(2), r: Math.round(r), mv: mv, k: k, t: firebase.database.ServerValue.TIMESTAMP });
    },
    key: function (i) {
      if (!room) return;
      room.child('ev').push({ t: 'key', id: cfg.id, n: cfg.name, c: cfg.color, i: i, at: firebase.database.ServerValue.TIMESTAMP });
    },
    won: function (secs, mistakes) {
      if (!room || myWin) return;
      myWin = true;
      var rank = wins + 1;
      room.child('ev').push({ t: 'win', id: cfg.id, n: cfg.name, c: cfg.color, s: secs, rank: rank, at: firebase.database.ServerValue.TIMESTAMP });
      me.update({ w: 1 });
      setTimeout(function () { banner(rank); }, 1500);
    }
  };

  // ---------- إرسال للعبة (يونتي) ----------
  function toUnity(method, data, key) {
    if (key) { if (!(key in queue)) order.push(key); queue[key] = [method, data]; }
    else { var k = '_' + Math.random(); order.push(k); queue[k] = [method, data]; }
    flush();
  }
  function flush() {
    var u = window.palaceUnity;
    if (!u) return;
    var o = order; order = [];
    o.forEach(function (k) {
      var m = queue[k]; delete queue[k];
      if (m) { try { u.SendMessage('PalaceNet', m[0], m[1]); } catch (e) {} }
    });
  }
  setInterval(flush, 250);

  // ---------- الاتصال ----------
  function database() {
    if (db) return db;
    if (!window.firebase || !firebase.database) throw new Error('nofb');
    var app = null;
    try { app = firebase.app('palace'); } catch (e) { app = firebase.initializeApp(FB, 'palace'); }
    db = app.database();
    return db;
  }
  function withTimeout(p, ms) {
    return new Promise(function (ok, no) {
      var t = setTimeout(function () { no(new Error('timeout')); }, ms);
      p.then(function (v) { clearTimeout(t); ok(v); }, function (e) { clearTimeout(t); no(e); });
    });
  }
  function alive(players) {
    var t0 = now(), out = {};
    Object.keys(players || {}).forEach(function (id) {
      var p = players[id];
      if (p && p.t && t0 - p.t < STALE) out[id] = p;
    });
    return out;
  }

  function listen() {
    var pr = room.child('p');
    function up(s) {
      if (s.key === cfg.id) return;
      var v = s.val() || {}; v.id = s.key;
      toUnity('OnPlayer', JSON.stringify(v), 'p' + s.key);
    }
    pr.on('child_added', up);
    pr.on('child_changed', up);
    pr.on('child_removed', function (s) { if (s.key !== cfg.id) toUnity('OnLeave', s.key, 'p' + s.key); });
    room.child('ev').on('child_added', function (s) {
      var v = s.val() || {};
      if (v.t === 'win' && v.id !== cfg.id) wins++;
      toUnity('OnEvent', JSON.stringify(v));
    });
    // نبضة كل 15 ثانية حتى لو واقفة، عشان ما تنحسب طالعة
    setInterval(function () { if (me) me.update({ t: firebase.database.ServerValue.TIMESTAMP }); }, 15000);
    window.addEventListener('pagehide', function () { try { me.remove(); } catch (e) {} });
  }

  // ---------- شاشة البداية: لحالي ولا مع مجموعتي ----------
  function css() {
    if (document.getElementById('pn-style')) return;
    var s = document.createElement('style'); s.id = 'pn-style';
    s.textContent =
      '#pn{position:fixed;inset:0;z-index:10001;background:radial-gradient(circle,#2e1858,#0b0618);color:#fff;font-family:Tahoma,Arial,sans-serif;direction:rtl;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;overflow:auto}' +
      '#pn .box{width:100%;max-width:560px;text-align:center}' +
      '#pn h1{color:#ffd76a;font-size:26px;margin:0 0 6px}#pn p{margin:6px 0 14px;line-height:1.7;opacity:.92;font-size:15px}' +
      '#pn .row{display:flex;gap:12px;flex-wrap:wrap;justify-content:center}' +
      '#pn button.big{flex:1 1 220px;background:#3d3360;border:3px solid #ffd76a;border-radius:16px;color:#fff;padding:16px 10px;font:bold 20px Tahoma,Arial,sans-serif;cursor:pointer}' +
      '#pn button.big small{display:block;font-weight:normal;font-size:13px;opacity:.85;margin-top:6px;line-height:1.5}' +
      '#pn input{width:100%;box-sizing:border-box;margin:6px 0 10px;padding:12px;border-radius:12px;border:2px solid #8a74d6;background:#1d1236;color:#fff;font:18px Tahoma,Arial,sans-serif;text-align:center}' +
      '#pn .go{background:linear-gradient(90deg,#ffd76a,#ff8ad8);color:#2a1440;border:0;border-radius:14px;padding:13px 40px;font:bold 20px Tahoma,Arial,sans-serif;cursor:pointer;margin-top:6px}' +
      '#pn .back{background:none;border:0;color:#cbbcff;text-decoration:underline;font:15px Tahoma,Arial,sans-serif;margin-top:12px;cursor:pointer}' +
      '#pn .err{color:#ff9d9d;min-height:22px;font-size:15px}' +
      '#pn .who{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:10px 0 16px}' +
      '#pn .who span{padding:6px 12px;border-radius:20px;background:#1d1236;border:2px solid;font-size:15px}' +
      '#pn-rank{position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:100000;background:#3d3360;border:3px solid #ffd76a;border-radius:16px;color:#fff;font:bold 22px Tahoma,Arial,sans-serif;padding:12px 26px;direction:rtl;text-align:center;box-shadow:0 6px 24px rgba(0,0,0,.5)}';
    document.head.appendChild(s);
  }
  function screen(html) {
    css();
    var d = document.getElementById('pn');
    if (!d) { d = document.createElement('div'); d.id = 'pn'; document.body.appendChild(d); }
    d.innerHTML = '<div class="box">' + html + '</div>';
    return d;
  }
  function close() { var d = document.getElementById('pn'); if (d) d.parentNode.removeChild(d); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function remember(k, v) { try { localStorage.setItem('pn_' + k, v); } catch (e) {} }
  function recall(k) { try { return localStorage.getItem('pn_' + k) || ''; } catch (e) { return ''; } }

  window.palaceLobby = function (done) {
    var d = screen(
      '<h1>قصر المغذيات — حرّري آدم</h1><p>كيف بدك تلعبي؟</p>' +
      '<div class="row"><button class="big" id="pn-solo">🧍‍♀️ ألعب لحالي<small>كل اللعبة إلكِ</small></button>' +
      '<button class="big" id="pn-group">👭 ألعب مع مجموعتي<small>لحد 6 طالبات بنفس القصر، كل وحدة على جوالها</small></button></div>');
    d.querySelector('#pn-solo').onclick = function () { close(); done(); };
    d.querySelector('#pn-group').onclick = function () { form(done); };
  };

  function form(done, msg) {
    var d = screen(
      '<h1>👭 اللعب مع المجموعة</h1><p>اكتبي اسمك، ورمز المجموعة اللي أعطتكِ إياه المعلمة</p>' +
      '<input id="pn-name" maxlength="16" placeholder="اسمك" value="' + esc(recall('name')) + '">' +
      '<input id="pn-room" maxlength="8" inputmode="numeric" placeholder="رمز المجموعة (مثلاً 1111)" value="' + esc(recall('room')) + '">' +
      '<div class="err" id="pn-err">' + (msg || '') + '</div>' +
      '<button class="go" id="pn-go">ادخلي</button><br><button class="back" id="pn-back">رجوع</button>');
    d.querySelector('#pn-back').onclick = function () { window.palaceLobby(done); };
    d.querySelector('#pn-go').onclick = function () {
      var name = d.querySelector('#pn-name').value.trim().slice(0, 16);
      var code = d.querySelector('#pn-room').value.trim().replace(/[^0-9A-Za-z]/g, '').slice(0, 8);
      var err = d.querySelector('#pn-err');
      if (!name) { err.textContent = 'اكتبي اسمك أول'; return; }
      if (code.length < 3) { err.textContent = 'رمز المجموعة لازم يكون 3 أرقام أو أكثر'; return; }
      remember('name', name); remember('room', code);
      err.textContent = 'عم ندخل المجموعة...';
      join(name, code, done).catch(function (e) {
        var m = (e && e.message) || '';
        form(done, m === 'full' ? 'المجموعة ' + esc(code) + ' فيها 6 طالبات! تأكدي من الرمز' :
                   m === 'nofb' ? 'ما قدرنا نوصل للنت. تأكدي من الإنترنت وحدّثي الصفحة' :
                   'صار خطأ بالاتصال، جرّبي مرة ثانية');
      });
    };
  }

  var offset = 0;
  function now() { return Date.now() + offset; }

  function join(name, code, done) {
    var r;
    try { r = database().ref('palaceRooms/' + code); } catch (e) { return Promise.reject(e); }
    return withTimeout(db.ref('.info/serverTimeOffset').once('value'), 10000).then(function (o) {
      offset = o.val() || 0;
      return withTimeout(r.once('value'), 10000);
    }).then(function (snap) {
      var v = snap.val() || {};
      var here = alive(v.p);
      var ids = Object.keys(here);
      if (ids.length >= MAX) throw new Error('full');
      if (ids.length > 0 && v.meta) return enter(r, name, code, v.meta, here, done);
      // أول وحدة بالمجموعة: بتختار نوع اللعب، والغرفة بتبلّش من جديد
      return new Promise(function (ok) {
        var d = screen(
          '<h1>أنتِ أول وحدة بالمجموعة ' + esc(code) + '!</h1><p>اختاري كيف بدكم تلعبوا:</p>' +
          '<div class="row"><button class="big" id="pn-coop">🤝 تعاوني<small>المفتاح اللي بتجيبه أي وحدة بينحسب للكل، ومع بعض بتحرروا آدم</small></button>' +
          '<button class="big" id="pn-race">🏁 تنافسي<small>كل وحدة بتجمع مفاتيحها لحالها، وأول وحدة بتحرر آدم بتفوز</small></button></div>');
        d.querySelector('#pn-coop').onclick = function () { ok('coop'); };
        d.querySelector('#pn-race').onclick = function () { ok('race'); };
      }).then(function (mode) {
        var mine = false;
        // إذا وحدة ثانية فتحت نفس المجموعة بنفس اللحظة، بنمشي على اختيارها عشان الكل يكون إله نفس الأرقام
        return r.child('meta').transaction(function (cur) {
          if (cur && cur.at && now() - cur.at < 120000) { mine = false; return; }
          mine = true;
          return { mode: mode, seed: 1 + Math.floor(Math.random() * 999999999), at: now() };
        }).then(function (res) {
          var meta = res.snapshot.val();
          if (!mine) return r.child('p').once('value').then(function (ps) { return enter(r, name, code, meta, alive(ps.val()), done); });
          var old = {}; Object.keys(v.p || {}).forEach(function (id) { old[id] = null; });
          return Promise.all([r.child('ev').remove(), Object.keys(old).length ? r.child('p').update(old) : null]).then(function () { return enter(r, name, code, meta, {}, done); });
        });
      });
    });
  }

  function enter(r, name, code, meta, here, done) {
    var used = {};
    Object.keys(here).forEach(function (id) { used[here[id].c] = 1; });
    var color = 0; while (used[color] && color < MAX - 1) color++;
    var ref = r.child('p').push();
    room = r; me = ref;
    cfg = { room: code, name: name, id: ref.key, mode: meta.mode === 'race' ? 'race' : 'coop', color: color, seed: meta.seed | 0 };
    ref.onDisconnect().remove();
    return ref.set({ n: name, c: color, x: 0, y: 0, z: 0, r: 0, mv: 0, k: 0, w: 0, t: firebase.database.ServerValue.TIMESTAMP }).then(function () {
      listen();
      var who = '<span style="border-color:' + COLORS[color] + ';color:' + COLORS[color] + '">' + esc(name) + ' (أنا)</span>';
      Object.keys(here).forEach(function (id) {
        var p = here[id];
        who += '<span style="border-color:' + COLORS[p.c % 6] + ';color:' + COLORS[p.c % 6] + '">' + esc(p.n) + '</span>';
      });
      var d = screen(
        '<h1>أهلاً ' + esc(name) + '! 🎉</h1>' +
        '<p>دخلتِ المجموعة <b>' + esc(code) + '</b> — ' + (cfg.mode === 'coop' ? '🤝 لعب تعاوني' : '🏁 لعب تنافسي') + '<br>' +
        'لونك <b style="color:' + COLORS[color] + '">' + CNAMES[color] + '</b>، وصاحباتك رح يشوفوكِ بهاد اللون واسمك فوق راسك</p>' +
        '<div class="who">' + who + '</div>' +
        '<p style="font-size:13px">البنات اللي بيدخلوا بعدك رح يبيّنوا جوا القصر</p>' +
        '<button class="go" id="pn-start">يلا ندخل القصر</button>');
      d.querySelector('#pn-start').onclick = function () { close(); done(); };
    });
  }

  function banner(rank) {
    css();
    var b = document.createElement('div'); b.id = 'pn-rank';
    var place = ['الأولى 🥇', 'الثانية 🥈', 'الثالثة 🥉', 'الرابعة', 'الخامسة', 'السادسة'][rank - 1] || rank;
    b.innerHTML = cfg.mode === 'coop' ? '🎉 حرّرتِ آدم مع مجموعتك!' : '🏁 ترتيبك بالمجموعة: ' + place;
    document.body.appendChild(b);
    setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 9000);
  }
})();
