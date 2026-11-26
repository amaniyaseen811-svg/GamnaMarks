/* أرقام قناة GamnaMarks على يوتيوب (المشتركين + المشاهدات) — بتتحدّث لحالها
   ضعي مفتاح YouTube Data API v3 بين علامتي التنصيص في السطر التالي: */
var GM_YT_KEY = "";
var GM_YT_HANDLE = "GamnaMarks";

(function(){
  if (!GM_YT_KEY) return;                       // بدون مفتاح ما بيطلع إشي
  var CACHE = "gm_yt_stats", HOURS = 3;
  function fmt(n){ n = Number(n) || 0; return n.toLocaleString("en"); }
  function show(s){
    if (!s) return;
    var a = document.getElementById("gmYtSubs"), b = document.getElementById("gmYtViews");
    if (a && s.subs != null && !s.hidden){ document.getElementById("gmYtSubsNum").textContent = fmt(s.subs); a.style.display = ""; }
    if (b && s.views != null){ document.getElementById("gmYtViewsNum").textContent = fmt(s.views); b.style.display = ""; }
  }
  var c = null;
  try { c = JSON.parse(localStorage.getItem(CACHE) || "null"); } catch(e){}
  if (c) show(c);
  if (c && Date.now() - c.t < HOURS * 3600 * 1000) return;   // ما بنسأل يوتيوب كل مرة
  var url = "https://www.googleapis.com/youtube/v3/channels?part=statistics&forHandle=" +
            encodeURIComponent(GM_YT_HANDLE) + "&key=" + encodeURIComponent(GM_YT_KEY);
  fetch(url).then(function(r){ return r.json(); }).then(function(j){
    var st = j && j.items && j.items[0] && j.items[0].statistics; if (!st) return;
    var s = { subs: st.subscriberCount, views: st.viewCount, hidden: !!st.hiddenSubscriberCount, t: Date.now() };
    try { localStorage.setItem(CACHE, JSON.stringify(s)); } catch(e){}
    show(s);
  }).catch(function(){});
})();
