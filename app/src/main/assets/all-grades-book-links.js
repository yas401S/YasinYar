/* کتابخانه رسمی PDF برای پایه‌های اول تا نهم */
(function(){
'use strict';
const portal='https://chap.sch.ir/';
const grades=[
 {n:1,label:'اول',stage:'ابتدایی',books:'کتاب‌های پایه اول'},
 {n:2,label:'دوم',stage:'ابتدایی',books:'کتاب‌های پایه دوم'},
 {n:3,label:'سوم',stage:'ابتدایی',books:'کتاب‌های پایه سوم'},
 {n:4,label:'چهارم',stage:'ابتدایی',books:'کتاب‌های پایه چهارم'},
 {n:5,label:'پنجم',stage:'ابتدایی',books:'کتاب‌های پایه پنجم'},
 {n:6,label:'ششم',stage:'ابتدایی',books:'کتاب‌های پایه ششم'},
 {n:7,label:'هفتم',stage:'متوسطه اول',books:'کتاب‌های پایه هفتم'},
 {n:8,label:'هشتم',stage:'متوسطه اول',books:'کتاب‌های پایه هشتم'},
 {n:9,label:'نهم',stage:'متوسطه اول',books:'کتاب‌های پایه نهم'}
];
function render(){
 const host=document.getElementById('allGradesBookLinks');if(!host)return;
 host.innerHTML='<div class="section-head"><h3>📥 دریافت کتاب‌های درسی پایه اول تا نهم</h3><small>سال تحصیلی ۱۴۰۵–۱۴۰۶</small></div>'+
 '<div class="notice">لینک زیر به پایگاه رسمی کتاب‌های درسی سازمان پژوهش و برنامه‌ریزی آموزشی می‌رود. برای جلوگیری از لینک اشتباه یا نسخه قدیمی، فایل‌ها از همان پایگاه انتخاب می‌شوند؛ این بخش لینک PDF حدسی تولید نمی‌کند.</div>'+
 '<div class="grid" style="margin-top:10px">'+grades.map(g=>'<article class="card"><div class="course"><div class="course-icon">📘</div><div class="course-info"><b>پایه '+g.label+'</b><small>'+g.stage+' · '+g.books+'</small></div></div><a class="btn primary" style="display:block;text-align:center;text-decoration:none" href="'+portal+'" target="_blank" rel="noopener">دریافت PDF کتاب‌ها ↗</a></article>').join('')+'</div>'+
 '<div class="panel"><b>روش دریافت در سایت رسمی</b><ol class="muted"><li>سال تحصیلی ۱۴۰۵–۱۴۰۶ را انتخاب کن.</li><li>دوره و پایه موردنظر را انتخاب کن.</li><li>نام کتاب را بزن و PDF همان کتاب را باز یا دانلود کن.</li></ol><p class="muted">این پیوند برای هر ۹ پایه به مرجع رسمی مشترک وصل است؛ انتخاب پایه و عنوان کتاب داخل سایت انجام می‌شود.</p><a class="btn primary" style="display:inline-block;text-decoration:none" href="'+portal+'" target="_blank" rel="noopener">ورود به پایگاه رسمی کتاب‌های درسی ↗</a></div>';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else render();
})();