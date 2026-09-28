"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { fetchInAppNotifications } from "@/api/apiNotifications";
import { getDevices } from "@/api/apiDevices";
import { getUserAdsStats } from "@/api/apiAdsStatus";
import { useUser } from "@/context/UserContext";

const StatsCard: React.FC = () => {
  const { user } = useUser();

  // ---------- State‌ها ----------
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [deviceCount, setDeviceCount] = useState<number>(0);
  const [totalAll, setTotalAll] = useState<number>(0);
  const [totalApproved, setTotalApproved] = useState<number>(0);

  const totalBadgeCount = unreadCount + deviceCount;

  // ---------- throttle و debounce ----------
  const lastCallTimeRef = useRef<number>(0);
  const THROTTLE_INTERVAL = 5000;
  const debounceRefreshRef = useRef<NodeJS.Timeout | null>(null);

  // ---------- بارگذاری اعلان‌ها ----------
  const loadUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    try {
      const notifications = await fetchInAppNotifications();
      const unread = notifications.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("❌ خطا در دریافت نوتیفیکیشن‌ها:", error);
      setUnreadCount(0);
    }
  }, [user]);

  // ---------- بارگذاری دستگاه‌ها ----------
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

  // ---------- بارگذاری آمار آگهی‌ها (اصلاح شده) ----------
  const loadAdsStats = useCallback(async () => {
    if (!user) {
      setTotalAll(0);
      setTotalApproved(0);
      return;
    }
    try {
      const result = await getUserAdsStats();
      // ساختار پاسخ: { status: 'success', data: { totalAll, totalApproved, breakdown } }
      if (result?.data?.data) {
        const stats = result.data.data;
        setTotalAll(stats.totalAll || 0);
        setTotalApproved(stats.totalApproved || 0);
      } else {
        setTotalAll(0);
        setTotalApproved(0);
      }
    } catch (error) {
      console.error("❌ خطا در دریافت آمار آگهی‌ها:", error);
      setTotalAll(0);
      setTotalApproved(0);
    }
  }, [user]);

  // ---------- تابع ترکیبی ----------
  const refreshData = useCallback(() => {
    const now = Date.now();
    if (now - lastCallTimeRef.current >= THROTTLE_INTERVAL) {
      lastCallTimeRef.current = now;
      loadUnreadCount();
      loadDevices();
      loadAdsStats();
    }
  }, [loadUnreadCount, loadDevices, loadAdsStats]);

  const debouncedRefresh = useCallback(() => {
    if (debounceRefreshRef.current) {
      clearTimeout(debounceRefreshRef.current);
    }
    debounceRefreshRef.current = setTimeout(() => {
      refreshData();
    }, 1000);
  }, [refreshData]);

  // ---------- useEffect ----------
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

  // ---------- رندر ----------
  return (
    <div className="relative w-full h-[95%] flex justify-start my-[1vh]">
      <div className="bg-white rounded-[20px] h-full w-full flex">
        {/* بخش سمت راست: اعلان‌های دریافتی */}
        <div className="flex-1 flex flex-col justify-center items-center relative">
          <p className="text-[20px] font-bold text-[#143A62]">
            {totalBadgeCount}
          </p>
          <p className="text-[15px] font-medium text-[#143A62]">
            اعلان های دریافتی
          </p>
        </div>

        {/* خط جداکننده اول */}
        <div
          className="w-[2px] h-[60%] self-center"
          style={{
            background:
              "linear-gradient(180deg, rgba(20, 58, 98, 0.05) 0%, rgba(20, 58, 98, 0.5) 47.6%, rgba(20, 58, 98, 0.05) 100%)",
          }}
        />

        {/* بخش وسط: آمار ماه جاری */}
        <div className="flex-1 flex flex-col justify-center items-center relative">
          <p className="text-[20px] font-bold text-[#143A62]">{totalAll}</p>
          <p className="text-[15px] font-medium text-[#143A62]">
            آمار ماه جاری
          </p>
        </div>

        {/* خط جداکننده دوم */}
        <div
          className="w-[2px] h-[60%] self-center"
          style={{
            background:
              "linear-gradient(180deg, rgba(20, 58, 98, 0.05) 0%, rgba(20, 58, 98, 0.5) 47.6%, rgba(20, 58, 98, 0.05) 100%)",
          }}
        />

        {/* بخش سمت چپ: آگهی‌های تأییدشده */}
        <div className="flex-1 flex flex-col justify-center items-center relative">
          <p className="text-[20px] font-bold text-[#143A62]">
            {totalApproved}
          </p>
          <p className="text-[15px] font-medium text-[#143A62]">
            آگهی‌های تأییدشده
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
