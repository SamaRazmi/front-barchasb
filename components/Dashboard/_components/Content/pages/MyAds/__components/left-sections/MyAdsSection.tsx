"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@/context/UserContext";
import SelectionSwitch from "./SelectionSwitch";
import RenewAdPaymentModal from "./RenewAdPaymentModal";
import EditFormEmployee from "../ads-sections/EditFormEmployee";
import EditFormJobSeeker from "../ads-sections/EditFormJobSeeker";
import EditFormAdvertiser from "../ads-sections/EditFormAdvertiser";
import EditFormDigital from "../ads-sections/EditFormDigitalProjects";
import VisitStatsModal from "./VisitStatsModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchUserAds, deleteAd, Ad } from "@/api/apiAdsQueries";

type AdType = "employer" | "seeker" | "seller" | "digital";

interface MyAdsSectionProps {
  initialActiveType?: AdType;
}

// ✅ فقط همین خط اصلاح شد: مقدار پیش‌فرض از "seeker" به "seller" تغییر کرد
const MyAdsSection = ({ initialActiveType = "seller" }: MyAdsSectionProps) => {
  const { user, loading: userLoading } = useUser();

  const [activeType, setActiveType] = useState<AdType>(initialActiveType);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(false);

  const [editingAdId, setEditingAdId] = useState<string | null>(null);
  const [renewModalAd, setRenewModalAd] = useState<Ad | null>(null);
  const [visitStatsModalAd, setVisitStatsModalAd] = useState<Ad | null>(null);
  const [deleteModalAd, setDeleteModalAd] = useState<Ad | null>(null);
  const [deleting, setDeleting] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const editContainerRef = useRef<HTMLDivElement>(null);
  const [editDragOffset, setEditDragOffset] = useState(0);

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // ✅ تابع زمان اصلاح‌شده بر اساس تاریخ (بدون ساعت)
  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);

    // حذف ساعت و دقیقه برای مقایسه فقط بر اساس تاریخ
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const pastDate = new Date(
      past.getFullYear(),
      past.getMonth(),
      past.getDate(),
    );

    const diffMs = today.getTime() - pastDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "امروز";
    if (diffDays === 1) return "دیروز";
    if (diffDays < 7) return `${diffDays} روز پیش`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} هفته پیش`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} ماه پیش`;
    return "بیش از یک سال پیش";
  };

  // ✅ تابع تشخیص رنگ پس‌زمینه بر اساس وضعیت آگهی
  const getStatusColor = (status?: string) => {
    if (!status) return "bg-white";
    switch (status) {
      case "approved":
        return "bg-green-50 border-green-200";
      case "pending":
      case "pending_payment":
        return "bg-yellow-50 border-yellow-200";
      case "rejected":
        return "bg-red-50 border-red-200";
      case "expired":
        return "bg-gray-50 border-gray-200";
      default:
        return "bg-white";
    }
  };

  useEffect(() => {
    if (!user) {
      console.log("ℹ️ [MyAdsSection] کاربر وجود ندارد، صبر برای بارگذاری...");
      return;
    }
    console.log(
      `👤 [MyAdsSection] کاربر با id: ${user.id} و نوع: ${activeType}`,
    );

    const fetchAds = async () => {
      setLoading(true);
      try {
        const fetchedAds = await fetchUserAds(user.id, activeType as any);
        console.log(`📦 [MyAdsSection] آگهی‌های دریافتی از API:`, fetchedAds);
        setAds(fetchedAds);
      } catch (err) {
        console.error("❌ [MyAdsSection] خطا در دریافت آگهی‌ها:", err);
        setAds([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, [user, activeType]);

  useEffect(() => {
    if (editingAdId && !ads.some((ad) => ad.id === editingAdId)) {
      console.log(
        `🔄 [MyAdsSection] آگهی با id ${editingAdId} در لیست نیست، حالت ویرایش لغو شد`,
      );
      setEditingAdId(null);
    }
  }, [ads, editingAdId]);

  const handleDeleteAd = async () => {
    if (!deleteModalAd || !user) return;
    setDeleting(true);
    try {
      const typeMap: Record<AdType, string> = {
        employer: "employer",
        seeker: "jobseeker",
        seller: "seller",
        digital: "digital",
      };
      const adTypeForApi = typeMap[activeType] || activeType;
      console.log(
        `🗑️ [MyAdsSection] حذف آگهی ${deleteModalAd.id} از نوع ${adTypeForApi}`,
      );
      await deleteAd(deleteModalAd.id, adTypeForApi);
      setAds((prev) => prev.filter((ad) => ad.id !== deleteModalAd.id));
      if (editingAdId === deleteModalAd.id) {
        setEditingAdId(null);
      }
      setDeleteModalAd(null);
      toast.success("✅ آگهی با موفقیت حذف شد");
    } catch (err) {
      console.error("❌ [MyAdsSection] خطا در حذف آگهی:", err);
      toast.error(
        err instanceof Error ? err.message : "❌ حذف آگهی با خطا مواجه شد.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const renderEditForm = () => {
    if (!editingAdId) return null;
    console.log(
      `✏️ [MyAdsSection] رندر فرم ویرایش برای آگهی ${editingAdId} (نوع ${activeType})`,
    );
    switch (activeType) {
      case "employer":
        return (
          <EditFormEmployee
            adId={editingAdId}
            onCancel={() => setEditingAdId(null)}
          />
        );
      case "seeker":
        return (
          <EditFormJobSeeker
            adId={editingAdId}
            onCancel={() => setEditingAdId(null)}
          />
        );
      case "seller":
        return (
          <EditFormAdvertiser
            adId={editingAdId}
            onCancel={() => setEditingAdId(null)}
          />
        );
      case "digital":
        return (
          <EditFormDigital
            adId={editingAdId}
            onCancel={() => setEditingAdId(null)}
          />
        );
      default:
        return null;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragOffset(e.clientY);
    document.addEventListener("mousemove", handleDrag);
    document.addEventListener("mouseup", handleMouseUp);
  };
  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleDrag);
    document.removeEventListener("mouseup", handleMouseUp);
  };
  const handleDrag = (e: MouseEvent) => {
    if (containerRef.current) {
      const delta = dragOffset - e.clientY;
      containerRef.current.scrollTop = Math.max(
        0,
        containerRef.current.scrollTop + delta,
      );
      setDragOffset(e.clientY);
    }
  };
  const handleTouchStart = (e: React.TouchEvent) => {
    setDragOffset(e.touches[0].clientY);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (containerRef.current) {
      const delta = dragOffset - e.touches[0].clientY;
      containerRef.current.scrollTop = Math.max(
        0,
        containerRef.current.scrollTop + delta,
      );
      setDragOffset(e.touches[0].clientY);
    }
  };
  const handleWheel = (e: React.WheelEvent) => {
    if (containerRef.current) containerRef.current.scrollTop += e.deltaY;
  };

  const handleEditMouseDown = (e: React.MouseEvent) => {
    if (!isMobile) return;
    setEditDragOffset(e.clientY);
    document.addEventListener("mousemove", handleEditDrag);
    document.addEventListener("mouseup", handleEditMouseUp);
  };
  const handleEditDrag = (e: MouseEvent) => {
    if (editContainerRef.current) {
      const delta = editDragOffset - e.clientY;
      editContainerRef.current.scrollTop = Math.max(
        0,
        editContainerRef.current.scrollTop + delta,
      );
      setEditDragOffset(e.clientY);
    }
  };
  const handleEditMouseUp = () => {
    document.removeEventListener("mousemove", handleEditDrag);
    document.removeEventListener("mouseup", handleEditMouseUp);
  };
  const handleEditTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    setEditDragOffset(e.touches[0].clientY);
  };
  const handleEditTouchMove = (e: React.TouchEvent) => {
    if (editContainerRef.current && isMobile) {
      const delta = editDragOffset - e.touches[0].clientY;
      editContainerRef.current.scrollTop = Math.max(
        0,
        editContainerRef.current.scrollTop + delta,
      );
      setEditDragOffset(e.touches[0].clientY);
    }
  };
  const handleEditWheel = (e: React.WheelEvent) => {
    if (editContainerRef.current)
      editContainerRef.current.scrollTop += e.deltaY;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isEditing = !!editingAdId;
      const targetContainer = isEditing
        ? editContainerRef.current
        : containerRef.current;
      if (!targetContainer) return;
      const scrollAmount = 100;
      const pageScrollAmount = targetContainer.clientHeight;
      switch (e.key) {
        case "ArrowDown":
          targetContainer.scrollTop += scrollAmount;
          e.preventDefault();
          break;
        case "ArrowUp":
          targetContainer.scrollTop -= scrollAmount;
          e.preventDefault();
          break;
        case "PageDown":
          targetContainer.scrollTop += pageScrollAmount;
          e.preventDefault();
          break;
        case "PageUp":
          targetContainer.scrollTop -= pageScrollAmount;
          e.preventDefault();
          break;
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [editingAdId]);

  return (
    <div className="w-full h-full relative md:p-4">
      {userLoading ? (
        <div>در حال بارگذاری کاربر...</div>
      ) : editingAdId ? (
        <div
          ref={editContainerRef}
          className="w-full overflow-auto h-[50vh] sm:h-[55vh] md:h-[100vh]"
          onMouseDown={handleEditMouseDown}
          onWheel={handleEditWheel}
          onTouchStart={handleEditTouchStart}
          onTouchMove={handleEditTouchMove}
        >
          <div className="h-auto">{renderEditForm()}</div>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col md:flex-row gap-8 items-center md:items-start">
          <SelectionSwitch
            active={activeType}
            onChange={(type) => {
              console.log(`🔄 [MyAdsSection] تغییر نوع به ${type}`);
              setActiveType(type);
              setEditingAdId(null);
            }}
          />
          <div className="flex-1 min-w-0 overflow-hidden">
            <h2 className="text-[2.4vh] font-semibold text-[#143A62] mb-4">
              آگهی‌های من
            </h2>
            {loading ? (
              <div>در حال بارگذاری آگهی‌ها...</div>
            ) : ads.length === 0 ? (
              <div>آگهی‌ای برای این کاربر موجود نیست.</div>
            ) : (
              <div
                ref={containerRef}
                className="space-y-4 h-[34vh] md:h-[70vh] overflow-hidden"
                onMouseDown={handleMouseDown}
                onWheel={handleWheel}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
              >
                {ads.map((ad) => {
                  const isDigital = activeType === "digital";
                  const displayTitle = ad.title || ad.name || "";
                  let displayDescription = "";
                  if (isDigital) {
                    const skills = (ad as any).requiredSkills || [];
                    const skillNames = skills
                      .map((s: any) =>
                        typeof s === "string" ? s : s?.name || "",
                      )
                      .filter(Boolean);
                    displayDescription = skillNames.length
                      ? skillNames.slice(0, 3).join("، ") +
                        (skillNames.length > 3 ? "، ..." : "")
                      : "مهارت مشخص نشده";
                  } else {
                    displayDescription = ad.description || "";
                  }
                  const displayCategory = !isDigital ? ad.category || "" : "";
                  const displayPrice =
                    !isDigital && ad.priceIRT ? ad.priceIRT : "";
                  const city = ad.city || "";
                  const state = ad.state || "";
                  const province = (ad as any).province || "";
                  const locationParts = [city, state, province].filter(Boolean);
                  const locationStr = locationParts.length
                    ? locationParts.join("، ")
                    : "مکان نامشخص";

                  // دریافت رنگ پس‌زمینه بر اساس وضعیت
                  const statusBg = getStatusColor(ad.adStatus);

                  // تصویر اصلی
                  const firstImageUrl =
                    ad.images?.[0]?.url || "/images/ResUser.jpg";
                  console.log(
                    `🖼️ [MyAdsSection] آگهی ${ad.id} (${displayTitle}) -> وضعیت: ${ad.adStatus || "نامشخص"}، تصویر: ${firstImageUrl}`,
                  );

                  if (!isMobile) {
                    return (
                      <div
                        key={ad.id}
                        className={`relative border p-2 rounded-md shadow-sm flex flex-row-reverse items-center gap-4 max-w-full overflow-hidden ${statusBg}`}
                      >
                        <button
                          onClick={() => setDeleteModalAd(ad)}
                          className="absolute left-2 top-2 w-6 h-6 flex items-center justify-center rounded-full shadow-md z-10"
                          style={{ background: "#EDEDED" }}
                          aria-label="حذف آگهی"
                        >
                          <img
                            src="/images/delete_icon.svg"
                            alt="delete"
                            className="w-4 h-4"
                          />
                        </button>
                        <div className="flex-1 min-w-0 flex flex-col gap-1">
                          <h3 className="font-semibold text-[#143A62] truncate">
                            {displayTitle}
                          </h3>
                          {displayDescription && (
                            <p className="text-[#143A62D9] text-[2vh] max-w-[50%] truncate">
                              {displayDescription}
                            </p>
                          )}
                          {displayCategory && (
                            <p className="text-[#143A62D9] text-[2vh] truncate">
                              {displayCategory}
                            </p>
                          )}
                          {displayPrice && (
                            <p className="text-[#143A62D9] text-[2vh]">
                              {displayPrice}
                            </p>
                          )}
                          <small className="text-[#1143A62] text-[2vh] block whitespace-normal leading-relaxed">
                            <span className="inline-block ml-0.5">
                              {locationStr}
                            </span>
                            <span className="bg-[#143A62] rounded-md px-[0.5vw] mx-0.5 text-white whitespace-nowrap inline-block">
                              {getRelativeTime(ad.createdAt)}
                            </span>
                            {/* نمایش وضعیت به صورت متن کوتاه */}
                            <span className="inline-block mr-2 px-2 py-0.5 rounded text-xs font-medium">
                              {ad.adStatus === "approved" && "✓ تأیید شده"}
                              {ad.adStatus === "pending" && "⏳ در انتظار"}
                              {ad.adStatus === "pending_payment" &&
                                "💳 منتظر پرداخت"}
                              {ad.adStatus === "rejected" && "✗ رد شده"}
                              {ad.adStatus === "expired" && "⌛ منقضی"}
                            </span>
                          </small>
                        </div>
                        <div className="w-20 h-20 rounded-md overflow-hidden border border-gray-300 flex-shrink-0">
                          <img
                            src={firstImageUrl}
                            alt="عکس آگهی"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error(
                                `❌ [MyAdsSection] بارگذاری تصویر برای آگهی ${ad.id} با خطا مواجه شد:`,
                                e,
                              );
                              e.currentTarget.src = "/images/ResUser.jpg";
                            }}
                          />
                        </div>
                        <div className="absolute left-4 bottom-2 flex gap-[0.8vw]">
                          <button
                            onClick={() => setVisitStatsModalAd(ad)}
                            className="bg-sky-300 text-white px-[0.5vw] py-1 rounded-md text-[1.8vh]"
                          >
                            آمار بازدید
                          </button>
                          <button
                            onClick={() => setRenewModalAd(ad)}
                            className="bg-orange-500 text-white px-[0.5vw] py-1 rounded-md text-[1.8vh]"
                          >
                            تمدید
                          </button>
                          <button
                            onClick={() => setEditingAdId(ad.id)}
                            className="bg-blue-900 text-white px-[0.5vw] py-1 rounded-md text-[1.8vh]"
                          >
                            ویرایش
                          </button>
                        </div>
                      </div>
                    );
                  }

                  // نسخه موبایل
                  return (
                    <div
                      key={ad.id}
                      className={`relative border p-2 rounded-md shadow-sm flex flex-col items-center gap-2 ${statusBg}`}
                    >
                      <button
                        onClick={() => setDeleteModalAd(ad)}
                        className="absolute left-2 top-2 w-6 h-6 flex items-center justify-center rounded-full shadow-md z-10"
                        style={{ background: "#EDEDED" }}
                        aria-label="حذف آگهی"
                      >
                        <img
                          src="/images/delete_icon.svg"
                          alt="delete"
                          className="w-4 h-4"
                        />
                      </button>
                      <div className="w-24 h-24 rounded-md overflow-hidden border border-gray-300 flex-shrink-0">
                        <img
                          src={firstImageUrl}
                          alt="عکس آگهی"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error(
                              `❌ [MyAdsSection] بارگذاری تصویر برای آگهی ${ad.id} با خطا مواجه شد:`,
                              e,
                            );
                            e.currentTarget.src = "/images/ResUser.jpg";
                          }}
                        />
                      </div>
                      <h3 className="font-semibold text-[#143A62] truncate w-full text-center">
                        {displayTitle}
                      </h3>
                      {displayDescription && (
                        <p className="text-[#143A62D9] text-center text-sm break-words w-full">
                          {displayDescription}
                        </p>
                      )}
                      {displayCategory && (
                        <p className="text-[#143A62D9] text-center text-sm break-words w-full">
                          {displayCategory}
                        </p>
                      )}
                      {displayPrice && (
                        <p className="text-[#143A62D9] text-center text-sm">
                          {displayPrice}
                        </p>
                      )}
                      <small className="text-[#1143A62] text-center break-words whitespace-normal w-full block leading-relaxed">
                        <span className="inline-block mx-0.5">
                          {locationStr}
                        </span>
                        <span className="bg-[#143A62] rounded-md px-1 mx-1 text-white whitespace-nowrap inline-block">
                          {getRelativeTime(ad.createdAt)}
                        </span>
                        <span className="block mt-1 text-xs font-medium">
                          {ad.adStatus === "approved" && "✓ تأیید شده"}
                          {ad.adStatus === "pending" && "⏳ در انتظار"}
                          {ad.adStatus === "pending_payment" &&
                            "💳 منتظر پرداخت"}
                          {ad.adStatus === "rejected" && "✗ رد شده"}
                          {ad.adStatus === "expired" && "⌛ منقضی"}
                        </span>
                      </small>
                      <div className="flex gap-3 mt-2 flex-wrap justify-center">
                        <button
                          onClick={() => setVisitStatsModalAd(ad)}
                          className="bg-sky-300 text-white px-4 py-1 rounded-md text-sm"
                        >
                          آمار بازدید
                        </button>
                        <button
                          onClick={() => setRenewModalAd(ad)}
                          className="bg-orange-500 text-white px-4 py-1 rounded-md text-sm"
                        >
                          تمدید
                        </button>
                        <button
                          onClick={() => setEditingAdId(ad.id)}
                          className="bg-blue-900 text-white px-4 py-1 rounded-md text-sm"
                        >
                          ویرایش
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {renewModalAd && (
        <RenewAdPaymentModal
          isOpen={true}
          ad={renewModalAd}
          onClose={() => setRenewModalAd(null)}
        />
      )}
      {visitStatsModalAd && (
        <VisitStatsModal
          isOpen={true}
          adId={visitStatsModalAd.id}
          adType={
            activeType === "employer"
              ? "EmployerAd"
              : activeType === "seeker"
                ? "JobSeekerAd"
                : activeType === "seller"
                  ? "SellerAd"
                  : "DigitalAd"
          }
          onClose={() => setVisitStatsModalAd(null)}
        />
      )}
      <DeleteConfirmationModal
        isOpen={!!deleteModalAd}
        onClose={() => setDeleteModalAd(null)}
        onConfirm={handleDeleteAd}
        adTitle={deleteModalAd?.title || deleteModalAd?.name || ""}
        isDeleting={deleting}
      />
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        style={{ zIndex: 9999 }}
      />
    </div>
  );
};

export default MyAdsSection;
