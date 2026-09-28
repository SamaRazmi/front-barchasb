"use client";

import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import Image from "next/image";
import CircleProgress from "./CircleProgress";
import StatsCard from "./StatsCard";
import BarChart from "./BarChart";

export default function MainPanel() {
  const router = useRouter();
  const isLoggedIn = useSelector((state: RootState) => state.loged.value === 1);

  const handleEmployersAds = () => {
    if (isLoggedIn) {
      router.push("/dashboard/ads?activeTab=karfarma");
    } else {
      router.push("/register");
    }
  };

  const handleJobSeekersAds = () => {
    if (isLoggedIn) {
      router.push("/dashboard/ads?activeTab=karjo");
    } else {
      router.push("/register");
    }
  };

  return (
    <div className="flex-1 w-full bg-[#F5F5F5] rounded-[16px] p-4 h-full flex flex-col">
      {/* ردیف اول: دو دکمه */}
      <div className="flex items-start w-full">
        <div
          onClick={handleEmployersAds}
          className="flex items-center gap-2 pl-[4vh] pr-[2vh] h-[7vh] bg-[#143A62] rounded-xl cursor-pointer shadow-md"
        >
          <Image
            src="/images/employers.svg"
            alt="Employers"
            width={20}
            height={20}
          />
          <span className="text-white sm:text-[2vh] lg:text-[2.5vh] font-normal whitespace-nowrap text-ellipsis">
            آگهی کارفرمایان
          </span>
        </div>

        <div
          onClick={handleJobSeekersAds}
          className="flex items-center gap-2 h-[7vh] bg-[#143A62] rounded-xl pl-[4vh] pr-[2vh] cursor-pointer shadow-md mr-[0.8vh] ml-[0.2vh]"
        >
          <Image src="/images/employers.svg" alt="Ads" width={20} height={20} />
          <span className="text-white sm:text-[2vh] lg:text-[2.5vh] font-normal whitespace-nowrap text-ellipsis">
            آگهی کارجویان
          </span>
        </div>
      </div>

      {/* ردیف دوم: StatsCard (راست، پهن‌تر) و CircleProgress (چپ، هم‌تراز عمودی) */}
      <div className="flex flex-row items-stretch gap-2 mt-1">
        {/* ستون StatsCard با بیشترین عرض ممکن */}
        <div className="flex-1">
          <StatsCard />
        </div>

        {/* ستون CircleProgress با عرض محتوایی و در مرکز عمودی */}
        <div className="flex items-center flex-shrink-0">
          <CircleProgress />
        </div>
      </div>

      {/* کارت نمودار */}
      <div className="flex-1 rounded-[16px] overflow-auto mt-2">
        <BarChart />
      </div>
    </div>
  );
}
