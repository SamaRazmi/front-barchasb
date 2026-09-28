"use client";
import React, { memo, useState } from "react";
import { useDispatch } from "react-redux";
import { userLogedFalse } from "@/store/slices/logedSlice";
import { setRole } from "@/store/slices/roleSlice";
import { useRouter, usePathname } from "next/navigation";
import { deleteDevice } from "@/api/apiDevices";

interface NavigationItem {
  id: string;
  title: string;
  href: string;
  isActive?: boolean;
}

interface NavigationProps {
  items?: NavigationItem[];
  activeId?: string; // این props دیگر استفاده نمی‌شود، اما برای حفظ ساختار نگه داشته شده
  onItemClick?: (id: string) => void;
}

const tooltips: Record<string, { title: string; desc: string; icon: string }> =
  {
    home: {
      title: "نمای کلی",
      desc: "اطلاعات و نمودارهای مهم شما",
      icon: "📊",
    },
    ads: {
      title: "مرکز آگهی‌ها",
      desc: "آگهی‌های تأییدشده کاربران",
      icon: "📢",
    },
    messages: {
      title: "ارتباطات",
      desc: "پیام‌ها و اعلان‌های جدید",
      icon: "💬",
    },
    projects: {
      title: "فراخوان‌های مناقصه",
      desc: "بستر مشارکت در پروژه‌های کلان دیجیتال و توسعه زیرساخت‌های شبکه — فرصتی برای همکاران متخصص",
      icon: "🏛️",
    },
    myads: {
      title: "مدیریت شخصی",
      desc: "آگهی‌های ثبت‌شده شما",
      icon: "📌",
    },
    billing: {
      title: "حساب و مالی",
      desc: "کیف پول و اشتراک‌ها",
      icon: "💳",
    },
    support: {
      title: "راهنما",
      desc: "پشتیبانی و پاسخ به سوالات",
      icon: "🛟",
    },
    plugins: {
      title: "امکانات جانبی",
      desc: "افزونه‌ها و ابزارهای کاربردی",
      icon: "🧩",
    },
    logout: {
      title: "خروج",
      desc: "خروج امن از حساب کاربری",
      icon: "🚪",
    },
  };

const Navigation: React.FC<NavigationProps> = memo(({ items, activeId }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const defaultItems: NavigationItem[] = [
    { id: "home", title: "میز کار", href: "/dashboard" },
    { id: "ads", title: "آگهی ها", href: "/dashboard/ads" },
    {
      id: "messages",
      title: "پیام‌ها و اعلان‌ها",
      href: "/dashboard/messages",
    },
    {
      id: "projects",
      title: "آگهی های مناقصه ای",
      href: "/dashboard/projects",
    },
    {
      id: "myads",
      title: "آگهی های من",
      href: "/dashboard/myads",
    },
    { id: "billing", title: "اشتراک و مالی", href: "/dashboard/billing" },
    { id: "support", title: "پشتیبانی و راهنما", href: "/dashboard/support" },
    {
      id: "supportTicket",
      title: "پشتیبانی و راهنما",
      href: "/dashboard/support/ticket",
    },
    {
      id: "supportQuestions",
      title: "پشتیبانی و راهنما",
      href: "/dashboard/support/questions",
    },
    { id: "plugins", title: "افزونه ها", href: "/dashboard/plugins" },
    { id: "logout", title: "خروج", href: "/" },
  ];

  const navItems = items && items.length ? items : defaultItems;

  const boxStyle: React.CSSProperties = {
    width: "100%",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    direction: "rtl",
    paddingRight: "10px",
    transition: "background-color 0.3s ease",
  };

  const textStyle: React.CSSProperties = {
    fontWeight: 500,
    fontSize: "16px",
    color: "white",
    textAlign: "right",
  };

  const handleLogout = async () => {
    try {
      const sessionId = localStorage.getItem("sessionId");
      if (sessionId) {
        try {
          await deleteDevice(sessionId);
        } catch (err) {
          console.error("خطا در حذف session:", err);
        }
      }

      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        console.warn("خروج از سیستم با وضعیت ناموفق:", response.status);
      }

      localStorage.removeItem("token");
      localStorage.removeItem("fullName");
      localStorage.removeItem("role");
      localStorage.removeItem("sessionId");

      dispatch(userLogedFalse());
      dispatch(setRole(0));

      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
      localStorage.removeItem("token");
      localStorage.removeItem("sessionId");
      window.location.href = "/";
    }
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    handleLogout();
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  // ===== تشخیص فعال بودن آیتم بر اساس مسیر فعلی (بدون استفاده از activeId) =====
  const isItemActive = (item: NavigationItem): boolean => {
    const currentPath = pathname || "";

    // آیتم خروج هرگز active نمی‌شود
    if (item.id === "logout") return false;

    // برای خانه فقط دقیقاً برابر "/dashboard" باشد
    if (item.id === "home") {
      return currentPath === "/dashboard";
    }

    // برای تمام آیتم‌های دیگر: اگر مسیر فعلی با href آیتم شروع شود، فعال است
    return currentPath.startsWith(item.href);
  };

  return (
    <>
      <nav className="flex flex-col h-full w-full">
        <ul className="flex flex-col justify-between items-center w-full h-full mt-2">
          {navItems
            .filter(
              (item) =>
                item.id !== "supportTicket" && item.id !== "supportQuestions",
            )
            .map((item) => {
              const isActive = isItemActive(item);

              return (
                <li
                  key={item.id}
                  className="w-full flex justify-center group relative"
                >
                  <button
                    onClick={() => {
                      if (item.id === "logout") {
                        setShowLogoutModal(true);
                      } else if (item.href) {
                        router.push(item.href);
                      }
                    }}
                    className="relative transition-colors h-[6.6vh]"
                    style={{
                      ...boxStyle,
                      background: isActive ? "#FFFFFF33" : "#FFFFFF0D",
                    }}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span style={textStyle}>{item.title}</span>

                    {tooltips[item.id] && (
                      <div
                        className="
                          hidden md:flex
                          pointer-events-none
                          absolute right-full mr-4 top-1/2 -translate-y-1/2
                          opacity-0 translate-x-2 scale-95
                          group-hover:opacity-100
                          group-hover:translate-x-0
                          group-hover:scale-100
                          transition-all duration-200 ease-out
                          bg-[#0B1220]/95 backdrop-blur-lg
                          text-white
                          px-4 py-3
                          rounded-2xl
                          shadow-2xl
                          z-[9999]
                          min-w-[220px]
                        "
                      >
                        <div className="flex gap-3 items-start">
                          <span className="text-xl leading-none mt-0.5">
                            {tooltips[item.id].icon}
                          </span>
                          <div className="flex flex-col text-right">
                            <span className="text-sm font-semibold">
                              {tooltips[item.id].title}
                            </span>
                            <span className="text-xs text-gray-300 leading-5">
                              {tooltips[item.id].desc}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </button>
                </li>
              );
            })}
        </ul>
      </nav>

      {showLogoutModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/50 backdrop-blur-sm">
          <div className="bg-[#0F172A] rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 border border-white/10">
            <p className="text-white text-center text-lg font-medium mb-6">
              آیا از خروج مطمئن هستید؟
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={confirmLogout}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-medium"
              >
                بلی
              </button>
              <button
                onClick={cancelLogout}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors font-medium"
              >
                خیر
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

Navigation.displayName = "Navigation";
export default Navigation;
