"use client";

export type AdType = "EmployerAd" | "JobSeekerAd" | "SellerAd" | "DigitalAd";
export type PaymentMethod = "Wallet" | "Bank_card";
export type LadderOption = "24h" | "72h" | "7d";

export interface CalculateRequest {
  adType: AdType;
  isNewAd: boolean;
  isSpecial: boolean;
  isLadder: boolean;
  ladderOption?: LadderOption;
  isRenewal: boolean;
  paymentMethod: PaymentMethod;
}

export interface CalculateResponse {
  status: "success" | "error";
  data?: {
    baseCost: number;
    specialCost: number;
    ladderCost: number;
    renewalCost: number;
    totalCost: number;
    canAfford: boolean;
    paymentMethod: PaymentMethod;
  };
  message?: string;
}

export interface WalletBalanceResponse {
  status: "success" | "error";
  data?: {
    available: number;
    total: number;
    held: number;
  };
  message?: string;
}

// ✅ تغییر BASE_URL به مسیر پروکسی Next.js
export const BASE_URL = "/api";

// ❌ حذف تابع getToken (دیگر نیازی نیست)

// ==================== API دریافت موجودی کیف پول ====================
export async function getWalletBalance(): Promise<WalletBalanceResponse> {
  try {
    const response = await fetch(`${BASE_URL}/wallet/balance`, {
      method: "GET",
      credentials: "include", // 🟢 کوکی HttpOnly را همراه می‌فرستد
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const responseText = await response.text();

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: responseText };
      }
      return {
        status: "error",
        message: errorData.message || "خطا در دریافت موجودی",
      };
    }

    const result = JSON.parse(responseText);
    return {
      status: "success",
      data: {
        available: result.data?.available || 0,
        total: result.data?.total || 0,
        held: result.data?.held || 0,
      },
    };
  } catch {
    return { status: "error", message: "خطای شبکه" };
  }
}

// ==================== API محاسبه تسویه ====================
export async function calculateCheckout(
  params: CalculateRequest,
): Promise<CalculateResponse> {
  const body: Record<string, any> = {
    adType: params.adType,
    isNewAd: params.isNewAd ?? true,
    isSpecial: params.isSpecial ?? false,
    isLadder: params.isLadder ?? false,
    isRenewal: params.isRenewal ?? false,
    paymentMethod: params.paymentMethod,
  };

  if (params.isLadder && params.ladderOption) {
    body.ladderOption = params.ladderOption;
  }

  const jsonBody = JSON.stringify(body);
  const url = `${BASE_URL}/checkout/calculate`;

  try {
    const response = await fetch(url, {
      method: "POST",
      credentials: "include", // 🟢 کوکی را همراه می‌فرستد
      headers: {
        "Content-Type": "application/json",
      },
      body: jsonBody,
      cache: "no-store",
    });

    const responseText = await response.text();

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: responseText };
      }
      return {
        status: "error",
        message: errorData.message || `خطا در محاسبه (کد ${response.status})`,
      };
    }

    const result = JSON.parse(responseText);
    return {
      status: "success",
      data: result.data,
    };
  } catch {
    return { status: "error", message: "خطای شبکه" };
  }
}

// ==================== API پرداخت با کارت بانکی ====================
export interface CreatePaymentRequest {
  amount: number;
  paymentMethod: PaymentMethod;
  description?: string;
  referenceId?: string;
  referenceType?: string;
  metadata?: any;
}

export interface CreatePaymentResponse {
  status: "success" | "error";
  data?: {
    paymentId: string;
    authority: string;
    paymentUrl: string;
  };
  message?: string;
}

export async function createPayment(
  params: CreatePaymentRequest,
): Promise<CreatePaymentResponse> {
  try {
    const response = await fetch(`${BASE_URL}/payments`, {
      method: "POST",
      credentials: "include", // 🟢 کوکی را همراه می‌فرستد
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    const responseText = await response.text();

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: responseText };
      }
      return {
        status: "error",
        message: errorData.message || "خطا در ایجاد پرداخت",
      };
    }

    const result = JSON.parse(responseText);
    return {
      status: "success",
      data: result.data,
    };
  } catch {
    return { status: "error", message: "خطای شبکه" };
  }
}

// ==================== API پردازش پرداخت آگهی (purchase) ====================
export interface ProcessAdRequest {
  adId: string;
  adType: string;
  isSpecial: boolean;
  isLadder: boolean;
  ladderOption?: LadderOption;
  paymentMethod: PaymentMethod;
}

export interface ProcessAdResponse {
  status: "success" | "error";
  data?: {
    success: boolean;
    message: string;
    transactionId: string;
    paymentUrl: string;
    adId: string;
  };
  message?: string;
}

export async function processAdPayment(
  params: ProcessAdRequest,
): Promise<ProcessAdResponse> {
  try {
    const response = await fetch(`${BASE_URL}/purchase/process-ad`, {
      method: "POST",
      credentials: "include", // 🟢 کوکی را همراه می‌فرستد
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    const responseText = await response.text();

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: responseText };
      }
      return {
        status: "error",
        message: errorData.message || "خطا در پردازش پرداخت",
      };
    }

    const result = JSON.parse(responseText);
    return {
      status: "success",
      data: result.data,
    };
  } catch {
    return { status: "error", message: "خطای شبکه" };
  }
}

// ==================== API خرید افزونه (تمدید/ویژه/پله) ====================
export type EnhancementType = "SPECIAL" | "LADDER" | "RENEWAL";

export interface EnhancementRequest {
  adId: string;
  adType: string;
  enhancementType: EnhancementType;
  ladderSchedule?: string;
  ladderOption?: "now" | "24h" | "72h" | "7d";
  paymentMethod: PaymentMethod;
}

export interface EnhancementResponse {
  status: "success" | "error";
  data?: {
    paymentId: string;
    status: string;
    message: string;
  };
  message?: string;
}

export async function purchaseEnhancement(
  params: EnhancementRequest,
): Promise<EnhancementResponse> {
  try {
    const response = await fetch(`${BASE_URL}/purchase/enhancement`, {
      method: "POST",
      credentials: "include", // 🟢 کوکی را همراه می‌فرستد
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    const responseText = await response.text();

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: responseText };
      }
      return {
        status: "error",
        message: errorData.message || "خطا در خرید افزونه",
      };
    }

    const result = JSON.parse(responseText);
    return {
      status: "success",
      data: result.data,
    };
  } catch {
    return { status: "error", message: "خطای شبکه" };
  }
}
