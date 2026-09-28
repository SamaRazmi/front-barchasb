const BASE_URL = "/api";

interface FetchResult<T = any> {
  data?: T;
  error?: string;
}

let isRedirecting = false;
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

    // 🚨 ۴۰۱ → فقط یک بار هدایت کن
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

// ========== توابع عمومی ==========
export const trackAdView = async (adId: string, adType: string) => {
  const res = await fetch(`${BASE_URL}/track-view`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ adId, adType }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.message || error?.error || "Failed to track view");
  }
  return res.json();
};

export const getUserViewStats = async (
  period: "weekly" | "monthly" = "weekly",
  adType: string = "all",
) => {
  return fetchWithToken(
    `${BASE_URL}/user-views?period=${period}&adType=${adType}`,
  );
};

export const getAdViewStats = async (
  adId: string,
  adType: string,
  period: "weekly" | "monthly" = "weekly",
) => {
  return fetchWithToken(
    `${BASE_URL}/ad-views/${adId}?adType=${adType}&period=${period}`,
  );
};

export const getAdViewSummaryStats = async (adId: string, adType: string) => {
  return fetchWithToken(
    `${BASE_URL}/ad-view-summary/${adId}?adType=${adType}&adId=${adId}`,
  );
};
