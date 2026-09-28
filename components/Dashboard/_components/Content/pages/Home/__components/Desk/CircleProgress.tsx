import React, { useState, useEffect } from "react";
import { getWalletBalance } from "@/api/apiWallet";

const CircleProgress: React.FC = () => {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // stateهای مربوط به اندازه و استایل
  const [circleSize, setCircleSize] = useState(70);
  const [strokeWidth, setStrokeWidth] = useState(6);
  const [paddingClass, setPaddingClass] = useState("py-2 px-2");
  const [titleFontClass, setTitleFontClass] = useState("text-[10px]");
  const [percentFontClass, setPercentFontClass] = useState("text-[10px]");
  const [wrapperBg, setWrapperBg] = useState("bg-transparent");
  const [cardRound, setCardRound] = useState("rounded-lg");
  const [marginBottom, setMarginBottom] = useState("");

  // دریافت موجودی کیف پول
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const data = await getWalletBalance();
        setBalance(data.balance ?? 0);
      } catch (error) {
        console.warn("⚠️ خطا در دریافت موجودی:", error);
        setBalance(0);
      } finally {
        setLoading(false);
      }
    };
    fetchBalance();
  }, []);

  // تنظیم اندازه‌ها بر اساس ابعاد صفحه
  useEffect(() => {
    const updateSizes = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (width >= 1250) {
        const newCircleSize = height * 0.2;
        setCircleSize(newCircleSize);
        setStrokeWidth(15);
        setPaddingClass("py-6 px-6");
        setTitleFontClass("text-[2vh]");
        setPercentFontClass("text-[12px]"); // کوچک‌تر
        setWrapperBg("bg-gray-100");
        setCardRound("rounded-[20px]");
      } else if (width >= 780) {
        const newCircleSize = height * 0.15;
        setCircleSize(newCircleSize);
        setStrokeWidth(10);
        setPaddingClass("py-10 px-1");
        setTitleFontClass("text-[1.6vh]");
        setPercentFontClass("text-[12px]"); // کوچک‌تر
        setWrapperBg("bg-gray-100");
        setCardRound("rounded-[20px]");
      } else if (width >= 640) {
        setCircleSize(70);
        setStrokeWidth(8);
        setPaddingClass("py-3 px-6");
        setTitleFontClass("text-xs");
        setPercentFontClass("text-[10px]"); // به جای text-xs
        setWrapperBg("bg-transparent");
        setCardRound("rounded-lg");
        setMarginBottom("");
      } else {
        setCircleSize(65);
        setStrokeWidth(6);
        setPaddingClass("py-2 px-8");
        setTitleFontClass("text-[9px]");
        setPercentFontClass("text-[7px]"); // به جای text-[9px]
        setWrapperBg("bg-transparent");
        setCardRound("rounded-lg");
        setMarginBottom("");
      }
    };

    updateSizes();
    window.addEventListener("resize", updateSizes);
    return () => window.removeEventListener("resize", updateSizes);
  }, []);

  const percent = 100;
  const radius = (circleSize - strokeWidth) / 2;
  const center = circleSize / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return (
    <div className={`flex w-full items-center justify-start ${wrapperBg}`}>
      <div
        className={`bg-white ${cardRound} ${paddingClass} flex flex-col items-center justify-center ${marginBottom} relative shadow-sm`}
      >
        <div className={`text-[#143A62] font-semibold ${titleFontClass} mb-2`}>
          مانده کیف پول
        </div>

        <div className="relative flex items-center justify-center">
          <svg width={circleSize} height={circleSize}>
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="#e5e7eb"
              strokeWidth={strokeWidth}
              fill="none"
            />
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="#802183ff"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform={`rotate(-90 ${center} ${center})`}
            />
          </svg>

          {/* نمایش موجودی با اندازه کوچک‌تر */}
          <div
            className={`absolute text-[#802183ff] font-bold ${percentFontClass}`}
          >
            {loading ? "..." : `${balance.toLocaleString()} تومان`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CircleProgress;
