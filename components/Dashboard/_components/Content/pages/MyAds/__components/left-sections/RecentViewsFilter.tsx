"use client";
import React, { useState } from "react";

type TabKey = "karjo" | "karfarma" | "agahi" | "digital";
type TimeKey = "all" | "today" | "week" | "month";

interface RecentViewsFilterProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  activeTime: TimeKey;
  setActiveTime: (time: TimeKey) => void;
}

const tabs: { key: TabKey; label: string }[] = [
  { key: "karjo", label: "کارجو" },
  { key: "karfarma", label: "کارفرما" },
  { key: "agahi", label: "آگهی" },
  { key: "digital", label: "مناقصه" }, // تب جدید
];

const times: { key: TimeKey; label: string }[] = [
  { key: "all", label: "همه بازدیدها" },
  { key: "today", label: "امروز" },
  { key: "week", label: "۷ روز اخیر" },
  { key: "month", label: "ماه جاری" },
];

const RecentViewsFilter: React.FC<RecentViewsFilterProps> = ({
  activeTab,
  setActiveTab,
  activeTime,
  setActiveTime,
}) => {
  const [showTimeFilter, setShowTimeFilter] = useState(false);

  console.log("🔵 [RecentViewsFilter] رندر شد با activeTab:", activeTab);

  // رادیو باتن سفارشی
  const RadioIndicator = ({ isSelected }: { isSelected: boolean }) => (
    <span
      className={`relative inline-block w-4 h-4 border-2 rounded-full transition-all ${
        isSelected ? "border-white" : "border-[#D9D9D9]"
      }`}
    >
      <span
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white transition-all ${
          isSelected ? "scale-100 opacity-100" : "scale-0 opacity-0"
        }`}
      />
    </span>
  );

  return (
    <div className="w-full flex flex-col gap-6 md:bg-gray-200 p-[0.5vh] rounded-lg h-full">
      {/* ======================= دسته‌بندی ======================= */}
      <div className="flex flex-col gap-2">
        <span className="hidden md:block text-[#143A62] font-semibold">
          دسته‌بندی
        </span>

        {/* دسکتاپ */}
        <div className="hidden sm:block w-full">
          <div className="bg-white rounded-xl overflow-visible">
            <div className="flex">
              {tabs.map((tab) => {
                const isSelected = tab.key === activeTab;
                return (
                  <div
                    key={tab.key}
                    onClick={() => {
                      console.log(
                        `🟢 [RecentViewsFilter] کلیک روی تب "${tab.label}" (${tab.key})`,
                      );
                      console.log(
                        `🟢 [RecentViewsFilter] activeTab قبلی: ${activeTab}`,
                      );
                      setActiveTab(tab.key);
                      console.log(
                        `🟢 [RecentViewsFilter] activeTab جدید تنظیم شد: ${tab.key}`,
                      );
                    }}
                    className={`flex-1 cursor-pointer text-center py-2 px-3 transition-all rounded-xl ${
                      isSelected
                        ? "bg-[#143A62] text-white rounded-xl"
                        : "bg-white text-[#143A62]"
                    }`}
                  >
                    <span className="text-[1.5vh] md:text-[0.9vw]">
                      {tab.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* موبایل */}
        <div className="sm:hidden w-full flex items-center justify-between gap-1">
          <div className="flex bg-white rounded-xl shadow-md w-[80%] px-2 py-2 gap-1">
            {tabs.map((tab) => {
              const isSelected = tab.key === activeTab;
              return (
                <div
                  key={tab.key}
                  onClick={() => {
                    console.log(
                      `🟢 [RecentViewsFilter موبایل] کلیک روی تب "${tab.label}" (${tab.key})`,
                    );
                    setActiveTab(tab.key);
                  }}
                  className="flex-1 cursor-pointer"
                >
                  {isSelected ? (
                    <div className="rounded-xl bg-[#143A62] flex items-center justify-center py-[6px]">
                      <span className="text-[14px] text-white">
                        {tab.label}
                      </span>
                    </div>
                  ) : (
                    <div className="rounded-xl flex items-center justify-center py-[6px]">
                      <span className="text-[14px] text-[#143A62]">
                        {tab.label}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div
            onClick={() => setShowTimeFilter(!showTimeFilter)}
            className="bg-white w-[20%] h-[45px] shadow-md border border-gray-300 rounded-xl flex items-center justify-center cursor-pointer"
          >
            <img
              src="/images/filter_res.svg"
              alt="filter"
              className="w-[22px] h-[22px] object-contain"
            />
          </div>
        </div>
      </div>

      {/* ======================= فیلترهای زمان ======================= */}
      <div className="hidden sm:flex flex-col gap-2">
        <span className="text-[#143A62] font-semibold text-sm md:text-base">
          زمان بازدید
        </span>
        <div className="flex flex-col gap-2">
          {times.map((t) => {
            const isSelected = activeTime === t.key;
            return (
              <label
                key={t.key}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl cursor-pointer transition-all ${
                  isSelected
                    ? "bg-[#143A62] text-white"
                    : "bg-[#FFFFFFF2] text-[#143A62B2]"
                }`}
              >
                <RadioIndicator isSelected={isSelected} />
                <span className="text-sm md:text-base">{t.label}</span>
                <input
                  type="radio"
                  name="recentTime"
                  value={t.key}
                  checked={isSelected}
                  onChange={() => {
                    console.log(
                      `🟡 [RecentViewsFilter] زمان انتخاب شد: ${t.key}`,
                    );
                    setActiveTime(t.key);
                  }}
                  className="hidden"
                />
              </label>
            );
          })}
        </div>
      </div>

      {/* موبایل */}
      {showTimeFilter && (
        <div className="sm:hidden flex flex-col gap-2 mt-2">
          <span className="text-[#143A62] font-semibold text-sm">
            زمان بازدید
          </span>
          <div className="flex flex-col gap-2">
            {times.map((t) => {
              const isSelected = activeTime === t.key;
              return (
                <label
                  key={t.key}
                  className={`flex items-center gap-3 px-4 py-2 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#143A62] text-white"
                      : "bg-[#FFFFFFF2] text-[#143A62B2]"
                  }`}
                >
                  <RadioIndicator isSelected={isSelected} />
                  <span className="text-sm">{t.label}</span>
                  <input
                    type="radio"
                    name="recentTimeMobile"
                    value={t.key}
                    checked={isSelected}
                    onChange={() => {
                      console.log(
                        `🟡 [RecentViewsFilter موبایل] زمان انتخاب شد: ${t.key}`,
                      );
                      setActiveTime(t.key);
                    }}
                    className="hidden"
                  />
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentViewsFilter;
