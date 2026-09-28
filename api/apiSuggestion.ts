// api/apiSuggestion.ts

import { get, put } from "@/api/apiClient";

export interface SuggestionItem {
  id: string;
  title: string;
  name?: string;
  adType: "EmployerAd" | "JobSeekerAd" | "SellerAd" | "DigitalAd";
  rating?: number;
  skills?: string[];
  image?: string;
  createdAt: string;
}

export interface SuggestionResponse {
  suggestions: SuggestionItem[];
  used: number;
  remaining: number;
}

// ✅ تابع دریافت پیشنهادات (همان پارامترها و خروجی)
export async function fetchSuggestions(
  search: string,
  count: number,
  adTypes?: string,
): Promise<SuggestionResponse> {
  const params = new URLSearchParams({
    search,
    count: count.toString(),
  });
  if (adTypes) {
    params.append("adTypes", adTypes);
  }

  //console.log("🚀 ارسال درخواست به سرور با آدرس:", `/suggestions?${params}`);
  //console.log("📦 پارامترهای ارسالی:", { search, count, adTypes });

  try {
    // استفاده از get از apiClient
    const data = await get<SuggestionResponse>(`/suggestions?${params}`);
   // console.log(
     // "✅ درخواست موفقیت‌آمیز بود، تعداد پیشنهادات:",
     // data.suggestions?.length,
    //);
    return data;
  } catch (error) {
    console.error("❌ خطا در fetchSuggestions:", error);
    throw error;
  }
}

// ✅ تابع دریافت آمار
export async function getSuggestionStats(): Promise<{
  used: number;
  remaining: number;
  total: number;
}> {
  console.log("📊 دریافت آمار پیشنهادات از:", "/suggestion-stats");
  try {
    const data = await get<{ used: number; remaining: number; total: number }>(
      "/suggestion-stats",
    );
   // console.log("📊 آمار دریافت شد:", data);
    return data;
  } catch (error) {
    console.error("❌ خطا در دریافت آمار:", error);
    throw error;
  }
}

// ✅ تابع دریافت تنظیمات
export async function getSuggestionPreference() {
 // console.log("⚙️ دریافت تنظیمات از:", "/suggestion-preference");
  try {
    const data = await get("/suggestion-preference");
   // console.log("⚙️ تنظیمات دریافت شد:", data);
    return data;
  } catch (error) {
    console.error("❌ خطا در دریافت تنظیمات:", error);
    throw error;
  }
}

// ✅ تابع بروزرسانی تنظیمات (با استفاده از put)
export async function updateSuggestionPreference(data: any) {
  //console.log("✏️ بروزرسانی تنظیمات با داده:", data);
  try {
    const result = await put("/suggestion-preference", data);
    //console.log("✅ تنظیمات بروزرسانی شد:", result);
    return result;
  } catch (error) {
    console.error("❌ خطا در بروزرسانی تنظیمات:", error);
    throw error;
  }
}
