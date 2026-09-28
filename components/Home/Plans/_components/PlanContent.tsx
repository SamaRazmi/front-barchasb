"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";

interface PlanContentProps {
  topImage: string;
  title: string;
  price: string;
  isOpen: boolean;
  isFeatured: boolean;
  onClick: () => void;
  features: string[];
  onGatewayPay: () => void;
  onWalletPay: () => void;
}

const PlanContent: React.FC<PlanContentProps> = ({
  topImage,
  title,
  price,
  isOpen,
  onClick,
  isFeatured,
  features,
}) => {
  const router = useRouter();
  const isLoggedIn = useSelector((state: RootState) => state.loged.value === 1);

  const handleSubscribe = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoggedIn) {
      router.push("/dashboard/billing");
    } else {
      router.push("/login");
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
      flex
      ${isOpen ? "sm:flex-1 flex-[3]" : "flex-1"}
      min-w-0
      transition-all duration-500 ease-in-out
      relative flex flex-col items-center
      rounded-2xl bg-black/5 backdrop-blur-[12px]
      border border-white/60
      shadow-[inset_0_20px_40px_rgba(255,255,255,0.35)]
      cursor-pointer
      px-2 sm:px-6
      py-6 sm:py-8
      ${isFeatured ? "sm:-mt-[100px] sm:mb-[100px]" : "mt-0"}
    `}
    >
      <div className="flex flex-col items-center w-full flex-1">
        <div className="h-[60px] shrink-0 mb-4">
          <Image
            src={topImage}
            alt={title}
            width={60}
            height={60}
            className="h-full object-contain"
          />
        </div>

        <div
          className={`
          transition-all duration-300 text-center
          font-extrabold text-[#143A62] text-[clamp(14px,4vw,22px)]
          ${
            !isOpen
              ? "rotate-180 [writing-mode:vertical-rl] mt-20 sm:rotate-0 sm:[writing-mode:horizontal-tb] sm:mt-2"
              : "mt-2"
          }
        `}
        >
          {title}
        </div>

        <div
          className={` pt-5
          w-full items-center justify-center grid grid-rows-1
          ${isOpen ? "flex flex-col" : "hidden sm:grid sm:grid-rows-1 sm:flex-col "}
        `}
        >
          {features.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="mb-4 flex items-center gap-2"
            >
              <Image
                src="/images/check_green.svg"
                alt="check"
                width={22}
                height={22}
                className="h-5 w-5 shrink-0"
              />
              <span className="text-black/70 text-[clamp(12px,1.1vw,16px)] leading-6 text-center whitespace-nowrap">
                {item}
              </span>
            </div>
          ))}
        </div>

        <div className="hidden sm:block flex-[1]"></div>

        <div
          className={`
          w-full transition-all duration-500 mt-auto
          ${isOpen ? "opacity-100 flex flex-col" : "hidden sm:flex sm:flex-col"}
        `}
        >
          <div className="mb-3 text-center font-bold text-[#143A62] text-[18px]">
            {price}
          </div>

          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={handleSubscribe}
              className="h-10 w-full rounded-xl bg-[#143A62] text-white text-[12px] font-bold"
            >
              خرید اشتراک
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(PlanContent);
