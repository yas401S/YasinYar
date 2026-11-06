/* کتابخانه PDF پایه اول؛ فایل‌های این بسته با SHA-256 بررسی شده و نسخه‌های کاملاً تکراری حذف شده‌اند. */
(function(){
'use strict';
const official='https://chap.oerp.ir/';
const api='https://yasinyar-ai-tutor.yasinjon-401.workers.dev';
const books=[
 {file:'C101.pdf',title:'آموزش قرآن ـ چاپ ۱۴۰۵',subject:'قرآن',pages:96,kind:'کتاب درسی'},
 {file:'C1011.pdf',title:'آموزش قرآن ـ اجرای آزمایشی',subject:'قرآن',pages:128,kind:'نسخه آزمایشی'},
 {file:'C103 (1).pdf',title:'فارسی ـ اول دبستان',subject:'فارسی',pages:120,kind:'کتاب درسی'},
 {file:'C1031.pdf',title:'فارسی می‌خوانم ـ اجرای آزمایشی',subject:'فارسی',pages:192,kind:'نسخه آزمایشی'},
 {file:'C1036.pdf',title:'بسته تکمیلی فارسی ـ نیازمند شناسایی عنوان',subject:'فارسی',pages:390,kind:'منبع تکمیلی'},
 {file:'C104 (3).pdf',title:'نگارش فارسی ـ اول دبستان',subject:'نگارش',pages:144,kind:'کتاب درسی'},
 {file:'C1041 (2).pdf',title:'فارسی می‌نویسم ـ اجرای آزمایشی',subject:'نگارش',pages:144,kind:'نسخه آزمایشی'},
 {file:'C105.pdf',title:'ریاضی ـ اول دبستان',subject:'ریاضی',pages:184,kind:'کتاب درسی'},
 {file:'C1051.pdf',title:'ریاضی دوست‌داشتنی ـ اجرای آزمایشی',subject:'ریاضی',pages:176,kind:'نسخه آزمایشی'},
 {file:'C1056.pdf',title:'کارت اعداد و شمارنده',subject:'ریاضی',pages:14,kind:'کارت آموزشی'},
 {file:'C106.pdf',title:'علوم تجربی ـ اول دبستان',subject:'علوم',pages:104,kind:'کتاب درسی'},
 {file:'C1061.pdf',title:'جهان پیرامون ـ اجرای آزمایشی',subject:'جهان پیرامون',pages:160,kind:'نسخه آزمایشی'},
 {file:'C1081.pdf',title:'هنر و خلاقیت ـ اجرای آزمایشی',subject:'هنر',pages:80,kind:'کتاب درسی'},
 {file:'C1087.pdf',title:'راهنمای معلم هنر و خلاقیت',subject:'هنر',pages:210,kind:'راهنمای معلم'},
 {file:'C1091.pdf',title:'کتاب کار حرکت و بازی',subject:'تربیت بدنی',pages:80,kind:'کتاب کار'},
 {file:'C1941.pdf',title:'راهنمای اولیا ـ زیست‌بوم جدید برنامه درسی',subject:'راهنمای اولیا',pages:24,kind:'راهنمای خانواده'}
];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[+d]);
function render(){
 const host=document.getElementById('grade1BookShelf');if(!host)return;
 const ready=window.YASINYAR_GRADE1_PDF_READY===true;
 host.innerHTML='<div class="section-head"><h3>📚 کتابخانه PDF پایه اول · ۱۴۰۵–۱۴۰۶</h3><small>۱۶ فایل یکتا</small></div>'+
 '<div class="notice"><b>کتاب‌ها در برنامه دسته‌بندی شده‌اند</b><p>نسخه‌های تکراریِ کاملاً یکسان حذف شده‌اند. نسخه‌های رسمی و آزمایشیِ متفاوت حفظ شده‌اند. فایل C1036 تا بررسی جلد با عنوان موقت مشخص شده است.</p></div>'+
 '<div class="grid">'+books.map((b,i)=>{const href=api+'/books/grade1/'+encodeURIComponent(b.file);return '<article class="card"><div class="course"><div class="course-icon">'+(['☪️','📖','📚','✍️','🧩','🔢','🧮','🧪','🌍','🎨','🤸'][i%11])+'</div><div class="course-info"><b>'+esc(b.title)+'</b><small>'+esc(b.subject)+' · '+esc(b.kind)+'</small></div></div><p class="pill">'+fa(b.pages)+' صفحه</p><div class="row" style="gap:8px;flex-wrap:wrap"><a class="btn primary" style="display:inline-block;text-decoration:none" href="'+href+'" target="_blank" rel="noopener">باز کردن کتاب ↗</a><a class="btn" style="display:inline-block;text-decoration:none" href="'+href+'" download>دریافت PDF</a></div></article>';}).join('')+'</div>'+
 '<div class="panel"><h4>وضعیت اتصال فایل‌ها</h4><p class="muted">'+(ready?'مخزن فایل پایه اول متصل است.':'فهرست کتاب‌ها در برنامه ثبت شده است؛ برای نمایش خود PDFها باید فایل‌ها در فضای ذخیره‌سازی R2 بارگذاری و اتصال آن فعال شود.')+'</p><p class="muted">آموزش درس‌ها و تمرین‌های موجود در بخش درس‌ها باقی می‌مانند؛ این کتابخانه مسیر مشاهده نسخه اصلی PDF را اضافه می‌کند.</p><a class="btn" style="display:inline-block;text-decoration:none" href="'+official+'" target="_blank" rel="noopener">پایگاه رسمی کتاب‌های درسی ↗</a></div>';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else render();
})();
