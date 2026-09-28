// lib/tokenManager.ts
"use client";

const STORAGE_KEY = "token";

/**
 * دریافت توکن از sessionStorage (با پشتیبانی از localStorage برای کاربران قدیمی)
 */
export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;

  // ابتدا از sessionStorage بخوان
  let token = sessionStorage.getItem(STORAGE_KEY);

  // اگر نبود، از localStorage بخوان (برای کاربرانی که قبلاً لاگین کرده‌اند)
  if (!token) {
    token = localStorage.getItem(STORAGE_KEY);
    if (token) {
      // انتقال به sessionStorage و پاک کردن از localStorage
      sessionStorage.setItem(STORAGE_KEY, token);
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  // حذف "Bearer " اگر وجود داشت
  if (token && token.startsWith("Bearer ")) {
    token = token.slice(7);
  }

  return token;
};

/**
 * ذخیره توکن در sessionStorage
 */
export const setToken = (token: string): void => {
  if (typeof window === "undefined") return;
  // حذف "Bearer " اگر وجود داشت
  let cleanToken = token;
  if (cleanToken && cleanToken.startsWith("Bearer ")) {
    cleanToken = cleanToken.slice(7);
  }
  sessionStorage.setItem(STORAGE_KEY, cleanToken);
  // همچنین از localStorage حذف کن تا تداخل نداشته باشد
  localStorage.removeItem(STORAGE_KEY);
};

/**
 * حذف توکن (لاگ‌اوت)
 */
export const removeToken = (): void => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_KEY);
};
