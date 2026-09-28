"use client";

import { ReactNode, useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";

export default function DashboardAuthWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const { user, loading, error } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      // اگر خطای سرور (مثل ۵۰۰) وجود داشته باشد، کاربر را به لاگین نمی‌فرستیم
      if (error) {
        setIsLoading(false);
        return;
      }

      // اگر کاربر وجود نداشته باشد (و خطایی هم نباشد)، به لاگین برو
      if (!user) {
        router.replace("/login");
        return;
      }

      // کاربر وجود دارد
      setIsLoading(false);
    }
  }, [user, loading, error, router]);

  // اگر در حال بارگذاری هستیم
  if (loading || isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <span className="text-gray-700 text-lg font-medium">
            در حال بارگذاری...
          </span>
        </div>
      </div>
    );
  }

  // اگر خطای سرور رخ داده باشد (مثلاً ۵۰۰)
  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        <div className="text-center p-6 bg-white rounded-xl shadow-lg max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            خطا در ارتباط با سرور
          </h2>
          <p className="text-gray-600 mb-4">
            در دریافت اطلاعات کاربر مشکل پیش آمده. لطفاً کمی بعد تلاش کنید.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
