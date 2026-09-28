const BASE_URL = "/api";

interface FetchResult<T = any> {
  data?: T;
  error?: string;
}

let isRedirecting = false;

// ---------- تابع درخواست عمومی (بدون احراز هویت) ----------
const fetchPublic = async <T = any>(
  url: string,
  options: RequestInit = {},
): Promise<FetchResult<T>> => {
  try {
    const res = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const textResponse = await res.text();

    if (!res.ok) {
      let errorMessage = "";
      try {
        const errorJson = JSON.parse(textResponse);
        errorMessage =
          errorJson?.message || errorJson?.error || JSON.stringify(errorJson);
      } catch {
        errorMessage = textResponse || "درخواست ناموفق";
      }
      return { error: errorMessage };
    }

    try {
      const data = JSON.parse(textResponse);
      return { data };
    } catch {
      return { data: textResponse as T };
    }
  } catch (error: any) {
    console.error("❌ fetchPublic error:", error);
    return { error: error.message || "خطای شبکه" };
  }
};

// ---------- تابع درخواست با توکن (نیازمند احراز هویت) ----------
const fetchWithToken = async <T = any>(
  url: string,
  options: RequestInit = {},
): Promise<FetchResult<T>> => {
  try {
    const res = await fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const textResponse = await res.text();

    // ۴۰۱ → هدایت به صفحه ورود (فقط یک بار)
    if (res.status === 401) {
      if (typeof window !== "undefined" && !isRedirecting) {
        isRedirecting = true;
        const currentPath = window.location.pathname + window.location.search;
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
      return { error: "Unauthorized" };
    }

    if (!res.ok) {
      let errorMessage = "";
      try {
        const errorJson = JSON.parse(textResponse);
        errorMessage =
          errorJson?.message || errorJson?.error || JSON.stringify(errorJson);
      } catch {
        errorMessage = textResponse || "درخواست ناموفق";
      }
      return { error: errorMessage };
    }

    try {
      const data = JSON.parse(textResponse);
      return { data };
    } catch {
      return { data: textResponse as T };
    }
  } catch (error: any) {
    console.error("❌ fetchWithToken error:", error);
    return { error: error.message || "خطای شبکه" };
  }
};

// =====================================================
// ========== توابع مربوط به آگهی‌ها ====================
// =====================================================

/**
 * دریافت آگهی‌های عمومی (تأیید شده و معتبر)
 * مسیر: GET /api/ads/all
 * بدون نیاز به احراز هویت
 */
export const getAllAds = async (params: {
  page?: number;
  limit?: number;
  adType?: string[]; // آرایه‌ای از نوع‌های آگهی (مثلاً ['DigitalAd','EmployerAd'])
  category?: string;
  province?: string;
  city?: string;
  search?: string;
  minBudget?: string;
  maxBudget?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", String(params.page));
  if (params.limit) queryParams.append("limit", String(params.limit));
  if (params.adType) queryParams.append("adType", params.adType.join(","));
  if (params.category) queryParams.append("category", params.category);
  if (params.province) queryParams.append("province", params.province);
  if (params.city) queryParams.append("city", params.city);
  if (params.search) queryParams.append("search", params.search);
  if (params.minBudget) queryParams.append("minBudget", params.minBudget);
  if (params.maxBudget) queryParams.append("maxBudget", params.maxBudget);

  const url = `${BASE_URL}/ads/all?${queryParams.toString()}`;
  return fetchPublic(url);
};

/**
 * دریافت آگهی‌های کاربر جاری (و به صورت اختیاری آگهی‌های دیگران)
 * مسیر: GET /api/ads/user
 * نیاز به احراز هویت (توکن در کوکی ارسال می‌شود)
 */
export const getUserAds = async (params: {
  includeOthers?: boolean; // پیش‌فرض false
  page?: number;
  limit?: number;
}) => {
  const queryParams = new URLSearchParams();
  if (params.includeOthers !== undefined)
    queryParams.append("includeOthers", String(params.includeOthers));
  if (params.page) queryParams.append("page", String(params.page));
  if (params.limit) queryParams.append("limit", String(params.limit));

  const url = `${BASE_URL}/ads/user?${queryParams.toString()}`;
  return fetchWithToken(url);
};

/**
 * دریافت آمار تعداد کل و فعال آگهی‌های کاربر جاری (به تفکیک نوع)
 * مسیر: GET /api/ads/user/stats
 * نیاز به احراز هویت
 */
export const getUserAdsStats = async () => {
  const url = `${BASE_URL}/ads/user/stats`;
  return fetchWithToken(url);
};
