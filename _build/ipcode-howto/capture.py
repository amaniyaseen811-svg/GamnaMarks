import json, os, sys
from playwright.sync_api import sync_playwright

ROOT = '/home/claude/GamnaMarks'
OUT = '/home/claude/vid/shots'
os.makedirs(OUT, exist_ok=True)
W, H = 390, 696

# Each shot: id, setup js, scroll ('top' | 'bottom' | selector | number), highlight selectors, blur selectors
PREP = """
window.__prep=function(t){clearInterval(G.timer);G.timer=null;clearInterval(G.readT);G.timeLeft=t;
 var m=Math.floor(t/60),s=t%60;$('tTime').textContent='⏱️ '+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
 $('tScore').textContent='⭐ '+G.score;};
var x=document.getElementById('gmRepName');if(x)x.remove();
window.__bl=function(sel,re){var e=document.querySelector(sel);if(e)e.innerHTML=e.innerHTML.replace(re,function(m,a,b){return a+'<span style="filter:blur(5px)">'+b+'</span>';});};
"""
def board(t=1790, extra=''):
    return f"G.score=0;setLevel('normal');startCase();{extra};renderBoard();go('s-board');__prep({t});"

SHOTS = [
 ('hud', board(1792), 'top', ['#hud'], []),
 ('help', board(1789), 'top', ['#fabHelp'], []),
 ('helpmodal', board(1786)+"showHelp();", 'top', ['#modalBox'], []),
 ('board', board(1781), '^#chapList', ['#chapList'], []),
 ('boardgo', board(1779), '#boardGo', ['#boardGo'], []),
 ('intro_note', board(1777)+"openIntro();__prep(1776);", 'top', ['#infoBox .readnote'], []),
 ('intro_def', board(1770)+"openIntro();__prep(1768);", '#infoBox .seq li:nth-child(1)', ['#infoBox .seq li:nth-child(1)'], []),
 ('intro_types', board(1760)+"openIntro();__prep(1757);", '^#infoBox .seq li:nth-child(2)', ['#infoBox .seq li:nth-child(2)'], []),
 ('intro_journey', board(1750)+"openIntro();__prep(1748);", '#infoBox .seq li:nth-child(6)', ['#infoBox .seq li:nth-child(6)'], []),
 ('intro_wait', board(1745)+"openIntro();__prep(1744);$('infoGo').textContent='اقرئي بتمعّن… (14)';", '#infoGo', ['#infoGo'], []),
 ('intro_go', board(1740)+"openIntro();__prep(1738);$('infoGo').disabled=false;$('infoGo').textContent='فهمت، إلى المرحلة 1 ➡️';", '#infoGo', ['#infoGo'], []),
 ('ch_note', board(1736,"G.introSeen=true")+"openChapter();__prep(1735);", 'top', ['#infoBox .readnote'], []),
 ('ch_link', board(1730,"G.introSeen=true")+"openChapter();__prep(1729);", 'top', ['#infoBox .link'], []),
 ('ch_seq', board(1725,"G.introSeen=true")+"openChapter();__prep(1722);", '#infoBox h3', ['#infoBox .seq li:nth-child(1)', '#infoBox .seq li:nth-child(2)', '#infoBox .seq li:nth-child(3)'], []),
 ('ch_ex', board(1700,"G.introSeen=true")+"openChapter();__prep(1690);", '#infoBox .ex', ['#infoBox .ex'], []),
 ('ch_go', board(1690,"G.introSeen=true")+"openChapter();__prep(1680);$('infoGo').disabled=false;$('infoGo').textContent='فهمت، إلى الأسئلة ✍️';", 'bottom', ['#infoGo'], []),
 ('q', board(1675,"G.introSeen=true")+"openChapter();startQuestions();__prep(1672);", 'top', ['#qText', '#qOpts'], []),
 ('q_hearts', board(1665,"G.introSeen=true")+"openChapter();startQuestions();__prep(1663);", 'top', ['#qHearts'], []),
 ('q_num', board(1660,"G.introSeen=true")+"openChapter();startQuestions();__prep(1658);", 'top', ['#qNum', '#qProg'], []),
 ('classify', board(1600,"G.introSeen=true")+"G.score=50;G.ch=0;startClassify();__prep(1596);", 'top', ['#cQ', '#cItems .citem:nth-child(1)'], []),
 ('clue', board(1580,"G.introSeen=true")+"G.score=75;G.ch=0;finishChapter();__prep(1578);", 'top', ['#clueText'], ['#clueText']),
 ('clues', board(1575,"G.introSeen=true;G.done=1;G.clues=[CHAPTERS[0].clue.text];G.score=95")+"__prep(1574);", '#clueBox', ['#clueBox'], ['#clueList']),
 ('next', board(1570,"G.introSeen=true;G.done=1;G.clues=[CHAPTERS[0].clue.text];G.score=95")+"__prep(1569);", '#chapList', ['#chapList .chap:nth-child(3)'], ['#clueList']),
 ('accuse', board(700,"G.introSeen=true;G.done=6;G.clues=CHAPTERS.map(c=>c.clue.text);G.score=540")+"openAccuse();__prep(698);", 'top', ['#accClues'], ['#accClues']),
 ('accuse_pick', board(690,"G.introSeen=true;G.done=6;G.clues=CHAPTERS.map(c=>c.clue.text);G.score=540")+"openAccuse();__prep(688);", '#accChars', ['#accChars'], ['#accClues']),
 ('trophy', board(640,"G.score=590")+"go('s-trophy');G.score=620;__prep(636);", 'top', ['#s-trophy .cupImg', '#s-trophy h2'], []),
 ('trophy_ws', board(630,"G.score=620")+"go('s-trophy');__prep(628);", '#s-trophy .btn', ['#s-trophy p.mut:nth-of-type(2)', '#s-trophy .btn'], []),
 ('ws1', board(620,"G.score=620")+"openWS(1);__prep(618);", 'top', ['#wTitle'], []),
 ('ws1_opts', board(610,"G.score=620")+"openWS(1);__prep(605);", 'top', ['#wText', '#wOpts'], []),
 ('ws2', board(480,"G.score=665")+"openWS(2);__prep(478);", 'top', ['#wTitle'], []),
 ('ws3', board(330,"G.score=705")+"openWS(3);__prep(328);", 'top', ['#wTitle', '#wText'], []),
 ('more', board(190,"G.score=745")+"go('s-more');__prep(188);", 'top', ['#s-more .card'], []),
 ('more_btns', board(185,"G.score=745")+"go('s-more');__prep(184);", 'bottom', ['#s-more a.btn', '#s-more button.btn'], []),
 ('results', board(180,"G.score=745;G.gameOK=52;G.gameTotal=60;G.wsOK=[9,8,8]")+"showResults();", 'top', ['#resGrid'], []),
 ('results_btns', board(180,"G.score=745;G.gameOK=52;G.gameTotal=60;G.wsOK=[9,8,8]")+"showResults();", '#toGenie', ['#toGenie', '#s-results .btn.alt:not(a)', '#s-results .btn.gray'], []),
 ('genie', board(180,"G.score=745;G.finished=true")+"buildGifts();go('s-genie');", '#gifts', ['#gifts'], []),
 ('q_ok', board(1675,"G.introSeen=true")+"openChapter();startQuestions();__prep(1672);var q=G.qs[0];answerQ(q.opts.findIndex(o=>o.c));__bl('#qFb',/(✅ أحسنتِ!)([\\s\\S]*)/);", '#qFb', ['#qOpts','#qFb'], ['#qText','#qOpts .opt']),
 ('q_no', board(1675,"G.introSeen=true")+"openChapter();startQuestions();__prep(1672);var q=G.qs[0];answerQ(q.opts.findIndex(o=>!o.c));__bl('#qFb',/(❌ ليست الإجابة الصحيحة\\.)([\\s\\S]*)/);", '#qFb', ['#qOpts','#qFb'], ['#qText','#qOpts .opt']),
 ('q_fail', board(1675,"G.introSeen=true")+"openChapter();startQuestions();__prep(1672);G.mistakes=3;failChapter();", 'top', ['#modalBox'], []),
 ('cls_mix', board(1600,"G.introSeen=true")+"G.score=50;G.ch=0;startClassify();__prep(1596);var c=CHAPTERS[0].classify;var r=document.querySelectorAll('#cItems .citem');classify(0,G.citems[0][1],r[0].querySelectorAll('.cb')[G.citems[0][1]]);var w=(G.citems[1][1]+1)%c.bins.length;classify(1,w,r[1].querySelectorAll('.cb')[w]);", 'top', ['#cItems .citem:nth-child(1)','#cItems .citem:nth-child(2)'], ['#cItems .citem .t']),
 ('acc_no', board(690,"G.introSeen=true;G.done=6;G.clues=CHAPTERS.map(c=>c.clue.text);G.score=540")+"openAccuse();__prep(688);accuse('noor');__bl('#accFb',/(❌ ليس الشخص الصحيح\\.)([\\s\\S]*)/);", '#accFb', ['#accFb'], ['#accClues']),
 ('ws_ok', board(610,"G.score=620")+"openWS(1);__prep(605);var q=G.ws[0];answerW(q.opts.findIndex(o=>o.c));", '#wFb', ['#wOpts','#wFb'], ['#wText','#wOpts .opt']),
 ('ws_no', board(600,"G.score=625")+"openWS(1);__prep(598);var q=G.ws[0];answerW(q.opts.findIndex(o=>!o.c));", '#wFb', ['#wOpts','#wFb'], ['#wText','#wOpts .opt']),
]

with sync_playwright() as p:
    b = p.chromium.launch()
    rects = {}
    for sid, js, scroll, hls, blurs in SHOTS:
        if len(sys.argv) > 1 and sid not in sys.argv[1:]:
            continue
        pg = b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=2)
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + ROOT + '/luebt_alfikra_almsuruqa.html')
        pg.wait_for_timeout(900)
        pg.evaluate(PREP)
        pg.evaluate(js)
        pg.wait_for_timeout(800)
        pg.evaluate("document.querySelectorAll('.screen,.screen.on,#modalBox').forEach(e=>e.style.animation='none')")
        for s in blurs:
            pg.evaluate(f"document.querySelectorAll({json.dumps(s)}).forEach(e=>{{e.style.filter='blur(6px)'}})")
        if scroll == 'top':
            pg.evaluate("window.scrollTo(0,0)")
        elif scroll == 'bottom':
            pg.evaluate("window.scrollTo(0,document.body.scrollHeight)")
        elif scroll.startswith('^'):
            pg.evaluate(f"(function(){{var e=document.querySelector({json.dumps(scroll[1:])});var r=e.getBoundingClientRect();window.scrollTo(0,window.scrollY+r.top-62)}})()")
        else:
            pg.evaluate(f"(function(){{var e=document.querySelector({json.dumps(scroll)});var r=e.getBoundingClientRect();window.scrollTo(0,window.scrollY+r.top+r.height/2-{H}*0.5)}})()")
        pg.wait_for_timeout(300)
        rs = []
        for s in hls:
            r = pg.evaluate(f"(function(){{var e=document.querySelector({json.dumps(s)});if(!e)return null;var r=e.getBoundingClientRect();return [r.left,r.top,r.width,r.height]}})()")
            if r is None:
                print('MISSING', sid, s)
            else:
                rs.append(r)
        # union of rects, clipped to viewport
        x0 = max(0, min(r[0] for r in rs)); y0 = max(0, min(r[1] for r in rs))
        x1 = min(W, max(r[0] + r[2] for r in rs)); y1 = min(H, max(r[1] + r[3] for r in rs))
        rects[sid] = [x0, y0, x1 - x0, y1 - y0]
        pg.screenshot(path=f'{OUT}/{sid}.jpg', type='jpeg', quality=92)
        if errs:
            print('ERR', sid, errs)
        pg.close()
    old = {}
    if os.path.exists(OUT + '/rects.json'):
        old = json.load(open(OUT + '/rects.json'))
    old.update(rects)
    json.dump(old, open(OUT + '/rects.json', 'w'), ensure_ascii=False, indent=0)
    print(len(rects), 'shots')
