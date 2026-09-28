"use client";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { useUser } from "@/context/UserContext";
import CardContent from "../../../Ads/__components/Desk/Content/___components/CardContent";
import KioskContent from "../../../Ads/__components/Desk/Content/___components/KioskContent";
import DigitalCardContent from "../../../Projects/Desk/Content/___components/CardContent";
import { trackAdView } from "@/api/apiAdView";

type TabKey = "karjo" | "karfarma" | "agahi" | "digital";

const tabs: { key: TabKey; label: string }[] = [
  { key: "karjo", label: "کارجو" },
  { key: "karfarma", label: "کارفرما" },
  { key: "agahi", label: "آگهی" },
  { key: "digital", label: "مناقصه" },
];

interface MarkedAd {
  markId: string;
  adType: string;
  ad: any;
}

const BadgesSection = () => {
  const { user, loading } = useUser();
  const [markedAds, setMarkedAds] = useState<MarkedAd[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("agahi");
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState(0);

  // --- دریافت لیست نشان‌ها از سرور ---
  const fetchMarkedAds = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/marks/${user.id}/all`, {
        credentials: "include",
      });
      const data = await res.json();
      setMarkedAds(data.marks);
    } catch (err) {
      console.error("خطا در گرفتن نشان شده‌ها:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkedAds();
  }, [user]);

  // --- تابع حذف نشان (unmark) ---
  const handleUnmark = async (adId: string, adType: string) => {
    if (!user) return;
    try {
      const response = await fetch(`/api/marks/${user.id}/remove`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ adId, adType }),
      });
      if (!response.ok) throw new Error("Failed to unmark");

      // پس از موفقیت، آیتم را از لیست محلی حذف می‌کنیم
      setMarkedAds((prev) => prev.filter((mark) => mark.ad.id !== adId));
    } catch (error) {
      console.error("خطا در حذف نشان:", error);
    }
  };

  // --- فیلتر بر اساس تب فعال ---
  const filteredAds = useMemo(() => {
    return markedAds.filter((mark) => {
      if (activeTab === "karjo") return mark.adType === "JobSeekerAd";
      if (activeTab === "karfarma") return mark.adType === "EmployerAd";
      if (activeTab === "agahi") return mark.adType === "SellerAd";
      if (activeTab === "digital") return mark.adType === "DigitalAd";
      return false;
    });
  }, [markedAds, activeTab]);

  // --- آگهی‌های دیجیتال (مناقصه) ---
  const digitalAds = useMemo(() => {
    if (activeTab !== "digital") return [];
    return filteredAds.map((mark) => mark.ad);
  }, [filteredAds, activeTab]);

  // --- محاسبه قیمت برای آگهی‌های فروشنده ---
  const getAdPrice = (mark: MarkedAd) => {
    const ad = mark.ad;
    if (!ad) return "0 تومان";
    if (mark.adType === "SellerAd")
      return ad.priceIRT ? `${ad.priceIRT.toLocaleString()} تومان` : "0 تومان";
    if (ad.price) {
      if (typeof ad.price === "string") return ad.price;
      if (ad.price.min && ad.price.max)
        return `${ad.price.min} - ${ad.price.max} تومان`;
      if (ad.price.min) return `${ad.price.min} تومان`;
      if (ad.price.max) return `${ad.price.max} تومان`;
    }
    if (ad.amount) return `${ad.amount} تومان`;
    return "0 تومان";
  };

  // --- توابع اسکرول (دست‌نخورده) ---
  const handleWheel = (e: React.WheelEvent) => {
    if (containerRef.current) containerRef.current.scrollTop += e.deltaY;
  };
  const handleMouseDown = (e: React.MouseEvent) => {
    setDragOffset(e.clientY);
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (containerRef.current) {
        const delta = dragOffset - moveEvent.clientY;
        containerRef.current.scrollTop += delta;
        setDragOffset(moveEvent.clientY);
      }
    };
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };
  const handleTouchStart = (e: React.TouchEvent) =>
    setDragOffset(e.touches[0].clientY);
  const handleTouchMove = (e: React.TouchEvent) => {
    if (containerRef.current) {
      const delta = dragOffset - e.touches[0].clientY;
      containerRef.current.scrollTop += delta;
      setDragOffset(e.touches[0].clientY);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current) return;
      const scrollAmount = 100;
      const pageAmount = containerRef.current.clientHeight;
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
          containerRef.current.scrollTop += pageAmount;
          e.preventDefault();
          break;
        case "PageUp":
          containerRef.current.scrollTop -= pageAmount;
          e.preventDefault();
          break;
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (loading) return <div>در حال بارگذاری کاربر...</div>;

  return (
    <div className="w-full h-full flex flex-col items-center p-4">
      {/* سوئیچ دسکتاپ */}
      <div className="hidden sm:block w-[35%]">
        <div className="w-[99%] bg-[#E6E7E8] shadow-[0px_0px_4px_0px_#0000001A] rounded-[10px] flex items-center justify-between">
          {tabs.map((tab) => {
            const isSelected = tab.key === activeTab;
            return (
              <div
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex-1 cursor-pointer px-1"
              >
                {isSelected ? (
                  <div className="w-full rounded-[10px] py-2 px-5 flex items-center justify-center bg-[#143A62]">
                    <span className="text-[2.2vh] text-white">{tab.label}</span>
                  </div>
                ) : (
                  <div className="w-full rounded-[10px] flex items-center justify-center">
                    <span className="text-[2.2vh] text-[#143A62]">
                      {tab.label}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* سوئیچ موبایل */}
      <div className="sm:hidden w-[90%] flex items-center justify-between gap-1 mt-3">
        <div className="flex bg-white rounded-xl shadow-md w-[100%] px-2 py-2 gap-1">
          {tabs.map((tab) => {
            const isSelected = tab.key === activeTab;
            return (
              <div
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex-1 cursor-pointer"
              >
                {isSelected ? (
                  <div className="rounded-xl bg-[#143A62] flex items-center justify-center py-[6px]">
                    <span className="text-[14px] text-white">{tab.label}</span>
                  </div>
                ) : (
                  <div className="rounded-xl flex items-center justify-center py-[6px]">
                    <span className="text-[14px] text-[#143A62]">
                      {tab.label}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* محتوای اصلی */}
      {isLoading && <div className="mt-4">در حال بارگذاری نشان‌ها...</div>}
      {!isLoading && filteredAds.length === 0 && (
        <div className="text-[2vh] text-[#143A62D9] mt-4">
          هیچ موردی برای این دسته‌بندی وجود ندارد.
        </div>
      )}

      <div
        ref={containerRef}
        className="h-[34vh] md:h-[70vh] overflow-hidden w-full sm:px-4 sm:mt-2"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        {activeTab === "digital" ? (
          <div className="mt-4">
            <DigitalCardContent ads={digitalAds} />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {filteredAds.map((mark) => {
              const ad = mark.ad;

              // پراپ‌های مشترک برای تمام کارت‌ها
              const commonProps = {
                key: mark.markId,
                id: ad.id,
                title: ad.title || ad.name || "بدون عنوان",
                city: ad.city || "",
                imageSrc: ad.images?.[0]?.url || "/images/ResUser.jpg",
                adType: mark.adType,
                adId: ad.id,
                initialMarked: true,
                onMarkToggle: (id: string, marked: boolean) => {
                  // اگر کاربر نشان را بردارد (marked === false)
                  if (!marked) {
                    handleUnmark(id, mark.adType);
                  }
                },
                onViewTrack: trackAdView,
              };

              if (
                mark.adType === "JobSeekerAd" ||
                mark.adType === "EmployerAd"
              ) {
                return (
                  <CardContent
                    {...commonProps}
                    description={
                      ad.companyDescription ||
                      ad.careerHistory
                        ?.map((c: any) => `${c.title} - ${c.description}`)
                        .join("\n") ||
                      ""
                    }
                    rating={ad.rating?.average?.toString() || "0"}
                  />
                );
              } else if (mark.adType === "SellerAd") {
                return (
                  <KioskContent {...commonProps} price={getAdPrice(mark)} />
                );
              } else {
                return null;
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgesSection;
