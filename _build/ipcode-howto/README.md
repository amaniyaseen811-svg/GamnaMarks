# بناء فيديو شرح «شفرة الفكرة المسروقة» (ipcode-howto-full-h/v.mp4)

- `capture.py`: لقطات اللعبة (luebt_alfikra_almsuruqa.html) بمقاس جوال 390×696، مع مستطيلات التضوية في `shots/rects.json`.
- `render.py`: بطاقات الخطوات (من الخطوة 24 حتى 77) بالنسختين h وv. الخطوط: Rakkas للعناوين وMada للنص (من google/fonts على GitHub).
- `head2.py`: الجزء الأول (العنوان، والأهداف، والخطوات 1–23). يقص شاشة الجوال من الفيديو القديم (commit 14ff4e7) ويركّبها على بطاقات جديدة، ومعه بطاقة الختام.
- `music_only.py`: الموسيقى (`music-the-mountain.mp3`)، تُكرَّر مع تداخل 3 ثوانٍ.
- `narr.py` و`narration_lines.json`: نص الراوي بالفصحى المشكولة (82 جملة). الصوت المختار: Jett من Google AI Studio.
- الترتيب: headp2 (00–29) ثم seg (000–058) ثم end.
