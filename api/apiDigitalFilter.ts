// /api/apiDigitalFilter.ts

// استفاده از پروکسی Next.js (هماهنگ با سایر API‌ها)
const BASE_URL = "/api";

export interface DigitalFilters {
  q?: string; // کلمه کلیدی در عنوان/توضیحات
  minBudget?: number; // حداقل بودجه (تومان) - به دلیل ذخیره به صورت String، فعلاً پشتیبانی نمی‌شود
  maxBudget?: number; // حداکثر بودجه (تومان)
  timeFilter?: string; // today, thisWeek, thisMonth, thisYear
  state?: string | string[]; // نام استان (تک یا چندتایی با کاما)
  city?: string | string[]; // نام شهر (تک یا چندتایی با کاما)
  requestType?: "requester" | "provider"; // نوع درخواست
  durationUnit?: "minute" | "hour" | "day" | "month" | "year"; // واحد زمان
  durationAmount?: string; // مقدار زمان (مثلاً "30")
  remote?: boolean; // دورکاری
  page?: number;
  limit?: number;
}

/**
 * دریافت آگهی‌های دیجیتال با فیلترهای سمت سرور
 * @param filters فیلترهای انتخاب‌شده در فرانت‌اند
 * @returns لیست آگهی‌های تأییدشده با صفحه‌بندی
 */
export async function fetchDigitalAds(filters: DigitalFilters = {}) {
  const params = new URLSearchParams();

  // 1. جستجوی متن
  if (filters.q) params.append("q", filters.q);

  // 2. محدوده بودجه (در صورت نیاز، با توجه به اینکه در کنترلر فعلاً غیرفعال است)
  if (filters.minBudget !== undefined && !isNaN(filters.minBudget)) {
    params.append("minBudget", filters.minBudget.toString());
  }
  if (filters.maxBudget !== undefined && !isNaN(filters.maxBudget)) {
    params.append("maxBudget", filters.maxBudget.toString());
  }

  // 3. فیلتر زمانی
  if (filters.timeFilter) params.append("timeFilter", filters.timeFilter);

  // 4. استان (تک یا چندتایی)
  if (filters.state) {
    if (Array.isArray(filters.state)) {
      params.append("state", filters.state.join(","));
    } else {
      params.append("state", filters.state);
    }
  }

  // 5. شهر (تک یا چندتایی)
  if (filters.city) {
    if (Array.isArray(filters.city)) {
      params.append("city", filters.city.join(","));
    } else {
      params.append("city", filters.city);
    }
  }

  // 6. نوع درخواست (درخواست‌دهنده / ارائه‌دهنده)
  if (filters.requestType) {
    params.append("requestType", filters.requestType);
  }

  // 7. واحد زمان (زمان ارائه)
  if (filters.durationUnit) {
    params.append("durationUnit", filters.durationUnit);
  }

  // 8. مقدار زمان
  if (filters.durationAmount) {
    params.append("durationAmount", filters.durationAmount);
  }

  // 9. دورکاری
  if (filters.remote !== undefined) {
    params.append("remote", filters.remote ? "true" : "false");
  }

  // 10. صفحه‌بندی
  params.append("page", (filters.page ?? 1).toString());
  params.append("limit", (filters.limit ?? 9).toString());

  // استفاده از مسیر پروکسی (بدون /public)
  const url = `${BASE_URL}/ads/digital?${params.toString()}`;
  //console.log("🔍 درخواست آگهی‌های دیجیتال:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include", // ارسال کوکی‌ها (در صورت نیاز)
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    // پاسخ استاندارد: { data: [], total, page, totalPages }
    let items: any[] = [];

    if (Array.isArray(result.data)) {
      items = result.data;
    } else if (Array.isArray(result)) {
      items = result;
    } else {
      items = [];
    }

    // (اختیاری) فیلتر مجدد برای اطمینان (بک‌اند فقط approved برمی‌گرداند)
    const approvedItems = items.filter(
      (item: any) => item.adStatus === "approved",
    );

    return {
      data: approvedItems,
      total: result.total ?? approvedItems.length,
      page: result.page ?? filters.page ?? 1,
      totalPages:
        result.totalPages ??
        Math.ceil(
          (result.total ?? approvedItems.length) / (filters.limit ?? 9),
        ),
    };
  } catch (error) {
    console.error("❌ خطا در دریافت آگهی‌های دیجیتال:", error);
    return { data: [], total: 0, page: 1, totalPages: 0 };
  }
}
