// api/apiArticleSummary.ts

import { Article } from "@/types/article";

const BASE_URL = "/api"; // ✅ تغییر به مسیر پروکسی Next.js

/**
 * دریافت خلاصه مقالات
 *
 * توجه: فعلاً این API در سرور پیاده‌سازی نشده است (خطای ۴۰۴).
 * در صورت بروز هرگونه خطا (از جمله ۴۰۴)، به‌جای پرتاب خطا، یک آرایه خالی
 * برگردانده می‌شود تا برنامه با خطا مواجه نشود. پس از پیاده‌سازی API در سرور،
 * این تابع به‌درستی مقالات را دریافت خواهد کرد.
 */
export async function fetchArticlesSummary(): Promise<Article[]> {
  try {
    const res = await fetch(`${BASE_URL}/public/articles/summary`, {
      credentials: "include", // 🟢 کوکی را همراه می‌فرستد
    });

    if (!res.ok) {
      // خطا را لاگ می‌کنیم ولی پرتاب نمی‌کنیم
      console.warn(
        `⚠️ خطا در دریافت مقالات (وضعیت: ${res.status}) - API موجود نیست، آرایه خالی برگردانده شد.`,
      );
      return [];
    }

    const data: Article[] = await res.json();
    return data;
  } catch (error) {
    // خطاهای شبکه یا هر خطای دیگر را لاگ می‌کنیم
    console.warn("⚠️ خطا در دریافت مقالات:", error);
    return []; // برگرداندن آرایه خالی برای جلوگیری از کرش برنامه
  }
}
