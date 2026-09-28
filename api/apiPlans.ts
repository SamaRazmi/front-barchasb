"use client";

export interface Plan {
  id: string;
  planType: "basic" | "silver" | "gold";
  durationMonths: 1 | 3 | 6;
  price: number;

  limits: {
    maxAds?: number;
    specialAds?: number;
    ladder?: number;
    tests?: number;
    digitalAds?: number;
    specialDisplay?: number;
  };

  isActive: boolean;
}

// ---------- Subscription related interfaces ----------
export interface SubscriptionUsage {
  maxAdsUsed: number;
  specialAdsUsed: number;
  ladderUsed: number;
  digitalAdsUsed: number;
  testsUsed: number;
  specialDisplayUsed: number;
  id?: string;
}

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

// ---------------- BASE URL (از پروکسی Next.js) ----------------
const BASE_URL = "/api";

// ---------------- FETCH WITH CREDENTIALS (بدون خواندن دستی توکن) ----------------
const fetchWithCredentials = async (url: string, options: any = {}) => {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const contentType = res.headers.get("content-type");
  let data;

  if (contentType && contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    return Promise.reject({
      message: data?.message || data?.error || "خطا در ارتباط با سرور",
    });
  }

  return data;
};

// ---------------- GET PLANS ----------------
export const getPlans = async (): Promise<Plan[]> => {
  const response = await fetch(`${BASE_URL}/plans`, {
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("خطا در دریافت پلن‌ها");
  }

  return response.json();
};

// ---------------- BUY SUBSCRIPTION ----------------
export const buySubscription = async (planId: string) => {
  return fetchWithCredentials(`${BASE_URL}/subscriptions/buy/${planId}`, {
    method: "POST",
  });
};

// ---------------- GET CURRENT USER'S SUBSCRIPTION ----------------
export const getMySubscription = async (): Promise<Subscription> => {
  return fetchWithCredentials(`${BASE_URL}/subscriptions/me`, {
    method: "GET",
  });
};
