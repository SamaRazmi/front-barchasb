"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";

// ---------- تعریف نوع داده کاربر (همان ساختار قبلی) ----------
interface User {
  id: string;
  name: string;
  lastName: string;
  nationalCode: string;
  phone: string;
  birthDate: string;
  gender: string;
  province: string;
  city: string;
  acceptTerms: boolean;
  role: number;
  joinedAt: string;
  phone_confirmed: boolean;
  referralCode: string;
  email?: string;
  email_confirmed?: boolean;
}

// ---------- نوع Context توسعه‌یافته با عکس پروفایل ----------
interface UserContextType {
  user: User | null;
  profileImage: string | null;
  loading: boolean;
  error?: string | null;
  setUser: (user: User | null) => void;
  updateProfileImage: (newImage: string | null) => void;
  fetchProfileImage: (userId: string) => Promise<void>;
}

// ---------- ایجاد Context ----------
const UserContext = createContext<UserContextType | undefined>(undefined);

// ---------- Provider ----------
export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  // ---------- تابع جایگزینی آدرس تصویر (مشابه کد قبلی) ----------
  const replaceImageUrl = useCallback(
    (url: string | null | undefined): string | null => {
      if (!url) return null;
      const oldDomains = [
        "https://barchasb-data.storage.c2.liara.site",
        "https://barchasb-data.storage.c2.liara.space",
      ];
      const newBase = "https://barchasb-admin-server.ir";
      for (const oldDomain of oldDomains) {
        if (url.startsWith(oldDomain)) {
          return url.replace(oldDomain, newBase);
        }
      }
      return url;
    },
    [],
  );

  // ---------- واکشی عکس پروفایل (فقط یک بار پس از لاگین) ----------
  const fetchProfileImage = useCallback(
    async (userId: string) => {
      if (!userId) return;
      try {
        const res = await fetch(`/api/profile?userId=${userId}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.profile?.profileImage) {
          const newUrl = replaceImageUrl(data.profile.profileImage);
          setProfileImage(newUrl);
        } else {
          setProfileImage(null);
        }
      } catch (err) {
        console.error("❌ خطا در دریافت عکس پروفایل:", err);
        setProfileImage(null);
      }
    },
    [replaceImageUrl],
  );

  // ---------- به‌روزرسانی دستی عکس (پس از ویرایش) ----------
  const updateProfileImage = useCallback(
    (newImage: string | null) => {
      setProfileImage(newImage ? replaceImageUrl(newImage) : null);
    },
    [replaceImageUrl],
  );

  // ---------- واکشی اطلاعات کاربر (همان کد قبلی) ----------
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (!res.ok) {
          console.warn(`⚠️ دریافت کاربر ناموفق با وضعیت: ${res.status}`);
          setUser(null);
          setError(`خطا در دریافت کاربر: ${res.status}`);
          return;
        }
        const data = await res.json();
        setUser(data || null);
        setError(null);
      } catch (err) {
        console.error("❌ خطا در گرفتن کاربر:", err);
        setUser(null);
        setError("خطا در ارتباط با سرور");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // ---------- هرگاه کاربر تغییر کند، عکس را واکشی یا پاک کن ----------
  useEffect(() => {
    if (user?.id) {
      fetchProfileImage(user.id);
    } else {
      setProfileImage(null);
    }
  }, [user?.id, fetchProfileImage]);

  // ---------- مقدار Context را کش می‌کنیم تا از رندرهای اضافی جلوگیری شود ----------
  const contextValue = useMemo(
    () => ({
      user,
      profileImage,
      loading,
      error,
      setUser,
      updateProfileImage,
      fetchProfileImage,
    }),
    [user, profileImage, loading, error, updateProfileImage, fetchProfileImage],
  );

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

// ---------- Hook سفارشی برای دسترسی به Context ----------
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
