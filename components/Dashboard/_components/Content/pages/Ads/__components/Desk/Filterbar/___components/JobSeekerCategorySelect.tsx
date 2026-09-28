"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllSubCategories } from "@/api/apiCategories";

interface SubCategory {
  id: string;
  name: string;
}

interface JobSeekerCategorySelectProps {
  onChange?: (selectedIds: string[], selectedNames: string[]) => void;
  initialSelectedIds?: string[];
}

const JobSeekerCategorySelect: React.FC<JobSeekerCategorySelectProps> = ({
  onChange,
  initialSelectedIds = [],
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ["jobseeker-skills"],
    queryFn: fetchAllSubCategories,
  });

  // نرمال‌سازی داده‌ها برای اطمینان از وجود فیلد `id`
  const skills = useMemo<SubCategory[]>(() => {
    const raw = data?.categories || [];
    return raw.map((item: any) => ({
      id: item._id ?? item.id,
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      )
        setIsOpen(false);
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
      const selectedNames = skills
        .filter((s) => newSelected.includes(s.id))
        .map((s) => s.name);
      onChange(newSelected, selectedNames);
    }
  };

  const selectedNames = skills
    .filter((s) => selectedIds.includes(s.id))
    .map((s) => s.name);

  if (isLoading) {
    return <div className="w-[98%] max-w-sm">در حال بارگذاری مهارت‌ها...</div>;
  }

  return (
    <div className="w-[98%] max-w-sm relative" ref={containerRef}>
      <h1 className="mb-[1.4vh] text-[2.1vh] font-semibold text-[#143A62] mr-[2%]">
        مهارت‌ها (کارجو)
      </h1>
      <div
        className="flex flex-wrap items-center gap-2 border rounded-lg px-[1.4vh] py-[0.4vh] min-h-[5vh] cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedIds.length === 0 ? (
          <span className="text-gray-400 text-sm">+ انتخاب مهارت‌ها</span>
        ) : (
          selectedNames.map((name) => {
            const skill = skills.find((s) => s.name === name);
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
                    if (skill) handleToggle(skill.id);
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
          {skills.map((skill) => (
            <label
              key={skill.id}
              className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(skill.id)}
                onChange={() => handleToggle(skill.id)}
                className="w-4 h-4"
              />
              <span>{skill.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobSeekerCategorySelect;
