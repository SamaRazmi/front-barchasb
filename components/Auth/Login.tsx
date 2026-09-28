"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FormWrapper from "./_components/FormWrapperL";
import Input from "./_components/Input";
import Button from "./_components/Button";
import { useDispatch, useSelector } from "react-redux";
import { userLogedTrue } from "@/store/slices/logedSlice";
import type { RootState } from "@/store/store";
import { useLogin } from "@/api/authApi";
import CaptchaModal from "./_components/CaptchaModal";
import { toast } from "react-toastify";
import ToastPortal from "@/components/common/ToastPortal";
import "react-toastify/dist/ReactToastify.css";

interface ModalState {
  message: string;
  success: boolean;
}

interface CaptchaFormValues {
  phone: string;
}

const Login: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const logedVal = useSelector((state: RootState) => state.loged.value);

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [modal, setModal] = useState<ModalState | null>(null);
  const [captchaModalOpen, setCaptchaModalOpen] = useState(false);
  const [errors, setErrors] = useState({ phone: "", password: "" });
  const [previousPath, setPreviousPath] = useState("/");
  const [pendingUser, setPendingUser] = useState<{
    name: string;
    lastName: string;
  } | null>(null);
  // ===== state جدید برای نمایش لویدینگ حین هدایت =====
  const [isRedirecting, setIsRedirecting] = useState(false);

  const redirectingRef = useRef(false);
  const loginMutation = useLogin();

  useEffect(() => {
    if (typeof window !== "undefined" && document.referrer) {
      try {
        const referrerUrl = new URL(document.referrer);
        if (
          referrerUrl.origin === window.location.origin &&
          !referrerUrl.pathname.includes("/login") &&
          !referrerUrl.pathname.includes("/register")
        ) {
          setPreviousPath(referrerUrl.pathname + referrerUrl.search);
        }
      } catch (e) {}
    }
  }, []);

  // ===== useEffect اصلی برای هدایت (پشتیبان) =====
  useEffect(() => {
    if (logedVal === 1 && !redirectingRef.current) {
      redirectingRef.current = true;
      setIsRedirecting(true); // نمایش لویدینگ
      router.replace("/dashboard");
    }
  }, [logedVal, router]);

  // ===== useEffect جدید: هدایت مستقیم پس از بسته‌شدن مودال =====
  useEffect(() => {
    if (!captchaModalOpen && pendingUser && !redirectingRef.current) {
      redirectingRef.current = true;
      setIsRedirecting(true); // نمایش لویدینگ

      dispatch(
        userLogedTrue({
          name: pendingUser.name,
          lastName: pendingUser.lastName,
        }),
      );

      toast.success("ورود با موفقیت انجام شد");

      if (typeof window !== "undefined") {
        window.location.href = "/dashboard";
      }

      setPendingUser(null);
    }
  }, [captchaModalOpen, pendingUser, dispatch]);

  const loginCheck = async () => {
    try {
      const data = await loginMutation.mutateAsync({ phone, password });
      if (data.user) {
        setPendingUser({
          name: data.user.name || "",
          lastName: data.user.lastName || "",
        });
      } else {
        setPendingUser({ name: "", lastName: "" });
      }
      return true;
    } catch (err: any) {
      setModal({
        success: false,
        message: err.message || "کاربری با این مشخصات یافت نشد",
      });
      toast.error(err.message || "کاربری با این مشخصات یافت نشد");
      return false;
    }
  };

  const handleLoginClick = async () => {
    const newErrors = { phone: "", password: "" };
    if (!phone.trim()) newErrors.phone = "شماره تلفن الزامی است";
    if (!password.trim()) newErrors.password = "رمز عبور الزامی است";

    setErrors(newErrors);
    if (newErrors.phone) toast.error(newErrors.phone);
    if (newErrors.password) toast.error(newErrors.password);

    if (newErrors.phone || newErrors.password) return;

    const success = await loginCheck();
    if (success) {
      setCaptchaModalOpen(true);
    }
  };

  const handleCaptchaConfirm = useCallback(
    (values: CaptchaFormValues, helpers: any) => {
      if (pendingUser) {
        setIsRedirecting(true);
        dispatch(
          userLogedTrue({
            name: pendingUser.name,
            lastName: pendingUser.lastName,
          }),
        );
        toast.success("ورود با موفقیت انجام شد");
        if (typeof window !== "undefined") {
          window.location.href = "/dashboard";
        }
      } else {
        setModal({ success: false, message: "خطا در تأیید هویت" });
        toast.error("خطا در تأیید هویت");
      }
      helpers.setSubmitting(false);
      setCaptchaModalOpen(false);
    },
    [pendingUser, dispatch],
  );

  const closeCaptchaModal = () => {
    setCaptchaModalOpen(false);
    setPendingUser(null);
  };

  const fakeValues: CaptchaFormValues = { phone };
  const dummyHelpers = {
    setSubmitting: (val: boolean) => {},
    setFieldValue: () => {},
    setFieldTouched: () => {},
    setErrors: () => {},
    resetForm: () => {},
  };

  useEffect(() => {
    if (modal) {
      const timer = setTimeout(() => setModal(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [modal]);

  // ===== اگر در حالت هدایت هستیم، لویدینگ نمایش داده شود =====
  if (isRedirecting) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="text-center">
          {/* اسپینر ساده با Tailwind */}
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-[#143A62]">
            در حال انتقال به میزکار...
          </p>
          <p className="text-sm text-gray-500 mt-2">
            لطفاً چند لحظه صبور باشید
          </p>
        </div>
      </div>
    );
  }

  return (
    <FormWrapper backLinkDesktop={previousPath} backLinkMobile={previousPath}>
      <h2 className="text-[30px] font-bold mb-6 text-[#143A62] text-center">
        ورود
      </h2>

      <Input
        type="tel"
        placeholder="شماره تلفن"
        icon="/images/tel_icon.svg"
        className="mb-4 !w-[90%] mx-auto"
        value={phone}
        onChange={(e) => {
          setPhone(e.target.value);
          if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
        }}
        error={errors.phone}
        touched={true}
      />

      <Input
        type="password"
        placeholder="رمز عبور"
        icon="/images/pass_icon.svg"
        className="mb-6 !w-[90%] mx-auto"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
        }}
        error={errors.password}
        touched={true}
      />

      <Button
        className="mb-2 !w-[90%] mx-auto"
        onClick={handleLoginClick}
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? "در حال بررسی..." : "ورود"}
      </Button>

      <div className="!w-[90%] max-w-[500px] flex justify-between mx-auto m-1">
        <Link
          href="/forgotpassword1"
          className="cursor-pointer font-medium text-[15px] text-[#143A62] sm:text-[20px]"
        >
          فراموشی رمز عبور
        </Link>
        <span className="cursor-pointer font-medium text-[15px] text-[#143A62] sm:text-[20px]">
          <Link href="/register">ثبت نام</Link>
        </span>
      </div>

      {captchaModalOpen && (
        <CaptchaModal
          handleCaptchaConfirm={handleCaptchaConfirm as any}
          setCaptchaModalOpen={setCaptchaModalOpen}
          setCaptchaVerified={(val) => {}}
          helpers={dummyHelpers as any}
          values={fakeValues as any}
        />
      )}

      {modal && (
        <div
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                     p-4 rounded-lg text-white z-50"
          style={{ backgroundColor: modal.success ? "#38a169" : "#e53e3e" }}
        >
          <p className="font-bold text-center">{modal.message}</p>
          <button
            type="button"
            onClick={() => setModal(null)}
            className="absolute top-2 right-2 text-gray-200 hover:text-white font-bold"
          >
            ×
          </button>
        </div>
      )}

      <ToastPortal />
    </FormWrapper>
  );
};

export default Login;
