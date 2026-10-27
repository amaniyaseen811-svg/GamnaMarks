/* GamnaMarks — قصر المغذيات (حرر آدم): شاشات ما بعد الفوز
   الكأس ← ورقة العمل الأولى ← ورقة العمل الثانية ← النتيجة النهائية ← إرسال التقرير للمعلمة
   يونتي بتنادي window.palaceWon(الثواني، الأخطاء، النجوم، الأرواح، اللغة) لما آدم يتحرر.
   للتجربة بدون ما تلعبي اللعبة كاملة: افتحي الرابط وفي آخره  ?pwtest=1
   تصميم وإعداد د. أماني ياسين داود */
(function () {
  if (window.__palaceEnd) return;
  window.__palaceEnd = true;

  var HOME = '../index.html';
  var GAME = 'قصر المغذيات — إنقاذ آدم';
  var TEST = /[?&]pwtest=1/.test(location.search);

  /* ---------------- ورقة العمل الأولى: أسئلة أساسية (بنختار 10 من 16 كل مرة) ---------------- */
  var WS1 = [
    ['ما الوحدة البنائية للبروتينات؟', 'الأحماض الأمينية', 'السكريات الأحادية', 'الأحماض الدهنية والجليسرول', 'الأملاح المعدنية'],
    ['ما الوحدة البنائية للدهون والزيوت؟', 'الأحماض الدهنية والجليسرول', 'الأحماض الأمينية', 'الجلوكوز', 'الألياف الغذائية'],
    ['ما الاسم الشائع للجلوكوز؟', 'سكر العنب (سكر الدم)', 'سكر المائدة', 'سكر الحليب', 'سكر الشعير'],
    ['سكر الحليب هو:', 'اللاكتوز', 'المالتوز', 'السكروز', 'الفركتوز'],
    ['بأي شكل تُخزَّن الطاقة في كبد وعضلات الإنسان؟', 'الجلايكوجين', 'النشا', 'السلولوز', 'السكروز'],
    ['ما الفيتامينات التي تذوب في الدهون؟', 'A و D و E و K', 'فيتامين C ومجموعة B', 'فيتامين C و D فقط', 'فيتامين B و K فقط'],
    ['نقص فيتامين C يسبب:', 'داء الإسقربوط ونزيف اللثة', 'العشى الليلي', 'الكساح', 'بطء تخثر الدم'],
    ['نقص الحديد يسبب:', 'فقر الدم (الأنيميا)', 'تضخم الغدة الدرقية', 'هشاشة العظام', 'العشى الليلي'],
    ['العنصر الضروري لوظائف الغدة الدرقية هو:', 'اليود', 'الكالسيوم', 'الحديد', 'الصوديوم'],
    ['ما الصيغة الكيميائية للماء؟', 'H₂O', 'CO₂', 'O₂', 'H₂O₂'],
    ['ما المجموعة التي تقع في قاعدة الهرم الغذائي؟', 'الحبوب والنشويات', 'الدهون والسكريات', 'اللحوم والأسماك', 'الحليب ومشتقاته'],
    ['أجزاء نباتية لا يهضمها الجسم وتسهّل حركة الأمعاء:', 'الألياف الغذائية', 'البروتينات', 'الدهون', 'الفيتامينات'],
    ['كم عدد الأحماض الأمينية؟', '20 حمضاً أمينياً', '8 أحماض أمينية', '50 حمضاً أمينياً', '100 حمض أميني'],
    ['ما اسم الرابطة التي تربط الأحماض الأمينية ببعضها؟', 'الرابطة الببتيدية', 'الرابطة الهيدروجينية', 'الرابطة الأيونية', 'الرابطة الفلزية'],
    ['نقص فيتامين D يسبب:', 'الكساح ولين العظام', 'داء الإسقربوط', 'فقر الدم', 'الإمساك'],
    ['ما السبب الأول للوفاة في فلسطين؟', 'أمراض القلب والأوعية الدموية', 'الأورام الخبيثة (السرطان)', 'نزلات البرد', 'الكساح']
  ];

  /* ---------------- ورقة العمل الثانية: أسئلة متقدمة (تطبيق وتحليل) ---------------- */
  var WS2 = [
    ['وضعنا محلول اليود على قطعة بطاطس فصار لونها أزرق مائلاً للسواد. ماذا نستنتج؟', 'البطاطس غنية بالنشا', 'البطاطس غنية بالبروتين', 'البطاطس غنية بالدهون', 'البطاطس خالية من الكربوهيدرات'],
    ['أضفنا كاشف بيوريت إلى بياض البيض فتغيّر اللون من الأزرق إلى البنفسجي. ماذا نستنتج؟', 'وجود البروتين', 'وجود النشا', 'وجود الدهون', 'وجود فيتامين C'],
    ['وضعنا قطرة زيت في أنبوب فيه ماء، وأخرى في أنبوب فيه إيثانول. في أي أنبوب يذوب الزيت؟', 'في الإيثانول فقط', 'في الماء فقط', 'في الأنبوبين', 'لا يذوب في أي منهما'],
    ['طالبة نباتية لا تأكل أي منتجات حيوانية. ما أفضل نصيحة لها لتحصل على البروتين؟', 'تنويع البقوليات والحبوب لتحصل على كل الأحماض الأمينية الأساسية', 'الاكتفاء بنوع واحد من البقوليات', 'الإكثار من السكريات', 'الاعتماد على شرب الماء'],
    ['يتكون سكر المائدة (السكروز) من اتحاد:', 'جلوكوز + فركتوز', 'جلوكوز + جلوكوز', 'جلوكوز + جالاكتوز', 'فركتوز + جالاكتوز'],
    ['شخص يشكو من ضعف الرؤية في الليل. ما الفيتامين الذي يُرجَّح أنه ينقصه؟', 'فيتامين A', 'فيتامين C', 'فيتامين K', 'فيتامين D'],
    ['شخص جُرح ويحتاج وقتاً طويلاً حتى يتوقف النزيف. ما الفيتامين الذي يُرجَّح أنه ينقصه؟', 'فيتامين K', 'فيتامين A', 'فيتامين B', 'فيتامين D'],
    ['لماذا يُنصح بأكل الجزر (الغني بفيتامين A) مع قليل من الزيت؟', 'لأن فيتامين A يذوب في الدهون فيُمتص بشكل أفضل', 'لأن الزيت غني بفيتامين C', 'لأن الدهون تهضم الألياف', 'لأن الزيت يزيد كمية الماء في الجسم'],
    ['زيت الزيتون سائل في درجة حرارة الغرفة لأنه:', 'دهون غير مشبعة', 'دهون مشبعة', 'بروتين كامل', 'سكر متعدد'],
    ['أيّ مما يلي يرفع خطر أمراض القلب والأوعية الدموية أكثر؟', 'الإكثار من الدهون المشبعة والملح مع قلة الحركة', 'شرب الماء بكميات كافية', 'أكل الخضار والفواكه', 'تناول الألياف الغذائية'],
    ['صديقتك تعاني من الإمساك المتكرر. ما النصيحة الصحيحة؟', 'زيادة الألياف وشرب الماء', 'زيادة السكريات المصنعة', 'تقليل شرب الماء', 'الإكثار من اللحوم فقط'],
    ['في يوم حار، كيف يساعد الماء على تنظيم حرارة الجسم؟', 'بالتعرق ثم التبخر', 'بتخزين الدهون تحت الجلد', 'بإنتاج الجلايكوجين', 'بزيادة الهيموجلوبين'],
    ['عدّاءة تحتاج طاقة سريعة قبل السباق. أيّ المجموعات الغذائية الأنسب لها؟', 'الكربوهيدرات', 'الألياف', 'الفيتامينات', 'الأملاح المعدنية'],
    ['طفل يعيش في منطقة فقيرة باليود، وظهر عنده تضخم في الرقبة. ما الحل المناسب؟', 'استخدام الملح المعالج باليود', 'زيادة السكر في الطعام', 'زيادة الحديد فقط', 'تقليل شرب الماء'],
    ['ما الفحص المناسب للكشف المبكر عن سرطان القولون؟', 'فحص الدم الخفي في البراز وتنظير القولون', 'قياس ضغط الدم', 'تخطيط القلب', 'فحص النظر'],
    ['لماذا يُمتص الجلوكوز مباشرة دون أن يحتاج إلى هضم؟', 'لأنه سكر أحادي', 'لأنه سكر متعدد', 'لأنه بروتين', 'لأنه من الدهون']
  ];

  /* ---------------- أدوات ---------------- */
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmt(sec) { sec = Math.max(0, Math.round(sec)); var m = Math.floor(sec / 60), s = sec % 60; return m + ':' + (s < 10 ? '0' : '') + s; }
  function starsTxt(n) { var s = ''; for (var i = 0; i < 3; i++) s += i < n ? '★' : '☆'; return s; }
  function pick(bank, n) {
    return shuffle(bank).slice(0, n).map(function (q) {
      return { q: q[0], right: q[1], opts: shuffle(q.slice(1)), chosen: null };
    });
  }

  /* ---------------- الشكل ---------------- */
  var CSS =
    '#pwEnd{position:fixed;inset:0;z-index:2147483500;display:none;overflow-y:auto;direction:rtl;font-family:Tahoma,"Segoe UI",Arial,sans-serif;color:#fff;' +
    'background:radial-gradient(circle at 50% 30%,#3a2070,#140a2a 70%);-webkit-overflow-scrolling:touch}' +
    '#pwEnd *{box-sizing:border-box}' +
    '#pwEnd .pw-scr{display:none;min-height:100%;padding:24px 16px 40px;text-align:center}' +
    '#pwEnd .pw-scr.pw-on{display:block;animation:pwIn .45s ease}' +
    '@keyframes pwIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}' +
    '#pwEnd h2{color:#ffd76a;font-size:30px;margin:10px 0 6px}' +
    '#pwEnd p.pw-sub{opacity:.9;font-size:17px;line-height:1.8;margin:0 auto 14px;max-width:640px}' +
    '#pwEnd .pw-btn{all:unset;display:inline-block;cursor:pointer;margin:8px 6px;padding:13px 26px;border-radius:14px;font-weight:bold;font-size:18px;' +
    'background:linear-gradient(180deg,#ffe08a,#f4b733);color:#2a1650;border:2px solid #fff3c4;box-shadow:0 4px 0 #a8741a;touch-action:manipulation}' +
    '#pwEnd .pw-btn:active{transform:translateY(2px);box-shadow:0 2px 0 #a8741a}' +
    '#pwEnd .pw-btn.pw-ghost{background:rgba(255,255,255,.08);color:#fff;border-color:rgba(255,215,106,.6);box-shadow:none}' +
    '#pwEnd .pw-btn[disabled]{opacity:.45;pointer-events:none}' +
    /* الكأس */
    '#pwEnd .pw-cupbox{position:relative;width:230px;height:230px;margin:10px auto 0}' +
    '#pwEnd .pw-rays{position:absolute;inset:-40px;border-radius:50%;background:repeating-conic-gradient(rgba(255,215,106,.35) 0 10deg,transparent 10deg 20deg);animation:pwSpin 12s linear infinite;' +
    '-webkit-mask:radial-gradient(circle,#000 30%,transparent 70%);mask:radial-gradient(circle,#000 30%,transparent 70%)}' +
    '@keyframes pwSpin{to{transform:rotate(360deg)}}' +
    '#pwEnd .pw-cup{position:absolute;inset:0;display:grid;place-items:center;font-size:150px;animation:pwBob 2.2s ease-in-out infinite;filter:drop-shadow(0 8px 18px rgba(255,200,60,.6))}' +
    '@keyframes pwBob{50%{transform:translateY(-10px) scale(1.04)}}' +
    '#pwEnd .pw-pts{display:inline-block;margin:8px 0 14px;padding:8px 22px;border-radius:30px;background:#2c8a4b;font-size:24px;font-weight:bold;border:2px solid #9ff0b8}' +
    '#pwEnd .pw-mini{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin:6px auto 16px;max-width:640px}' +
    '#pwEnd .pw-mini div{background:rgba(255,255,255,.08);border:1px solid rgba(255,215,106,.4);border-radius:12px;padding:8px 14px;font-size:16px}' +
    '#pwEnd .pw-mini b{color:#ffd76a;font-size:20px;margin-inline-start:6px}' +
    /* ورقة العمل */
    '#pwEnd .pw-ws{max-width:760px;margin:0 auto;text-align:right}' +
    '#pwEnd .pw-wshead{text-align:center;margin-bottom:10px}' +
    '#pwEnd .pw-bar{height:10px;background:rgba(255,255,255,.12);border-radius:6px;overflow:hidden;margin:6px auto 4px;max-width:420px}' +
    '#pwEnd .pw-bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#ffd76a,#ff8ad8);transition:width .3s}' +
    '#pwEnd .pw-cnt{font-size:15px;opacity:.85}' +
    '#pwEnd .pw-q{background:rgba(30,18,60,.85);border:1.5px solid rgba(255,215,106,.45);border-radius:16px;padding:14px 16px;margin:12px 0}' +
    '#pwEnd .pw-qt{font-size:19px;font-weight:bold;line-height:1.7;margin-bottom:10px}' +
    '#pwEnd .pw-qt span{display:inline-grid;place-items:center;width:32px;height:32px;border-radius:50%;background:#ffd76a;color:#2a1650;margin-inline-end:8px;font-size:16px}' +
    '#pwEnd .pw-op{all:unset;display:block;width:100%;cursor:pointer;margin:7px 0;padding:11px 14px;border-radius:12px;background:rgba(255,255,255,.07);border:2px solid transparent;font-size:17px;line-height:1.6;touch-action:manipulation;box-sizing:border-box}' +
    '#pwEnd .pw-op:hover{background:rgba(255,255,255,.13)}' +
    '#pwEnd .pw-op.pw-sel{border-color:#ffd76a;background:rgba(255,215,106,.18)}' +
    '#pwEnd .pw-op.pw-ok{border-color:#4ade80;background:rgba(74,222,128,.22)}' +
    '#pwEnd .pw-op.pw-bad{border-color:#f87171;background:rgba(248,113,113,.22)}' +
    '#pwEnd .pw-done .pw-op{pointer-events:none}' +
    '#pwEnd .pw-fb{font-size:15px;margin-top:6px;display:none}' +
    '#pwEnd .pw-done .pw-fb{display:block}' +
    '#pwEnd .pw-foot{text-align:center;margin-top:14px}' +
    '#pwEnd .pw-note{color:#ffb4b4;font-size:16px;min-height:24px}' +
    '#pwEnd .pw-score{font-size:26px;font-weight:bold;color:#ffd76a;margin:10px 0}' +
    /* النتيجة */
    '#pwEnd .pw-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;max-width:760px;margin:14px auto}' +
    '#pwEnd .pw-stat{background:rgba(30,18,60,.85);border:1.5px solid rgba(255,215,106,.45);border-radius:16px;padding:14px 8px}' +
    '#pwEnd .pw-stat b{display:block;font-size:28px;color:#ffd76a;margin-bottom:4px}' +
    '#pwEnd .pw-stat span{font-size:15px;opacity:.9}' +
    '#pwEnd .pw-rate{display:inline-block;font-size:26px;font-weight:bold;padding:8px 26px;border-radius:30px;background:rgba(255,215,106,.15);border:2px solid #ffd76a;margin:6px 0}' +
    '#pwEnd .pw-big{font-size:46px;color:#ffd76a;letter-spacing:6px}' +
    '#pwEnd .pw-test{position:sticky;top:0;background:#b91c1c;padding:6px;font-size:14px;z-index:2}' +
    '#pwHome{all:unset;position:fixed;top:8px;left:8px;z-index:2147483400;width:42px;height:42px;border-radius:50%;display:grid;place-items:center;cursor:pointer;' +
    'background:rgba(20,12,40,.82);border:1.5px solid rgba(255,215,106,.8);font-size:20px;box-shadow:0 3px 10px rgba(0,0,0,.4);touch-action:manipulation}' +
    '#gmRepBtn{display:none!important}' +
    '@media (max-width:600px){#pwEnd h2{font-size:24px}#pwEnd .pw-cupbox{width:170px;height:170px}#pwEnd .pw-cup{font-size:110px}#pwEnd .pw-qt{font-size:17px}#pwEnd .pw-op{font-size:16px}}' +
    '@media print{body>*:not(#pwEnd){display:none!important}#pwEnd{position:static;background:#fff;color:#000;overflow:visible}#pwEnd .pw-btn,#pwEnd .pw-foot{display:none!important}' +
    '#pwEnd .pw-q{background:#fff;border-color:#999}#pwEnd .pw-op{color:#000}#pwEnd h2{color:#000}}';

  var root, R = { secs: 0, mistakes: 0, stars: 0, souls: 0, lang: 'ar', ws1: null, ws2: null, s1: 0, s2: 0 };

  function stopBubble(el) {
    /* عشان يونتي ما يلقط الكبسات والكليكات وإحنا بشاشات الورقة */
    ['click', 'pointerdown', 'pointerup', 'touchstart', 'touchend', 'mousedown', 'mouseup', 'keydown', 'keyup', 'keypress', 'wheel'].forEach(function (ev) {
      el.addEventListener(ev, function (e) { e.stopPropagation(); });
    });
  }

  function build() {
    if (root) return;
    var st = document.createElement('style'); st.id = 'pwEndCss'; st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
    root = document.createElement('div'); root.id = 'pwEnd';
    root.innerHTML =
      (TEST ? '<div class="pw-test">وضع التجربة — النتائج هون للتجربة بس</div>' : '') +
      '<section class="pw-scr" id="pwTrophy">' +
      '  <div class="pw-cupbox"><div class="pw-rays"></div><div class="pw-cup">🏆</div></div>' +
      '  <h2>كأس محرِّرة آدم</h2>' +
      '  <p class="pw-sub">أحسنتِ! جمعتِ المفاتيح الثمانية، وهزمتِ وحش القبو، وحرّرتِ آدم ورجّعتيه لأخته نور.</p>' +
      '  <div class="pw-pts">+30 نقطة</div>' +
      '  <div class="pw-mini" id="pwTrMini"></div>' +
      '  <p class="pw-sub">باقي خطوتين: ورقة العمل الأولى (أسئلة أساسية) وورقة العمل الثانية (أسئلة متقدمة).</p>' +
      '  <button class="pw-btn" id="pwToWs1">📝 ورقة العمل الأولى</button>' +
      '</section>' +
      '<section class="pw-scr" id="pwWs"><div class="pw-ws">' +
      '  <div class="pw-wshead"><h2 id="pwWsTitle"></h2><p class="pw-sub" id="pwWsSub"></p>' +
      '  <div class="pw-bar"><i id="pwWsBar"></i></div><div class="pw-cnt" id="pwWsCnt"></div></div>' +
      '  <div id="pwWsList"></div>' +
      '  <div class="pw-foot"><div class="pw-note" id="pwWsNote"></div><div class="pw-score" id="pwWsScore"></div>' +
      '  <button class="pw-btn" id="pwWsSubmit">✅ تسليم الورقة</button>' +
      '  <button class="pw-btn" id="pwWsNext" style="display:none"></button></div>' +
      '</div></section>' +
      '<section class="pw-scr" id="pwRes">' +
      '  <h2>🏅 النتيجة النهائية</h2>' +
      '  <div class="pw-big" id="pwResStars"></div>' +
      '  <div class="pw-rate" id="pwResRate"></div>' +
      '  <div class="pw-grid">' +
      '    <div class="pw-stat"><b id="pwRPts">0</b><span>⭐ مجموع العلامات</span></div>' +
      '    <div class="pw-stat"><b id="pwRTime">0:00</b><span>⏱ وقت المغامرة</span></div>' +
      '    <div class="pw-stat"><b id="pwRMist">0</b><span>❌ أخطاء المغامرة</span></div>' +
      '    <div class="pw-stat"><b id="pwRW1">0/10</b><span>📝 ورقة العمل الأولى</span></div>' +
      '    <div class="pw-stat"><b id="pwRW2">0/10</b><span>📝 ورقة العمل الثانية</span></div>' +
      '    <div class="pw-stat"><b id="pwRPct">0%</b><span>📈 نسبة الأداء</span></div>' +
      '  </div>' +
      '  <p class="pw-sub" id="pwResMsg"></p>' +
      '  <div><button class="pw-btn" id="pwSend">📤 أرسلي التقرير للمعلمة</button></div>' +
      '  <div><button class="pw-btn pw-ghost" id="pwAgain">🔁 العبي مرة تانية</button>' +
      '  <button class="pw-btn pw-ghost" id="pwPrint">🖨 طباعة</button>' +
      '  <button class="pw-btn pw-ghost" id="pwGoHome">🏠 الرئيسية</button></div>' +
      '</section>';
    document.body.appendChild(root);
    stopBubble(root);
    root.querySelector('#pwToWs1').onclick = function () { startWs(1); };
    root.querySelector('#pwWsSubmit').onclick = submitWs;
    root.querySelector('#pwWsNext').onclick = function () { if (R.cur === 1) startWs(2); else showResults(); };
    root.querySelector('#pwSend').onclick = sendReport;
    root.querySelector('#pwAgain').onclick = function () { location.reload(); };
    root.querySelector('#pwPrint').onclick = function () { window.print(); };
    root.querySelector('#pwGoHome').onclick = goHome;
  }

  function show(id) {
    root.style.display = 'block';
    var all = root.querySelectorAll('.pw-scr');
    for (var i = 0; i < all.length; i++) all[i].classList.toggle('pw-on', all[i].id === id);
    root.scrollTop = 0;
  }

  function sound(ok) {
    try {
      var C = window.AudioContext || window.webkitAudioContext; if (!C) return;
      var c = sound.ctx || (sound.ctx = new C());
      var notes = ok ? [523, 659, 784, 1047] : [330, 262];
      notes.forEach(function (f, i) {
        var o = c.createOscillator(), g = c.createGain();
        o.frequency.value = f; o.type = 'triangle';
        g.gain.setValueAtTime(0.0001, c.currentTime + i * 0.12);
        g.gain.exponentialRampToValueAtTime(0.25, c.currentTime + i * 0.12 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + i * 0.12 + 0.3);
        o.connect(g); g.connect(c.destination); o.start(c.currentTime + i * 0.12); o.stop(c.currentTime + i * 0.12 + 0.32);
      });
    } catch (e) {}
  }

  /* ---------------- الكأس ---------------- */
  function showTrophy() {
    build();
    root.querySelector('#pwTrMini').innerHTML =
      '<div>⏱ الوقت<b>' + fmt(R.secs) + '</b></div>' +
      '<div>❌ الأخطاء<b>' + R.mistakes + '</b></div>' +
      '<div>النجوم<b>' + starsTxt(R.stars) + '</b></div>';
    show('pwTrophy');
    sound(true);
  }

  /* ---------------- أوراق العمل ---------------- */
  function startWs(n) {
    R.cur = n;
    var qs = n === 1 ? (R.ws1 = pick(WS1, 10)) : (R.ws2 = pick(WS2, 10));
    root.querySelector('#pwWsTitle').textContent = n === 1 ? '📝 ورقة العمل الأولى — أسئلة أساسية' : '📝 ورقة العمل الثانية — أسئلة متقدمة';
    root.querySelector('#pwWsSub').textContent = n === 1
      ? 'جاوبي على الأسئلة العشرة، وبعدين اضغطي «تسليم الورقة». كل سؤال إله علامة.'
      : 'هاي الأسئلة بدها تفكير: مواقف وتجارب من الدرس. جاوبي على العشرة وسلّمي الورقة.';
    var list = root.querySelector('#pwWsList');
    list.innerHTML = qs.map(function (q, i) {
      return '<div class="pw-q" data-i="' + i + '"><div class="pw-qt"><span>' + (i + 1) + '</span>' + esc(q.q) + '</div>' +
        q.opts.map(function (o, j) { return '<button class="pw-op" data-j="' + j + '">' + esc(o) + '</button>'; }).join('') +
        '<div class="pw-fb"></div></div>';
    }).join('');
    list.querySelectorAll('.pw-op').forEach(function (b) {
      b.onclick = function () {
        var qd = b.closest('.pw-q'), q = qs[+qd.getAttribute('data-i')];
        q.chosen = +b.getAttribute('data-j');
        qd.querySelectorAll('.pw-op').forEach(function (x) { x.classList.toggle('pw-sel', x === b); });
        progress(qs);
      };
    });
    root.querySelector('#pwWsSubmit').style.display = '';
    root.querySelector('#pwWsNext').style.display = 'none';
    root.querySelector('#pwWsScore').textContent = '';
    root.querySelector('#pwWsNote').textContent = '';
    progress(qs);
    show('pwWs');
  }

  function progress(qs) {
    var done = qs.filter(function (q) { return q.chosen !== null; }).length;
    root.querySelector('#pwWsBar').style.width = (done * 10) + '%';
    root.querySelector('#pwWsCnt').textContent = 'جاوبتِ ' + done + ' من 10';
  }

  function submitWs() {
    var n = R.cur, qs = n === 1 ? R.ws1 : R.ws2;
    var left = qs.filter(function (q) { return q.chosen === null; }).length;
    if (left) {
      root.querySelector('#pwWsNote').textContent = 'لسا في ' + left + ' أسئلة بدون جواب ✍';
      qs.some(function (q, i) { if (q.chosen === null) { root.querySelectorAll('.pw-q')[i].scrollIntoView({ behavior: 'smooth', block: 'center' }); return true; } return false; });
      return;
    }
    var score = 0;
    root.querySelectorAll('#pwWsList .pw-q').forEach(function (qd, i) {
      var q = qs[i], ok = q.opts[q.chosen] === q.right;
      if (ok) score++;
      qd.classList.add('pw-done');
      qd.querySelectorAll('.pw-op').forEach(function (b, j) {
        b.classList.remove('pw-sel');
        if (q.opts[j] === q.right) b.classList.add('pw-ok');
        else if (j === q.chosen) b.classList.add('pw-bad');
      });
      var fb = qd.querySelector('.pw-fb');
      fb.textContent = ok ? '✔ إجابة صحيحة' : '✘ الإجابة الصحيحة: ' + q.right;
      fb.style.color = ok ? '#86efac' : '#fca5a5';
    });
    if (n === 1) R.s1 = score; else R.s2 = score;
    if (window.GMReport && !TEST) {
      GMReport.correct(score); GMReport.wrong(10 - score);
      GMReport.add(n === 1 ? 'ورقة العمل الأولى' : 'ورقة العمل الثانية', score, 10);
    }
    sound(score >= 6);
    root.querySelector('#pwWsNote').textContent = '';
    root.querySelector('#pwWsScore').textContent = 'علامتك: ' + score + ' من 10 ' + (score >= 9 ? '🌟' : score >= 7 ? '👏' : '💪');
    root.querySelector('#pwWsSubmit').style.display = 'none';
    var nx = root.querySelector('#pwWsNext');
    nx.textContent = n === 1 ? '📝 ورقة العمل الثانية' : '🏅 النتيجة النهائية';
    nx.style.display = '';
    root.querySelector('#pwWsScore').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ---------------- النتيجة ---------------- */
  function totals() {
    var pts = R.s1 + R.s2 + R.stars;                          /* نجوم المغامرة من 3 + الورقتين من 20 = من 23 (نفس التقرير) */
    var pct = Math.round(pts / 23 * 100);
    var rate = pct >= 90 ? 'ممتاز 🌟' : pct >= 80 ? 'جيد جداً 👍' : pct >= 65 ? 'جيد ✔' : pct >= 50 ? 'مقبول' : 'بحاجة لمتابعة 💪';
    return { pts: pts, pct: pct, rate: rate };
  }

  function showResults() {
    var t = totals();
    root.querySelector('#pwResStars').textContent = starsTxt(R.stars);
    root.querySelector('#pwResRate').textContent = t.rate;
    root.querySelector('#pwRPts').textContent = t.pts + ' / 23';
    root.querySelector('#pwRTime').textContent = fmt(R.secs);
    root.querySelector('#pwRMist').textContent = R.mistakes;
    root.querySelector('#pwRW1').textContent = R.s1 + ' / 10';
    root.querySelector('#pwRW2').textContent = R.s2 + ' / 10';
    root.querySelector('#pwRPct').textContent = t.pct + '%';
    root.querySelector('#pwResMsg').textContent = R.mistakes <= 2
      ? 'أداء رائع! حرّرتِ آدم بأخطاء قليلة جداً.'
      : 'حلو كتير! جرّبي مرة تانية وقلّلي أخطاءك عشان تاخدي 3 نجوم.';
    if (window.GMReport && !TEST) {
      GMReport.add('نجوم مغامرة القصر', R.stars, 3);
    }
    show('pwRes');
    sound(true);
  }

  function sendReport() {
    if (TEST) { alertBox('هاد وضع التجربة، فالتقرير ما بينبعت. بالعب العادي بينبعت للمعلمة.'); return; }
    if (window.GMReport) GMReport.finish();
    else alertBox('ما قدرت أوصل لنظام التقارير. تأكدي إنه النت شغال وجربي كمان مرة.');
  }

  function alertBox(msg) {
    var n = root.querySelector('#pwResMsg'); n.textContent = msg; n.style.color = '#fca5a5';
  }

  function goHome() {
    location.href = HOME;
  }

  /* أزرار الرئيسية تبعت التقرير (gm-report) بتروح لـ index.html — هون لازم نطلع مجلد لفوق */
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest && e.target.closest('#gmHome2,#gmLeave');
    if (!t) return;
    e.stopImmediatePropagation(); e.preventDefault();
    setTimeout(function () { location.href = HOME; }, 150);
  }, true);

  /* زر الرئيسية طول اللعب */
  function addHome() {
    if (document.getElementById('pwHome')) return;
    var st = document.getElementById('pwEndCss');
    if (!st) { st = document.createElement('style'); st.id = 'pwEndCss'; st.textContent = CSS; document.head.appendChild(st); }
    var b = document.createElement('button');
    b.id = 'pwHome'; b.title = 'الرئيسية'; b.setAttribute('aria-label', 'الرئيسية'); b.textContent = '🏠';
    document.body.appendChild(b);
    stopBubble(b);
    b.onclick = function () {
      if (window.GMReport && !TEST) GMReport.show(); /* بيعرض التقرير وفيه زر الرئيسية */
      else location.href = HOME;
    };
  }

  /* ---------------- النداء من يونتي ---------------- */
  window.palaceWon = function (secs, mistakes, stars, souls, lang) {
    R.secs = +secs || 0; R.mistakes = +mistakes || 0; R.stars = Math.max(1, Math.min(3, +stars || 1));
    R.souls = +souls || 0; R.lang = lang || 'ar';
    try { if (document.pointerLockElement && document.exitPointerLock) document.exitPointerLock(); } catch (e) {}
    try { if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen(); } catch (e) {}
    try { if (document.webkitFullscreenElement && document.webkitExitFullscreen) document.webkitExitFullscreen(); } catch (e) {}
    if (window.GMReport && !TEST) GMReport.add('نجوم مغامرة القصر', R.stars, 3);
    setTimeout(showTrophy, 2500); /* نخلي شاشة الفوز تبعت يونتي تبين شوي */
  };

  function init() {
    addHome();
    if (TEST) setTimeout(function () { window.palaceWon(754, 3, 2, 104, 'ar'); }, 600);
  }
  if (document.body) init(); else document.addEventListener('DOMContentLoaded', init);
})();
