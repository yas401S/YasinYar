/* نمایش PDF کتاب فارسی اول دبستان؛ پاسخ‌ها فقط پس از تطبیق صفحه افزوده می‌شوند. */
(function(){
'use strict';
const PDF='https://dl.daneshchi.ir/file/chap-school/Farsi-1_Daneshchi.iR.pdf';
const OFFICIAL_PORTAL='https://chap.oerp.ir/';
function mount(){
 const lib=document.getElementById('page-library');
 if(!lib||document.getElementById('grade1FarsiBook'))return;
 const box=document.createElement('section');box.id='grade1FarsiBook';box.className='panel';
 box.innerHTML='<h3>📘 کتاب واقعی فارسی اول دبستان</h3><p class="muted">برای دریافت نسخه رسمی و جدید کتاب‌ها ابتدا پایگاه رسمی آموزش‌وپرورش را بررسی کن. نمایش PDF زیر یک پیوند بیرونی است؛ پاسخ یا آموزش هر صفحه فقط پس از تطبیق با همان چاپ ثبت می‌شود.</p><div class="row"><label for="farPage">شماره صفحه PDF</label><input id="farPage" type="number" min="1" max="200" value="1" style="width:90px;flex:0 0 90px"><button class="btn primary" id="farOpen">نمایش صفحه</button><a class="btn" href="'+OFFICIAL_PORTAL+'">پایگاه رسمی کتاب‌های جدید</a><a class="btn" href="'+PDF+'">PDF منبع کمکی</a></div><div id="farHelp" class="card" style="margin-top:10px"><b>راهنمای صفحه</b><p>صفحه واقعی کتاب در بالا نمایش داده می‌شود. پاسخ تأییدنشده نمایش داده نمی‌شود.</p></div><iframe id="farPdf" title="کتاب فارسی اول دبستان" loading="lazy" style="width:100%;height:65vh;border:1px solid #405574;border-radius:12px;background:#fff;margin-top:10px"></iframe><p class="muted">پایگاه رسمی: <a href="https://chap.oerp.ir/">chap.oerp.ir</a> · پیوند PDF کمکی: <a href="https://www.daneshchi.ir/farsi-1/">صفحه معرفی و دریافت کتاب فارسی اول</a>. فایل PDF در مخزن برنامه کپی نشده است.</p>';
 lib.appendChild(box);
 const input=box.querySelector('#farPage'),frame=box.querySelector('#farPdf');
 function show(){const n=Math.max(1,Math.min(200,Number(input.value)||1));input.value=n;frame.src=PDF+'#page='+n+'&view=FitH';}
 box.querySelector('#farOpen').addEventListener('click',show);input.addEventListener('change',show);show();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();