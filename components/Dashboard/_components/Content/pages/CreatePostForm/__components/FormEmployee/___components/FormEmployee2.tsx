// ===================== FormEmployee2.tsx (اصلاح شده با ذخیره cooperationType به صورت آرایه) =====================
"use client";
import React, { useState, useRef, useEffect } from "react";
import { PersonProvider } from "@/context/PersonContext";
import StepProgress from "@/components/common/StepProgress";
import FloatingSelect from "@/components/common/FloatingSelect";
import Button from "@mui/material/Button";
import { useFormStore } from "@/store/formStore";
import FormEmployee1 from "./FormEmployee1";
import Form3 from "../../CommonForms/Form3";
import ModalTriggerInput from "@/components/common/ModalTriggerInput";
import AdAttributesModal from "./OtherFeaturesModal";
import { useUser } from "@/context/UserContext";
import { useProvinces, useCities } from "@/api/authApi";

// تابع کمکی برای تبدیل مقدار به آرایه (فقط برای سازگاری با داده‌های قدیمی)
const toArray = (value: string | number | (string | number)[]): any[] =>
  Array.isArray(value) ? value : value ? [value] : [];

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
const FormEmployee2: React.FC = () => {
  const { user, loading } = useUser();
  const { setField, getFormData } = useFormStore();
  const parentRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const employerData = getFormData("employer") as Record<string, any>;
  const workOptionsInitial = employerData?.workOptions
    ? JSON.parse(employerData.workOptions)
    : { remote: false, thursdayHalf: false };
  const [workOptions, setWorkOptions] = useState<{
    remote: boolean;
    thursdayHalf: boolean;
  }>(workOptionsInitial);

  const person = employerData?.person;

  // حالت state – همه فیلدها به صورت تک‌مقدار (رشته) ذخیره می‌شوند
  const [state, setState] = useState(() => {
    const hasStoredData =
      employerData &&
      Object.keys(employerData).some(
        (key) =>
          employerData[key] !== undefined &&
          employerData[key] !== null &&
          employerData[key] !== "",
      );

    if (hasStoredData) {
      // داده‌های ذخیره شده ممکن است به صورت آرایه باشند (نسخه‌های قدیمی)
      // برای سازگاری، اگر آرایه بود اولین عنصر را برمی‌داریم
      const getSingle = (val: any) =>
        Array.isArray(val) ? (val.length > 0 ? val[0] : "") : val || "";

      return {
        cooperationType: getSingle(employerData?.cooperationType),
        militaryStatus: employerData?.militaryStatus || "",
        paymentMethod: getSingle(employerData?.paymentMethod),
        minSalary: getSingle(employerData?.minSalary),
        startTime: getSingle(employerData?.startTime),
        otherFeatures: employerData?.otherFeatures || "",
        gender: employerData?.gender || "",
        experience: employerData?.experience || "",
        maxSalary: getSingle(employerData?.maxSalary),
        endTime: getSingle(employerData?.endTime),
        stateProvince: employerData?.state || "",
        city: employerData?.city || "",
      };
    }

    return {
      cooperationType: "",
      militaryStatus: "",
      paymentMethod: "",
      minSalary: "",
      startTime: "",
      otherFeatures: "",
      gender: "",
      experience: "",
      maxSalary: "",
      endTime: "",
      stateProvince: "",
      city: "",
    };
  });

  React.useEffect(() => {
    if (user && person === "khodam") {
      setSelectedProvince((prev: string) => prev || user.province || "");
      setSelectedCity((prev: string) => prev || user.city || "");
      setState((prev) => ({
        ...prev,
        gender: prev.gender || user.gender || "",
        stateProvince: prev.stateProvince || user.province || "",
        city: prev.city || user.city || "",
      }));
    }
  }, [user, person]);

  const [selectedProvince, setSelectedProvince] = useState(state.stateProvince);
  const [selectedCity, setSelectedCity] = useState(state.city);
  const { data: provincesData, isLoading: provincesLoading } = useProvinces();
  const { data: citiesData } = useCities(selectedProvince);

  const provinceOptions =
    provincesData?.map((p: { id: number; name: string }) => ({
      label: p.name,
      value: p.name,
    })) || [];

  const cityOptions =
    citiesData?.map((c: string) => ({ label: c, value: c })) || [];

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

  const [showPrev, setShowPrev] = useState(false);
  const [showNext, setShowNext] = useState(false);

  const attributesSaved = Boolean(
    employerData?.companyName ||
    employerData?.companyType ||
    employerData?.benefits ||
    employerData?.insurance ||
    employerData?.education,
  );

  // ===== گزینه‌های ثابت =====
  const genderOptions = [
    { label: "زن", value: "female" },
    { label: "مرد", value: "male" },
  ];
  const cooperationTypeOptions = [
    { label: "تمام‌وقت", value: "full_time" },
    { label: "پاره‌وقت", value: "part_time" },
    { label: "پروژه‌ای", value: "contract" },
    { label: "کارآموزی", value: "internship" },
  ];
  const militaryStatusOptions = [
    { label: "پایان خدمت", value: "completed" },
    { label: "معافیت دائم", value: "exempt" },
    { label: "در حال خدمت", value: "serving" },
    { label: "مشمول", value: "subject" },
  ];
  const paymentMethodOptions = [
    { label: "توافقی", value: "negotiable" },
    { label: "ماهانه", value: "monthly" },
    { label: "ساعتی", value: "hourly" },
    { label: "پورسانتی", value: "commission" },
  ];
  const experienceOptions = [
    { label: "بدون سابقه", value: "none" },
    { label: "۱ تا ۳ سال", value: "1-3" },
    { label: "۳ تا ۵ سال", value: "3-5" },
    { label: "بیش از ۵ سال", value: "5+" },
  ];

  // ===== تولید گزینه‌های حداقل حقوق (توافقی + ۱۰ تا ۱۰۰ ده‌تا ده‌تا + بیشتر) =====
  const minSalaryOptions = React.useMemo(() => {
    const opts: { label: string; value: string }[] = [
      { label: "توافقی", value: "negotiable" },
    ];
    for (let i = 10; i <= 100; i += 10) {
      opts.push({ label: `${i} میلیون`, value: i.toString() });
    }
    opts.push({ label: "بیشتر از ۱۰۰ میلیون", value: "more" });
    return opts;
  }, []);

  // ===== تولید گزینه‌های حداکثر حقوق (همان ساختار) =====
  const maxSalaryOptions = React.useMemo(() => {
    const opts: { label: string; value: string }[] = [
      { label: "توافقی", value: "negotiable" },
    ];
    for (let i = 10; i <= 100; i += 10) {
      opts.push({ label: `${i} میلیون`, value: i.toString() });
    }
    opts.push({ label: "بیشتر از ۱۰۰ میلیون", value: "more" });
    return opts;
  }, []);

  // ===== تولید گزینه‌های ساعت شروع (توافقی + ۱ تا ۲۴) =====
  const startTimeOptions = React.useMemo(() => {
    const opts: { label: string; value: string }[] = [
      { label: "توافقی", value: "negotiable" },
    ];
    for (let i = 1; i <= 24; i++) {
      const label = i < 10 ? `۰${i}:۰۰` : `${i}:۰۰`;
      opts.push({ label, value: i.toString() });
    }
    return opts;
  }, []);

  // ===== تولید گزینه‌های ساعت پایان (توافقی + ۱ تا ۲۴) =====
  const endTimeOptions = React.useMemo(() => {
    const opts: { label: string; value: string }[] = [
      { label: "توافقی", value: "negotiable" },
    ];
    for (let i = 1; i <= 24; i++) {
      const label = i < 10 ? `۰${i}:۰۰` : `${i}:۰۰`;
      opts.push({ label, value: i.toString() });
    }
    return opts;
  }, []);

  // ===== اعتبارسنجی =====
  const handleNext = () => {
    const errors: string[] = [];

    if (!state.cooperationType) errors.push("نوع همکاری");
    if (!state.gender) errors.push("جنسیت");
    if (state.gender !== "female" && !state.militaryStatus)
      errors.push("وضعیت سربازی");
    if (!state.paymentMethod) errors.push("شیوه پرداخت");
    if (!state.minSalary) errors.push("حداقل حقوق");
    if (!state.startTime) errors.push("ساعت شروع کار");
    if (!state.experience) errors.push("سابقه");
    if (!state.maxSalary) errors.push("حداکثر حقوق");
    if (!state.endTime) errors.push("ساعت پایان کار");
    if (!state.stateProvince) errors.push("استان");
    if (!state.city) errors.push("شهر");

    // اعتبارسنجی maxSalary > minSalary (در صورتی که هر دو عددی باشند و نه "negotiable" و نه "more")
    const minVal = parseInt(state.minSalary);
    const maxVal = parseInt(state.maxSalary);
    if (
      state.minSalary &&
      state.maxSalary &&
      state.minSalary !== "negotiable" &&
      state.maxSalary !== "negotiable" &&
      state.minSalary !== "more" &&
      state.maxSalary !== "more" &&
      !isNaN(minVal) &&
      !isNaN(maxVal) &&
      maxVal <= minVal
    ) {
      errors.push("حداکثر حقوق باید از حداقل حقوق بیشتر باشد");
    }

    if (errors.length > 0) {
      showToast("لطفاً فیلدهای زیر را پر کنید: " + errors.join("، "), "error");
      return;
    }

    setField("employer", "state", state.stateProvince);
    setField("employer", "city", state.city);

    // ذخیره سایر فیلدها به صورت تک‌مقدار (یا همان‌طور که هستند)
    Object.entries(state).forEach(([key, value]) => {
      setField("employer", key, value);
    });

    // ===== اصلاح برای cooperationType: ذخیره به صورت آرایه =====
    const cooperationTypeArray = state.cooperationType
      ? [state.cooperationType]
      : [];
    setField("employer", "cooperationType", cooperationTypeArray);

    setField("employer", "workOptions", JSON.stringify(workOptions));

    setShowNext(true);
  };

  if (showPrev) return <FormEmployee1 />;
  if (showNext) return <Form3 />;

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
          className="relative z-10 flex flex-col sm:flex-row justify-center items-start h-[98%] sm:h-[90%] mt-2 sm:mt-4 sm:px-3"
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
          <div className="flex flex-col justify-start h-[95%] sm:p-4 relative z-20 w-[99%] sm:w-[77%] mx-auto">
            <StepProgress currentStep={2} />

            <div className="relative z-20 flex flex-row gap-0 sm:gap-4 w-full sm:w-[95%] mt-[1.5vh] sm:mt-[2vh] mr-[4%] sm:mr-[8%]">
              <div className="flex flex-col gap-[0.8vh] sm:gap-[0.000001vh] flex-1">
                <FloatingSelect
                  placeholder={
                    provincesLoading ? "در حال بارگذاری..." : "استان"
                  }
                  options={provinceOptions}
                  value={state.stateProvince}
                  onChange={(val) => {
                    const province = val as string;
                    setSelectedProvince(province);
                    setState({ ...state, stateProvince: province, city: "" });
                    setSelectedCity("");
                  }}
                  showCloseIcon={true}
                />
                <FloatingSelect
                  placeholder="نوع همکاری"
                  options={cooperationTypeOptions}
                  value={state.cooperationType}
                  onChange={(v) =>
                    setState({ ...state, cooperationType: v as string })
                  }
                  showCloseIcon={true}
                />
                <div
                  style={{
                    pointerEvents: state.gender === "female" ? "none" : "auto",
                    opacity: state.gender === "female" ? 0.6 : 1,
                  }}
                >
                  <FloatingSelect
                    placeholder="وضعیت سربازی"
                    options={militaryStatusOptions}
                    value={state.militaryStatus}
                    onChange={(v) =>
                      setState({ ...state, militaryStatus: v as string })
                    }
                    disabled={state.gender === "female"}
                    showCloseIcon={true}
                  />
                </div>
                <FloatingSelect
                  placeholder="شیوه پرداخت"
                  options={paymentMethodOptions}
                  value={state.paymentMethod}
                  onChange={(v) =>
                    setState({ ...state, paymentMethod: v as string })
                  }
                  showCloseIcon={true}
                />
                <FloatingSelect
                  placeholder="حداقل حقوق"
                  options={minSalaryOptions}
                  value={state.minSalary}
                  onChange={(v) =>
                    setState({ ...state, minSalary: v as string })
                  }
                  showCloseIcon={true}
                />
                <FloatingSelect
                  placeholder="ساعت شروع کار"
                  options={startTimeOptions}
                  value={state.startTime}
                  onChange={(v) =>
                    setState({ ...state, startTime: v as string })
                  }
                  showCloseIcon={true}
                />
                <ModalTriggerInput
                  placeholder="ویژگی‌ها و امکانات"
                  value={attributesSaved ? "مشخصات ثبت شد" : ""}
                  onClick={() => setIsModalOpen(true)}
                />
              </div>

              <div className="flex flex-col gap-[0.8vh] sm:gap-[0.000001vh] flex-1 w-[50%] sm:w-full">
                <FloatingSelect
                  placeholder="شهر / منطقه"
                  options={cityOptions}
                  value={state.city}
                  onChange={(val) =>
                    setState({ ...state, city: val as string })
                  }
                  showCloseIcon={true}
                />
                <FloatingSelect
                  placeholder="جنسیت"
                  options={genderOptions}
                  value={state.gender}
                  onChange={(v) => {
                    const newState = { ...state, gender: v as string };
                    if (v === "female") {
                      newState.militaryStatus = "";
                    }
                    setState(newState);
                  }}
                  showCloseIcon={true}
                />
                <FloatingSelect
                  placeholder="سابقه"
                  options={experienceOptions}
                  value={state.experience}
                  onChange={(v) =>
                    setState({ ...state, experience: v as string })
                  }
                  showCloseIcon={true}
                />

                <div className="flex gap-[1vh] mb-[2vh]">
                  <label className="inline-flex items-center bg-white rounded-[10px] px-[0.5vh] py-[0.5vh] gap-0 sm:px-[1.5vh] sm:py-[1.5vh] sm:gap-1 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="w-[2.4vh] h-[2.4vh] rounded-[5px] bg-[#DEDEDE] checked:bg-blue-900 appearance-none cursor-pointer"
                      checked={workOptions.remote}
                      onChange={(e) =>
                        setWorkOptions({
                          ...workOptions,
                          remote: e.target.checked,
                        })
                      }
                    />
                    <span className="text-[#143A62E5] font-semibold text-[1.1vh] sm:text-[1.4vh] md:text-[1.8vh] lg:text-[2.2vh]">
                      دورکاری
                    </span>
                  </label>
                  <label className="inline-flex items-center bg-white rounded-[10px] px-[0.5vh] py-[0.5vh] gap-0 sm:px-[1.5vh] sm:py-[1.5vh] sm:gap-1 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="w-[2.4vh] h-[2.4vh] rounded-[5px] bg-[#DEDEDE] checked:bg-blue-900 appearance-none cursor-pointer"
                      checked={workOptions.thursdayHalf}
                      onChange={(e) =>
                        setWorkOptions({
                          ...workOptions,
                          thursdayHalf: e.target.checked,
                        })
                      }
                    />
                    <span className="text-[#143A62E5] font-semibold text-[1.1vh] sm:text-[1.4vh] md:text-[1.8vh] lg:text-[2.2vh]">
                      پنج‌شنبه‌ها تا ظهر
                    </span>
                  </label>
                </div>

                <FloatingSelect
                  placeholder="حداکثر حقوق"
                  options={maxSalaryOptions}
                  value={state.maxSalary}
                  onChange={(v) =>
                    setState({ ...state, maxSalary: v as string })
                  }
                  showCloseIcon={true}
                />
                <FloatingSelect
                  placeholder="ساعت پایان کار"
                  options={endTimeOptions}
                  value={state.endTime}
                  onChange={(v) => setState({ ...state, endTime: v as string })}
                  showCloseIcon={true}
                />

                <div className="flex gap-4 mt-[0.5vh] w-[75%] text-[1.6vh] sm:text-[2.4vh] whitespace-nowrap">
                  <Button
                    onClick={() => setShowPrev(true)}
                    className="w-[55%] h-[5vh] md:h-[5.5vh] mt-1 rounded-[10px] text-[1.5vh] md:text-[2.4vh] whitespace-nowrap"
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
                    onClick={handleNext}
                    className="w-[55%] sm:w-[50%] h-[5.5vh] rounded-[10px] text-[1.5vh] sm:text-[2.4vh] whitespace-nowrap"
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
                      parentRef={parentRef}
                      onClose={() => setIsModalOpen(false)}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </PersonProvider>
    </>
  );
};

export default FormEmployee2;
