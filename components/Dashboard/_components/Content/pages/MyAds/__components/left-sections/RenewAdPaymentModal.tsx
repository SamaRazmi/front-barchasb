"use client";

import React, { useState, useEffect } from "react";
import {
  getWalletBalance,
  calculateCheckout,
  purchaseEnhancement,
  BASE_URL,
  PaymentMethod,
  LadderOption,
} from "@/api/apiBuy";

// ✅ تغییر: استفاده از id به جای _id
export interface Ad {
  id: string; // ← تغییر اصلی
  title: string;
  name: string;
  priceIRT?: string;
  createdAt?: string;
}

/* ---------------- Types ---------------- */
type PaymentType = "subscription" | "wallet" | "Bank_card";

/* ---------------- Custom Checkbox (مرحله اول) ---------------- */
type CheckboxOptionProps = {
  label: string;
  description?: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
};

const CheckboxOption: React.FC<CheckboxOptionProps> = ({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}) => {
  return (
    <label
      className={`flex justify-between items-center bg-gray-200 rounded-lg p-2 min-h-[50px] ${
        disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      <div className="flex flex-col items-start text-right flex-1 ml-2">
        <span className="text-[#143A62] text-[1.8vh] font-medium">{label}</span>
        {description && (
          <span className="text-[#143A62] text-[1.4vh] opacity-70 mt-0.5 leading-tight">
            {description}
          </span>
        )}
      </div>
      <span className="relative flex items-center justify-center flex-shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={!disabled ? onChange : undefined}
          disabled={disabled}
          className={`appearance-none w-[16px] h-[16px] rounded-full border border-[#143A62] bg-transparent ${
            disabled ? "cursor-not-allowed" : "cursor-pointer"
          }`}
        />
        {checked && !disabled && (
          <span className="absolute text-[#143A62] text-[12px] leading-none select-none">
            ✓
          </span>
        )}
      </span>
    </label>
  );
};

/* ---------------- Custom Radio Option (مرحله دوم) ---------------- */
type RadioOptionStep2Props = {
  label: string;
  value: PaymentType;
  selectedValue: PaymentType | null;
  onChange: (value: PaymentType) => void;
  disabled?: boolean;
  disabledMessage?: string;
};

const RadioOptionStep2: React.FC<RadioOptionStep2Props> = ({
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
      className={`relative flex justify-between items-center bg-gray-200 rounded-lg p-2 min-h-[50px] overflow-hidden ${
        disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      {disabled && disabledMessage && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          style={{ zIndex: 5 }}
        >
          <span
            className="text-red-500 font-bold text-[2.5vh] opacity-30 transform -rotate-12 whitespace-nowrap w-full text-center"
            style={{ letterSpacing: "4px" }}
          >
            {disabledMessage}
          </span>
        </div>
      )}

      <span className="text-[#143A62] text-[1.8vh] font-medium relative z-10">
        {label}
      </span>

      <span className="relative flex items-center justify-center z-10">
        <input
          type="radio"
          name="step2-payment"
          checked={isChecked}
          onChange={() => !disabled && onChange(value)}
          disabled={disabled}
          className={`appearance-none w-[16px] h-[16px] rounded-full border border-[#143A62] bg-transparent ${
            disabled ? "cursor-not-allowed" : "cursor-pointer"
          }`}
        />
        {isChecked && !disabled && (
          <span className="absolute text-[#143A62] text-[12px] leading-none select-none">
            ✓
          </span>
        )}
      </span>
    </label>
  );
};

/* ---------------- Main Modal ---------------- */
interface RenewAdPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  ad: Ad;
  adTypeForApi?: "EmployerAd" | "JobSeekerAd" | "SellerAd" | "DigitalAd";
}

const RenewAdPaymentModal: React.FC<RenewAdPaymentModalProps> = ({
  isOpen,
  onClose,
  ad,
  adTypeForApi = "SellerAd",
}) => {
  // ---------- State مرحله ----------
  const [step, setStep] = useState<1 | 2>(1);

  // ---------- State مرحله اول (چک‌باکس) ----------
  const [selectedRenew, setSelectedRenew] = useState(false);
  const [selectedSpecial, setSelectedSpecial] = useState(false);
  const [selectedLadder, setSelectedLadder] = useState(false);
  const [ladderOption, setLadderOption] = useState<LadderOption>("24h");

  // ---------- State هزینه‌ها ----------
  const [renewalCost, setRenewalCost] = useState<number>(0);
  const [specialCost, setSpecialCost] = useState<number>(0);
  const [ladderCost, setLadderCost] = useState<number>(0);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [calculating, setCalculating] = useState(false);

  // ---------- State مرحله دوم ----------
  const [paymentMethod, setPaymentMethod] = useState<PaymentType>("wallet");
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---------- محاسبه روزهای فعال ----------
  const getDaysActive = (createdAt?: string): number => {
    if (!createdAt) return 0;
    const created = new Date(createdAt);
    const now = new Date();
    const diff = now.getTime() - created.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  // ---------- محاسبه هزینه‌ها (با استفاده از calculateCheckout) ----------
  useEffect(() => {
    const calculateCosts = async () => {
      if (!selectedRenew && !selectedSpecial && !selectedLadder) {
        setTotalCost(0);
        setRenewalCost(0);
        setSpecialCost(0);
        setLadderCost(0);
        return;
      }

      setCalculating(true);
      try {
        let total = 0;

        if (selectedRenew) {
          const result = await calculateCheckout({
            adType: adTypeForApi,
            isNewAd: false,
            isSpecial: false,
            isLadder: false,
            isRenewal: true,
            paymentMethod:
              paymentMethod === "Bank_card" ? "Bank_card" : "Wallet",
          });
          if (result.status === "success" && result.data) {
            const cost = result.data.renewalCost || 0;
            setRenewalCost(cost);
            total += cost;
          }
        } else {
          setRenewalCost(0);
        }

        if (selectedSpecial) {
          const result = await calculateCheckout({
            adType: adTypeForApi,
            isNewAd: false,
            isSpecial: true,
            isLadder: false,
            isRenewal: false,
            paymentMethod:
              paymentMethod === "Bank_card" ? "Bank_card" : "Wallet",
          });
          if (result.status === "success" && result.data) {
            const cost = result.data.specialCost || 0;
            setSpecialCost(cost);
            total += cost;
          }
        } else {
          setSpecialCost(0);
        }

        if (selectedLadder) {
          const result = await calculateCheckout({
            adType: adTypeForApi,
            isNewAd: false,
            isSpecial: false,
            isLadder: true,
            ladderOption: ladderOption,
            isRenewal: false,
            paymentMethod:
              paymentMethod === "Bank_card" ? "Bank_card" : "Wallet",
          });
          if (result.status === "success" && result.data) {
            const cost = result.data.ladderCost || 0;
            setLadderCost(cost);
            total += cost;
          }
        } else {
          setLadderCost(0);
        }

        setTotalCost(total);
      } catch (err) {
        console.error("Error calculating costs:", err);
      } finally {
        setCalculating(false);
      }
    };

    if (step === 1) {
      calculateCosts();
    }
  }, [
    selectedRenew,
    selectedSpecial,
    selectedLadder,
    ladderOption,
    adTypeForApi,
    paymentMethod,
    step,
  ]);

  // ---------- دریافت موجودی کیف پول ----------
  useEffect(() => {
    if (step === 2) {
      const fetchBalance = async () => {
        setLoadingBalance(true);
        const result = await getWalletBalance();
        if (result.status === "success" && result.data) {
          setWalletBalance(result.data.available);
        } else {
          setWalletBalance(0);
        }
        setLoadingBalance(false);
      };
      fetchBalance();
    }
  }, [step]);

  // ---------- بازنشانی state هنگام بستن ----------
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setSelectedRenew(false);
      setSelectedSpecial(false);
      setSelectedLadder(false);
      setPaymentMethod("wallet");
      setError(null);
      setTotalCost(0);
      setRenewalCost(0);
      setSpecialCost(0);
      setLadderCost(0);
    }
  }, [isOpen]);

  // ---------- تایید مرحله اول ----------
  const handleConfirmStep1 = () => {
    if (!selectedRenew && !selectedSpecial && !selectedLadder) return;
    setStep(2);
  };

  // ---------- ثبت نهایی ----------
  const handleFinalSubmit = async () => {
    setProcessing(true);
    setError(null);

    try {
      const promises = [];

      if (selectedRenew) {
        promises.push(
          purchaseEnhancement({
            adId: ad.id, // ✅ تغییر: ad._id → ad.id
            adType: adTypeForApi,
            enhancementType: "RENEWAL",
            paymentMethod:
              paymentMethod === "Bank_card" ? "Bank_card" : "Wallet",
          }),
        );
      }

      if (selectedSpecial) {
        promises.push(
          purchaseEnhancement({
            adId: ad.id, // ✅ تغییر
            adType: adTypeForApi,
            enhancementType: "SPECIAL",
            paymentMethod:
              paymentMethod === "Bank_card" ? "Bank_card" : "Wallet",
          }),
        );
      }

      if (selectedLadder) {
        promises.push(
          purchaseEnhancement({
            adId: ad.id, // ✅ تغییر
            adType: adTypeForApi,
            enhancementType: "LADDER",
            ladderSchedule: new Date().toISOString(),
            ladderOption: ladderOption,
            paymentMethod:
              paymentMethod === "Bank_card" ? "Bank_card" : "Wallet",
          }),
        );
      }

      await Promise.all(promises);

      const selectedOptions = [];
      if (selectedRenew) selectedOptions.push("تمدید");
      if (selectedSpecial) selectedOptions.push("ویژه");
      if (selectedLadder) selectedOptions.push("پله");

      alert(
        `✅ عملیات با موفقیت انجام شد.\n` +
          `گزینه‌های انتخاب شده: ${selectedOptions.join("، ")}`,
      );
      onClose();
    } catch (err: any) {
      setError(err.message || "خطا در انجام عملیات");
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  // ---------- نمایش ----------
  return (
    // تغییر اصلی: در موبایل fixed نسبت به ویوپورت، در دسکتاپ absolute نسبت به والد
    <div
      onClick={onClose}
      className="fixed inset-0 md:absolute md:inset-0 flex justify-center items-center backdrop-blur-[10px] z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-[70%] md:w-[55%] h-auto rounded-xl relative flex flex-col"
      >
        {/* دکمه بستن */}
        <div className="absolute top-4 left-4">
          <div
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center cursor-pointer text-2xl font-bold"
          >
            ×
          </div>
        </div>

        {/* عنوان */}
        <h2 className="text-center text-[#143A62] text-[2.5vh] font-bold mt-8 mb-4">
          {step === 1 ? "انتخاب گزینه‌های تمدید" : "پرداخت"}
        </h2>

        {/* اطلاعات آگهی */}
        <div className="flex flex-col items-center gap-2 text-[#143A62] text-[1.8vh] mb-4">
          <div>عنوان آگهی: {ad.title || ad.name}</div>
          <div>
            روزهای فعال بودن آگهی:{" "}
            {getDaysActive(ad.createdAt).toLocaleString()} روز
          </div>
          {step === 2 && (
            <>
              {loadingBalance ? (
                <div>در حال دریافت موجودی...</div>
              ) : (
                <div>
                  موجودی کیف پول: {walletBalance.toLocaleString()} تومان
                </div>
              )}
              {error && <div className="text-red-500 text-sm">{error}</div>}
            </>
          )}
        </div>

        {/* ---------- مرحله اول (چک‌باکس با توضیحات) ---------- */}
        {step === 1 && (
          <div className="flex-1 flex flex-col gap-3 w-3/4 mx-auto overflow-y-auto pb-2">
            <CheckboxOption
              label="تمدید آگهی"
              description="تمدید مدت زمان نمایش آگهی شما"
              checked={selectedRenew}
              onChange={() => setSelectedRenew(!selectedRenew)}
            />
            {selectedRenew && renewalCost > 0 && (
              <div className="text-[#143A62] text-[1.6vh] mr-4">
                هزینه تمدید: {renewalCost.toLocaleString()} تومان
              </div>
            )}

            <CheckboxOption
              label="ویژه"
              description="آگهی شما با رنگ متمایز و برجسته در بالای لیست نشان داده می‌شود"
              checked={selectedSpecial}
              onChange={() => setSelectedSpecial(!selectedSpecial)}
            />
            {selectedSpecial && specialCost > 0 && (
              <div className="text-[#143A62] text-[1.6vh] mr-4">
                هزینه ویژه: {specialCost.toLocaleString()} تومان
              </div>
            )}

            <CheckboxOption
              label="پله"
              description={`آگهی شما پس از ${
                ladderOption === "24h"
                  ? "۲۴ ساعت"
                  : ladderOption === "72h"
                    ? "۷۲ ساعت"
                    : "۷ روز"
              } در صدر آگهی‌ها قرار می‌گیرد و دیده‌شدن آن به حداکثر می‌رسد`}
              checked={selectedLadder}
              onChange={() => setSelectedLadder(!selectedLadder)}
            />
            {selectedLadder && (
              <div className="flex items-center gap-2 mr-4">
                <span className="text-[#143A62] text-[1.6vh]">مدت زمان:</span>
                <select
                  value={ladderOption}
                  onChange={(e) =>
                    setLadderOption(e.target.value as LadderOption)
                  }
                  className="bg-gray-200 rounded-lg p-1 text-[#143A62] text-[1.6vh] border-none outline-none"
                >
                  <option value="24h">۲۴ ساعت</option>
                  <option value="72h">۷۲ ساعت</option>
                  <option value="7d">۷ روز</option>
                </select>
              </div>
            )}
            {selectedLadder && ladderCost > 0 && (
              <div className="text-[#143A62] text-[1.6vh] mr-4">
                هزینه پله: {ladderCost.toLocaleString()} تومان
              </div>
            )}

            {calculating && (
              <div className="text-center text-[#143A62] text-[1.6vh]">
                در حال محاسبه هزینه‌ها...
              </div>
            )}

            {!calculating &&
              (selectedRenew || selectedSpecial || selectedLadder) && (
                <div className="text-center font-bold text-[#143A62] text-[2vh] mt-2 border-t border-gray-300 pt-2">
                  هزینه کل: {totalCost.toLocaleString()} تومان
                </div>
              )}

            <div className="flex justify-center mt-3">
              <button
                onClick={handleConfirmStep1}
                disabled={!selectedRenew && !selectedSpecial && !selectedLadder}
                className={`px-6 py-2 rounded-md text-[1.8vh] font-semibold transition-colors ${
                  !selectedRenew && !selectedSpecial && !selectedLadder
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-blue-900 text-white hover:bg-blue-800"
                }`}
              >
                تایید
              </button>
            </div>
          </div>
        )}

        {/* ---------- مرحله دوم (روش پرداخت) ---------- */}
        {step === 2 && (
          <div className="flex-1 flex flex-col gap-3 w-3/4 mx-auto">
            <div className="text-center text-[#143A62] text-[1.8vh] font-semibold mb-1">
              مبلغ قابل پرداخت: {totalCost.toLocaleString()} تومان
            </div>

            <RadioOptionStep2
              label="پرداخت از طریق اشتراک"
              value="subscription"
              selectedValue={paymentMethod}
              onChange={setPaymentMethod}
              disabled={true}
              disabledMessage="به زودی"
            />
            <RadioOptionStep2
              label="پرداخت از طریق کیف پول"
              value="wallet"
              selectedValue={paymentMethod}
              onChange={setPaymentMethod}
            />
            <RadioOptionStep2
              label="پرداخت با کارت بانکی"
              value="Bank_card"
              selectedValue={paymentMethod}
              onChange={setPaymentMethod}
            />

            <div className="flex justify-center mt-4">
              <button
                onClick={handleFinalSubmit}
                disabled={processing}
                className={`px-6 py-2 rounded-md text-[1.8vh] font-semibold transition-colors ${
                  processing
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-blue-900 text-white hover:bg-blue-800"
                }`}
              >
                {processing ? "در حال پردازش..." : "ثبت تمدید"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RenewAdPaymentModal;
