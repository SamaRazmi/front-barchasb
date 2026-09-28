"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useUser } from "@/context/UserContext";
import { getRecentViews } from "@/api/apiRecentViews";

import CardContent from "../../../Ads/__components/Desk/Content/___components/CardContent";
import KioskContent from "../../../Ads/__components/Desk/Content/___components/KioskContent";
import DigitalCardContent from "../../../Projects/Desk/Content/___components/CardContent";
import RecentViewsFilter from "./RecentViewsFilter";

/* ======================= TYPES ======================= */
type TabKey = "karjo" | "karfarma" | "agahi" | "digital";
type TimeKey = "all" | "today" | "week" | "month";

interface RecentView {
  id: string;
  ad: any;
  adType: "SellerAd" | "JobSeekerAd" | "EmployerAd" | "DigitalAd";
  viewedAt: string;
}

/* ======================= COMPONENT ======================= */
const RecentViewsSection = () => {
  const { user, loading: userLoading } = useUser();

  const [recentViews, setRecentViews] = useState<RecentView[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabKey>("karjo");
  const [activeTime, setActiveTime] = useState<TimeKey>("all");

  const containerRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const isMountedRef = useRef(true);

  // ======================= واکشی داده با adType =======================
  const fetchRecentViews = useCallback(async () => {
    if (!user?.id || userLoading) return;

    let adTypeParam:
      | "SellerAd"
      | "JobSeekerAd"
      | "EmployerAd"
      | "DigitalAd"
      | undefined;
    if (activeTab === "karjo") adTypeParam = "JobSeekerAd";
    else if (activeTab === "karfarma") adTypeParam = "EmployerAd";
    else if (activeTab === "agahi") adTypeParam = "SellerAd";
    else if (activeTab === "digital") adTypeParam = "DigitalAd";

    console.log(
      `📡 [RecentViewsSection] واکشی با adType: ${adTypeParam} و زمان: ${activeTime}`,
    );

    setIsLoading(true);
    setError(null);

    try {
      const data = await getRecentViews(user.id, activeTime, adTypeParam);
      console.log("📦 داده‌های دریافتی:", data);
      if (isMountedRef.current) {
        setRecentViews(data);
        console.log(`✅ تعداد آیتم‌های دریافت شده: ${data.length}`);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        console.error("❌ خطا در واکشی:", err);
        setError("خطا در دریافت داده. لطفاً دوباره تلاش کنید.");
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [user, userLoading, activeTime, activeTab]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchRecentViews();
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchRecentViews]);

  // ======================= فیلتر مجدد (اختیاری) =======================
  const filteredAds = recentViews.filter((view) => {
    if (activeTab === "karjo") return view.adType === "JobSeekerAd";
    if (activeTab === "karfarma") return view.adType === "EmployerAd";
    if (activeTab === "agahi") return view.adType === "SellerAd";
    if (activeTab === "digital") return view.adType === "DigitalAd";
    return false;
  });

  console.log("🔍 [RecentViewsSection] وضعیت فعلی:");
  console.log("  activeTab:", activeTab);
  console.log("  تعداد recentViews:", recentViews.length);
  console.log("  تعداد filteredAds:", filteredAds.length);

  // ======================= توابع اسکرول و درگ =======================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current) return;
      const scrollAmount = 100;
      const pageScrollAmount = containerRef.current.clientHeight;
      switch (e.key) {
        case "ArrowDown":
          containerRef.current.scrollTop += scrollAmount;
          e.preventDefault();
          break;
        case "ArrowUp":
          containerRef.current.scrollTop -= scrollAmount;
          e.preventDefault();
          break;
        case "PageDown":
          containerRef.current.scrollTop += pageScrollAmount;
          e.preventDefault();
          break;
        case "PageUp":
          containerRef.current.scrollTop -= pageScrollAmount;
          e.preventDefault();
          break;
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleDrag = (e: MouseEvent) => {
    if (!containerRef.current) return;
    const delta = dragOffset - e.clientY;
    const newScrollTop = containerRef.current.scrollTop + delta;
    containerRef.current.scrollTop = Math.max(
      0,
      Math.min(
        newScrollTop,
        containerRef.current.scrollHeight - containerRef.current.clientHeight,
      ),
    );
    setDragOffset(e.clientY);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragOffset(e.clientY);
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleDrag);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    document.addEventListener("mousemove", handleDrag);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setDragOffset(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    e.preventDefault();
    const delta = dragOffset - e.touches[0].clientY;
    const newScrollTop = containerRef.current.scrollTop + delta;
    containerRef.current.scrollTop = Math.max(
      0,
      Math.min(
        newScrollTop,
        containerRef.current.scrollHeight - containerRef.current.clientHeight,
      ),
    );
    setDragOffset(e.touches[0].clientY);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (containerRef.current) {
      e.preventDefault();
      const newScrollTop = containerRef.current.scrollTop + e.deltaY;
      containerRef.current.scrollTop = Math.max(
        0,
        Math.min(
          newScrollTop,
          containerRef.current.scrollHeight - containerRef.current.clientHeight,
        ),
      );
    }
  };

  // ======================= رندر =======================
  if (userLoading) {
    return <div className="text-center p-4">در حال بارگذاری کاربر...</div>;
  }

  // تعیین کلاس گرید بر اساس تب فعال
  const gridClass =
    activeTab === "digital"
      ? "grid grid-cols-1 gap-4 mt-4"
      : "grid grid-cols-2 gap-4 mt-4";

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-4 p-4">
      <div className="w-full md:w-1/3">
        <RecentViewsFilter
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeTime={activeTime}
          setActiveTime={setActiveTime}
        />
      </div>

      <div
        ref={containerRef}
        className="w-full md:w-2/3 h-[36vh] md:h-[70vh] overflow-hidden relative"
        style={{ touchAction: "none" }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {isLoading && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-white/80 px-4 py-1 rounded-full shadow-md text-sm text-gray-600 z-10">
            در حال به‌روزرسانی...
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm bg-red-50 p-2 rounded-md mb-2">
            {error}
          </div>
        )}

        {filteredAds.length === 0 && !isLoading && !error && (
          <div className="text-[2vh] text-[#143A62D9] mt-4">
            هنوز بازدیدی برای این دسته‌بندی وجود ندارد.
          </div>
        )}

        <div className={gridClass}>
          {filteredAds.map((view) => {
            const ad = view.ad;
            if (!ad || typeof ad === "string") return null;

            if (view.adType === "DigitalAd") {
              return (
                <div key={view.id} className="col-span-1">
                  <DigitalCardContent ads={[ad]} />
                </div>
              );
            }

            const isJobAd =
              view.adType === "JobSeekerAd" || view.adType === "EmployerAd";

            return (
              <div key={view.id} className="col-span-1">
                {isJobAd ? (
                  <CardContent
                    id={ad.id}
                    title={ad.title || ad.name}
                    description={ad.companyDescription || ""}
                    city={ad.city || ""}
                    rating={ad.rating?.average?.toString() || "0"}
                    imageSrc={ad.images?.[0]?.url || "/images/ResUser.jpg"}
                    initialMarked={false}
                    adType={view.adType}
                    adId={ad.id}
                  />
                ) : (
                  <KioskContent
                    id={ad.id}
                    title={ad.title || ad.name}
                    city={ad.city || ""}
                    price={
                      ad.priceIRT
                        ? `${ad.priceIRT.toLocaleString()} تومان`
                        : "0 تومان"
                    }
                    imageSrc={ad.images?.[0]?.url || "/images/ResUser.jpg"}
                    initialMarked={false}
                    adType={view.adType}
                    adId={ad.id}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RecentViewsSection;
