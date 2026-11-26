/* GamnaMarks — الأسئلة البديلة لما الطالبة تغلط (ورقة العمل الأولى والثانية)
   تصميم وإعداد د. أماني ياسين داود
   - العلامة بتنحسب من أول محاولة بس (زي ما هي باللعبة)
   - كل سؤال غلطت فيه الطالبة بيطلعلها تحته سؤال بديل على نفس الفكرة
   - إذا غلطت بالبديل الأول بيطلع البديل التاني، وإذا غلطت كمان بيطلعلها الجواب الصح مع الشرح
   - بنوك البدائل بملفات مجلد altq/ : كل سؤال أصلي إله سؤالين بدال
     window.GMAltQBank = { 'نص السؤال الأصلي': [ [سؤال، صح، غلط، غلط، غلط، شرح], [ ...البديل التاني ] ] }
   الاستعمال جوّا اللعبة:  GMAltQ.mount(عنصر_تحت_السؤال, 'نص السؤال الأصلي', رقم_الورقة, لما_تخلص)
   (اللعبة بتخبّي الجواب الصح للسؤال الأصلي لحد ما تخلص البدائل، عشان ما يكون البديل محلول)  */
(function () {
  if (window.GMAltQ) return;

  function norm(t) {
    return String(t || '').replace(/<[^>]*>/g, '').replace(/^\s*[٠-٩0-9]+\s*[.\-)]\s*/, '')
      .replace(/[ً-ْـ]/g, '').replace(/\s+/g, ' ').trim();
  }
  var IDX = null;
  function index() {
    if (IDX) return IDX;
    IDX = {};
    var B = window.GMAltQBank || {};
    Object.keys(B).forEach(function (k) { IDX[norm(k)] = B[k]; });
    return IDX;
  }
  function find(q) { return index()[norm(q)] || null; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var CSS =
    '.gmaq{margin:10px 0 4px;padding:12px;border-radius:14px;border:2px dashed rgba(255,215,106,.55);background:rgba(255,215,106,.08);direction:rtl;text-align:right;font-family:inherit}' +
    '.gmaq-h{font-size:14px;font-weight:800;color:#ffd76a;margin-bottom:6px}' +
    '.gmaq-q{font-size:16px;font-weight:700;line-height:1.7;margin-bottom:8px;color:inherit}' +
    '.gmaq-o{display:block;width:100%;text-align:right;margin:6px 0;padding:10px 12px;border-radius:12px;border:2px solid rgba(255,255,255,.25);background:rgba(0,0,0,.25);color:inherit;font-size:15px;line-height:1.6;cursor:pointer;font-family:inherit}' +
    '.gmaq-o.ok{border-color:#4ade80;background:rgba(74,222,128,.25)}' +
    '.gmaq-o.bad{border-color:#f87171;background:rgba(248,113,113,.25)}' +
    '.gmaq-o:disabled{cursor:default}' +
    '.gmaq-f{font-size:15px;line-height:1.7;margin-top:6px;font-weight:700}';
  function css() {
    if (document.getElementById('gmaqCss')) return;
    var s = document.createElement('style'); s.id = 'gmaqCss'; s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  var STAT = {};
  function stat(sheet) { return STAT[sheet] || (STAT[sheet] = { wrong: 0, fixed: 0, done: 0 }); }
  function reportSheet(sheet) {
    var st = stat(sheet);
    if (st.done < st.wrong) return;
    try { if (window.GMReport) GMReport.add('تصحيح الأخطاء بأسئلة بديلة (' + sheet + ')', st.fixed, st.wrong); } catch (e) {}
  }

  /* host: عنصر بنحط تحته السؤال البديل · q: نص السؤال الأصلي · sheet: رقم الورقة */
  function mount(host, q, sheet, onDone) {
    var alts = find(q);
    if (!host || !alts || !alts.length) return false;
    css();
    sheet = sheet || 1;
    stat(sheet).wrong++;
    var box = document.createElement('div'); box.className = 'gmaq';
    ['click', 'pointerdown', 'touchstart', 'mousedown', 'keydown'].forEach(function (ev) { box.addEventListener(ev, function (e) { e.stopPropagation(); }); });
    host.parentNode.insertBefore(box, host.nextSibling);
    var k = 0;
    function show() {
      var a = alts[k], opts = shuffle(a.slice(1, 5));
      box.innerHTML = '<div class="gmaq-h">🔁 سؤال بديل ' + (k + 1) + ' من ' + alts.length + ' — جرّبي نفس الفكرة بطريقة تانية</div>' +
        '<div class="gmaq-q">' + esc(a[0]) + '</div>' +
        opts.map(function (o, j) { return '<button type="button" class="gmaq-o" data-j="' + j + '">' + esc(o) + '</button>'; }).join('') +
        '<div class="gmaq-f"></div>';
      [].forEach.call(box.querySelectorAll('.gmaq-o'), function (b) {
        b.onclick = function (e) {
          e.preventDefault();
          var ok = opts[+b.getAttribute('data-j')] === a[1];
          [].forEach.call(box.querySelectorAll('.gmaq-o'), function (x) {
            x.disabled = true;
            if (opts[+x.getAttribute('data-j')] === a[1]) x.classList.add('ok');
          });
          if (!ok) b.classList.add('bad');
          var f = box.querySelector('.gmaq-f');
          if (ok) {
            f.style.color = '#86efac';
            f.textContent = '✅ أحسنتِ! فهمتِ الفكرة.' + (a[5] ? ' 💡 ' + a[5] : '');
            stat(sheet).fixed++; stat(sheet).done++; reportSheet(sheet); if (onDone) try { onDone(true); } catch (er) {}
          } else if (k < alts.length - 1) {
            f.style.color = '#fca5a5';
            f.textContent = '✘ مش هيك… خدي سؤال بديل تاني.';
            k++; setTimeout(show, 1400);
          } else {
            f.style.color = '#fde68a';
            f.textContent = '📖 الإجابة الصحيحة: ' + a[1] + (a[5] ? ' — ' + a[5] : '') + ' راجعي هالفكرة بالدرس.';
            stat(sheet).done++; reportSheet(sheet); if (onDone) try { onDone(false); } catch (er) {}
          }
        };
      });
    }
    show();
    return true;
  }

  function reset(sheet) { if (sheet) delete STAT[sheet]; else STAT = {}; }

  window.GMAltQ = { mount: mount, find: find, reset: reset, norm: norm };
})();
