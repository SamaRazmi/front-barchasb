"use client";

import HeaderIndex from "@/components/Home/Header";
import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Rules() {
  const router = useRouter();

  return (
    <main className="w-full min-h-screen flex flex-col bg-[#143A62]">
      {/* Header */}
      <HeaderIndex />

      {/* Back Button (زیر هدر) */}
      <div className="relative w-full px-4 pt-[2vh]">
        <button
          onClick={() => router.back()}
          className="absolute top-[0.5vh] md:top-[10.5vh] left-[1rem] z-50"
        >
          <div className="w-[5vh] h-[5vh] rounded-full flex items-center justify-center bg-[#FFFFFF80]">
            <Image
              src="/images/back_arrow.svg"
              alt="Back"
              width={20}
              height={20}
              className="w-[3vh] h-[3vh]"
            />
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex justify-center px-4 pt-[3vh] md:pt-[12vh] py-[5vh]">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-md p-6 md:p-10 text-black leading-8 text-justify overflow-y-auto">
          <h1 className="text-xl md:text-3xl font-bold text-center mb-6 text-[#143A62] ">
            قوانین و مقررات استفاده از سایت
          </h1>

          <p className="mb-6">
            کاربر گرامی، لطفاً پیش از ثبت‌نام و استفاده از خدمات سایت، این
            قوانین و مقررات را با دقت مطالعه کنید. ثبت‌نام و استفاده از سایت به
            معنای پذیرش کامل و بدون قید و شرط این قوانین است.
          </p>

          <div className="space-y-6">
            <div>
              <strong className="text-base md:text-lg font-bold">
                ۱. ثبت‌نام و اطلاعات کاربری
              </strong>
              <p className="text-sm md:text-base leading-7 mt-1 text-gray-700 pr-6">
                • کاربران موظف به وارد کردن اطلاعات صحیح، کامل و به‌روز هستند.
                <br />
                • در صورت هرگونه تغییر اطلاعات (مانند شماره تماس، ایمیل، آدرس)،
                کاربر موظف است آن را در سایت به‌روزرسانی کند.
                <br />
                • حساب کاربری هر فرد، تنها برای استفاده شخصی اوست و به هیچ وجه
                نباید در اختیار دیگران قرار گیرد.
                <br />• مسئولیت حفظ امنیت حساب کاربری (شامل رمز عبور و اطلاعات
                ورود) بر عهدهٔ کاربر است.
              </p>
            </div>

            <div>
              <strong className="text-base md:text-lg font-bold">
                ۲. مسئولیت محتوای آگهی‌ها
              </strong>
              <p className="text-sm md:text-base leading-7 mt-1 text-gray-700 pr-6">
                • تمام آگهی‌ها، شامل خرید و فروش کالا، ارائه خدمات، آگهی‌های
                استخدام و کاریابی توسط کاربران ثبت می‌شوند.
                <br />
                • مسئولیت صحت اطلاعات، قانونی بودن فعالیت و عدم نقض حقوق دیگران
                بر عهدهٔ آگهی‌دهنده است.
                <br />
                • سایت هیچ گونه مسئولیتی در قبال صحت، کیفیت، اصالت، قیمت یا
                عملکرد کالاها و خدمات ارائه شده ندارد.
                <br />• کاربران موظف هستند آگهی‌های خود را به‌صورت شفاف و
                صادقانه ثبت کنند و از ارائه اطلاعات گمراه‌کننده یا کذب خودداری
                نمایند.
              </p>
            </div>

            <div>
              <strong className="text-base md:text-lg font-bold">
                ۳. محتوای غیرمجاز و ممنوع
              </strong>
              <p className="text-sm md:text-base leading-7 mt-1 text-gray-700 pr-6">
                • درج هرگونه محتوای غیرقانونی، غیراخلاقی، توهین‌آمیز، تهدیدآمیز
                یا مغایر با قوانین جمهوری اسلامی ایران ممنوع است.
                <br />
                • ارائه کالاها و خدمات ممنوع، شامل داروهای غیرمجاز، مواد مخدر،
                اسلحه، حیوانات غیرمجاز، آثار هنری یا محصولات ناقض حقوق مالکیت
                معنوی و هرگونه فعالیت غیرقانونی، تخلف محسوب می‌شود.
                <br />• آگهی‌هایی که شامل هرگونه کلاهبرداری، فریب کاربران یا
                تبلیغات اسپم باشند، حذف و حساب کاربری متخلف مسدود خواهد شد.
              </p>
            </div>

            <div>
              <strong className="text-base md:text-lg font-bold">
                ۴. حق ویرایش، تعلیق و حذف آگهی‌ها
              </strong>
              <p className="text-sm md:text-base leading-7 mt-1 text-gray-700 pr-6">
                • سایت حق دارد بدون اطلاع قبلی، هر آگهی که با قوانین سایت یا
                قوانین جاری کشور مغایرت داشته باشد را ویرایش، تعلیق یا حذف کند.
                <br />
                • در صورت تخلف‌های مکرر یا جدی، سایت می‌تواند حساب کاربری کاربر
                را به‌طور دائم مسدود کند.
                <br />• تصمیمات سایت در این زمینه قطعی و الزام‌الاجرا است و
                کاربران حق اعتراض نخواهند داشت.
              </p>
            </div>

            <div>
              <strong className="text-base md:text-lg font-bold">
                ۵. استفاده از خدمات سایت و ممنوعیت سوءاستفاده
              </strong>
              <p className="text-sm md:text-base leading-7 mt-1 text-gray-700 pr-6">
                • کاربران موظف هستند از خدمات سایت به شیوه‌ای قانونی، منصفانه و
                اخلاقی استفاده کنند.
                <br />
                • هرگونه تلاش برای ایجاد اختلال در عملکرد سایت، سوءاستفاده از
                اطلاعات کاربران، ثبت آگهی تکراری، تبلیغات مزاحم یا هر فعالیتی که
                باعث آسیب یا اختلال شود، ممنوع است.
                <br />• سایت حق دارد کاربران خاطی را به صورت موقت یا دائم مسدود
                کند و اقدامات قانونی لازم را در صورت تخلفات جدی انجام دهد.
              </p>
            </div>

            <div>
              <strong className="text-base md:text-lg font-bold">
                ۶. حریم خصوصی و حفاظت از اطلاعات
              </strong>
              <p className="text-sm md:text-base leading-7 mt-1 text-gray-700 pr-6">
                • سایت متعهد است اطلاعات شخصی کاربران را مطابق با سیاست حفظ حریم
                خصوصی، محرمانه نگه دارد و بدون اجازه کاربر در اختیار شخص ثالث
                قرار ندهد، مگر در مواردی که قانوناً الزام وجود داشته باشد.
                <br />
                • کاربران موظف هستند از افشای اطلاعات شخصی دیگران در آگهی‌ها یا
                پیام‌ها خودداری کنند.
                <br />• استفاده از اطلاعات شخصی دیگران برای هرگونه سوءاستفاده،
                نقض قوانین یا تبلیغات بدون اجازه ممنوع است.
              </p>
            </div>

            <div>
              <strong className="text-base md:text-lg font-bold">
                ۷. قوانین مربوط به خرید و فروش، خدمات و کاریابی
              </strong>
              <p className="text-sm md:text-base leading-7 mt-1 text-gray-700 pr-6">
                • کاربران مسئول انجام معامله و توافقات مالی خارج از سایت هستند و
                سایت تنها پلتفرمی برای انتشار آگهی فراهم می‌کند.
                <br />
                • سایت هیچ گونه مسئولیتی در قبال اختلافات مالی، قانونی یا کیفیت
                کالا و خدمات ندارد.
                <br />
                • در بخش استخدام و کاریابی، ارائه اطلاعات نادرست یا فریبنده
                ممنوع است و کاربران موظف‌اند معیارهای واقعی خود را اعلام کنند.
                <br />• تبلیغات شغلی باید با قوانین کار و استخدام کشور مطابقت
                داشته باشند و شرایط غیرقانونی یا تبعیض‌آمیز در آنها درج نشود.
              </p>
            </div>

            <div>
              <strong className="text-base md:text-lg font-bold">
                ۸. حقوق مالکیت معنوی
              </strong>
              <p className="text-sm md:text-base leading-7 mt-1 text-gray-700 pr-6">
                • تمامی محتواهای موجود در سایت، شامل لوگو، تصاویر، متن‌ها و
                طراحی سایت، متعلق به سایت است و کپی‌برداری، بازنشر یا استفاده
                بدون اجازه ممنوع می‌باشد.
                <br />• کاربران نیز موظف‌اند در آگهی‌ها از محتوایی استفاده کنند
                که حقوق مالکیت معنوی دیگران را نقض نکند.
              </p>
            </div>

            <div>
              <strong className="text-base md:text-lg font-bold">
                ۹. تغییر قوانین و مقررات
              </strong>
              <p className="text-sm md:text-base leading-7 mt-1 text-gray-700 pr-6">
                • سایت می‌تواند در هر زمان نسبت به تغییر یا به‌روزرسانی قوانین و
                مقررات اقدام کند.
                <br />• ادامه استفاده کاربران به معنای پذیرش نسخه جدید قوانین
                است.
              </p>
            </div>

            <div>
              <strong className="text-base md:text-lg font-bold">
                ✅ تأیید قوانین
              </strong>
              <p className="text-sm md:text-base leading-7 mt-1 text-gray-700 pr-6">
                با ثبت‌نام و استفاده از سایت، شما موافقت کامل خود را با تمام
                قوانین و مقررات فوق اعلام می‌کنید و مسئولیت رعایت آنها بر عهدهٔ
                شماست.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
