"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useFilters } from "@/context/FiltersContext";
import { useUser } from "@/context/UserContext";
import CardContent from "./___components/CardContent";
import KioskContent from "./___components/KioskContent";
import { fetchJobSeekerAds } from "@/api/apiJobSeeker";
import { getSellerAds } from "@/api/apiSeller";
import { fetchEmployerAds } from "@/api/apiEmployer";
import { trackAdView } from "@/api/apiAdView";
import { BASE_URL } from "@/api/apiClient";
import { getMarkedCache, setMarkedCache } from "@/utils/markedCache";

interface Card {
  id: string;
  title: string;
  description?: string;
  city: string;
  rating?: string;
  price?: string;
  imageSrc?: string;
  typeWork?: string;
  category?: string;
  portfolio?: string;
  time?: string;
  adType?: string;
  adId?: string;
  badgeType?: "peleh" | "vijeh" | "peleh_vijeh" | null;
}

interface CacheData {
  cards: Card[];
  page: number;
  hasMore: boolean;
  timestamp?: number;
}

const mapTimeFilter = (
  selectedTime: string | null | undefined,
): string | undefined => {
  if (!selectedTime) return undefined;
  const map: Record<string, string> = {
    امروz: "today",
    "این هفته": "thisWeek",
    "این ماه": "thisMonth",
    امسال: "thisYear",
  };
  return map[selectedTime];
};

const PAGE_SIZE = 12;
const CACHE_PREFIX = "ads_cache_";
const CACHE_VERSION = "v5";
const CACHE_TTL = 5 * 60 * 1000; // 5 دقیقه

// ========== کش در حافظه (امن‌تر از localStorage) ==========
const memoryCache = new Map<string, CacheData>();

const getCacheKey = (tab: string, filters: any): string => {
  return `${CACHE_PREFIX}${CACHE_VERSION}_${tab}_${JSON.stringify(filters)}`;
};

const loadFromCache = (tab: string, filters: any): CacheData | null => {
  try {
    const key = getCacheKey(tab, filters);
    const data = memoryCache.get(key);
    if (!data) return null;
    if (data.timestamp && Date.now() - data.timestamp < CACHE_TTL) {
      return data;
    }
    memoryCache.delete(key);
    return null;
  } catch (e) {
    return null;
  }
};

const saveToCache = (tab: string, filters: any, data: CacheData) => {
  try {
    const key = getCacheKey(tab, filters);
    memoryCache.set(key, { ...data, timestamp: Date.now() });
  } catch (e) {
    // ignore
  }
};

// ======== تابع محاسبه badgeType از enhancements ========
const getBadgeFromEnhancements = (
  enhancements: any,
): "peleh" | "vijeh" | "peleh_vijeh" | null => {
  if (!enhancements) return null;
  const isSpecial = enhancements.isSpecial === true;
  const isLadder = enhancements.isLadder === true;
  if (isSpecial && isLadder) return "peleh_vijeh";
  if (isSpecial) return "vijeh";
  if (isLadder) return "peleh";
  return null;
};

const Content: React.FC = () => {
  const { activeTab, filters } = useFilters();
  const { user } = useUser();

  // ========== Stateهای کارجو ==========
  const [jobseekerCards, setJobseekerCards] = useState<Card[]>([]);
  const [loadingJobseeker, setLoadingJobseeker] = useState(false);
  const [loadingMoreJobseeker, setLoadingMoreJobseeker] = useState(false);
  const [jobseekerPage, setJobseekerPage] = useState(1);
  const [jobseekerHasMore, setJobseekerHasMore] = useState(true);
  const lastJobseekerFilters = useRef<string>("");

  // ========== Stateهای کارفرما ==========
  const [employerCards, setEmployerCards] = useState<Card[]>([]);
  const [loadingEmployer, setLoadingEmployer] = useState(false);
  const [loadingMoreEmployer, setLoadingMoreEmployer] = useState(false);
  const [employerPage, setEmployerPage] = useState(1);
  const [employerHasMore, setEmployerHasMore] = useState(true);
  const lastEmployerFilters = useRef<string>("");

  // ========== Stateهای آگهی‌ها (Seller) ==========
  const [sellerCards, setSellerCards] = useState<Card[]>([]);
  const [loadingSeller, setLoadingSeller] = useState(false);
  const [loadingMoreSeller, setLoadingMoreSeller] = useState(false);
  const [sellerPage, setSellerPage] = useState(1);
  const [sellerHasMore, setSellerHasMore] = useState(true);
  const lastSellerFilters = useRef<string>("");

  // ========== State نشان‌گذاری ==========
  const [markedMap, setMarkedMap] = useState<Record<string, boolean>>({});

  // Refs اسکرول دستی
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState(0);

  // توابع کمکی
  const mapGender = (gender: string | null) => {
    if (gender === "مرد") return "male";
    if (gender === "زن") return "female";
    return undefined;
  };
  const portfolioToWorkExp = (portfolio: string | null) => {
    if (portfolio === "بله") return true;
    if (portfolio === "خیر") return false;
    return undefined;
  };

  // ========== تابع دریافت یکجا و کش شده (BATCH) ==========
  const fetchMarkedStatuses = useCallback(
    async (ads: { id: string; adType: string }[]) => {
      if (!user || ads.length === 0) return {};
      const userId = user.id;
      const results: Record<string, boolean> = {};

      // 1. چک کردن کش
      const toFetch: { id: string; adType: string }[] = [];
      for (const ad of ads) {
        const cached = getMarkedCache(ad.id, ad.adType, userId);
        if (cached !== undefined) {
          results[ad.id] = cached;
        } else {
          toFetch.push(ad);
        }
      }

      if (toFetch.length === 0) {
        return results;
      }

      // 2. ارسال درخواست گروهی (Batch) به endpoint جدید
      try {
        const response = await fetch(`${BASE_URL}/ads/batch-is-marked`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            userId,
            items: toFetch.map(({ id, adType }) => ({ adId: id, adType })),
          }),
        });

        if (!response.ok) {
          throw new Error("Batch request failed");
        }

        const data = await response.json();
        data.results.forEach(
          ({ adId, marked }: { adId: string; marked: boolean }) => {
            const item = toFetch.find((a) => a.id === adId);
            if (item) {
              setMarkedCache(adId, item.adType, userId, marked);
              results[adId] = marked;
            }
          },
        );
      } catch (error) {
        console.error("Batch marked status error:", error);
        toFetch.forEach(({ id }) => {
          results[id] = false;
        });
      }

      return results;
    },
    [user],
  );

  // ========== به‌روزرسانی یک آیتم ==========
  const updateMarkedStatus = useCallback((adId: string, marked: boolean) => {
    setMarkedMap((prev) => ({ ...prev, [adId]: marked }));
  }, []);

  // ========== 1. کارجو ==========
  const fetchJobseekers = useCallback(
    async (pageNum: number, reset: boolean = false) => {
      if (reset) {
        setJobseekerCards([]);
        setLoadingJobseeker(true);
      } else {
        setLoadingMoreJobseeker(true);
      }

      try {
        const karjoFilters = filters.karjo;
        const hasWorkExp =
          karjoFilters.hasWorkExperience ??
          portfolioToWorkExp(karjoFilters.selectedPortfolio);

        const res = await fetchJobSeekerAds({
          searchText: karjoFilters.searchText,
          selectedTime: karjoFilters.selectedTime,
          selectedCities: karjoFilters.selectedCities,
          selectedStates: karjoFilters.selectedStates,
          hasWorkExperience: hasWorkExp,
          gender: mapGender(karjoFilters.selectedGender),
          minAge: karjoFilters.minAge
            ? parseInt(karjoFilters.minAge, 10)
            : undefined,
          maxAge: karjoFilters.maxAge
            ? parseInt(karjoFilters.maxAge, 10)
            : undefined,
          jobCategory: karjoFilters.selectedCategory,
          page: pageNum,
          limit: PAGE_SIZE,
        });

        console.log("📦 پاسخ کارجو:", {
          total: res.total,
          totalPages: res.totalPages,
          page: res.page,
          dataLength: res.data?.length,
        });

        const list = res.data ?? [];
        const mapped = list.map((item: any) => {
          const enhancements = item.enhancements || {};
          const badgeType = getBadgeFromEnhancements(enhancements);

          return {
            id: item.id || item._id,
            title: String(
              item.name || item.fullName || item.title || "بدون عنوان",
            ),
            description:
              item.careerHistory
                ?.map((c: any) => `${c.title}- ${c.description}`)
                .join("\n") || "",
            city: String(item.city || ""),
            rating:
              item.rating && typeof item.rating === "object"
                ? `${item.rating.average}/5`
                : "",
            time: item.createdAt ? "امروز" : "",
            portfolio: item.workSampleFile ? "بله" : "خیر",
            imageSrc:
              item.images?.find((img: any) => img.isMain)?.url ||
              item.images?.[0]?.url ||
              "/images/user_man.png",
            adType: "JobSeekerAd",
            adId: item.id || item._id,
            badgeType,
          };
        });

        let markedStatuses: Record<string, boolean> = {};
        if (user && mapped.length > 0) {
          const adsForMark = mapped.map((card: Card) => ({
            id: String(card.id),
            adType: card.adType || "JobSeekerAd",
          }));
          markedStatuses = await fetchMarkedStatuses(adsForMark);
          setMarkedMap((prev) => ({ ...prev, ...markedStatuses }));
        }

        let newCards: Card[];
        if (reset || pageNum === 1) {
          newCards = mapped;
          setJobseekerCards(mapped);
        } else {
          newCards = [...jobseekerCards, ...mapped];
          setJobseekerCards((prev) => [...prev, ...mapped]);
        }

        // اصلاح محاسبه hasMore با پشتیبان
        const hasMore =
          res.data?.length === PAGE_SIZE || pageNum < (res.totalPages ?? 1);
        setJobseekerHasMore(hasMore);
        setJobseekerPage(pageNum);

        saveToCache("karjo", filters.karjo, {
          cards: newCards,
          page: pageNum,
          hasMore,
        });
      } catch {
        if (reset) setJobseekerCards([]);
        setJobseekerHasMore(false);
      } finally {
        setLoadingJobseeker(false);
        setLoadingMoreJobseeker(false);
      }
    },
    [filters.karjo, jobseekerCards, user, fetchMarkedStatuses],
  );

  // ========== 2. کارفرما ==========
  const fetchEmployers = useCallback(
    async (pageNum: number, reset: boolean = false) => {
      if (reset) {
        setEmployerCards([]);
        setLoadingEmployer(true);
      } else {
        setLoadingMoreEmployer(true);
      }

      try {
        const karfarmaFilters = filters.karfarma;
        const res = await fetchEmployerAds({
          searchText: karfarmaFilters.searchText,
          selectedCategory: karfarmaFilters.selectedCategory,
          selectedTypeWork: karfarmaFilters.selectedTypeWork
            ? [karfarmaFilters.selectedTypeWork]
            : undefined,
          selectedCities: karfarmaFilters.selectedCities,
          selectedTime: karfarmaFilters.selectedTime,
          page: pageNum,
          limit: PAGE_SIZE,
        });

        console.log("📦 پاسخ کارفرما:", {
          total: res.total,
          totalPages: res.totalPages,
          page: res.page,
          dataLength: res.data?.length,
        });

        const list = res.data ?? [];
        const mapped = list.map((item: any) => {
          const enhancements = item.enhancements || {};
          const badgeType = getBadgeFromEnhancements(enhancements);

          return {
            id: item.id || item._id,
            title: String(item.title || ""),
            description: String(item.companyName || ""),
            city: String(item.city || ""),
            rating: "",
            time: item.createdAt ? "امروز" : "",
            typeWork: String(item.cooperationType || ""),
            category: String(item.category || ""),
            imageSrc:
              item.images?.find((img: any) => img.isMain)?.url ||
              item.images?.[0]?.url ||
              "/images/user_man.png",
            adType: "EmployerAd",
            adId: item.id || item._id,
            badgeType,
          };
        });

        let markedStatuses: Record<string, boolean> = {};
        if (user && mapped.length > 0) {
          const adsForMark = mapped.map((card: Card) => ({
            id: String(card.id),
            adType: card.adType || "EmployerAd",
          }));
          markedStatuses = await fetchMarkedStatuses(adsForMark);
          setMarkedMap((prev) => ({ ...prev, ...markedStatuses }));
        }

        let newCards: Card[];
        if (reset || pageNum === 1) {
          newCards = mapped;
          setEmployerCards(mapped);
        } else {
          newCards = [...employerCards, ...mapped];
          setEmployerCards((prev) => [...prev, ...mapped]);
        }

        const hasMore =
          res.data?.length === PAGE_SIZE || pageNum < (res.totalPages ?? 1);
        setEmployerHasMore(hasMore);
        setEmployerPage(pageNum);

        saveToCache("karfarma", filters.karfarma, {
          cards: newCards,
          page: pageNum,
          hasMore,
        });
      } catch {
        if (reset) setEmployerCards([]);
        setEmployerHasMore(false);
      } finally {
        setLoadingEmployer(false);
        setLoadingMoreEmployer(false);
      }
    },
    [filters.karfarma, employerCards, user, fetchMarkedStatuses],
  );

  // ========== 3. آگهی‌ها (Seller) ==========
  const fetchSellerAds = useCallback(
    async (pageNum: number, reset: boolean = false) => {
      if (reset) {
        setSellerCards([]);
        setLoadingSeller(true);
      } else {
        setLoadingMoreSeller(true);
      }

      try {
        const kioskFilters = filters.kiosk;
        const {
          selectedPrice,
          selectedTime,
          selectedCategory,
          selectedCities,
          searchText,
        } = kioskFilters;

        const params: any = { page: pageNum, limit: PAGE_SIZE };
        if (selectedCategory?.length > 0) params.category = selectedCategory[0];
        const min = selectedPrice?.min;
        if (min) {
          const parsed = parseInt(min.replace(/,/g, ""), 10);
          if (!isNaN(parsed)) params.minPrice = parsed;
        }
        const max = selectedPrice?.max;
        if (max) {
          const parsed = parseInt(max.replace(/,/g, ""), 10);
          if (!isNaN(parsed)) params.maxPrice = parsed;
        }
        const timeFilter = mapTimeFilter(selectedTime);
        if (timeFilter) params.timeFilter = timeFilter;
        if (selectedCities?.length > 0) params.city = selectedCities.join(",");
        if (searchText?.trim()) params.q = searchText.trim();

        const res = await getSellerAds(params);

        console.log("📦 پاسخ آگهی‌ها:", {
          total: res.total,
          totalPages: res.totalPages,
          page: res.page,
          dataLength: res.data?.length,
        });

        const list = res?.data ?? [];

        const mapped = list.map((item: any) => {
          const enhancements = item.enhancements || {};
          const badgeType = getBadgeFromEnhancements(enhancements);

          return {
            id: item.id || item._id,
            title: item.title || "",
            city: item.city || "",
            price:
              typeof item.priceIRT === "number"
                ? item.priceIRT.toLocaleString()
                : "",
            time: item.createdAt ? "امروز" : "",
            category: item.category || "",
            imageSrc:
              item.images?.find((img: any) => img.isMain)?.url ||
              item.images?.[0]?.url ||
              "/images/kioskimg_card.svg",
            adType: "SellerAd",
            adId: item.id || item._id,
            badgeType,
          };
        });

        let markedStatuses: Record<string, boolean> = {};
        if (user && mapped.length > 0) {
          const adsForMark = mapped.map((card: Card) => ({
            id: String(card.id),
            adType: card.adType || "SellerAd",
          }));
          markedStatuses = await fetchMarkedStatuses(adsForMark);
          setMarkedMap((prev) => ({ ...prev, ...markedStatuses }));
        }

        let newCards: Card[];
        if (reset || pageNum === 1) {
          newCards = mapped;
          setSellerCards(mapped);
        } else {
          newCards = [...sellerCards, ...mapped];
          setSellerCards((prev) => {
            const map = new Map();
            [...prev, ...mapped].forEach((item) => map.set(item.id, item));
            return Array.from(map.values());
          });
        }

        const hasMore =
          res.data?.length === PAGE_SIZE || pageNum < (res.totalPages ?? 1);
        setSellerHasMore(hasMore);
        setSellerPage(pageNum);

        saveToCache("agahi", filters.kiosk, {
          cards: newCards,
          page: pageNum,
          hasMore,
        });
      } catch {
        if (reset) setSellerCards([]);
        setSellerHasMore(false);
      } finally {
        setLoadingSeller(false);
        setLoadingMoreSeller(false);
      }
    },
    [filters.kiosk, sellerCards, user, fetchMarkedStatuses],
  );

  // ========== پاک‌کننده خودکار کش‌های منقضی (هر دقیقه) ==========
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      for (const [key, data] of memoryCache.entries()) {
        if (data.timestamp && now - data.timestamp > CACHE_TTL) {
          memoryCache.delete(key);
        }
      }
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // ========== اثرات اولیه با کش (از حافظه) ==========
  // برای رفع مشکل pagination، کش را موقتاً غیرفعال می‌کنیم تا همیشه درخواست جدید بزنیم
  useEffect(() => {
    if (activeTab !== "karjo") return;
    const currentKey = JSON.stringify(filters.karjo);
    if (lastJobseekerFilters.current === currentKey) return;

    // // کش غیرفعال شده برای تست
    // const cached = loadFromCache("karjo", filters.karjo);
    // if (cached) {
    //   setJobseekerCards(cached.cards);
    //   setJobseekerPage(cached.page);
    //   setJobseekerHasMore(cached.hasMore);
    //   lastJobseekerFilters.current = currentKey;
    //   if (user && cached.cards.length > 0) {
    //     const adsForMark = cached.cards.map((card: Card) => ({
    //       id: String(card.id),
    //       adType: card.adType || "JobSeekerAd",
    //     }));
    //     fetchMarkedStatuses(adsForMark).then((statuses) => {
    //       setMarkedMap((prev) => ({ ...prev, ...statuses }));
    //     });
    //   }
    // } else {
    //   lastJobseekerFilters.current = currentKey;
    //   fetchJobseekers(1, true);
    // }

    // همیشه درخواست جدید بزن (برای تست)
    lastJobseekerFilters.current = currentKey;
    fetchJobseekers(1, true);
  }, [activeTab, filters.karjo, fetchJobseekers]);

  useEffect(() => {
    if (activeTab !== "karfarma") return;
    const currentKey = JSON.stringify(filters.karfarma);
    if (lastEmployerFilters.current === currentKey) return;

    // // کش غیرفعال شده برای تست
    // const cached = loadFromCache("karfarma", filters.karfarma);
    // if (cached) {
    //   setEmployerCards(cached.cards);
    //   setEmployerPage(cached.page);
    //   setEmployerHasMore(cached.hasMore);
    //   lastEmployerFilters.current = currentKey;
    //   if (user && cached.cards.length > 0) {
    //     const adsForMark = cached.cards.map((card: Card) => ({
    //       id: String(card.id),
    //       adType: card.adType || "EmployerAd",
    //     }));
    //     fetchMarkedStatuses(adsForMark).then((statuses) => {
    //       setMarkedMap((prev) => ({ ...prev, ...statuses }));
    //     });
    //   }
    // } else {
    //   lastEmployerFilters.current = currentKey;
    //   fetchEmployers(1, true);
    // }

    lastEmployerFilters.current = currentKey;
    fetchEmployers(1, true);
  }, [activeTab, filters.karfarma, fetchEmployers]);

  useEffect(() => {
    if (activeTab !== "agahi") return;
    const currentKey = JSON.stringify(filters.kiosk);
    if (lastSellerFilters.current === currentKey) return;

    // // کش غیرفعال شده برای تست
    // const cached = loadFromCache("agahi", filters.kiosk);
    // if (cached) {
    //   setSellerCards(cached.cards);
    //   setSellerPage(cached.page);
    //   setSellerHasMore(cached.hasMore);
    //   lastSellerFilters.current = currentKey;
    //   if (user && cached.cards.length > 0) {
    //     const adsForMark = cached.cards.map((card: Card) => ({
    //       id: String(card.id),
    //       adType: card.adType || "SellerAd",
    //     }));
    //     fetchMarkedStatuses(adsForMark).then((statuses) => {
    //       setMarkedMap((prev) => ({ ...prev, ...statuses }));
    //     });
    //   }
    // } else {
    //   lastSellerFilters.current = currentKey;
    //   fetchSellerAds(1, true);
    // }

    lastSellerFilters.current = currentKey;
    fetchSellerAds(1, true);
  }, [activeTab, filters.kiosk, fetchSellerAds]);

  // ========== دکمه‌های بیشتر ==========
  const loadMoreJobseeker = () => {
    if (!jobseekerHasMore || loadingMoreJobseeker) return;
    fetchJobseekers(jobseekerPage + 1, false);
  };
  const loadMoreEmployer = () => {
    if (!employerHasMore || loadingMoreEmployer) return;
    fetchEmployers(employerPage + 1, false);
  };
  const loadMoreSeller = () => {
    if (!sellerHasMore || loadingMoreSeller) return;
    fetchSellerAds(sellerPage + 1, false);
  };

  // ========== هندلرهای اسکرول ==========
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current) return;
      const scrollAmount = 100;
      const pageScrollAmount = containerRef.current.clientHeight;
      if (e.key === "ArrowDown") containerRef.current.scrollTop += scrollAmount;
      if (e.key === "ArrowUp") containerRef.current.scrollTop -= scrollAmount;
      if (e.key === "PageDown")
        containerRef.current.scrollTop += pageScrollAmount;
      if (e.key === "PageUp")
        containerRef.current.scrollTop -= pageScrollAmount;
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleDrag = (e: MouseEvent) => {
    if (!containerRef.current) return;
    const delta = dragOffset - e.clientY;
    containerRef.current.scrollTop += delta;
    setDragOffset(e.clientY);
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
  const handleTouchStart = (e: React.TouchEvent) =>
    setDragOffset(e.touches[0].clientY);
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    const delta = dragOffset - e.touches[0].clientY;
    containerRef.current.scrollTop += delta;
    setDragOffset(e.touches[0].clientY);
  };
  const handleWheel = (e: React.WheelEvent) => {
    if (containerRef.current) containerRef.current.scrollTop += e.deltaY;
  };

  // ========== رندر ==========
  const renderContent = () => {
    // کارجو
    if (activeTab === "karjo") {
      if (loadingJobseeker) {
        return (
          <div className="flex justify-center items-center h-full w-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500" />
          </div>
        );
      }
      if (jobseekerCards.length === 0) {
        return (
          <div className="flex flex-col justify-center items-center h-full w-full text-center text-gray-500">
            <div className="text-6xl mb-4">✨</div>
            <p className="text-lg font-medium">🤝 هیچ کارجویی یافت نشد</p>
            <p className="text-sm mt-2">
              سعی کنید فیلترهای دیگری را امتحان کنید
            </p>
          </div>
        );
      }
      return (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-[1vh] md:gap-[4.8vh]">
            {jobseekerCards.map((card) => (
              <CardContent
                key={card.id}
                id={String(card.id)}
                title={card.title}
                description={card.description || ""}
                city={card.city}
                rating={card.rating || ""}
                imageSrc={card.imageSrc || "/images/user_man.png"}
                adType={card.adType}
                adId={card.adId}
                initialMarked={markedMap[String(card.id)] ?? false}
                onMarkToggle={updateMarkedStatus}
                onViewTrack={trackAdView}
                badgeType={card.badgeType || null}
              />
            ))}
          </div>
          {loadingMoreJobseeker && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-blue-500" />
            </div>
          )}
          {jobseekerHasMore && !loadingMoreJobseeker && (
            <div className="flex justify-center my-6">
              <button
                onClick={loadMoreJobseeker}
                className="px-[3vh] py-[1vh] md:px-[8vh] md:py-[2vh] text-white rounded-xl shadow-md transition-all bg-gradient-to-r from-[#143A62] via-[#2a7fb0] to-[#143A62] bg-[length:200%_100%] hover:animate-wave"
              >
                آگهی‌های بیشتر
              </button>
            </div>
          )}
        </>
      );
    }

    // کارفرما
    if (activeTab === "karfarma") {
      if (loadingEmployer) {
        return (
          <div className="flex justify-center items-center h-full w-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500" />
          </div>
        );
      }
      if (employerCards.length === 0) {
        return (
          <div className="flex flex-col justify-center items-center h-full w-full text-center text-gray-500">
            <div className="text-6xl mb-4">✨</div>
            <p className="text-lg font-medium">🏢 هیچ کارفرمایی یافت نشد</p>
            <p className="text-sm mt-2">
              سعی کنید فیلترهای دیگری را امتحان کنید
            </p>
          </div>
        );
      }
      return (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-[0.8vh] md:gap-[3.5vh] ml-[1vh] mr-[0.8vh]">
            {employerCards.map((card) => (
              <CardContent
                key={card.id}
                id={String(card.id)}
                title={card.title}
                description={card.description || ""}
                city={card.city}
                rating={card.rating || ""}
                imageSrc={card.imageSrc || "/images/user_man.png"}
                adType={card.adType}
                adId={card.adId}
                initialMarked={markedMap[String(card.id)] ?? false}
                onMarkToggle={updateMarkedStatus}
                onViewTrack={trackAdView}
                badgeType={card.badgeType || null}
              />
            ))}
          </div>
          {loadingMoreEmployer && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-blue-500" />
            </div>
          )}
          {employerHasMore && !loadingMoreEmployer && (
            <div className="flex justify-center my-6">
              <button
                onClick={loadMoreEmployer}
                className="px-[3vh] py-[1vh] md:px-[8vh] md:py-[2vh] text-white rounded-xl shadow-md transition-all bg-gradient-to-r from-[#143A62] via-[#2a7fb0] to-[#143A62] bg-[length:200%_100%] hover:animate-wave"
              >
                آگهی‌های بیشتر
              </button>
            </div>
          )}
        </>
      );
    }

    // آگهی‌ها (Seller)
    if (activeTab === "agahi") {
      if (loadingSeller) {
        return (
          <div className="flex justify-center items-center h-full w-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500" />
          </div>
        );
      }
      if (sellerCards.length === 0) {
        return (
          <div className="flex flex-col justify-center items-center h-full w-full text-center text-gray-500">
            <div className="text-6xl mb-4">✨</div>
            <p className="text-lg font-medium">📦 هیچ آگهی‌ای یافت نشد</p>
            <p className="text-sm mt-2">
              سعی کنید فیلترهای دیگری را امتحان کنید
            </p>
          </div>
        );
      }
      return (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-[0.8vh] md:gap-[3.5vh] ml-[1vh] mr-[0.8vh]">
            {sellerCards.map((card) => (
              <KioskContent
                key={card.id}
                id={String(card.id)}
                title={card.title}
                city={card.city}
                price={card.price || ""}
                imageSrc={card.imageSrc || ""}
                adType={card.adType}
                adId={card.adId}
                initialMarked={markedMap[String(card.id)] ?? false}
                onMarkToggle={updateMarkedStatus}
                onViewTrack={trackAdView}
                badgeType={card.badgeType || null}
              />
            ))}
          </div>
          {loadingMoreSeller && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-blue-500" />
            </div>
          )}
          {sellerHasMore && !loadingMoreSeller && (
            <div className="flex justify-center my-6">
              <button
                onClick={loadMoreSeller}
                className="px-[3vh] py-[1vh] md:px-[8vh] md:py-[2vh] text-white rounded-xl shadow-md transition-all bg-gradient-to-r from-[#143A62] via-[#2a7fb0] to-[#143A62] bg-[length:200%_100%] hover:animate-wave"
              >
                آگهی‌های بیشتر
              </button>
            </div>
          )}
        </>
      );
    }

    return null;
  };

  return (
    <div
      className="relative flex w-full bg-[#F5F5F5] h-[90%] p-4 pt-4 pb-0 md:flex md:flex-col rounded-[10px] overflow-y-hidden"
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      <div ref={containerRef} className="overflow-hidden w-full h-full">
        {renderContent()}
      </div>
    </div>
  );
};

export default Content;
