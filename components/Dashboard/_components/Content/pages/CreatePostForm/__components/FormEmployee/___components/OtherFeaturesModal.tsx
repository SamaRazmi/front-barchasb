// ===================== OtherFeaturesModal.tsx (اصلاح شده) =====================
"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import FloatingInput from "@/components/common/FloatingInput";
import FloatingSelect from "@/components/common/FloatingSelect";
import { useFormStore } from "@/store/formStore";

interface OtherFeaturesModalProps {
  onClose: () => void;
  parentRef: React.RefObject<HTMLDivElement | null>;
  onSave?: () => void;
  initialDataFromApi?: EmployerData;
}

interface EmployerData {
  companyName?: string;
  companyType?: string;
  benefits?: string;
  insurance?: string;
  education?: string;
  [key: string]: any;
}

const insuranceOptions = [
  { label: "سازمان تامین اجتماعی", value: "social" },
  { label: "بیمه تکمیلی", value: "supplementary" },
  { label: "بیمه عمر", value: "life" },
  { label: "بیمه مسئولیت", value: "liability" },
  { label: "سایر", value: "other" },
];
const companyTypes = [
  { label: "سهامی خاص", value: "private_joint" },
  { label: "سهامی عام", value: "public_joint" },
  { label: "مسئولیت محدود", value: "limited_liability" },
  { label: "دانش بنیان", value: "knowledge_based" },
  { label: "هیئت امنایی", value: "board_trustees" },
  { label: "مشارکتی", value: "partnership" },
  { label: "دولتی", value: "government" },
  { label: "سایر", value: "other" },
];

const benefitsOptions = [
  { label: "پاداش", value: "bonus" },
  { label: "ناهار", value: "lunch" },
  { label: "ساعت کاری منعطف", value: "flexible_hours" },
  { label: "کمک هزینه آموزشی", value: "education_allowance" },
  { label: "امکان پیشرفت شغلی", value: "career_growth" },
  { label: "اتاق بازی", value: "game_room" },
  { label: "قهوه رایگان", value: "free_coffee" },
];

// ===== اضافه کردن گزینه "دیپلم" =====
const educationOptions = [
  { label: "دیپلم", value: "diploma" },
  { label: "کاردانی", value: "associate" },
  { label: "کارشناسی", value: "bachelor" },
  { label: "کارشناسی ارشد", value: "master" },
  { label: "فرقی نمیکند", value: "any" },
  { label: "سایر", value: "other" },
];

const OtherFeaturesModal: React.FC<OtherFeaturesModalProps> = ({
  onClose,
  parentRef,
  onSave,
  initialDataFromApi,
}) => {
  const [parentRect, setParentRect] = useState<DOMRect | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const { getFormData, setField } = useFormStore();
  const employerData = getFormData("employer") as EmployerData;

  const [companyName, setCompanyName] = useState(
    initialDataFromApi?.companyName ?? employerData?.companyName ?? "",
  );
  const [companyType, setCompanyType] = useState(
    initialDataFromApi?.companyType ?? employerData?.companyType ?? "",
  );
  const [benefits, setBenefits] = useState(
    initialDataFromApi?.benefits ?? employerData?.benefits ?? "",
  );
  const [insurance, setInsurance] = useState(
    initialDataFromApi?.insurance ?? employerData?.insurance ?? "",
  );
  const [education, setEducation] = useState(
    initialDataFromApi?.education ?? employerData?.education ?? "",
  );

  const listRef = useRef<HTMLDivElement>(null);
  const [dragStart, setDragStart] = useState<number | null>(null);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  useEffect(() => {
    if (!parentRef.current || isMobile) return;
    const updateRect = () =>
      setParentRect(parentRef.current!.getBoundingClientRect());
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

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragStart(e.clientY);
    const handleMouseMove = (ev: MouseEvent) => {
      if (listRef.current && dragStart !== null) {
        listRef.current.scrollTop += dragStart - ev.clientY;
        setDragStart(ev.clientY);
      }
    };
    const handleMouseUp = () => {
      setDragStart(null);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };
  const handleTouchStart = (e: React.TouchEvent) =>
    setDragStart(e.touches[0].clientY);
  const handleTouchMove = (e: React.TouchEvent) => {
    if (listRef.current && dragStart !== null) {
      listRef.current.scrollTop += dragStart - e.touches[0].clientY;
      setDragStart(e.touches[0].clientY);
    }
  };

  const handleClose = () => {
    setField("employer", "companyName", companyName);
    setField("employer", "companyType", companyType);
    setField("employer", "benefits", benefits);
    setField("employer", "insurance", insurance);
    setField("employer", "education", education);
    if (onSave) onSave();
    onClose();
  };

  if (!isMobile && !parentRect) return null;

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
        maxWidth: "500px",
        height: "80vh",
        maxHeight: "90vh",
        backgroundColor: "white",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        display: "flex",
        flexDirection: "column",
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
        width: "35%",
        maxWidth: "500px",
        height: "75%",
        backgroundColor: "white",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        display: "flex",
        flexDirection: "column",
      };

  return createPortal(
    <>
      <div style={backdropStyle} />

      <div style={modalStyle}>
        <div
          className="px-4 py-3 flex justify-center items-center relative flex-shrink-0"
          style={{ backgroundColor: "#E5E7EB" }}
        >
          <button onClick={handleClose} className="absolute left-3 w-6 h-6">
            <img src="/images/close-icon.svg" alt="close" />
          </button>
          <span className="font-bold text-lg" style={{ color: "#143A62" }}>
            سایر ویژگی‌ها و امکانات
          </span>
        </div>

        <div
          ref={listRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          style={{
            overflow: "hidden",
            padding: "16px",
            flex: 1,
            cursor: "grab",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <FloatingInput
            placeholder="نام کسب و کار" // تغییر برچسب
            value={companyName}
            onChange={setCompanyName}
            width="95%"
          />
          {/* مخفی کردن نوع شرکت با شرط false */}
          {false && (
            <FloatingSelect
              placeholder="نوع شرکت"
              options={companyTypes}
              value={companyType}
              onChange={(val) => setCompanyType(String(val))}
              width="95%"
            />
          )}
          <FloatingSelect
            placeholder="مزایا"
            options={benefitsOptions}
            value={benefits}
            onChange={(val) => setBenefits(String(val))}
            width="95%"
          />
          <FloatingSelect
            placeholder="بیمه"
            options={insuranceOptions}
            value={insurance}
            onChange={(val) => setInsurance(String(val))}
            width="95%"
          />
          <FloatingSelect
            placeholder="تحصیلات"
            options={educationOptions} // شامل دیپلم
            value={education}
            onChange={(val) => setEducation(String(val))}
            width="95%"
          />
        </div>
      </div>
    </>,
    document.body,
  );
};

export default OtherFeaturesModal;
