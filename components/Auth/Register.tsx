"use client";

import React, { useState, useEffect } from "react";

import { Formik, Form, FormikHelpers } from "formik";

import * as Yup from "yup";

import FormWrapper from "./_components/FormWrapperL";

import Input from "./_components/Input";

import { useRouter } from "next/navigation";

import Button from "./_components/Button";

import CaptchaModal from "./_components/CaptchaModal";

import Link from "next/link";

import { useRegister } from "@/api/authApi";

import { useDispatch } from "react-redux";

import { userLogedTrue } from "@/store/slices/logedSlice";

import { toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import ToastPortal from "@/components/common/ToastPortal";

// ===== نوع داده‌های فرم =====

export interface RegisterFormValues {
  phone: string;
  password: string;
  confirmPassword: string;
}

// ===== مقادیر اولیه =====

const initialValues: RegisterFormValues = {
  phone: "",
  password: "",
  confirmPassword: "",
};

// ============================================================
// ===== تبدیل اعداد فارسی و عربی به انگلیسی =====
// ============================================================

const convertPersianNumbers = (value: string): string => {
  return value
    .replace(/[۰-۹]/g, (digit) =>
      String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))
    )
    .replace(/[٠-٩]/g, (digit) =>
      String("٠١٢٣٤٥٦٧٨٩".indexOf(digit))
    );
};

// ============================================================
// ===== فقط کاراکترهای مجاز رمز عبور =====
// ===== حروف فارسی و سایر کاراکترهای غیرمجاز حذف می‌شوند =====
// ============================================================

const filterPassword = (value: string): string => {
  return value.replace(
    /[^A-Za-z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/g,
    ""
  );
};

// ============================================================
// ===== اعتبارسنجی =====
// ============================================================

const validationSchema = Yup.object({
  phone: Yup.string()
    // ===== فارسی، عربی و انگلیسی در اعتبارسنجی قابل قبول هستند =====
    .transform((value) => convertPersianNumbers(value || ""))
    .matches(
      /^09\d{9}$/,
      "شماره تلفن معتبر نیست (باید با 09 شروع و 11 رقم باشد)"
    )
    .required("شماره تلفن وارد نشده است."),

  password: Yup.string()
    .matches(
      /^[A-Za-z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]+$/,
      "رمز عبور فقط باید شامل حروف انگلیسی، اعداد و کاراکترهای مجاز باشد"
    )
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
      "رمز عبور باید حداقل 8 کاراکتر، شامل حروف بزرگ، حروف کوچک و اعداد باشد"
    )
    .required("رمز عبور وارد نشده است."),

  confirmPassword: Yup.string()
    .matches(
      /^[A-Za-z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]+$/,
      "رمز عبور فقط باید شامل حروف انگلیسی، اعداد و کاراکترهای مجاز باشد"
    )
    .oneOf(
      [Yup.ref("password")],
      "رمز عبور مطابقت ندارد"
    )
    .required("تکرار رمز عبور وارد نشده است."),
});

const Register: React.FC = () => {
  const router = useRouter();

  const dispatch = useDispatch();

  const [captchaModalOpen, setCaptchaModalOpen] =
    useState(false);

  const [captchaVerified, setCaptchaVerified] =
    useState(false);

  const [modal, setModal] = useState<{
    message: string;
    success: boolean;
  } | null>(null);

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const registerMutation = useRegister();

  // ============================================================
  // ===== نمایش خطاها با Toast =====
  // ============================================================

  const showValidationErrors = (
    errors: Record<string, string>
  ) => {
    const errorMessages =
      Object.values(errors).filter(Boolean);

    if (errorMessages.length === 0) return;

    toast.error(
      <div>
        {errorMessages.map((msg, idx) => (
          <div key={idx}>• {msg}</div>
        ))}
      </div>,
      {
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
  };

  // ============================================================
  // ===== تابع ثبت‌نام (پس از تأیید کپچا) =====
  // ============================================================

  const handleCaptchaConfirm = async (
    values: RegisterFormValues,
    helpers: FormikHelpers<RegisterFormValues>
  ) => {
    setCaptchaVerified(true);

    setCaptchaModalOpen(false);

    helpers.setSubmitting(true);

    try {
      // ==========================================================
      // ===== شماره فارسی/عربی به انگلیسی تبدیل می‌شود =====
      // ===== مثال:
      // ===== 09026410645
      // ===== ۰۹۰۲۶۴۱۰۶۴۵
      // ===== ٠٩٠٢٦٤١٠٦٤٥
      // ===== هر سه به 09026410645 ارسال می‌شوند
      // ==========================================================

      const normalizedPhone =
        convertPersianNumbers(values.phone);

      const { confirmPassword, ...rest } = values;

      // ===== بدون تغییر فیلدهای ارسالی فعلی =====

      const valuesToSend = {
        ...rest,
        phone: normalizedPhone,
        name: "",
        lastName: "",
        nationalCode: "",
        birthDate: "",
        gender: "",
        province: "",
        city: "",
        acceptTerms: true,
      };

      const data =
        await registerMutation.mutateAsync(valuesToSend);

      if (data.user) {
        dispatch(
          userLogedTrue({
            name: data.user.name || "کاربر",
            lastName: data.user.lastName || "",
          })
        );
      } else {
        dispatch(
          userLogedTrue({
            name: "کاربر",
            lastName: "",
          })
        );
      }

      setModal({
        message:
          "ثبت نام موفق! در حال انتقال به میزکار...",
        success: true,
      });

      helpers.resetForm();

      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error: any) {
      console.error(error);

      toast.error(
        error.message || "خطا در ثبت نام",
        {
          autoClose: 5000,
          hideProgressBar: false,
        }
      );

      setModal({
        message:
          error.message || "خطا در ثبت نام",
        success: false,
      });
    } finally {
      helpers.setSubmitting(false);

      setTimeout(() => {
        setModal(null);
        setCaptchaVerified(false);
      }, 3000);
    }
  };

  // ============================================================
  // ===== پاک کردن مودال =====
  // ============================================================

  useEffect(() => {
    if (modal) {
      const timer = setTimeout(
        () => setModal(null),
        3000
      );

      return () => clearTimeout(timer);
    }
  }, [modal]);

  return (
    <FormWrapper
      backLinkDesktop="/"
      backLinkMobile="/"
    >
      {/* ===== دقیقاً مشابه ساختار Login ===== */}

      <h2 className="text-[30px] font-bold mb-6 text-[#143A62] text-center">
        ثبت نام
      </h2>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={() => {}}
      >
        {(props) => {
          const {
            errors,
            touched,
            isSubmitting,
            setFieldValue,
            validateForm,
            setSubmitting,
            resetForm,
            setErrors,
            setTouched,
            setStatus,
            ...rest
          } = props;

          // ===== Formik Helpers کامل =====

          const formikHelpers: FormikHelpers<RegisterFormValues> =
            {
              ...rest,
              setSubmitting,
              resetForm,
              setFieldValue,
              setErrors,
              setTouched,
              setStatus,
              validateForm,
            };

          // ============================================================
          // ===== submit سفارشی =====
          // ============================================================

          const localHandleSubmit = async () => {
            const validationErrors =
              await validateForm();

            if (
              Object.keys(validationErrors).length > 0
            ) {
              showValidationErrors(
                validationErrors
              );

              return;
            }

            if (!captchaVerified) {
              setCaptchaModalOpen(true);
              return;
            }

            setSubmitting(true);

            await handleCaptchaConfirm(
              props.values,
              formikHelpers
            );
          };

          return (
            <Form className="contents">
              {/* ===== contents باعث می‌شود Form مثل Login روی layout اثر نگذارد ===== */}

              <div className="contents">

                {/* ================================================= */}
                {/* تلفن */}
                {/* ================================================= */}

                <div className="!w-[90%] max-w-[500px] mx-auto">
                  <Input
                    name="phone"
                    type="tel"
                    placeholder="شماره تلفن"
                    icon="/images/tel_icon.svg"
                    className="mb-4 !w-full"
                    value={props.values.phone}
                    onChange={(e) => {
                      // ==================================================
                      // ===== فارسی، عربی و انگلیسی پذیرفته می‌شوند =====
                      // ===== ولی مقدار ذخیره‌شده همیشه انگلیسی است =====
                      // ==================================================

                      const normalizedValue =
                        convertPersianNumbers(
                          e.target.value
                        );

                      setFieldValue(
                        "phone",
                        normalizedValue
                      );
                    }}
                    error={errors.phone}
                    touched={touched.phone}
                  />
                </div>

                {/* ================================================= */}
                {/* رمز عبور */}
                {/* ================================================= */}

                <div className="!w-[90%] max-w-[500px] mx-auto relative">
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 p-1 z-10"
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5 text-gray-700"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5 text-gray-700"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 3l18 18M10.477 10.477a3 3 0 014.243 4.243M9.88 9.88C7.1 12.66 4.5 12 3 12c-4.477 0-8.268 2.943-9.542 7"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M14.121 14.121l4.242 4.242"
                        />
                      </svg>
                    )}
                  </button>

                  <Input
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    placeholder="رمز عبور (حداقل 8 کاراکتر، شامل حروف بزرگ و کوچک و عدد)"
                    icon="/images/pass_icon.svg"
                    className="mb-4 !w-full"
                    value={props.values.password}
                    onChange={(e) => {
                      // ===== جلوگیری از ورود حروف فارسی =====

                      const filteredValue =
                        filterPassword(
                          e.target.value
                        );

                      setFieldValue(
                        "password",
                        filteredValue
                      );
                    }}
                    error={errors.password}
                    touched={touched.password}
                  />
                </div>

                {/* ================================================= */}
                {/* تکرار رمز */}
                {/* ================================================= */}

                <div className="!w-[90%] max-w-[500px] mx-auto relative">
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 p-1 z-10"
                  >
                    {showConfirmPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5 text-gray-700"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5 text-gray-700"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 3l18 18M10.477 10.477a3 3 0 014.243 4.243M9.88 9.88C7.1 12.66 4.5 12 3 12c-4.477 0-8.268 2.943-9.542 7z"
                        />
                      </svg>
                    )}
                  </button>

                  <Input
                    name="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    placeholder="تکرار رمز عبور"
                    icon="/images/pass_icon.svg"
                    className="mb-4 !w-full"
                    value={
                      props.values.confirmPassword
                    }
                    onChange={(e) => {
                      // ===== جلوگیری از ورود حروف فارسی =====

                      const filteredValue =
                        filterPassword(
                          e.target.value
                        );

                      setFieldValue(
                        "confirmPassword",
                        filteredValue
                      );
                    }}
                    error={
                      errors.confirmPassword
                    }
                    touched={
                      touched.confirmPassword
                    }
                  />
                </div>

                {/* ================================================= */}
                {/* دکمه ثبت‌نام */}
                {/* ================================================= */}

                <div className="!w-[90%] max-w-[500px] mx-auto">
                  <Button
                    type="button"
                    className="mb-2 !w-full"
                    disabled={
                      isSubmitting ||
                      registerMutation.isPending
                    }
                    onClick={
                      localHandleSubmit
                    }
                  >
                    {isSubmitting ||
                    registerMutation.isPending
                      ? "در حال ارسال..."
                      : "ثبت نام"}
                  </Button>
                </div>

                {/* ================================================= */}
                {/* لینک ورود */}
                {/* ================================================= */}

                <div className="!w-[90%] max-w-[500px] flex justify-center mx-auto m-1">
                  <span className="cursor-pointer font-medium text-[15px] text-[#143A62] sm:text-[20px] text-center">
                    <Link href="/login">
                      قبلاً ثبت نام کرده‌اید؟
                    </Link>
                  </span>
                </div>
              </div>

              {/* ================================================= */}
              {/* مودال پیام */}
              {/* ================================================= */}

              {modal && (
                <div
                  className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 rounded-lg text-white z-50"
                  style={{
                    backgroundColor:
                      modal.success
                        ? "#38a169"
                        : "#e53e3e",
                  }}
                >
                  <p className="font-bold text-center">
                    {modal.message}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setCaptchaModalOpen(false);
                      setCaptchaVerified(false);
                      setSubmitting(false);
                    }}
                    className="absolute top-2 right-2 text-gray-200 hover:text-white font-bold"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* ================================================= */}
              {/* مودال کپچا */}
              {/* ================================================= */}

              {captchaModalOpen && (
                <CaptchaModal
                  handleCaptchaConfirm={(
                    values,
                    helpers
                  ) => {
                    handleCaptchaConfirm(
                      values,
                      helpers as any
                    );
                  }}
                  setCaptchaModalOpen={
                    setCaptchaModalOpen
                  }
                  setCaptchaVerified={
                    setCaptchaVerified
                  }
                  helpers={formikHelpers}
                  values={props.values}
                />
              )}
            </Form>
          );
        }}
      </Formik>

      <ToastPortal />

      <style jsx>{`
        :global(.password-field + p),
        :global(input[name="password"] ~ p),
        :global(input[name="confirmPassword"] ~ p) {
          display: none !important;
        }
      `}</style>
    </FormWrapper>
  );
};

export default Register;