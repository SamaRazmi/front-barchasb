"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import FloatingInput from "@/components/common/FloatingInput";
import ModalTriggerInput from "@/components/common/ModalTriggerInput";
import { useUser } from "@/context/UserContext";
import {
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  getMySubscription,
  sendVerifyEmail,
  verifyEmailByCode,
  Subscription,
} from "@/api/apiProfileUser";
import { useProvinces, useCities } from "@/api/authApi";
import CustomSelect from "@/components/Auth/_components/CustomSelect";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

// =====================================================
// تبدیل URL عکس
// =====================================================

const replaceImageUrl = (
  url: string | null | undefined
): string | null => {
  if (!url) return null;

  const oldDomains = [
    "https://barchasb-data.storage.c2.liara.site",
    "https://barchasb-data.storage.c2.liara.space",
  ];

  const newBase =
    "https://barchasb-admin-server.ir";

  for (const oldDomain of oldDomains) {
    if (url.startsWith(oldDomain)) {
      return url.replace(oldDomain, newBase);
    }
  }

  return url;
};

// =====================================================
// تبدیل اعداد فارسی / انگلیسی
// =====================================================

const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
const englishDigits = "0123456789";

const persianToEnglish = (
  str: string
): string => {
  return str.replace(
    /[۰-۹]/g,
    (d) =>
      englishDigits[
        persianDigits.indexOf(d)
      ]
  );
};

const englishToPersian = (
  str: string
): string => {
  return str.replace(
    /[0-9]/g,
    (d) =>
      persianDigits[parseInt(d)]
  );
};

// =====================================================
// عکس پیش‌فرض
// =====================================================

const getDefaultAvatar = (
  gender?: string
) => {
  if (gender === "female")
    return "/images/women_default.svg";

  if (gender === "male")
    return "/images/men_default.svg";

  return "/images/user.png";
};

// =====================================================
// ProfileSection
// =====================================================

const ProfileSection = () => {
  const { user: contextUser, loading: userLoading } =
    useUser();

  const userId = contextUser?.id;
  const gender = contextUser?.gender;

  // ===================================================
  // States
  // ===================================================

  const [profileImage, setProfileImage] =
    useState<string | null>(null);

  const [profileImageFile, setProfileImageFile] =
    useState<File | null>(null);

  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [nationalCode, setNationalCode] =
    useState("");

  const [province, setProvince] =
    useState("");

  const [city, setCity] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [education, setEducation] =
    useState("");

  const [birthDate, setBirthDate] =
    useState("");

  const [about, setAbout] =
    useState("");

  const [interests, setInterests] =
    useState<string[]>([]);

  const [skills, setSkills] =
    useState<string[]>([]);

  const [username, setUsername] =
    useState("");

  const [genderState, setGenderState] =
    useState<string>("");

  const maxItems = 6;

  // ===================================================
  // Email
  // ===================================================

  const [email, setEmail] =
    useState("");

  const prevEmailRef =
    useRef(email);

  const [emailStep, setEmailStep] =
    useState<
      "idle" | "sent" | "verified"
    >("idle");

  const [emailCode, setEmailCode] =
    useState("");

  const [emailLoading, setEmailLoading] =
    useState(false);

  const [emailMessage, setEmailMessage] =
    useState("");

  // ===================================================
  // Files
  // ===================================================

  const [resumeFile, setResumeFile] =
    useState("");

  const [portfolioFile, setPortfolioFile] =
    useState("");

  const [subscription, setSubscription] =
    useState<Subscription | null>(null);

  const [subscriptionLoading, setSubscriptionLoading] =
    useState(true);

  // ===================================================
  // Province / City / Date
  // ===================================================

  const [selectedProvince, setSelectedProvince] =
    useState("");

  const [cityOptions, setCityOptions] =
    useState<
      { label: string; value: string }[]
    >([]);

  const [isCalendarOpen, setIsCalendarOpen] =
    useState(false);

  const [selectedDate, setSelectedDate] =
    useState<DateObject | null>(null);

  const [isCalendarFocused, setIsCalendarFocused] =
    useState(false);

  // ===================================================
  // Refs
  // ===================================================

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const resumeInputRef =
    useRef<HTMLInputElement>(null);

  const portfolioInputRef =
    useRef<HTMLInputElement>(null);

  const scrollContainerRef =
    useRef<HTMLDivElement>(null);

  // ===================================================
  // Scroll states
  // ===================================================

  const [dragOffset, setDragOffset] =
    useState(0);

  const [isAtBottom, setIsAtBottom] =
    useState(false);

  const SCROLL_STEP = 480;

  const MAX_FILE_SIZE =
    5 * 1024 * 1024;

  // ===================================================
  // Inputs
  // ===================================================

  const [skillInput, setSkillInput] =
    useState("");

  const [interestInput, setInterestInput] =
    useState("");

  // ===================================================
  // Provinces
  // ===================================================

  const {
    data: provincesData,
    isLoading: provincesLoading,
  } = useProvinces();

  const { data: citiesData } =
    useCities(selectedProvince);

  // ===================================================
  // City options
  // ===================================================

  useEffect(() => {
    if (citiesData) {
      const mapped =
        citiesData.map(
          (cityName: string) => ({
            label: cityName,
            value: cityName,
          })
        );

      setCityOptions(mapped);
    } else {
      setCityOptions([]);
    }
  }, [citiesData]);

  // ===================================================
  // Gender
  // ===================================================

  useEffect(() => {
    if (contextUser?.gender) {
      setGenderState(
        contextUser.gender
      );
    }
  }, [contextUser]);

  // ===================================================
  // Province
  // ===================================================

  useEffect(() => {
    if (
      province &&
      provincesData
    ) {
      setSelectedProvince(
        province
      );
    }
  }, [
    province,
    provincesData,
  ]);

  // ===================================================
  // Get Profile
  // ===================================================

  useEffect(() => {
    if (userLoading) return;

    if (!contextUser) {
      return;
    }

    const fetchProfile =
      async () => {
        try {
          const data = userId
            ? await getProfile(userId)
            : await getProfile();

          if (data.user) {
            setUsername(
              data.user.username || ""
            );

            setFirstName(
              data.user.name || ""
            );

            setLastName(
              data.user.lastName || ""
            );

            setPhone(
              data.user.phone || ""
            );

            setNationalCode(
              data.user.nationalCode || ""
            );

            setProvince(
              data.user.province || ""
            );

            setCity(
              data.user.city || ""
            );

            setGenderState(
              data.user.gender || ""
            );

            setBirthDate(
              data.user.birthDate
                ? persianToEnglish(
                    data.user.birthDate
                  )
                : ""
            );

            setEmail(
              data.user.email || ""
            );

            if (
              data.user.email_confirmed
            ) {
              setEmailStep(
                "verified"
              );
            }
          }

          if (data.profile) {
            setAddress(
              data.profile.address || ""
            );

            setEducation(
              data.profile.educationLevel ||
                ""
            );

            setAbout(
              data.profile.aboutMe || ""
            );

            setInterests(
              data.profile.interests || []
            );

            setSkills(
              data.profile.skills || []
            );

            setProfileImage(
              replaceImageUrl(
                data.profile.profileImage
              ) || null
            );
          }
        } catch (err) {
          console.error(
            "❌ خطا در گرفتن پروفایل:",
            err
          );
        }
      };

    fetchProfile();
  }, [
    contextUser,
    userId,
    userLoading,
  ]);

  // ===================================================
  // Subscription
  // ===================================================

  useEffect(() => {
    if (
      !contextUser ||
      userLoading ||
      !userId
    ) {
      setSubscriptionLoading(false);
      return;
    }

    const fetchSubscription =
      async () => {
        try {
          const data =
            await getMySubscription();

          setSubscription(data);
        } catch (err) {
          console.error(
            "خطا در دریافت اشتراک:",
            err
          );

          setSubscription(null);
        } finally {
          setSubscriptionLoading(false);
        }
      };

    fetchSubscription();
  }, [
    contextUser,
    userLoading,
    userId,
  ]);

  // ===================================================
  // Email
  // ===================================================

  useEffect(() => {
    if (!email) {
      setEmailMessage("");
    }

    if (
      emailStep === "verified" &&
      prevEmailRef.current !== email
    ) {
      setEmailStep("idle");
      setEmailMessage("");
    }

    prevEmailRef.current = email;
  }, [
    email,
    emailStep,
  ]);

  const handleSendVerifyEmail =
    async () => {
      if (!userId) {
        setEmailMessage(
          "کاربر لود نشده است"
        );
        return;
      }

      try {
        setEmailLoading(true);
        setEmailMessage("");

        await sendVerifyEmail(
          userId,
          email
        );

        setEmailStep("sent");

        setEmailMessage(
          "ایمیل تایید ارسال شد"
        );
      } catch (err: any) {
        setEmailMessage(
          err.message
        );
      } finally {
        setEmailLoading(false);
      }
    };

  const handleCheckEmailVerify =
    async () => {
      if (!userId) return;

      try {
        setEmailLoading(true);
        setEmailMessage("");

        await verifyEmailByCode(
          emailCode,
          userId
        );

        setEmailStep(
          "verified"
        );

        setEmailMessage(
          "ایمیل با موفقیت تایید شد"
        );

        setEmailCode("");
      } catch (err: any) {
        setEmailMessage(
          err.message
        );
      } finally {
        setEmailLoading(false);
      }
    };

  // ===================================================
  // Skills
  // ===================================================

  const handleAddSkill = () => {
    const trimmed =
      skillInput.trim();

    if (
      trimmed &&
      skills.length < maxItems
    ) {
      setSkills([
        ...skills,
        trimmed,
      ]);

      setSkillInput("");
    }
  };

  const handleRemoveSkill = (
    index: number
  ) => {
    setSkills(
      skills.filter(
        (_, i) => i !== index
      )
    );
  };

  // ===================================================
  // Interests
  // ===================================================

  const handleAddInterest = () => {
    const trimmed =
      interestInput.trim();

    if (
      trimmed &&
      interests.length < maxItems
    ) {
      setInterests([
        ...interests,
        trimmed,
      ]);

      setInterestInput("");
    }
  };

  const handleRemoveInterest = (
    index: number
  ) => {
    setInterests(
      interests.filter(
        (_, i) => i !== index
      )
    );
  };

  // ===================================================
  // Profile Image
  // ===================================================

  const handleEditImageClick =
    () => {
      fileInputRef.current?.click();
    };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    setProfileImageFile(file);

    const reader =
      new FileReader();

    reader.onload = () =>
      setProfileImage(
        reader.result as string
      );

    reader.readAsDataURL(file);
  };

  // ===================================================
  // Auto Save
  // ===================================================

  const timeoutRef =
    useRef<NodeJS.Timeout | null>(
      null
    );

  useEffect(() => {
    if (!userId) return;

    if (timeoutRef.current) {
      clearTimeout(
        timeoutRef.current
      );
    }

    timeoutRef.current =
      setTimeout(
        async () => {
          try {
            const birthDateToSend =
              birthDate
                ? englishToPersian(
                    birthDate
                  )
                : "";

            await updateProfile(
              userId,
              {
                username,
                name: firstName,
                lastName,
                phone,
                nationalCode,
                email,
                gender: genderState,
              },
              {
                province,
                city,
                address,
                educationLevel:
                  education,
                birthDate:
                  birthDateToSend,
                aboutMe: about,
                interests,
                skills,
              }
            );

            if (
              profileImageFile
            ) {
              try {
                await uploadProfilePhoto(
                  userId,
                  profileImageFile
                );
              } catch (uploadErr) {
                console.error(
                  "❌ Upload photo failed:",
                  uploadErr
                );
              }
            }
          } catch (err) {
            console.error(
              "❌ Auto-save failed:",
              err
            );
          }
        },
        1500
      );

    return () => {
      if (timeoutRef.current) {
        clearTimeout(
          timeoutRef.current
        );
      }
    };
  }, [
    userId,
    username,
    firstName,
    lastName,
    phone,
    nationalCode,
    email,
    genderState,
    province,
    city,
    address,
    education,
    birthDate,
    about,
    interests,
    skills,
    profileImageFile,
  ]);

  // ===================================================
  // Scroll
  // ===================================================

  const handleArrowClick = () => {
    const el =
      scrollContainerRef.current;

    if (!el) return;

    if (!isAtBottom) {
      const nextScroll =
        el.scrollTop +
        SCROLL_STEP;

      el.scrollTo({
        top: nextScroll,
        behavior: "smooth",
      });

      if (
        nextScroll +
          el.clientHeight >=
        el.scrollHeight - 10
      ) {
        setIsAtBottom(true);
      }
    } else {
      el.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      setIsAtBottom(false);
    }
  };

  // ===================================================
  // Mouse Drag
  // ===================================================

  const handleMouseDown = (
    e: React.MouseEvent
  ) => {
    const target =
      e.target as HTMLElement;

    if (
      target.closest("select") ||
      target.closest("input") ||
      target.closest("textarea") ||
      target.closest("button")
    ) {
      return;
    }

    setDragOffset(e.clientY);

    document.addEventListener(
      "mousemove",
      handleDrag
    );

    document.addEventListener(
      "mouseup",
      handleMouseUp
    );
  };

  const handleMouseUp = () => {
    document.removeEventListener(
      "mousemove",
      handleDrag
    );

    document.removeEventListener(
      "mouseup",
      handleMouseUp
    );
  };

  const handleDrag = (
    e: MouseEvent
  ) => {
    if (
      scrollContainerRef.current
    ) {
      const delta =
        dragOffset - e.clientY;

      scrollContainerRef.current.scrollTop =
        Math.max(
          0,
          scrollContainerRef.current
            .scrollTop + delta
        );

      setDragOffset(e.clientY);
    }
  };

  // ===================================================
  // Touch
  // ===================================================

  const handleTouchStart = (
    e: React.TouchEvent
  ) => {
    const target =
      e.target as HTMLElement;

    if (
      target.closest("select") ||
      target.closest("input") ||
      target.closest("textarea") ||
      target.closest("button")
    ) {
      return;
    }

    setDragOffset(
      e.touches[0].clientY
    );
  };

  const handleTouchMove = (
    e: React.TouchEvent
  ) => {
    const target =
      e.target as HTMLElement;

    if (
      target.closest("select") ||
      target.closest("input") ||
      target.closest("textarea") ||
      target.closest("button")
    ) {
      return;
    }

    if (
      scrollContainerRef.current
    ) {
      const delta =
        dragOffset -
        e.touches[0].clientY;

      scrollContainerRef.current.scrollTop =
        Math.max(
          0,
          scrollContainerRef.current
            .scrollTop + delta
        );

      setDragOffset(
        e.touches[0].clientY
      );
    }
  };

  // ===================================================
  // Wheel
  // ===================================================

  const handleWheel = (
    e: React.WheelEvent
  ) => {
    const target =
      e.target as HTMLElement;

    if (
      target.closest("select") ||
      target.closest("input") ||
      target.closest("textarea")
    ) {
      return;
    }

    if (
      scrollContainerRef.current
    ) {
      scrollContainerRef.current.scrollTop +=
        e.deltaY;
    }
  };

  // ===================================================
  // Keyboard
  // ===================================================

  useEffect(() => {
    const handleKeyDown = (
      e: KeyboardEvent
    ) => {
      if (
        !scrollContainerRef.current
      ) {
        return;
      }

      const target =
        e.target as HTMLElement;

      if (
        target.tagName ===
          "SELECT" ||
        target.tagName ===
          "INPUT" ||
        target.tagName ===
          "TEXTAREA" ||
        target.tagName ===
          "BUTTON"
      ) {
        return;
      }

      const scrollAmount = 100;

      const pageScrollAmount =
        scrollContainerRef.current
          .clientHeight;

      switch (e.key) {
        case "ArrowDown":
          scrollContainerRef.current.scrollTop +=
            scrollAmount;

          e.preventDefault();
          break;

        case "ArrowUp":
          scrollContainerRef.current.scrollTop -=
            scrollAmount;

          e.preventDefault();
          break;

        case "PageDown":
          scrollContainerRef.current.scrollTop +=
            pageScrollAmount;

          e.preventDefault();
          break;

        case "PageUp":
          scrollContainerRef.current.scrollTop -=
            pageScrollAmount;

          e.preventDefault();
          break;
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  // ===================================================
  // Plan
  // ===================================================

  const getPlanDisplay = () => {
    if (!subscription)
      return null;

    const planType =
      subscription.planSnapshot
        .planType;

    const duration =
      subscription.planSnapshot
        .durationMonths;

    let planName = "";
    let color = "";

    switch (planType) {
      case "gold":
        planName = "طلایی";
        color = "#FFD700";
        break;

      case "silver":
        planName = "نقره‌ای";
        color = "#C0C0C0";
        break;

      case "basic":
        planName = "برنزی";
        color = "#CD7F32";
        break;

      default:
        planName = planType;
        color = "#143A62";
    }

    let durationText = "";

    if (duration === 1) {
      durationText = "یک‌ماهه";
    } else if (duration === 3) {
      durationText = "سه‌ماهه";
    } else if (duration === 6) {
      durationText = "شش‌ماهه";
    } else {
      durationText =
        `${duration} ماهه`;
    }

    return {
      planName,
      color,
      durationText,
    };
  };

  const planDisplay =
    getPlanDisplay();

  // ===================================================
  // Image Error
  // ===================================================

  const handleImageError = (
    e: React.SyntheticEvent<
      HTMLImageElement,
      Event
    >
  ) => {
    const target =
      e.currentTarget;

    const defaultAvatar =
      getDefaultAvatar(gender);

    if (
      target.src !==
      defaultAvatar
    ) {
      target.src =
        defaultAvatar;
    }
  };

  // ===================================================
  // Province Options
  // ===================================================

  const provinceOptions =
    provincesData?.map(
      (provinceItem: {
        id: number;
        name: string;
      }) => ({
        label: provinceItem.name,
        value: provinceItem.name,
      })
    ) || [];

  // ===================================================
  // Icon Size Class
  // ===================================================

  /*
   * CustomSelect خودش icon را 22x22 رندر می‌کند.
   * این selector فقط همان img داخل icon را
   * برای این سه Select به 18x18 کاهش می‌دهد.
   */
  const selectIconSize =
    "[&>div:first-child>img]:!w-[18px] [&>div:first-child>img]:!h-[18px]";

  // ===================================================
  // RETURN
  // ===================================================

  return (
    <>
      <div
        ref={scrollContainerRef}
        className="relative w-full h-[49vh] md:h-[75vh] overflow-hidden"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onWheel={handleWheel}
        onScroll={() => {
          const el =
            scrollContainerRef.current;

          if (!el) return;

          setIsAtBottom(
            el.scrollTop +
              el.clientHeight >=
              el.scrollHeight - 10
          );
        }}
      >
        <div className="w-full flex flex-col items-center pt-2 gap-6 p-2">

          {/* =================================================
              Profile Image
          ================================================= */}

          <div className="relative w-[18vh] h-[18vh] md:w-[24vh] md:h-[24vh]">

            <div className="rounded-full overflow-hidden w-full h-full bg-gray-200 flex items-center justify-center">

              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={
                    handleImageError
                  }
                />
              ) : (
                <span className="text-gray-400 text-[2vh]">
                  عکس کاربر
                </span>
              )}

            </div>

            <div
              className="absolute top-[0.5vh] md:top-[1.5vh] right-[1.5vh] w-[5vh] h-[5vh] rounded-full bg-white flex items-center justify-center cursor-pointer shadow-lg z-10"
              onClick={
                handleEditImageClick
              }
            >
              ✎
            </div>

            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={
                handleFileChange
              }
            />
          </div>

          {/* =================================================
              Subscription
          ================================================= */}

          {!subscriptionLoading &&
            planDisplay && (
              <div className="w-full text-center my-2">
                <span
                  className="text-lg md:text-xl font-semibold px-4 py-1 rounded-full bg-gray-100 shadow-sm"
                  style={{
                    color:
                      planDisplay.color,
                  }}
                >
                  شما پلن{" "}
                  {planDisplay.planName}{" "}
                  {planDisplay.durationText}{" "}
                  را تهیه کرده‌اید
                </span>
              </div>
            )}

          {!subscriptionLoading &&
            !subscription && (
              <div className="w-full text-center my-2 text-gray-500 text-sm">
                شما هنوز اشتراکی تهیه نکرده‌اید
              </div>
            )}

          {subscriptionLoading && (
            <div className="w-full text-center my-2 text-gray-400 text-sm">
              در حال دریافت اطلاعات اشتراک...
            </div>
          )}

          {/* =================================================
              Main Form
          ================================================= */}

          <div className="flex flex-col gap-[4vh] w-[80%] md:w-[50%] text-[1.4vh] md:text-[1.8vh] mr-[10%]">

            <FloatingInput
              placeholder="نام کاربری"
              height="6vh"
              width="70%"
              defaultBgColor="#143A6226"
              value={username}
              onChange={
                setUsername
              }
            />

            <div className="flex gap-4 items-center w-full">

              <FloatingInput
                placeholder="شماره تلفن"
                height="6vh"
                width="70%"
                defaultBgColor="#143A6226"
                value={phone}
              />

              <button className="h-[5.6vh] w-[25%] bg-[#143A62] text-white rounded-lg mb-[4%]">
                تایید شماره
              </button>

            </div>

            {/* Email */}

            <div className="flex flex-col gap-2 w-full">

              {(emailStep ===
                "idle" ||
                emailStep ===
                  "verified") && (
                <div className="flex gap-4 items-center w-full">

                  <FloatingInput
                    placeholder="ایمیل"
                    height="6vh"
                    width="70%"
                    defaultBgColor="#143A6226"
                    value={email}
                    onChange={
                      setEmail
                    }
                    inputType="urlFriendly"
                    disabled={
                      emailStep ===
                      "verified"
                    }
                  />

                  <button
                    onClick={() => {
                      if (
                        emailStep ===
                        "verified"
                      ) {
                        setEmailMessage(
                          "این ایمیل قبلاً تایید شده است"
                        );
                        return;
                      }

                      handleSendVerifyEmail();
                    }}
                    disabled={
                      emailLoading ||
                      !email ||
                      emailStep ===
                        "verified"
                    }
                    className={`h-[5.6vh] w-[25%] text-white rounded-lg mb-[4%]
                    ${
                      emailStep ===
                      "verified"
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#143A62]"
                    }`}
                  >
                    {emailStep ===
                    "verified"
                      ? "تایید شده"
                      : emailLoading
                        ? "در حال ارسال..."
                        : "تایید ایمیل"}
                  </button>

                </div>
              )}

              {emailStep ===
                "sent" && (
                <div className="flex gap-4 items-center w-full">

                  <FloatingInput
                    placeholder="کد ارسالی را وارد کنید"
                    height="6vh"
                    width="70%"
                    defaultBgColor="#143A6226"
                    value={emailCode}
                    onChange={
                      setEmailCode
                    }
                  />

                  <button
                    onClick={
                      handleCheckEmailVerify
                    }
                    disabled={
                      emailLoading ||
                      !emailCode
                    }
                    className="h-[5.6vh] w-[25%] bg-green-600 text-white rounded-lg mb-[4%]"
                  >
                    {emailLoading
                      ? "در حال بررسی..."
                      : "بررسی تایید"}
                  </button>

                </div>
              )}

              {emailMessage && (
                <p className="text-right text-sm text-gray-600">
                  {emailMessage}
                </p>
              )}

              {emailStep ===
                "verified" && (
                <p className="text-green-600 text-right text-sm mt-[-8]">
                  ✅ ایمیل تایید شد
                </p>
              )}

            </div>
          </div>

          {/* =================================================
              Separator
          ================================================= */}

          <div className="w-full h-[0.2vh] bg-gradient-to-r from-transparent via-[#143A62]/80 to-transparent"></div>

          {/* =================================================
              Name
          ================================================= */}

          <div className="flex flex-col md:flex-row gap-4 w-full">

            <FloatingInput
              placeholder="نام"
              width="100%"
              value={firstName}
              onChange={
                setFirstName
              }
              defaultBgColor="#143A6226"
            />

            <FloatingInput
              placeholder="نام خانوادگی"
              width="100%"
              value={lastName}
              onChange={
                setLastName
              }
              defaultBgColor="#143A6226"
            />

          </div>

          {/* =================================================
              Gender + National Code
          ================================================= */}

          <div className="flex flex-col md:flex-row gap-4 w-full">

            <div className="flex-1">

              <CustomSelect
                name="gender"
                value={genderState}
                onChange={(
                  e: React.ChangeEvent<HTMLSelectElement>
                ) =>
                  setGenderState(
                    e.target.value
                  )
                }
                options={[
                  {
                    label: "زن",
                    value: "female",
                  },
                  {
                    label: "مرد",
                    value: "male",
                  },
                ]}
                placeholder="جنسیت"
                icon="/images/name_icon.svg"
                className={`w-full h-[6vh] bg-[#143A6226] rounded-lg text-right px-4 text-[#143A62] text-[1.4vh] md:text-[2vh] font-semibold border border-[#D1D5DB] focus:border-[#1f2937] outline-none transition-all ${selectIconSize}`}
              />

            </div>

            <div className="flex-1">

              <FloatingInput
                placeholder="کد ملی"
                height="6vh"
                width="100%"
                defaultBgColor="#143A6226"
                value={nationalCode}
                onChange={
                  setNationalCode
                }
              />

            </div>

          </div>

          {/* =================================================
              Province + City
          ================================================= */}

          <div className="flex flex-col md:flex-row gap-4 w-full">

            {/* Province */}

            <div className="flex-1">

              <CustomSelect
                name="province"
                value={province}
                onChange={(
                  e: React.ChangeEvent<HTMLSelectElement>
                ) => {
                  setProvince(
                    e.target.value
                  );

                  setSelectedProvince(
                    e.target.value
                  );

                  setCity("");
                }}
                options={
                  provinceOptions
                }
                placeholder={
                  provincesLoading
                    ? "در حال بارگذاری..."
                    : "استان"
                }
                icon="/images/province_icon.svg"
                className={`w-full h-[6vh] bg-[#143A6226] rounded-lg text-right px-4 text-[#143A62] text-[1.4vh] md:text-[2vh] font-semibold border border-[#D1D5DB] focus:border-[#1f2937] outline-none transition-all ${selectIconSize}`}
              />

            </div>

            {/* City */}

            <div className="flex-1">

              <CustomSelect
                name="city"
                value={city}
                onChange={(
                  e: React.ChangeEvent<HTMLSelectElement>
                ) =>
                  setCity(
                    e.target.value
                  )
                }
                options={
                  cityOptions
                }
                placeholder={
                  cityOptions.length ===
                  0
                    ? "در حال بارگذاری..."
                    : "شهر"
                }
                icon="/images/city_icon.svg"
                className={`w-full h-[6vh] bg-[#143A6226] rounded-lg text-right px-4 text-[#143A62] text-[1.4vh] md:text-[2vh] font-semibold border border-[#D1D5DB] focus:border-[#1f2937] outline-none transition-all ${selectIconSize}`}
              />

            </div>

          </div>

          {/* =================================================
              Address
          ================================================= */}

          <FloatingInput
            placeholder="آدرس"
            width="100%"
            value={address}
            onChange={setAddress}
            defaultBgColor="#143A6226"
          />

          {/* =================================================
              Education + Birth Date
          ================================================= */}

          <div className="flex flex-col md:flex-row gap-4 w-full">

            <FloatingInput
              placeholder="آخرین مدرک تحصیلی"
              width="100%"
              value={education}
              onChange={
                setEducation
              }
              defaultBgColor="#143A6226"
            />

            {/* =================================================
                Birth Date
            ================================================= */}

            {/* =================================================
    Birth Date - Floating Label
================================================= */}

<div className="relative w-full">

  <div
    className={`
      relative
      w-full
      h-[6vh]
      rounded-lg
      bg-[#143A6226]
      transition-all
      duration-300
      ${
        isCalendarFocused || birthDate
          ? "border-2 border-[#1f2937]"
          : "border border-[#D1D5DB]"
      }
    `}
    onClick={() => {
      setIsCalendarOpen(true);
      setIsCalendarFocused(true);
    }}
  >

    {/* ================================
        Floating Label
    ================================= */}

    <label
      className={`
        absolute
        right-4
        top-[-2vh]
        z-10
        px-3
        rounded-md
        bg-[#edf0f5]
        text-[#143A62]
        font-semibold
        text-[1.5vh]
        md:text-[2vh]
        pointer-events-none
        transition-all
        duration-200

        ${
          isCalendarFocused || birthDate
            ? "-top-[1.1vh] opacity-100"
            : "top-1/2 -translate-y-1/2 opacity-50"
        }
      `}
    >
      تاریخ تولد
    </label>

    {/* ================================
        Date Value
    ================================= */}

    <div
      className="
        w-full
        h-full
        flex
        items-center
        px-4
        text-right
        text-[#143A62]
        font-semibold
        text-[1.4vh]
        md:text-[2vh]
        cursor-pointer
      "
    >
      {birthDate
        ? englishToPersian(birthDate)
        : ""}
    </div>

    {/* ================================
        Calendar Icon
    ================================= */}

    <div
      className="
        absolute
        left-4
        top-1/2
        -translate-y-1/2
        pointer-events-none
      "
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5 text-[#143A62]/60"
      >
        <rect
          x="3"
          y="4"
          width="18"
          height="18"
          rx="2"
          ry="2"
        />

        <line
          x1="16"
          y1="2"
          x2="16"
          y2="6"
        />

        <line
          x1="8"
          y1="2"
          x2="8"
          y2="6"
        />

        <line
          x1="3"
          y1="10"
          x2="21"
          y2="10"
        />
      </svg>
    </div>

  </div>

  {/* ================================
      Calendar
  ================================= */}

  {isCalendarOpen && (
    <div
      className="
        absolute
        top-[6.5vh]
        left-0
        w-full
        z-[9999]
      "
      onMouseDown={(e) =>
        e.stopPropagation()
      }
    >
      <DatePicker
        value={selectedDate}
        onChange={(
          date: DateObject | null
        ) => {
          if (date) {
            const formatted =
              date.format("YYYY/MM/DD");

            setBirthDate(formatted);
            setSelectedDate(date);
          } else {
            setBirthDate("");
            setSelectedDate(null);
          }

          setIsCalendarOpen(false);
          setIsCalendarFocused(false);
        }}
        format="YYYY/MM/DD"
        calendar={persian}
        locale={persian_fa}
        maxDate={
          new DateObject({
            calendar: persian,
            locale: persian_fa,
          }).subtract(
            10,
            "years"
          )
        }
        minDate={
          new DateObject({
            calendar: persian,
            locale: persian_fa,
          }).subtract(
            120,
            "years"
          )
        }
        style={{
          width: "100%",
          direction: "rtl",
        }}
        containerStyle={{
          width: "100%",
          position: "relative",
          zIndex: 9999,
        }}
      />
    </div>
  )}

</div>
          </div>

          {/* =================================================
              About
          ================================================= */}

          <FloatingInput
            placeholder="درباره من"
            variant="textarea"
            width="100%"
            textareaHeight="15vh"
            value={about}
            onChange={setAbout}
            defaultBgColor="#143A6226"
          />

          {/* =================================================
              Interests
          ================================================= */}

          <div className="flex flex-col w-full mt-4">

            <div className="flex gap-2 w-[70%] ml-auto justify-start">

              <FloatingInput
                placeholder="افزودن علاقه‌مندی"
                value={interestInput}
                onChange={
                  setInterestInput
                }
                width="70%"
                defaultBgColor="#143A6226"
              />

              <button
                onClick={
                  handleAddInterest
                }
                className="h-[6.5vh] px-4 bg-[#143A62] text-white rounded-lg"
              >
                افزودن
              </button>

            </div>

            <div className="flex flex-wrap gap-2 mt-2">

              {interests.map(
                (
                  item,
                  index
                ) => (
                  <div
                    key={index}
                    className="relative bg-gray-200 px-3 py-1 rounded-lg"
                  >
                    {item}

                    <span
                      onClick={() =>
                        handleRemoveInterest(
                          index
                        )
                      }
                      className="absolute top-0 right-0 cursor-pointer text-red-500 font-bold"
                    >
                      ×
                    </span>
                  </div>
                )
              )}

            </div>

            {/* =================================================
                Skills
            ================================================= */}

            <div className="flex flex-col w-full mt-4">

              <div className="flex gap-2 w-[70%] ml-auto justify-start">

                <FloatingInput
                  placeholder="افزودن مهارت"
                  value={skillInput}
                  onChange={
                    setSkillInput
                  }
                  width="70%"
                  defaultBgColor="#143A6226"
                />

                <button
                  onClick={
                    handleAddSkill
                  }
                  className="h-[6.5vh] px-4 bg-[#143A62] text-white rounded-lg"
                >
                  افزودن
                </button>

              </div>

              <div className="flex flex-wrap gap-2 mt-2">

                {skills.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={index}
                      className="relative bg-gray-200 px-3 py-1 rounded-lg"
                    >
                      {item}

                      <span
                        onClick={() =>
                          handleRemoveSkill(
                            index
                          )
                        }
                        className="absolute top-0 right-0 cursor-pointer text-red-500 font-bold"
                      >
                        ×
                      </span>
                    </div>
                  )
                )}

              </div>

            </div>
          </div>

          {/* =================================================
              Separator
          ================================================= */}

          <div className="w-full h-[0.2vh] bg-gradient-to-r from-transparent via-[#143A62]/80 to-transparent"></div>

          {/* =================================================
              Resume + Portfolio
          ================================================= */}

          <div className="flex flex-col md:flex-row gap-4 w-full">

            <div className="flex-1">

              <ModalTriggerInput
                placeholder="بارگذاری فایل رزومه (اختیاری)"
                value={resumeFile}
                type="file"
                onClick={() =>
                  resumeInputRef.current?.click()
                }
                defaultBgColor="#143A6226"
              />

              <input
                ref={resumeInputRef}
                type="file"
                accept="application/pdf"
                hidden
                onChange={(e) => {
                  const file =
                    e.target.files?.[0];

                  if (!file) return;

                  if (
                    file.type !==
                    "application/pdf"
                  ) {
                    alert(
                      "فقط فایل PDF مجاز است"
                    );
                    return;
                  }

                  if (
                    file.size >
                    MAX_FILE_SIZE
                  ) {
                    alert(
                      "حجم فایل نباید بیشتر از ۵ مگابایت باشد"
                    );
                    return;
                  }

                  setResumeFile(
                    file.name
                  );
                }}
              />

            </div>

            <div className="flex-1">

              <ModalTriggerInput
                placeholder="بارگذاری نمونه کارها (PDF) (اختیاری)"
                value={
                  portfolioFile
                }
                type="file"
                onClick={() =>
                  portfolioInputRef.current?.click()
                }
                defaultBgColor="#143A6226"
              />

              <input
                ref={
                  portfolioInputRef
                }
                type="file"
                accept="application/pdf"
                hidden
                onChange={(e) => {
                  const file =
                    e.target.files?.[0];

                  if (!file) return;

                  if (
                    file.type !==
                    "application/pdf"
                  ) {
                    alert(
                      "فقط فایل PDF مجاز است"
                    );
                    return;
                  }

                  if (
                    file.size >
                    MAX_FILE_SIZE
                  ) {
                    alert(
                      "حجم فایل نباید بیشتر از ۵ مگابایت باشد"
                    );
                    return;
                  }

                  setPortfolioFile(
                    file.name
                  );
                }}
              />

            </div>
          </div>

          {/* =================================================
              Resume Builder
          ================================================= */}

          <Link
            href="/dashboard/plugins/resume"
            className="w-full text-right text-[2vh] font-semibold mt-[-14] block transition-all duration-200 cursor-pointer hover:text-[2.2vh] hover:mr-[10vh] hover:scale-105"
          >
            استفاده از رزومه ساز ؟
          </Link>

          {/* =================================================
              Upload Files
          ================================================= */}

          <div className="relative w-full mt-2">

            <div className="relative">

              <FloatingInput
                placeholder="بارگذاری فایل ها"
                variant="textarea"
                width="100%"
                textareaHeight="12vh"
                inputStyle={{
                  paddingBottom:
                    "5vh",
                }}
                defaultBgColor="#143A6226"
              />

              <button
                className="absolute bottom-4 left-2 h-[5vh] px-4 bg-[#143A62] text-white rounded-lg z-50"
                type="button"
              >
                بارگذاری
              </button>

            </div>
          </div>

        </div>

        {/* =================================================
            Bottom Gradient
        ================================================= */}

        <div
          className="w-full h-[3vh] sticky bottom-0 left-0 pointer-events-none rounded-md"
          style={{
            background:
              "linear-gradient(180deg, rgba(17, 17, 17, 0) 0%, rgba(17, 17, 17, 0.6) 100%)",
          }}
        />

        {/* =================================================
            Scroll Arrow
        ================================================= */}

        <button
          onClick={
            handleArrowClick
          }
          className="fixed left-14 bottom-32 w-12 h-12 rounded-full bg-[#143A62] flex items-center justify-center shadow-lg hidden md:block md:z-[9999] hover:scale-105 transition"
        >
          <span className="text-white text-xl font-bold">
            {isAtBottom
              ? "↑"
              : "↓"}
          </span>
        </button>

      </div>
    </>
  );
};

export default ProfileSection;