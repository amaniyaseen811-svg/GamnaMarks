import json, os, subprocess, sys, html
from playwright.sync_api import sync_playwright

V = '/home/claude/vid'
SH = V + '/shots'
OUT = V + '/seg'
os.makedirs(OUT, exist_ok=True)
RECTS = json.load(open(SH + '/rects.json'))
SW, SHH = 390, 696  # game viewport (css px)

AR = '٠١٢٣٤٥٦٧٨٩'
def ar(n): return ''.join(AR[int(c)] for c in str(n))

S3 = 'القسم ٣ · المراحل الست'
S4 = 'القسم ٤ · الحكم والجوائز'
S5 = 'القسم ٥ · اللعب الجماعي أونلاين'
S6 = 'القسم ٦ · أكاديمية الملكية الفكرية'

# ('sec', num, title) | ('ov',) | (shot, title, text, section, baked?)
ITEMS = [
 ('sec', 3, 'المراحل الست'),
 ('hud', 'الشريط العلوي', 'في الأعلى: المستوى، ونقاطك ⭐، والوقت المتبقي ⏱️ من 30 دقيقة.', S3),
 ('help', 'زر التعليمات', 'اضغطي ❓ في أي وقت لقراءة التعليمات.', S3),
 ('helpmodal', 'نافذة التعليمات', 'تلخّص النافذة قواعد اللعبة وطريقة احتساب النقاط.', S3),
 ('board', 'لوحة التحقيق', 'في اللوحة يظهر «المدخل» أولًا، ثم 6 مراحل تُفتح بالترتيب، وكل مرحلة نوع من أنواع الملكية الفكرية.', S3),
 ('boardgo', 'ابدئي بالمدخل', 'اضغطي «ابدئي بالمدخل 🧠» لتبدئي رحلتك.', S3),
 ('intro_note', 'صفحة المدخل', 'يعرّفك المدخل على الصورة الكاملة قبل المرحلة ١؛ اقرئيه بروية.', S3),
 ('intro_def', 'تعريف الملكية الفكرية', 'تعريف الملكية الفكرية كما تذكره المنظمة العالمية للملكية الفكرية (الويبو).', S3),
 ('intro_types', 'الأنواع الستة', 'أنواع الملكية الفكرية الستة بترتيب الويبو، ومعها «مجالات مرتبطة».', S3),
 ('intro_journey', 'رحلتك في المراحل', 'يوضّح هذا السطر ترتيب المراحل الست: من الحماية التلقائية إلى خطة الحماية الشاملة.', S3),
 ('intro_wait', 'عدّاد ٢٠ ثانية', 'زر المتابعة لا يعمل إلا بعد 20 ثانية من القراءة.', S3),
 ('intro_go', 'إلى المرحلة ١', 'بعد انتهاء العدّ اضغطي «فهمت، إلى المرحلة 1».', S3),
 ('ov',),
 ('ch_note', 'صفحة المعلومات', 'في أعلى كل مرحلة تنبيه مهم: اقرئي بروية وركّزي جيدًا.', S3),
 ('ch_link', 'سطر الرابط', 'تبدأ كل مرحلة بسطر «🔗» يربطها بالمرحلة التي قبلها.', S3),
 ('ch_seq', 'ترتيب ثابت', 'المعلومات مرتّبة دائمًا: التعريف، ماذا تحمي، كيف تنشأ الحماية، الشروط، المدة، الحقوق، الاستثناءات، الإثبات والتعدّي.', S3),
 ('ch_ex', 'مثال من الحياة', 'في آخر الصفحة «مثال من الحياة» يقرّب الفكرة إليك.', S3),
 ('ch_go', 'إلى الأسئلة', 'بعد 20 ثانية يعمل الزر؛ اضغطي «فهمت، إلى الأسئلة».', S3),
 ('q', 'أسئلة المرحلة', 'أجيبي عن 5 أسئلة مرتّبة من الأساسي إلى التطبيقي، ويظهر بعد كل إجابة شرح قصير.', S3),
 ('q_num', 'رقم السؤال', 'هنا رقم السؤال وشريط التقدّم في المرحلة.', S3),
 ('q_ok', 'إجابة صحيحة', 'إذا أجبتِ إجابة صحيحة يتلوّن الخيار بالأخضر، وتظهر «أحسنتِ!» مع شرح قصير، وتُضاف النقاط: 10 في المستوى العادي، و15 في الصعب.', S3),
 ('q_no', 'إجابة خاطئة', 'إذا أخطأتِ يتلوّن اختيارك بالأحمر، ويظهر الخيار الصحيح بالأخضر مع شرح السبب، ويُطفأ قلب. (الخيارات مغبّشة حتى لا تنكشف الإجابات)', S3),
 ('q_hearts', 'القلوب الثلاثة', 'لكِ 3 قلوب ❤️ في كل مرحلة، وكل خطأ يُطفئ قلبًا.', S3),
 ('q_fail', 'نفدت المحاولات', 'بعد 3 أخطاء في المرحلة تظهر رسالة «نفدت محاولاتك»؛ راجعي المعلومات، ثم اضغطي «أعيدي المرحلة» لتبدئي بأسئلة جديدة.', S3),
 ('classify', 'تحدي التصنيف', 'ضعي كل عبارة في الخانة الصحيحة (5 عبارات).', S3),
 ('cls_mix', 'صح أو خطأ في التصنيف', 'التصنيف الصحيح يظهر بالأخضر (+5 نقاط). وإذا أخطأتِ يظهر اختيارك بالأحمر والتصنيف الصحيح بالأخضر، ويُطفأ قلب.', S3),
 ('clue', 'دليل جديد', 'بعد إنهاء المرحلة تحصلين على دليل جديد (+20 نقطة)؛ اقرئيه جيدًا.', S3),
 ('clues', 'الأدلة المحفوظة', 'تُحفظ الأدلة في لوحة التحقيق لتعودي إليها متى شئت.', S3),
 ('next', 'المرحلة التالية', 'تُفتح المرحلة التالية؛ كرّري الخطوات نفسها حتى تُنهي المراحل الست.', S3),
 ('sec', 4, 'الحكم والجوائز'),
 ('accuse', 'لحظة الحكم', 'بعد المراحل الست تصلين إلى لحظة الحكم؛ راجعي الأدلة الستة كلها بهدوء.', S4),
 ('accuse_pick', 'اتّهمي السارق', 'اضغطي صورة من تعتقدين أنه السارق. الاتهام الصحيح من أول مرة = 50 نقطة. (لن نكشف الحل هنا!)', S4),
 ('acc_no', 'اتّهام خاطئ', 'إذا اتّهمتِ الشخص الخطأ تظهر رسالة «ليس الشخص الصحيح» مع السبب؛ راجعي الأدلة وحاولي مرة أخرى (الاتهام الصحيح بعد محاولة خاطئة = 20 نقطة).', S4),
 ('trophy', 'الكأس', 'بعد كشف الحقيقة تستلمين الكأس 🏆 (+30 نقطة).', S4),
 ('trophy_ws', 'ثلاث أوراق عمل', 'تنتظرك ثلاث أوراق عمل متدرّجة في الصعوبة: أساسية ← متقدمة ← تحليلية. اضغطي «ورقة العمل الأولى».', S4),
 ('ws1', 'ورقة العمل الأولى', 'ورقة أساسية من 10 أسئلة، و5 نقاط لكل إجابة صحيحة.', S4),
 ('ws1_opts', 'أجيبي', 'اختاري الإجابة، ثم اضغطي «التالي».', S4),
 ('ws_ok', 'إجابة صحيحة في الورقة', 'الإجابة الصحيحة تتلوّن بالأخضر، ويظهر «إجابة صحيحة»، ويزيد عدّاد الإجابات الصحيحة في الأعلى (+5 نقاط).', S4),
 ('ws_no', 'إجابة خاطئة في الورقة', 'عند الخطأ يتلوّن اختيارك بالأحمر، وتظهر الإجابة الصحيحة مظلّلة بالأخضر لتتعلّمي منها.', S4),
 ('ws2', 'ورقة العمل الثانية', 'ثم ورقة متقدمة من 10 أسئلة أخرى.', S4),
 ('ws3', 'ورقة العمل الثالثة', 'وأخيرًا ورقة تحليلية هي الأصعب: حالات عملية تجمع أكثر من نوع من أنواع الحماية.', S4),
 ('more', 'هل تريدين أن تتعلّمي أكثر؟', 'بعد الورقة الثالثة تظهر رسالة: في التطبيق فرع خاص هو «أكاديمية الملكية الفكرية»، فيه دورات وشهادات من جمعية مختصة.', S4),
 ('more_btns', 'الأكاديمية أو النتيجة', 'اضغطي «ادخلي إلى الأكاديمية» للدورات، أو «اعرضي نتيجتي» لتكملي.', S4),
 ('results', 'النتيجة النهائية', 'تظهر نتيجتك: النقاط، والوقت، وأسئلة المراحل، وأوراق العمل الثلاث، ورتبتك.', S4),
 ('results_btns', 'هدية وتقرير', 'افتحي هدية المارد، أو اطّلعي على تقريرك، أو العبي مرة أخرى.', S4),
 ('genie', 'صناديق المارد', 'اختاري صندوقًا واحدًا من الصناديق الأربعة 🎁 واكتشفي هديتك.', S4),
 ('sec', 5, 'اللعب الجماعي أونلاين'),
 ('live1', 'اسمك وشخصيتك', 'بعد اختيار «أونلاين مع صاحباتي» اكتبي اسمك، واختاري شخصيتك.', S5, True),
 ('live2', 'غرفة جديدة أو كود', 'واحدة فقط تنشئ غرفة جديدة، والباقيات يدخلن بكود الغرفة.', S5, True),
 ('live3', 'تعاون أو تنافس', 'صاحبة الغرفة تختار: تعاون 🤝 (فريق واحد) أو تنافس 🏁 (سباق)، ثم «أنشئي الغرفة».', S5, True),
 ('live4', 'كود الغرفة', 'يظهر كود الغرفة؛ شاركيه مع صاحباتك.', S5, True),
 ('live5', 'الدخول بالكود', 'صاحباتك يضغطن «ادخلي بكود غرفة»، ويكتبن الكود، ثم «ادخلي».', S5, True),
 ('live6', 'اللاعبات في الغرفة', 'تظهر اللاعبات في الغرفة: 6 لاعبات أو أكثر.', S5, True),
 ('live7', 'يلا نبلّش', 'عندما تكتمل المجموعة تضغط صاحبة الغرفة «يلا نبلّش كلنا!».', S5, True),
 ('live8', 'مسار السباق', 'أثناء اللعب يظهر مسار لكل لاعبة، وترين أين وصلت صاحباتك.', S5, True),
 ('live9', 'التفاصيل', 'اضغطي على المسار لتري الترتيب والنقاط والأخطاء لكل لاعبة.', S5, True),
 ('live10', 'الترتيب النهائي', 'في النهاية يظهر الترتيب للجميع حسب النتائج.', S5, True),
 ('sec', 6, 'أكاديمية الملكية الفكرية'),
 ('academy', 'أكاديمية الملكية الفكرية', 'فرع خاص في التطبيق، فيه دورات لجميع المستويات وشهادات من الجمعية الأمريكية العربية لحماية الملكية الفكرية (AAIPA).', S6, True),
]

FIRST_STEP = 24

CSS = """
*{margin:0;padding:0;box-sizing:border-box}
body{width:%(W)dpx;height:%(H)dpx;overflow:hidden;font-family:'Mada',sans-serif;direction:rtl;color:#fff;
 background:radial-gradient(ellipse 62%% 72%% at 50%% 42%%,#30225c 0%%,#1d1348 42%%,#0e0927 78%%,#07051a 100%%)}
.abs{position:absolute}
.phone{position:absolute;border-radius:%(PR)dpx;padding:6px;background:linear-gradient(160deg,#e8c56a,#5d43b5 45%%,#3b2c78 60%%,#e8c56a);box-shadow:0 30px 80px rgba(0,0,0,.55)}
.scr{position:relative;width:100%%;height:100%%;border-radius:%(SR)dpx;overflow:hidden;background:#05060d;border:4px solid #2c2166}
.scr img{position:absolute;left:0;top:0;width:100%%}
.hl{position:absolute;border:%(HB)dpx solid #ffd60a;border-radius:16px;box-shadow:0 0 0 4000px rgba(0,0,0,.45),0 0 34px 8px rgba(255,214,10,.65),inset 0 0 18px rgba(255,214,10,.35)}
.pill{position:absolute;border:3px solid #c9a227;border-radius:60px;color:#fcd34d;font-weight:700;background:rgba(0,0,0,.18);white-space:nowrap}
.circ{position:absolute;border-radius:50%%;background:radial-gradient(circle at 35%% 30%%,#fbe38a,#e2b743 70%%,#c99a2e);color:#1d1450;font-weight:900;display:flex;align-items:center;justify-content:center;box-shadow:0 0 40px rgba(252,211,77,.45)}
.t1{color:#fff;font-weight:800}.t2{color:#fcd34d;font-weight:800}
.card{position:absolute;border:2px solid rgba(201,162,39,.45);border-radius:30px;background:rgba(255,255,255,.035);display:flex;align-items:center}
.card p{width:100%%;font-weight:600;line-height:1.6}
.t1,.t2,.pill,.circ{font-family:'Rakkas',serif;font-weight:400!important}
"""

def step_html(o, shot, num, title, text, section, baked):
    W, H = (1920, 1080) if o == 'h' else (1080, 1920)
    if o == 'h':
        P = dict(x=112, y=42, w=568, h=996)
    else:
        P = dict(x=213, y=288, w=654, h=1150)
    inner_w = P['w'] - 12 - 8
    s = inner_w / SW
    hl = ''
    if not baked and shot:
        x, y, w, h = RECTS[shot]
        pad = 7
        hl = f'<div class="hl" style="left:{x*s-pad}px;top:{y*s-pad}px;width:{w*s+2*pad}px;height:{h*s+2*pad}px"></div>'
    img = f'<img src="file://{SH}/{shot}.jpg">' if shot else ''
    phone = f'<div class="phone" style="left:{P["x"]}px;top:{P["y"]}px;width:{P["w"]}px;height:{P["h"]}px"><div class="scr">{img}{hl}</div></div>'
    t = html.escape(text).replace('\n','<br>')
    if o == 'h':
        right = f'''
<div class="pill" style="right:72px;top:90px;padding:10px 34px;font-size:40px">{html.escape(section)}</div>
<div class="circ" style="right:70px;top:215px;width:130px;height:130px;font-size:66px">{ar(num)}</div>
<div class="abs fit" style="right:232px;top:196px;width:1000px;text-align:right;line-height:1.28"><div class="t1" style="font-size:70px">الخطوة {ar(num)}:</div><div class="t2" style="font-size:70px">{html.escape(title)}</div></div>
<div class="card" style="left:762px;top:432px;width:1086px;height:556px;padding:0 56px"><p class="fitp" style="font-size:66px;text-align:right">{t}</p></div>'''
    else:
        right = f'''
<div class="pill" style="left:50%;transform:translateX(-50%);top:52px;padding:8px 32px;font-size:38px">{html.escape(section)}</div>
<div class="circ" style="left:895px;top:140px;width:120px;height:120px;font-size:60px">{ar(num)}</div>
<div class="abs fit1" style="right:205px;top:150px;width:840px;height:100px;display:flex;align-items:center;justify-content:flex-start;white-space:nowrap"><span class="t1" style="font-size:62px">الخطوة {ar(num)}:&nbsp;</span><span class="t2" style="font-size:62px">{html.escape(title)}</span></div>
<div class="card" style="left:50px;top:1468px;width:980px;height:420px;padding:0 44px"><p class="fitp" style="font-size:60px;text-align:center">{t}</p></div>'''
    return W, H, phone + right

def sec_html(o, num, title):
    W, H = (1920, 1080) if o == 'h' else (1080, 1920)
    cy = 390 if o == 'h' else 800
    return W, H, f'''
<div class="circ" style="left:{W/2-97}px;top:{cy-97}px;width:194px;height:194px;font-size:100px">{ar(num)}</div>
<div class="abs" style="left:0;right:0;top:{cy+150}px;text-align:center;color:#d8d4ea;font-size:44px;font-weight:400">القسم {ar(num)}</div>
<div class="abs t2" style="left:0;right:0;top:{cy+260}px;text-align:center;font-size:{88 if o=='h' else 78}px">{html.escape(title)}</div>'''

def ov_html(o):
    W, H = (1920, 1080) if o == 'h' else (1080, 1920)
    ch = [('✍️', 'حق المؤلف'), ('™️', 'العلامة التجارية'), ('💡', 'براءة الاختراع'), ('🔒', 'الأسرار التجارية'), ('📜', 'العقود والتراخيص'), ('🛡️', 'الحماية الشاملة')]
    cols = 3 if o == 'h' else 2
    cw, chh, gap = (533, 308, 28) if o == 'h' else (460, 300, 30)
    gx = (W - (cols * cw + (cols - 1) * gap)) / 2
    gy = 420 if o == 'h' else 620
    cards = ''
    for i, (e, n) in enumerate(ch):
        r, c = divmod(i, cols)
        x = W - gx - (c + 1) * cw - c * gap
        y = gy + r * (chh + gap)
        cards += f'<div class="card" style="left:{x}px;top:{y}px;width:{cw}px;height:{chh}px;flex-direction:column;justify-content:center;gap:14px;text-align:center"><div style="font-size:62px">{e}</div><div style="font-size:36px;color:#d8d4ea">المرحلة {ar(i+1)}</div><div class="t2" style="font-size:46px">{n}</div></div>'
    top = 70 if o == 'h' else 150
    intro_w = 3 * cw + 2 * gap if o == 'h' else 2 * cw + gap
    return W, H, f'''
<div class="abs t2" style="left:0;right:0;top:{top}px;text-align:center;white-space:nowrap;font-size:{78 if o=='h' else 54}px">🧠 المدخل ثم 🧩 المراحل الست</div>
<div class="card" style="left:{(W-intro_w)/2}px;top:{top+120}px;width:{intro_w}px;height:{90 if o=='h' else 150}px;justify-content:center;border-color:rgba(56,189,248,.7);background:rgba(56,189,248,.1)"><p style="text-align:center;font-size:{40 if o=='h' else 38}px;line-height:1.5">🧠 المدخل: تعريف الملكية الفكرية وأنواعها حسب الويبو</p></div>
<div class="abs" style="left:40px;right:40px;top:{top+(235 if o=='h' else 300)}px;text-align:center;font-size:{44 if o=='h' else 42}px;font-weight:700;line-height:1.6">وفي كل مرحلة: معلومات ← 5 أسئلة ← تحدي تصنيف ← دليل</div>
{cards}'''

FIT_JS = """
(function(){
 document.querySelectorAll('.fitp').forEach(p=>{var c=p.parentNode;var fs=parseFloat(getComputedStyle(p).fontSize);
   while(p.scrollHeight>c.clientHeight-30&&fs>30){fs-=2;p.style.fontSize=fs+'px';}});
 document.querySelectorAll('.fit1').forEach(c=>{var sp=c.querySelectorAll('span');var fs=parseFloat(getComputedStyle(sp[0]).fontSize);
   while(c.scrollWidth>c.clientWidth+1&&fs>36){fs-=2;sp.forEach(s=>s.style.fontSize=fs+'px');}});
 document.querySelectorAll('.fit').forEach(c=>{var ds=c.querySelectorAll('div');var fs=parseFloat(getComputedStyle(ds[0]).fontSize);
   while(c.scrollWidth>c.clientWidth+1&&fs>40){fs-=2;ds.forEach(s=>s.style.fontSize=fs+'px');}});
})();
"""

ARROW_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 110 140"><path d="M55 6 L104 64 L76 64 L76 134 L34 134 L34 64 L6 64 Z" fill="#ffd60a" stroke="#2a1a5e" stroke-width="7" stroke-linejoin="round"/></svg>'

def arrow_plan(o, shot):
    """returns (rotation deg, arrow w,h, x,y top-left in frame, dx,dy bounce unit)"""
    if o == 'h':
        P = dict(x=112, y=42, w=568, h=996)
    else:
        P = dict(x=213, y=288, w=654, h=1150)
    off = 6 + 4
    s = (P['w'] - 20) / SW
    x, y, w, h = RECTS[shot]
    bx, by, bw, bh = P['x'] + off + x * s, P['y'] + off + y * s, w * s, h * s
    aw, ah = (96, 122) if o == 'h' else (110, 140)
    cx = bx + bw / 2
    scr_top, scr_bot = P['y'] + off, P['y'] + P['h'] - off
    gap = 16
    if by + bh + gap + ah < scr_bot - 10 and (by + bh / 2) < (scr_top + scr_bot) / 2 + 60:
        return 0, aw, ah, cx - aw / 2, by + bh + gap, 0, 1      # below, pointing up
    if by - gap - ah > scr_top + 10:
        return 180, aw, ah, cx - aw / 2, by - gap - ah, 0, -1   # above, pointing down
    # beside the phone, pointing at it (left-pointing in h, from right)
    ax = P['x'] + P['w'] + 20
    return 270, ah, aw, ax, by + bh / 2 - aw / 2, 1, 0           # pointing left

def page(pg, W, H, body, path):
    pg.set_viewport_size({'width': W, 'height': H})
    open(V + '/_p.html', 'w').write(f'<html><head><meta charset="utf-8"><style>{CSS % dict(W=W,H=H,PR=52 if W>H else 58,SR=44 if W>H else 50,HB=6)}</style></head><body>{body}</body></html>')
    pg.goto('file://' + V + '/_p.html')
    pg.wait_for_timeout(250)
    pg.evaluate(FIT_JS)
    pg.screenshot(path=path)

def main(only=None, stills_only=False):
    plan = []
    DURS = json.load(open(V + '/vo/durs.json')) if os.path.exists(V + '/vo/durs.json') else {}
    def fitdur(i, d):
        k = f'n{i:02d}'
        return max(d, round(DURS[k] + 1.9, 2)) if k in DURS else d
    n = FIRST_STEP
    for it in ITEMS:
        if it[0] == 'sec':
            plan.append(('sec', it, None, fitdur(len(plan), 4.0)))
        elif it[0] == 'ov':
            plan.append(('ov', it, None, fitdur(len(plan), 8.0)))
        else:
            shot, title, text, sec = it[:4]
            baked = len(it) > 4
            dur = round(max(9.0, 6.0 + 0.055 * len(text)), 2)
            plan.append(('step', it, n, fitdur(len(plan), dur)))
            n += 1
    json.dump([(p[0], p[1][0], p[2], p[3]) for p in plan], open(V + '/plan.json', 'w'), ensure_ascii=False)
    print('last step', n - 1, 'total', sum(p[3] for p in plan))
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page()
        for i, (kind, it, num, dur) in enumerate(plan):
            for o in ('h', 'v'):
                key = f'{i:03d}_{o}'
                if only and key not in only and f'{i:03d}' not in only:
                    continue
                if kind == 'sec':
                    W, H, body = sec_html(o, it[1], it[2])
                elif kind == 'ov':
                    W, H, body = ov_html(o)
                else:
                    W, H, body = step_html(o, it[0], num, it[1], it[2], it[3], len(it) > 4)
                still = f'{OUT}/{key}.png'
                page(pg, W, H, body, still)
                if stills_only:
                    continue
                tmp = f'{OUT}/{key}.tmp.mp4'
                fade = f'fade=t=in:st=0:d=0.5,fade=t=out:st={dur-0.5}:d=0.5'
                if kind == 'step' and len(it) <= 4:
                    rot, aw, ah, ax, ay, dx, dy = arrow_plan(o, it[0])
                    svg = ARROW_SVG.format(w=96 if o == 'h' else 110, h=122 if o == 'h' else 140)
                    pg.set_viewport_size({'width': aw, 'height': ah})
                    open(V + '/_a.html', 'w').write(f'<html><body style="margin:0;background:transparent;width:{aw}px;height:{ah}px;display:flex;align-items:center;justify-content:center"><div style="transform:rotate({rot}deg);display:flex">{svg}</div></body></html>')
                    pg.goto('file://' + V + '/_a.html')
                    pg.screenshot(path=f'{OUT}/{key}_arrow.png', omit_background=True)
                    A = 16
                    fx = f'{ax:.0f}+{dx}*{A}*sin(2*PI*t/1.1)'
                    fy = f'{ay:.0f}+{dy}*{A}*sin(2*PI*t/1.1)'
                    fc = (f'[0:v]loop=-1:1,trim=duration={dur},setpts=N/30/TB[b];'
                          f'[1:v]loop=-1:1,trim=duration={dur},setpts=N/30/TB[a];'
                          f"[b][a]overlay=x='{fx}':y='{fy}':eval=frame,format=yuv420p,{fade}[o]")
                    cmd = ['ffmpeg', '-v', 'error', '-y', '-framerate', '30', '-i', still, '-framerate', '30', '-i', f'{OUT}/{key}_arrow.png',
                           '-filter_complex', fc, '-map', '[o]']
                else:
                    cmd = ['ffmpeg', '-v', 'error', '-y', '-framerate', '30', '-i', still,
                           '-vf', f'format=yuv420p,loop=-1:1,trim=duration={dur},setpts=N/30/TB,{fade}']
                cmd += ['-r', '30', '-c:v', 'libx264', '-crf', '18', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-an', tmp]
                subprocess.run(cmd, check=True)
                os.rename(tmp, f'{OUT}/{key}.mp4')
            print(i, kind, num, dur, flush=True)

if __name__ == '__main__':
    args = sys.argv[1:]
    stills = '--stills' in args
    args = [a for a in args if a != '--stills']
    main(set(args) if args else None, stills)
