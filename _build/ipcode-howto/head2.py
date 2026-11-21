import sys, os, json, subprocess, html
sys.path.insert(0, '.')
import render
from render import CSS, FIT_JS, ar
from narr import HEAD
from playwright.sync_api import sync_playwright
OUT = '/home/claude/vid/headp2'; os.makedirs(OUT, exist_ok=True)
S1 = 'القسم ١ · الدخول إلى التطبيق'; S2 = 'القسم ٢ · بداية اللعبة'
STEPS = {
5:(1,'اشتركي في القناة','اضغطي زر «اشتركي بالقناة» على يوتيوب، وفعّلي الجرس 🔔 ليصلك كل جديد.',S1),
6:(2,'اكتبي الكود السري','تجدين الكود السري في آخر منشور على القناة؛ اكتبيه ثم اضغطي «تأكيد».',S1),
7:(3,'ادخلي اللعبة','بعد الاشتراك يظهر زر «ادخلي اللعبة 🚀»؛ اضغطيه.',S1),
8:(4,'اضغطي للدخول','اضغطي «اضغط للدخول» تحت الشعار المتحرك.',S1),
9:(5,'اختاري لغتك','تظهر قائمة اللغات؛ اضغطي «العربية».',S1),
10:(6,'ابدئي اللعب','اضغطي «ابدأ اللعب».',S1),
11:(7,'ابدئي المغامرة','اضغطي «ابدأ المغامرة» فتظهر الصفحة الرئيسية للتطبيق.',S1),
12:(8,'انزلي إلى الألعاب','انزلي في الصفحة الرئيسية حتى تصلي إلى قائمة الألعاب.',S1),
13:(9,'قسم الابتكار','اضغطي «الابتكار» لتظهر ألعاب قسم الابتكار.',S1),
14:(10,'بطاقة اللعبة','انزلي قليلًا حتى بطاقة «شفرة الفكرة المسروقة» واضغطيها.',S1),
15:(11,'العبي اللعبة','اختاري «العبي اللعبة»؛ يظهر فيديو تمهيدي قصير، ثم تُفتح اللعبة.',S1),
17:(12,'اكتبي اسمك وصفّك','اكتبي اسمك الثلاثي، ثم صفّك وشعبتك؛ لتُحفظ علاماتك ووقتك في تقريرك.',S2),
18:(13,'ابدئي','اضغطي «ابدأ اللعب».',S2),
19:(14,'غلاف اللعبة','يظهر الغلاف السينمائي المتحرك؛ اضغطي «ابدئي التحقيق».',S2),
20:(15,'زر الصوت','من هذا الزر تشغّلين صوت الغلاف أو توقفينه.',S2),
22:(16,'فيديو القصة','شاهدي فيديو القصة كاملًا؛ ففيه بداية القضية وشخصياتها.',S2),
23:(17,'تابعي','بعد انتهاء الفيديو اضغطي «تابعي».',S2),
24:(18,'اختاري المستوى','🟢 العادي: أسئلة أساسية، 10 نقاط لكل إجابة.\n🔴 الصعب: حالات تحتاج إلى تحليل، 15 نقطة لكل إجابة.',S2),
25:(19,'اللعب الفردي','اختاري «فردي» إذا أردتِ أن تحلّي القضية وحدك.',S2),
26:(20,'اللعب الجماعي','أو اختاري «أونلاين مع صاحباتي» لتلعبي مع صديقاتك؛ نشرحه في القسم الخامس.',S2),
27:(21,'الرسالة الغامضة','اقرئي الرسالة الغامضة التي وصلت إلى ليان صاحبة مشروع NOVA.',S2),
28:(22,'هدف اللعبة','اقرئي هدف اللعبة جيدًا قبل أن تبدئي.',S2),
29:(23,'شخصيات القضية','تعرّفي على الشخصيات: ليان صاحبة المشروع، وأربعة مشتبه بهم. ثم اضغطي «افتحي لوحة التحقيق».',S2),
}
COVER = '/home/claude/vid/cover_crop.png'
GOALS = ['التعرّف على أنواع الملكية الفكرية: حق المؤلف، والعلامة التجارية، وبراءة الاختراع، والأسرار التجارية، والعقود والتراخيص، والحماية الشاملة.',
 'معرفة كيف تحمين أفكارك وأعمالك، وكيف تثبتين ملكيتها.','التمييز بين الاستخدام المشروع والتعدّي على حقوق الآخرين.',
 'تنمية التفكير الناقد والاستنتاج بجمع الأدلة وحلّ لغز القضية.','العمل بروح الفريق والتنافس الإيجابي في اللعب الجماعي.']
CONTENTS = ['الدخول إلى التطبيق','بداية اللعبة','المراحل الست','الحكم والجوائز','اللعب الجماعي أونلاين','أكاديمية الملكية الفكرية']
def slide(o, kind):
    W, H = (1920,1080) if o=='h' else (1080,1920); v = o=='v'
    cov = lambda w: f'<img src="file://{COVER}" style="width:{w}px;border:5px solid #e2b743;border-radius:22px;box-shadow:0 0 50px rgba(252,211,77,.35)">'
    if kind=='title':
        return W,H,f'''<div class="abs" style="left:0;right:0;top:{90 if not v else 330}px;text-align:center">{cov(330 if not v else 560)}
<div class="t2" style="font-size:{96 if not v else 100}px;margin-top:30px">🔐 شفرة الفكرة المسروقة</div>
<div style="font-size:44px;font-weight:800;margin-top:10px;letter-spacing:2px">IP CODE</div>
<div style="font-size:{50 if not v else 54}px;font-weight:700;margin-top:26px">فيديو توضيحي شامل لطريقة اللعب</div>
<div style="font-size:{34 if not v else 38}px;color:#c9c3e6;margin-top:22px">تطبيق GamnaMarks · إعداد د. أماني ياسين (شحروري)</div></div>'''
    if kind=='goals':
        items=''.join(f'<div style="display:flex;gap:22px;align-items:flex-start;margin:{14 if not v else 24}px 0"><div class="circ" style="position:static;flex:none;width:{62 if not v else 74}px;height:{62 if not v else 74}px;font-size:{36 if not v else 42}px">{ar(i+1)}</div><div style="font-size:{44 if not v else 50}px;font-weight:700;line-height:1.45">{html.escape(g)}</div></div>' for i,g in enumerate(GOALS))
        return W,H,f'''<div class="abs t2" style="left:0;right:0;top:{70 if not v else 200}px;text-align:center;font-size:{90 if not v else 100}px">🎯 أهداف اللعبة</div>
<div class="card" style="left:{80 if not v else 40}px;right:{80 if not v else 40}px;top:{215 if not v else 380}px;padding:{30 if not v else 40}px 50px;display:block">{items}</div>'''
    if kind=='before':
        return W,H,f'''<div class="abs" style="left:0;right:0;top:{170 if not v else 560}px;text-align:center;font-size:110px">📖</div>
<div class="abs t2" style="left:0;right:0;top:{330 if not v else 740}px;text-align:center;font-size:{96 if not v else 100}px">قبل أن تبدئي…</div>
<div class="card" style="left:{360 if not v else 60}px;right:{360 if not v else 60}px;top:{500 if not v else 920}px;padding:44px 60px"><p style="text-align:center;font-size:{56 if not v else 60}px">اقرئي المعلومات في كل مرحلة بروية وتركيز؛ فالأسئلة وتحدي التصنيف مبنيّة عليها.</p></div>'''
    if kind=='contents':
        items=''.join(f'<div style="display:flex;gap:22px;align-items:center;margin:{14 if not v else 24}px 0"><div class="circ" style="position:static;flex:none;width:{72 if not v else 80}px;height:{72 if not v else 80}px;font-size:{42 if not v else 46}px">{ar(i+1)}</div><div style="font-size:{58 if not v else 60}px;font-weight:700">{c}</div></div>' for i,c in enumerate(CONTENTS))
        return W,H,f'''<div class="abs t2" style="left:0;right:0;top:{70 if not v else 330}px;text-align:center;font-size:{90 if not v else 100}px">🗺️ محتوى الفيديو</div>
<div class="card" style="left:{480 if not v else 120}px;right:{480 if not v else 120}px;top:{210 if not v else 520}px;padding:30px 60px;display:block">{items}</div>'''
    if kind=='end':
        return W,H,f'''<div class="abs" style="left:0;right:0;top:{110 if not v else 330}px;text-align:center">{cov(300 if not v else 520)}</div>
<div class="card" style="left:{380 if not v else 60}px;right:{380 if not v else 60}px;top:{560 if not v else 1060}px;padding:30px 40px;justify-content:center"><p style="text-align:center;font-size:{56 if not v else 60}px">💡 «احمِ فكرتك قبل أن تضطر إلى إثبات أنها لك»</p></div>
<div class="abs t2" style="left:0;right:0;top:{770 if not v else 1340}px;text-align:center;font-size:{80 if not v else 84}px">🎮 العبي الآن على GamnaMarks</div>
<div class="abs" style="left:0;right:0;top:{900 if not v else 1490}px;text-align:center;font-size:40px;color:#c9c3e6">إعداد د. أماني ياسين (شحروري)</div>'''
def shot(pg, W, H, body, path, transparent=False):
    css = CSS % dict(W=W,H=H,PR=52 if W>H else 58,SR=44 if W>H else 50,HB=6)
    if transparent: css += 'body{background:transparent!important}'
    open('/home/claude/vid/_h.html','w').write(f'<html><head><meta charset="utf-8"><style>{css}</style></head><body>{body}</body></html>')
    pg.set_viewport_size({'width':W,'height':H}); pg.goto('file:///home/claude/vid/_h.html'); pg.wait_for_timeout(300); pg.evaluate(FIT_JS)
    pg.screenshot(path=path, omit_background=transparent)
def enc(cmd, out):
    subprocess.run(cmd + ['-r','30','-c:v','libx264','-crf','18','-preset','veryfast','-pix_fmt','yuv420p','-an',out+'.tmp.mp4'], check=True)
    os.rename(out+'.tmp.mp4', out)
OLD = {'h':'/home/claude/vid/old_h.mp4','v':'/home/claude/vid/old_v.mp4'}
CROP = {'h':(122,52,548,976),'v':(190,300,700,1250)}
INNER = {'h':(122,52,548,976),'v':(223,298,634,1130)}
def still(png, dur, out):
    enc(['ffmpeg','-v','error','-y','-framerate','30','-i',png,'-vf',f'format=yuv420p,loop=-1:1,trim=duration={dur},setpts=N/30/TB,fade=t=in:st=0:d=0.5,fade=t=out:st={dur-0.5}:d=0.5'], out)
only = set(sys.argv[1:])
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page()
    kinds = {0:'title',1:'goals',2:'before',3:'contents'}
    for i,(s,e,t) in enumerate(HEAD):
        L = round(e-s, 3)
        for o in ('h','v'):
            key=f'{i:02d}_{o}'
            if only and key not in only and f'{i:02d}' not in only: continue
            out=f'{OUT}/{key}.mp4'
            if i in kinds:
                W,H,body = slide(o, kinds[i]); shot(pg,W,H,body,f'{OUT}/{key}.png'); still(f'{OUT}/{key}.png', L, out)
            elif i in (4,16):
                W,H,body = render.sec_html(o, 1 if i==4 else 2, 'الدخول إلى التطبيق' if i==4 else 'بداية اللعبة'); shot(pg,W,H,body,f'{OUT}/{key}.png'); still(f'{OUT}/{key}.png', L, out)
            elif i==21:
                enc(['ffmpeg','-v','error','-y','-ss',str(s),'-t',str(L),'-i',OLD[o]], out)
            else:
                n,title,text,sec = STEPS[i]
                W,H,body = render.step_html(o, None, n, title, text, sec, True)
                shot(pg,W,H,body,f'{OUT}/{key}_bg.png')
                # ring layer: only the phone element, transparent elsewhere and inside screen
                cx,cy,cw,ch = CROP[o]; ix,iy,iw,ih = INNER[o]
                from PIL import Image, ImageDraw
                rg = Image.open(f'{OUT}/{key}_bg.png').convert('RGBA'); m = Image.new('L', rg.size, 255)
                ImageDraw.Draw(m).rounded_rectangle([ix, iy, ix+iw-1, iy+ih-1], radius=40 if o=='h' else 46, fill=0)
                rg.putalpha(m); rg.save(f'{OUT}/{key}_ring.png')
                fc = (f'[0:v]loop=-1:1,trim=duration={L},setpts=N/30/TB[bg];'
                      f'[1:v]crop={cw}:{ch}:{cx}:{cy},scale={iw}:{ih},setpts=PTS-STARTPTS[ph];'
                      f'[2:v]loop=-1:1,trim=duration={L},setpts=N/30/TB[rg];'
                      f'[bg][ph]overlay={ix}:{iy}:shortest=1[a];[a][rg]overlay=0:0,format=yuv420p,fade=t=in:st=0:d=0.5,fade=t=out:st={L-0.5}:d=0.5[o]')
                enc(['ffmpeg','-v','error','-y','-framerate','30','-i',f'{OUT}/{key}_bg.png','-ss',str(s),'-t',str(L),'-i',OLD[o],'-framerate','30','-i',f'{OUT}/{key}_ring.png','-filter_complex',fc,'-map','[o]','-t',str(L)], out)
            print(key, flush=True)
    for o in ('h','v'):
        if only and f'end_{o}' not in only and 'end' not in only: continue
        W,H,body = slide(o,'end'); shot(pg,W,H,body,f'{OUT}/end_{o}.png')
        enc(['ffmpeg','-v','error','-y','-framerate','30','-i',f'{OUT}/end_{o}.png','-vf','format=yuv420p,loop=-1:1,trim=duration=9,setpts=N/30/TB,fade=t=in:st=0:d=0.6,fade=t=out:st=7.5:d=1.5'], f'{OUT}/end_{o}.mp4')
        print('end', o)
