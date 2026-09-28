"use client";

import React, { useState, useEffect } from "react";
import { PersonProvider } from "@/context/PersonContext";
import StepProgress from "@/components/common/StepProgress";
import Button from "@mui/material/Button";
import { useFormStore, UserType } from "@/store/formStore";
import { usePathname, useRouter } from "next/navigation";

const Form5: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { getFormData, setUserType, setField } = useFormStore();
  const [loading, setLoading] = useState(false);

  const getFormType = (): UserType => {
    if (pathname.endsWith("adsform")) return "advertiser";
    if (pathname.endsWith("karfarmaform")) return "employer";
    if (pathname.endsWith("karjooform")) return "jobSeeker";
    if (pathname.endsWith("digitalprojectform")) return "digital";
    return "advertiser";
  };

  // پاک کردن داده‌های نوع جاری از zustand
  const clearCurrentFormData = () => {
    const t = getFormType();
    const formData = getFormData(t) as Record<string, any>;
    if (formData) {
      Object.keys(formData).forEach((key) => {
        setField(t, key, "");
      });
    }
    console.log(`[Form5][${t}] داده‌های فرم پاک شد`);
  };

  useEffect(() => {
    const t = getFormType();
    setUserType(t);
    // پاک کردن داده‌های فرم بعد از نمایش موفقیت
    clearCurrentFormData();
  }, []);

  const handleGoToDashboard = () => {
    setLoading(true);
    router.push("/dashboard");
  };

  return (
    <PersonProvider>
      <div className="relative z-10 flex flex-col sm:flex-row justify-center items-stretch sm:items-start h-[90%] mt-4 px-3">
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

        <div className="flex flex-col justify-between h-[95%] p-4 relative z-20 w-[95%] sm:w-[80%] mx-auto">
          <StepProgress currentStep={5} />

          <div className="flex-1 flex justify-center items-center relative">
            <div className="absolute top-1/2 left-1/2 w-[85%] sm:w-[50%] h-[95%] bg-white rounded-xl flex flex-col justify-center items-center z-10 p-6 my-[1vh] transform -translate-x-1/2 -translate-y-1/2">
              <div className="text-green-600 text-[2.5vh] sm:text-[3vh] font-semibold mb-4 text-center">
                ✅ آگهی با موفقیت ثبت شد
              </div>
              <div className="text-[#143A62] text-center text-[1.8vh] sm:text-[2.2vh] px-4 leading-relaxed">
                آگهی شما با موفقیت ثبت شد و پس از بررسی توسط پشتیبانی،
                <br />
                در سایت منتشر خواهد شد.
              </div>
              <div className="mt-8 text-gray-500 text-[1.4vh]">
                از اعتماد شما سپاسگزاریم
              </div>
            </div>
          </div>

          <div className="flex gap-4 items-center w-full justify-center mt-4 text-[2vh] sm:text-[2.4vh] md:text-[2.6vh]">
            <Button
              onClick={handleGoToDashboard}
              className="w-[35%] sm:w-[25%] h-[6vh] sm:h-[7.5vh] rounded-[10px]"
              style={{
                backgroundColor: "rgba(20,58,98,0.85)",
                color: "#FFFFFF",
                fontWeight: 600,
                textTransform: "none",
              }}
            >
              برو به میز کار
            </Button>
          </div>
        </div>
      </div>
    </PersonProvider>
  );
};

export default Form5;
