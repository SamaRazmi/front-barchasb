"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { useFilters } from "@/context/FiltersContext";
import { setMarkedCache } from "@/utils/markedCache";

interface KioskCardProps {
  id: string;
  title: string;
  city: string;
  price: string;
  imageSrc: string;
  initialMarked?: boolean;
  adType?: string;
  adId?: string;
  onViewTrack?: (adId: string, adType: string) => Promise<any>;
  onMarkToggle?: (id: string, marked: boolean) => void;
  badgeType?: "peleh" | "vijeh" | "peleh_vijeh" | null;
}

const KioskContent: React.FC<KioskCardProps> = ({
  id,
  title,
  city,
  price,
  imageSrc,
  initialMarked,
  adType,
  adId,
  onViewTrack,
  onMarkToggle,
  badgeType,
}) => {
  const router = useRouter();
  const { user } = useUser();
  const { activeTab, setActiveTab } = useFilters();

  const [marked, setMarked] = useState(initialMarked || false);

  const getAdType = () => {
    if (activeTab === "karjo") return "JobSeekerAd";
    if (activeTab === "karfarma") return "EmployerAd";
    return "SellerAd";
  };

  const handleMarkAd = async () => {
    if (!user) return;
    const adTypeParam = getAdType();
    try {
      // ✅ تغییر: استفاده از مسیر نسبی پروکسی
      const res = await fetch(`/api/ads/${id}/mark`, {
        method: "POST",
        credentials: "include", // ارسال کوکی‌ها (شامل accessToken)
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, adType: adTypeParam }),
      });
      const data = await res.json();
      setMarked(data.marked);
      setMarkedCache(id, adTypeParam, user.id, data.marked);
      if (onMarkToggle) onMarkToggle(id, data.marked);
    } catch {
      setMarked(false);
    }
  };

  const handleMoreDetails = async () => {
    if (onViewTrack && adId && adType) await onViewTrack(adId, adType);
    setActiveTab("agahi");
    router.push(`/dashboard/ads/${id}?adType=SellerAd`);
  };

  const getShadow = () => {
    switch (badgeType) {
      case "peleh":
        return "0px 3px 15px 0px #00000033";
      case "vijeh":
        return "0px 3px 15px 0px #E86D2080";
      case "peleh_vijeh":
        return "0px 3px 15px 0px #E86D2080, 1px 1px 6px 0px #F43E3E80";
      default:
        return "0px 4px 6px rgba(0,0,0,0.1)";
    }
  };

  const getBadgeIcon = () => {
    switch (badgeType) {
      case "peleh":
        return "/images/peleh_icon.svg";
      case "vijeh":
        return "/images/vijeh_icon.svg";
      case "peleh_vijeh":
        return "/images/peleh_vijeh_icon.svg";
      default:
        return null;
    }
  };

  const getIconClasses = () => {
    if (badgeType === "peleh") {
      return "absolute top-[0.8vh] left-[0.8vh] h-[3.5vh] w-[3.5vh] md:w-[6vh] md:h-[6vh] z-[999] z-[999] md:z-[9999]";
    } else if (badgeType === "peleh_vijeh") {
      return "absolute top-[-0.2vh] left-[-0.3vh] h-[4vh] w-[4vh] md:h-[10vh] md:w-[10vh] z-[999] z-[999] md:z-[9999]";
    } else {
      return "absolute top-[-0.3vh] left-[-0.4vh] h-[4.5vh] w-[4.5vh] md:w-[8vh] md:h-[8vh] z-10";
    }
  };

  const getBorderStyle = () => {
    if (badgeType === "vijeh" || badgeType === "peleh_vijeh") {
      return { border: "2px solid #E86D20" };
    }
    return {};
  };

  const shadowStyle = { boxShadow: getShadow() };
  const borderStyle = getBorderStyle();
  const badgeIcon = getBadgeIcon();

  return (
    <div
      className="w-full m-1 p-3 md:p-4 md:m-1 flex flex-col justify-between bg-white rounded-2xl md:rounded-3xl shadow-lg min-h-[18vh] md:h-[38vh] overflow-hidden relative cursor-pointer hover:scale-[1.02] hover:shadow-2xl transition-all duration-200 ease-in-out"
      style={{ ...shadowStyle, ...borderStyle }}
      onClick={handleMoreDetails}
    >
      {badgeIcon && (
        <img
          src={badgeIcon}
          alt="badge"
          className={getIconClasses()}
          onClick={(e) => e.stopPropagation()}
        />
      )}

      <div className="flex justify-center">
        <img
          src={imageSrc}
          alt={title}
          className="w-[14vh] h-[14vh] rounded-[1.5vh] object-cover"
        />
      </div>

      <h3 className="text-[#143A62] font-medium text-[1.6vh] sm:text-[2.4vh] text-center mt-[0.5vh] md:mt-[1vh] leading-tight md:leading-normal truncate">
        {title}
      </h3>

      <div
        className="my-[0.5vh]"
        style={{
          borderBottom: "1px solid transparent",
          borderImageSource:
            "linear-gradient(90deg, rgba(20, 58, 98, 0.05) 0%, #143A62 48.08%, rgba(20, 58, 98, 0.05) 100%)",
          borderImageSlice: 1,
        }}
      ></div>

      <div className="flex justify-start items-center gap-[1vh] md:gap-[2vh] mt-[0.5vh] md:mt-[1vh]">
        <div className="bg-gray-50 text-[#143A62] rounded-xl py-1 px-2 md:py-2 md:px-3 inline-flex items-center">
          <img
            src="/images/citycard-icon.svg"
            alt="City"
            className="w-[2vh] h-[2vh] ml-1"
          />
          <p className="text-[#143A62] text-[1.2vh] sm:text-[1.7vh] font-normal leading-tight md:leading-normal line-clamp-2">
            {city}
          </p>
        </div>

        <div className="bg-gray-50 text-[#143A62] rounded-xl py-1 px-2 md:py-[0.5vh] md:px-[2vh] inline-flex items-center">
          <p className="text-[#143A62] text-[1.2vh] sm:text-[1.7vh] font-medium leading-tight md:leading-normal line-clamp-2">
            {price}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center mt-[0.5vh] md:mt-[0.5vh] space-x-[0.5vh] md:space-x-[1vh]">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleMarkAd();
          }}
          className={`w-[20%] h-[4vh] sm:h-[5vh] rounded-[10px] flex justify-center items-center transition-colors border border-[#143A62] ${
            marked ? "bg-[#143A62]" : "bg-[#FFFFFF]"
          }`}
        >
          <img
            src={
              marked
                ? "/images/addcard-icon.svg"
                : "/images/addcard-icon-white.svg"
            }
            alt="Icon"
            className="w-[2vh] h-[2vh]"
          />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleMoreDetails();
          }}
          className="flex flex-row-reverse items-center w-[calc(100%-18%-1rem)] sm:w-[calc(100%-20%-1rem)] h-[4vh] sm:h-[5vh] bg-[#143A62] rounded-[10px] text-white pl-2 sm:pr-3 sm:pl-1 justify-start"
        >
          <img
            src="/images/more-option-icon.svg"
            alt="Options"
            className="w-[2vh] h-[2vh] mr-1 md:ml-2"
          />
          <span className="font-semibold text-[1.2vh] sm:text-[2vh] pr-2 sm:pl-1 whitespace-nowrap leading-tight md:leading-normal">
            جزئیات بیشتر
          </span>
        </button>
      </div>
    </div>
  );
};

export default KioskContent;
