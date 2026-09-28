// Home.tsx
import { Swiper, SwiperSlide } from "swiper/react";
import SidePanelWithProvider from "../../../../../pages/Home/__components/Desk/SidePanel";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import CircleProgress from "../../Desk/CircleProgress";
import BarChart from "../../Desk/BarChart";
import { useEffect, useState, useRef, useCallback } from "react";
import { fetchInAppNotifications } from "@/api/apiNotifications";
import { getDevices } from "@/api/apiDevices";
import { getUserAdsStats } from "@/api/apiAdsStatus";
import { useUser } from "@/context/UserContext";

const Home = () => {
  const { user } = useUser();

  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [deviceCount, setDeviceCount] = useState<number>(0);
  const [totalAll, setTotalAll] = useState<number>(0);
  const [totalApproved, setTotalApproved] = useState<number>(0);

  const totalBadgeCount = unreadCount + deviceCount;

  const lastCallTimeRef = useRef<number>(0);
  const THROTTLE_INTERVAL = 5000;
  const debounceRefreshRef = useRef<NodeJS.Timeout | null>(null);

  const loadUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    try {
      const notifications = await fetchInAppNotifications();
      const unread = notifications.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch {
      setUnreadCount(0);
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
    } catch {
      setDeviceCount(0);
    }
  }, [user]);

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
    } catch {
      setTotalAll(0);
      setTotalApproved(0);
    }
  }, [user]);

  const refreshDataThrottled = useCallback(() => {
    const now = Date.now();
    if (now - lastCallTimeRef.current >= THROTTLE_INTERVAL) {
      lastCallTimeRef.current = now;
      loadUnreadCount();
      loadDevices();
      loadAdsStats();
    }
  }, [loadUnreadCount, loadDevices, loadAdsStats]);

  const debouncedRefresh = useCallback(() => {
    if (debounceRefreshRef.current) clearTimeout(debounceRefreshRef.current);
    debounceRefreshRef.current = setTimeout(refreshDataThrottled, 1000);
  }, [refreshDataThrottled]);

  // بارگذاری اولیه و هنگام تغییر user (بدون throttle)
  useEffect(() => {
    loadUnreadCount();
    loadDevices();
    loadAdsStats();
  }, [user, loadUnreadCount, loadDevices, loadAdsStats]);

  // رویدادهای visibilitychange و popstate (با throttle)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") debouncedRefresh();
    };
    const handlePopState = () => debouncedRefresh();
    const handleNotificationRead = () => refreshDataThrottled();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("notificationRead", handleNotificationRead);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("notificationRead", handleNotificationRead);
      if (debounceRefreshRef.current) clearTimeout(debounceRefreshRef.current);
    };
  }, [debouncedRefresh, refreshDataThrottled]);

  return (
    <div className="relative flex-1 h-full">
      <Swiper
        modules={[Pagination]}
        pagination={{ clickable: true }}
        spaceBetween={20}
        slidesPerView={1}
        className="h-full"
      >
        <SwiperSlide>
          <div className="h-[95%] flex items-center justify-center text-xl">
            <SidePanelWithProvider />
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="block md:hidden h-full">
            <div className="flex flex-col h-full p-3 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg shadow-sm flex flex-col items-center justify-center py-5 px-2 text-center">
                  <p className="text-[20px] font-bold text-[#143A62]">
                    {totalBadgeCount}
                  </p>
                  <p className="text-[15px] font-medium text-[#143A62]">
                    اعلان های دریافتی
                  </p>
                </div>
                <div className="rounded-lg overflow-hidden shadow-sm">
                  <CircleProgress />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg shadow-sm flex flex-col items-center justify-center py-5 px-2 text-center">
                  <p className="text-[20px] font-bold text-[#143A62]">
                    {totalAll}
                  </p>
                  <p className="text-[15px] font-medium text-[#143A62]">
                    آمار ماه جاری
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm flex flex-col items-center justify-center py-5 px-2 text-center">
                  <p className="text-[20px] font-bold text-[#143A62]">
                    {totalApproved}
                  </p>
                  <p className="text-[15px] font-medium text-[#143A62]">
                    آگهی‌های تأییدشده
                  </p>
                </div>
              </div>

              <div className="flex-1 min-h-0">
                <BarChart />
              </div>
            </div>
          </div>

          <div className="hidden md:block h-full flex items-center justify-center text-xl">
            Slide 2
          </div>
        </SwiperSlide>
      </Swiper>
      <style jsx>{`
        :global(.swiper-pagination) {
          bottom: 0 !important;
        }
      `}</style>
    </div>
  );
};

export default Home;
