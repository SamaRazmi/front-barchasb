"use client";

import React, { useState, useEffect, useCallback } from "react";
import TopBar from "@/components/common/TopBar";
import ProjectsFilter from "./Desk/ProjectsFilter";
import Content from "./Desk/Content";
import { fetchDigitalAds } from "@/api/apiDigitalFilter";
import { DigitalAd } from "@/types/digitalTypes";
import { trackAdView } from "@/api/apiAdView";

const PAGE_SIZE = 9;

const Projects: React.FC = () => {
  const [filters, setFilters] = useState({
    searchText: "",
    minBudget: "",
    maxBudget: "",
    timeFilter: "",
    cities: [] as string[],
    requestType: "" as "requester" | "provider" | "",
    durationUnit:
      "" as
        | "minute"
        | "hour"
        | "day"
        | "month"
        | "year"
        | "",
    durationAmount: "",
    remote: false,
  });

  // =========================
  // آگهی‌ها
  // =========================
  const [ads, setAds] = useState<DigitalAd[]>([]);
  const [filteredAds, setFilteredAds] = useState<DigitalAd[]>([]);

  // =========================
  // Pagination
  // =========================
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [showMobileFilters, setShowMobileFilters] =
    useState(false);

  // =========================
  // دریافت آگهی‌های دیجیتال
  // =========================
  const loadAds = useCallback(
    async (
      pageNumber: number,
      reset: boolean = false,
    ) => {
      // صفحه اول
      if (reset || pageNumber === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const apiFilters = {
          q:
            filters.searchText ||
            undefined,

          minBudget: filters.minBudget
            ? parseInt(
                filters.minBudget.replace(/,/g, ""),
                10,
              )
            : undefined,

          maxBudget: filters.maxBudget
            ? parseInt(
                filters.maxBudget.replace(/,/g, ""),
                10,
              )
            : undefined,

          timeFilter:
            filters.timeFilter ||
            undefined,

          city:
            filters.cities.length
              ? filters.cities.join(",")
              : undefined,

          requestType:
            filters.requestType ||
            undefined,

          durationUnit:
            filters.durationUnit ||
            undefined,

          durationAmount:
            filters.durationAmount ||
            undefined,

          remote:
            filters.remote
              ? true
              : undefined,

          // Pagination
          page: pageNumber,
          limit: PAGE_SIZE,
        };

        console.log(
          "📦 دریافت آگهی‌های دیجیتال:",
          {
            page: pageNumber,
            limit: PAGE_SIZE,
            filters: apiFilters,
          },
        );

        const result =
          await fetchDigitalAds(apiFilters);

        const dataArray =
          result.data || [];

        const adsWithType =
          dataArray.map(
            (ad: DigitalAd) => ({
              ...ad,
              adType: "DigitalAd",
            }),
          );

        // =========================
        // صفحه اول
        // =========================
        if (
          reset ||
          pageNumber === 1
        ) {
          setAds(adsWithType);
          setFilteredAds(adsWithType);
        } else {
          // =========================
          // صفحات بعدی
          // اضافه کردن به قبلی‌ها
          // =========================
          setAds((prev) => [
            ...prev,
            ...adsWithType,
          ]);

          setFilteredAds((prev) => [
            ...prev,
            ...adsWithType,
          ]);
        }

        // =========================
        // محاسبه hasMore
        // =========================
        const more =
          adsWithType.length ===
            PAGE_SIZE ||
          pageNumber <
            (result.totalPages ?? 1);

        setHasMore(more);
        setPage(pageNumber);

        console.log(
          "📊 Pagination دیجیتال:",
          {
            currentPage:
              pageNumber,
            totalPages:
              result.totalPages,
            received:
              adsWithType.length,
            hasMore: more,
          },
        );
      } catch (error) {
        console.error(
          "❌ خطا در دریافت آگهی‌های دیجیتال:",
          error,
        );

        if (
          reset ||
          pageNumber === 1
        ) {
          setAds([]);
          setFilteredAds([]);
        }

        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filters],
  );

  // =========================
  // تغییر فیلترها
  // همیشه از صفحه ۱ شروع شود
  // =========================
  useEffect(() => {
    setPage(1);
    setHasMore(true);

    loadAds(1, true);
  }, [filters, loadAds]);

  // =========================
  // آگهی‌های بیشتر
  // =========================
  const loadMoreAds = () => {
    if (
      !hasMore ||
      loadingMore ||
      loading
    ) {
      return;
    }

    loadAds(page + 1, false);
  };

  return (
    <div className="flex flex-col h-[88vh] md:h-[88vh] overflow-y-hidden">
      {/* =====================================================
          دسکتاپ
      ====================================================== */}
      <div className="hidden md:flex md:flex-col md:h-full sm:p-[1vh]">
        <TopBar />

        <div className="flex-1 bg-[#F5F5F5] rounded-[16px] p-4 h-full flex flex-row relative mt-[1%]">
          {/* فیلتر */}
          <div className="w-1/4 h-full pl-4">
            <ProjectsFilter
              filters={filters}
              setFilters={setFilters}
            />
          </div>

          {/* خط جداکننده */}
          <div
            className="w-[3px] h-full"
            style={{
              borderLeft: "3px solid",
              borderImageSource:
                "linear-gradient(180deg, rgba(20, 58, 98, 0) 0%, #143A62 50%, rgba(20, 58, 98, 0) 100%)",
              borderImageSlice: 1,
            }}
          />

          {/* محتوا */}
          <div className="w-3/4 h-full lg:pr-4 overflow-y-auto">
            <Content
              ads={filteredAds}
              onTrackView={trackAdView}
              hasMore={hasMore}
              loadingMore={loadingMore}
              onLoadMore={loadMoreAds}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* =====================================================
          موبایل
      ====================================================== */}
      <div className="flex md:hidden flex-col h-full bg-[#F5F5F5] p-2">
        <button
          onClick={() =>
            setShowMobileFilters(true)
          }
          className="mb-2 bg-[#143A62] text-white py-2 rounded-xl font-medium shadow-md active:scale-95 transition-transform"
        >
          🔍 فیلترها
        </button>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <Content
            ads={filteredAds}
            onTrackView={trackAdView}
            hasMore={hasMore}
            loadingMore={loadingMore}
            onLoadMore={loadMoreAds}
            loading={loading}
          />
        </div>
      </div>

      {/* =====================================================
          مودال فیلتر موبایل
      ====================================================== */}
      {showMobileFilters && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end md:hidden"
          onClick={() =>
            setShowMobileFilters(false)
          }
        >
          <div
            className="bg-white w-full rounded-t-2xl max-h-[85vh] overflow-y-auto p-4 animate-slide-up"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#143A62]">
                فیلترها
              </h3>

              <button
                onClick={() =>
                  setShowMobileFilters(false)
                }
                className="text-gray-500 text-2xl"
              >
                ✕
              </button>
            </div>

            <ProjectsFilter
              filters={filters}
              setFilters={setFilters}
            />

            <button
              onClick={() =>
                setShowMobileFilters(false)
              }
              className="w-full mt-4 bg-[#143A62] text-white py-2 rounded-xl font-medium"
            >
              اعمال فیلترها
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          انیمیشن موبایل
      ====================================================== */}
      <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }

          to {
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Projects;