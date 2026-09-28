"use client";

import Footer from "@/components/Home/Footer";
import Header from "@/components/Home/Header";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const socialMedia = [
  {
    href: "https://facebook.com/yourpage",
    src: "/images/facebook.png",
    alt: "Facebook",
  },
  {
    href: "https://instagram.com/yourpage",
    src: "/images/instagram.png",
    alt: "Instagram",
  },
  {
    href: "https://t.me/yourchannel",
    src: "/images/telegram.png",
    alt: "Telegram",
  },
];

const ContactPage: React.FC = () => {
  return (
    <div className="w-screen min-h-screen flex flex-col justify-between bg-slate-50">
      <Header />

      <div className="w-full md:pt-[8vh] px-[30px]">
        {/* عنوان */}
        <div className="text-center">
          <h1 className="text-[4vh] font-bold text-[#143A62]">تماس با ما</h1>
          <p className="text-gray-500 mt-1 md:mb-0 mb-2 text-sm">
            برای ارتباط با ما می‌توانید از اطلاعات زیر استفاده کنید
          </p>
        </div>

        {/* ===== کانتینر اصلی: ستونی در موبایل، ردیفی در دسکتاپ ===== */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          {/* ===== ۱. عکس (فقط در دسکتاپ) ===== */}
          <div className="relative hidden md:flex">
            <div className="absolute -inset-10 bg-[#143A62]/10 blur-3xl rounded-full"></div>
            <Image
              src="/images/cont.png"
              alt="contactUs"
              width={250}
              height={250}
              className="relative drop-shadow-xl"
            />
          </div>

          {/* ===== ۲. باکس اطلاعات (همیشه نمایش داده می‌شود) ===== */}
          <div
            className="bg-white/70 backdrop-blur-md border border-[#143A62]/10
            md:px-12 px-2 py-2 md:py-6 rounded-[26px]
            shadow-[0_15px_40px_rgba(0,0,0,0.06)]
            flex flex-col gap-4 w-[90vw] md:w-[450px]"
          >
            {/* آدرس */}
            <div className="flex items-center gap-1">
              <span className="text-xl">📍</span>
              <div className="flex gap-2">
                <p className="font-medium text-[#143A62]">آدرس :</p>
                <p className="text-gray-600">
                  کارخانه نوآوری شیراز، طبقه سوم، دفتر A4+
                </p>
              </div>
            </div>

            {/* کد پستی */}
            <div className="flex items-center gap-1">
              <span className="text-xl">📍</span>
              <div className="flex gap-2">
                <p className="font-medium text-[#143A62]">کد پستی:</p>
                <p className="text-gray-600">7154815728</p>
              </div>
            </div>

            {/* شماره تلفن */}
            <div className="flex items-center gap-1">
              <span className="text-xl">☎️</span>
              <div className="flex gap-2">
                <p className="font-medium text-[#143A62]">شماره ثابت :</p>
                <p className="text-gray-600">02191090737</p>
              </div>
            </div>

            {/* شبکه‌های اجتماعی */}
            <div className="flex flex-col gap-4">
              <p className="font-medium text-[#143A62]">شبکه های اجتماعی</p>
              <div className="flex gap-5">
                {socialMedia.map((s, i) => (
                  <Link
                    key={i}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.alt}
                    className="transition-all duration-300
                    hover:scale-110 hover:-translate-y-1
                    bg-white shadow-sm
                    rounded-full p-2 h-[42px] w-[42px]
                    flex items-center justify-center"
                  >
                    <Image src={s.src} alt={s.alt} width={24} height={24} />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ===== ۳. نقشه (همیشه نمایش داده می‌شود) ===== */}
          <div className="relative flex w-[90vw] md:w-[300px] h-[250px] rounded-2xl overflow-hidden shadow-lg border border-[#143A62]/10 mb-[5vh] md:mb-[0.2vh]">
            <iframe
              src="https://maps.google.com/maps?q=کارخانه+نوآوری+شیراز&t=&z=17&ie=UTF8&iwloc=&output=embed&language=fa"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0"
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ContactPage;
