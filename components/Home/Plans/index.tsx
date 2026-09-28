"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import PlanContent from "./_components/PlanContent";
import MonthlyFilter from "./_components/MonthlyFilter";

import { buySubscription, getPlans, Plan } from "@/api/apiPlans";
import type { RootState } from "@/store/store";
import { userLogedTrue } from "@/store/slices/logedSlice";
// import { setRole } from "@/store/slices/roleSlice"; // فعلا غیرفعال شده
import { get } from "@/api/apiClient";

type PlanType = "basic" | "silver" | "gold";
type DurationType = 1 | 3 | 6;

const PLAN_UI = {
  basic: {
    title: "پلن برنزی",
    image: "/images/bronze_top.svg",
    wrapperClass: "sm:-translate-y-1",
  },
  gold: {
    title: "پلن طلایی",
    image: "/images/gold_top.svg",
    wrapperClass: " sm:-translate-y-20",
  },
  silver: {
    title: "پلن نقره‌ای",
    image: "/images/silver_top.svg",
    wrapperClass: "sm:-translate-y-1",
  },
} satisfies Record<
  PlanType,
  { title: string; image: string; wrapperClass: string }
>;

const getDurationText = (duration: DurationType) => {
  switch (duration) {
    case 1:
      return "1 ماهه";
    case 3:
      return "3 ماهه";
    case 6:
      return "6 ماهه";
    default:
      return "";
  }
};

const getPlanText = (planType: PlanType) => {
  switch (planType) {
    case "gold":
      return "طلایی";
    case "silver":
      return "نقره‌ای";
    case "basic":
      return "برنزی";
    default:
      return "";
  }
};

const getPlanToastBackground = (planType: PlanType) => {
  switch (planType) {
    case "gold":
      return "linear-gradient(135deg,#D4AF37,#F7E27E,#B8860B)";
    case "silver":
      return "linear-gradient(135deg,#C0C0C0,#ECECEC,#8E8E8E)";
    case "basic":
      return "linear-gradient(135deg,#CD7F32,#E6B17A,#8C5523)";
    default:
      return "linear-gradient(135deg,#143A62,#1E4E82,#0F2F4F)";
  }
};

const getFeatureLabel = (key: string) => {
  const featureMap: Record<string, string> = {
    maxAds: "حداکثر آگهی",
    specialAds: "آگهی ویژه",
    ladder: "نردبان",
    tests: "افزونه تست",
    digitalAds: "آگهی مناقصه ای",
    specialDisplay: "نمایش ویژه",
  };

  return featureMap[key] || key;
};

const createFeatures = (plan?: Plan) => {
  if (!plan) return [];

  return Object.entries(plan.limits).map(
    ([key, value]) => `${getFeatureLabel(key)}: ${value}`,
  );
};

const formatPrice = (price?: number) => {
  if (!price) return "";
  return `${price.toLocaleString("fa-IR")} تومان`;
};

const getToastStyle = (background: string) => {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  return {
    background,
    color: "#fff",
    fontWeight: "bold",
    fontSize: isMobile ? "2vh" : "2.8vh",
    borderRadius: "2vh",
    minHeight: isMobile ? "8vh" : "10vh",
    width: isMobile ? "92vw" : "32vw",
    maxWidth: "430px",
    padding: isMobile ? "1.2vh" : "1.8vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center" as const,
    direction: "rtl" as const,
    boxShadow: "0 1vh 3vh rgba(0,0,0,0.25)",
  };
};

const showPlanToast = (planType: PlanType, duration: DurationType) => {
  toast.success(
    `خرید پلن ${getPlanText(planType)} ${getDurationText(duration)} با موفقیت ثبت شد`,
    {
      position: "top-center",
      autoClose: 3500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progressClassName: "!bg-white",
      style: getToastStyle(getPlanToastBackground(planType)),
    },
  );
};

const showErrorToast = (message: string) => {
  toast.error(message, {
    position: "top-center",
    autoClose: 3500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progressClassName: "!bg-white",
    style: {
      ...getToastStyle("linear-gradient(135deg,#B71C1C,#E53935,#7F0000)"),
      boxShadow: "0 1vh 3vh rgba(183,28,28,0.35)",
    },
  });
};

const Plans = () => {
  const [activePlan, setActivePlan] = useState<PlanType>("gold");
  const [duration, setDuration] = useState<DurationType>(1);
  const [checkedLogin, setCheckedLogin] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch();

  const isLoggedIn = useSelector((state: RootState) => state.loged.value === 1);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await get<{
          user?: { name: string; lastName: string; role?: string };
        }>("/auth/me");
        if (data?.user) {
          dispatch(
            userLogedTrue({
              name: data.user.name || "",
              lastName: data.user.lastName || "",
            }),
          );
          // فعلاً role نداریم، این خط رو کامنت کردم تا خطا نده
          // dispatch(setRole(data.user.role));
        }
      } catch (error) {
        console.error("Fetch user failed:", error);
      } finally {
        setCheckedLogin(true);
      }
    };

    fetchUser();
  }, [dispatch]);

  const { data: plans = [] } = useQuery({
    queryKey: ["plans"],
    queryFn: getPlans,
  });

  const selectedPlans = useMemo(() => {
    return plans.filter((item) => item.durationMonths === duration);
  }, [plans, duration]);

  const plansMap = useMemo(() => {
    return {
      basic: selectedPlans.find((item) => item.planType === "basic"),
      gold: selectedPlans.find((item) => item.planType === "gold"),
      silver: selectedPlans.find((item) => item.planType === "silver"),
    };
  }, [selectedPlans]);

  const handleWalletPurchase = async (plan?: Plan) => {
    try {
      if (!checkedLogin) return;

      if (!isLoggedIn) {
        router.push("/login");
        return;
      }

      // ✅ اصلاح: استفاده از plan.id به جای plan._id
      if (!plan?.id) {
        showErrorToast("پلن انتخاب نشده است");
        return;
      }

      await buySubscription(plan.id);
      showPlanToast(
        plan.planType as PlanType,
        plan.durationMonths as DurationType,
      );
    } catch (error: any) {
      const errorMessage = error?.message || "خطا در خرید اشتراک";

      if (errorMessage.includes("User already has active subscription")) {
        showErrorToast("شما قبلاً یک اشتراک فعال خریداری کرده‌اید");
        return;
      }

      showErrorToast(errorMessage);
    }
  };

  const handleSetDuration = (value: number) => {
    if (value === 1 || value === 3 || value === 6) {
      setDuration(value);
    }
  };

  const planOrder: PlanType[] = ["basic", "gold", "silver"];

  return (
    <>
      <section className="relative flex min-h-screen w-full rounded-[20px] bg-[url('/images/plansBg.png')] bg-cover bg-center bg-no-repeat px-2 py-10">
        <div className="hidden h-full w-[22%] sm:block mt-[130px]  ">
          <MonthlyFilter active={duration} setActive={handleSetDuration} />
        </div>
        <div className="flex w-full items-stretch justify-center sm:gap-5 gap-2 pl-2 sm:pt-20 pb-[30px] ">
          {planOrder.map((type) => {
            const plan = plansMap[type];
            const ui = PLAN_UI[type];

            return (
              <PlanContent
                key={type}
                topImage={ui.image}
                title={ui.title}
                price={formatPrice(plan?.price)}
                isFeatured={type === "gold"}
                features={createFeatures(plan)}
                isOpen={activePlan === type}
                onClick={() => setActivePlan(type)}
                onGatewayPay={() => {}}
                onWalletPay={() => handleWalletPurchase(plan)}
              />
            );
          })}
        </div>

        <div className="w-full flex sm:hidden justify-center absolute -bottom-[4vh] left-0">
          <MonthlyFilter active={duration} setActive={handleSetDuration} />
        </div>
      </section>

      <ToastContainer position="top-center" newestOnTop closeButton={false} />
    </>
  );
};

export default Plans;
