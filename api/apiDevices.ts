"use client";

const BASE_URL = "/api";

// 🚀 fetch با ارسال کوکی
const fetchWithCredentials = async (url: string, options: RequestInit = {}) => {
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
      errorMessage = textResponse;
    }
    if (res.status === 401) {
      throw new Error("Unauthorized: توکن نامعتبر یا منقضی شده");
    }
    if (res.status === 404) {
      throw new Error("NotFound: مسیر مورد نظر یافت نشد");
    }
    throw new Error(errorMessage || "درخواست ناموفق");
  }
  try {
    return JSON.parse(textResponse);
  } catch {
    return textResponse;
  }
};

// ========== تایپ‌ها ==========
export interface DeviceSession {
  id: string;
  deviceInfo?: {
    deviceType: string;
    browser: string;
    ip: string;
    userAgent?: string;
  };
  deviceType?: string;
  browser?: string;
  ip?: string;
  lastActiveAt: string;
  createdAt: string;
  isActive: boolean;
  isRead?: boolean;
}

// ========== API‌ها ==========
export const getDevices = async (): Promise<{
  sessions: DeviceSession[];
  unreadCount: number;
}> => {
  try {
    const result = await fetchWithCredentials(`${BASE_URL}/sessions`, {
      method: "GET",
    });
   // console.log("✅ getDevices response:", result);

    // استخراج sessions از ساختارهای مختلف پاسخ
    let sessions: DeviceSession[] = [];
    let unreadCount = 0;

    if (Array.isArray(result)) {
      // اگر پاسخ مستقیم آرایه باشد
      sessions = result;
    } else if (result?.sessions && Array.isArray(result.sessions)) {
      // اگر پاسخ { sessions: [...] } باشد
      sessions = result.sessions;
      unreadCount = result.unreadCount || 0;
    } else if (result?.data?.sessions && Array.isArray(result.data.sessions)) {
      // اگر پاسخ { data: { sessions: [...] } } باشد
      sessions = result.data.sessions;
      unreadCount = result.data.unreadCount || 0;
    } else if (result?.data && Array.isArray(result.data)) {
      // اگر پاسخ { data: [...] } باشد
      sessions = result.data;
    }

   // console.log(`📱 تعداد دستگاه‌های دریافت شده: ${sessions.length}`);
    return { sessions, unreadCount };
  } catch (error: any) {
    console.error("❌ getDevices error:", error.message);
    return { sessions: [], unreadCount: 0 };
  }
};

export const deleteDevice = async (sessionId: string) => {
  return fetchWithCredentials(`${BASE_URL}/sessions/${sessionId}`, {
    method: "DELETE",
  });
};

export const logoutAllDevices = async () => {
  return fetchWithCredentials(`${BASE_URL}/sessions/logout-all`, {
    method: "POST",
  });
};

export const markSessionAsRead = async (sessionId: string) => {
  return fetchWithCredentials(`${BASE_URL}/sessions/${sessionId}/read`, {
    method: "PATCH",
  });
};
