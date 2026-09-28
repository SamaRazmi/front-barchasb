"use client";

import React from "react";
import Image from "next/image";

interface Option {
  label: string;
  value: string | number;
}

interface CustomSelectProps {
  options: Option[];
  placeholder: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  width?: string;
  smWidth?: string;
  mdWidth?: string;
  className?: string;
  name?: string;
  error?: string;
  touched?: boolean;
  icon?: string; // آیکون سمت چپ (اختیاری)
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  placeholder,
  value,
  onChange,
  width,
  smWidth,
  mdWidth,
  className = "",
  name,
  error,
  touched,
  icon,
}) => {
  const hasError = touched && error;

  const widthClasses = `
    ${width ? `w-[${width}]` : "w-full"}
    ${smWidth ? `sm:w-[${smWidth}]` : ""}
    ${mdWidth ? `md:w-[${mdWidth}]` : ""}
  `;

  return (
    <div
      className={`
        ${widthClasses}
        flex items-center
        relative
        ${className}
      `}
    >
      {/* آیکون سمت چپ (اختیاری) */}
      {icon && (
        <div className="flex-none ml-2">
          <Image src={icon} alt="icon" width={22} height={22} />
        </div>
      )}

      {/* select با پس‌زمینه شفاف و بدون استایل اضافی */}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="flex-1 h-full bg-transparent outline-none appearance-none text-right font-inherit"
        style={{ color: value ? "inherit" : "#9ca3af" }}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt, idx) => (
          <option key={idx} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* فلش سمت راست */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-gray-500"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {/* خطا در پایین */}
      {hasError && (
        <span className="absolute left-0 bottom-[-20px] text-red-500 text-sm">
          {error}
        </span>
      )}
    </div>
  );
};

export default CustomSelect;