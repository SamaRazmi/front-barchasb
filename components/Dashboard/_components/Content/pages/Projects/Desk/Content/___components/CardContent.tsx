import React from "react";
import { useRouter } from "next/navigation";
import { DigitalAd } from "@/types/digitalTypes";
import { trackAdView as defaultTrackView } from "@/api/apiAdView";

interface CardContentProps {
  ads: DigitalAd[];

  onTrackView?: (
    adId: string,
    adType: string,
  ) => Promise<any>;

  // Pagination
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}

const CardContent: React.FC<CardContentProps> = ({
  ads,
  onTrackView = defaultTrackView,

  // Pagination
  hasMore = false,
  loadingMore = false,
  onLoadMore,
}) => {
  const router = useRouter();

  const handleCardClick = async (adId: string) => {
    try {
      await onTrackView(adId, "DigitalAd");
    } catch (error) {
      console.error("خطا در ثبت بازدید:", error);
    }

    router.push(`/dashboard/projects/${adId}?adType=DigitalAd`);
  };

  // دریافت عکس اصلی
  const getMainImage = (ad: DigitalAd): string | null => {
    if (ad.images && ad.images.length > 0) {
      const main = ad.images.find((img) => img.isMain === true);

      return main ? main.url : ad.images[0].url;
    }

    return null;
  };

  // چند روز پیش
  const getDaysAgoText = (createdAt: string) => {
    const now = new Date();
    const adDate = new Date(createdAt);

    const diffInMs =
      now.getTime() - adDate.getTime();

    const diffInDays = Math.floor(
      diffInMs / (1000 * 60 * 60 * 24),
    );

    return diffInDays === 0
      ? "امروز"
      : `${diffInDays} روز پیش`;
  };

  // برچسب تازگی
  const getFreshLabel = (createdAt: string) => {
    const now = new Date();
    const adDate = new Date(createdAt);

    // امروز
    if (
      adDate.getDate() === now.getDate() &&
      adDate.getMonth() === now.getMonth() &&
      adDate.getFullYear() === now.getFullYear()
    ) {
      return "امروز";
    }

    // شروع هفته
    const startOfWeek = new Date(now);

    startOfWeek.setDate(
      now.getDate() - now.getDay(),
    );

    startOfWeek.setHours(0, 0, 0, 0);

    // پایان هفته
    const endOfWeek = new Date(startOfWeek);

    endOfWeek.setDate(
      startOfWeek.getDate() + 6,
    );

    endOfWeek.setHours(
      23,
      59,
      59,
      999,
    );

    if (
      adDate >= startOfWeek &&
      adDate <= endOfWeek
    ) {
      return "این هفته";
    }

    // این ماه
    if (
      adDate.getFullYear() === now.getFullYear() &&
      adDate.getMonth() === now.getMonth()
    ) {
      return "این ماه";
    }

    // سال اخیر
    if (
      adDate.getFullYear() === now.getFullYear()
    ) {
      return "سال اخیر";
    }

    return `سال ${adDate.getFullYear()}`;
  };

  return (
    <div className="w-full">
      {/* ================= کارت‌ها ================= */}
      {ads.length === 0 ? (
        <p className="text-center py-6">
          در حال بارگذاری یا هیچ پروژه‌ای موجود نیست...
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-3 lg:gap-x-6 lg:gap-y-6">
            {ads.map((ad) => {
              const imageUrl = getMainImage(ad);

              return (
                <div
                  key={ad.id}
                  onClick={() =>
                    handleCardClick(ad.id)
                  }
                  className="relative bg-white border-2 rounded-[20px] p-2 w-full min-h-[160px] overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                >
                  {/* ================= بخش بالای کارت ================= */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden"
                      style={{
                        backgroundImage: imageUrl
                          ? `url(${imageUrl})`
                          : "none",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      {!imageUrl && (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          بدون عکس
                        </div>
                      )}
                    </div>

                    <div className="text-[#143A62] font-semibold whitespace-nowrap text-[1vh] sm:text-[1.6vh] md:text-[2vh] lg:text-[2.4vh] leading-none mx-auto text-center">
                      {ad.title}
                    </div>
                  </div>

                  {/* ================= توضیحات ================= */}
                  <p className="mt-1 text-[#000000] font-normal text-[1vh] sm:text-[1.5vh] md:text-[2vh] leading-[22px] pr-2 pl-4 text-justify line-clamp-2">
                    {Array.isArray(
                      ad.projectDescriptions,
                    )
                      ? ad.projectDescriptions.join(" ، ")
                      : ad.projectDescriptions}
                  </p>

                  {/* ================= تاریخ ================= */}
                  <div className="mt-3 flex justify-start items-center gap-2">
                    <div className="bg-[#D9D9D966] px-[2vh] py-[0.7vh] text-[#143A62D9] text-[2vh] rounded-[5px]">
                      {getDaysAgoText(
                        ad.createdAt,
                      )}
                    </div>

                    <div className="bg-[#143A62] text-white font-semibold text-[1.5vh] px-[2vh] py-[1vh] rounded-[5px]">
                      {getFreshLabel(
                        ad.createdAt,
                      )}
                    </div>
                  </div>

                  {/* ================= بودجه و تعداد پروژه ================= */}
                  <div className="mt-[1vh] flex items-center py-1 relative text-[#143A62D9] justify-start gap-[1vh] flex-nowrap">
                    <div className="bg-[#143A621A] px-2 py-1 rounded-[5px] text-[1.5vh] max-w-[45%] sm:max-w-[40%] md:max-w-[42%] lg:max-w-[50%] truncate">
                      از{" "}
                      {ad.minBudget ||
                        "تعیین نشده"}{" "}
                      تا{" "}
                      {ad.maxBudget ||
                        "تعیین نشده"}
                    </div>

                    <div className="bg-[#143A621A] px-2 py-1 rounded-[5px] text-[1.5vh] max-w-[25%] sm:max-w-[22%] md:max-w-[23%] lg:max-w-[25%] truncate">
                      {ad.projectNames?.length ||
                        0}{" "}
                      پروژه
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ================= Loading بیشتر ================= */}
          {loadingMore && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-blue-500" />
            </div>
          )}

          {/* ================= دکمه آگهی‌های بیشتر ================= */}
          {hasMore &&
            !loadingMore &&
            onLoadMore && (
              <div className="flex justify-center my-6 w-full">
                <button
                  type="button"
                  onClick={onLoadMore}
                  disabled={loadingMore}
                  className="
                    px-[3vh] py-[1vh]
                    sm:px-[4vh] sm:py-[1.2vh]
                    md:px-[8vh] md:py-[2vh]
                    text-white
                    text-[1.6vh] sm:text-[1.8vh] md:text-[2vh]
                    font-semibold
                    rounded-xl
                    shadow-md
                    transition-all
                    bg-gradient-to-r
                    from-[#143A62]
                    via-[#2a7fb0]
                    to-[#143A62]
                    bg-[length:200%_100%]
                    hover:animate-wave
                    disabled:opacity-60
                    disabled:cursor-not-allowed
                  "
                >
                  {loadingMore
                    ? "در حال بارگذاری..."
                    : "آگهی‌های بیشتر"}
                </button>
              </div>
            )}
        </>
      )}
    </div>
  );
};

export default CardContent;