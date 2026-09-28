"use client";

import React, { useState, useRef, useEffect } from "react";
import { PersonProvider, usePerson } from "@/context/PersonContext";
import FloatingSelect from "@/components/common/FloatingSelect";
import StepProgress from "@/components/common/StepProgress";
import Button from "@mui/material/Button";
import { useFormStore } from "@/store/formStore";
import DigitalProjectsForm2 from "./FormDigitalProjects2";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ModalTriggerInput from "@/components/common/ModalTriggerInput";
import SelectImageModal from "@/components/common/SelectImageModal";
import FloatingInput from "@/components/common/FloatingInput";
import SwitchPersonSentence from "../../CommonForms/SwitchPerson";
import AddRelatedDescriptionModal from "@/components/common/AddRelatedDescriptionModal";
import DualFloatingSelect, {
  TimeUnit,
} from "@/components/common/DualFloatingSelect";

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
const FormDigitalProjects1: React.FC<{ onClose?: () => void }> = ({
  onClose,
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const { activeTab, setActiveTab } = usePerson();
  const router = useRouter();

  const setUserType = useFormStore((state) => state.setUserType);
  const setCurrentStep = useFormStore((state) => state.setCurrentStep);
  const { getFormData, setField } = useFormStore();

  const digitalData = getFormData("digital") as Record<string, any>;

  const [mainImage, setMainImage] = useState<string | null>(
    digitalData?.mainImage || null,
  );
  const [requestType, setRequestType] = useState<string>(
    digitalData?.requestType || "",
  );

  const [state, setState] = useState<{
    minBudget: string;
    maxBudget: string;
    title: string;
    description: string;
  }>({
    minBudget: digitalData?.minBudget || "",
    maxBudget: digitalData?.maxBudget || "",
    title: digitalData?.title || "",
    description: digitalData?.description || "",
  });

  // مقادیر مربوط به DualFloatingSelect
  const [durationUnit, setDurationUnit] = useState<TimeUnit | "">(
    digitalData?.durationUnit || "",
  );

  const [durationAmount, setDurationAmount] = useState<string>(
    digitalData?.durationAmount?.toString() || "",
  );

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [descriptionModalOpen, setDescriptionModalOpen] = useState(false);
  const [showNextForm, setShowNextForm] = useState(false);

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

  // تابع کمکی برای تبدیل رشته بودجه به عدد (حذف کاما)
  const parseBudget = (budgetStr: string): number => {
    if (!budgetStr) return 0;
    const cleaned = budgetStr.replace(/,/g, "");
    return Number(cleaned);
  };

  useEffect(() => {
    if (digitalData.person) {
      setActiveTab(digitalData.person);
    }
  }, [digitalData.person, setActiveTab]);

  useEffect(() => {
    if (digitalData?.person && activeTab !== digitalData.person) {
      setActiveTab(digitalData.person);
    }
  }, [activeTab, digitalData?.person, setActiveTab]);

  const handleDurationChange = (unit: TimeUnit | "", amount: string) => {
    setDurationUnit(unit);
    setDurationAmount(amount);

    setField("digital", "durationUnit", unit);
    setField("digital", "durationAmount", amount);
  };

  const handleRequestTypeChange = (
    value: string | number | (string | number)[],
  ) => {
    const selectedValue = String(Array.isArray(value) ? value[0] : value);

    setRequestType(selectedValue);
    setField("digital", "requestType", selectedValue);
  };

  const handleNextStep = () => {
    // اعتبارسنجی فیلدهای ضروری
    if (!state.title || !state.minBudget || !state.maxBudget) {
      showToast("لطفا تمام فیلدهای ضروری را پر کنید", "error");
      return;
    }

    // اعتبارسنجی بازه زمانی (DualFloatingSelect)
    if (!durationUnit || !durationAmount) {
      showToast("لطفا بازه زمانی را کامل کنید", "error");
      return;
    }

    // تبدیل مقادیر بودجه به عدد با حذف کاما
    const min = parseBudget(state.minBudget);
    const max = parseBudget(state.maxBudget);

    if (min >= max) {
      showToast("حداکثر بودجه باید بیشتر از حداقل بودجه باشد", "error");
      return;
    }

    setField("digital", "requestType", requestType);
    setField("digital", "minBudget", state.minBudget);
    setField("digital", "maxBudget", state.maxBudget);
    setField("digital", "title", state.title);
    setField("digital", "description", state.description);
    if (mainImage) setField("digital", "mainImage", mainImage);
    setField("digital", "person", activeTab);
    setField("digital", "durationUnit", durationUnit);
    setField("digital", "durationAmount", durationAmount);

    setUserType("digital");
    setCurrentStep(2);
    setShowNextForm(true);
  };

  if (showNextForm) return <DigitalProjectsForm2 />;

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
        className="relative z-10 flex flex-col sm:flex-row justify-center items-stretch sm:items-start h-auto sm:h-[90%] sm:mt-4 px-3"
        ref={parentRef}
      >
        <div
          className="absolute inset-0 w-full h-full rounded-[20px]"
          style={{ backgroundColor: "rgba(247,247,247,0.98)", zIndex: 0 }}
        />
        <img
          src="/images/bg_support_formik_desk.svg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover rounded-[20px]"
          style={{ zIndex: 1 }}
          loading="lazy"
        />
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

          <div className="relative z-20 flex flex-col sm:flex-row justify-center items-start w-full sm:w-[85%] gap-1 sm:gap-2 md:gap-6 mr-[10%]">
            <div className="flex flex-col gap-2 sm:gap-2 sm:flex-1 w-[99%] mr-[-10%] md:mr-[0%] sm:w-[85%] items-center sm:items-start">
              <div
                className="flex items-center gap-2 cursor-pointer my-[0.6vh] md:my-[2vh]"
                onClick={() => setImageModalOpen(true)}
              >
                <img
                  src={mainImage || "/images/img_form.svg"}
                  alt="عکس پروفایل"
                  className="w-[7vh] h-[7vh] object-cover rounded-md"
                />
                <span className="text-[2.4vh] text-gray-400 font-medium">
                  عکس پروفایل
                </span>
              </div>
              <FloatingSelect
                placeholder="نوع درخواست"
                value={requestType}
                options={[
                  { label: "درخواست دهنده", value: "requester" },
                  { label: "ارائه دهنده", value: "provider" },
                ]}
                onChange={(value) => handleRequestTypeChange(value)}
              />
              <FloatingInput
                placeholder="حداقل بودجه (تومان)"
                variant="input"
                value={state.minBudget}
                onChange={(val) => setState({ ...state, minBudget: val })}
                inputType="price"
              />
              <ModalTriggerInput
                placeholder="توضیحات"
                value={state.description}
                onClick={() => setDescriptionModalOpen(true)}
              />
            </div>

            <div className="flex flex-col gap-1 sm:gap-1 sm:flex-1 w-full items-start mt-[2%]">
              <DualFloatingSelect
                onChange={handleDurationChange}
                width="77%"
                height="6.5vh"
              />
              <FloatingInput
                placeholder="عنوان آگهی"
                variant="input"
                value={state.title}
                onChange={(val) => setState({ ...state, title: val })}
                inputType="alphanumeric"
              />
              <FloatingInput
                placeholder="حداکثر بودجه (تومان)"
                variant="input"
                value={state.maxBudget}
                onChange={(val) => setState({ ...state, maxBudget: val })}
                inputType="price"
              />
              <Button
                onClick={handleNextStep}
                className="w-[76%] h-[5vh] md:h-[7vh] mt-1 rounded-[10px] text-[2vh] md:text-[2.6vh] whitespace-nowrap"
                style={{
                  backgroundColor: "rgba(20,58,98,0.85)",
                  color: "#FFFFFF",
                  fontWeight: 600,
                  textTransform: "none",
                  marginTop: "2%",
                }}
              >
                مرحله بعد
              </Button>
            </div>
          </div>

          <SelectImageModal
            isOpen={imageModalOpen}
            onClose={() => setImageModalOpen(false)}
            onSelect={(images: ImageItem[]) => {
              if (images.length > 0 && images[0].file) {
                const url = URL.createObjectURL(images[0].file);
                setMainImage(url);
                setField("digital", "mainImage", url);
                setField(
                  "digital",
                  "images",
                  images.map((img) => img.file).filter(Boolean),
                );
              }
            }}
            parentRef={parentRef}
            userType="digital"
          />
          <AddRelatedDescriptionModal
            isOpen={descriptionModalOpen}
            onClose={() => setDescriptionModalOpen(false)}
            onSave={(desc: string) => {
              setState((prev) => ({ ...prev, description: desc }));
            }}
            parentRef={parentRef}
            titleModal="توضیحات پروژه"
            titleAdd="شرح پروژه:"
            titleAddHolder="عنوان"
            titleDescription="جزئیات:"
            userType="digital"
          />
        </div>
      </div>
    </>
  );
};

export default FormDigitalProjects1;
