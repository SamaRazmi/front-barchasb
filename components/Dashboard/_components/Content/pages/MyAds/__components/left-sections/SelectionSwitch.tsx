"use client";

import { useState } from "react";

interface SelectionSwitchProps {
  active: "employer" | "seeker" | "seller" | "digital";
  onChange: (type: "employer" | "seeker" | "seller" | "digital") => void;
}

const SelectionSwitch = ({ active, onChange }: SelectionSwitchProps) => {
  const tabs = [
    { key: "employer", label: "کارفرما" },
    { key: "seeker", label: "کارجو" },
    { key: "seller", label: "آگهی" },
    { key: "digital", label: "مناقصه" },
  ];

  const positionMap: Record<
    "employer" | "seeker" | "seller" | "digital",
    string
  > = {
    employer: "top-[28px]",
    seeker: "top-[92px]",
    seller: "top-[156px]",
    digital: "top-[220px]",
  };

  return (
    <>
      <div className="hidden md:flex md:flex-col relative w-[110px] h-[304px] bg-[#143A62] rounded-[40px]">
        <div
          className={`absolute left-0 w-[100px] h-[56px] 
            bg-[#F5F5F5] rounded-r-[30px]
            transition-all duration-300
            ${positionMap[active]}
            flex items-center px-6
          `}
        >
          {active && (
            <span className="text-[#143A62] text-[2.4vh]">
              {active === "employer"
                ? "کارفرما"
                : active === "seeker"
                  ? "کارجو"
                  : active === "seller"
                    ? "آگهی"
                    : "مناقصه"}
            </span>
          )}
        </div>

        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() =>
              onChange(tab.key as "employer" | "seeker" | "seller" | "digital")
            }
            className={`absolute ${
              tab.key === "employer"
                ? "top-[28px]"
                : tab.key === "seeker"
                  ? "top-[92px]"
                  : tab.key === "seller"
                    ? "top-[156px]"
                    : "top-[220px]"
            } right-0 w-[100px] h-[56px] z-10`}
          >
            <span
              className={`${
                active === tab.key
                  ? "text-transparent"
                  : "text-white text-[2.2vh]"
              }`}
            >
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      <div className="md:hidden w-[90%] flex items-center justify-between gap-1 mt-0 mx-auto">
        <div className="flex bg-white rounded-xl shadow-md w-full px-0 gap-1">
          {tabs.map((tab) => {
            const isSelected = tab.key === active;
            return (
              <div
                key={tab.key}
                onClick={() =>
                  onChange(
                    tab.key as "employer" | "seeker" | "seller" | "digital",
                  )
                }
                className="flex-1 cursor-pointer"
              >
                {isSelected ? (
                  <div className="rounded-xl bg-[#143A62] flex items-center justify-center py-[6px]">
                    <span className="text-[14px] text-white">{tab.label}</span>
                  </div>
                ) : (
                  <div className="rounded-xl flex items-center justify-center py-[10px]">
                    <span className="text-[14px] text-[#143A62]">
                      {tab.label}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default SelectionSwitch;
