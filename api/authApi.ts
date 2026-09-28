import { get, post } from "./apiClient";
import { useMutation, useQuery } from "@tanstack/react-query";

// BASE_URL را خالی می‌گذاریم تا درخواست‌ها به پروکسی‌های Next.js بروند
const BASE_URL = "/api";

export interface User {
  id: string;
  name: string;
  lastname: string;
  role: number;
  email?: string | null;
  fullName?: string;
}

// ------ دریافت اطلاعات کاربر جاری (با کوکی) ------
export const fetchUser = async (): Promise<User | null> => {
  try {
    const data = await get<{ user: User }>("/auth/me");
    if (!data.user) return null;
    return {
      ...data.user,
      fullName: `${data.user.name} ${data.user.lastname}`,
    };
  } catch (err) {
    console.error("fetchUser error:", err);
    return null;
  }
};

// ------ انواع داده‌ها ------
export interface LoginCredentials {
  phone: string;
  password: string;
}

export interface RegisterData {
  name: string;
  lastName: string;
  nationalCode: string;
  phone: string;
  birthDate: string;
  gender: string;
  province: string;
  city: string;
  password: string;
}

export interface OtpSendParams {
  phone: string;
  purpose?: "reset" | "register";
}

export interface OtpVerifyParams {
  phone: string;
  code: string;
  purpose?: "reset" | "register";
}

export interface ResetPasswordParams {
  resetToken: string;
  newPassword: string;
}

// ------ Mutation‌ها (همگی با credentials: "include") ------
export const useSendOtp = () => {
  return useMutation({
    mutationFn: async (params: OtpSendParams) => {
      const res = await fetch(`${BASE_URL}/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok || data?.success === false) {
        throw new Error(data?.msg || "خطا در ارسال کد");
      }
      return data;
    },
  });
};

export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: async (params: OtpVerifyParams) => {
      const res = await fetch(`${BASE_URL}/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok || data?.success === false || data?.error) {
        throw new Error(data?.msg || data?.message || "کد اشتباه است");
      }
      return data;
    },
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(credentials),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "خطا در ورود");
      }
      return data;
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async (data: RegisterData) => {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || "خطا در ثبت نام");
      }
      return result;
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (params: ResetPasswordParams) => {
      const res = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok || data?.success === false) {
        throw new Error(data?.msg || "خطا در تغییر رمز عبور");
      }
      return data;
    },
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`${BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "خطا در خروج");
      }
      return data;
    },
  });
};

// ------ کوئری‌های استان و شهر (با credentials: "include") ------
export const useProvinces = () => {
  return useQuery({
    queryKey: ["provinces"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/provinces`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("خطا در دریافت استان‌ها");
      return res.json();
    },
  });
};

export const useCities = (province: string) => {
  return useQuery({
    queryKey: ["cities", province],
    queryFn: async () => {
      if (!province) return [];
      // تغییر آدرس به /cities/{province}
      const res = await fetch(
        `${BASE_URL}/cities/${encodeURIComponent(province)}`,
        {
          credentials: "include",
        },
      );
      if (!res.ok) throw new Error("خطا در دریافت شهرها");
      return res.json();
    },
    enabled: !!province,
  });
};
