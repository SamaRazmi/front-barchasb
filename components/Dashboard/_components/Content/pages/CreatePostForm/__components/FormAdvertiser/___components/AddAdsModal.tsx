"use client";

import React, { useEffect, useState, useRef } from "react";
import { useFormStore } from "@/store/formStore";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import {
  fetchAdMainCategories,
  fetchAdSubCategories,
} from "@/api/apiCategories";
import { toast } from "react-toastify";

interface AddAdsModalProps {
  onClose: () => void;
  parentRef: React.RefObject<HTMLDivElement | null>;
}

interface Category {
  id?: string;
  _id?: string;
  name: string;
}

const AddAdsModal: React.FC<AddAdsModalProps> = ({ onClose, parentRef }) => {
  const [parentRect, setParentRect] = useState<DOMRect | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [selectedCategoryName, setSelectedCategoryName] = useState<
    string | null
  >(null);
  const [tempCategory, setTempCategory] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const setField = useFormStore((state) => state.setField);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current) return;
      const scrollAmount = 100;
      const pageScrollAmount = containerRef.current.clientHeight;
      switch (e.key) {
        case "ArrowDown":
          containerRef.current.scrollTop += scrollAmount;
          e.preventDefault();
          break;
        case "ArrowUp":
          containerRef.current.scrollTop -= scrollAmount;
          e.preventDefault();
          break;
        case "PageDown":
          containerRef.current.scrollTop += pageScrollAmount;
          e.preventDefault();
          break;
        case "PageUp":
          containerRef.current.scrollTop -= pageScrollAmount;
          e.preventDefault();
          break;
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!parentRef.current || isMobile) return;
    const updateRect = () => {
      if (!parentRef.current) return;
      setParentRect(parentRef.current.getBoundingClientRect());
    };
    updateRect();
    const resizeObserver = new ResizeObserver(updateRect);
    resizeObserver.observe(parentRef.current);
    window.addEventListener("scroll", updateRect);
    window.addEventListener("resize", updateRect);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("scroll", updateRect);
      window.removeEventListener("resize", updateRect);
    };
  }, [parentRef, isMobile]);

  const { data: mainData, error: mainError } = useQuery({
    queryKey: ["ad-main-categories"],
    queryFn: fetchAdMainCategories,
    enabled: !selectedCategoryId,
  });

  const { data: subData, error: subError } = useQuery<any>({
    queryKey: ["ad-sub-categories", selectedCategoryId],
    queryFn: () => fetchAdSubCategories(selectedCategoryId!),
    enabled: !!selectedCategoryId,
  });

  if (mainError) toast.error("خطا در دریافت دسته‌های اصلی");
  if (subError) toast.error("خطا در دریافت زیردسته‌ها");

  if (!isMobile && !parentRect) return null;

  // ========== تابع فیلتر قوی برای زیردسته‌ها ==========
  const filterSubCategories = (items: Category[]): Category[] => {
    return items.filter((cat) => {
      const name = cat?.name?.trim() || "";
      const normalized = name.replace(/\s+/g, "");
      return !(
        normalized.includes("تجهیزاتصنعتی") ||
        normalized.includes("تجهیزاتوصنعتی")
      );
    });
  };

  // ========== استخراج دسته‌ها ==========
  let categories: Category[] = [];

  if (selectedCategoryId && subData) {
    let rawCategories: Category[] = [];
    if (Array.isArray(subData)) {
      rawCategories = subData;
    } else if (subData.subCategories && Array.isArray(subData.subCategories)) {
      rawCategories = subData.subCategories;
    } else if (subData.data && Array.isArray(subData.data)) {
      rawCategories = subData.data;
    } else if (subData.category && typeof subData.category === "object") {
      const catObj = subData.category;
      if (catObj.subCategories && Array.isArray(catObj.subCategories)) {
        rawCategories = catObj.subCategories;
      }
    }
    categories = filterSubCategories(rawCategories);
  } else {
    if (mainData && typeof mainData === "object" && "categories" in mainData) {
      const mainCategories = (mainData as any).categories;
      if (Array.isArray(mainCategories)) {
        categories = mainCategories.filter(
          (cat: Category) => cat.name !== "تجهیزات صنعتی",
        );
      }
    }
  }

  // ========== تابع بستن با اعتبارسنجی و نمایش توست ==========
  const handleClose = () => {
    // اگر در حالت انتخاب زیردسته هستیم و زیردسته انتخاب نشده
    if (selectedCategoryId && !tempCategory) {
      // نمایش توست با پس‌زمینه قرمز (theme: colored) در بالا وسط
      toast.error("باید زیر دسته حتما انتخاب شود", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        theme: "colored", // پس‌زمینه قرمز برای خطا
      });
      onClose(); // مودال بسته می‌شود ولی فیلد ذخیره نمی‌شود
      return;
    }

    // اگر زیردسته انتخاب شده باشد، مقدار را ذخیره کن
    if (selectedCategoryName && tempCategory) {
      setField(
        "advertiser",
        "category",
        `${selectedCategoryName} / ${tempCategory}`,
      );
    }
    onClose();
  };

  // ========== توابع کمکی ==========
  const handleBackToMain = () => {
    setSelectedCategoryId(null);
    setSelectedCategoryName(null);
    setTempCategory(null);
  };

  const backdropStyle: React.CSSProperties = isMobile
    ? {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backdropFilter: "blur(4px)",
        backgroundColor: "rgba(0,0,0,0.1)",
        zIndex: 1000,
        pointerEvents: "auto",
      }
    : {
        position: "absolute",
        top: parentRect ? parentRect.top + window.scrollY : 0,
        left: parentRect ? parentRect.left + window.scrollX : 0,
        width: parentRect ? parentRect.width : 0,
        height: parentRect ? parentRect.height : 0,
        backdropFilter: "blur(4px)",
        backgroundColor: "rgba(0,0,0,0.1)",
        zIndex: 1000,
        pointerEvents: "auto",
        borderRadius: "20px",
      };

  const modalStyle: React.CSSProperties = isMobile
    ? {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 1001,
        width: "90%",
        height: "80vh",
        maxHeight: "90vh",
        backgroundColor: "white",
        borderRadius: "0.75rem",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }
    : {
        position: "absolute",
        top: parentRect
          ? parentRect.top + window.scrollY + parentRect.height / 2
          : 0,
        left: parentRect
          ? parentRect.left + window.scrollX + parentRect.width / 2
          : 0,
        transform: "translate(-50%, -50%)",
        zIndex: 1001,
        width: "32%",
        height: "75%",
        backgroundColor: "white",
        borderRadius: "0.75rem",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      };

  return createPortal(
    <>
      <style>{`
        .category-item {
          background-color: #E5E7EB;
          color: #143A62;
          padding: 12px 16px;
          border-radius: 10px;
          transition: transform 0.2s ease, background-color 0.2s ease;
          cursor: pointer;
          width: 100%;
          transform: translateX(0);
          text-align: right;
          position: relative;
          overflow: hidden;
        }
        .category-item:hover {
          transform: translateX(-4%) !important;
          background-color: #D1D5DB;
        }
      `}</style>
      <div style={backdropStyle} onClick={handleClose} />

      <div
        style={modalStyle}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl flex flex-col overflow-hidden"
      >
        <div
          className="px-4 py-3 flex justify-center items-center flex-shrink-0 relative"
          style={{
            backgroundColor: "#E5E7EB",
            fontSize: isMobile ? "1.7vh" : "2vh",
          }}
        >
          <button onClick={handleClose} className="absolute left-3 w-6 h-6">
            <img src="/images/close-icon.svg" alt="close" />
          </button>
          <span className="font-bold" style={{ color: "#143A62" }}>
            انتخاب دسته آگهی‌ها
          </span>
        </div>

        <div
          className="flex-1 px-6 py-4 overflow-hidden select-none"
          style={{ cursor: "grab" }}
          ref={containerRef}
          onMouseDown={(e) => {
            if (e.target !== containerRef.current) return;
            setDragOffset(e.clientY);
            const handleDrag = (e: MouseEvent) => {
              if (containerRef.current) {
                const delta = dragOffset - e.clientY;
                containerRef.current.scrollTop = Math.max(
                  0,
                  containerRef.current.scrollTop + delta,
                );
                setDragOffset(e.clientY);
              }
            };
            const handleMouseUp = () => {
              document.removeEventListener("mousemove", handleDrag);
              document.removeEventListener("mouseup", handleMouseUp);
            };
            document.addEventListener("mousemove", handleDrag);
            document.addEventListener("mouseup", handleMouseUp);
          }}
          onTouchStart={(e) => {
            if (e.target !== containerRef.current) return;
            setDragOffset(e.touches[0].clientY);
          }}
          onTouchMove={(e) => {
            if (containerRef.current && e.target === containerRef.current) {
              const delta = dragOffset - e.touches[0].clientY;
              containerRef.current.scrollTop = Math.max(
                0,
                containerRef.current.scrollTop + delta,
              );
              setDragOffset(e.touches[0].clientY);
            }
          }}
          onWheel={(e) => {
            if (containerRef.current)
              containerRef.current.scrollTop += e.deltaY;
          }}
        >
          {selectedCategoryId && (
            <div
              onClick={handleBackToMain}
              className="mb-4 text-right cursor-pointer rounded-[10px] px-4 py-2 w-[80%] sm:w-[60%] whitespace-nowrap bg-gray-400 text-white"
              style={{
                fontSize: isMobile ? "1.5vh" : "1.8vh",
              }}
            >
              بازگشت به انتخاب دسته ←
            </div>
          )}

          <div className="flex flex-col gap-3">
            {categories.map((item, index) => {
              const categoryId = item.id || (item as any)._id;
              return (
                <div
                  key={categoryId || `category-${index}`}
                  className="category-item"
                  style={{
                    fontSize: isMobile ? "1.7vh" : "2vh",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!categoryId) return;

                    if (!selectedCategoryId) {
                      // انتخاب دسته اصلی
                      setSelectedCategoryName(item.name);
                      setSelectedCategoryId(categoryId);
                      setTempCategory(null); // ریست زیردسته قبلی
                    } else {
                      // انتخاب زیردسته
                      setTempCategory(item.name);
                      setField(
                        "advertiser",
                        "category",
                        `${selectedCategoryName} / ${item.name}`,
                      );
                      onClose(); // بعد از انتخاب زیردسته، مودال بسته می‌شود
                    }
                  }}
                >
                  <span style={{ display: "block" }}>{item.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
};

export default AddAdsModal;