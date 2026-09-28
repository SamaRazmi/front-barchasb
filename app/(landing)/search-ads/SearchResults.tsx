"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  searchAds,
  type SearchFilters,
  type AdItem as BaseAdItem,
} from "@/api/apiSearch";

interface AdItem extends BaseAdItem {
  priceIRT?: number;
}

interface SearchResultsProps {
  filters?: SearchFilters;
}

export default function SearchResults({ filters = {} }: SearchResultsProps) {
  const stableFilters = useMemo(() => filters, [JSON.stringify(filters)]);
  console.log(
    "🧩 [Component] SearchResults rendered with stableFilters:",
    stableFilters,
  );

  const [ads, setAds] = useState<AdItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fetchCountRef = useRef(0);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      const fetchId = ++fetchCountRef.current;
      console.log(
        `🔍 [fetchData #${fetchId}] شروع fetch با فیلترها:`,
        stableFilters,
      );
      try {
        const result = await searchAds(stableFilters);
        if (!controller.signal.aborted) {
          console.log(
            `✅ [fetchData #${fetchId}] دریافت ${result.length} آگهی`,
          );
          setAds(result);
        }
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error(`❌ [fetchData #${fetchId}] خطا:`, err);
        if (!controller.signal.aborted) setError("خطا در دریافت نتایج جستجو");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    timeoutRef.current = setTimeout(fetchData, 300);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [stableFilters]);

  if (loading && ads.length === 0) {
    return <div className="p-4 text-center">در حال بارگذاری نتایج...</div>;
  }
  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }
  if (ads.length === 0 && !loading) {
    return <div className="p-4 text-center">هیچ آگهی‌ای یافت نشد.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {ads.map((ad, index) => {
        // 🔥 تصویر: اولویت با imageSrc (از سرور) و سپس اولین تصویر از آرایه images
        const imageUrl =
          (ad as any).imageSrc ||
          (ad.images && ad.images.length > 0 ? ad.images[0] : null);

        return (
          <div
            key={(ad as any)._id || ad.id || index}
            className="w-full p-3 flex flex-col items-center bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-200 ease-in-out cursor-pointer border border-gray-100"
          >
            {/* عکس با اندازه کوچک (مشابه KioskContent) */}
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={ad.title}
                className="w-[14vh] h-[14vh] rounded-xl object-cover"
              />
            ) : (
              <div className="w-[14vh] h-[14vh] rounded-xl bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                بدون عکس
              </div>
            )}

            {/* عنوان */}
            <h3 className="text-[#143A62] font-medium text-[1.6vh] sm:text-[2.4vh] text-center mt-2 leading-tight line-clamp-2">
              {ad.title}
            </h3>

            {/* خط جداکننده */}
            <div
              className="w-full my-2"
              style={{
                borderBottom: "1px solid transparent",
                borderImageSource:
                  "linear-gradient(90deg, rgba(20, 58, 98, 0.05) 0%, #143A62 48.08%, rgba(20, 58, 98, 0.05) 100%)",
                borderImageSlice: 1,
              }}
            />

            {/* دسته‌بندی و شهر */}
            <div className="flex justify-start items-center gap-2 w-full">
              <div className="bg-gray-50 text-[#143A62] rounded-xl py-1 px-2 inline-flex items-center">
                <img
                  src="/images/citycard-icon.svg"
                  alt="City"
                  className="w-4 h-4 ml-1"
                />
                <p className="text-[#143A62] text-sm font-normal line-clamp-1">
                  {ad.city || "نامشخص"}، {ad.state || ""}
                </p>
              </div>
              <div className="bg-gray-50 text-[#143A62] rounded-xl py-1 px-2 inline-flex items-center">
                <p className="text-[#143A62] text-sm font-medium line-clamp-1">
                  {ad.category || "دسته‌بندی نشده"}
                </p>
              </div>
            </div>

            {/* قیمت (اختیاری) */}
            {ad.priceIRT && (
              <p className="text-green-600 font-semibold text-sm mt-1 w-full text-right">
                {ad.priceIRT.toLocaleString()} تومان
              </p>
            )}

            {/* تاریخ */}
            <p className="text-xs text-gray-400 mt-1 w-full text-left">
              {new Date(ad.createdAt).toLocaleDateString("fa-IR")}
            </p>
          </div>
        );
      })}
      {loading && ads.length > 0 && (
        <div className="col-span-full text-center text-sm text-gray-500">
          در حال به‌روزرسانی...
        </div>
      )}
    </div>
  );
}
