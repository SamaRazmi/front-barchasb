"use client";

import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

export type ReportTargetType =
  | "employerAd"
  | "jobSeekerAd"
  | "sellerAd"
  | "DigitalAd"
  | "chat";

export type AdTypeForChat =
  | "employerAd"
  | "jobSeekerAd"
  | "sellerAd"
  | "DigitalAd";

interface ReportDropdownProps {
  targetId: string;
  reportType: ReportTargetType;
  adTypeForChat?: AdTypeForChat;
  iconSrc: string;
  placement?: "ad" | "chat";
  className?: string;
  ownerId?: string;
}

interface ReportReason {
  id: string;
  key: string;
  label: string;
  description: string;
}

const ReportDropdown: React.FC<ReportDropdownProps> = ({
  targetId,
  reportType,
  adTypeForChat,
  iconSrc,
  placement = "ad",
  className = "",
  ownerId,
}) => {
  const { user } = useUser();
  const isLoggedIn = !!user;

  const router = useRouter();

  if (!isLoggedIn) {
    return null;
  }

  if (ownerId && user.id === ownerId) {
    return null;
  }

  const [showDropdown, setShowDropdown] = useState(false);
  const [step, setStep] = useState<"list" | "detail">("list");
  const [reasons, setReasons] = useState<ReportReason[]>([]);
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(
    null,
  );
  const [reporting, setReporting] = useState(false);
  const [loading, setLoading] = useState(true);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  const getApiType = (): string => {
    if (reportType === "chat") {
      return adTypeForChat ? `chat_${adTypeForChat}` : "general";
    }
    return reportType;
  };

  useEffect(() => {
    const fetchReasons = async () => {
      try {
        setLoading(true);
        const typeParam = getApiType();
        const res = await fetch(`/api/report-reasons?type=${typeParam}`, {
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error("خطا در دریافت لیست دلایل گزارش");
        }
        const data = await res.json();
        setReasons(data);
      } catch (err) {
        toast.error("خطا در دریافت لیست دلایل گزارش");
      } finally {
        setLoading(false);
      }
    };
    fetchReasons();
  }, [reportType, adTypeForChat]);

  const getEndpoint = (): string => {
    switch (reportType) {
      case "employerAd":
        return `/api/employer/report/${targetId}`;
      case "jobSeekerAd":
        return `/api/job-seeker/report/${targetId}`;
      case "sellerAd":
        return `/api/seller/report/${targetId}`;
      case "DigitalAd":
        return `/api/digital/report/${targetId}`;
      case "chat":
        return `/api/chat/report/${targetId}`;
      default:
        return `/api/report/${targetId}`;
    }
  };

  const toggleDropdown = () => {
    if (!user) {
      toast.warn("لطفاً ابتدا وارد حساب کاربری خود شوید", {
        position: "bottom-right",
        autoClose: 3000,
        onClick: () => router.push("/login"),
      });
      return;
    }
    setShowDropdown((prev) => !prev);
    setStep("list");
    setSelectedReason(null);
  };

  const handleReasonSelect = (reason: ReportReason) => {
    setSelectedReason(reason);
    setStep("detail");
  };

  const handleBack = () => {
    setStep("list");
    setSelectedReason(null);
  };

  const submitReport = async () => {
    if (!selectedReason) return;
    setReporting(true);
    try {
      const endpoint = getEndpoint();
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          reason: selectedReason.label,
          description: selectedReason.description,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `Server responded with status ${res.status}: ${errorText}`,
        );
      }

      toast.success("گزارش شما با موفقیت ثبت شد");
      setShowDropdown(false);
      setStep("list");
      setSelectedReason(null);
    } catch (err: any) {
      toast.error(err.message || "خطا در ثبت گزارش، لطفاً مجدداً تلاش کنید");
    } finally {
      setReporting(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        iconRef.current &&
        !iconRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setStep("list");
        setSelectedReason(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  let dropdownClasses = "";
  let dropdownWidth = "";
  if (placement === "chat") {
    dropdownClasses =
      "absolute top-full left-[20vh] transform -translate-x-1/2 mt-2 rounded-b-2xl rounded-t-none z-[9999]";
    dropdownWidth = "w-60";
  } else {
    if (isDesktop) {
      dropdownClasses =
        "absolute bottom-full left-5 mb-2 rounded-t-xl rounded-br-xl rounded-bl-none";
    } else {
      dropdownClasses =
        "absolute bottom-full left-[2vh] transform -translate-x-1/2 mt-2 rounded-b-2xl rounded-b-none z-[9999]";
    }
    dropdownWidth = "w-64";
  }

  const iconBaseClasses =
    "rounded-full flex items-center justify-center cursor-pointer";
  const iconSizeClass =
    placement === "chat" ? "w-[4vh] h-[4vh]" : "w-[6vh] h-[6vh]";
  const iconStyle =
    placement === "chat"
      ? { background: "#143A6233", boxShadow: "0px 0px 5px 0px #00000026" }
      : { background: "#D1D5DB" };

  return (
    <div className="relative inline-block">
      <div
        ref={iconRef}
        className={`${iconBaseClasses} ${iconSizeClass} ${className}`}
        style={iconStyle}
        onClick={toggleDropdown}
      >
        <img
          src={iconSrc}
          alt="report"
          className="w-1/2 h-1/2 object-contain"
        />
      </div>
      {showDropdown && (
        <div
          ref={dropdownRef}
          className={`${dropdownClasses} ${dropdownWidth} bg-white shadow-lg border border-gray-200 z-50`}
        >
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              در حال بارگذاری...
            </div>
          ) : step === "list" ? (
            <div className="py-2">
              {reasons.length === 0 ? (
                <div className="p-4 text-center text-gray-400">
                  هیچ دلیلی یافت نشد
                </div>
              ) : (
                reasons.map((reason) => (
                  <button
                    key={reason.id}
                    onClick={() => handleReasonSelect(reason)}
                    className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    {reason.label}
                  </button>
                ))
              )}
            </div>
          ) : (
            selectedReason && (
              <div className="p-4 min-w-[200px]">
                <h4 className="font-bold text-gray-800 mb-1">
                  {selectedReason.label}
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  {selectedReason.description}
                </p>
                <div className="flex gap-2 justify-between">
                  <button
                    onClick={handleBack}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-xl text-sm hover:bg-gray-300 transition-colors"
                  >
                    بازگشت
                  </button>
                  <button
                    onClick={submitReport}
                    disabled={reporting}
                    className="flex-1 bg-[#143A62] text-white py-2 rounded-xl text-sm disabled:opacity-50 hover:bg-[#0f2e4a] transition-colors"
                  >
                    {reporting ? "در حال ارسال..." : "ثبت گزارش"}
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default ReportDropdown;
