"use client";

import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import { toast } from "react-toastify";
import ToastPortal from "@/components/common/ToastPortal";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import ReportDropdown from "@/components/common/ReportDropdown";
import { fetchSellerAd, fetchUserById } from "@/api/apiAdsDetails";
import { sellerStatusMap, translate } from "@/constants/translations";
import { useUser } from "@/context/UserContext";
import { BASE_URL } from "@/api/apiClient";
import { toggleMarkAd } from "@/api/apiAdsQueries";

interface Props {
  id: string;
}

// تابع maskPhoneLast4 دیگر استفاده نمی‌شود اما برای سازگاری نگه داشته شده
const maskPhoneLast4 = (phone?: string) => {
  if (!phone) return "";
  return phone.slice(0, -4) + "****";
};

const SellerAdDetails: React.FC<Props> = ({ id }) => {
  const [adData, setAdData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactPhone, setContactPhone] = useState<string>("");
  const [fetchingPhone, setFetchingPhone] = useState(false);

  const [isMarked, setIsMarked] = useState(false);
  const [toggling, setToggling] = useState(false);

  // ===== وضعیت اسکرول =====
  const [isAtBottom, setIsAtBottom] = useState(false);

  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  // ===== دو ref مجزا برای دسکتاپ و موبایل =====
  const desktopScrollRef = useRef<HTMLDivElement>(null);
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState(0);

  // ===== دریافت وضعیت نشان =====
  const fetchMarkedStatus = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${BASE_URL}/ads/batch-is-marked`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: user.id,
          items: [{ adId: id, adType: "SellerAd" }],
        }),
      });
      if (!response.ok) throw new Error("Failed to fetch marked status");
      const data = await response.json();
      const result = data.results?.find((r: any) => r.adId === id);
      if (result) {
        setIsMarked(result.marked);
      }
    } catch (error) {
      console.error("Error fetching marked status:", error);
    }
  };

  // ===== تغییر وضعیت نشان =====
  const handleToggleMark = async () => {
    if (userLoading) return;
    if (!user) {
      toast.warn("لطفاً ابتدا وارد حساب کاربری خود شوید", {
        position: "bottom-right",
        autoClose: 3000,
        onClick: () => router.push("/login"),
      });
      return;
    }

    setToggling(true);
    const TOAST_ID = "mark-toggle-seller";

    try {
      const result = await toggleMarkAd(id, user.id, "SellerAd");
      setIsMarked(result.marked);

      toast.dismiss(TOAST_ID);
      setTimeout(() => {
        toast.success(result.marked ? "نشان شد ✅" : "از نشان خارج شد ❌", {
          toastId: TOAST_ID,
          position: "bottom-right",
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          theme: "colored",
        });
      }, 50);
    } catch (error) {
      console.error("Toggle mark error:", error);
      toast.error("خطا در تغییر نشان", { autoClose: 3000 });
    } finally {
      setToggling(false);
    }
  };

  // ===== اشتراک‌گذاری =====
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("لینک کپی شد!", {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
      theme: "colored",
    });
  };

  const handleWebShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: adData?.title || "آگهی",
          url: window.location.href,
        })
        .catch(console.error);
    } else {
      handleCopyLink();
    }
  };

  // ===== دریافت شماره تماس =====
  const fetchOwnerPhone = async () => {
    if (userLoading) return;
    if (!user) {
      toast.warn("لطفاً ابتدا وارد حساب کاربری خود شوید", {
        position: "bottom-right",
        autoClose: 3000,
        onClick: () => router.push("/login"),
      });
      return;
    }

    const ownerId = adData?.owner?.id || adData?.owner;
    if (!ownerId) {
      toast.error("شناسه آگهی‌دهنده یافت نشد");
      return;
    }

    setFetchingPhone(true);
    try {
      const userData = await fetchUserById(ownerId);
      const phoneNumber = userData?.phone || "";
      if (!phoneNumber) {
        toast.error("شماره تماسی برای این آگهی‌دهنده ثبت نشده است");
        return;
      }
      setContactPhone(phoneNumber);
      setShowContactModal(true);
    } catch (err: any) {
      console.error(err);
      toast.error("امکان دریافت شماره تماس وجود ندارد");
    } finally {
      setFetchingPhone(false);
    }
  };

  const handleModalPhoneClick = () => {
    window.location.href = `tel:${contactPhone}`;
  };

  // ===== دکمه‌های فوتر =====
  const handleChatClick = () => {
    if (userLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (adData.owner?.id !== user.id) {
      router.push(`/dashboard/chat/SellerAd/${id}/${adData.owner.id}`);
    }
  };

  const handleContactClick = () => {
    if (userLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    fetchOwnerPhone();
  };

  // ========== اسکرول ==========
  // تابع کمکی برای دریافت کانتینر مناسب
  const getContainer = () =>
    window.innerWidth >= 768
      ? desktopScrollRef.current
      : mobileScrollRef.current;

  const handleWheel = (e: React.WheelEvent) => {
    const container = getContainer();
    if (container) {
      container.scrollTop += e.deltaY;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragOffset(e.clientY);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    const container = getContainer();
    if (container) {
      const delta = dragOffset - e.clientY;
      container.scrollTop = Math.max(0, container.scrollTop + delta);
      setDragOffset(e.clientY);
    }
  };

  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setDragOffset(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const container = getContainer();
    if (container) {
      const delta = dragOffset - e.touches[0].clientY;
      container.scrollTop = Math.max(0, container.scrollTop + delta);
      setDragOffset(e.touches[0].clientY);
    }
  };

  // ===== تشخیص پایین بودن اسکرول =====
  const checkScroll = (container: HTMLDivElement | null) => {
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const atBottom = scrollTop + clientHeight >= scrollHeight - 5;
    setIsAtBottom(atBottom);
  };

  // ===== کلیک روی فلش =====
  const handleArrowClick = () => {
    const container = getContainer();
    if (!container) return;
    if (isAtBottom) {
      container.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  // ===== کیبورد =====
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const container = getContainer();
      if (!container) return;
      const scrollAmount = 100;
      const pageScrollAmount = container.clientHeight;
      switch (e.key) {
        case "ArrowDown":
          container.scrollTop += scrollAmount;
          e.preventDefault();
          break;
        case "ArrowUp":
          container.scrollTop -= scrollAmount;
          e.preventDefault();
          break;
        case "PageDown":
          container.scrollTop += pageScrollAmount;
          e.preventDefault();
          break;
        case "PageUp":
          container.scrollTop -= pageScrollAmount;
          e.preventDefault();
          break;
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ===== بارگذاری اولیه =====
  useEffect(() => {
    const loadAd = async () => {
      try {
        const data = await fetchSellerAd(id);
        setAdData(data);
        setActiveImage(0);
        if (user) {
          await fetchMarkedStatus();
        }
      } catch (err: any) {
        console.error(err);
        toast.error("خطا در دریافت آگهی");
      } finally {
        setLoading(false);
      }
    };
    loadAd();
  }, [id, user]);

  // ===== مدیریت listener های اسکرول =====
  useEffect(() => {
    const desktopEl = desktopScrollRef.current;
    const mobileEl = mobileScrollRef.current;

    const handleDesktopScroll = () => checkScroll(desktopEl);
    const handleMobileScroll = () => checkScroll(mobileEl);

    if (desktopEl) {
      desktopEl.addEventListener("scroll", handleDesktopScroll, {
        passive: true,
      });
      setTimeout(() => checkScroll(desktopEl), 200);
    }
    if (mobileEl) {
      mobileEl.addEventListener("scroll", handleMobileScroll, {
        passive: true,
      });
      setTimeout(() => checkScroll(mobileEl), 200);
    }

    return () => {
      if (desktopEl)
        desktopEl.removeEventListener("scroll", handleDesktopScroll);
      if (mobileEl) mobileEl.removeEventListener("scroll", handleMobileScroll);
    };
  }, [adData]);

  // ===== به‌روزرسانی isAtBottom بعد از تغییر محتوا یا تصویر =====
  useLayoutEffect(() => {
    const timeoutId = setTimeout(() => {
      const desktopEl = desktopScrollRef.current;
      const mobileEl = mobileScrollRef.current;
      if (desktopEl) checkScroll(desktopEl);
      if (mobileEl) checkScroll(mobileEl);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [adData, activeImage]);

  if (loading) return <p>در حال بارگذاری...</p>;
  if (!adData) return null;

  const textColor = { color: "#143A62" };

  // ---- بررسی مالکیت و پرچم‌ها ----
  const isOwner = user && adData.owner?.id === user.id;
  const enableChat = adData?.enableChat ?? true;
  const enablePhone = adData?.enablePhone ?? true;

  // ========== تابع پردازش وضعیت ==========
  const getStatusDisplay = () => {
    const raw = adData.status;

    if (raw === undefined || raw === null || raw === "") {
      return "وضعیت مشخص نشده";
    }

    let statusValue = raw;

    if (Array.isArray(statusValue)) {
      statusValue = statusValue[0];
    }

    if (typeof statusValue === "string" && statusValue.includes(",")) {
      statusValue = statusValue.split(",")[0];
    }

    if (typeof statusValue === "object") {
      statusValue = String(statusValue);
    }

    if (typeof statusValue === "string") {
      const trimmed = statusValue.trim();
      const translated = translate(trimmed, sellerStatusMap);
      return translated || trimmed;
    }

    return String(statusValue) || "وضعیت مشخص نشده";
  };

  const getNegotiableDisplay = () => {
    if (adData.isNegotiable === true || adData.isNegotiable === "true") {
      return "معاوضه می‌کنم";
    }
    return "خیر";
  };

  // ========== محتوای دسکتاپ ==========
  const DesktopLayout = () => (
    <div className="flex gap-6 items-start h-[90%]">
      <div className="w-full md:w-auto flex flex-col items-center md:items-end gap-2">
        <img
          src={adData.images?.[activeImage]?.url || "/images/kioskimg_card.svg"}
          className="w-[35vh] h-[36vh] md:w-[33vh] md:h-[33vh] object-cover rounded-xl max-h-[200px]"
        />
        {adData.images?.length > 1 && (
          <div className="flex gap-2 mt-2">
            {adData.images.map((img: any, idx: number) => (
              <img
                key={idx}
                src={img.url}
                className={`w-[8vh] h-[8vh] object-cover rounded cursor-pointer border-2 ${
                  idx === activeImage ? "border-blue-500" : "border-gray-300"
                }`}
                onClick={() => setActiveImage(idx)}
              />
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 flex-1">
        <h2 className="text-xl font-bold" style={textColor}>
          {adData.title}
        </h2>
        <p style={textColor}>{adData.category}</p>
        <p style={textColor}>
          {adData.state} {adData.city && ` / ${adData.city}`}
        </p>

        <div className="bg-[#FEFEFE] p-3 rounded-lg flex flex-col gap-3 mt-2">
          <div className="flex justify-between items-center">
            <span style={textColor}>وضعیت:</span>
            <span className="font-bold" style={textColor}>
              {getStatusDisplay()}
            </span>
          </div>
          <div className="w-full h-[0.2vh] bg-gradient-to-r from-transparent via-[#143A62]/80 to-transparent"></div>
          <div className="flex justify-between items-center">
            <span style={textColor}>معاوضه:</span>
            <span className="font-bold" style={textColor}>
              {getNegotiableDisplay()}
            </span>
          </div>
          <div className="w-full h-[0.2vh] bg-gradient-to-r from-transparent via-[#143A62]/80 to-transparent"></div>
          <div className="flex justify-between items-center">
            <span style={textColor}>قیمت:</span>
            <span className="font-bold" style={textColor}>
              {adData.priceIRT?.toLocaleString() || "نامشخص"} تومان
            </span>
          </div>
        </div>

        {adData.description && (
          <div className="mt-4">
            <h3 className="font-bold" style={textColor}>
              توضیحات
            </h3>
            <p className="mt-1" style={textColor}>
              {adData.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // ========== محتوای موبایل ==========
  const MobileLayout = () => (
    <div className="w-full flex flex-col gap-[1vh] text-right text-[2vh]">
      <div className="flex flex-col items-center gap-2 my-2">
        <img
          src={adData.images?.[activeImage]?.url || "/images/kioskimg_card.svg"}
          className="w-[35vh] h-[36vh] object-cover rounded-xl max-h-[200px]"
          alt="main"
        />
        {adData.images?.length > 1 && (
          <div className="flex gap-2 mt-2">
            {adData.images.map((img: any, idx: number) => (
              <img
                key={idx}
                src={img.url}
                className={`w-[8vh] h-[8vh] object-cover rounded cursor-pointer border-2 ${
                  idx === activeImage ? "border-blue-500" : "border-gray-300"
                }`}
                onClick={() => setActiveImage(idx)}
                alt="thumb"
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-[3vh] font-bold" style={textColor}>
          {adData.title}
        </h2>
        <div className="flex gap-3">
          {!isOwner && (
            <ReportDropdown
              targetId={id}
              reportType="sellerAd"
              iconSrc="/images/report_ads.svg"
              placement="ad"
              ownerId={adData?.owner?.id}
            />
          )}
          <div
            className={`w-[6vh] h-[6vh] rounded-full flex items-center justify-center cursor-pointer transition-colors ${
              isMarked ? "bg-blue-500" : "bg-gray-300"
            } ${toggling ? "opacity-50 pointer-events-none" : ""}`}
            onClick={handleToggleMark}
          >
            <img
              src="/images/add-page.svg"
              alt="mark"
              className="w-1/2 h-1/2 object-contain"
            />
          </div>
          <div
            className="w-[6vh] h-[6vh] rounded-full bg-gray-300 flex items-center justify-center cursor-pointer"
            onClick={handleWebShare}
          >
            <img
              src="/images/share-page.svg"
              alt="share"
              className="w-1/2 h-1/2 object-contain"
            />
          </div>
        </div>
      </div>

      <p style={textColor}>{adData.category}</p>
      <p style={textColor}>
        {adData.state} {adData.city && ` / ${adData.city}`}
      </p>

      <div className="bg-[#FEFEFE] p-3 rounded-lg flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span style={textColor}>وضعیت:</span>
          <span className="font-bold" style={textColor}>
            {getStatusDisplay()}
          </span>
        </div>
        <div className="w-full h-[0.2vh] bg-gradient-to-r from-transparent via-[#143A62]/80 to-transparent"></div>
        <div className="flex justify-between items-center">
          <span style={textColor}>معاوضه:</span>
          <span className="font-bold" style={textColor}>
            {getNegotiableDisplay()}
          </span>
        </div>
        <div className="w-full h-[0.2vh] bg-gradient-to-r from-transparent via-[#143A62]/80 to-transparent"></div>
        <div className="flex justify-between items-center">
          <span style={textColor}>قیمت:</span>
          <span className="font-bold" style={textColor}>
            {adData.priceIRT?.toLocaleString() || "نامشخص"} تومان
          </span>
        </div>
      </div>

      {adData.description && (
        <div className="mt-4">
          <h3 className="font-bold" style={textColor}>
            توضیحات
          </h3>
          <p className="mt-1" style={textColor}>
            {adData.description}
          </p>
        </div>
      )}
    </div>
  );

  // ========== فوتر دسکتاپ (با فلش وسط) ==========
  const DesktopFooter = () => (
    <div className="flex flex-row justify-between items-center gap-4 mt-4 pt-2 border-t border-gray-200">
      {/* گروه چپ: دکمه‌های چت و تماس */}
      <div className="flex gap-3">
        {!isOwner && enableChat && (
          <button
            onClick={handleChatClick}
            className="bg-[#143A62D9] text-white w-32 h-12 rounded-lg flex items-center justify-center"
          >
            چت در برچسب
          </button>
        )}
        {!isOwner && enablePhone && (
          <button
            onClick={handleContactClick}
            className="bg-[#143A62D9] text-white w-32 h-12 rounded-lg flex items-center justify-center"
          >
            اطلاعات تماس
          </button>
        )}
      </div>

      {/* فلش وسط (بین دو گروه) */}
      <button
        onClick={handleArrowClick}
        className="w-12 h-12 rounded-full bg-[#143A62] flex items-center justify-center shadow-lg hover:scale-105 transition"
      >
        <span className="text-white text-xl font-bold">
          {isAtBottom ? "↑" : "↓"}
        </span>
      </button>

      {/* گروه راست: گزارش، نشان، اشتراک */}
      <div className="flex gap-3">
        {!isOwner && (
          <ReportDropdown
            targetId={id}
            reportType="sellerAd"
            iconSrc="/images/report_ads.svg"
            placement="ad"
            ownerId={adData?.owner?.id}
          />
        )}
        <div
          className={`w-[6vh] h-[6vh] rounded-full flex items-center justify-center cursor-pointer transition-colors ${
            isMarked ? "bg-blue-500" : "bg-gray-300"
          } ${toggling ? "opacity-50 pointer-events-none" : ""}`}
          onClick={handleToggleMark}
        >
          <img
            src="/images/add-page.svg"
            alt="mark"
            className="w-1/2 h-1/2 object-contain"
          />
        </div>
        <div
          className="w-[6vh] h-[6vh] rounded-full bg-gray-300 flex items-center justify-center cursor-pointer"
          onClick={handleWebShare}
        >
          <img
            src="/images/share-page.svg"
            alt="share"
            className="w-1/2 h-1/2 object-contain"
          />
        </div>
      </div>
    </div>
  );

  // ========== فوتر موبایل ==========
  const MobileFooter = () => (
    <div className="flex justify-center gap-3 py-3 bg-gray-50 border-t h-[10svh] border-gray-200">
      {!isOwner && enableChat && (
        <button
          onClick={handleChatClick}
          className="bg-[#143A62D9] text-white w-32 h-12 rounded-lg flex items-center justify-center"
        >
          چت در برچسب
        </button>
      )}
      {!isOwner && enablePhone && (
        <button
          onClick={handleContactClick}
          className="bg-[#143A62D9] text-white w-32 h-12 rounded-lg flex items-center justify-center"
        >
          اطلاعات تماس
        </button>
      )}
    </div>
  );

  // ========== مودال تماس ==========
  const ContactModal = () => {
    if (!showContactModal) return null;
    const displayPhone = contactPhone;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300"
        onClick={() => setShowContactModal(false)}
      >
        <div
          className="bg-white rounded-3xl shadow-2xl w-full max-w-sm transform transition-all duration-300 scale-100 opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative p-6 text-center">
            <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-[#143A62]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-2">
              اطلاعات تماس
            </h3>
            <p className="text-gray-500 text-sm mb-4">شماره تماس آگهی‌دهنده</p>

            {fetchingPhone ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#143A62]"></div>
              </div>
            ) : (
              <div
                onClick={handleModalPhoneClick}
                className="block bg-gray-100 rounded-xl py-3 px-4 mb-6 text-lg font-mono text-[#143A62] font-bold hover:bg-gray-200 transition-colors cursor-pointer"
                dir="ltr"
              >
                {displayPhone}
              </div>
            )}

            <button
              onClick={() => setShowContactModal(false)}
              className="w-full bg-[#143A62] text-white py-2.5 rounded-xl hover:bg-[#0f2a4a] transition-colors font-medium"
            >
              بستن
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative p-4 md:p-8 bg-gray-50 text-right h-[78vh] text-[2vh] flex flex-col">
      {/* بخش دسکتاپ */}
      <div className="hidden md:flex flex-col h-full">
        <div
          ref={desktopScrollRef}
          className="flex-1 overflow-y-auto scrollbar-hidden"
          tabIndex={0}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          style={{ userSelect: "none" }}
        >
          <DesktopLayout />
        </div>
        <DesktopFooter />
      </div>

      {/* بخش موبایل با فلش ثابت */}
      <div className="block md:hidden flex flex-col h-full">
        <div
          ref={mobileScrollRef}
          className="flex-1 overflow-y-auto scrollbar-hidden"
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          style={{ userSelect: "none" }}
        >
          <MobileLayout />
        </div>
        <MobileFooter />

        {/* فلش ثابت در گوشه برای موبایل */}
        <button
          onClick={handleArrowClick}
          className="fixed bottom-8 right-4 w-12 h-12 rounded-full bg-[#143A62] flex items-center justify-center shadow-lg z-[9999] hover:scale-105 transition"
        >
          <span className="text-white text-xl font-bold">
            {isAtBottom ? "↑" : "↓"}
          </span>
        </button>
      </div>

      <ContactModal />
      <ToastPortal />

      <style jsx global>{`
        .scrollbar-hidden {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .scrollbar-hidden::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default SellerAdDetails;
