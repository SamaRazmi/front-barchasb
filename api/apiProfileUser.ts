"use client";

// ======================== BASE URL (از پروکسی Next.js) ========================
const BASE_URL = "/api";

// ======================== TYPES ========================
export interface PlanSnapshot {
  limits: {
    maxAds: number;
    ladder: number;
    digitalAds: number;
    tests: number;
    specialDisplay: number;
    specialAds: number;
  };
  planType: string;
  durationMonths: number;
  price: number;
  id: string;
}

export interface SubscriptionUsage {
  maxAdsUsed: number;
  specialAdsUsed: number;
  ladderUsed: number;
  digitalAdsUsed: number;
  testsUsed: number;
  specialDisplayUsed: number;
  id?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  planSnapshot: PlanSnapshot;
  startDate: string;
  endDate: string;
  usage: SubscriptionUsage;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

// ======================== GET PROFILE ========================
export const getProfile = async (userId?: string) => {
  const url = userId
    ? `${BASE_URL}/profile?userId=${userId}`
    : `${BASE_URL}/profile`;
  console.log("🔵 getProfile called with userId:", userId || "از توکن");
  console.log("🔵 URL:", url);

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  const result = await res.json();
  console.log("📥 PROFILE RECEIVED:", result);

  if (!res.ok) {
    throw new Error(
      result?.msg || result?.message || "Failed to fetch profile",
    );
  }

  return result;
};

// ======================== UPDATE PROFILE ========================
export const updateProfile = async (
  userId: string,
  userData: any = {},
  profileData: any = {},
) => {
  // console.log("🔵 updateProfile called with userId:", userId);
  // console.log("🔵 Sending to:", `${BASE_URL}/profile`);
  //console.log("🔵 Data:", { userId, userData, profileData });

  const res = await fetch(`${BASE_URL}/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      userId,
      user: userData,
      profile: profileData,
    }),
  });

  const result = await res.json();
  //console.log("🚀 PROFILE UPDATED:", result);

  if (!res.ok) {
    throw new Error(
      result?.msg || result?.message || "Failed to update profile",
    );
  }

  return result;
};

// ======================== UPLOAD PROFILE PHOTO ========================
export const uploadProfilePhoto = async (userId: string, file: File) => {
  //console.log("🔵 uploadProfilePhoto called with userId:", userId);
  const formData = new FormData();
  formData.append("profileImage", file);
  formData.append("userId", userId);

  const res = await fetch(`${BASE_URL}/profile/upload-photo`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  const result = await res.json();
  //console.log("📸 PROFILE PHOTO UPLOADED:", result);

  if (!res.ok) {
    throw new Error(
      result?.msg || result?.message || "Failed to upload profile photo",
    );
  }

  return result;
};

// ======================== GET MY SUBSCRIPTION ========================
export const getMySubscription = async (): Promise<Subscription> => {
  //console.log("🔵 getMySubscription called");
  const res = await fetch(`${BASE_URL}/subscriptions/me`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || data?.error || "خطا در دریافت اشتراک");
  }

  return res.json();
};

// ======================== SEND VERIFY EMAIL ========================
export const sendVerifyEmail = async (userId: string, email: string) => {
  //console.log("🔵 sendVerifyEmail called with userId:", userId);
  const res = await fetch(`${BASE_URL}/send-verify-email/${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email }),
  });

  const data = await res.json();
  if (!res.ok)
    throw new Error(data?.msg || data?.message || "خطا در ارسال ایمیل");

  return data;
};

// ======================== VERIFY EMAIL BY CODE ========================
export const verifyEmailByCode = async (code: string, userId: string) => {
  // console.log("🔵 verifyEmailByCode called with userId:", userId);
  const res = await fetch(`${BASE_URL}/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ code, userId }),
  });

  const data = await res.json();
  if (!res.ok)
    throw new Error(data?.msg || data?.message || "کد تایید نامعتبر است");

  return data;
};
