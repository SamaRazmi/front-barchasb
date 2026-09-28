"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import TopBar from "@/components/common/TopBar";
import { toast } from "react-toastify";

const SupportAdminOptions: React.FC = () => {
  const router = useRouter();
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  const handleChat = () => {
    toast.info("به زودی چت با ادمین فعال می‌شود", {
      position: "bottom-right",
      autoClose: 3000,
    });
  };

  const handlePhone = () => {
    setShowPhoneModal(true);
  };

  const closeModal = () => {
    setShowPhoneModal(false);
  };

  const callNumber = () => {
    window.location.href = "tel:02181090737";
  };

  return (
    <>
      {/* TopBar فقط در دسکتاپ */}
      <div className="hidden md:block">
        <TopBar />
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row justify-center items-stretch sm:items-center h-[90%] mt-4">
        <img
          src="/images/bg_support_dashboard.svg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover rounded-[20px]"
          loading="lazy"
        />

        <div className="relative z-10 flex flex-col py-[4vh] sm:flex-row justify-center items-center gap-[1vh] sm:gap-[8vh] md:gap-[10vh] lg:gap-[10vh] px-[2vh] w-full">
          {/* تیکت */}
          <div
            onClick={() => router.push("/dashboard/support/ticket")}
            className="flex flex-col justify-center items-center bg-white rounded-[20px] cursor-pointer shadow-lg hover:shadow-xl transition w-[70%] sm:w-[180px] md:w-[220px] lg:w-[260px] h-[15vh] sm:h-[180px] md:h-[220px] lg:h-[260px]"
          >
            <img
              src="/images/ticket_admin.svg"
              alt="تیکت"
              className="w-[8vh] h-[8vh] md:w-[12vh] md:h-[12vh]"
            />
            <span className="mt-[2vh] sm:mt-[4vh] text-[#143A62E5] font-semibold text-[2vh] md:text-[2.8vh]">
              تیکت
            </span>
          </div>

          {/* چت با ادمین با روبان مورب - فقط تغییر در متن */}
          <div
            onClick={handleChat}
            className="relative flex flex-col justify-center items-center bg-white rounded-[20px] cursor-pointer shadow-lg hover:shadow-xl transition w-[70%] sm:w-[180px] md:w-[220px] lg:w-[260px] h-[15vh] sm:h-[180px] md:h-[220px] lg:h-[260px] overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-[150%] h-10 bg-orange-500 transform -rotate-45 -translate-x-[25%] translate-y-[20%] flex items-center justify-center shadow-md z-10">
              {/* حذف transform rotate-45 تا متن هم‌زاویه با نوار شود */}
              <span className="text-white font-bold text-[1.6vh] md:text-[2.4vh] tracking-wider pt-1">
                به زودی
              </span>
            </div>
            <img
              src="/images/chat_admin.svg"
              alt="چت"
              className="w-[8vh] h-[8vh] md:w-[12vh] md:h-[12vh]"
            />
            <span className="mt-[2vh] sm:mt-[4vh] text-[#143A62E5] font-semibold text-[2vh] md:text-[2.8vh]">
              چت با ادمین
            </span>
          </div>

          {/* تماس تلفنی */}
          <div
            onClick={handlePhone}
            className="flex flex-col justify-center items-center bg-white rounded-[20px] cursor-pointer shadow-lg hover:shadow-xl transition w-[70%] sm:w-[180px] md:w-[220px] lg:w-[260px] h-[15vh] sm:h-[180px] md:h-[220px] lg:h-[260px]"
          >
            <img
              src="/images/tel_admin.svg"
              alt="تماس"
              className="w-[8vh] h-[8vh] md:w-[12vh] md:h-[12vh]"
            />
            <span className="mt-[2vh] sm:mt-[4vh] text-[#143A62E5] font-semibold text-[2vh] md:text-[2.8vh]">
              تماس تلفنی
            </span>
          </div>
        </div>
      </div>

      {/* مودال شماره تماس */}
      {showPhoneModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm transform transition-all duration-300 scale-100 opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative p-6 text-center">
              <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-[#143A62]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                تماس با پشتیبانی
              </h3>
              <p className="text-gray-500 text-sm mb-4">شماره تماس پشتیبانی</p>
              <div
                onClick={callNumber}
                className="block bg-gray-100 rounded-xl py-3 px-4 mb-6 text-lg font-mono text-[#143A62] font-bold hover:bg-gray-200 transition-colors cursor-pointer"
                dir="ltr"
              >
                ۰۲۱۸۱۰۹۰۷۳۷
              </div>
              <button
                onClick={closeModal}
                className="w-full bg-[#143A62] text-white py-2.5 rounded-xl hover:bg-[#0f2a4a] transition-colors font-medium"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SupportAdminOptions;
