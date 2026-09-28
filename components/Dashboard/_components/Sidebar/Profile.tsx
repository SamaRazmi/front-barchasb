"use client";

import React, { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import MoreOptions from "./MoreOptions";

// ---------- ثابت‌های آیکون‌ها ----------
const ICON_PATHS = {
  EDIT: "/images/edit.svg",
  OPTIONS: "/images/3-dots.svg",
} as const;

// ---------- کامپوننت دکمه آیکون (بدون تغییر) ----------
const IconButton: React.FC<{
  src: string;
  alt: string;
  width: number;
  height: number;
  tooltip?: string;
  emoji?: string;
  onClick?: () => void;
}> = ({ src, alt, width, height, tooltip, emoji, onClick }) => (
  <div className="relative flex flex-col items-center group">
    <button
      onClick={onClick}
      aria-label={alt}
      className="w-[6vh] h-[6vh] rounded-full bg-[#FFFFFF4D] flex items-center justify-center hover:opacity-80 transition-opacity"
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="object-contain"
        unoptimized
      />
    </button>
    {tooltip && (
      <span
        className="
          hidden md:flex
          pointer-events-none
          absolute -top-10
          rounded-lg bg-black text-white px-1 py-1 text-[1.5vh]
          whitespace-nowrap
          opacity-0 group-hover:opacity-100
          transition-opacity duration-200
          items-center gap-1
        "
      >
        {emoji && <span className="text-[1.6vh]">{emoji}</span>} {tooltip}
      </span>
    )}
  </div>
);

// ---------- کامپوننت اصلی Profile ----------
const Profile: React.FC = () => {
  const router = useRouter();
  const { user, profileImage } = useUser(); // فقط از Context می‌خوانیم، دیگر درخواست API نداریم

  // استخراج اطلاعات از user
  const gender = user?.gender;
  const fullName = useMemo(
    () => (user ? `${user.name || ""} ${user.lastName || ""}`.trim() : ""),
    [user],
  );

  const [imageError, setImageError] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  // تابع تعیین آواتار پیش‌فرض بر اساس جنسیت
  const getDefaultAvatar = useCallback(() => {
    const normalizedGender = gender?.toLowerCase?.();
    if (normalizedGender === "female" || normalizedGender === "زن") {
      return "/images/women_default.svg";
    }
    if (normalizedGender === "male" || normalizedGender === "مرد") {
      return "/images/men_default.svg";
    }
    return "/images/user.png";
  }, [gender]);

  // تعیین تصویر نهایی با در نظر گرفتن خطا
  const finalImage = useMemo(() => {
    if (imageError) {
      return getDefaultAvatar();
    }
    if (profileImage) {
      return profileImage;
    }
    return getDefaultAvatar();
  }, [imageError, profileImage, getDefaultAvatar]);

  // مدیریت خطای لود تصویر
  const handleImageError = useCallback(() => {
    console.error("❌ خطا در لود تصویر:", finalImage);
    setImageError(true);
  }, [finalImage]);

  // ---------- Event handlers ----------
  const handleEditClick = useCallback(() => {
    router.push("/dashboard/myads?activeTab=profile");
  }, [router]);

  const handleOptionsClick = useCallback(() => {
    setShowOptions(true);
  }, []);

  const handleBack = useCallback(() => {
    setShowOptions(false);
  }, []);

  const handleSharePlan = useCallback(() => {
    router.push("/dashboard/billing");
  }, [router]);

  const handleMyProjects = useCallback(() => {
    router.push("/dashboard/myads?activeTab=myAds");
  }, [router]);

  const handleBookmarks = useCallback(() => {
    router.push("/dashboard/myads?activeTab=achievements");
  }, [router]);

  // اگر مود MoreOptions فعال باشد، آن را نمایش بده
  if (showOptions) {
    return (
      <MoreOptions
        onSharePlan={handleSharePlan}
        onMyProjects={handleMyProjects}
        onBookmarks={handleBookmarks}
        onBack={handleBack}
      />
    );
  }

  // ---------- JSX ----------
  return (
    <div className="w-full h-full bg-[#FFFFFF33] rounded-[16px] flex flex-col items-center justify-between py-[1.6vh] px-[2.5vh]">
      {/* عکس پروفایل */}
      <div className="w-[12vh] h-[12vh] rounded-full overflow-hidden relative bg-white/10 flex items-center justify-center">
        {finalImage ? (
          <Image
            src={finalImage}
            alt={fullName ? `${fullName}'s profile picture` : "profile picture"}
            fill
            className="object-cover rounded-full"
            priority
            sizes="60px"
            unoptimized
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full bg-gray-300 animate-pulse rounded-full" />
        )}
      </div>

      {/* نام کامل */}
      <div className="w-full h-[6vh] flex flex-col items-center space-y-[0.5vh] mt-[1.5vh]">
        {fullName && (
          <h2 className="text-white text-[2.6vh] font-semibold text-center">
            {fullName}
          </h2>
        )}
      </div>

      {/* دکمه‌های پایین */}
      <div className="w-full flex justify-between items-center">
        <IconButton
          src={ICON_PATHS.OPTIONS}
          alt="گزینه‌های بیشتر"
          width={5}
          height={20}
          onClick={handleOptionsClick}
          tooltip="گزینه‌های بیشتر"
          emoji="⚙️"
        />

        <IconButton
          src={ICON_PATHS.EDIT}
          alt="ویرایش پروفایل"
          width={18}
          height={18}
          onClick={handleEditClick}
          tooltip="ویرایش پروفایل"
          emoji="✏️"
        />
      </div>
    </div>
  );
};

// جلوگیری از رندر مجدد بی‌دلیل با React.memo
export default React.memo(Profile);
