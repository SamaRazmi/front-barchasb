"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Drawer from "@mui/material/Drawer";
import ResMoreOptions from "../ResMoreOptions";
import { useUser } from "@/context/UserContext";
import { fetchInAppNotifications } from "@/api/apiNotifications";
import { getDevices } from "@/api/apiDevices";

interface ResTopBarProps {
  setDrawerOption: (option: string | null) => void;
}

const ResTopBar: React.FC<ResTopBarProps> = ({ setDrawerOption }) => {
  const router = useRouter();
  const [isActive, setIsActive] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // State‌های مربوط به اعلان و دستگاه
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [deviceCount, setDeviceCount] = useState<number>(0);
  const { user } = useUser();

  // برای throttle و debounce
  const lastCallTimeRef = useRef<number>(0);
  const THROTTLE_INTERVAL = 5000;
  const debounceRefreshRef = useRef<NodeJS.Timeout | null>(null);

  // توابع بارگذاری داده
  const loadUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    try {
      const notifications = await fetchInAppNotifications();
      const unread = notifications.filter((n) => !n.isRead);
      setUnreadCount(unread.length);
    } catch (error) {
      console.error("❌ خطا در دریافت نوتیفیکیشن‌ها:", error);
    }
  }, [user]);

  const loadDevices = useCallback(async () => {
    if (!user) {
      setDeviceCount(0);
      return;
    }
    try {
      const res = await getDevices();
      const unreadDevices = res?.unreadCount ?? 0;
      setDeviceCount(unreadDevices);
    } catch (error) {
      console.error("❌ خطا در دریافت دستگاه‌ها:", error);
      setDeviceCount(0);
    }
  }, [user]);

  const totalBadgeCount = unreadCount + deviceCount;

  // throttle
  const throttleRequest = useCallback((callback: () => void) => {
    const now = Date.now();
    if (now - lastCallTimeRef.current >= THROTTLE_INTERVAL) {
      lastCallTimeRef.current = now;
      callback();
    }
  }, []);

  const refreshData = useCallback(() => {
    throttleRequest(() => {
      loadUnreadCount();
      loadDevices();
    });
  }, [throttleRequest, loadUnreadCount, loadDevices]);

  const debouncedRefresh = useCallback(() => {
    if (debounceRefreshRef.current) {
      clearTimeout(debounceRefreshRef.current);
    }
    debounceRefreshRef.current = setTimeout(() => {
      refreshData();
    }, 1000);
  }, [refreshData]);

  // بارگذاری اولیه و گوش دادن به رویدادها
  useEffect(() => {
    refreshData();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        debouncedRefresh();
      }
    };

    const handlePopState = () => {
      debouncedRefresh();
    };

    const handleNotificationRead = () => {
      refreshData();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("notificationRead", handleNotificationRead);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("notificationRead", handleNotificationRead);
      if (debounceRefreshRef.current) {
        clearTimeout(debounceRefreshRef.current);
      }
    };
  }, [refreshData, debouncedRefresh]);

  // وقتی گزینه‌ای در ResMoreOptions کلیک شد
  const handleOptionClick = (option: string) => {
    setDrawerOption(option);
    setDrawerOpen(false);
  };

  return (
    <>
      <div className="flex items-center justify-between w-full px-1 py-2">
        {/* Left Icons */}
        <div className="flex items-center gap-2 order-2">
          {["chatRes.svg", "notoficationRes.svg", "3-dots.svg"].map(
            (icon, idx) => (
              <div
                key={idx}
                className="relative w-[40px] h-[40px] flex items-center justify-center rounded-[16px] bg-white/10 cursor-pointer shadow-sm"
                onClick={() => {
                  if (icon === "3-dots.svg") {
                    setDrawerOpen(true);
                  } else if (icon === "chatRes.svg") {
                    router.push("/dashboard/chat");
                  } else if (icon === "notoficationRes.svg") {
                    router.push("/dashboard/messages?tab=barchasb");
                  }
                }}
              >
                <Image
                  src={`/images/${icon}`}
                  alt={icon}
                  width={icon === "3-dots.svg" ? 5 : 20}
                  height={icon === "3-dots.svg" ? 25 : 20}
                />
                {/* نمایش badge فقط روی آیکون اعلان */}
                {icon === "notoficationRes.svg" && totalBadgeCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 flex items-center justify-center 
                               w-[2.5vh] h-[2.5vh] bg-red-600 text-white text-[1.2vh] font-bold 
                               rounded-full shadow-md"
                  >
                    {totalBadgeCount > 9 ? "9+" : totalBadgeCount}
                  </span>
                )}
              </div>
            ),
          )}
        </div>

        {/* Right Search */}
        <div className="relative flex items-center flex-1 justify-start max-w-[500px] md:max-w-full ml-[3px] order-1 min-w-0 pl-[3px]">
          <div
            className="w-[40px] h-[40px] rounded-[16px] flex items-center justify-center bg-white/10 cursor-pointer z-20 flex-shrink-0 shadow-sm"
            onClick={() => setIsActive(!isActive)}
          >
            <Image
              src="/images/searchRes.svg"
              alt="Search"
              width={20}
              height={20}
            />
          </div>

          <div
            className={`absolute top-0 right-0 h-[40px] flex items-center overflow-hidden transition-all duration-500 ease-in-out ${
              isActive
                ? "w-[calc(100%-10px)] opacity-100 shadow-sm"
                : "w-0 opacity-0"
            }`}
            style={{ zIndex: 10 }}
          >
            <div className="absolute right-0 w-[40px] h-[40px] flex items-center justify-center flex-shrink-0">
              <Image
                src="/images/searchRes.svg"
                alt="Search"
                width={20}
                height={20}
              />
            </div>

            <input
              type="text"
              placeholder="جستجوی آگهی ها، کارفرمایان و ...."
              className="flex-1 h-full bg-white/10 rounded-[16px] pr-[48px] pl-2 text-right text-[16px] font-normal outline-none placeholder-white transition-all duration-500 truncate min-w-0 shadow-sm"
            />
          </div>
        </div>
      </div>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setDrawerOption(null);
        }}
        PaperProps={{ style: { width: "100%" } }}
        ModalProps={{
          keepMounted: true,
        }}
      >
        <ResMoreOptions
          onClose={() => {
            setDrawerOpen(false);
            setDrawerOption(null);
          }}
          onOptionClick={handleOptionClick}
        />
      </Drawer>
    </>
  );
};

export default ResTopBar;
