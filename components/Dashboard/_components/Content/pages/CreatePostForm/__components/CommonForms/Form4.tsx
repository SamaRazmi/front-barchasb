"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { PersonProvider } from "@/context/PersonContext";
import StepProgress from "@/components/common/StepProgress";
import Button from "@mui/material/Button";
import { useFormStore, UserType } from "@/store/formStore";
import { usePathname } from "next/navigation";
import Form5 from "./Form5";
import Form3 from "./Form3";
import FormDigitalProjects2 from "../DigitalProjects/___components/FormDigitalProjects2";
import {
  calculateCheckout,
  getWalletBalance,
  AdType,
  PaymentMethod,
  LadderOption,
  processAdPayment,
} from "@/api/apiBuy";
import {
  submitDigitalAd,
  submitEmployerAd,
  submitJobSeekerAd,
  submitSellerAd,
} from "@/api/apiFormsAds";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useUser } from "@/context/UserContext";

/* ---------------- Types ---------------- */
type PaymentType = "subscription" | "wallet" | "Bank_card";

const getPaymentMethod = (type: PaymentType | null): PaymentMethod => {
  if (type === "wallet") return "Wallet";
  return "Bank_card";
};

/* ---------------- Custom Radio Option ---------------- */
type RadioOptionProps = {
  label: string;
  value: PaymentType;
  selectedValue: PaymentType | null;
  onChange: (value: PaymentType) => void;
  disabled?: boolean;
  disabledMessage?: string;
};

const CustomRadioOption: React.FC<RadioOptionProps> = ({
  label,
  value,
  selectedValue,
  onChange,
  disabled = false,
  disabledMessage,
}) => {
  const isChecked = selectedValue === value;

  return (
    <label
      className={`relative flex justify-between items-center bg-gray-200 rounded-lg p-3 h-[10vh] overflow-hidden ${
        disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      {disabled && disabledMessage && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          style={{ zIndex: 5 }}
        >
          <span
            className="text-red-500 font-bold text-[4vh] opacity-30 transform -rotate-12 whitespace-nowrap w-full text-center"
            style={{ letterSpacing: "8px" }}
          >
            {disabledMessage}
          </span>
        </div>
      )}

      <span className="text-[#143A62] text-[1.8vh] sm:text-[2vh] flex items-center gap-2 relative z-10">
        {label}
      </span>

      <span className="relative flex items-center justify-center z-10">
        <input
          type="radio"
          name="payment"
          checked={isChecked}
          onChange={() => !disabled && onChange(value)}
          disabled={disabled}
          className={`appearance-none w-[18px] h-[18px] rounded-full border border-[#143A62] bg-transparent ${
            disabled ? "cursor-not-allowed" : "cursor-pointer"
          }`}
        />
        {isChecked && !disabled && (
          <span className="absolute text-[#143A62] text-[14px] leading-none select-none">
            ✓
          </span>
        )}
      </span>
    </label>
  );
};

/* ---------------- Ad Type Card ---------------- */
type AdOptionCardProps = {
  title: string;
  description: React.ReactNode;
  checked: boolean;
  onChange: () => void;
};

const AdOptionCard: React.FC<AdOptionCardProps> = ({
  title,
  description,
  checked,
  onChange,
}) => {
  const handleCardClick = () => {
    onChange();
  };

  return (
    <div
      className="flex justify-between items-start bg-gray-200 rounded-lg p-3 cursor-pointer flex-1 h-[18vh]"
      onClick={handleCardClick}
    >
      <div className="flex flex-col items-start text-right flex-1">
        <span className="text-[#143A62] font-bold text-[1.8vh] sm:text-[2vh]">
          {title}
        </span>
        <span className="text-[#143A62] text-[1.2vh] leading-[2vh] sm:text-[1.4vh] sm:leading-[2.2vh] sm:text-[1.6vh] mt-[2vh] sm:leading-[2.8vh] w-full">
          {description}
        </span>
      </div>

      <span className="relative flex items-center justify-center mt-1">
        <input type="checkbox" checked={checked} readOnly className="hidden" />
        <span
          className={`w-[18px] h-[18px] rounded-full border border-[#143A62] flex items-center justify-center ${
            checked ? "bg-[#143A62] text-white" : "bg-transparent"
          }`}
        >
          {checked && <span className="text-white text-sm">✓</span>}
        </span>
      </span>
    </div>
  );
};

/* ---------------- Form4 ---------------- */
const Form4: React.FC = () => {
  const pathname = usePathname();
  const { setField, getFormData, userType } = useFormStore();
  const { user } = useUser();

  const [showNextForm, setShowNextForm] = useState(false);
  const [showPreviousForm, setShowPreviousForm] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<PaymentType>("wallet");
  const [ladderChecked, setLadderChecked] = useState(false);
  const [specialAdChecked, setSpecialAdChecked] = useState(false);
  const [ladderOption, setLadderOption] = useState<LadderOption>("24h");

  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [canAfford, setCanAfford] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // شمارنده درخواست (برای لاگ)
  const requestCounter = useRef(0);

  const type: UserType = userType || "advertiser";

  const formData = useMemo(
    () => getFormData(type) as Record<string, any>,
    [getFormData, type],
  );

  const getAdType = useCallback((): AdType => {
    switch (type) {
      case "employer":
        return "EmployerAd";
      case "jobSeeker":
        return "JobSeekerAd";
      case "digital":
        return "DigitalAd";
      case "advertiser":
      default:
        return "SellerAd";
    }
  }, [type]);

  const getAdTypeForPayment = (t: UserType): string => {
    switch (t) {
      case "employer":
        return "EmployerAd";
      case "jobSeeker":
        return "JobSeekerAd";
      case "digital":
        return "DigitalAd";
      case "advertiser":
      default:
        return "SellerAd";
    }
  };

  // ============================================================
  // ✅ تابع submitAd با لاگ‌های بسیار دقیق از API
  // ============================================================
  const submitAd = async (t: UserType, data: any, userId: string) => {
    const reqId = requestCounter.current;
    console.log(
      `📤 [Request #${reqId}] submitAd شروع شد با نوع: ${t} و userId: ${userId}`,
    );
    console.log(`📤 [Request #${reqId}] داده‌های ارسالی به submitAd:`, data);

    let result;
    try {
      if (t === "digital") {
        console.log(
          `📤 [Request #${reqId}] فراخوانی API: submitDigitalAd با پارامترهای:`,
          { data, userId },
        );
        result = await submitDigitalAd(data, userId);
        console.log(
          `📥 [Request #${reqId}] پاسخ API submitDigitalAd:`,
          JSON.stringify(result, null, 2),
        );
      } else if (t === "employer") {
        console.log(
          `📤 [Request #${reqId}] فراخوانی API: submitEmployerAd با پارامترهای:`,
          { data, userId },
        );
        result = await submitEmployerAd(data, userId);
        console.log(
          `📥 [Request #${reqId}] پاسخ API submitEmployerAd:`,
          JSON.stringify(result, null, 2),
        );
      } else if (t === "jobSeeker") {
        console.log(
          `📤 [Request #${reqId}] فراخوانی API: submitJobSeekerAd با پارامترهای:`,
          { data, userId },
        );
        result = await submitJobSeekerAd(data, userId);
        console.log(
          `📥 [Request #${reqId}] پاسخ API submitJobSeekerAd:`,
          JSON.stringify(result, null, 2),
        );
      } else if (t === "advertiser") {
        if (data.price) {
          data.price = String(data.price).replace(/,/g, "").trim();
        }
        console.log(
          `📤 [Request #${reqId}] فراخوانی API: submitSellerAd با پارامترهای:`,
          { data, userId },
        );
        result = await submitSellerAd(data, userId);
        console.log(
          `📥 [Request #${reqId}] پاسخ API submitSellerAd:`,
          JSON.stringify(result, null, 2),
        );
      }
    } catch (err: any) {
      console.error(
        `❌ [Request #${reqId}] خطای شبکه یا سرور در submitAd:`,
        err,
      );
      // اگر err شیء دارای response یا status باشد، آن را هم لاگ کن
      if (err.response) {
        console.error(
          `❌ [Request #${reqId}] جزئیات خطای پاسخ:`,
          err.response.status,
          err.response.data,
        );
      }
      throw err;
    }
    return result;
  };

  const fetchWalletBalance = useCallback(async () => {
    console.log("💰 دریافت موجودی کیف پول...");
    const result = await getWalletBalance();
    if (result.status === "success" && result.data) {
      setWalletBalance(result.data.available);
      setField(type, "walletBalance", result.data.available);
      console.log("💰 موجودی جدید:", result.data.available);
    } else {
      setWalletBalance(0);
      setField(type, "walletBalance", 0);
      console.warn("💰 خطا در دریافت موجودی یا موجودی صفر");
    }
  }, [setField, type]);

  useEffect(() => {
    if (formData?.LADDER !== undefined) {
      setLadderChecked(formData.LADDER);
    }
    if (formData?.SPECIAL_AD !== undefined) {
      setSpecialAdChecked(formData.SPECIAL_AD);
    }
    if (formData?.ladderOption) {
      setLadderOption(formData.ladderOption);
    }
    if (formData?.walletBalance !== undefined) {
      setWalletBalance(formData.walletBalance);
    }
  }, [
    formData?.LADDER,
    formData?.SPECIAL_AD,
    formData?.ladderOption,
    formData?.walletBalance,
  ]);

  useEffect(() => {
    fetchWalletBalance();
  }, [fetchWalletBalance]);

  useEffect(() => {
    const calculate = async () => {
      if (paymentMethod === "subscription") return;

      const requestData = {
        adType: getAdType(),
        isNewAd: true,
        isSpecial: specialAdChecked,
        isLadder: ladderChecked,
        ladderOption: ladderChecked ? ladderOption : undefined,
        isRenewal: false,
        paymentMethod: getPaymentMethod(paymentMethod),
      };

      console.log("🧮 محاسبه هزینه با داده:", requestData);

      setLoading(true);
      setError(null);

      try {
        const result = await calculateCheckout(requestData);
        console.log(
          "🧮 پاسخ API calculateCheckout:",
          JSON.stringify(result, null, 2),
        );
        if (result.status === "success" && result.data) {
          setTotalCost(result.data.totalCost);
          setCanAfford(result.data.canAfford);
          setField(type, "totalCost", result.data.totalCost);
          setField(type, "canAfford", result.data.canAfford);
          await fetchWalletBalance();
          console.log(
            "🧮 هزینه محاسبه شد:",
            result.data.totalCost,
            "قابلیت پرداخت:",
            result.data.canAfford,
          );
        } else {
          setError(result.message || "خطا در محاسبه");
          setCanAfford(false);
          console.error(
            "🧮 خطا در محاسبه هزینه:",
            result.message,
            "سایر اطلاعات:",
            result,
          );
        }
      } catch (err) {
        setError("خطای شبکه");
        setCanAfford(false);
        console.error("🧮 خطای شبکه در محاسبه هزینه:", err);
      } finally {
        setLoading(false);
      }
    };

    if (paymentMethod && paymentMethod !== "subscription") {
      calculate();
    }
  }, [
    paymentMethod,
    ladderChecked,
    specialAdChecked,
    ladderOption,
    getAdType,
    setField,
    type,
    fetchWalletBalance,
  ]);

  useEffect(() => {
    setField(type, "paymentMethod", paymentMethod);
    setField(type, "LADDER", ladderChecked);
    setField(type, "SPECIAL_AD", specialAdChecked);
    setField(type, "ladderOption", ladderOption);
    setField(type, "adType", getAdType());
  }, [
    paymentMethod,
    ladderChecked,
    specialAdChecked,
    ladderOption,
    getAdType,
    setField,
    type,
  ]);

  // ============================================================
  // ✅ تابع handleNext با محافظت کامل و لاگ‌های دقیق API
  // ============================================================
  const handleNext = async () => {
    const reqId = ++requestCounter.current;
    const timestamp = new Date().toISOString();

    console.log(
      `🟢 [Request #${reqId}] handleNext فراخوانی شد در زمان: ${timestamp}`,
    );

    // 🛑 جلوگیری از اجرای همزمان
    if (isSubmitting) {
      console.warn(
        `⛔ [Request #${reqId}] درخواست قبلی در حال پردازش است. درخواست جدید نادیده گرفته شد.`,
      );
      return;
    }

    // 🛑 بررسی وضعیت در localStorage (برای جلوگیری از ارسال مجدد بعد از رفرش)
    const storedKey = localStorage.getItem("pendingPaymentKey");
    if (storedKey) {
      console.warn(
        `⛔ [Request #${reqId}] درخواست قبلی هنوز تکمیل نشده (key: ${storedKey})`,
      );
      setError("درخواست قبلی در حال پردازش است، لطفاً صبر کنید.");
      return;
    }

    console.log(`🔹 [Request #${reqId}] وضعیت فعلی:`, {
      paymentMethod,
      totalCost,
      walletBalance,
      canAfford,
      ladderChecked,
      specialAdChecked,
      user: user?.id,
    });

    if (!user) {
      setError("کاربر وارد نشده است");
      console.error(`❌ [Request #${reqId}] کاربر وارد نشده است`);
      return;
    }

    if (paymentMethod === "subscription") {
      setError("پرداخت از طریق اشتراک به زودی فعال می‌شود");
      console.warn(`⚠️ [Request #${reqId}] پرداخت اشتراک غیرفعال است`);
      return;
    }

    // 🔑 تولید Idempotency Key یکتا
    const idempotencyKey = crypto.randomUUID();
    console.log(`🔑 [Request #${reqId}] Idempotency Key: ${idempotencyKey}`);

    // ذخیره در localStorage برای جلوگیری از ارسال مجدد
    localStorage.setItem("pendingPaymentKey", idempotencyKey);

    setIsSubmitting(true);
    setLoading(true);
    setError(null);

    try {
      const userId = user.id;
      if (!userId) {
        throw new Error("شناسه کاربر معتبر نیست");
      }

      console.log(
        `📤 [Request #${reqId}] مرحله 1: شروع ثبت آگهی با داده:`,
        formData,
      );
      const adResult = await submitAd(type, formData, userId);
      console.log(`📥 [Request #${reqId}] پاسخ ثبت آگهی:`, adResult);

      const adId =
        adResult?.ad?._id || adResult?.ad?.id || adResult?._id || adResult?.id;
      if (!adId) {
        throw new Error("شناسه آگهی پس از ثبت دریافت نشد");
      }
      setField(type, "adId", adId);
      console.log(`✅ [Request #${reqId}] آگهی با موفقیت ثبت شد. adId:`, adId);

      const paymentMethodForApi: PaymentMethod =
        paymentMethod === "Bank_card" ? "Bank_card" : "Wallet";

      if (paymentMethod === "wallet" && !canAfford) {
        throw new Error("موجودی کیف پول کافی نیست");
      }

      const paymentRequest = {
        adId,
        adType: getAdTypeForPayment(type),
        isSpecial: specialAdChecked,
        isLadder: ladderChecked,
        ladderOption: ladderChecked ? ladderOption : undefined,
        paymentMethod: paymentMethodForApi,
        idempotencyKey,
      };

      console.log(
        `💳 [Request #${reqId}] مرحله 2: ارسال درخواست پرداخت با پارامترهای زیر:`,
        paymentRequest,
      );

      // ✅ فقط یک آرگومان به processAdPayment ارسال می‌شود
      const paymentResult = await processAdPayment(paymentRequest);
      console.log(
        `📥 [Request #${reqId}] پاسخ دریافتی از پرداخت (processAdPayment):`,
        JSON.stringify(paymentResult, null, 2),
      );

      const isSuccess =
        paymentResult?.status === "success" ||
        paymentResult?.data?.success === true;

      if (!isSuccess) {
        // لاگ کامل خطا
        console.error(
          `❌ [Request #${reqId}] پرداخت ناموفق بود. وضعیت: ${paymentResult?.status}، پیام: ${paymentResult?.message}، کل پاسخ:`,
          paymentResult,
        );
        throw new Error(paymentResult?.message || "پرداخت ناموفق بود");
      }

      // پاک کردن localStorage پس از موفقیت
      localStorage.removeItem("pendingPaymentKey");

      if (paymentMethod === "Bank_card" && paymentResult?.data?.paymentUrl) {
        console.log(
          `🔀 [Request #${reqId}] هدایت به درگاه بانک:`,
          paymentResult.data.paymentUrl,
        );
        window.location.href = paymentResult.data.paymentUrl;
        return;
      }

      console.log(
        `🎉 [Request #${reqId}] پرداخت با موفقیت انجام شد. رفتن به مرحله بعد (Form5)`,
      );
      setShowNextForm(true);
    } catch (err: any) {
      console.error(`❌ [Request #${reqId}] خطا در فرآیند ثبت و پرداخت:`, err);
      // لاگ کامل خطا (اگر شیء خطا دارای response یا سایر جزئیات باشد)
      if (err.response) {
        console.error(
          `❌ [Request #${reqId}] جزئیات پاسخ خطا:`,
          err.response.status,
          err.response.data,
        );
      } else if (err.request) {
        console.error(
          `❌ [Request #${reqId}] درخواست انجام شد اما پاسخی دریافت نشد:`,
          err.request,
        );
      } else {
        console.error(
          `❌ [Request #${reqId}] پیام خطا: ${err.message}`,
          err.stack,
        );
      }
      setError(err.message || "خطا در ثبت آگهی یا پرداخت");
      // در صورت خطا، کلید را از localStorage پاک می‌کنیم تا کاربر بتواند دوباره تلاش کند
      localStorage.removeItem("pendingPaymentKey");
    } finally {
      setIsSubmitting(false);
      setLoading(false);
      console.log(
        `🏁 [Request #${reqId}] وضعیت isSubmitting و loading به false بازنشانی شد.`,
      );
    }
  };

  if (showPreviousForm) {
    if (pathname.endsWith("digitalprojectform"))
      return <FormDigitalProjects2 />;
    return <Form3 />;
  }

  if (showNextForm) return <Form5 />;

  return (
    <PersonProvider>
      <div className="relative z-10 flex flex-col sm:flex-row justify-center items-stretch sm:items-start h-[95%] sm:h-[92%] sm:mt-[1vh] px-3">
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

        <div className="flex flex-col justify-between h-[65%] sm:h-[85%] p-4 relative z-20 w-[94%] sm:w-[55%] mx-auto">
          <StepProgress currentStep={4} />

          <div className="flex-1 flex flex-col justify-center items-center gap-4 w-full mt-[1vh]">
            <div className="w-fit rounded-lg p-1 text-[#143A62] bg-gray-200 text-[1.2vh] sm:text-[1.4vh] text-center">
              تعداد امتیاز اشتراک: به زودی
            </div>

            <div className="w-fit rounded-lg p-1 text-[#143A62] bg-gray-200 text-[1.8vh] sm:text-[1.8vh] text-center">
              موجودی کیف پول: {walletBalance.toLocaleString()} تومان
            </div>

            <div className="flex flex-col md:flex-row-reverse w-[90%] md:w-[80%] gap-[0.5vh] items-stretch">
              <div className="flex flex-col md:w-1/2 gap-4">
                <CustomRadioOption
                  label="پرداخت از طریق اشتراک"
                  value="subscription"
                  selectedValue={paymentMethod}
                  onChange={setPaymentMethod}
                  disabled={true}
                  disabledMessage="به زودی"
                />

                <CustomRadioOption
                  label="پرداخت از طریق کیف پول"
                  value="wallet"
                  selectedValue={paymentMethod}
                  onChange={setPaymentMethod}
                />

                <CustomRadioOption
                  label="پرداخت با کارت بانکی"
                  value="Bank_card"
                  selectedValue={paymentMethod}
                  onChange={setPaymentMethod}
                />
              </div>

              <div className="flex flex-col md:w-1/2 gap-[0.5vh]">
                <AdOptionCard
                  title="پله"
                  description={
                    <span className="flex items-center gap-1 flex-wrap">
                      آگهی شما در صدر آگهی‌ها قرار خواهد گرفت بعد از
                      <Select
                        value={ladderOption}
                        onChange={(e: SelectChangeEvent<LadderOption>) =>
                          setLadderOption(e.target.value as LadderOption)
                        }
                        size="small"
                        disabled={!ladderChecked}
                        onClick={(e) => e.stopPropagation()}
                        sx={{
                          minWidth: 80,
                          backgroundColor: "#e5e7eb",
                          borderRadius: "8px",
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: "none",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            border: "none",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            border: "none",
                          },
                          "& .MuiSelect-select": { py: 0.5, px: 1 },
                        }}
                      >
                        <MenuItem value="24h">۲۴ ساعت</MenuItem>
                        <MenuItem value="72h">۷۲ ساعت</MenuItem>
                        <MenuItem value="7d">۷ روز</MenuItem>
                      </Select>
                    </span>
                  }
                  checked={ladderChecked}
                  onChange={() => setLadderChecked((prev) => !prev)}
                />

                <AdOptionCard
                  title="ویژه"
                  description="آگهی شما با رنگ متمایز نشان داده می شود"
                  checked={specialAdChecked}
                  onChange={() => setSpecialAdChecked((prev) => !prev)}
                />
              </div>
            </div>

            <div className="mt-[0.2vh] text-gray-600 text-[1.6vh] text-center">
              {loading && <span>در حال ثبت آگهی و پردازش...</span>}
              {error && <span className="text-red-500">{error}</span>}
              {!loading && !error && (
                <div>
                  <span className="font-bold">
                    هزینه کل: {totalCost.toLocaleString()} تومان
                  </span>
                  {paymentMethod === "wallet" && (
                    <span
                      className={`text-sm mr-2 ${canAfford ? "text-green-600" : "text-red-500"}`}
                    >
                      {canAfford ? "✓ موجودی کافی است" : "✗ موجودی کافی نیست"}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 items-center w-full justify-center mt-[0.2vh] sm:mt-[0.8vh] whitespace-nowrap">
            <Button
              onClick={() => setShowPreviousForm(true)}
              className="w-[40%] sm:w-[25%]  h-[5vh] sm:h-[6vh]  rounded-[10px] text-[1.4vh] sm:text-[1.6vh]"
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
              disabled={
                isSubmitting ||
                loading ||
                paymentMethod === "subscription" ||
                !paymentMethod ||
                (paymentMethod === "wallet" && !canAfford)
              }
              className={`w-[40%] sm:w-[25%] h-[5vh] sm:h-[6vh] rounded-[10px] text-[1.4vh] sm:text-[1.6vh] ${
                isSubmitting ||
                loading ||
                paymentMethod === "subscription" ||
                !paymentMethod ||
                (paymentMethod === "wallet" && !canAfford)
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              style={{
                backgroundColor: "rgba(20,58,98,0.85)",
                color: "#FFFFFF",
                fontWeight: 600,
                textTransform: "none",
              }}
            >
              {isSubmitting ? "در حال ارسال..." : "مرحله بعد"}
            </Button>
          </div>
        </div>
      </div>
    </PersonProvider>
  );
};

export default Form4;
