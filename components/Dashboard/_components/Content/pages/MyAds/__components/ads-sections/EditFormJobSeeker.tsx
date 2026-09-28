"use client";

import React, { useState, useRef, useEffect } from "react";
import FloatingInput from "@/components/common/FloatingInput";
import FloatingSelect from "@/components/common/FloatingSelect";
import ModalTriggerInput from "@/components/common/ModalTriggerInput";
import AddRelatedDescriptionModal from "@/components/common/AddRelatedDescriptionModal";
import SelectImageModal from "@/components/common/SelectImageModal";
import { useUser } from "@/context/UserContext";
import { useProvinces, useCities } from "@/api/authApi";
import Button from "@mui/material/Button";
import AdditionalInfoModal from "../../../CreatePostForm/__components/FormJobSeeker/___components/AdditionalInfoModal";
import jalaali from "jalaali-js";
import { useFormStore } from "@/store/formStore";
import { useQuery } from "@tanstack/react-query";
import {
  fetchMainCategories,
  fetchSubCategories,
  type Category,
} from "@/api/apiCategories";
import { fetchJobSeekerAd, updateJobSeekerAd } from "@/api/apiAdsQueries";

interface ImageItem {
  file?: File;
  url: string;
  isMain?: boolean;
}

interface EditFormJobSeekerProps {
  adId: string;
  onCancel?: () => void;
  onSaved?: () => void;
}

const toArray = (value: any): any[] =>
  Array.isArray(value) ? value : value ? [value] : [];

// -----------------------------------------------------------------
// کامپوننت Toast با پشتیبانی از رنگ‌های خطا و موفقیت
// -----------------------------------------------------------------
const Toast: React.FC<{
  message: string;
  progress: number;
  visible: boolean;
  type?: "error" | "success";
}> = ({ message, progress, visible, type = "error" }) => {
  if (!visible) return null;

  const bgColor = type === "error" ? "#d32f2f" : "#2e7d32";

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        backgroundColor: bgColor,
        color: "#fff",
        padding: "16px 24px",
        borderRadius: "12px",
        minWidth: "280px",
        maxWidth: "90%",
        textAlign: "center",
        boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
        direction: "rtl",
        fontFamily: "inherit",
      }}
    >
      <div
        style={{ fontSize: "1.1rem", fontWeight: 500, marginBottom: "10px" }}
      >
        {message}
      </div>
      <div
        style={{
          width: "100%",
          height: "4px",
          backgroundColor: "rgba(255,255,255,0.25)",
          borderRadius: "2px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            backgroundColor: "#ffffff",
            borderRadius: "2px",
            transition: "width 0.1s linear",
          }}
        />
      </div>
    </div>
  );
};

// -----------------------------------------------------------------
// کامپوننت اصلی
// -----------------------------------------------------------------
const EditFormJobSeeker: React.FC<EditFormJobSeekerProps> = ({
  adId,
  onCancel,
  onSaved,
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();

  const calculateAgeFromShamsi = (birthDateShamsi: string) => {
    if (!birthDateShamsi) return "";
    const persianNumbers = "۰۱۲۳۴۵۶۷۸۹";
    const englishNumbers = "0123456789";
    const normalizeNumber = (str: string) =>
      str.replace(/[۰-۹]/g, (w) => englishNumbers[persianNumbers.indexOf(w)]);
    const normalizedDate = normalizeNumber(birthDateShamsi);
    const [jy, jm, jd] = normalizedDate.split("/").map(Number);
    const { gy, gm, gd } = jalaali.toGregorian(jy, jm, jd);
    const today = new Date();
    let age = today.getFullYear() - gy;
    const birthdayThisYear = new Date(today.getFullYear(), gm - 1, gd);
    if (today < birthdayThisYear) age--;
    return age;
  };

  const [form, setForm] = useState({
    age: user?.birthDate ? calculateAgeFromShamsi(user.birthDate) : "",
    salary: "",
    name: user ? `${user.name} ${user.lastName}` : "",
    education: "",
    skills: [] as string[],
    phoneNumber: user?.phone || "",
    experienceDetails: "",
    otherDetails: "",
    jobCategory: [] as string[],
    province: user?.province || "",
    city: user?.city || "",
    resumeFile: "",
    portfolioFile: "",
    gender: "",
    militaryStatus: "",
    minSalary: "",
    maxSalary: "",
    cooperationType: [] as string[],
    paymentMethod: [] as string[],
    otherFeatures: "",
  });

  const getDisplayFileName = (filePath: string) => {
    if (!filePath) return "";
    if (filePath.includes("/") || filePath.includes("\\")) {
      return filePath.split(/[\/\\]/).pop() || filePath;
    }
    return filePath;
  };

  const [mainImage, setMainImage] = useState<string | null>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imagesFromApi, setImagesFromApi] = useState<ImageItem[]>([]);

  const [experienceModalOpen, setExperienceModalOpen] = useState(false);
  const [additionalInfoOpen, setAdditionalInfoOpen] = useState(false);

  const resumeInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);
  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  const { data: provincesData, isLoading: provincesLoading } = useProvinces();
  const { data: citiesData } = useCities(form.province);

  const provinceOptions =
    provincesData?.map((p: { id: number; name: string }) => ({
      label: p.name,
      value: p.name,
    })) || [];

  const cityOptions =
    citiesData?.map((c: string) => ({ label: c, value: c })) || [];

  const { data: mainData, isLoading: mainLoading } = useQuery({
    queryKey: ["main-categories"],
    queryFn: fetchMainCategories,
  });
  const mainCategories = mainData?.categories || [];

  const jobCategoryOptions = mainCategories.map((cat: any) => ({
    label: cat.name,
    value: cat.id,
  }));

  const [skillsOptions, setSkillsOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [isFetchingSkills, setIsFetchingSkills] = useState(false);

  useEffect(() => {
    const fetchAllSubCategories = async () => {
      if (!form.jobCategory.length) {
        setSkillsOptions([]);
        return;
      }
      setIsFetchingSkills(true);
      try {
        const promises = form.jobCategory.map(async (parentId: string) => {
          try {
            const res = await fetchSubCategories(parentId);
            return res.categories || [];
          } catch {
            return [];
          }
        });
        const results = await Promise.all(promises);
        const allSubs = results.flat();
        const uniqueMap = new Map();
        allSubs.forEach((sub: any) => {
          if (!uniqueMap.has(sub.name)) {
            uniqueMap.set(sub.name, { label: sub.name, value: sub.id });
          }
        });
        setSkillsOptions(Array.from(uniqueMap.values()));
      } catch {
        setSkillsOptions([]);
      } finally {
        setIsFetchingSkills(false);
      }
    };

    fetchAllSubCategories();
  }, [form.jobCategory]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, skills: [] }));
  }, [form.jobCategory]);

  // -----------------------------------------------------------------
  // State مربوط به Toast
  // -----------------------------------------------------------------
  const [toast, setToast] = useState({
    message: "",
    visible: false,
    progress: 0,
    type: "error" as "error" | "success",
  });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (message: string, type: "error" | "success" = "error") => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setToast({ message, visible: true, progress: 0, type });

    const duration = 3000;
    const interval = 30;
    const step = (interval / duration) * 100;

    timerRef.current = setInterval(() => {
      setToast((prev) => {
        const newProgress = Math.min(prev.progress + step, 100);
        if (newProgress >= 100) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return { ...prev, visible: false, progress: 100 };
        }
        return { ...prev, progress: newProgress };
      });
    }, interval);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  /* ---------- دریافت اطلاعات آگهی ---------- */
  useEffect(() => {
    if (!adId || !user?.id) return;

    const fetchAd = async () => {
      try {
        const response = await fetchJobSeekerAd(user.id, adId);
        const adData = response.ad || response;
        console.log("📦 داده‌های دریافتی از API:", adData);

        if (adData) {
          let categoryId = "";
          if (adData.category) {
            if (typeof adData.category === "string") {
              categoryId = adData.category;
            } else if (typeof adData.category === "object") {
              categoryId = adData.category.id || adData.category._id || "";
            }
          }

          const cooperationTypeArray = adData.cooperationType
            ? toArray(adData.cooperationType)
            : [];
          const paymentMethodArray = adData.paymentMethod
            ? toArray(adData.paymentMethod)
            : [];

          setForm({
            age:
              adData.age ||
              (user?.birthDate ? calculateAgeFromShamsi(user.birthDate) : ""),
            salary: adData.suggestedSalaryIRT || "",
            name: adData.name || `${user?.name} ${user?.lastName}` || "",
            education: adData.education || "",
            skills: adData.skills || [],
            phoneNumber: adData.phoneNumber || user?.phone || "",
            experienceDetails:
              adData.careerHistory?.map((c: any) => c.description).join(", ") ||
              "",
            otherDetails: adData.aboutMe || "",
            jobCategory: categoryId ? [categoryId] : [],
            province: adData.state || user?.province || "",
            city: adData.city || user?.city || "",
            resumeFile: adData.resumeFile || "",
            portfolioFile: adData.workSampleFile || "",
            gender: adData.gender || "",
            militaryStatus: adData.militaryStatus || "",
            minSalary: adData.minSalary || "",
            maxSalary: adData.maxSalary || "",
            cooperationType: cooperationTypeArray,
            paymentMethod: paymentMethodArray,
            otherFeatures: adData.userDesc || "",
          });

          if (adData.images?.length) {
            const apiImages: ImageItem[] = adData.images.map(
              (img: any, i: number) => ({
                url: img.url,
                isMain: i === 0,
              }),
            );
            setImages(apiImages);
            setMainImage(apiImages[0].url);
            useFormStore.getState().setField("editJobSeeker", adId, {
              imagesFromApi: apiImages,
            });
          } else {
            setImages([]);
            setMainImage(null);
            useFormStore.getState().setField("editJobSeeker", adId, {
              imagesFromApi: [],
            });
          }
        }
      } catch (err) {
        console.error("خطا در دریافت آگهی:", err);
        showToast("خطا در دریافت اطلاعات آگهی", "error");
      }
    };

    fetchAd();
  }, [adId, user]);

  /* ---------- ذخیره تغییرات ---------- */
  const handleSaveAll = async () => {
    const required = [
      form.name,
      form.age,
      form.jobCategory.length ? form.jobCategory[0] : "",
      form.province,
      form.city,
    ];

    if (required.some((v) => !v)) {
      showToast("لطفا تمام فیلدهای ضروری را پر کنید", "error");
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value?.toString() || "");
        }
      });

      formData.append("adStatus", "updated");

      images.forEach((img) => {
        if (img.file) formData.append("images", img.file);
      });

      if (!user?.id) throw new Error("شناسه کاربر یافت نشد");
      await updateJobSeekerAd(user.id, adId, formData);

      showToast("تغییرات با موفقیت ذخیره شد!", "success");
      onSaved?.();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "خطا در ذخیره تغییرات", "error");
    }
  };

  return (
    <>
      {/* Toast در بالای صفحه */}
      <Toast
        message={toast.message}
        progress={toast.progress}
        visible={toast.visible}
        type={toast.type}
      />

      <div
        ref={parentRef}
        className="relative w-full h-full p-2 bg-gray-100 rounded-md"
      >
        {onCancel && (
          <div
            onClick={onCancel}
            className="absolute left-4 top-[1vh] w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-100 cursor-pointer z-10"
          >
            ✕
          </div>
        )}

        {/* خطا و موفقیت متنی حذف شدند */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 items-center mr-[10%] sm:mr-[5%] md:mr-[1%] w-full">
          <div
            className="flex justify-center md:justify-start items-center gap-1 cursor-pointer mb-4"
            onClick={() => setImageModalOpen(true)}
          >
            <img
              src={mainImage || "/images/img_form.svg"}
              alt="عکس کارجو"
              className="w-[7vh] h-[7vh] object-cover rounded-md"
            />
            <span className="text-gray-400 font-medium">عکس کارجو</span>
          </div>

          <FloatingInput
            placeholder="سن"
            inputType="number"
            value={form.age?.toString() || ""}
            onChange={(v) => setForm({ ...form, age: v })}
          />
          <FloatingInput
            placeholder="حقوق پیشنهادی (تومان)"
            inputType="price"
            value={form.salary}
            onChange={(v) => setForm({ ...form, salary: v })}
          />
          <FloatingInput
            placeholder="نام"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
          />
          <FloatingInput
            placeholder="تحصیلات"
            value={form.education}
            onChange={(v) => setForm({ ...form, education: v })}
          />
          <FloatingSelect
            placeholder={
              mainLoading ? "در حال بارگذاری دسته‌ها..." : "دسته شغلی"
            }
            options={jobCategoryOptions}
            value={form.jobCategory}
            onChange={(v) =>
              setForm({ ...form, jobCategory: toArray(v), skills: [] })
            }
            multiSelect
          />
          <FloatingSelect
            placeholder={
              isFetchingSkills ? "در حال بارگذاری مهارت‌ها..." : "مهارت‌ها"
            }
            options={skillsOptions}
            value={form.skills}
            onChange={(v) => setForm({ ...form, skills: toArray(v) })}
            multiSelect
          />

          <div className="flex items-center gap-2">
            <div className="flex-1">
              <ModalTriggerInput
                placeholder="بارگذاری فایل رزومه (PDF)"
                value={getDisplayFileName(form.resumeFile)}
                type="file"
                onClick={() => resumeInputRef.current?.click()}
              />
            </div>
            {form.resumeFile &&
              (form.resumeFile.startsWith("http") ||
                form.resumeFile.startsWith("/")) && (
                <a
                  href={form.resumeFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-sm whitespace-nowrap"
                >
                  مشاهده فایل
                </a>
              )}
          </div>
          <input
            ref={resumeInputRef}
            type="file"
            accept="application/pdf"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.type !== "application/pdf") {
                alert("فقط فایل PDF مجاز است");
                return;
              }
              if (file.size > MAX_FILE_SIZE) {
                alert("حجم فایل نباید بیشتر از ۵ مگابایت باشد");
                return;
              }
              setForm({ ...form, resumeFile: file.name });
            }}
          />

          <div className="flex items-center gap-2">
            <div className="flex-1">
              <ModalTriggerInput
                placeholder="بارگذاری نمونه کارها (PDF)"
                value={getDisplayFileName(form.portfolioFile)}
                type="file"
                onClick={() => portfolioInputRef.current?.click()}
              />
            </div>
            {form.portfolioFile &&
              (form.portfolioFile.startsWith("http") ||
                form.portfolioFile.startsWith("/")) && (
                <a
                  href={form.portfolioFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-sm whitespace-nowrap"
                >
                  مشاهده فایل
                </a>
              )}
          </div>
          <input
            ref={portfolioInputRef}
            type="file"
            accept="application/pdf"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.type !== "application/pdf") {
                alert("فقط فایل PDF مجاز است");
                return;
              }
              if (file.size > MAX_FILE_SIZE) {
                alert("حجم فایل نباید بیشتر از ۵ مگابایت باشد");
                return;
              }
              setForm({ ...form, portfolioFile: file.name });
            }}
          />

          <FloatingInput
            placeholder="شماره تلفن"
            inputType="number"
            value={form.phoneNumber}
            onChange={(v) => setForm({ ...form, phoneNumber: v })}
          />

          <ModalTriggerInput
            placeholder="سوابق شغلی"
            value={form.experienceDetails}
            onClick={() => setExperienceModalOpen(true)}
          />

          <ModalTriggerInput
            placeholder="سایر مشخصات"
            value={form.otherDetails}
            onClick={() => setAdditionalInfoOpen(true)}
          />

          <FloatingSelect
            placeholder={provincesLoading ? "در حال بارگذاری..." : "استان"}
            options={provinceOptions}
            value={form.province}
            onChange={(v) =>
              setForm({ ...form, province: v as string, city: "" })
            }
          />

          <FloatingSelect
            placeholder="شهر / منطقه"
            options={cityOptions}
            value={form.city}
            onChange={(v) => setForm({ ...form, city: v as string })}
          />
        </div>

        <Button
          onClick={handleSaveAll}
          className="block w-[88%] h-[7vh] mt-6 rounded-[10px] mx-auto md:mx-0"
          style={{
            backgroundColor: "rgba(20,58,98,0.85)",
            color: "#fff",
            fontSize: "1.2rem",
            fontWeight: 600,
          }}
        >
          ثبت ویرایش
        </Button>

        <SelectImageModal
          isOpen={imageModalOpen}
          onClose={() => setImageModalOpen(false)}
          parentRef={parentRef}
          userType="editJobSeeker"
          entityId={adId}
          onSelect={(imgs) => {
            if (!imgs || imgs.length === 0) return;
            const main = imgs.find((i) => i.isMain) || imgs[0];
            if (main) {
              setMainImage(
                main.file ? URL.createObjectURL(main.file) : main.src,
              );
            }
            const newImages: ImageItem[] = imgs.map((i, idx) => ({
              file: i.file,
              url: i.src || (i.file ? URL.createObjectURL(i.file) : ""),
              isMain: i.isMain || idx === 0,
            }));
            const fromApi = newImages.filter((i) => !i.file);
            const filesOnly = newImages.filter((i) => i.file);
            setImages(filesOnly);
            setImagesFromApi(fromApi);
            useFormStore.getState().setField("editJobSeeker", adId, {
              images: filesOnly,
              imagesFromApi: fromApi,
            });
          }}
        />

        {experienceModalOpen && (
          <AddRelatedDescriptionModal
            isOpen
            onClose={() => setExperienceModalOpen(false)}
            parentRef={parentRef}
            titleModal="سوابق شغلی"
            titleAdd="شرح سوابق"
            titleAddHolder="موقعیت شغلی"
            titleDescription="درباره من:"
            userType="jobSeeker"
            onSave={(v) => setForm({ ...form, experienceDetails: v })}
          />
        )}

        {additionalInfoOpen && (
          <AdditionalInfoModal
            parentRef={parentRef}
            onClose={() => setAdditionalInfoOpen(false)}
            onSave={(v) => setForm({ ...form, otherDetails: v })}
          />
        )}
      </div>
    </>
  );
};

export default EditFormJobSeeker;
