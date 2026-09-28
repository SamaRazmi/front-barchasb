// api/apiAdsQueries.ts
"use client";

import { BASE_URL } from "./apiClient";

export interface Ad {
  id: string;
  title: string;
  name: string;
  description: string;
  aboutMe: string;
  priceIRT: string;
  createdAt: string;
  adStatus?: string;
  category?: string;
  cooperationType?: string;
  paymentMethod?: string;
  minSalary?: string;
  maxSalary?: string;
  startTime?: string;
  endTime?: string;
  state?: string;
  skills?: string;
  city?: string;
  gender?: string;
  experience?: string;
  otherFeatures?: string;
  militaryStatus?: string;
  images?: { url: string; isMain?: boolean }[];
  visitStats?: {
    today: number;
    total: number;
    weekly: number[];
    monthly: number[];
  };
}

export interface MarkedAd {
  markId: string;
  adType: "EmployerAd" | "JobSeekerAd" | "SellerAd" | "DigitalAd";
  ad: Ad;
}

export type AdType = "employer" | "seeker" | "seller" | "digital";

// ========== دریافت آگهی‌های کاربر بر اساس نوع ==========
export const fetchUserAds = async (
  userId: string,
  type: AdType,
): Promise<Ad[]> => {
  const typeMap: Record<AdType, string> = {
    employer: "employer",
    seeker: "jobseeker",
    seller: "seller",
    digital: "digital",
  };
  const url = `${BASE_URL}/ads/${typeMap[type]}/owner/${userId}`;
  console.log(`🔍 [fetchUserAds] درخواست به: ${url}`);

  const res = await fetch(url, { credentials: "include" });

  console.log(`🔍 [fetchUserAds] وضعیت پاسخ: ${res.status} ${res.statusText}`);

  if (res.status === 404) {
    console.log(
      `ℹ️ [fetchUserAds] 404 - آگهی‌ای برای کاربر ${userId} یافت نشد`,
    );
    return [];
  }
  if (!res.ok) {
    console.error(
      `❌ [fetchUserAds] خطای HTTP ${res.status} - ${res.statusText}`,
    );
    throw new Error("خطا در دریافت آگهی‌ها");
  }

  const data = await res.json();
  console.log(`🔍 [fetchUserAds] داده‌ی خام پاسخ:`, data);

  let ads: Ad[] = [];
  if (Array.isArray(data)) ads = data;
  else if (Array.isArray(data.ads)) ads = data.ads;
  else if (Array.isArray(data.data)) ads = data.data;

  console.log(`✅ [fetchUserAds] تعداد آگهی‌های دریافت‌شده: ${ads.length}`);
  ads.forEach((ad, index) => {
    console.log(`   📌 [fetchUserAds] آگهی #${index + 1}:`, {
      id: ad.id,
      title: ad.title || ad.name || "(بدون عنوان)",
      images: ad.images?.length
        ? ad.images.map((img) => img.url)
        : "بدون تصویر",
      createdAt: ad.createdAt,
      category: ad.category,
    });
  });

  return ads;
};

// ========== دریافت نشان‌شده‌های کاربر ==========
export const fetchMarkedAds = async (userId: string): Promise<MarkedAd[]> => {
  const url = `${BASE_URL}/marks/${userId}/all`;
  console.log(`🔍 [fetchMarkedAds] درخواست به: ${url}`);
  const res = await fetch(url, { credentials: "include" });
  console.log(`🔍 [fetchMarkedAds] وضعیت: ${res.status}`);
  if (!res.ok) {
    console.error(`❌ [fetchMarkedAds] خطا ${res.status}`);
    throw new Error("خطا در دریافت نشان‌شده‌ها");
  }
  const data = await res.json();
  console.log(`✅ [fetchMarkedAds] تعداد نشان: ${data.marks?.length || 0}`);
  return data.marks || [];
};

// ========== دریافت آمار بازدید یک آگهی ==========
export const fetchAdVisitStats = async (
  adId: string,
  adType: string,
): Promise<{
  today: number;
  total: number;
  weekly: number[];
  monthly: number[];
}> => {
  const url = `${BASE_URL}/ads/${adId}/visit-stats?adType=${adType}`;
  console.log(`🔍 [fetchAdVisitStats] درخواست به: ${url}`);
  const res = await fetch(url, { credentials: "include" });
  console.log(`🔍 [fetchAdVisitStats] وضعیت: ${res.status}`);
  if (!res.ok) {
    console.error(`❌ [fetchAdVisitStats] خطا ${res.status}`);
    throw new Error("خطا در دریافت آمار بازدید");
  }
  const data = await res.json();
  console.log(`✅ [fetchAdVisitStats] آمار دریافت شد:`, data);
  return data;
};

// ========== حذف آگهی ==========
export const deleteAd = async (adId: string, adType: string): Promise<void> => {
  const url = `${BASE_URL}/ads/${adType}/${adId}`;
  console.log(`🗑️ [deleteAd] درخواست به: ${url}`);
  const res = await fetch(url, {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  console.log(`🔍 [deleteAd] وضعیت: ${res.status}`);
  if (!res.ok) {
    const errorText = await res.text();
    console.error(`❌ [deleteAd] خطا ${res.status} - ${errorText}`);
    throw new Error(`خطا ${res.status}: ${errorText}`);
  }
  console.log(`✅ [deleteAd] حذف موفق`);
};

// ========== تمدید آگهی (خرید افزونه) ==========
export interface EnhancementRequest {
  adId: string;
  adType: string;
  enhancementType: "SPECIAL" | "LADDER" | "RENEWAL";
  ladderSchedule?: string;
  ladderOption?: "now" | "24h" | "72h" | "7d";
  paymentMethod: "Wallet" | "Bank_card";
}

export const purchaseEnhancement = async (
  params: EnhancementRequest,
): Promise<any> => {
  const url = `${BASE_URL}/purchase/enhancement`;
  console.log(`💰 [purchaseEnhancement] درخواست به: ${url}`, params);
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  console.log(`🔍 [purchaseEnhancement] وضعیت: ${res.status}`);
  if (!res.ok) {
    const errorText = await res.text();
    console.error(`❌ [purchaseEnhancement] خطا ${res.status} - ${errorText}`);
    throw new Error(`خطا ${res.status}: ${errorText}`);
  }
  const data = await res.json();
  console.log(`✅ [purchaseEnhancement] پاسخ:`, data);
  return data;
};

// ========== نشان‌گذاری/لغو نشان آگهی ==========
export const toggleMarkAd = async (
  adId: string,
  userId: string,
  adType: string,
): Promise<{ marked: boolean }> => {
  const url = `${BASE_URL}/ads/${adId}/mark`;
  console.log(`⭐ [toggleMarkAd] درخواست به: ${url}`, { userId, adType });
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, adType }),
  });
  console.log(`🔍 [toggleMarkAd] وضعیت: ${res.status}`);
  if (!res.ok) {
    console.error(`❌ [toggleMarkAd] خطا ${res.status}`);
    throw new Error("خطا در تغییر نشان");
  }
  const data = await res.json();
  console.log(
    `✅ [toggleMarkAd] نشان ${data.marked ? "افزوده شد" : "برداشته شد"}`,
  );
  return data;
};

// ========== ثبت بازدید آگهی ==========
export const trackAdView = async (
  adId: string,
  adType: string,
): Promise<any> => {
  const url = `${BASE_URL}/ads/${adId}/view`;
  console.log(`👁️ [trackAdView] درخواست به: ${url}`, { adType });
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adType }),
  });
  console.log(`🔍 [trackAdView] وضعیت: ${res.status}`);
  if (!res.ok) {
    console.error(`❌ [trackAdView] خطا ${res.status}`);
    throw new Error("خطا در ثبت بازدید");
  }
  const data = await res.json();
  console.log(`✅ [trackAdView] ثبت بازدید:`, data);
  return data;
};

// ========== توابع جدید برای ویرایش آگهی‌ها ==========

export const fetchJobSeekerAd = async (
  ownerId: string,
  adId: string,
): Promise<any> => {
  const url = `${BASE_URL}/ads/jobseeker/owner/${ownerId}/${adId}`;
  console.log(`🔍 [fetchJobSeekerAd] درخواست به: ${url}`);
  const res = await fetch(url, { credentials: "include" });
  console.log(`🔍 [fetchJobSeekerAd] وضعیت: ${res.status}`);
  if (!res.ok) {
    console.error(`❌ [fetchJobSeekerAd] خطا ${res.status}`);
    throw new Error("خطا در دریافت آگهی");
  }
  const data = await res.json();
  console.log(`✅ [fetchJobSeekerAd] داده‌ی جوینده کار:`, data);
  console.log(
    `   📌 [fetchJobSeekerAd] تصاویر:`,
    data.ad?.images || data.images,
  );
  return data.ad || data;
};

export const updateJobSeekerAd = async (
  ownerId: string,
  adId: string,
  formData: FormData,
): Promise<any> => {
  const url = `${BASE_URL}/ads/jobseeker/${ownerId}/${adId}`;
  console.log(`📤 [updateJobSeekerAd] درخواست به: ${url}`);
  const res = await fetch(url, {
    method: "PUT",
    body: formData,
    credentials: "include",
  });
  console.log(`🔍 [updateJobSeekerAd] وضعیت: ${res.status}`);
  if (!res.ok) {
    const errorText = await res.text();
    console.error(`❌ [updateJobSeekerAd] خطا ${res.status} - ${errorText}`);
    throw new Error(`خطا ${res.status}: ${errorText}`);
  }
  const data = await res.json();
  console.log(`✅ [updateJobSeekerAd] بروزرسانی موفق:`, data);
  return data;
};

export const fetchEmployerAd = async (
  ownerId: string,
  adId: string,
): Promise<any> => {
  // ✅ مسیر اصلاح شد: بدون "owner"
  const url = `${BASE_URL}/ads/employer/${ownerId}/${adId}`;
  console.log(`🔍 [fetchEmployerAd] درخواست به: ${url}`);
  const res = await fetch(url, { credentials: "include" });
  console.log(`🔍 [fetchEmployerAd] وضعیت: ${res.status}`);
  if (!res.ok) {
    console.error(`❌ [fetchEmployerAd] خطا ${res.status} - ${res.statusText}`);
    throw new Error("خطا در دریافت آگهی کارفرما");
  }
  const data = await res.json();
  console.log(`✅ [fetchEmployerAd] داده‌ی کارفرما:`, data);
  console.log(
    `   📌 [fetchEmployerAd] تصاویر:`,
    data.ad?.images || data.images,
  );
  return data.ad || data;
};

export const updateEmployerAd = async (
  ownerId: string,
  adId: string,
  formData: FormData,
): Promise<any> => {
  const url = `${BASE_URL}/ads/employer/${ownerId}/${adId}`;
  console.log(`📤 [updateEmployerAd] درخواست به: ${url}`);
  const res = await fetch(url, {
    method: "PUT",
    body: formData,
    credentials: "include",
  });
  console.log(`🔍 [updateEmployerAd] وضعیت: ${res.status}`);
  if (!res.ok) {
    const errorText = await res.text();
    console.error(`❌ [updateEmployerAd] خطا ${res.status} - ${errorText}`);
    throw new Error(`خطا ${res.status}: ${errorText}`);
  }
  const data = await res.json();
  console.log(`✅ [updateEmployerAd] بروزرسانی موفق:`, data);
  return data;
};

export const fetchSellerAd = async (
  ownerId: string,
  adId: string,
): Promise<any> => {
  const url = `${BASE_URL}/ads/seller/owner/${ownerId}/${adId}`;
  console.log(`🔍 [fetchSellerAd] درخواست به: ${url}`);
  const res = await fetch(url, { credentials: "include" });
  console.log(`🔍 [fetchSellerAd] وضعیت: ${res.status}`);
  if (!res.ok) {
    console.error(`❌ [fetchSellerAd] خطا ${res.status}`);
    throw new Error("خطا در دریافت آگهی فروشنده");
  }
  const data = await res.json();
  console.log(`✅ [fetchSellerAd] داده‌ی فروشنده:`, data);
  return data;
};

export const updateSellerAd = async (
  ownerId: string,
  adId: string,
  formData: FormData,
): Promise<any> => {
  const url = `${BASE_URL}/ads/seller/owner/${ownerId}/${adId}`;
  console.log(`📤 [updateSellerAd] درخواست به: ${url}`);
  const res = await fetch(url, {
    method: "PUT",
    body: formData,
    credentials: "include",
  });
  console.log(`🔍 [updateSellerAd] وضعیت: ${res.status}`);
  if (!res.ok) {
    const errorText = await res.text();
    console.error(`❌ [updateSellerAd] خطا ${res.status} - ${errorText}`);
    throw new Error(`خطا ${res.status}: ${errorText}`);
  }
  const data = await res.json();
  console.log(`✅ [updateSellerAd] بروزرسانی موفق:`, data);
  return data;
};

export const fetchDigitalAd = async (
  ownerId: string,
  adId: string,
): Promise<any> => {
  const url = `${BASE_URL}/ads/digital/owner/${ownerId}/${adId}`;
  console.log(`🔍 [fetchDigitalAd] درخواست به: ${url}`);
  const res = await fetch(url, { credentials: "include" });
  console.log(`🔍 [fetchDigitalAd] وضعیت: ${res.status}`);
  if (!res.ok) {
    console.error(`❌ [fetchDigitalAd] خطا ${res.status}`);
    throw new Error("خطا در دریافت آگهی دیجیتال");
  }
  const data = await res.json();
  console.log(`✅ [fetchDigitalAd] داده‌ی دیجیتال:`, data);
  return data.ad || data;
};

export const updateDigitalAd = async (
  ownerId: string,
  adId: string,
  formData: FormData,
): Promise<any> => {
  const url = `${BASE_URL}/ads/digital/owner/${ownerId}/${adId}`;
  console.log(`📤 [updateDigitalAd] درخواست به: ${url}`);
  const res = await fetch(url, {
    method: "PUT",
    body: formData,
    credentials: "include",
  });
  console.log(`🔍 [updateDigitalAd] وضعیت: ${res.status}`);
  if (!res.ok) {
    const errorText = await res.text();
    console.error(`❌ [updateDigitalAd] خطا ${res.status} - ${errorText}`);
    throw new Error(`خطا ${res.status}: ${errorText}`);
  }
  const data = await res.json();
  console.log(`✅ [updateDigitalAd] بروزرسانی موفق:`, data);
  return data;
};
