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
        var ff = new FontFace('GMRuqaa', 'url(' + BASE + 'gm-winner-font.ttf)');
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
    function layout() {
      DPR = Math.min(2, window.devicePixelRatio || 1);
      W = cv.width = Math.round(innerWidth * DPR); H = cv.height = Math.round(innerHeight * DPR);
      S = Math.min(W, H) / 1000;
      // اسم الطالبة على كانفس لحاله
      var c = document.createElement('canvas').getContext('2d');
      fs = Math.min(H * .16, 190 * S * 1.4);
      c.font = fs + 'px GMRuqaa, serif';
      var tw = c.measureText(name).width;
      if (tw > W * .72) { fs *= W * .72 / tw; }
      c.font = fs + 'px GMRuqaa, serif'; tw = c.measureText(name).width;
      var pad = fs * .6;
      nameCv = document.createElement('canvas'); nameCv.width = Math.ceil(tw + pad * 2); nameCv.height = Math.ceil(fs * 2.1);
      var n = nameCv.getContext('2d');
      n.font = fs + 'px GMRuqaa, serif'; n.textAlign = 'center'; n.textBaseline = 'middle'; n.direction = 'rtl';
      var cx = nameCv.width / 2, cy = nameCv.height / 2;
      n.shadowColor = 'rgba(255,190,70,.85)'; n.shadowBlur = fs * .35;
      n.lineWidth = Math.max(3, fs * .06); n.strokeStyle = '#5a2d05'; n.strokeText(name, cx, cy);
      var g = n.createLinearGradient(0, cy - fs * .55, 0, cy + fs * .55);
      g.addColorStop(0, '#fff7c8'); g.addColorStop(.45, '#ffd257'); g.addColorStop(1, '#c47f14');
      n.fillStyle = g; n.fillText(name, cx, cy);
      n.shadowBlur = 0; n.fillText(name, cx, cy);
      nameW = nameCv.width; nameH = nameCv.height;
      nameX = (W - nameW) / 2; nameY = H * .47 - nameH / 2;
    }
    layout();
    addEventListener('resize', layout);

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
    var T_WRITE0 = 1.6, T_WRITE1 = 5.2;
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
      var fsc = Math.max(.6, Math.min(1.4, Math.min(W, H * .7) / 520));
      var orbit = t > T_WRITE1 + .2;
      var Rx = Math.min(nameW * .58 + 60 * S, W * (W < H ? .32 : .38)), Ry = nameH * .55 + 40 * S;
      var ok = Math.floor(t * 30) % META.n;
      var od = orbit ? META.f[ok] : null;
      var behind = orbit && od[1] > 0;
      // دوامة السحر حوالين الاسم
      var sw = ease((t - T_WRITE1 + .3) / 1.2);
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
      // الاسم: بيظهر من اليمين للشمال مع الجنية
      var revealX;
      if (wp <= 0) revealX = nameX + nameW + 10; else if (wp >= 1) revealX = nameX - 10;
      else revealX = nameX + nameW - (nameW + 20) * ease(wp * 1.02);
      if (revealX < nameX + nameW) {
        var pulse = orbit ? 1 + .025 * Math.sin(t * 3) : 1;
        ctx.save();
        ctx.beginPath(); ctx.rect(revealX, 0, W - revealX, H); ctx.clip();
        ctx.translate(cx, cy); ctx.scale(pulse, pulse);
        ctx.drawImage(nameCv, -nameW / 2, -nameH / 2);
        ctx.restore();
      }
      // الجنية وهي بتكتب
      if (!orbit) {
        var fa = ease((t - .9) / .6);
        var fx = wp < 0 ? W + 160 * S - (W + 160 * S - (nameX + nameW)) * ease((t - .9) / (T_WRITE0 - .9)) : revealX;
        if (wp > 1) fx = nameX - 10 + (cx + Rx * -.9 - (nameX - 10)) * ease((t - T_WRITE1) / .2);
        var fy = cy - nameH * .62 + Math.sin(t * 6) * 6 * S;
        var k = front[Math.floor(t * 30) % front.length];
        // لمعة رأس العصاية
        if (wp > 0 && wp < 1) {
          trail.push({ x: fx, y: cy + (Math.random() - .5) * nameH * .5, t: t });
          var gl = ctx.createRadialGradient(fx, cy, 0, fx, cy, 60 * S);
          gl.addColorStop(0, 'rgba(255,240,180,.9)'); gl.addColorStop(1, 'rgba(255,200,90,0)');
          ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(fx, cy, 60 * S, 0, 6.283); ctx.fill();
        }
        if (fa > 0) drawFairy(k, fx + 40 * S, fy, fsc, true, fa);
      }
      // ذيل اللمعة
      trail = trail.filter(function (p) { return t - p.t < 1.2; });
      trail.forEach(function (p) { var age = (t - p.t) / 1.2; star(p.x + (age * 30 - 15) * S, p.y + age * 40 * S, (10 - 8 * age) * S, 1 - age); });
      drawSwirl(false);
      if (orbit && !behind) drawFairy(ok, cx + od[0] * Rx, cy - od[1] * Ry * .45 - nameH * .12 + Math.sin(t * 2.4) * 8 * S, fsc * (1 - .12 * od[1]), false, 1);
      // ألف مبروك
      var a3 = back((t - T_WRITE1 - .1) / .7);
      if (a3 > 0) {
        ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'rtl';
        var f3 = Math.min(H * .085, fs * .7);
        ctx.translate(W / 2, Math.min(cy + nameH * .5 + Ry * .45 + f3 * .8, H * .84 - f3)); ctx.scale(a3, a3);
        ctx.font = f3 + 'px GMRuqaa, serif';
        ctx.shadowColor = 'rgba(255,190,70,.9)'; ctx.shadowBlur = 22 * S;
        ctx.lineWidth = Math.max(2, f3 * .05); ctx.strokeStyle = '#5a2d05'; ctx.strokeText('ألف مبروك!', 0, 0);
        ctx.fillStyle = goldGrad(-f3 * .6, f3 * .6); ctx.fillText('ألف مبروك!', 0, 0);
        ctx.restore();
      }
      if (t > T_WRITE1 + 1.4 && btn.style.opacity !== '1') { btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; }
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
