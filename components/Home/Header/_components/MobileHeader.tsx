"use client";

import Image from "next/image";
import { Button } from "@mui/material";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DrawerRes from "./DrawerRes";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { userLogedTrue } from "@/store/slices/logedSlice";
import { setRole } from "@/store/slices/roleSlice";
import { useUser } from "@/context/UserContext";

interface HeaderProps {
  className?: string;
}

const MobileHeader: React.FC<HeaderProps> = ({ className }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  // استفاده از UserContext
  const { user, loading: userLoading } = useUser();
  const isLoggedIn = !!user;

  // همگام‌سازی Redux با Context (اختیاری)
  useEffect(() => {
    if (user) {
      dispatch(
        userLogedTrue({
          name: user.name || "",
          lastName: user.lastName || "",
        }),
      );
      dispatch(setRole(user.role));
    }
  }, [user, dispatch]);

  const handleSignUp = () => router.push("/register");
  const handleLogin = () => router.push("/login");
  const handleHamburger = () => setDrawerOpen(true);
  const handleCloseDrawer = () => setDrawerOpen(false);

  // داده‌های بنر چرخشی
  const bannerItems = [
    {
      text: "بیا برچسب کلاب ، بازی کن ، امتیاز بگیر ، پولش کن",
      href: "/club",
      icon: "/images/banerClub.svg",
    },
    {
      text: "آموزش گام‌به‌گام؛ با برچسب حرفه‌ای شو",
      href: "/education",
      icon: "/images/banerrSchool.svg",
    },
    {
      text: "تنوع بی‌پایان؛ در برچسب‌شاپ همه چی هست",
      href: "/shop",
      icon: "/images/banerShop.svg",
    },
    {
      text: "ثبت سریع آگهی و هزاران فرصت شغلی در انتظار توست",
      href: "/dashboard",
      icon: "/images/banerAd.svg",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % bannerItems.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // عرض بنر به صورت ریسپانسیو (می‌توانید تنظیم کنید)
  const bannerWidth = "55vw";
  const bannerFontSize = "1.2vh"; // کمی بزرگ‌تر برای خوانایی بهتر

  return (
    <>
      <nav
        className={`${className} flex items-center justify-between w-full px-2 py-2 bg-white rtl md:hidden`}
        style={{ boxShadow: "0px 0px 4px 0px #0000001A" }}
      >
        {/* لوگو */}
        <div style={{ width: "8vh", height: "8vh", position: "relative" }}>
          <Image
            src="/images/Logo.png"
            alt="لوگو"
            fill
            style={{ objectFit: "contain" }}
          />
        </div>

        {/* بنر چرخشی */}
        <Link
          href={bannerItems[activeIndex].href}
          className="flex items-center justify-center gap-2 px-2 py-2 rounded-lg transition-all duration-500 bg-gradient-to-r from-[#143A62] to-[#00B6FF] flex-shrink-0 mr-[-2%]"
          style={{
            width: bannerWidth,
            minWidth: bannerWidth,
            maxWidth: bannerWidth,
            textDecoration: "none",
          }}
        >
          <span
            className="text-white font-medium whitespace-nowrap overflow-hidden text-ellipsis"
            style={{ fontSize: bannerFontSize }}
          >
            {bannerItems[activeIndex].text}
          </span>

          <Image
            src={bannerItems[activeIndex].icon}
            alt="icon"
            width={20}
            height={20}
            className="shrink-0"
          />
        </Link>

        {/* دکمه‌های سمت چپ */}
        <div className="flex items-center gap-4">
          {/* نمایش «ثبت نام» فقط زمانی که نه لاگین است و نه در حال بارگذاری */}
          {!isLoggedIn && !userLoading && (
            <Button
              onClick={handleSignUp}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                fontWeight: 500,
                textTransform: "none",
                minWidth: "unset",
                padding: 0,
                color: "#143A62",
                lineHeight: "40px",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              ثبت نام
            </Button>
          )}

          {/* دکمه «ورود/داشبورد» با رفتار پویا */}
          <Button
            onClick={() => {
              if (isLoggedIn) {
                router.push("/dashboard");
              } else {
                router.push("/login");
              }
            }}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              fontWeight: 500,
              textTransform: "none",
              minWidth: "unset",
              padding: 0,
              color: "#143A62",
              lineHeight: "40px",
            }}
          >
            {isLoggedIn ? "میزکار" : "ورود"}
          </Button>

          {/* منوی همبرگر */}
          <div
            className="relative w-[20px] h-[15px] cursor-pointer"
            onClick={handleHamburger}
          >
            <Image
              src="/images/humberger_menu.png"
              alt="منوی همبرگر"
              fill
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>
      </nav>

      {/* دراور (منوی کشویی) */}
      <DrawerRes open={drawerOpen} onClose={handleCloseDrawer} />
    </>
  );
};

export default MobileHeader;
