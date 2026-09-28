// ============================================
// apiEmployer.ts - با پروکسی و فیلترهای هماهنگ
// ============================================

// استفاده از پروکسی Next.js
const BASE_URL = "/api";

export interface EmployerFilters {
  searchText?: string | null; // -> q
  selectedCategory?: string[]; // شناسه‌های دسته‌بندی اصلی (برای فیلتر سلسله‌مراتبی)
  selectedTypeWork?: string[]; // -> cooperationType (با نگاشت فارسی به انگلیسی)
  selectedCities?: string[]; // -> city
  selectedStates?: string[]; // -> state
  selectedTime?: string | null; // -> timeFilter (نگاشت فارسی به انگلیسی)
  isRemote?: boolean; // -> isRemote
  gender?: string; // -> gender
  experience?: string; // -> experience
  page?: number;
  limit?: number;
}

export async function fetchEmployerAds(filters: EmployerFilters = {}) {
  const params = new URLSearchParams();

  // 1. متن جستجو
  if (filters.searchText) params.append("q", filters.searchText);

  // ========== 2. فیلتر دسته‌بندی (سلسله‌مراتبی) ==========
  // ارسال شناسه‌های دسته‌بندی اصلی به بک‌اند
  // بک‌اند خودش همه زیردسته‌ها را پیدا می‌کند
  if (filters.selectedCategory?.length) {
    // ارسال به صورت رشته با کاما (یا می‌توان به صورت آرایه ارسال کرد)
    params.append("selectedCategory", filters.selectedCategory.join(","));
    // همچنین برای سازگاری با نام‌های دیگر
    params.append("categories", filters.selectedCategory.join(","));
  }

  // 3. نوع همکاری (تبدیل فارسی به انگلیسی)
  if (filters.selectedTypeWork?.length) {
    const typeMap: Record<string, string> = {
      "تمام وقت": "full_time",
      "پاره وقت": "part_time",
      دورکاری: "remote",
      کارآموزی: "internship",
    };
    const englishTypes = filters.selectedTypeWork
      .map((label) => typeMap[label])
      .filter(Boolean);
    if (englishTypes.length) {
      params.append("cooperationType", englishTypes.join(","));
    }
  }

  // 4. فیلتر زمانی (نگاشت فارسی به انگلیسی)
  if (filters.selectedTime) {
    const timeMap: Record<string, string> = {
      امروز: "today",
      "این هفته": "thisWeek",
      "این ماه": "thisMonth",
      "سال اخیر": "thisYear",
    };
    const mappedTime = timeMap[filters.selectedTime];
    if (mappedTime) params.append("timeFilter", mappedTime);
  }

  // 5. شهرها
  if (filters.selectedCities?.length) {
    params.append("city", filters.selectedCities.join(","));
  }

  // 6. استان‌ها
  if (filters.selectedStates?.length) {
    params.append("state", filters.selectedStates.join(","));
  }

  // 7. دورکاری
  if (filters.isRemote !== undefined) {
    params.append("isRemote", filters.isRemote ? "true" : "false");
  }

  // 8. جنسیت
  if (filters.gender) {
    params.append("gender", filters.gender);
  }

  // 9. سابقه کار
  if (filters.experience) {
    params.append("experience", filters.experience);
  }

  // 10. صفحه‌بندی
  params.append("page", (filters.page ?? 1).toString());
  params.append("limit", (filters.limit ?? 12).toString());

  // استفاده از مسیر پروکسی (بدون /public)
  const url = `${BASE_URL}/ads/employer?${params.toString()}`;
  console.log("🔍 درخواست آگهی‌های کارفرما:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      credentials: "include", // ارسال کوکی‌ها
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
          (result.total ?? approvedItems.length) / (filters.limit ?? 12),
        ),
    };
  } catch (error) {
    console.error("❌ خطا در دریافت آگهی‌های کارفرما:", error);
    return { data: [], total: 0, page: 1, totalPages: 0 };
  }
}
