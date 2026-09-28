"use client";
import React, { useState, useRef, useEffect } from "react";
import { PersonProvider } from "@/context/PersonContext";
import StepProgress from "@/components/common/StepProgress";
import FloatingSelect from "@/components/common/FloatingSelect";
import FloatingInput from "@/components/common/FloatingInput";
import { useProvinces, useCities } from "@/api/authApi";
import Button from "@mui/material/Button";
import { useFormStore } from "@/store/formStore";
import FormAdvertiser1 from "./FormAdvertiser1";
import FormAdvertiser3 from "../../CommonForms/Form3";
import ModalTriggerInput from "@/components/common/ModalTriggerInput";
import AdAttributesModal from "./AdAttributesModal";
import { useUser } from "@/context/UserContext";

// -----------------------------------------------------------------
// کامپوننت Toast
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
const FormAdvertiser2: React.FC = () => {
  const { setField, getFormData } = useFormStore();
  const setUserType = useFormStore((state) => state.setUserType);
  const setCurrentStep = useFormStore((state) => state.setCurrentStep);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [attributes, setAttributes] = useState<Record<string, any>>({});
  const parentRef = useRef<HTMLDivElement>(null);
  const { user, loading: userLoading } = useUser();

  // ========== خواندن داده‌های ذخیره‌شده از store ==========
  const advertiserData = getFormData("advertiser") as Record<string, any>;

  // ========== State‌های محلی ==========
  const [selectedProvince, setSelectedProvince] = useState<string>(
    advertiserData?.province || user?.province || "",
  );
  const [selectedCity, setSelectedCity] = useState<string>(
    advertiserData?.city || user?.city || "",
  );

  // categoryName برای AttributesModal
  const categoryFromStore = advertiserData?.category || "";
  const categoryName = categoryFromStore.split("/").pop()?.trim() || "";

  // ===== شرط غیرفعال‌سازی وضعیت و کاربرد =====
  const isAnimalCategory = categoryFromStore === "سرگرمی و فراغت / حیوانات";

  // status: با مقدار پیش‌فرض در صورت حیوانات
  const [status, setStatus] = useState<string[]>(() => {
    const raw = advertiserData?.status;
    let initial: string[] = [];
    if (Array.isArray(raw)) initial = raw;
    else if (typeof raw === "string") initial = raw.split(",").filter(Boolean);

    // اگر شرط حیوانات برقرار است و مقدار خالی است، مقدار پیش‌فرض بده
    if (isAnimalCategory && initial.length === 0) {
      return ["new"];
    }
    return initial;
  });

  // usage: با مقدار پیش‌فرض در صورت حیوانات
  const [usage, setUsage] = useState<string[]>(() => {
    const raw = advertiserData?.usage;
    let initial: string[] = [];
    if (Array.isArray(raw)) initial = raw;
    else if (typeof raw === "string") initial = raw.split(",").filter(Boolean);

    if (isAnimalCategory && initial.length === 0) {
      return ["personal"];
    }
    return initial;
  });

  const [price, setPrice] = useState<string>(advertiserData?.price || "");
  const [features, setFeatures] = useState<string>(
    advertiserData?.features || "",
  );

  const [additionalOptions, setAdditionalOptions] = useState(() => {
    try {
      return advertiserData?.additionalOptions
        ? JSON.parse(advertiserData.additionalOptions)
        : { warranty: false, shipping: false };
    } catch {
      return { warranty: false, shipping: false };
    }
  });

  // ===== تغییر: priceOptions شامل سه کلید fixedPrice, swap, transfer =====
  const [priceOptions, setPriceOptions] = useState(() => {
    try {
      const stored = advertiserData?.priceOptions
        ? JSON.parse(advertiserData.priceOptions)
        : null;
      if (stored) {
        // برای سازگاری با داده‌های قدیمی که کلید price داشتند
        return {
          fixedPrice: stored.fixedPrice ?? stored.price ?? false,
          swap: stored.swap ?? false,
          transfer: stored.transfer ?? false,
        };
      }
      return { fixedPrice: false, swap: false, transfer: false };
    } catch {
      return { fixedPrice: false, swap: false, transfer: false };
    }
  });

  const [showNextForm, setShowNextForm] = useState(false);
  const [showPreviousForm, setShowPreviousForm] = useState(false);

  const userType = useFormStore.getState().userType;
  const currentStep = useFormStore.getState().currentStep;

  // ========== همگام‌سازی state با store ==========
  useEffect(() => {
    const data = getFormData("advertiser") as Record<string, any>;
    if (!data) return;

    setSelectedProvince(data.province || user?.province || "");
    setSelectedCity(data.city || user?.city || "");

    const rawStatus = data.status;
    let newStatus: string[] = [];
    if (Array.isArray(rawStatus)) newStatus = rawStatus;
    else if (typeof rawStatus === "string")
      newStatus = rawStatus.split(",").filter(Boolean);

    // اگر شرط حیوانات برقرار است و مقدار خالی است، مقدار پیش‌فرض بده
    if (isAnimalCategory && newStatus.length === 0) {
      newStatus = ["new"];
    }
    setStatus(newStatus);

    const rawUsage = data.usage;
    let newUsage: string[] = [];
    if (Array.isArray(rawUsage)) newUsage = rawUsage;
    else if (typeof rawUsage === "string")
      newUsage = rawUsage.split(",").filter(Boolean);

    if (isAnimalCategory && newUsage.length === 0) {
      newUsage = ["personal"];
    }
    setUsage(newUsage);

    setPrice(data.price || "");
    setFeatures(data.features || "");

    try {
      if (data.additionalOptions)
        setAdditionalOptions(JSON.parse(data.additionalOptions));
    } catch {}
    try {
      if (data.priceOptions) {
        const parsed = JSON.parse(data.priceOptions);
        setPriceOptions({
          fixedPrice: parsed.fixedPrice ?? parsed.price ?? false,
          swap: parsed.swap ?? false,
          transfer: parsed.transfer ?? false,
        });
      }
    } catch {}
  }, [getFormData, user, isAnimalCategory]);

  // گزینه‌های انتخاب استان و شهر
  const { data: provincesData, isLoading: provincesLoading } = useProvinces();
  const { data: citiesData } = useCities(selectedProvince);

  const provinceOptions =
    provincesData?.map((p: { id: number; name: string }) => ({
      label: p.name,
      value: p.name,
    })) || [];

  const cityOptions =
    citiesData?.map((c: string) => ({ label: c, value: c })) || [];

  const statusOptions = [
    { label: "نو", value: "new" },
    { label: "کارکرده / دست دوم", value: "used" },
    { label: "آکبند", value: "sealed" },
    { label: "بازسازی شده", value: "refurbished" },
    { label: "معیوب / نیاز به تعمیر", value: "damaged" },
    { label: "قدیمی / کلکسیونی", value: "vintage" },
  ];

  const usageOptions = [
    { label: "شخصی", value: "personal" },
    { label: "تجاری / کسب‌وکار", value: "commercial" },
    { label: "آموزشی / یادگیری", value: "educational" },
    { label: "هدیه", value: "gift" },
    { label: "صنعتی", value: "industrial" },
  ];

  // ========== Toast ==========
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

  // ========== مرحله بعد ==========
  const handleNextStep = () => {
    // اعتبارسنجی
    // اگر دسته حیوانات باشد، وضعیت و کاربرد الزامی نیست (چون مقدار دارند)
    if (!selectedProvince || !selectedCity || !price) {
      showToast("لطفا تمام فیلدهای ضروری را پر کنید", "error");
      return;
    }
    // اگر حیوانات نیست، وضعیت و کاربرد باید پر باشند
    if (!isAnimalCategory && (status.length === 0 || usage.length === 0)) {
      showToast("لطفا تمام فیلدهای ضروری را پر کنید", "error");
      return;
    }

    // ذخیره در store
    setField("advertiser", "province", selectedProvince);
    setField("advertiser", "city", selectedCity);
    setField("advertiser", "status", status);
    setField("advertiser", "usage", usage);
    setField("advertiser", "price", price);
    setField("advertiser", "features", features);
    setField(
      "advertiser",
      "additionalOptions",
      JSON.stringify(additionalOptions),
    );
    setField("advertiser", "priceOptions", JSON.stringify(priceOptions));

    setUserType("advertiser");
    setCurrentStep(2);

    console.log("داده‌های ذخیره‌شده:", getFormData("advertiser"));
    setShowNextForm(true);
  };

  const handlePrevStep = () => {
    setShowPreviousForm(true);
  };

  if (showPreviousForm) return <FormAdvertiser1 />;
  if (showNextForm) return <FormAdvertiser3 />;

  return (
    <>
      <Toast
        message={toast.message}
        progress={toast.progress}
        visible={toast.visible}
        type={toast.type}
      />

      <PersonProvider>
        <div
          className="relative z-10 flex flex-col sm:flex-row justify-center items-stretch sm:items-start h-auto sm:h-[90%]  sm:mt-4 sm:px-3"
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
          <div className="flex flex-col justify-start items-center h-[90%] sm:p-4 relative z-20 w-[98%] sm:w-[85%] sm:mx-auto">
            <StepProgress currentStep={2} />

            <div className="relative z-20 flex flex-row justify-center gap-1 sm:gap-2  w-full mt-[1vh] sm:mt-[4vh]">
              {/* ستون اول */}
              <div className="flex flex-col gap-1 w-[70%] sm:w-full sm:gap-3 flex-1 mr-[4%] sm:mr-[10%]">
                <FloatingSelect
                  placeholder={
                    provincesLoading ? "در حال بارگذاری..." : "استان"
                  }
                  options={provinceOptions}
                  value={selectedProvince}
                  onChange={(val) => {
                    setSelectedProvince(val as string);
                    setSelectedCity("");
                  }}
                />
                <FloatingSelect
                  placeholder="وضعیت"
                  options={statusOptions}
                  value={status}
                  onChange={(val) => setStatus(val as string[])}
                  showCloseIcon={true}
                  disabled={isAnimalCategory} // <-- غیرفعال در صورت حیوانات
                />

                <FloatingInput
                  placeholder="قیمت (به تومان)"
                  value={price}
                  onChange={setPrice}
                  inputType="price"
                />

                {/* ===== گزینه‌های جدید قیمت: در سطر بعدی زیر قیمت ===== */}
                <div className="flex flex-wrap gap-[1vh] mb-1 justify-start items-center">
                  <label className="inline-flex items-center bg-white rounded-[10px] px-[1.5vh] py-[1.5vh] gap-1 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="w-[2.4vh] h-[2.4vh] rounded-[5px] bg-[#DEDEDE] checked:bg-blue-900 appearance-none cursor-pointer"
                      checked={priceOptions.fixedPrice}
                      onChange={(e) =>
                        setPriceOptions({
                          ...priceOptions,
                          fixedPrice: e.target.checked,
                        })
                      }
                    />
                    <span className="text-[#143A62E5] font-semibold text-[1.4vh] md:text-[1.8vh] lg:text-[2.2vh]">
                      قیمت مقطوع
                    </span>
                  </label>

                  <label className="inline-flex items-center bg-white rounded-[10px] px-[1.5vh] py-[1.5vh] gap-1 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="w-[2.4vh] h-[2.4vh] rounded-[5px] bg-[#DEDEDE] checked:bg-blue-900 appearance-none cursor-pointer"
                      checked={priceOptions.swap}
                      onChange={(e) =>
                        setPriceOptions({
                          ...priceOptions,
                          swap: e.target.checked,
                        })
                      }
                    />
                    <span className="text-[#143A62E5] font-semibold text-[1.4vh] md:text-[1.8vh] lg:text-[2.2vh]">
                      معاوضه می‌کنم
                    </span>
                  </label>

                  <label className="inline-flex items-center bg-white rounded-[10px] px-[1.5vh] py-[1.5vh] gap-1 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="w-[2.4vh] h-[2.4vh] rounded-[5px] bg-[#DEDEDE] checked:bg-blue-900 appearance-none cursor-pointer"
                      checked={priceOptions.transfer}
                      onChange={(e) =>
                        setPriceOptions({
                          ...priceOptions,
                          transfer: e.target.checked,
                        })
                      }
                    />
                    <span className="text-[#143A62E5] font-semibold text-[1.4vh] md:text-[1.8vh] lg:text-[2.2vh]">
                      واگذار می‌شود
                    </span>
                  </label>
                </div>
              </div>

              {/* ستون دوم */}
              <div className="flex flex-col gap-1 w-[70%] sm:w-full sm:gap-3 flex-1 sm:ml-[1%] ">
                <FloatingSelect
                  placeholder="شهر / منطقه"
                  options={cityOptions}
                  value={selectedCity}
                  onChange={(val) => setSelectedCity(val as string)}
                />

                <FloatingSelect
                  placeholder="کاربرد"
                  options={usageOptions}
                  value={usage}
                  onChange={(val) => setUsage(val as string[])}
                  showCloseIcon={true}
                  disabled={isAnimalCategory} // <-- غیرفعال در صورت حیوانات
                />

                {/* priceOptions حذف شد و به ستون اول منتقل شد */}

                <ModalTriggerInput
                  placeholder="ویژگی‌ها و امکانات"
                  value={
                    Object.keys(
                      JSON.parse(
                        (getFormData("advertiser") as Record<string, any>)
                          ?.attributes || "{}",
                      ),
                    ).length
                      ? "مشخصات ثبت شد"
                      : ""
                  }
                  onClick={() => setIsModalOpen(true)}
                />
                {/* گارانتی و ارسال */}
                <div className="flex flex-wrap gap-[1vh] mb-2 justify-start items-center">
                  <label className="inline-flex items-center bg-white rounded-[10px] px-[1.5vh] py-[1.5vh] gap-1 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="w-[2.4vh] h-[2.4vh] rounded-[5px] bg-[#DEDEDE] checked:bg-blue-900 appearance-none cursor-pointer"
                      checked={additionalOptions.warranty}
                      onChange={(e) =>
                        setAdditionalOptions({
                          ...additionalOptions,
                          warranty: e.target.checked,
                        })
                      }
                    />
                    <span className="text-[#143A62E5] font-semibold text-[1.4vh] md:text-[1.8vh] lg:text-[2.2vh]">
                      گارانتی دارد
                    </span>
                  </label>

                  <label className="inline-flex items-center bg-white rounded-[10px] px-[1.5vh] py-[1.5vh] gap-1 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="w-[2.4vh] h-[2.4vh] rounded-[5px] bg-[#DEDEDE] checked:bg-blue-900 appearance-none cursor-pointer"
                      checked={additionalOptions.shipping}
                      onChange={(e) =>
                        setAdditionalOptions({
                          ...additionalOptions,
                          shipping: e.target.checked,
                        })
                      }
                    />
                    <span className="text-[#143A62E5] font-semibold text-[1.4vh] md:text-[1.8vh] lg:text-[2.2vh]">
                      امکان ارسال دارد
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* دکمه‌ها */}
            <div className="flex gap-4  w-[80%] justify-end ml-[8%] sm:ml-[3%] text:[1.6vh] md:text-[2vh] mt-[-0.2%] sm:mt-[-4%] md:mt-[5%]">
              <Button
                onClick={handlePrevStep}
                className="w-[80%] sm:w-[20%] h-[5vh] md:h-[7vh] rounded-[10px]"
                style={{
                  backgroundColor: "#00B6FF",
                  color: "#FFFFFF",
                  fontWeight: 600,
                  textTransform: "none",
                }}
              >
                مرحله قبل
              </Button>

              <Button
                onClick={handleNextStep}
                className="w-[80%] sm:w-[20%] h-[5vh] md:h-[7vh] rounded-[10px]"
                style={{
                  backgroundColor: "rgba(20,58,98,0.85)",
                  color: "#FFFFFF",
                  fontWeight: 600,
                  textTransform: "none",
                }}
              >
                مرحله بعد
              </Button>
              {isModalOpen && (
                <AdAttributesModal
                  categoryName={categoryName}
                  onClose={() => setIsModalOpen(false)}
                  parentRef={parentRef}
                />
              )}
            </div>
          </div>
        </div>
      </PersonProvider>
    </>
  );
};

export default FormAdvertiser2;
