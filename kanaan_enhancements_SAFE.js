/**
 * ===================================================================
 * لغز الأرجوان — تحسينات آمنة بدون تضارب
 * PlayVerse 16-Component Standard Implementation
 * ⚠️ أسماء آمنة - لا تتعارض مع الملف الأصلي
 * ===================================================================
 */

// ===================================================================
// 1️⃣ نظام الأخطاء المحسّن (Error System)
// ===================================================================

const KanaaErrorSystem = {
  maxErrors: 3,
  currentErrors: 0,
  errorHistory: [],

  initialize() {
    this.currentErrors = 0;
    this.errorHistory = [];
  },

  addError(questionId, playerName) {
    this.currentErrors++;
    this.errorHistory.push({
      questionId,
      playerName,
      timestamp: new Date(),
      errorNumber: this.currentErrors
    });

    this.showErrorAlert(this.currentErrors);

    if (this.currentErrors >= this.maxErrors) {
      this.triggerGameOver(playerName);
      return true;
    }
    return false;
  },

  showErrorAlert(errorCount) {
    const colors = ['#fbbf24', '#f97316', '#ef4444'];
    const messages = [
      '⚠️ خطأ واحد — تركيزي أكثر!',
      '🔴 خطآن — آخر فرصة!',
      '❌ ثلاثة أخطاء — اللعبة انتهت!'
    ];

    const alert = document.createElement('div');
    alert.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: ${colors[errorCount - 1]};
      color: white;
      padding: 30px 40px;
      border-radius: 18px;
      font-size: 22px;
      font-weight: bold;
      text-align: center;
      z-index: 1000;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      animation: popIn 0.4s ease;
    `;
    alert.textContent = messages[errorCount - 1];
    document.body.appendChild(alert);

    setTimeout(() => alert.remove(), 2000);

    if (window.Voice) {
      Voice.say(messages[errorCount - 1].replace(/[⚠️🔴❌]/g, ''), 'kanaan');
    }
  },

  triggerGameOver(playerName) {
    const gameOverHTML = `
      <div style="text-align: center; padding: 40px 20px;">
        <div style="font-size: 60px; margin-bottom: 20px;">❌</div>
        <h2 style="font-size: 28px; color: var(--red); margin: 0;">انتهت اللعبة</h2>
        <p style="font-size: 18px; color: var(--clay3); margin-top: 12px;">
          يا ${playerName}، وصلتِ إلى ثلاثة أخطاء.
        </p>
        <p style="font-size: 15px; color: var(--clay3); margin-top: 8px;">
          استعيدي من جديد وركّزي أكثر على الأسئلة!
        </p>
        <button class="btn gold mt2" id="restart">العبي من جديد 🔁</button>
        <button class="btn ghost mt" id="home">الرئيسية</button>
      </div>
    `;

    document.getElementById('screens').innerHTML = gameOverHTML;
    document.getElementById('restart').onclick = () => location.reload();
    document.getElementById('home').onclick = () => window.history.back();
  },

  getRemainingErrors() {
    return this.maxErrors - this.currentErrors;
  }
};

// ===================================================================
// 2️⃣ تحسين شاشة النتائج (تضاف قبل استدعاء scrCup الأصلية)
// ===================================================================

function enhanceCupScreen() {
  const p = window.P();
  const mins = Math.max(1, Math.round((Date.now() - window.G.started) / 60000));
  const totalQuestions = 34;
  const correct = p.right || 0;
  const accuracy = ((correct / totalQuestions) * 100).toFixed(1);
  
  // حساب التقدير
  let grade, gradeColor, gradeArabic;
  if (accuracy >= 90) {
    grade = 'A+';
    gradeColor = '#10b981';
    gradeArabic = '🌟 ممتاز جداً';
  } else if (accuracy >= 80) {
    grade = 'A';
    gradeColor = '#06b6d4';
    gradeArabic = '⭐ ممتاز';
  } else if (accuracy >= 70) {
    grade = 'B';
    gradeColor = '#f59e0b';
    gradeArabic = '👍 جيد جداً';
  } else if (accuracy >= 60) {
    grade = 'C';
    gradeColor = '#f97316';
    gradeArabic = '📌 جيد';
  } else {
    grade = 'D';
    gradeColor = '#ef4444';
    gradeArabic = '⚠️ يحتاج تحسّن';
  }

  // إضافة معلومات التقدير للشاشة
  const enhancementHTML = `
    <div style="background: linear-gradient(135deg, ${gradeColor}22, ${gradeColor}11); 
                border: 2px solid ${gradeColor}; border-radius: 18px; padding: 24px; margin-bottom: 24px;">
      <div style="font-size: 48px; font-weight: bold; color: ${gradeColor}; margin-bottom: 8px;">${grade}</div>
      <div style="font-size: 20px; color: ${gradeColor}; font-weight: 600;">${gradeArabic}</div>
      <div style="font-size: 14px; color: var(--clay3); margin-top: 8px;">دقتك: ${accuracy}% | الوقت: ${mins} دقيقة</div>
    </div>
  `;

  // إدراج التحسينات قبل الكأس الأصلية
  const screenDiv = document.getElementById('screens');
  if (screenDiv) {
    // إضافة div جديد مع التحسينات
    const wrapper = document.createElement('div');
    wrapper.innerHTML = enhancementHTML + screenDiv.innerHTML;
    screenDiv.parentElement.replaceChild(wrapper, screenDiv);
  }

  if (window.Voice) {
    window.Voice.say(`مبروك يا ${p.name}، حصلتِ على ${accuracy}% دقة!`, 'zaydan');
  }
}

// ===================================================================
// 3️⃣ تحسين شاشة الجني (إضافة خيارات مكافآت)
// ===================================================================

function enhanceGenieScreen() {
  const p = window.P();
  const originalGenieHTML = document.getElementById('screens').innerHTML;
  
  // إضافة خيارات المكافآت بعد الشاشة الأصلية
  const rewardsHTML = `
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(229, 172, 46, 0.3);">
      <h3 style="text-align: center; color: var(--gold2); margin-bottom: 16px;">🎁 المارد يعطيك خيارات:</h3>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
        <button style="padding: 12px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); 
                       border-radius: 10px; color: #10b981; font-weight: bold; cursor: pointer;"
                onclick="alert('حصلتِ على شارة حارس الاسم! 🎖️');">
          🎖️ شارة
        </button>
        <button style="padding: 12px; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); 
                       border-radius: 10px; color: #3b82f6; font-weight: bold; cursor: pointer;"
                onclick="alert('اكتسبتِ 30 نقطة إضافية! ⭐'); window.P().score += 30;">
          ⭐ 30 نقطة
        </button>
        <button style="padding: 12px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); 
                       border-radius: 10px; color: #f59e0b; font-weight: bold; cursor: pointer;"
                onclick="alert('لقب جديد: ابنة كنعان! 🏅');">
          🏅 لقب
        </button>
      </div>
    </div>
  `;

  const screenDiv = document.getElementById('screens');
  if (screenDiv) {
    screenDiv.innerHTML += rewardsHTML;
  }
}

// ===================================================================
// التصدير والربط الآمن
// ===================================================================

window.KanaaErrorSystem = KanaaErrorSystem;
window.enhanceCupScreen = enhanceCupScreen;
window.enhanceGenieScreen = enhanceGenieScreen;

// تفعيل تلقائي عند التحميل
document.addEventListener('DOMContentLoaded', function() {
  console.log('✅ تحسينات لغز الأرجوان محملة بنجاح - بدون تضارب!');
  KanaaErrorSystem.initialize();
});

