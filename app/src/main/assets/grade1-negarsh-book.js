/* راهنمای کتاب نگارش فارسی اول؛ نمایش PDF از منبع بیرونی و توضیح تألیفی */
(function(){
'use strict';
const PDF='https://dl.daneshchi.ir/file/chap-school/Negaresh-1_Daneshchi.iR.pdf';
const known={
 2:{title:'آمادگی برای نوشتن',tasks:[
  {name:'کامل کن',answer:'خط عمودی را از بالا تا خط افقی ادامه بده؛ خط باید صاف و پیوسته باشد.'},
  {name:'کامل کن و رنگ بزن',answer:'خط‌چین حصار را تا انتها دنبال کن و شکل را با رنگ دلخواه کامل کن.'},
  {name:'بنویس',answer:'خط‌های عمودی را مانند نمونه، از بالا به پایین و با فاصله منظم تمرین کن.'}
 ],tip:'مداد را آرام بگیر و فشار زیادی وارد نکن.'}
};
function mount(){
 const lib=document.getElementById('page-library');
 if(!lib||document.getElementById('grade1NegarshBook'))return;
 const box=document.createElement('section');
 box.id='grade1NegarshBook';box.className='panel';
 box.innerHTML='<h3>📖 کتاب واقعی نگارش فارسی اول</h3><p class="muted">صفحهٔ کتاب را مستقیم از فایل PDF باز کن؛ راهنمای حل و توضیح یاسین‌یار زیر آن نمایش داده می‌شود.</p><div class="row"><label for="negPage">شماره صفحه چاپی</label><input id="negPage" type="number" min="1" max="144" value="2" style="width:90px;flex:0 0 90px"><button class="btn primary" id="negOpen">نمایش و حل صفحه</button><a class="btn" href="'+PDF+'" target="_blank" rel="noopener">بازکردن PDF کامل</a></div><div id="negPageHelp" class="card" style="margin-top:10px"></div><iframe id="negPdf" title="کتاب نگارش فارسی اول" loading="lazy" style="width:100%;height:65vh;border:1px solid #405574;border-radius:12px;background:#fff;margin-top:10px"></iframe><p class="muted">منبع کتاب: نسخه PDF منتشرشده در دانشچی. محتوای کتاب در مخزن یاسین‌یار کپی نشده است.</p>';
 lib.appendChild(box);
 const input=box.querySelector('#negPage'),frame=box.querySelector('#negPdf'),help=box.querySelector('#negPageHelp');
 function show(){
  const n=Math.max(1,Math.min(144,Number(input.value)||1));
  input.value=n;
  /* PDF front matter precedes the printed exercise pages; printed page 2 is PDF page 8 (viewer page index 7). */
  const pdfPage=n+6;
  frame.src=PDF+'#page='+pdfPage+'&view=FitH';
  const data=known[n];
  if(data){
   help.innerHTML='<h4>'+data.title+'</h4>'+data.tasks.map((t,i)=>'<div class="listitem"><b>'+ (i+1)+'. '+t.name+'</b><p>'+t.answer+'</p></div>').join('')+'<p class="muted">نکته: '+data.tip+'</p>';
  }else{
   help.innerHTML='<b>راهنمای این صفحه</b><p>صفحهٔ واقعی کتاب در بالا باز شد. برای جلوگیری از پاسخ حدسی، پاسخ تمرین‌های این صفحه تا بررسی دقیق تصویر آن نمایش داده نمی‌شود.</p><p class="muted">شماره صفحه را تغییر بده تا صفحه بعدی کتاب باز شود.</p>';
  }
 }
 box.querySelector('#negOpen').addEventListener('click',show);
 input.addEventListener('change',show);
 show();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
