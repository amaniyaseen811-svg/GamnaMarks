import json, math, os, subprocess, sys, random
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

MODE = sys.argv[1]            # v | h
OUT = sys.argv[2]
FPS = 30
W, H = (1080, 1920) if MODE == 'v' else (1920, 1080)
B = os.path.dirname(os.path.abspath(__file__)) + '/'
F = B
SC = json.load(open(B + 'script.json'))
DUR = json.load(open(B + 'durs.json'))

def font(name, s): return ImageFont.truetype(F + name, s)
AM = lambda s: ImageFont.truetype(B + '../../gm-winner-font.ttf', s)
CA = lambda s: font('cairo800.ttf', s)
DIG = '٠١٢٣٤٥٦٧٨٩'
ar = lambda n: ''.join(DIG[int(c)] for c in str(n))

GOLD1, GOLD2 = (250, 222, 130), (212, 160, 52)
NAVY = (18, 30, 84)

# ---------- static pieces ----------
def background():
    y, x = np.mgrid[0:H, 0:W]
    d = np.sqrt(((x - W / 2) / W) ** 2 + ((y - H * .4) / H) ** 2)
    t = np.clip(d * 1.6, 0, 1)[..., None]
    c1, c2 = np.array([253, 247, 230]), np.array([236, 219, 180])
    return Image.fromarray((c1 * (1 - t) + c2 * t).astype('uint8'))
BG = background()

def _gif(i):
    im = Image.open(f'{B}gif/{i}.gif'); out = []
    for k in range(im.n_frames):
        im.seek(k); out.append(im.convert('RGB').crop((0, 0, 1024, 790)))
    return out
frames = {i: _gif(i) for i in range(1, 9)}
EMB = Image.open(B + '../../aaipa-emblem-new.png').convert('RGBA')

if MODE == 'v':
    IW = 1000; IH = int(IW * 790 / 1024); IX, IY = 40, 300
    PX0, PY0, PX1, PY1 = 40, 1150, 1040, 1820
    CAPS = 78; EMS = 190
else:
    IH = 700; IW = int(IH * 1024 / 790); IX, IY = (W - IW) // 2 - 60, 40
    PX0, PY0, PX1, PY1 = 150, 800, 1770, 1055
    CAPS = 56; EMS = 190

def gold_text_img(lines, f, width, lh):
    """render centered lines in gold gradient → RGBA, plus per-line boxes"""
    hgt = int(lh * len(lines)) + 20
    mask = Image.new('L', (width, hgt), 0); d = ImageDraw.Draw(mask)
    boxes = []
    for i, ln in enumerate(lines):
        tw = d.textlength(ln, font=f, direction='rtl')
        x = (width - tw) / 2; y = i * lh
        d.text((x, y), ln, font=f, fill=255, direction='rtl')
        boxes.append((x, y, x + tw, y + lh))
    grad = np.linspace(0, 1, hgt)[:, None, None]
    col = (np.array(GOLD1) * (1 - grad) + np.array(GOLD2) * grad) * np.ones((hgt, width, 1))
    img = Image.fromarray(col.astype('uint8')).convert('RGBA'); img.putalpha(mask)
    sh = Image.new('RGBA', img.size, (0, 0, 0, 0)); sh.putalpha(mask.filter(ImageFilter.GaussianBlur(3)).point(lambda v: v * .7))
    out = Image.new('RGBA', img.size, (0, 0, 0, 0)); out.alpha_composite(sh, (2, 3)); out.alpha_composite(img)
    return out, boxes

def wrap(text, f, maxw):
    d = ImageDraw.Draw(Image.new('L', (10, 10))); out = []
    for para in text.split('\n'):
        words = para.split(); cur = ''
        for w_ in words:
            t = (cur + ' ' + w_).strip()
            if d.textlength(t, font=f, direction='rtl') <= maxw or not cur: cur = t
            else: out.append(cur); cur = w_
        if cur: out.append(cur)
    return out

def panel():
    p = Image.new('RGBA', (PX1 - PX0, PY1 - PY0), (0, 0, 0, 0)); d = ImageDraw.Draw(p)
    d.rounded_rectangle([0, 0, p.width - 1, p.height - 1], 34, fill=NAVY + (245,), outline=GOLD2, width=6)
    d.rounded_rectangle([14, 14, p.width - 15, p.height - 15], 24, outline=(240, 205, 110), width=2)
    rnd = random.Random(3)
    for _ in range(70):
        x, y = rnd.randint(20, p.width - 20), rnd.randint(20, p.height - 20); r = rnd.choice([1, 1, 2])
        d.ellipse([x - r, y - r, x + r, y + r], fill=(255, 240, 200, rnd.randint(60, 150)))
    return p
PANEL = panel()

def header():
    hd = Image.new('RGBA', (W, 280 if MODE == 'v' else 260), (0, 0, 0, 0)); d = ImageDraw.Draw(hd)
    em = EMB.resize((EMS, EMS), Image.LANCZOS)
    ex = W - EMS - 40; hd.alpha_composite(em, (ex, 40 if MODE == 'v' else 30))
    rx = ex - 25 if MODE == 'v' else W - 30
    ys = (55, 105, 165) if MODE == 'v' else (235, 285, 345)
    if MODE == 'h':
        hd = Image.new('RGBA', (W, 420), (0, 0, 0, 0)); d = ImageDraw.Draw(hd)
        em = EMB.resize((EMS, EMS), Image.LANCZOS); hd.alpha_composite(em, (W - EMS - 135, 30))
    items = [('أكاديمية الملكية الفكرية', CA(30 if MODE == 'v' else 28), (140, 105, 40)),
             ('الندوة الثالثة', CA(44 if MODE == 'v' else 40), NAVY),
             ('لماذا نحمي الإبداع؟', CA(60 if MODE == 'v' else 44), (176, 120, 20))]
    for (t, f, c), y in zip(items, ys):
        tw = d.textlength(t, font=f, direction='rtl')
        x = rx - tw if MODE == 'v' else W - 135 - EMS / 2 - tw / 2
        d.text((x, y), t, font=f, fill=c, direction='rtl')
    return hd
HEAD = header()

def badge(n):
    s = 96; b = Image.new('RGBA', (s, s), (0, 0, 0, 0)); d = ImageDraw.Draw(b)
    d.ellipse([0, 0, s - 1, s - 1], fill=GOLD2); d.ellipse([6, 6, s - 7, s - 7], fill=NAVY)
    f = CA(46); t = n; tw = d.textlength(t, font=f, direction='rtl')
    d.text(((s - tw) / 2, 8), t, font=f, fill=GOLD1, direction='rtl')
    return b

def check_stamp(sz):
    s = Image.new('RGBA', (sz, sz), (0, 0, 0, 0)); d = ImageDraw.Draw(s)
    d.ellipse([0, 0, sz - 1, sz - 1], fill=(255, 255, 255, 235))
    d.ellipse([10, 10, sz - 11, sz - 11], fill=(40, 170, 80))
    w = sz // 11
    d.line([(sz * .27, sz * .52), (sz * .44, sz * .69), (sz * .75, sz * .33)], fill='white', width=w, joint='curve')
    return s
STAMP = check_stamp(300 if MODE == 'v' else 230)

def qmark(sz):
    s = Image.new('RGBA', (sz, sz), (0, 0, 0, 0)); d = ImageDraw.Draw(s)
    d.ellipse([0, 0, sz - 1, sz - 1], fill=(255, 250, 235, 240), outline=GOLD2, width=10)
    f = CA(int(sz * .62)); t = '؟'; tw = d.textlength(t, font=f, direction='rtl')
    d.text(((sz - tw) / 2, sz * .02), t, font=f, fill=(200, 50, 50), direction='rtl')
    return s
QM = qmark(260 if MODE == 'v' else 200)

# ---------- scene timeline ----------
scenes = []; t = 0
for s in SC:
    d = DUR[s['k']] + (0.9 if s['k'] not in ('q',) else 5.0)
    if s['k'] == 'title': d += 0.6
    if s['k'] == 'end': d += 1.5
    scenes.append((t, d, s)); t += d
TOTAL = t
json.dump([[s['k'], st] for st, d, s in scenes], open(B + f'starts_{MODE}.json', 'w'))

capcache = {}
def caption(s):
    if s['k'] in capcache: return capcache[s['k']]
    pw = PX1 - PX0 - 80
    size = CAPS
    if s['k'] in ('title', 'q'): size = int(CAPS * 1.35)
    f = AM(size); lines = wrap(s['cap'].replace(' ✓', ''), f, pw)
    lh = size * 1.55
    while len(lines) * lh > (PY1 - PY0 - 50) and size > 34:
        size -= 3; f = AM(size); lines = wrap(s['cap'].replace(' ✓', ''), f, pw); lh = size * 1.55
    img, boxes = gold_text_img(lines, f, pw, lh)
    capcache[s['k']] = (img, boxes); return img, boxes

def ease(x): x = max(0, min(1, x)); return x * x * (3 - 2 * x)

def pic(i, lt, dur, k):
    fr = frames[i][int(lt * 2) % len(frames[i])]
    z = 1.0 + 0.07 * (lt / max(dur, 1))
    cw, ch = 1024 / z, 790 / z; cx = (1024 - cw) / 2; cy = (790 - ch) / 2.4
    return fr.crop((int(cx), int(cy), int(cx + cw), int(cy + ch))).resize((IW, IH), Image.BILINEAR)

def framed(img):
    pad = 12; o = Image.new('RGBA', (IW + pad * 2, IH + pad * 2), (0, 0, 0, 0)); d = ImageDraw.Draw(o)
    d.rounded_rectangle([0, 0, o.width - 1, o.height - 1], 22, fill=GOLD2)
    d.rounded_rectangle([5, 5, o.width - 6, o.height - 6], 18, fill=(255, 236, 170))
    m = Image.new('L', (IW, IH), 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, IW - 1, IH - 1], 14, fill=255)
    o.paste(img, (pad, pad), m); return o

SHADOW = None
def scene_frame(st, d, s, lt):
    global SHADOW
    fr = BG.copy().convert('RGBA')
    fr.alpha_composite(HEAD, (0, 0))
    k = s['k']
    if s['img']:
        p = pic(s['img'], lt, d, k)
        if k == 'q':
            p = Image.blend(p, Image.new('RGB', p.size, (20, 20, 40)), 0.45 * ease(lt / 0.6))
        fp = framed(p)
        if SHADOW is None:
            m = Image.new('L', (fp.width + 60, fp.height + 60), 0); ImageDraw.Draw(m).rounded_rectangle([30, 34, fp.width + 30, fp.height + 34], 22, fill=110)
            SHADOW = Image.new('RGBA', m.size, (90, 60, 10, 0)); SHADOW.putalpha(m.filter(ImageFilter.GaussianBlur(14)))
        fr.alpha_composite(SHADOW, (IX - 42, IY - 42)); fr.alpha_composite(fp, (IX - 12, IY - 12))
        n = {'s1': 1, 's2': 2, 's3': 3, 's4': 4, 's5': 5, 's6': 6, 'q': 6, 's7': 7, 's8': 8, 'ok': 8, 'end': 8}[k]
        bd = badge(ar(n)); fr.alpha_composite(bd, (IX + IW // 2 - 48, IY + IH - 40))
        if k == 'q':
            sc = 0.85 + 0.15 * abs(math.sin(lt * 3)); qs = QM.resize((int(QM.width * sc),) * 2, Image.BILINEAR)
            a = ease(lt / 0.5); qs.putalpha(qs.getchannel('A').point(lambda v: v * a))
            fr.alpha_composite(qs, (IX + IW // 2 - qs.width // 2, IY + IH // 2 - qs.height // 2))
            # countdown ring
            rem = max(0, d - 0.9 - lt) if lt > DUR['q'] else None
        if k in ('ok', 'end'):
            a0 = lt if k == 'ok' else 99
            sc = 1.0 if a0 > 0.5 else (0.3 + 1.0 * ease(a0 / 0.35) - 0.3 * ease((a0 - 0.35) / 0.15))
            st_ = STAMP.resize((max(2, int(STAMP.width * sc)),) * 2, Image.BILINEAR)
            fr.alpha_composite(st_, (IX + IW - st_.width // 2 - STAMP.width // 2 - 20, IY + IH - st_.height // 2 - STAMP.width // 2 - 30))
            if k == 'ok' and lt < 1.4:  # sparkle burst
                dd = ImageDraw.Draw(fr); cx, cy = IX + IW - STAMP.width - 20, IY + IH - STAMP.width - 30
                for j in range(18):
                    ang = j / 18 * 6.283; r = 40 + lt * 380
                    x, y = cx + math.cos(ang) * r, cy + math.sin(ang) * r; rr = max(1, 9 - lt * 6)
                    dd.ellipse([x - rr, y - rr, x + rr, y + rr], fill=(255, 215, 90, int(255 * max(0, 1 - lt / 1.4))))
    else:  # title card
        em = EMB.resize((int(IH * .8),) * 2, Image.LANCZOS)
        sc = 1 + 0.03 * math.sin(lt * 2)
        em = em.resize((int(em.width * sc),) * 2, Image.BILINEAR)
        fr.alpha_composite(em, (IX + IW // 2 - em.width // 2, IY + IH // 2 - em.height // 2))
    # caption panel + writing reveal
    fr.alpha_composite(PANEL, (PX0, PY0))
    cap, boxes = caption(s)
    reveal = ease(lt / max(0.8, min(DUR[k] * 0.85, 6)))
    total = sum(b[2] - b[0] for b in boxes); done = reveal * total
    m = Image.new('L', cap.size, 0); dm = ImageDraw.Draw(m); pen = None
    for (x0, y0, x1, y1) in boxes:
        wl = x1 - x0
        if done >= wl: dm.rectangle([0, y0 - 10, cap.width, y1 + 10], fill=255); done -= wl
        else:
            xr = x1 - done; dm.rectangle([xr, y0 - 10, cap.width, y1 + 10], fill=255)
            if done > 0: pen = (xr, (y0 + y1) / 2)
            break
    c2 = cap.copy(); c2.putalpha(Image.fromarray(np.minimum(np.asarray(cap.getchannel('A')), np.asarray(m))))
    cy = PY0 + (PY1 - PY0 - cap.height) // 2 + 6
    fr.alpha_composite(c2, (PX0 + 40, cy))
    if pen:  # glowing quill tip
        dd = ImageDraw.Draw(fr); px, py = PX0 + 40 + pen[0], cy + pen[1]
        for r, a in ((16, 60), (9, 140), (4, 255)): dd.ellipse([px - r, py - r, px + r, py + r], fill=(255, 230, 150, a))
    # fade in/out
    a = min(ease(lt / 0.35), 1); b = ease((d - lt) / 0.3) if s['k'] == 'end' else 1
    return fr.convert('RGB'), min(a, 1), b

cmd = ['ffmpeg', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
       '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-pix_fmt', 'yuv420p', OUT]
pr = subprocess.Popen(cmd, stdin=subprocess.PIPE)
prev = None; N = int(TOTAL * FPS)
si = 0
for f in range(N):
    t = f / FPS
    while si < len(scenes) - 1 and t >= scenes[si + 1][0]: si += 1
    st, d, s = scenes[si]
    img, a, b = scene_frame(st, d, s, t - st)
    if a < 1 and prev is not None and s['img'] != SC[si - 1]['img']: img = Image.blend(prev, img, a)
    if b < 1: img = Image.blend(Image.new('RGB', img.size, (0, 0, 0)), img, b)
    pr.stdin.write(img.tobytes())
    if t - st > 0.35: prev = img
pr.stdin.close(); pr.wait()
print('total', round(TOTAL, 2))
