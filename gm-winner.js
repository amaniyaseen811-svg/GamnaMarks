/* GamnaMarks — احتفال بطلة الشهر
   بآخر يوم بالشهر: بيطلع عرض متحرك فيه الجنية بتكتب اسم صاحبة أعلى نقاط بخط ذهبي فخم،
   وبعدين بتلف حوالين الاسم والسحر حواليه، و«ألف مبروك».
   الاستعمال بصفحة index.html (بعد gm-points.js):
     <script src="gm-winner.js" defer></script>
   للتجربة: افتحي index.html?winner=اسم الطالبة  أو صفحة winner-demo.html
   يحتاج الملفات: gm-fairy.webp و gm-winner-font.ttf بنفس المجلد */
(function () {
  'use strict';
  var BASE = (function () {
    var s = document.currentScript && document.currentScript.src;
    return s ? s.replace(/[^\/]*$/, '') : '';
  })();
  var META = {"fw":286,"fh":244,"cols":12,"n":96,"ax":143,"ay":88,"f":[[-0.952,-0.338],[-0.93,-0.404],[-0.904,-0.468],[-0.874,-0.53],[-0.84,-0.587],[-0.803,-0.641],[-0.763,-0.692],[-0.718,-0.739],[-0.671,-0.781],[-0.622,-0.82],[-0.569,-0.855],[-0.514,-0.886],[-0.457,-0.913],[-0.398,-0.936],[-0.337,-0.955],[-0.275,-0.971],[-0.211,-0.983],[-0.147,-0.992],[-0.082,-0.998],[-0.017,-1.0],[0.049,-0.999],[0.114,-0.995],[0.179,-0.987],[0.243,-0.976],[0.306,-0.962],[0.368,-0.944],[0.427,-0.922],[0.486,-0.897],[0.542,-0.869],[0.595,-0.836],[0.647,-0.799],[0.695,-0.759],[0.741,-0.715],[0.783,-0.666],[0.822,-0.614],[0.858,-0.559],[0.889,-0.5],[0.917,-0.438],[0.942,-0.373],[0.962,-0.306],[0.977,-0.236],[0.989,-0.165],[0.997,-0.093],[1.0,-0.02],[0.999,0.053],[0.993,0.126],[0.984,0.198],[0.97,0.269],[0.952,0.338],[0.93,0.404],[0.904,0.468],[0.874,0.53],[0.84,0.587],[0.803,0.641],[0.763,0.692],[0.718,0.739],[0.671,0.781],[0.622,0.82],[0.569,0.855],[0.514,0.886],[0.457,0.913],[0.398,0.936],[0.337,0.955],[0.275,0.971],[0.211,0.983],[0.147,0.992],[0.082,0.998],[0.017,1.0],[-0.049,0.999],[-0.114,0.995],[-0.179,0.987],[-0.243,0.976],[-0.306,0.962],[-0.368,0.944],[-0.427,0.922],[-0.486,0.897],[-0.542,0.869],[-0.595,0.836],[-0.647,0.799],[-0.695,0.759],[-0.741,0.715],[-0.783,0.666],[-0.822,0.614],[-0.858,0.559],[-0.889,0.5],[-0.917,0.438],[-0.942,0.373],[-0.962,0.306],[-0.977,0.236],[-0.989,0.165],[-0.997,0.093],[-1.0,0.02],[-0.999,-0.053],[-0.993,-0.126],[-0.984,-0.198],[-0.97,-0.269]]};
  var MONTHS = ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'];

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function today() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function isLastDay(d) { d = d || new Date(); return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate() === d.getDate(); }
  function ease(x) { x = Math.max(0, Math.min(1, x)); return 1 - Math.pow(1 - x, 3); }
  function back(x) { x = Math.max(0, Math.min(1, x)); var c = 1.70158; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); }

  var sheet = null, fontReady = null;
  function loadAssets() {
    if (!sheet) { sheet = new Image(); sheet.src = BASE + 'gm-fairy.webp'; }
    if (!fontReady) {
      try {
        var ff = new FontFace('GMGold', 'url(' + BASE + 'gm-winner-font.ttf?v=2)', { weight: 'bold' });
        fontReady = ff.load().then(function (f) { document.fonts.add(f); }).catch(function () {});
      } catch (e) { fontReady = Promise.resolve(); }
    }
    var imgReady = new Promise(function (res) { if (sheet.complete && sheet.naturalWidth) res(); else { sheet.onload = res; sheet.onerror = res; } });
    return Promise.all([imgReady, fontReady]);
  }

  function show(opts) {
    opts = opts || {};
    var name = String(opts.name || '').trim(); if (!name) return;
    var d = new Date(); var month = opts.month || (MONTHS[d.getMonth()] + ' ' + d.getFullYear());
    loadAssets().then(function () { run(name, month, opts.onDone); });
  }

  function run(name, month, onDone) {
    var wrap = document.createElement('div');
    wrap.id = 'gmWinner';
    wrap.style.cssText = 'position:fixed;inset:0;z-index:2147483640;background:#0b0620;opacity:0;transition:opacity .6s';
    var cv = document.createElement('canvas'); cv.style.cssText = 'width:100%;height:100%;display:block';
    wrap.appendChild(cv);
    var btn = document.createElement('button');
    btn.textContent = 'متابعة ✨';
    btn.style.cssText = 'position:absolute;left:50%;bottom:3%;transform:translateX(-50%);padding:12px 34px;border:none;border-radius:30px;cursor:pointer;font:800 19px "Baloo Bhaijaan 2",Tahoma,sans-serif;color:#2a1150;background:linear-gradient(90deg,#fde68a,#f59e0b,#fde68a);box-shadow:0 0 24px rgba(252,211,77,.7);opacity:0;transition:opacity .8s;pointer-events:none';
    wrap.appendChild(btn);
    document.body.appendChild(wrap);
    requestAnimationFrame(function () { wrap.style.opacity = '1'; });

    var ctx = cv.getContext('2d'), W, H, DPR, S, nameCv, nameW, nameH, nameX, nameY, fs;
    var dust = [], swirl = [];
    for (var i = 0; i < 90; i++) dust.push({ x: Math.random(), y: Math.random(), r: 1 + Math.random() * 2.6, v: .015 + Math.random() * .04, p: Math.random() * 6.28 });
    for (i = 0; i < 70; i++) swirl.push({ a: Math.random() * 6.28, s: .6 + Math.random() * .9, k: .9 + Math.random() * .35, r: 1.5 + Math.random() * 2.5, p: Math.random() * 6.28 });

    function goldGrad(y0, y1) {
      var g = ctx.createLinearGradient(0, y0, 0, y1);
      g.addColorStop(0, '#fff7c8'); g.addColorStop(.45, '#ffcd50'); g.addColorStop(1, '#c47f14'); return g;
    }
    var FONT = 'GMGold, "Amiri", serif';
    // نص ذهبي فخم: إطار ذهبي فاتح، حد بني غامق، تدرّج معدني، ولمعة على الحواف
    function makeGold(text, size) {
      var c = document.createElement('canvas').getContext('2d');
      c.font = 'bold ' + size + 'px ' + FONT;
      var tw = c.measureText(text).width, pad = size * .55;
      var cv2 = document.createElement('canvas'); cv2.width = Math.ceil(tw + pad * 2); cv2.height = Math.ceil(size * 2.2);
      var n = cv2.getContext('2d'), x = cv2.width / 2, y = cv2.height / 2;
      function setup(k) { k.font = 'bold ' + size + 'px ' + FONT; k.textAlign = 'center'; k.textBaseline = 'middle'; k.direction = 'rtl'; k.lineJoin = 'round'; }
      setup(n);
      n.shadowColor = 'rgba(255,185,60,.9)'; n.shadowBlur = size * .32;
      n.lineWidth = size * .16; n.strokeStyle = '#f7d27a'; n.strokeText(text, x, y);
      n.shadowBlur = 0;
      n.lineWidth = size * .1; n.strokeStyle = '#a8690c'; n.strokeText(text, x, y);
      n.lineWidth = size * .055; n.strokeStyle = '#3d1c02'; n.strokeText(text, x, y);
      var g = n.createLinearGradient(0, y - size * .6, 0, y + size * .6);
      g.addColorStop(0, '#fffbe6'); g.addColorStop(.18, '#ffe082'); g.addColorStop(.36, '#d99a1e');
      g.addColorStop(.5, '#fff1b0'); g.addColorStop(.62, '#f2b53a'); g.addColorStop(.82, '#a8650a'); g.addColorStop(1, '#ffd36a');
      n.fillStyle = g; n.fillText(text, x, y);
      // لمعة الحواف العلوية (حفر ذهبي)
      var h = document.createElement('canvas'); h.width = cv2.width; h.height = cv2.height;
      var hk = h.getContext('2d'); setup(hk);
      hk.fillStyle = '#fff'; hk.fillText(text, x, y);
      hk.globalCompositeOperation = 'destination-out'; hk.fillText(text, x + size * .025, y + size * .035);
      n.globalAlpha = .75; n.drawImage(h, 0, 0); n.globalAlpha = 1;
      return cv2;
    }
    var nameCv, mabCv, mask = null, writeDur = 0;
    function buildMask() {
      // ترتيب كتابة الحروف: كل حرف من بدايته على طول خطه (مسافة على الحرف نفسه)، من اليمين للشمال، والنقاط بعد حرفها
      var k = Math.min(.5, 200 / nameH), mw = Math.ceil(nameW * k), mh = Math.ceil(nameH * k);
      var tc = document.createElement('canvas'); tc.width = mw; tc.height = mh;
      var c = tc.getContext('2d'); c.font = 'bold ' + fs * k + 'px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.direction = 'rtl';
      c.fillStyle = '#fff'; c.fillText(name, mw / 2, mh / 2);
      var px = c.getImageData(0, 0, mw, mh).data, N = mw * mh, on = new Uint8Array(N), lab = new Int32Array(N).fill(-1), i, j;
      for (i = 0; i < N; i++) on[i] = px[i * 4 + 3] > 90 ? 1 : 0;
      var comps = [], q = new Int32Array(N);
      for (i = 0; i < N; i++) if (on[i] && lab[i] < 0) {
        var h = 0, t = 0, id = comps.length, list = []; q[t++] = i; lab[i] = id;
        var mnx = 1e9, mxx = -1;
        while (h < t) { var p = q[h++]; list.push(p); var x = p % mw, y = (p / mw) | 0; if (x < mnx) mnx = x; if (x > mxx) mxx = x;
          for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) { var xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= mw || yy >= mh) continue; var r = yy * mw + xx; if (on[r] && lab[r] < 0) { lab[r] = id; q[t++] = r; } } }
        comps.push({ px: list, mnx: mnx, mxx: mxx, cx: (mnx + mxx) / 2 });
      }
      var big = comps.filter(function (o) { return o.px.length > 40; }).sort(function (a, b) { return b.mxx - a.mxx; });
      var small = comps.filter(function (o) { return o.px.length <= 40; });
      big.forEach(function (o) { o.kids = []; });
      small.forEach(function (s) {
        var best = null, bd = 1e9;
        big.forEach(function (o) { var d = s.cx < o.mnx ? o.mnx - s.cx : s.cx > o.mxx ? s.cx - o.mxx : 0; if (d < bd) { bd = d; best = o; } });
        if (best) best.kids.push(s);
      });
      var order = []; big.forEach(function (o) { order.push(o); o.kids.sort(function (a, b) { return b.cx - a.cx; }).forEach(function (s) { order.push(s); }); });
      var dist = new Float32Array(N).fill(Infinity), off = 0, GAP = 6;
      order.forEach(function (o) {
        var st = o.px[0], bv = -1e9;
        o.px.forEach(function (p) { var v = (p % mw) - .6 * ((p / mw) | 0); if (v > bv) { bv = v; st = p; } });
        var h = 0, t = 0, md = 0; q[t++] = st; dist[st] = off;
        while (h < t) { var p = q[h++], x = p % mw, y = (p / mw) | 0, dp = dist[p];
          for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) { var xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= mw || yy >= mh) continue; var r = yy * mw + xx;
            if (on[r] && lab[r] === lab[st] && dist[r] === Infinity) { dist[r] = dp + ((dx && dy) ? 1.41 : 1); if (dist[r] - off > md) md = dist[r] - off; q[t++] = r; } } }
        off += md + GAP;
      });
      var D = Math.max(1, off - GAP);
      // مسار رأس القلم
      var NS = 400, sx = new Float32Array(NS), sy = new Float32Array(NS), sc = new Float32Array(NS);
      for (i = 0; i < N; i++) if (on[i] && dist[i] < Infinity) { var b = Math.min(NS - 1, (dist[i] / D * NS) | 0); sx[b] += i % mw; sy[b] += (i / mw) | 0; sc[b]++; }
      var lx = mw, ly = mh / 2;
      for (i = 0; i < NS; i++) { if (sc[i]) { lx = sx[i] / sc[i]; ly = sy[i] / sc[i]; } sx[i] = lx; sy[i] = ly; }
      // توسيع القناع ليغطي التوهج والإطار حوالين الحرف
      var R = Math.ceil(fs * k * .3), d2 = new Float32Array(dist);
      for (var it = 0; it < R; it++) { var src = d2.slice(0);
        for (i = 0; i < N; i++) if (src[i] === Infinity) { var x = i % mw, m = Infinity;
          if (x > 0 && src[i - 1] < m) m = src[i - 1]; if (x < mw - 1 && src[i + 1] < m) m = src[i + 1];
          if (i >= mw && src[i - mw] < m) m = src[i - mw]; if (i + mw < N && src[i + mw] < m) m = src[i + mw]; d2[i] = m; } }
      var mc = document.createElement('canvas'); mc.width = mw; mc.height = mh;
      var tmp = document.createElement('canvas'); tmp.width = nameW; tmp.height = nameH;
      mask = { k: k, mw: mw, mh: mh, dist: d2, D: D, sx: sx, sy: sy, NS: NS, mc: mc, mctx: mc.getContext('2d'), img: mc.getContext('2d').createImageData(mw, mh), tmp: tmp, tctx: tmp.getContext('2d') };
      if (!writeDur) writeDur = Math.max(3.8, Math.min(7.5, D / 70));
    }
    function layout() {
      DPR = Math.min(2, window.devicePixelRatio || 1);
      W = cv.width = Math.round(innerWidth * DPR); H = cv.height = Math.round(innerHeight * DPR);
      S = Math.min(W, H) / 1000;
      var c = document.createElement('canvas').getContext('2d');
      fs = Math.min(H * .15, 180 * S * 1.4);
      c.font = 'bold ' + fs + 'px ' + FONT;
      var tw = c.measureText(name).width;
      if (tw > W * .7) fs *= W * .7 / tw;
      nameCv = makeGold(name, fs);
      nameW = nameCv.width; nameH = nameCv.height;
      nameX = (W - nameW) / 2; nameY = H * .47 - nameH / 2;
      mabCv = makeGold('ألف مبروك!', Math.min(H * .08, fs * .62));
      buildMask();
    }
    layout();
    addEventListener('resize', layout);
    // يرسم الاسم: أثناء الكتابة بيظهر بس الجزء اللي كتبته الجنية
    function drawName(cur, shine, pulse) {
      var m = mask, tk = m.tctx;
      tk.globalCompositeOperation = 'source-over'; tk.clearRect(0, 0, nameW, nameH); tk.drawImage(nameCv, 0, 0);
      if (cur < m.D + 1) {
        var d = m.img.data, ds = m.dist;
        for (var i = 0, n = ds.length; i < n; i++) { var v = cur - ds[i]; d[i * 4 + 3] = v >= 1.5 ? 255 : v <= -1.5 ? 0 : (v + 1.5) * 85; }
        m.mctx.putImageData(m.img, 0, 0);
        tk.globalCompositeOperation = 'destination-in'; tk.imageSmoothingEnabled = true; tk.drawImage(m.mc, 0, 0, nameW, nameH);
      }
      if (shine > 0 && shine < 1) {
        tk.globalCompositeOperation = 'source-atop';
        var x = -nameW * .3 + nameW * 1.6 * shine, g = tk.createLinearGradient(x - nameW * .12, 0, x + nameW * .12, nameH * .4);
        g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,255,240,.85)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        tk.fillStyle = g; tk.fillRect(0, 0, nameW, nameH);
      }
      tk.globalCompositeOperation = 'source-over';
      ctx.save(); ctx.translate(nameX + nameW / 2, nameY + nameH / 2); ctx.scale(pulse, pulse);
      ctx.drawImage(m.tmp, -nameW / 2, -nameH / 2); ctx.restore();
    }
    function penAt(cur) {
      var m = mask, s = Math.max(0, Math.min(m.NS - 1, (cur / m.D * m.NS) | 0));
      return [nameX + m.sx[s] / m.k, nameY + m.sy[s] / m.k];
    }

    var front = []; for (i = 0; i < META.n; i++) if (META.f[i][1] < -.35 && Math.abs(META.f[i][0]) < .75) front.push(i);
    function drawFairy(k, x, y, sc, flip, alpha) {
      var fw = META.fw, fh = META.fh, sx = (k % META.cols) * fw, sy = Math.floor(k / META.cols) * fh;
      ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); if (flip) ctx.scale(-1, 1);
      ctx.drawImage(sheet, sx, sy, fw, fh, -META.ax * sc, -META.ay * sc, fw * sc, fh * sc);
      ctx.restore();
    }
    function star(x, y, r, a) {
      ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#fff1b8'; ctx.beginPath();
      for (var j = 0; j < 8; j++) { var an = j * Math.PI / 4, rr = j % 2 ? r * .28 : r; ctx.lineTo(x + rr * Math.cos(an), y + rr * Math.sin(an)); }
      ctx.fill(); ctx.restore();
    }

    var t0 = performance.now(), done = false, trail = [];
    var T_WRITE0 = 1.8, T_WRITE1 = T_WRITE0 + writeDur, pen = null;
    function frame(now) {
      if (done) return;
      var t = (now - t0) / 1000;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      var bg = ctx.createRadialGradient(W / 2, H * .45, 0, W / 2, H * .45, Math.max(W, H) * .75);
      bg.addColorStop(0, '#3a1d72'); bg.addColorStop(.55, '#170b38'); bg.addColorStop(1, '#07031a');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      // غبار ذهبي
      dust.forEach(function (p) {
        var y = ((p.y - p.v * t) % 1 + 1) % 1 * H, x = p.x * W + Math.sin(t * .8 + p.p) * 12 * S;
        var a = (Math.sin(t * 3 + p.p * 3) + 1) / 2;
        ctx.globalAlpha = .35 + .6 * a; ctx.fillStyle = '#ffe08c';
        ctx.beginPath(); ctx.arc(x, y, p.r * S * (0.7 + .6 * a), 0, 6.283); ctx.fill();
      });
      ctx.globalAlpha = 1;
      // العنوان
      var a1 = ease((t - .3) / .8);
      if (a1 > 0) {
        ctx.save(); ctx.globalAlpha = a1; ctx.textAlign = 'center'; ctx.direction = 'rtl'; ctx.textBaseline = 'middle';
        var f1 = Math.min(H * .05, 54 * S * 1.3);
        ctx.font = '800 ' + f1 + 'px "Baloo Bhaijaan 2", Tahoma, sans-serif';
        var tw1 = ctx.measureText('👑 بطلة شهر ' + month + ' 👑').width;
        if (tw1 > W * .92) { f1 *= W * .92 / tw1; ctx.font = '800 ' + f1 + 'px "Baloo Bhaijaan 2", Tahoma, sans-serif'; }
        ctx.shadowColor = 'rgba(255,190,70,.8)'; ctx.shadowBlur = 18 * S;
        ctx.fillStyle = goldGrad(H * .17 - f1, H * .17 + f1);
        ctx.fillText('👑 بطلة شهر ' + month + ' 👑', W / 2, H * .17 + (1 - a1) * 20 * S);
        ctx.font = '600 ' + f1 * .62 + 'px "Baloo Bhaijaan 2", Tahoma, sans-serif'; ctx.shadowBlur = 0; ctx.fillStyle = '#e9ddff';
        ctx.fillText('صاحبة أعلى نقاط في GamnaMarks', W / 2, H * .17 + f1 * 1.15);
        ctx.restore();
      }
      var cx = W / 2, cy = nameY + nameH / 2;
      // مرحلة الكتابة: الجنية بتطير من اليمين للشمال وبتكتب الاسم
      var wp = (t - T_WRITE0) / (T_WRITE1 - T_WRITE0);
      var fsc = Math.max(.45, Math.min(1.2, Math.min(W, H * .7) / 640));
      var orbit = t > T_WRITE1 + .25;
      var Rx = Math.min(nameW * .58 + 60 * S, W * (W < H ? .32 : .38)), Ry = nameH * .55 + 40 * S;
      var ok = Math.floor(t * 30) % META.n;
      var od = orbit ? META.f[ok] : null;
      var behind = orbit && od[1] > 0;
      // دوامة السحر حوالين الاسم
      var sw = ease((t - T_WRITE1) / 1.2);
      function drawSwirl(back) {
        if (sw <= 0) return;
        swirl.forEach(function (p) {
          var an = p.a + t * p.s;
          var sy = Math.sin(an); if ((sy < 0) !== back) return;
          var x = cx + Math.cos(an) * Rx * p.k, y = cy + sy * Ry * p.k * .55 - Math.cos(an * 2 + p.p) * 6 * S;
          var tw = (Math.sin(t * 5 + p.p) + 1) / 2;
          star(x, y, p.r * S * 3 * (.6 + tw), sw * (.4 + .6 * tw) * (back ? .55 : 1));
        });
        ctx.save(); ctx.globalAlpha = sw * (back ? .25 : .45); ctx.strokeStyle = '#ffd36b'; ctx.lineWidth = 2.2 * S;
        for (var r = 0; r < 2; r++) {
          ctx.beginPath();
          var off = t * (r ? -.9 : .7) + r * 2;
          for (var j = 0; j <= 60; j++) {
            var an = off + j / 60 * Math.PI; if (!back) an += Math.PI;
            ctx.lineTo(cx + Math.cos(an) * Rx * (1 + .06 * r), cy + Math.sin(an) * Ry * .55 * (1 + .1 * r));
          }
          ctx.stroke();
        }
        ctx.restore();
      }
      drawSwirl(true);
      if (behind) drawFairy(ok, cx + od[0] * Rx, cy - od[1] * Ry * .45 - nameH * .12 + Math.sin(t * 2.4) * 8 * S, fsc * (1 - .12 * od[1]), false, 1);
      // الاسم: الجنية بتكتب الحروف حرف حرف
      var cur = wp <= 0 ? -5 : wp >= 1 ? mask.D + 10 : wp * mask.D;
      if (cur > -2) drawName(cur, (t - T_WRITE1 - .1) / 1.3, orbit ? 1 + .02 * Math.sin(t * 3) : 1);
      // الجنية وهي بتكتب
      if (!orbit) {
        var fa = ease((t - .9) / .6), tgt;
        if (wp < 0) { var p0 = penAt(0), e = ease((t - .9) / (T_WRITE0 - .9)); tgt = [W + 200 * S + (p0[0] - W - 200 * S) * e, p0[1] - 140 * S * (1 - e)]; }
        else if (wp <= 1) tgt = penAt(cur);
        else { var e2 = ease((t - T_WRITE1) / .25); var pl = penAt(mask.D); var o0 = META.f[ok]; tgt = [pl[0] + (cx + o0[0] * Rx - pl[0]) * e2, pl[1] + (cy - o0[1] * Ry * .45 - nameH * .12 - pl[1]) * e2]; }
        pen = pen ? [pen[0] + (tgt[0] - pen[0]) * .35, pen[1] + (tgt[1] - pen[1]) * .35] : tgt;
        if (wp > 0 && wp < 1) {
          trail.push({ x: pen[0], y: pen[1], t: t });
          var gl = ctx.createRadialGradient(pen[0], pen[1], 0, pen[0], pen[1], 46 * S);
          gl.addColorStop(0, 'rgba(255,250,210,.95)'); gl.addColorStop(.35, 'rgba(255,215,110,.55)'); gl.addColorStop(1, 'rgba(255,200,90,0)');
          ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(pen[0], pen[1], 46 * S, 0, 6.283); ctx.fill();
        }
        var k = front[Math.floor(t * 30) % front.length];
        // يد الجنية (العصاية) عند رأس القلم
        if (fa > 0) drawFairy(k, pen[0] - META.fw * fsc * .02, pen[1] - META.fh * fsc * .58 + Math.sin(t * 6) * 4 * S, fsc, true, fa);
      }
      // ذيل اللمعة
      trail = trail.filter(function (p) { return t - p.t < 1.2; });
      trail.forEach(function (p, i) { var age = (t - p.t) / 1.2, j = (i * 37 % 11) - 5; star(p.x + j * 3 * S, p.y + age * 50 * S + j * 2 * S, (9 - 7 * age) * S, 1 - age); });
      drawSwirl(false);
      if (orbit && !behind) drawFairy(ok, cx + od[0] * Rx, cy - od[1] * Ry * .45 - nameH * .12 + Math.sin(t * 2.4) * 8 * S, fsc * (1 - .12 * od[1]), false, 1);
      // ألف مبروك
      var a3 = back((t - T_WRITE1 - .9) / .7);
      if (a3 > 0) {
        ctx.save();
        ctx.translate(W / 2, Math.min(cy + nameH * .42 + Ry * .45 + mabCv.height * .3, H * .86 - mabCv.height * .5)); ctx.scale(a3, a3);
        ctx.drawImage(mabCv, -mabCv.width / 2, -mabCv.height / 2);
        ctx.restore();
      }
      if (t > T_WRITE1 + 2.2 && btn.style.opacity !== '1') { btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    function close() {
      if (done) return; wrap.style.opacity = '0';
      setTimeout(function () { done = true; wrap.remove(); removeEventListener('resize', layout); if (onDone) onDone(); }, 600);
    }
    btn.onclick = close;
  }

  /* التشغيل التلقائي: آخر يوم بالشهر، مرة وحدة باليوم، اسم صاحبة أعلى نقاط هالشهر */
  function auto() {
    var q = (location.search.match(/[?&]winner=([^&]+)/) || [])[1];
    if (q) { show({ name: decodeURIComponent(q.replace(/\+/g, ' ')) }); return; }
    if (!isLastDay()) return;
    try { if (localStorage.getItem('gm_winner_shown') === today()) return; } catch (e) {}
    var tries = 0;
    (function wait() {
      if (!(window.GMPoints && GMPoints.boards)) { if (++tries < 40) setTimeout(wait, 500); return; }
      GMPoints.boards(true).then(function (c) {
        var list = (c && c.cur) || [];
        var w = list.filter(function (x) { return x.verified; })[0] || list[0];
        if (!w || !w.pts) return;
        try { localStorage.setItem('gm_winner_shown', today()); } catch (e) {}
        show({ name: w.display });
      });
    })();
  }

  window.GMWinner = { show: show, isLastDay: isLastDay };
  if (document.currentScript && document.currentScript.hasAttribute('data-manual')) return;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(auto, 2500); });
  else setTimeout(auto, 2500);
})();
