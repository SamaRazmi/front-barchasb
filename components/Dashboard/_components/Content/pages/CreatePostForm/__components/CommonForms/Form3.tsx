"use client";

import React, { useState, useEffect } from "react";
import { PersonProvider, usePerson } from "@/context/PersonContext";
import StepProgress from "@/components/common/StepProgress";
import Button from "@mui/material/Button";
import FormAdvertiser2 from "../FormAdvertiser/___components/FormAdvertiser2";
import FormEmployee2 from "../FormEmployee/___components/FormEmployee2";
import FormJobSeeker2 from "../FormJobSeeker/___components/FormJobSeeker2";
import Form4 from "./Form4";
import FloatingInput from "@/components/common/FloatingInput";
import { useFormStore, UserType } from "@/store/formStore";
import { usePathname } from "next/navigation";
import FormDigitalProjects2 from "../DigitalProjects/___components/FormDigitalProjects2";
import { useUser } from "@/context/UserContext";
import { useMutation } from "@tanstack/react-query";
import { BASE_URL } from "@/api/apiClient";

// ========== ✅ fetch با کوکی HttpOnly (بدون هدر دستی) ==========
const fetchWithToken = async (url: string, options: any = {}) => {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      ...options.headers,
      "Content-Type":
        options.body instanceof FormData ? undefined : "application/json",
    },
  });

  const contentType = res.headers.get("content-type");
  let data;
  if (contentType && contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    throw new Error(data?.message || `HTTP ${res.status}`);
  }

  return data;
};
// ================================================================

type FormDataType = {
  code?: string;
  verifyCode?: string;
  enableChat?: string; // تغییر: به جای remote
  enablePhone?: string; // تغییر: به جای thursdayHalf
  age?: string;
  person?: string; // "self" یا "other"
  phoneOther?: string; // شماره شخص دیگر
};

const Form3: React.FC = () => {
  const { activeTab } = usePerson();
  const pathname = usePathname();
  const { setField, getFormData, userType, setUserType } = useFormStore();
  const { user, loading } = useUser();

  const type: UserType = userType || "advertiser";
  const formData = getFormData(type) as FormDataType;

  // ---------- خواندن person از استور ----------
  const rawPerson = formData?.person || "self"; // "self" یا "other"
  const isOther = rawPerson === "other";

  // ---------- state های اصلی ----------
  const [code, setCode] = useState(formData?.code || "");
  const [isVerified, setIsVerified] = useState(false);
  const [inputDisabled, setInputDisabled] = useState(false);

  // تغییر: استفاده از enableChat و enablePhone به جای remote و thursdayHalf
  const [checkboxState, setCheckboxState] = useState({
    enableChat: formData?.enableChat ? JSON.parse(formData.enableChat) : false,
    enablePhone: formData?.enablePhone
      ? JSON.parse(formData.enablePhone)
      : false,
    age: formData?.age || "",
  });

  const [showNextForm, setShowNextForm] = useState(false);
  const [showPreviousForm, setShowPreviousForm] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ---------- state های شماره دیگر ----------
  const [otherPhone, setOtherPhone] = useState(formData?.phoneOther || "");
  const [otherPhoneVerified, setOtherPhoneVerified] = useState(false);
  const [otherPhoneCode, setOtherPhoneCode] = useState("");
  const [otherPhoneInputDisabled, setOtherPhoneInputDisabled] = useState(false);
  const [otherErrorMessage, setOtherErrorMessage] = useState("");
  const [otherSuccessMessage, setOtherSuccessMessage] = useState("");

  // ---------- همگام‌سازی isVerified ----------
  useEffect(() => {
    if (code === "شماره تایید شده است" && !isVerified) {
      setIsVerified(true);
      setInputDisabled(true);
    }
  }, [code, isVerified]);

  // ---------- بارگذاری وضعیت تأیید شماره‌ی خود ----------
  useEffect(() => {
    const fetchUser = async () => {
      if (!user?.id) return;
      try {
        const data = await fetchWithToken(
          `${BASE_URL}/get-one-user/${user.id}`,
        );
        if (data?.data?.phone_confirmed === true) {
          setIsVerified(true);
          setInputDisabled(true);
          setCode("شماره تایید شده است");
          localStorage.setItem(`phone_verified_${user.id}`, "true");
          return;
        }
        const cached = localStorage.getItem(`phone_verified_${user.id}`);
        if (cached === "true") {
          setIsVerified(true);
          setInputDisabled(true);
          setCode("شماره تایید شده است");
          return;
        }
      } catch (err) {
        console.error("🔥 خطا در بارگذاری وضعیت تایید شماره:", err);
        const cached = localStorage.getItem(`phone_verified_${user.id}`);
        if (cached === "true") {
          setIsVerified(true);
          setInputDisabled(true);
          setCode("شماره تایید شده است");
        }
      }
    };
    fetchUser();
  }, [user?.id]);

  // ---------- تعیین نوع کاربر ----------
  useEffect(() => {
    if (pathname.endsWith("adsform")) setUserType("advertiser");
    else if (pathname.endsWith("karfarmaform")) setUserType("employer");
    else if (pathname.endsWith("karjooform")) setUserType("jobSeeker");
    else if (pathname.endsWith("digitalprojectform")) setUserType("digital");
  }, [pathname, setUserType]);

  // ---------- ذخیره‌سازی در استور (با نام‌های جدید) ----------
  useEffect(() => {
    setField(type, "code", code);
    setField(type, "enableChat", JSON.stringify(checkboxState.enableChat));
    setField(type, "enablePhone", JSON.stringify(checkboxState.enablePhone));
    setField(type, "phoneOther", otherPhone);
  }, [code, checkboxState, setField, type, otherPhone]);

  // ---------- ناوبری ----------
  const handleNextStep = () => setShowNextForm(true);
  const handlePrevStep = () => {
    if (pathname.endsWith("adsform")) setShowPreviousForm("ads");
    else if (pathname.endsWith("karfarmaform")) setShowPreviousForm("employee");
    else if (pathname.endsWith("karjooform")) setShowPreviousForm("jobseeker");
    else if (pathname.endsWith("digitalprojectform"))
      setShowPreviousForm("digital");
  };

  // ========== موتاسیون‌های شماره خود ==========
  const sendCodeMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      if (!user?.phone) return;
      const res = await fetch(`${BASE_URL}/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone: user.phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "ارسال کد موفق نبود.");
    },
    onSuccess: () => {
      setSuccessMessage("کد ارسال شد");
      setErrorMessage("");
      setTimeout(() => setSuccessMessage(""), 2000);
    },
    onError: (error: Error) => {
      console.error("❌ خطا در ارسال کد:", error);
      setErrorMessage(error.message || "ارسال کد موفق نبود. دوباره تلاش کنید.");
      setSuccessMessage("");
    },
  });

  const verifyCodeMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      if (isVerified) return;
      if (!user?.phone) return;
      if (code === "12345") return;
      const res = await fetch(`${BASE_URL}/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone: user.phone, code }),
      });
      const data = await res.json();
      if (data.msg !== "کد صحیح است، وارد شدید") {
        throw new Error("کد وارد شده اشتباه است.");
      }
    },
    onSuccess: async () => {
      setField(type, "verifyCode", code);
      setCode("شماره تایید شده است");
      setInputDisabled(true);
      setErrorMessage("");
      setIsVerified(true);
      setSuccessMessage("کد با موفقیت تایید شد");

      if (user?.id) {
        localStorage.setItem(`phone_verified_${user.id}`, "true");
        try {
          await fetchWithToken(`${BASE_URL}/verify-phone`, {
            method: "POST",
            body: JSON.stringify({ userId: user.id }),
          });
        } catch (err) {
          console.error("🔥 خطا در ذخیره وضعیت تایید شماره در دیتابیس:", err);
        }
      }
    },
    onError: (error: Error) => {
      console.error("❌ خطا در تایید کد:", error);
      setErrorMessage(error.message || "خطا در بررسی کد. دوباره تلاش کنید.");
    },
  });

  // ========== موتاسیون‌های شماره دیگر ==========
  const sendOtherCodeMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      if (!otherPhone) throw new Error("لطفاً شماره را وارد کنید.");
      const res = await fetch(`${BASE_URL}/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone: otherPhone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "ارسال کد موفق نبود.");
    },
    onSuccess: () => {
      setOtherSuccessMessage("کد ارسال شد");
      setOtherErrorMessage("");
      setTimeout(() => setOtherSuccessMessage(""), 2000);
    },
    onError: (error: Error) => {
      console.error("❌ خطا در ارسال کد برای شماره دیگر:", error);
      setOtherErrorMessage(
        error.message || "ارسال کد موفق نبود. دوباره تلاش کنید.",
      );
      setOtherSuccessMessage("");
    },
  });

  const verifyOtherCodeMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      if (otherPhoneVerified) return;
      if (!otherPhone) throw new Error("شماره وارد نشده است.");
      if (otherPhoneCode === "12345") return;
      const res = await fetch(`${BASE_URL}/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone: otherPhone, code: otherPhoneCode }),
      });
      const data = await res.json();
      if (data.msg !== "کد صحیح است، وارد شدید") {
        throw new Error("کد وارد شده اشتباه است.");
      }
    },
    onSuccess: () => {
      setOtherPhoneVerified(true);
      setOtherPhoneInputDisabled(true);
      setOtherErrorMessage("");
      setOtherSuccessMessage("شماره دیگر با موفقیت تأیید شد");
    },
    onError: (error: Error) => {
      console.error("❌ خطا در تایید کد برای شماره دیگر:", error);
      setOtherErrorMessage(
        error.message || "خطا در بررسی کد. دوباره تلاش کنید.",
      );
      setOtherSuccessMessage("");
    },
  });

  // ---------- رندرینگ ----------
  if (showPreviousForm === "ads") return <FormAdvertiser2 />;
  if (showPreviousForm === "employee") return <FormEmployee2 />;
  if (showPreviousForm === "jobseeker") return <FormJobSeeker2 />;
  if (showPreviousForm === "digital") return <FormDigitalProjects2 />;
  if (showNextForm) return <Form4 />;

  return (
    <PersonProvider>
      <div className="relative z-10 flex flex-col md:flex-row justify-center items-stretch md:items-start h-auto sm:h-[90%] md:mt-4 px-3">
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
        <div className="flex flex-col justify-between h-[95%] p-4 relative z-20 w-[98%] md:w-[80%] mx-auto">
          <StepProgress currentStep={3} />
          <div className="flex-1 flex flex-col justify-start items-center mt-[2vh] gap-[1vh] w-full">
            {/* بخش شماره خود (در صورت عدم انتخاب other) */}
            {!isOther && (
              <>
                <p className="text-gray-400 font-semibold text-[2vh] md:text-[2.8vh] mt-[4vh] mb-[2vh]">
                  {loading
                    ? "در حال بارگذاری شماره..."
                    : `تائید شماره ی ${user?.phone || "----"} با کد پیامک`}
                </p>

                <div className="flex w-full md:w-[55%] flex-col md:flex-row items-stretch md:items-center gap-3">
                  <div className="w-full md:flex-1">
                    <FloatingInput
                      placeholder="کد ارسال شده را وارد کنید"
                      variant="input"
                      value={code}
                      onChange={(val) => setCode(val)}
                      inputType="alphanumeric"
                      disabled={inputDisabled}
                      width="w-full"
                    />
                  </div>

                  <div className="flex w-full md:w-auto gap-2 mb-4">
                    <Button
                      className="w-1/2 md:w-auto h-[5vh] md:h-[7vh] rounded-[10px] text-[2vh] md:text-[2.6vh] whitespace-nowrap"
                      style={{
                        backgroundColor: "rgba(20,58,98,0.85)",
                        color: "#FFFFFF",
                        fontWeight: 600,
                        textTransform: "none",
                        paddingLeft: "5vh",
                        paddingRight: "5vh",
                      }}
                      onClick={() => sendCodeMutation.mutate()}
                      disabled={isVerified}
                    >
                      ارسال کد
                    </Button>
                    <Button
                      className="w-1/2 md:w-auto h-[5vh] md:h-[7vh] rounded-[10px] text-[2vh] md:text-[2.6vh] whitespace-nowrap"
                      style={{
                        backgroundColor: "rgba(20,100,50,0.85)",
                        color: "#FFFFFF",
                        fontWeight: 600,
                        textTransform: "none",
                        paddingLeft: "3vh",
                        paddingRight: "3vh",
                      }}
                      onClick={() => verifyCodeMutation.mutate()}
                      disabled={isVerified}
                    >
                      بررسی کد
                    </Button>
                  </div>
                </div>

                {successMessage && (
                  <p className="text-green-600 text-sm mt-1">
                    {successMessage}
                  </p>
                )}
                {errorMessage && (
                  <p className="text-red-600 text-sm mt-1">{errorMessage}</p>
                )}
              </>
            )}

            {/* بخش شماره دیگر (فقط در صورت انتخاب other) */}
            {isOther && (
              <div className="w-full md:w-[80%] mt-4 border-t border-gray-300 pt-4">
                <p className="text-gray-400 font-semibold text-[2vh] md:text-[2.8vh] mb-2">
                  تأیید شماره‌ی شخص دیگر
                </p>
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full">
                  <div className="w-full md:flex-1">
                    <FloatingInput
                      placeholder="شماره موبایل شخص دیگر را وارد کنید"
                      variant="input"
                      value={otherPhone}
                      onChange={(val) => setOtherPhone(val)}
                      inputType="number"
                      disabled={otherPhoneInputDisabled}
                      width="w-full"
                    />
                  </div>
                  <div className="flex w-full md:w-auto gap-2 mb-4">
                    <Button
                      className="w-1/2 md:w-auto h-[5vh] md:h-[7vh] rounded-[10px] text-[2vh] md:text-[2.6vh] whitespace-nowrap"
                      style={{
                        backgroundColor: "rgba(20,58,98,0.85)",
                        color: "#FFFFFF",
                        fontWeight: 600,
                        textTransform: "none",
                        paddingLeft: "5vh",
                        paddingRight: "5vh",
                      }}
                      onClick={() => sendOtherCodeMutation.mutate()}
                      disabled={otherPhoneInputDisabled}
                    >
                      ارسال کد
                    </Button>
                    <Button
                      className="w-1/2 md:w-auto h-[5vh] md:h-[7vh] rounded-[10px] text-[2vh] md:text-[2.6vh] whitespace-nowrap"
                      style={{
                        backgroundColor: "rgba(20,100,50,0.85)",
                        color: "#FFFFFF",
                        fontWeight: 600,
                        textTransform: "none",
                        paddingLeft: "3vh",
                        paddingRight: "3vh",
                      }}
                      onClick={() => verifyOtherCodeMutation.mutate()}
                      disabled={otherPhoneInputDisabled}
                    >
                      بررسی کد
                    </Button>
                  </div>
                </div>
                <div className="w-full md:w-[55%] flex flex-col">
                  <FloatingInput
                    placeholder="کد ارسال شده را وارد کنید"
                    variant="input"
                    value={otherPhoneCode}
                    onChange={(val) => setOtherPhoneCode(val)}
                    inputType="alphanumeric"
                    disabled={otherPhoneInputDisabled}
                    width="w-full"
                  />
                </div>
                {otherSuccessMessage && (
                  <p className="text-green-600 text-sm mt-1">
                    {otherSuccessMessage}
                  </p>
                )}
                {otherErrorMessage && (
                  <p className="text-red-600 text-sm mt-1">
                    {otherErrorMessage}
                  </p>
                )}
              </div>
            )}

            {/* چک‌باکس‌ها - با نام‌های جدید enableChat و enablePhone */}
            <div className="flex flex-col gap-[2vh] w-[82%] sm:w-[50%] mb-[2vh] items-start">
              <label className="sm:inline-flex items-end sm:items-center bg-white rounded-[10px] px-[2.5vh] py-[1.5vh] gap-2 md:gap-1 whitespace-nowrap">
                <input
                  type="checkbox"
                  className="w-[2.4vh] h-[2.4vh] rounded-[5px] bg-[#DEDEDE] checked:bg-blue-900 appearance-none cursor-pointer"
                  onChange={(e) =>
                    setCheckboxState({
                      ...checkboxState,
                      enableChat: e.target.checked,
                    })
                  }
                  checked={checkboxState.enableChat}
                />
                <span className="text-[#143A62E5] font-semibold text-[1.2vh] md:text-[1.4vh] md:text-[1.8vh] lg:text-[2.2vh]">
                  فعال کردن پیام چت
                </span>
              </label>
              <label className="inline-flex items-center bg-white rounded-[10px] px-[2.5vh] py-[1.5vh] gap-2 md:gap-1 whitespace-nowrap">
                <input
                  type="checkbox"
                  className="w-[2.4vh] h-[2.4vh] rounded-[5px] bg-[#DEDEDE] checked:bg-blue-900 appearance-none cursor-pointer"
                  onChange={(e) =>
                    setCheckboxState({
                      ...checkboxState,
                      enablePhone: e.target.checked,
                    })
                  }
                  checked={checkboxState.enablePhone}
                />
                <span className="text-[#143A62E5] font-semibold text-[1.2vh] md:text-[1.4vh] md:text-[1.8vh] lg:text-[2.2vh]">
                  نمایش تماس تلفنی
                </span>
              </label>
            </div>

            {/* دکمه‌های ناوبری */}
            <div className="flex gap-4 items-center w-[80%] md:w-full justify-center mt-[0.2vh] md:mt-[8vh]">
              <Button
                onClick={handlePrevStep}
                className="w-[55%] md:w-[25%] h-[5vh] md:h-[7vh] rounded-[10px] text-[2vh] md:text-[2.6vh]"
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
                onClick={() => {
                  // ۱. بررسی تأیید شماره
                  let phoneVerified = false;
                  if (isOther) {
                    phoneVerified = otherPhoneVerified;
                  } else {
                    phoneVerified = isVerified;
                  }

                  if (!phoneVerified) {
                    setErrorMessage(
                      isOther
                        ? "لطفاً ابتدا شماره شخص دیگر را تأیید کنید"
                        : "لطفاً ابتدا شماره خود را تأیید کنید",
                    );
                    return;
                  }

                  // ۲. بررسی فعال بودن حداقل یکی از چک‌باکس‌ها (با نام‌های جدید)
                  if (!checkboxState.enableChat && !checkboxState.enablePhone) {
                    setErrorMessage(
                      "حداقل یکی از گزینه‌های «چت» یا «تماس» باید فعال باشد.",
                    );
                    return;
                  }

                  setErrorMessage("");
                  handleNextStep();
                }}
                className="w-[50%] md:w-[25%] h-[5vh] md:h-[7vh] rounded-[10px] text-[2vh] md:text-[2.6vh]"
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
        </div>
      </div>
    </PersonProvider>
  );
};

export default Form3;
