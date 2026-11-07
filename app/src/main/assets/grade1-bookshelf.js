/* کتابخانه PDF پایه اول؛ لینک‌های مستقیمِ بررسی‌شده و مسیرهای دریافت جایگزین */
(function(){
'use strict';
const official='https://chap.oerp.ir/';
const books=[
 {id:'quran',file:'C1011.pdf',title:'آموزش قرآن بخش اول ـ اجرای آزمایشی',subject:'قرآن',pages:128,kind:'نسخه آزمایشی',url:'https://www.daneshchi.ir/quran-az-1/',urlLabel:'صفحه دریافت PDF'},
 {file:'C101.pdf',title:'آموزش قرآن ـ نسخه چاپی',subject:'قرآن',pages:96,kind:'کتاب درسی'},
 {id:'read',file:'C1031.pdf',title:'فارسی می‌خوانم ـ اجرای آزمایشی',subject:'فارسی',pages:192,kind:'نسخه آزمایشی',url:'https://dl.daneshchi.ir/file/chap-school/ReadFarsi-1_Daneshchi.iR.pdf',urlLabel:'باز کردن PDF مستقیم'},
 {file:'C103 (1).pdf',title:'فارسی ـ نسخه چاپی',subject:'فارسی',pages:120,kind:'کتاب درسی'},
 {file:'C1036.pdf',title:'بسته تکمیلی فارسی ـ نیازمند شناسایی عنوان',subject:'فارسی',pages:390,kind:'منبع تکمیلی'},
 {id:'write',file:'C1041 (2).pdf',title:'فارسی می‌نویسم ـ اجرای آزمایشی',subject:'نگارش',pages:144,kind:'نسخه آزمایشی',url:'https://dl.daneshchi.ir/file/chap-school/WriteFarsi-1_Daneshchi.iR.pdf',urlLabel:'باز کردن PDF مستقیم'},
 {file:'C104 (3).pdf',title:'نگارش فارسی ـ نسخه چاپی',subject:'نگارش',pages:144,kind:'کتاب درسی'},
 {id:'math',file:'C1051.pdf',title:'ریاضی دوست‌داشتنی ـ اجرای آزمایشی',subject:'ریاضی',pages:176,kind:'نسخه آزمایشی',url:'https://dl.daneshchi.ir/file/chap-school/LovelyMath-1_Daneshchi.iR.pdf',urlLabel:'باز کردن PDF مستقیم'},
 {file:'C105.pdf',title:'ریاضی ـ نسخه چاپی',subject:'ریاضی',pages:184,kind:'کتاب درسی'},
 {file:'C1056.pdf',title:'کارت اعداد و شمارنده',subject:'ریاضی',pages:14,kind:'کارت آموزشی'},
 {id:'world',file:'C1061.pdf',title:'جهان پیرامون ـ اجرای آزمایشی',subject:'جهان پیرامون',pages:160,kind:'نسخه آزمایشی',url:'https://dl.daneshchi.ir/file/chap-school/JahaanPiramon-1_Daneshchi.iR.pdf',urlLabel:'باز کردن PDF مستقیم'},
 {file:'C106.pdf',title:'علوم تجربی ـ نسخه چاپی',subject:'علوم',pages:104,kind:'کتاب درسی'},
 {id:'art',file:'C1081.pdf',title:'هنر و خلاقیت ـ اجرای آزمایشی',subject:'هنر',pages:80,kind:'کتاب درسی',url:'https://www.daneshchi.ir/honar-kh-1/',urlLabel:'صفحه دریافت PDF'},
 {file:'C1087.pdf',title:'راهنمای معلم هنر و خلاقیت',subject:'هنر',pages:210,kind:'راهنمای معلم'},
 {id:'move',file:'C1091.pdf',title:'کتاب کار حرکت و بازی',subject:'تربیت بدنی',pages:80,kind:'کتاب کار',url:'https://www.daneshchi.ir/move-game-1/',urlLabel:'صفحه دریافت PDF'},
 {file:'C1941.pdf',title:'راهنمای اولیا ـ زیست‌بوم جدید برنامه درسی',subject:'راهنمای اولیا',pages:24,kind:'راهنمای خانواده'}
];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[+d]);
function render(){
 const host=document.getElementById('grade1BookShelf');if(!host)return;
 host.innerHTML='<div class="section-head"><h3>📚 کتابخانه کتاب‌های پایه اول · ۱۴۰۵–۱۴۰۶</h3><small>۱۶ عنوان ثبت‌شده</small></div>'+
 '<div class="notice"><b>دسترسی به نسخه‌های آنلاین</b><p>برای چهار کتاب، پیوند مستقیم PDF اضافه شده است. برای قرآن، هنر و حرکت‌وبازی، پیوند به صفحه دریافت گذاشته شده تا نسخه درست انتخاب شود. پیوندهای مستقیم از میزبان دانلود دانشچی هستند و خودِ مرجع رسمی انتشار کتاب‌ها، پایگاه سازمان پژوهش است.</p></div>'+
 '<div class="grid">'+books.map((b,i)=>{const href=b.url||official;const label=b.urlLabel||'ورود به پایگاه رسمی';return '<article class="card"><div class="course"><div class="course-icon">'+(['☪️','📖','📚','✍️','🧩','🔢','🧮','🧪','🌍','🎨','🤸'][i%11])+'</div><div class="course-info"><b>'+esc(b.title)+'</b><small>'+esc(b.subject)+' · '+esc(b.kind)+'</small></div></div><p class="pill">'+fa(b.pages)+' صفحه</p><div class="row" style="gap:8px;flex-wrap:wrap"><a class="btn primary" style="display:inline-block;text-decoration:none" href="'+href+'" target="_blank" rel="noopener">'+esc(label)+' ↗</a></div></article>';}).join('')+'</div>'+
 '<div class="panel"><h4>منبع رسمی کتاب‌ها</h4><p class="muted">برای بررسی چاپ جاری، سال تحصیلی و دریافت نسخه‌های رسمی، از پایگاه کتاب‌های درسی سازمان پژوهش استفاده کن.</p><a class="btn" style="display:inline-block;text-decoration:none" href="'+official+'" target="_blank" rel="noopener">ورود به پایگاه رسمی کتاب‌های درسی ↗</a><p class="muted">لینک‌های PDF بیرونی‌اند و برای باز شدن به اینترنت نیاز دارند؛ فایل‌ها در فضای ذخیره‌سازی برنامه کپی نمی‌شوند.</p></div>';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else render();
})();