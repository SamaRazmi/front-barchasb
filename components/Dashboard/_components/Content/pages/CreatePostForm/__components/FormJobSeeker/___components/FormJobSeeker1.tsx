"use client";

import React, { useState, useRef, useEffect } from "react";
import { PersonProvider, usePerson } from "@/context/PersonContext";
import StepProgress from "@/components/common/StepProgress";
import FloatingInput from "@/components/common/FloatingInput";
import SelectImageModal from "@/components/common/SelectImageModal";
import SwitchPersonSentence from "../../CommonForms/SwitchPerson";
import Button from "@mui/material/Button";
import { useFormStore } from "@/store/formStore";
import FormJobSeeker2 from "./FormJobSeeker2";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import jalaali from "jalaali-js";
import ReactDOM from "react-dom";

interface ImageItem {
  src: string;
  file?: File;
  fromApi?: boolean;
  isMain?: boolean;
}

// -----------------------------------------------------------------
// کامپوننت Toast با پشتیبانی از رنگ‌های خطا و موفقیت
// -----------------------------------------------------------------
const Toast: React.FC<{
  message: string;
  progress: number;
  visible: boolean;
  type?: "error" | "success";
}> = ({ message, progress, visible, type = "error" }) => {
  if (!visible) return null;

  const bgColor = type === "error" ? "#d32f2f" : "#2e7d32";

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        backgroundColor: bgColor,
        color: "#fff",
        padding: "16px 24px",
        borderRadius: "12px",
        minWidth: "280px",
        maxWidth: "90%",
        textAlign: "center",
        boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
        direction: "rtl",
        fontFamily: "inherit",
      }}
    >
      <div
        style={{ fontSize: "1.1rem", fontWeight: 500, marginBottom: "10px" }}
      >
        {message}
      </div>
      <div
        style={{
          width: "100%",
          height: "4px",
          backgroundColor: "rgba(255,255,255,0.25)",
          borderRadius: "2px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            backgroundColor: "#ffffff",
            borderRadius: "2px",
            transition: "width 0.1s linear",
          }}
        />
      </div>
    </div>
  );
};

// -----------------------------------------------------------------
// کامپوننت اصلی
// -----------------------------------------------------------------
const FormJobSeeker1: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const { activeTab, setActiveTab } = usePerson();
  const { user, loading } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showNextForm, setShowNextForm] = useState(false);
  const router = useRouter();

  const setUserType = useFormStore((state) => state.setUserType);
  const setCurrentStep = useFormStore((state) => state.setCurrentStep);
  const { getFormData, setField } = useFormStore();

  const calculateAgeFromShamsi = (birthDateShamsi: string) => {
    if (!birthDateShamsi) return "";

    const persianNumbers = "۰۱۲۳۴۵۶۷۸۹";
    const englishNumbers = "0123456789";
    const normalizeNumber = (str: string) =>
      str.replace(/[۰-۹]/g, (w) => englishNumbers[persianNumbers.indexOf(w)]);

    const normalizedDate = normalizeNumber(birthDateShamsi);
    const [jy, jm, jd] = normalizedDate.split("/").map(Number);

    const { gy, gm, gd } = jalaali.toGregorian(jy, jm, jd);

    const today = new Date();
    let age = today.getFullYear() - gy;
    const birthdayThisYear = new Date(today.getFullYear(), gm - 1, gd);
    if (today < birthdayThisYear) age--;

    return age;
  };

  // state محلی فرم
  const [state, setState] = useState({
    age: "",
    salary: "",
    name: "",
    education: "",
  });

  const [mainImage, setMainImage] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);

  // -----------------------------------------------------------------
  // State مربوط به Toast
  // -----------------------------------------------------------------
  const [toast, setToast] = useState({
    message: "",
    visible: false,
    progress: 0,
    type: "error" as "error" | "success",
  });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (message: string, type: "error" | "success" = "error") => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setToast({ message, visible: true, progress: 0, type });

    const duration = 3000;
    const interval = 30;
    const step = (interval / duration) * 100;

    timerRef.current = setInterval(() => {
      setToast((prev) => {
        const newProgress = Math.min(prev.progress + step, 100);
        if (newProgress >= 100) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return { ...prev, visible: false, progress: 100 };
        }
        return { ...prev, progress: newProgress };
      });
    }, interval);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // مقداردهی اولیه فرم و هماهنگی با تب و Zustand
  useEffect(() => {
    const jobSeekerData = getFormData("jobSeeker") as Record<string, any>;

    setState({
      age:
        jobSeekerData?.age ||
        (activeTab === "khodam" && user?.birthDate
          ? calculateAgeFromShamsi(user.birthDate)
          : ""),
      salary: jobSeekerData?.salary || "",
      name:
        jobSeekerData?.name ||
        (activeTab === "khodam" && user ? `${user.name} ${user.lastName}` : ""),
      education: jobSeekerData?.education || "",
    });

    setMainImage(jobSeekerData?.mainImage || null);
    setImages(jobSeekerData?.images || []);

    if (jobSeekerData.person) {
      setActiveTab(jobSeekerData.person);
    }
  }, [activeTab, user, getFormData, setActiveTab]);

  const handleNextStep = () => {
    const requiredFields: (keyof typeof state)[] = [
      "age",
      "salary",
      "name",
      "education",
    ];
    const emptyFields = requiredFields.filter((key) => !state[key]);

    if (emptyFields.length > 0) {
      showToast("لطفا تمام فیلدها را پر کنید", "error");
      return;
    }

    // ذخیره در Zustand
    Object.entries(state).forEach(([key, value]) => {
      setField("jobSeeker", key, value);
    });

    setField("jobSeeker", "person", activeTab);

    if (mainImage) setField("jobSeeker", "mainImage", mainImage);
    if (images.length > 0) setField("jobSeeker", "images", images);

    setUserType("jobSeeker");
    setCurrentStep(2);

    setShowNextForm(true);

    console.log("داده‌های فرم jobSeeker:", getFormData("jobSeeker"));
  };

  if (showNextForm) return <FormJobSeeker2 />;

  return (
    <>
      {/* Toast در بالای صفحه */}
      <Toast
        message={toast.message}
        progress={toast.progress}
        visible={toast.visible}
        type={toast.type}
      />

      <div
        className="relative z-10 flex flex-col sm:flex-row justify-center items-stretch sm:items-start h-[98%] sm:h-[90%] px-1 mt-1 sm:mt-4 sm:px-3"
        ref={parentRef}
      >
        <div
          className="absolute inset-0 w-full h-full rounded-[20px]"
          style={{ backgroundColor: "rgba(247, 247, 247, 0.98)", zIndex: 0 }}
        />
        <img
          src="/images/bg_support_formik_desk.svg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover rounded-[20px]"
          style={{ zIndex: 1 }}
          loading="lazy"
        />
        {/* دکمه Close در موبایل */}
        <div className="absolute top-2 left-2 sm:hidden z-30">
          <button
            onClick={() => {
              onClose?.();
              router.push("/dashboard/createform");
            }}
            className="bg-red-500 text-white px-2 py-1 rounded-full font-bold text-[1.2vh]"
          >
            ✕
          </button>
        </div>
        {/* دکمه برگشت */}
        <div
          className="hidden sm:flex absolute top-0 right-1 z-50 bg-gray-200 p-1 rounded-full cursor-pointer items-center justify-center"
          onClick={() => router.push("/dashboard/createform")}
        >
          <img
            src="/images/back_arrow.svg"
            alt="Back"
            className="w-6 h-6 rotate-180"
          />
        </div>

        <div className="flex flex-col justify-start h-[95%] p-4 relative z-20 w-[80%] mx-auto">
          <StepProgress currentStep={1} />
          <SwitchPersonSentence />

          {/* خطای متنی حذف شد */}

          <div className="relative z-20 flex flex-col sm:flex-row justify-center items-start w-full sm:w-[85%] gap-0 sm:gap-4 md:gap-6 mr-[10%]">
            <div className="flex flex-col gap-1 sm:gap-3 sm:flex-1 w-[99%] mr-[-10%] md:mr-[0%] sm:w-[85%] items-center sm:items-start">
              <div
                className="flex items-center gap-2 cursor-pointer my-[0.6vh] md:my-[2.8vh]"
                onClick={() => setIsModalOpen(true)}
              >
                <img
                  src={mainImage || "/images/img_form.svg"}
                  alt="عکس فرم"
                  className="w-[5vh] h-[5vh] sm:w-[7vh] sm:h-[7vh] object-cover rounded-md"
                />
                <span className="text-[2vh] sm:text-[2.4vh] text-gray-400 font-medium">
                  عکس کارجو
                </span>
              </div>

              <FloatingInput
                placeholder="سن"
                variant="input"
                value={state.age?.toString() || ""}
                onChange={(val) => setState({ ...state, age: val })}
                inputType="number"
              />

              <FloatingInput
                placeholder="حقوق پیشنهادی (تومان)"
                variant="input"
                value={state.salary}
                onChange={(val) => setState({ ...state, salary: val })}
                inputType="price"
              />
            </div>

            <div className="flex flex-col gap-1 sm:gap-5 sm:flex-1 w-full items-start">
              <FloatingInput
                placeholder="نام"
                variant="input"
                value={state.name}
                onChange={(val) => setState({ ...state, name: val })}
                inputType="text"
              />

              <FloatingInput
                placeholder="تحصیلات"
                variant="input"
                value={state.education}
                onChange={(val) => setState({ ...state, education: val })}
                inputType="text"
              />

              <Button
                onClick={handleNextStep}
                className="w-[76%] h-[5vh] md:h-[7vh] mt-5 rounded-[10px] text-[2vh] md:text-[2.6vh] whitespace-nowrap"
                style={{
                  backgroundColor: "rgba(20,58,98,0.85)",
                  color: "#FFFFFF",
                  fontWeight: 600,
                  textTransform: "none",
                }}
              >
                مرحله بعد
              </Button>
            </div>
          </div>

          {/* استفاده از Portal برای نمایش مودال روی تمام المان‌ها */}
          {isModalOpen &&
            ReactDOM.createPortal(
              <SelectImageModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelect={(images: ImageItem[]) => {
                  if (images.length > 0 && images[0].file) {
                    const url = URL.createObjectURL(images[0].file);
                    setMainImage(url);

                    // فقط فایل‌های واقعی را جدا می‌کنیم
                    const files = images
                      .map((img) => img.file)
                      .filter(Boolean) as File[];
                    setImages(files);

                    setField("jobSeeker", "mainImage", url);
                    setField("jobSeeker", "images", files);
                  }
                }}
                parentRef={parentRef}
                userType="jobSeeker"
              />,
              document.body,
            )}
        </div>
      </div>
    </>
  );
};

export default FormJobSeeker1;
