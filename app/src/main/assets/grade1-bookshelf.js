/* YasinYar Grade 1 official book shelf — 1405-1406
   PDFs remain hosted by their publishers; this app links/embeds them and does not redistribute copies. */
(function(){
'use strict';
const books=[
 {id:'farsi',title:'فارسی اول دبستان',area:'فارسی و سواد خواندن',icon:'📖',url:'https://dl.daneshchi.ir/file/chap-school/Farsi-1_Daneshchi.iR.pdf',source:'https://www.daneshchi.ir/farsi-1/',status:'pdf_linked_outline_pending',note:'نگاره‌ها و آموزش نشانه‌ها؛ تطبیق و حل رسمی هر صفحه در صف انجام است.'},
 {id:'negarsh',title:'نگارش فارسی اول دبستان',area:'نوشتن و نگارش',icon:'✍️',url:'https://dl.daneshchi.ir/file/chap-school/Negaresh-1_Daneshchi.iR.pdf',source:'https://www.daneshchi.ir/negaresh-1/',status:'pdf_linked_outline_verified',note:'PDF دارای ۱۴۴ صفحه است؛ فهرست و صفحات قابل مرور هستند.'},
 {id:'math',title:'ریاضی اول دبستان',area:'ریاضی',icon:'🔢',url:'https://dl.daneshchi.ir/file/chap-school/Riazi-1_Daneshchi.iR.pdf',source:'https://www.daneshchi.ir/riazi-1/',status:'pdf_linked_outline_pending',note:'PDF نسخه ۱۴۰۵–۱۴۰۶؛ محتوای هر صفحه باید پیش از پاسخ رسمی بررسی شود.'},
 {id:'world',title:'جهان پیرامون اول دبستان',area:'جهان پیرامون',icon:'🌍',url:'https://dl.daneshchi.ir/file/chap-school/JahaanPiramon-1_Daneshchi.iR.pdf',source:'https://www.daneshchi.ir/jahaan-piramoon-1/',status:'pdf_linked_outline_verified',note:'فهرست ۷ فصل و ۱۸ درس نسخه ۱۴۰۵–۱۴۰۶ ثبت شده است.'},
 {id:'quran',title:'آموزش قرآن بخش اول (اجرای آزمایشی)',area:'آموزش قرآن',icon:'☪️',url:'https://dl.daneshchi.ir/file/chap-school/Quran-Az-1_Daneshchi.iR.pdf',source:'https://www.daneshchi.ir/quran-az-1/',status:'pdf_linked_outline_verified',note:'فهرست ۴ فصل، درس‌ها، سوره‌ها و تمرین وضو ثبت شده است.'}
];
const supporting=[
 {title:'راهنمای اولیا در زمینه برنامه درسی اول دبستان',url:'https://www.daneshchi.ir/rahnama-olia-1/',note:'راهنمای حوزه‌های قرآن، فارسی، ریاضی، تربیت‌بدنی، هنر و خلاقیت و جهان پیرامون.'}
];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render(){
 const host=document.getElementById('grade1BookShelf');if(!host)return;
 host.innerHTML='<div class="section-head"><h3>📚 کتاب‌های پایه اول · ۱۴۰۵–۱۴۰۶</h3><small>کتابخانه و نمایش صفحه‌ای</small></div><p class="muted">فایل‌ها از منبع منتشرکننده باز می‌شوند؛ هیچ PDF یا پاسخ رسمیِ بررسی‌نشده به‌عنوان محتوای تکمیل‌شده معرفی نمی‌شود.</p><div class="grid">'+books.map(b=>'<article class="card"><div class="course"><div class="course-icon">'+b.icon+'</div><div class="course-info"><b>'+esc(b.title)+'</b><small>'+esc(b.area)+'</small></div></div><p class="muted">'+esc(b.note)+'</p><div class="row"><button class="btn primary" type="button" data-book-open="'+b.id+'">بازکردن کتاب</button><a class="btn" href="'+b.source+'" target="_blank" rel="noopener">منبع و فهرست</a></div></article>').join('')+'</div><div class="panel"><h4>🎨 حوزه‌های مکمل برنامه درسی</h4><p class="muted">تربیت‌بدنی و هنر و خلاقیت در راهنمای برنامه درسی آمده‌اند؛ PDF مستقلِ دانش‌آموزی برای این دو عنوان در فهرست فعلی تأیید نشده، بنابراین به‌صورت بسته فعالیت تکمیلی ارائه خواهند شد.</p><p><a href="'+supporting[0].url+'" target="_blank" rel="noopener">مشاهده راهنمای اولیا</a></p></div><div id="grade1PdfViewer" class="panel hidden"><div class="row" style="justify-content:space-between"><b id="grade1PdfTitle">نمایش کتاب</b><button class="btn" type="button" id="grade1PdfClose">بستن</button></div><div class="row" style="margin:9px 0"><button class="btn" type="button" id="grade1Prev">صفحه قبل</button><label class="muted">صفحه <input id="grade1PdfPage" type="number" min="1" value="1" style="width:76px"></label><button class="btn" type="button" id="grade1Next">صفحه بعد</button><button class="btn primary" type="button" id="grade1Go">نمایش صفحه</button></div><iframe id="grade1PdfFrame" title="نمایش PDF کتاب پایه اول" style="width:100%;height:72vh;border:1px solid var(--border);border-radius:12px;background:#fff"></iframe><p class="muted">اگر نمایشگر PDF گوشی صفحه را نشان نداد، از دکمه «منبع و فهرست» وارد صفحه دریافت کتاب شو.</p></div>';
 let active=null,page=1;
 const viewer=document.getElementById('grade1PdfViewer'),frame=document.getElementById('grade1PdfFrame'),pageInput=document.getElementById('grade1PdfPage');
 function show(){if(!active)return;page=Math.max(1,Number(pageInput.value)||1);pageInput.value=page;frame.src=active.url+'#page='+page+'&view=FitH';viewer.classList.remove('hidden');viewer.scrollIntoView({behavior:'smooth',block:'start'});}
 host.querySelectorAll('[data-book-open]').forEach(btn=>btn.addEventListener('click',()=>{active=books.find(b=>b.id===btn.dataset.bookOpen);page=1;pageInput.value=1;document.getElementById('grade1PdfTitle').textContent=active.title;show();}));
 document.getElementById('grade1PdfClose').addEventListener('click',()=>{frame.src='about:blank';viewer.classList.add('hidden');});
 document.getElementById('grade1Go').addEventListener('click',show);
 document.getElementById('grade1Prev').addEventListener('click',()=>{pageInput.value=Math.max(1,(Number(pageInput.value)||1)-1);show();});
 document.getElementById('grade1Next').addEventListener('click',()=>{pageInput.value=(Number(pageInput.value)||1)+1;show();});
 pageInput.addEventListener('keydown',e=>{if(e.key==='Enter')show();});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else render();
})();
