"use client";

import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  getEmployerAds,
  getJobSeekerAds,
  getSellerAds,
  // getDigitalAds  ← حذف شد
} from "@/api/apiGetFormsAds";

import {
  translate,
  educationMap,
  cooperationTypeMap,
  skillMap,
  sellerStatusMap,
  sellerUsageMap,
  benefitMap,
} from "@/constants/translations";

/* ================= TYPES ================= */

export interface CardItem {
  id: string;
  category: "EmployerAd" | "JobSeekerAd" | "SellerAd";
  title: string;
  personName?: string;
  experience?: string;
  contactName?: string;
  positions?: string;
  skills?: string;
  salary?: string;
  location?: string;
  details?: string;
  jobType?: string;
  img: string;
}

interface CardsContextType {
  jobSeekers: CardItem[];
  employers: CardItem[];
  ads: CardItem[];
}

/* ================= CONTEXT ================= */

const CardsContext = createContext<CardsContextType | null>(null);

export const useCards = () => {
  const context = useContext(CardsContext);

  if (!context) {
    throw new Error("useCards must be used within CardsProvider");
  }

  return context;
};

const defaultImg = "/images/user.png";

/* ================= PROVIDER ================= */

export const CardsProvider = ({ children }: { children: ReactNode }) => {
  /* ---------- تعریف توابع wrapper ---------- */
  const fetchJobSeekerAds = async () => {
    const result = await getJobSeekerAds(1, 100);
    return result.data || [];
  };

  const fetchEmployerAds = async () => {
    const result = await getEmployerAds(1, 100);
    return result.data || [];
  };

  const fetchSellerAds = async () => {
    const result = await getSellerAds(1, 100);
    return result.data || [];
  };

  // تابع fetchDigitalAds حذف شد

  /* ---------- queries ---------- */

  const { data: jobSeekerAds = [] } = useQuery({
    queryKey: ["jobSeekerAds"],
    queryFn: fetchJobSeekerAds,
  });

  const { data: employerAds = [] } = useQuery({
    queryKey: ["employerAds"],
    queryFn: fetchEmployerAds,
  });

  const { data: sellerAds = [] } = useQuery({
    queryKey: ["sellerAds"],
    queryFn: fetchSellerAds,
  });

  // useQuery مربوط به digitalAds حذف شد

  /* ================= MAPPINGS ================= */

  /* ---------- Job Seekers ---------- */
  const jobSeekers: CardItem[] = Array.from(
    new Map(
      jobSeekerAds
        .filter((ad: any) => ad.adStatus === "approved")
        .map((ad: any) => [ad.id, ad]),
    ).values(),
  ).map((ad: any) => ({
    id: ad.id,
    category: "JobSeekerAd",

    title: ad.name,

    experience: ad.education ? translate(ad.education, educationMap) : "",

    skills: Array.isArray(ad.skills)
      ? ad.skills.length > 0
        ? ad.skills
            .map((skill: string) => translate(skill, skillMap))
            .join("، ")
        : ""
      : "",

    jobType: ad.jobType ? translate(ad.jobType, cooperationTypeMap) : "",

    location: ad.state && ad.city ? `${ad.state} - ${ad.city}` : "",

    img: ad.images?.find((i: any) => i.isMain)?.url || defaultImg,
  }));

  /* ---------- Employers ---------- */
  const employers: CardItem[] = Array.from(
    new Map(
      employerAds
        .filter((ad: any) => ad.adStatus === "approved")
        .map((ad: any) => [ad.id, ad]),
    ).values(),
  ).map((ad: any) => ({
    id: ad.id,
    category: "EmployerAd",

    title: ad.title,
    contactName: ad.name,

    positions: ad.category ? translate(ad.category, skillMap) : "",

    skills: ad.cooperationType
      ? translate(ad.cooperationType, cooperationTypeMap)
      : "",

    location: ad.state && ad.city ? `${ad.state} - ${ad.city}` : "",

    img: ad.images?.find((i: any) => i.isMain)?.url || defaultImg,
  }));

  /* ---------- Seller Ads (فقط فروشندگان، بدون دیجیتال) ---------- */
  const ads: CardItem[] = Array.from(
    new Map(
      sellerAds
        .filter((ad: any) => ad.adStatus === "approved")
        .map((ad: any) => [ad.id, ad]),
    ).values(),
  ).map((ad: any) => {
    const salary =
      ad.priceIRT != null && ad.priceIRT !== ""
        ? `${Number(ad.priceIRT).toLocaleString("fa-IR")} تومان`
        : ad.minBudget != null && ad.minBudget !== ""
          ? `${Number(ad.minBudget).toLocaleString("fa-IR")} تومان`
          : "";

    return {
      id: ad.id,
      category: "SellerAd",

      title: ad.title,

      salary,

      location: ad.state && ad.city ? `${ad.state} - ${ad.city}` : "",

      details: [
        ad.status ? translate(ad.status, sellerStatusMap) : null,
        ad.usage ? translate(ad.usage, sellerUsageMap) : null,
      ]
        .filter(Boolean)
        .join(" | "),

      img: ad.images?.find((i: any) => i.isMain)?.url || defaultImg,
    };
  });

  return (
    <CardsContext.Provider
      value={{
        jobSeekers,
        employers,
        ads,
      }}
    >
      {children}
    </CardsContext.Provider>
  );
};
