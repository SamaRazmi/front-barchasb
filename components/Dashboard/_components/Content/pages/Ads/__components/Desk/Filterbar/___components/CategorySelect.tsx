"use client";
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFilters } from "@/context/FiltersContext";
import { fetchAdMainCategories, Category } from "@/api/apiCategories";

export default function CategorySelect() {
  const { filters, setFilters } = useFilters();
  const selectedCategoryName = filters.kiosk.selectedCategory?.[0] || "";

  const { data, isLoading } = useQuery({
    queryKey: ["ad-categories"],
    queryFn: fetchAdMainCategories,
  });

  const categories: Category[] = data?.categories || [];

  // ✅ فیلتر کردن دسته‌های معتبر (دارای id)
  const validCategories = categories.filter((cat) => cat?.id != null);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (!selectedId) {
      setFilters((prev) => ({
        ...prev,
        kiosk: { ...prev.kiosk, selectedCategory: [] },
      }));
      return;
    }
    const selectedCat = validCategories.find((cat) => cat.id === selectedId);
    const selectedName = selectedCat?.name || "";
    setFilters((prev) => ({
      ...prev,
      kiosk: {
        ...prev.kiosk,
        selectedCategory: selectedName ? [selectedName] : [],
      },
    }));
  };

  const handleRemove = () => {
    setFilters((prev) => ({
      ...prev,
      kiosk: { ...prev.kiosk, selectedCategory: [] },
    }));
  };

  if (isLoading)
    return <div className="w-[98%] max-w-sm">در حال بارگذاری دسته‌ها...</div>;

  // پیدا کردن id بر اساس name فعلی (از بین دسته‌های معتبر)
  const selectedId =
    validCategories.find((cat) => cat.name === selectedCategoryName)?.id || "";

  return (
    <div className="w-[98%] max-w-sm relative">
      <h1 className="mb-[1.4vh] text-[2.1vh] font-semibold text-[#143A62] mr-[2%]">
        دسته‌بندی
      </h1>

      <div className="flex flex-wrap items-center gap-2 border rounded-lg px-[1.4vh] py-[0.4vh] min-h-[5vh]">
        {selectedCategoryName && (
          <div className="flex items-center bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm">
            {selectedCategoryName}
            <button
              type="button"
              className="mr-1 font-bold"
              onClick={handleRemove}
            >
              ×
            </button>
          </div>
        )}

        <select
          value={selectedId}
          onChange={handleChange}
          className="flex-1 bg-transparent text-sm focus:outline-none py-1"
          style={{ direction: "rtl" }}
        >
          <option value="">+ انتخاب دسته</option>
          {validCategories.map((cat) => (
            // ✅ حالا cat.id حتماً وجود دارد، کلید یکتا خواهد بود
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}