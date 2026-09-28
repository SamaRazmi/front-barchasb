// api/apiNotifications.ts

import { get, patch } from "@/api/apiClient";

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

/**
 * دریافت لیست نوتیفیکیشن‌های درون برنامه‌ای
 * در صورت عدم وجود API (۴۰۴) یا هر خطای دیگر، آرایه خالی برمی‌گرداند
 */
export async function fetchInAppNotifications(): Promise<InAppNotification[]> {
  try {
    const data = await get<{ items?: InAppNotification[] }>(
      "/user/notifications/in-app",
    );
    return data.items || [];
  } catch (error: any) {
    // خطا را لاگ می‌کنیم اما آرایه خالی برمی‌گردانیم تا برنامه کرش نکند
    console.warn(
      "⚠️ نوتیفیکیشن در دسترس نیست، آرایه خالی برگردانده شد:",
      error?.message || error,
    );
    return [];
  }
}

/**
 * علامت‌گذاری یک نوتیفیکیشن به عنوان خوانده‌شده
 * در صورت عدم وجود API، عملیات موفق شبیه‌سازی می‌شود
 */
export async function markNotificationAsRead(
  id: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const data = await patch<{ success: boolean; message: string }>(
      `/user/notifications/in-app/${id}/read`,
    );
    return data;
  } catch (error: any) {
    console.warn(
      `⚠️ عملیات mark read برای نوتیفیکیشن ${id} انجام نشد (API موجود نیست)، اما موفق شبیه‌سازی شد.`,
    );
    // شبیه‌سازی موفقیت برای جلوگیری از خطا در برنامه
    return {
      success: true,
      message: "Notification marked as read (simulated)",
    };
  }
}
