// components/DepositContent.tsx
import React, { useState } from "react";
import { depositWallet } from "@/api/apiWallet";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface DepositContentProps {
  onBack: () => void;
}

const DepositContent: React.FC<DepositContentProps> = ({ onBack }) => {
  const [amount, setAmount] = useState<string>("");
  const [gateway, setGateway] = useState<"zarinpal" | "sep">("zarinpal");
  const [loading, setLoading] = useState<boolean>(false);

  const formatNumber = (num: string): string => {
    if (!num) return "";
    return Number(num).toLocaleString("en-US");
  };

  const parseNumber = (value: string): string => {
    return value.replace(/\D/g, "");
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parseNumber(e.target.value);
    setAmount(raw);
  };

  const handleConfirm = async () => {
    const numericAmount = parseFloat(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      toast.warning("لطفاً مبلغ معتبر وارد کنید.", {
        position: "top-center",
        autoClose: 3000,
        style: { background: "#dc2626", color: "#ffffff" },
      });
      return;
    }

    setLoading(true);
    try {
      const result = await depositWallet(numericAmount);
      if (result.paymentUrl) {
        toast.success("در حال انتقال به درگاه پرداخت...", {
          position: "top-center",
          autoClose: 2000,
          style: { background: "#16a34a", color: "#ffffff" },
        });
        setTimeout(() => {
          window.location.href = result.paymentUrl;
        }, 1500);
      } else {
        toast.error("آدرس درگاه دریافت نشد.", {
          position: "top-center",
          autoClose: 3000,
          style: { background: "#dc2626", color: "#ffffff" },
        });
      }
    } catch (error: any) {
      console.error("Deposit error:", error);
      const errorMsg = error.message || "خطا در ارتباط با سرور.";
      if (error.status === 401) {
        toast.error("لطفاً وارد حساب کاربری خود شوید.", {
          position: "top-center",
          autoClose: 3000,
          style: { background: "#dc2626", color: "#ffffff" },
        });
      } else {
        toast.error(errorMsg, {
          position: "top-center",
          autoClose: 3000,
          style: { background: "#dc2626", color: "#ffffff" },
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-full rounded-[20px] shadow-[1px_1px_8px_0px_#00000033] overflow-hidden flex items-center justify-center py-16">
      <img
        src="/images/bg_wallet_billing.svg"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />

      <button
        onClick={onBack}
        className="absolute top-4 left-4 z-10 bg-white/80 hover:bg-white rounded-full p-1.5 md:p-2 shadow-md transition-all"
        aria-label="بازگشت"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 md:h-6 md:w-6 text-[#143A62]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <div className="relative flex flex-col items-center justify-center space-y-3 md:space-y-6 w-full max-w-xs md:max-w-md px-3 md:px-4">
        <div className="text-[#143A62] font-bold text-base md:text-xl">
          افزایش اعتبار کیف پول
        </div>

        <div className="w-full">
          <label className="block text-[#143A62] font-medium mb-1 text-right text-xs md:text-base">
            مبلغ (تومان)
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={amount ? formatNumber(amount) : ""}
            onChange={handleAmountChange}
            placeholder="مبلغ واریزی را وارد کنید"
            className="w-full px-3 py-1.5 md:px-4 md:py-3 text-center text-[#143A62] font-bold text-sm md:text-base bg-[#143A620D] rounded-xl outline-none focus:ring-2 focus:ring-[#143A62] border border-transparent focus:border-[#143A62] transition"
            dir="rtl"
          />
        </div>

        <div className="w-full">
          <span className="block text-[#143A62] font-medium mb-1.5 md:mb-2 text-right text-xs md:text-base">
            انتخاب درگاه پرداخت
          </span>
          <div className="grid grid-cols-2 gap-1.5 md:gap-4">
            <div
              className={`rounded-2xl p-1.5 md:p-4 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                gateway === "zarinpal"
                  ? "border-2 border-[#143A62] bg-gradient-to-br from-[#143A620D] to-white shadow-lg shadow-[#143A62]/20"
                  : "border-2 border-gray-200 bg-white hover:border-gray-400 hover:shadow-md"
              }`}
              onClick={() => setGateway("zarinpal")}
            >
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 md:w-14 md:h-14 rounded-full bg-[#143A62] flex items-center justify-center text-white font-bold text-base md:text-2xl shadow-md mb-0.5 md:mb-2">
                  زر
                </div>
                <span className="font-bold text-[#143A62] text-[10px] md:text-sm">
                  زرین‌پال
                </span>
                <p className="text-[8px] md:text-xs text-gray-500 mt-0 md:mt-1 text-center leading-relaxed">
                  پرداخت امن و آنی
                </p>
                <div className="mt-0.5 md:mt-2">
                  <input
                    type="radio"
                    name="gateway"
                    value="zarinpal"
                    checked={gateway === "zarinpal"}
                    onChange={() => setGateway("zarinpal")}
                    className="w-2.5 h-2.5 md:w-4 md:h-4 text-[#143A62] focus:ring-[#143A62]"
                  />
                </div>
              </div>
            </div>

            <div
              className={`rounded-2xl p-1.5 md:p-4 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                gateway === "sep"
                  ? "border-2 border-[#143A62] bg-gradient-to-br from-[#143A620D] to-white shadow-lg shadow-[#143A62]/20"
                  : "border-2 border-gray-200 bg-white hover:border-gray-400 hover:shadow-md"
              }`}
              onClick={() => setGateway("sep")}
            >
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 md:w-14 md:h-14 rounded-full bg-[#143A62] flex items-center justify-center text-white font-bold text-base md:text-2xl shadow-md mb-0.5 md:mb-2">
                  سپ
                </div>
                <span className="font-bold text-[#143A62] text-[10px] md:text-sm">
                  سپ
                </span>
                <p className="text-[8px] md:text-xs text-gray-500 mt-0 md:mt-1 text-center leading-relaxed">
                  پرداخت با کارت بانکی
                </p>
                <div className="mt-0.5 md:mt-2">
                  <input
                    type="radio"
                    name="gateway"
                    value="sep"
                    checked={gateway === "sep"}
                    onChange={() => setGateway("sep")}
                    className="w-2.5 h-2.5 md:w-4 md:h-4 text-[#143A62] focus:ring-[#143A62]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full bg-[#143A62] text-white font-bold text-sm md:text-lg py-1.5 md:py-3 rounded-xl transition-all hover:bg-[#0f2a4a] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-4 w-4 md:h-5 md:w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              در حال پردازش...
            </span>
          ) : (
            "پرداخت"
          )}
        </button>
      </div>

      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default DepositContent;
