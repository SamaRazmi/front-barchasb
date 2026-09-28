"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchMainCategories } from "@/api/apiCategories";

interface Category {
  id: string;
  name: string;
}

interface EmployerCategorySelectProps {
  onChange?: (selectedIds: string[], selectedNames: string[]) => void;
  initialSelectedIds?: string[];
}

const EmployerCategorySelect: React.FC<EmployerCategorySelectProps> = ({
  onChange,
  initialSelectedIds = [],
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ["employer-categories-new"],
    queryFn: fetchMainCategories,
  });

  // نرمال‌سازی داده‌ها برای اطمینان از وجود فیلد `id`
  const categories = useMemo<Category[]>(() => {
    const raw = data?.categories || [];
    return raw.map((item: any) => ({
      id: item._id ?? item.id, // اگر `_id` موجود باشد از آن استفاده کن، در غیر این صورت `id`
      name: item.name,
    }));
  }, [data]);

  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // همگام‌سازی state با prop در صورت تغییر
  useEffect(() => {
    setSelectedIds(initialSelectedIds);
  }, [initialSelectedIds]);

  // بستن دراپ‌داون با کلیک بیرون
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = (id: string) => {
    const newSelected = selectedIds.includes(id)
      ? selectedIds.filter((i) => i !== id)
      : [...selectedIds, id];
    setSelectedIds(newSelected);
    if (onChange) {
      const selectedNames = categories
        .filter((c) => newSelected.includes(c.id))
        .map((c) => c.name);
      onChange(newSelected, selectedNames);
    }
  };

  const selectedNames = categories
    .filter((c) => selectedIds.includes(c.id))
    .map((c) => c.name);

  if (isLoading) {
    return <div className="w-[98%] max-w-sm">در حال بارگذاری دسته‌ها...</div>;
  }

  return (
    <div className="w-[98%] max-w-sm relative" ref={containerRef}>
      <h1 className="mb-[1.4vh] text-[2.1vh] font-semibold text-[#143A62] mr-[2%]">
        دسته‌بندی شغلی (کارفرما)
      </h1>

      <div
        className="flex flex-wrap items-center gap-2 border rounded-lg px-[1.4vh] py-[0.4vh] min-h-[5vh] cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedNames.length === 0 ? (
          <span className="text-gray-400 text-sm">+ انتخاب دسته‌ها</span>
        ) : (
          selectedNames.map((name) => {
            const cat = categories.find((c) => c.name === name);
            return (
              <div
                key={name}
                className="flex items-center bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm"
              >
                {name}
                <button
                  type="button"
                  className="mr-1 font-bold"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (cat) handleToggle(cat.id);
                  }}
                >
                  ×
                </button>
              </div>
            );
          })
        )}
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
          {categories.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(cat.id)}
                onChange={() => handleToggle(cat.id)}
                className="w-4 h-4"
              />
              <span>{cat.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployerCategorySelect;
