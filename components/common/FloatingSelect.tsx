"use client";

import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";
import { SelectChangeEvent } from "@mui/material/Select";
import Image from "next/image";

interface SelectOption {
  label: string;
  value: string | number;
}

interface FloatingSelectProps {
  placeholder?: string;
  options: SelectOption[];
  width?: string;
  height?: string;
  value: string | number | (string | number)[];
  onChange: (value: string | number | (string | number)[]) => void;
  multiSelect?: boolean;
  disabled?: boolean;
  activeLabelBg?: string;
  showCloseIcon?: boolean;
}

const FloatingSelect: React.FC<FloatingSelectProps> = ({
  placeholder,
  options,
  width = "77%",
  height = "6vh",
  value,
  onChange,
  multiSelect = false,
  disabled,
  activeLabelBg = "rgba(247, 247, 247, 0.98)",
  showCloseIcon = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const safeValue: (string | number)[] = multiSelect
    ? Array.isArray(value)
      ? value
      : []
    : value
      ? [value as string | number]
      : [];

  const isActive = safeValue.length > 0 || isFocused;

  const handleChange = (val: string | number | (string | number)[]) => {
    if (multiSelect) {
      onChange(Array.isArray(val) ? (val as (string | number)[]) : []);
    } else {
      onChange(Array.isArray(val) ? val[0] : val);
    }
  };

  const handleOptionClick = (optionValue: string | number) => {
    if (optionValue === "__close__") {
      setIsOpen(false);
      return;
    }
    let newValues: (string | number)[];
    if (safeValue.includes(optionValue)) {
      newValues = safeValue.filter((v) => v !== optionValue);
    } else {
      newValues = [...safeValue, optionValue];
    }
    handleChange(newValues);
  };

  const renderSelectedValue = (selected: unknown) => {
    const values = Array.isArray(selected) ? selected : [];
    if (!multiSelect)
      return options.find((o) => o.value === values[0])?.label ?? "";
    if (values.length === 0) return "";
    if (values.length === 1)
      return options.find((o) => o.value === values[0])?.label;
    return `${values.length} مورد انتخاب شد`;
  };

  const getLabelFontSize = () => {
    const vw = window.innerWidth;
   if (vw < 600) return isActive ? "1.6vh" : "1.4vh";
    if (vw < 960) return isActive ? "2.2vh" : "2vh";
    return isActive ? "2.4vh" : "2.4vh";
  };

  const menuItems = [
    ...(showCloseIcon
      ? [
          <MenuItem
            key="__close__"
            value="__close__"
            onClick={(e) => {
              e.stopPropagation();
              handleOptionClick("__close__");
            }}
            sx={{
              justifyContent: "flex-end",
              borderBottom: "1px solid #e0e0e0",
              minHeight: "3vh",
              padding: "4px 8px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                width: "100%",
              }}
            >
              <Image
                src="/images/close-icon.svg"
                alt="بستن"
                width={18}
                height={18}
                style={{ cursor: "pointer" }}
              />
            </div>
          </MenuItem>,
        ]
      : []),
    ...options.map((option) => (
      <MenuItem
        key={option.value}
        value={option.value}
        onClick={(e) => {
          e.stopPropagation();
          handleOptionClick(option.value);
        }}
      >
        {multiSelect && <Checkbox checked={safeValue.includes(option.value)} />}
        <ListItemText primary={option.label} />
      </MenuItem>
    )),
  ];

  return (
    <div
      className="mb-1 sm:mb-[2.5vh]"
      style={{ width, position: "relative", zIndex: 100 }}
    >
      <TextField
        select
        fullWidth
        disabled={disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        InputProps={{
          style: {
            textAlign: "right",
            fontWeight: 600,
            height,
            fontSize: "2vh",
            paddingLeft: "40px",
          },
          endAdornment: null,
        }}
        SelectProps={{
          multiple: multiSelect,
          value: safeValue,
          IconComponent: () => null,
          open: isOpen,
          onOpen: () => setIsOpen(true),
          onClose: () => setIsOpen(false),
          onChange: (e: SelectChangeEvent<any>) =>
            handleChange(
              e.target.value as string | number | (string | number)[],
            ),
          renderValue: renderSelectedValue,
          MenuProps: {
            anchorOrigin: { vertical: "center", horizontal: "right" },
            transformOrigin: { vertical: "center", horizontal: "right" },
            PaperProps: {
              sx: {
                maxHeight: "40vh",
                "& .MuiMenu-list": {
                  paddingTop: 0,
                  paddingBottom: 0,
                },
              },
            },
          },
        }}
        InputLabelProps={{ shrink: false, style: { display: "none" } }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "10px",
            backgroundColor: "#FFFFFF",
            "&.Mui-focused": { borderColor: "#374151", borderWidth: "1px" },
            height: { xs: "4vh", sm: "6.5vh", md: height },
            fontSize: { xs: "1.8vh", sm: "2vh", md: "2vh" },
            paddingLeft: { xs: "30px", sm: "35px", md: "40px" },
          },
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "#D1D5DB" },
        }}
      >
        {menuItems}
      </TextField>

      {/* ======= فلش اصلاح‌شده ======= */}
      <div
        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center"
        style={{
          pointerEvents: disabled ? "none" : "auto", // غیرفعال کردن کلیک
          cursor: disabled ? "default" : "pointer",
          transition: "transform 0.3s ease",
          transform: isOpen
            ? "translateY(-50%) rotate(180deg)"
            : "translateY(-50%) rotate(0deg)",
          opacity: disabled ? 0.5 : 1, // نشان‌دهنده غیرفعال بودن
        }}
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen); // فقط در صورت فعال بودن
        }}
      >
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

      {placeholder && (
        <label
          onClick={() => setIsFocused(true)}
          style={{
            position: "absolute",
            right: "10px",
            top: isActive ? "-2px" : "50%",
            transform: isActive
              ? "translateY(-50%) scale(0.9)"
              : "translateY(-50%)",
            transition: "all 0.3s ease",
            fontWeight: 600,
            color: isActive ? "#4B5563" : "rgba(20,58,98,0.15)",
            backgroundColor: isActive ? activeLabelBg : "transparent",
            padding: isActive ? "0 20px" : "0",
            pointerEvents: "none",
            zIndex: 101,
            fontSize: getLabelFontSize(),
          }}
        >
          {placeholder}
        </label>
      )}
    </div>
  );
};

export default FloatingSelect;
