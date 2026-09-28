"use client";
import React from "react";
import SectionTypes from "@/components/common/SectionTypes";
import PriceRange from "../../../Ads/__components/Desk/Filterbar/___components/PriceRange";
import CityChoice from "../../../Ads/__components/Desk/Filterbar/___components/CityChoice";

// کامپوننت جستجو
const SearchInput = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) => {
  return (
    <div className="w-[99%] max-h-[6vh] min-h-[5vh] bg-white rounded-[10px] flex items-center mx-auto relative">
      <input
        type="text"
        placeholder="جستجو در عنوان و توضیحات..."
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-[#143A62] font-medium text-[15px] pr-10 pl-10 rounded-[6px] opacity-50 outline-none bg-transparent"
      />
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
        <img
          src="/images/search_skills_icon.svg"
          alt="search icon"
          className="object-contain w-5 h-5"
        />
      </div>
    </div>
  );
};

interface ProjectsFilterProps {
  filters: {
    searchText: string;
    minBudget: string;
    maxBudget: string;
    timeFilter: string;
    cities: string[];
    requestType?: string;
    durationUnit?: string;
    durationAmount?: string;
    remote?: boolean;
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
}

const ProjectsFilter: React.FC<ProjectsFilterProps> = ({
  filters,
  setFilters,
}) => {
  // بازه بودجه
  const handleBudgetChange = (min: string, max: string) => {
    setFilters((prev: any) => ({ ...prev, minBudget: min, maxBudget: max }));
  };

  // فیلتر زمانی
  const timeOptions = ["امروز", "این هفته", "این ماه", "سال اخیر"];
  const timeMap: Record<string, string> = {
    امروز: "today",
    "این هفته": "thisWeek",
    "این ماه": "thisMonth",
    "سال اخیر": "thisYear",
  };
  const handleTimeSelect = (selected: string | string[]) => {
    const persian = Array.isArray(selected) ? selected[0] : selected;
    const mapped = timeMap[persian] || "";
    setFilters((prev: any) => ({ ...prev, timeFilter: mapped }));
  };

  // مدیریت شهر
  const handleCityChange = (cities: string[]) => {
    setFilters((prev: any) => ({ ...prev, cities }));
  };

  // فیلترهای جدید دیجیتال
  const requestTypeOptions = ["درخواست‌دهنده", "ارائه‌دهنده"];
  const requestTypeMap: Record<string, string> = {
    درخواست‌دهنده: "requester",
    ارائه‌دهنده: "provider",
  };
  const handleRequestTypeSelect = (selected: string | string[]) => {
    const persian = Array.isArray(selected) ? selected[0] : selected;
    const mapped = requestTypeMap[persian] || "";
    setFilters((prev: any) => ({ ...prev, requestType: mapped }));
  };

  const durationUnitOptions = ["دقیقه", "ساعت", "روز", "ماه", "سال"];
  const durationUnitMap: Record<string, string> = {
    دقیقه: "minute",
    ساعت: "hour",
    روز: "day",
    ماه: "month",
    سال: "year",
  };
  const handleDurationUnitSelect = (selected: string | string[]) => {
    const persian = Array.isArray(selected) ? selected[0] : selected;
    const mapped = durationUnitMap[persian] || "";
    setFilters((prev: any) => ({ ...prev, durationUnit: mapped }));
  };

  const handleDurationAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setFilters((prev: any) => ({ ...prev, durationAmount: e.target.value }));
  };

  const handleRemoteToggle = () => {
    setFilters((prev: any) => ({ ...prev, remote: !prev.remote }));
  };

  return (
    <div className="w-full h-full overflow-y-auto">
      {/* جستجو */}
      <SearchInput
        value={filters.searchText}
        onChange={(val) =>
          setFilters((prev: any) => ({ ...prev, searchText: val }))
        }
      />

      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#143A62]/80 to-transparent" />

      {/* بازه بودجه */}
      <PriceRange
        title="بازه بودجه (تومان)"
        minValue={filters.minBudget}
        maxValue={filters.maxBudget}
        onChange={handleBudgetChange}
      />

      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#143A62]/80 to-transparent" />

      {/* فیلتر زمانی */}
      <SectionTypes
        title="زمان انتشار"
        options={timeOptions}
        variant="circle"
        onSelect={handleTimeSelect}
      />

      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#143A62]/80 to-transparent" />

      {/* انتخاب شهر */}
      <CityChoice
        selectedCities={filters.cities || []}
        onChange={handleCityChange}
      />

      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#143A62]/80 to-transparent mt-3" />

      {/* فیلترهای جدید دیجیتال */}
      <SectionTypes
        title="نوع درخواست"
        options={requestTypeOptions}
        variant="circle"
        onSelect={handleRequestTypeSelect}
        selectedOption={
          filters.requestType
            ? Object.keys(requestTypeMap).find(
                (key) => requestTypeMap[key] === filters.requestType,
              ) || undefined
            : undefined
        }
      />

      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#143A62]/80 to-transparent" />

      <SectionTypes
        title="واحد زمان"
        options={durationUnitOptions}
        variant="circle"
        onSelect={handleDurationUnitSelect}
        selectedOption={
          filters.durationUnit
            ? Object.keys(durationUnitMap).find(
                (key) => durationUnitMap[key] === filters.durationUnit,
              ) || undefined
            : undefined
        }
      />

      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#143A62]/80 to-transparent" />

      {/* مقدار زمان */}
      <div className="mt-2">
        <label className="text-[#143A62] text-sm font-medium block mb-1">
          مقدار زمان
        </label>
        <input
          type="number"
          placeholder="مثلاً 30"
          value={filters.durationAmount || ""}
          onChange={handleDurationAmountChange}
          className="w-full bg-white rounded-[10px] px-3 py-2 text-[#143A62] outline-none border border-gray-200 focus:border-[#143A62] transition"
        />
      </div>

      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#143A62]/80 to-transparent" />

      {/* دورکاری */}
      <div className="mt-2 flex items-center gap-2">
        <button
          onClick={handleRemoteToggle}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            filters.remote ? "bg-[#143A62]" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
              filters.remote ? "translate-x-6" : ""
            }`}
          />
        </button>
        <span className="text-[#143A62] font-medium">دورکاری</span>
      </div>
    </div>
  );
};

export default ProjectsFilter;
