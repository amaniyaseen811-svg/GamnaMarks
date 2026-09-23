# 🚀 دليل النشر والتثبيت

## Deployment Guide for IP CODE Game

---

## ✅ قائمة التحقق قبل الرفع

- [x] اللعبة HTML مكتملة
- [x] جميع الصور بجودة عالية وحجم محسّن
- [x] فيديو Cover متحرك (22 ثانية)
- [x] فيديو تحفيزي (16 ثانية)
- [x] ملفات Subtitles (4 لغات)
- [x] index.html محدّث مع بيانات اللعبة
- [x] README شامل

---

## 📁 هيكل الملفات المطلوبة

```
📦 GamnaMarks_IP_CODE/
├── 🎮 IP_CODE_COMPLETE.html        (26K)  ← اللعبة الرئيسية
├── 📄 index.html                   (942K) ← فهرس المنصة
├── 📄 IP_CODE_README.md
├── 📄 DEPLOYMENT.md
│
├── 🖼️ الصور الأساسية:
│   ├── cover.jpg                   (56K)  ← الغلاف الأصلي
│   ├── IP_CODE_Cover_Preview.jpg   (2.9K) ← للبطاقة على المنصة
│   ├── IP_CODE_Cover_Hero.jpg      (12K)  ← Hero image
│   └── poster.jpg                  (11K)  ← Poster للفيديو
│
├── 👥 صور الشخصيات (6 شخصيات):
│   ├── character_noor.jpg          (42K)  ← نور 🎨
│   ├── character_rami.jpg          (42K)  ← رامي 🕵️
│   ├── char_layan.jpg              (38K)  ← ليان 🔬
│   ├── char_sami.jpg               (40K)  ← سامي 😠
│   ├── char_adam.jpg               (41K)  ← آدم 💻
│   └── char_x.jpg                  (32K)  ← X 🔐
│
├── 🎬 الفيديوهات:
│   ├── IP_CODE_Cover.mp4           (563K) ← Animated Cover (22s)
│   └── ipcode-motiv.mp4            (259K) ← Intro/Motivation (16s)
│
└── 📝 الترجمات (subs/):
    ├── ipcode_ar.vtt               (409b) ← العربية
    ├── ipcode_en.vtt               (322b) ← الإنجليزية
    ├── ipcode_fr.vtt               (355b) ← الفرنسية
    └── ipcode_es.vtt               (338b) ← الإسبانية
```

---

## 🔗 روابط الملفات والمراجع

### في الـ index.html
```javascript
{ 
  key: "g_ipcode",
  subjKey: "subj_inno",
  emoji: "🔐",
  file: "IP_CODE_COMPLETE.html",
  color: "#7c3aed",
  cover: "IP_CODE_Cover_Preview.jpg",
  animCover: ["IP_CODE_Cover.mp4"],
  intro: true,
  introFile: "ipcode-motiv.mp4"
}
```

### في الـ IP_CODE_COMPLETE.html
يجب أن تشير الصور إلى:
```html
<img src="character_noor.jpg" ... >
<img src="character_rami.jpg" ... >
<img src="char_layan.jpg" ... >
<img src="char_sami.jpg" ... >
<img src="char_adam.jpg" ... >
<img src="char_x.jpg" ... >
<img src="cover.jpg" ... >
```

---

## 🔧 خطوات الرفع على GitHub

### 1. Clone Repository
```bash
git clone https://github.com/amaniyaseen811-svg/GamnaMarks.git
cd GamnaMarks
```

### 2. نسخ ملفات IP CODE
```bash
# انسخ جميع ملفات المجلد GamnaMarks_IP_CODE/
cp -r GamnaMarks_IP_CODE/* .
```

### 3. تحديث .gitignore (اختياري)
```bash
# تأكد من عدم استبعاد ملفات الفيديو والصور
# في .gitignore
```

### 4. Commit والرفع
```bash
git add .
git commit -m "Add IP CODE game #27 - Complete with videos, subtitles, and all assets"
git push origin main
```

---

## 📋 الترجمات في index.html

تأكد من وجود هذه الترجمات:

### العربية (ar):
```javascript
"g_ipcode_t": "شفرة الفكرة المسروقة",
"g_ipcode_p": "الملكية الفكرية وحقوق الابتكار",
"g_ipcode_g": "الصف العاشر والحادي عشر"
```

### الإنجليزية (en):
```javascript
"g_ipcode_t": "Cipher of the Stolen Idea",
"g_ipcode_p": "Intellectual Property Rights & Innovation",
"g_ipcode_g": "Grades 10 & 11"
```

### الفرنسية (fr):
```javascript
"g_ipcode_t": "Chiffre de l'Idée Volée",
"g_ipcode_p": "Droits de Propriété Intellectuelle et Innovation",
"g_ipcode_g": "Classes 10 et 11"
```

### الإسبانية (es):
```javascript
"g_ipcode_t": "Cifra de la Idea Robada",
"g_ipcode_p": "Derechos de Propiedad Intelectual e Innovación",
"g_ipcode_g": "Grados 10 y 11"
```

---

## ⚙️ متطلبات الخادم

- [ ] دعم CORS (للفيديوهات)
- [ ] HTTPS مفعّل
- [ ] Gzip compression مفعّل
- [ ] CDN للملفات الكبيرة (اختياري)

---

## 🧪 الاختبار قبل النشر

1. **اختبر تحميل اللعبة:**
   - افتح `index.html` في المتصفح
   - انقر على لعبة IP CODE
   
2. **تحقق من الصور:**
   - تأكد من ظهور جميع الصور بشكل صحيح
   - اختبر الصور على أحجام شاشات مختلفة

3. **اختبر الفيديوهات:**
   - شغل فيديو Cover
   - شغل Motiv Video
   - تحقق من التشغيل الناعم

4. **اختبر الترجمات:**
   - غيّر اللغة في المنصة
   - تحقق من ظهور الترجمات الصحيحة

5. **اختبر الألعاب:**
   - اختبر ورقة العمل 1 (25 سؤال)
   - اختبر ورقة العمل 2 (6 قضايا)
   - اختبر الكأس (نقاط)

---

## 🚨 المشاكل المحتملة والحلول

### المشكلة: الفيديو لا يشتغل
**الحل:**
- تأكد من أن ملفات MP4 موجودة
- تحقق من أن الخادم يدعم CORS
- استخدم video preview عدة مرات

### المشكلة: الصور لا تظهر
**الحل:**
- تحقق من المسارات النسبية
- تأكد من أن أسماء الملفات صحيحة (حالة الأحرف مهمة!)
- اختبر في متصفح آخر

### المشكلة: الترجمات غير صحيحة
**الحل:**
- تحقق من الترميز UTF-8 في الملف
- تأكد من عدم وجود أخطاء في الـ JSON

---

## 📊 إحصائيات اللعبة

| المقياس | القيمة |
|---------|--------|
| عدد الشاشات | 7 |
| عدد الشخصيات | 6 |
| عدد الأسئلة | 31 |
| عدد القضايا | 6 |
| اللغات المدعومة | 2+ |
| إجمالي الملفات | 19 |
| حجم الحزمة | ~2.1 MB |

---

## 📞 دعم وتواصل

- **المطورة:** د. أماني ياسين داود
- **المنصة:** GamnaMarks (PlayVerse سابقاً)
- **التاريخ:** 23 سبتمبر 2026

---

## ✅ النقاط النهائية

- تأكد من مرجعية جميع الملفات الخارجية
- اختبر على متصفحات وأجهزة مختلفة
- احتفظ بنسخة احتياطية من الملفات
- وثّق أي تغييرات تحدثها

---

**🎉 شفرة الفكرة المسروقة - جاهزة للنشر!**
