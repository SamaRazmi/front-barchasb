// api/apiWallet.ts
"use client";

// ---------- Types for Wallet Transactions ----------
export interface WalletTransaction {
  id: string;
  type: "deposit" | "withdraw";
  amount: number;
  status: "success" | "pending" | "failed";
  refId: string;
  description: string;
  persianCreatedAt: string;
  persianUpdatedAt: string;
}

export interface WalletTransactionsResponse {
  items: WalletTransaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ---------- Types for Subscription ----------
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

// ---------- BASE_URL (مشابه نمونه) ----------
const BASE_URL = "/api";

// ---------- FETCH WITH CREDENTIALS (ارسال کوکی و توکن) ----------
const fetchWithCredentials = async (url: string, options: any = {}) => {
  // دریافت توکن از localStorage (اگر ذخیره شده باشد)
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const res = await fetch(url, {
    ...options,
    credentials: "include", // ارسال کوکی
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
    // اگر خطای ۴۰۱ بود، می‌توانید کاربر را به لاگین هدایت کنید
    if (res.status === 401) {
      if (typeof window !== "undefined") {
        // هدایت به صفحه لاگین (اختیاری)
        // window.location.href = "/login";
      }
    }
    return Promise.reject({
      status: res.status,
      message: data?.message || data?.error || "خطا در ارتباط با سرور",
    });
  }

  return data;
};

// ---------------- GET WALLET BALANCE ----------------
export const getWalletBalance = async (): Promise<{ balance: number }> => {
  const result = await fetchWithCredentials(`${BASE_URL}/wallet/balance`, {
    method: "GET",
  });

  const available = result?.data?.available ?? 0;
  return { balance: available };
};

// ---------------- GET WALLET TRANSACTIONS ----------------
export const getWalletTransactions = async (
  page: number = 1,
  limit: number = 20,
): Promise<WalletTransactionsResponse> => {
  const url = `${BASE_URL}/wallet/transactions?page=${page}&limit=${limit}`;
  return fetchWithCredentials(url, {
    method: "GET",
  });
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

// ---------- DEPOSIT WALLET ----------
export const depositWallet = async (
  amount: number,
): Promise<{
  paymentId: string;
  paymentUrl: string;
  authority: string;
}> => {
  const result = await fetchWithCredentials(`${BASE_URL}/wallet/deposit`, {
    method: "POST",
    body: JSON.stringify({ amount }),
  });

  const data = result?.data;
  if (!data || !data.paymentUrl) {
    throw new Error("پاسخ نامعتبر از سرور");
  }
  return data;
};

// صادرات پیش‌فرض (در صورت نیاز)
export default depositWallet;
