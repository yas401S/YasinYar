/* کتابخانه پایه اول؛ فهرست چاپ ۱۴۰۵–۱۴۰۶ */
(function(){
'use strict';
const official='https://chap.oerp.ir/';
const books=[
 {id:'read',title:'فارسی می‌خوانم',area:'خواندن و سواد فارسی',count:40,icon:'📖',url:'https://www.daneshchi.ir/readfarsi-1/',note:'پیش‌درآمد و باهم‌خوانی، نشانه‌های ۱ و نشانه‌های ۲؛ فهرست ۴۰ درس در منبع معرفی شده است.'},
 {id:'write',title:'فارسی می‌نویسم',area:'نوشتن و نگارش',count:37,icon:'✍️',url:'https://www.daneshchi.ir/writefarsi-1/',note:'نقشه گنج، من، مدرسه، کلاس، زندگی در مدرسه و بخش‌های نشانه‌های ۱ و ۲.'},
 {id:'math',title:'ریاضی دوست‌داشتنی',area:'ریاضی',count:11,icon:'🔢',url:'https://www.daneshchi.ir/lovelymath-1/',note:'کتاب اجرای آزمایشی با ۱۱ درس؛ عنوان جزئی درس‌ها در فهرست متنی منبع درج نشده است.'},
 {id:'world',title:'جهان پیرامون',area:'شناخت جهان و محیط زندگی',count:18,icon:'🌍',url:'https://www.daneshchi.ir/jahaan-piramoon-1/',note:'۷ فصل و ۱۸ درس؛ کشف، گوناگونی، محافظت، وابستگی، استفاده، کاوش و تغییر.'},
 {id:'quran',title:'آموزش قرآن بخش اول',area:'آموزش قرآن و رفتار نیک',count:23,icon:'☪️',url:'https://www.daneshchi.ir/quran-az-1/',note:'۴ فصل؛ مهربانی‌های خدا، پیام‌های خدا، سوره حمد و توحید، گفت‌وگو با خدای مهربان.'},
 {id:'art',title:'کتاب کار هنر و خلاقیت',area:'هنر و خلاقیت',count:17,icon:'🎨',url:'https://www.daneshchi.ir/honar-kh-1/',note:'۱۷ درس از مشاهده طبیعت و نقطه‌وخط تا رنگ، خیال، ساختن و بازی گروهی.'},
 {id:'move',title:'کتاب کار حرکت و بازی',area:'تربیت بدنی و مهارت حرکتی',count:12,icon:'🤸',url:'https://www.daneshchi.ir/move-game-1/',note:'۱۲ درس درباره حرکت، وضعیت بدنی، دویدن، تعادل، انعطاف، هماهنگی، پرتاب و بازی.'}
];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render(){
 const host=document.getElementById('grade1BookShelf');if(!host)return;
 const catalog=window.YASINYAR_GRADE1_CURRENT_CATALOG;
 host.innerHTML='<div class="section-head"><h3>📚 کتابخانه پایه اول · سال تحصیلی ۱۴۰۵–۱۴۰۶</h3><small>فهرست به‌روزشده کتاب‌ها</small></div>'+
 '<div class="notice"><b>۷ کتاب و بسته یادگیری پایه اول</b><p>عنوان‌ها و تعداد درس‌ها بر اساس فهرست‌های چاپ جاری ثبت شده‌اند. درس‌نامه‌های داخل یاسین‌یار تألیفی‌اند؛ پاسخ فعالیت‌های عین کتاب فقط پس از بررسی همان صفحه از PDF رسمی تأیید می‌شود.</p></div>'+
 '<p><a class="btn primary" style="display:inline-block;text-decoration:none" href="'+official+'" target="_blank" rel="noopener">باز کردن پایگاه رسمی کتاب‌های درسی ↗</a></p>'+
 '<div class="grid">'+books.map(b=>'<article class="card"><div class="course"><div class="course-icon">'+b.icon+'</div><div class="course-info"><b>'+esc(b.title)+'</b><small>'+esc(b.area)+'</small></div></div><p class="pill">'+fa(b.count)+' درس / واحد در فهرست</p><p class="muted">'+esc(b.note)+'</p><a class="btn" style="display:inline-block;text-decoration:none" href="'+b.url+'" target="_blank" rel="noopener">فهرست و پیوند PDF ↗</a></article>').join('')+'</div>'+
 '<div class="panel"><h4>وضعیت محتوای آموزشی داخل برنامه</h4><p class="muted">بسته‌های مفهومی، مثال‌ها و تمرین‌های تألیفی در بخش «آموزش درس‌ها» قرار دارند. اگر یک عنوان هنوز محتوای کامل نداشته باشد، برنامه باید آن را با وضعیت نیازمند تکمیل نشان دهد؛ پاسخ ساختگی به‌عنوان پاسخ رسمی نمایش داده نمی‌شود.</p><p class="muted">برای مشاهده PDF رسمی هر کتاب، سال ۱۴۰۵–۱۴۰۶ و پایه اول را در پایگاه رسمی انتخاب کن.</p></div>';
}
function fa(n){return String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[+d]);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else render();
})();