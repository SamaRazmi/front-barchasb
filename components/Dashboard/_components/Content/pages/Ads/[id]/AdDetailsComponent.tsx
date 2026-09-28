"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useFilters } from "@/context/FiltersContext";
import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import TopBar from "@/components/common/TopBar";
import EmployerAdDetails from "./___components/EmployerAdDetails";
import JobSeekerAdDetails from "./___components/JobSeekerAdDetails";
import SellerAdDetails from "./___components/SellerAdDetails";
import DigitalAdDetails from "../../Projects/[id]/DigitalAdDetails";
import { addRecentView } from "@/api/apiRecentViews";
import { useUser } from "@/context/UserContext";

// نوع تب‌ها منطبق با context (بدون digital)
type TabKey = "karjo" | "karfarma" | "agahi";

interface AdDetailsComponentProps {
  adId?: string;
}

const AdDetailsComponent = ({ adId: propAdId }: AdDetailsComponentProps) => {
  const params = useParams();
  const searchParams = useSearchParams();
  const { activeTab, setActiveTab } = useFilters();
  const { user, loading: userLoading } = useUser();

  const paramsId = params?.id
    ? Array.isArray(params.id)
      ? params.id[0]
      : params.id
    : undefined;
  const adId = propAdId || paramsId;

  const adTypeFromQuery = searchParams.get("adType");

  // هماهنگ‌سازی تب با adType موجود در کوئری (فقط برای سه نوع اصلی)
  useEffect(() => {
    if (!adTypeFromQuery) return;

    let expectedTab: TabKey | null = null;
    if (adTypeFromQuery === "JobSeekerAd") expectedTab = "karjo";
    else if (adTypeFromQuery === "EmployerAd") expectedTab = "karfarma";
    else if (adTypeFromQuery === "SellerAd") expectedTab = "agahi";
    // برای DigitalAd تب را تغییر نمی‌دهیم (چون در context وجود ندارد)

    if (expectedTab && activeTab !== expectedTab) {
      setActiveTab(expectedTab);
    }
  }, [adTypeFromQuery, activeTab, setActiveTab]);

  // تعیین نوع آگهی: اولویت با query param است، در غیر این صورت بر اساس تب فعال
  const getAdType = (): string => {
    if (adTypeFromQuery) return adTypeFromQuery;
    // اگر تب فعال باشد، نوع آن را برمی‌گردانیم (فقط سه نوع اصلی)
    switch (activeTab) {
      case "karfarma":
        return "EmployerAd";
      case "karjo":
        return "JobSeekerAd";
      case "agahi":
        return "SellerAd";
      default:
        return "SellerAd";
    }
  };
  const adType = getAdType();

  // ثبت بازدید اخیر
  const mutation = useMutation({
    mutationFn: ({
      ownerId,
      adId,
      adType,
    }: {
      ownerId: string;
      adId: string;
      adType: string;
    }) => addRecentView(ownerId, adId, adType),
    onSuccess: (data) => console.log("✅ بازدید اخیر ثبت شد:", data),
    onError: (err) => console.error("❌ ثبت بازدید شکست خورد:", err),
  });

  useEffect(() => {
    if (!adId || !user?.id || userLoading) return;
    mutation.mutate({ ownerId: user.id, adId, adType });
  }, [adId, user, userLoading, adType]);

  if (!adId)
    return <p className="p-4 text-center">آگهی یافت نشد (شناسه نامعتبر)</p>;

  // رندر کامپوننت مناسب بر اساس نوع آگهی (شامل DigitalAd)
  let AdComponent;
  switch (adType) {
    case "EmployerAd":
      AdComponent = <EmployerAdDetails id={adId} />;
      break;
    case "JobSeekerAd":
      AdComponent = <JobSeekerAdDetails id={adId} />;
      break;
    case "SellerAd":
      AdComponent = <SellerAdDetails id={adId} />;
      break;
    case "DigitalAd":
      AdComponent = <DigitalAdDetails id={adId} />;
      break;
    default:
      AdComponent = <p>نوع آگهی نامشخص است</p>;
  }

  return (
    <div className="flex flex-col w-full">
      <div className="hidden md:block">
        <TopBar />
      </div>
      <div className="flex flex-col md:flex-row gap-6 mt-4">
        <div className="w-full md:w-2/3">{AdComponent}</div>
        <div className="hidden md:flex md:w-1/3 bg-gray-50 items-center justify-center rounded-2xl h-[78vh]">
          <p className="[writing-mode:vertical-rl] text-[18vh] leading-none font-bold text-[#143A624D]">
            تبلیغات
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdDetailsComponent;
