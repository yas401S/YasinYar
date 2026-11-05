const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (url.pathname === "/") return json({ service: "YasinYar AI Tutor", ready: Boolean(env.OPENAI_API_KEY), endpoint: "/solve" });
    if (!["/solve", "/lesson"].includes(url.pathname) || request.method !== "POST") return json({ error: "مسیر یا روش درخواست معتبر نیست." }, 404);
    if (!env.OPENAI_API_KEY) return json({ error: "کلید هوش مصنوعی روی سرور تنظیم نشده است." }, 503);

    let body;
    try {
      const raw = await request.text();
      if (raw.length > 12000) return json({ error: "متن سؤال بیش از اندازه طولانی است." }, 413);
      body = JSON.parse(raw);
    } catch {
      return json({ error: "داده ارسالی معتبر نیست." }, 400);
    }

    if (url.pathname === "/lesson") {
      const grade = Math.max(1, Math.min(9, Number(body.grade) || 6));
      const subject = String(body.subject || "سایر").slice(0, 60);
      const topic = String(body.topic || "مفاهیم اصلی درس").slice(0, 300);
      const sourceText = String(body.sourceText || "").trim();
      if (sourceText.length > 9000) return json({ error: "متن درس بیش از اندازه طولانی است؛ لطفاً بخش کوتاه‌تری بفرست." }, 413);
      const lessonInstructions = [
        "تو آموزگار حرفه‌ای و مهربان برای دانش‌آموز فارسی‌زبان پایه‌های اول تا نهم هستی.",
        "به فارسی روان، دقیق و متناسب با سن دانش‌آموز توضیح بده؛ اصطلاح دشوار را همان‌جا ساده تعریف کن.",
        "پایه: " + grade + "؛ درس: " + subject + "؛ موضوع انتخاب‌شده: " + topic + ".",
        sourceText
          ? "متن زیر از سوی دانش‌آموز ارائه شده است. خلاصه و توضیح را بر پایه همین متن بنویس؛ اگر بخشی در متن نیست، آن را به کتاب نسبت نده و مشخص کن که توضیح تکمیلی خودت است."
          : "متن دقیق کتاب درسی در اختیار تو نیست. یک آموزش مفهومی و قابل فهم درباره موضوع انتخاب‌شده ارائه کن؛ وانمود نکن که متن یا فصل دقیق کتاب رسمی را دیده‌ای و شماره صفحه یا نقل‌قول نساز.",
        "درس‌نامه باید واقعاً آموزنده و قابل استفاده باشد، نه چند جمله کلی. پاسخ را با این ترتیب بساز: ۱) عنوان و هدف‌های یادگیری روشن، ۲) پیش‌نیازهای لازم، ۳) خلاصه کوتاه، ۴) آموزش مفهومی قدم‌به‌قدم با تیترهای کوتاه، ۵) دست‌کم دو مثال حل‌شده یا نمونه تحلیل‌شده، ۶) کاربرد در زندگی روزمره، ۷) واژه‌ها و نکته‌های کلیدی، ۸) اشتباه‌های رایج و راه جلوگیری از آن‌ها، ۹) جمع‌بندی و چک‌لیست مرور، ۱۰) پنج پرسش خودآزمایی از آسان تا چالشی همراه پاسخ تشریحی.",
        "هر هدف یادگیری را با فعل قابل سنجش بنویس؛ مثل تعریف کند، مقایسه کند، حل کند یا توضیح دهد. بین آموزش و پرسش‌ها ارتباط مستقیم برقرار کن.",
        "برای ریاضی، همه محاسبات را دوباره کنترل کن، راه‌حل را مرحله‌به‌مرحله بنویس و پاسخ را با روش دوم یا جایگذاری بررسی کن؛ واحدها و نمادها را درست به‌کار ببر.",
        "برای علوم، واقعیت علمی را از فرضیه و مثال جدا کن؛ علت و معلول، مشاهده، آزمایش منصفانه، متغیرها و نتیجه‌گیری را متناسب با موضوع روشن کن. مثال نادرست یا ساده‌سازی گمراه‌کننده نساز.",
        "برای فارسی، تفاوت معنی واژه، مفهوم متن، پیام، دستور و آرایه را روشن کن و برای هرکدام مثال تازه و درست بساز؛ شعر یا متن دارای حق نشر را طولانی نقل نکن.",
        "برای مطالعات اجتماعی و دینی، میان واقعیت تاریخی/جغرافیایی، تحلیل و ارزش اخلاقی تفاوت بگذار؛ از نسبت دادن جمله یا حکم به کتاب، آیه یا منبعی که در ورودی نیست خودداری کن.",
        "برای عربی و انگلیسی، واژگان را با ترجمه دقیق، تلفظ راهنما در صورت اطمینان، ساختار جمله و مثال درست آموزش بده؛ ترجمه تحت‌اللفظی گمراه‌کننده را توضیح بده.",
        "سطح دشواری، طول جمله‌ها و مثال‌ها را با پایه دانش‌آموز تنظیم کن. اصطلاح تخصصی را همان‌جا تعریف کن و از توضیح بزرگسالانه برای پایه‌های پایین بپرهیز.",
        "پرسش‌های خودآزمایی باید پاسخ روشن و یکتا داشته باشند؛ دست‌کم یک پرسش کاربردی و یک پرسش نیازمند توضیح دلیل داشته باشند. پاسخ هر پرسش را پس از آن بیاور.",
        "اگر متن منبع ارائه شده، فقط ادعاهای منطبق با آن را به کتاب نسبت بده و مطالب تکمیلی را با برچسب «توضیح تکمیلی» مشخص کن. اگر متن منبع ارائه نشده، بالای درس‌نامه بنویس «آموزش مفهومی تألیفی؛ هنوز با متن چاپ جاری کتاب تطبیق نشده است».",
        "اگر موضوع مبهم یا بیش از حد کلی است، ابتدا محدودیت را صادقانه بیان کن، از ساختن شماره فصل/صفحه/عنوان رسمی خودداری کن و آموزش را فقط در محدوده دانسته‌های معتبر نگه دار."
      ].join("\n");
      const lessonInput = sourceText
        ? "متن درس برای خلاصه و آموزش:\n" + sourceText
        : "لطفاً موضوع را به زبان ساده آموزش بده: " + topic;
      try {
        const upstream = await fetch("https://api.openai.com/v1/responses", {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + env.OPENAI_API_KEY,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: env.OPENAI_MODEL || "gpt-5.4-mini",
            instructions: lessonInstructions,
            input: lessonInput,
            max_output_tokens: 2200,
            store: false
          })
        });
        const result = await upstream.json();
        if (!upstream.ok) {
          const message = result?.error?.message || "ساخت درس‌نامه هوشمند ناموفق بود.";
          return json({ error: message }, upstream.status === 429 ? 429 : 502);
        }
        const answer = (result.output || [])
          .filter(item => item.type === "message")
          .flatMap(item => item.content || [])
          .filter(item => item.type === "output_text")
          .map(item => item.text)
          .join("\n").trim();
        if (!answer) return json({ error: "درس‌نامه متنی از سرویس دریافت نشد." }, 502);
        return json({ answer, model: result.model || env.OPENAI_MODEL || "gpt-5.4-mini" });
      } catch {
        return json({ error: "اتصال سرور به سرویس هوشمند برقرار نشد." }, 502);
      }
    }

    const question = String(body.question || "").trim();
    const grade = Math.max(1, Math.min(9, Number(body.grade) || 6));
    const subject = String(body.subject || "سایر").slice(0, 40);
    if (question.length < 3) return json({ error: "متن سؤال خیلی کوتاه است." }, 400);
    if (question.length > 8000) return json({ error: "متن سؤال بیش از حد طولانی است." }, 413);

    const instructions = [
      "تو معلم خصوصی مهربان و دقیق برای دانش‌آموزان فارسی‌زبان پایه‌های اول تا نهم هستی.",
      "فقط به زبان فارسی روان و متناسب با سن دانش‌آموز پاسخ بده.",
      "درس و پایه: " + subject + "، پایه " + grade + ".",
      "صورت سؤال را اول کوتاه و دقیق بازگو کن؛ سپس اطلاعات داده‌شده و خواسته سؤال را مشخص کن.",
      "حل را مرحله‌به‌مرحله و با توضیح دلیل هر مرحله بنویس. در پایان پاسخ نهایی را جداگانه مشخص کن.",
      "اگر سؤال ناقص، ناخوانا، مبهم یا دارای چند برداشت است، حدس نزن؛ دقیقاً بگو کدام بخش باید روشن شود.",
      "اگر مسئله ریاضی است، محاسبات را کنترل کن و واحدها را بنویس. اگر سؤال علمی یا درسی است، دلیل پاسخ را در سطح همین پایه توضیح بده.",
      "اگر از متن OCR نشانه‌ای از اشتباه در عددها یا نمادها می‌بینی، قبل از حل هشدار بده و برداشت خود را مشخص کن.",
      "از ساختن منبع، شماره صفحه یا نقل‌قول جعلی خودداری کن. پاسخ آموزشی بده و ادعای قطعیت بی‌جا نکن."
    ].join("\n");

    try {
      const upstream = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + env.OPENAI_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: env.OPENAI_MODEL || "gpt-5.4-mini",
          instructions,
          input: question,
          max_output_tokens: 1400,
          store: false
        })
      });
      const result = await upstream.json();
      if (!upstream.ok) {
        const message = result?.error?.message || "ارتباط با سرویس هوش مصنوعی ناموفق بود.";
        return json({ error: message }, upstream.status === 429 ? 429 : 502);
      }
      const answer = (result.output || [])
        .filter(item => item.type === "message")
        .flatMap(item => item.content || [])
        .filter(item => item.type === "output_text")
        .map(item => item.text)
        .join("\n").trim();
      if (!answer) return json({ error: "پاسخ متنی از سرویس دریافت نشد." }, 502);
      return json({ answer, model: result.model || env.OPENAI_MODEL || "gpt-5.4-mini" });
    } catch {
      return json({ error: "اتصال سرور به سرویس هوش مصنوعی برقرار نشد." }, 502);
    }
  }
};
