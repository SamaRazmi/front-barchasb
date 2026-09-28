// EditFormDigitalProjects.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@mui/material";
import { useUser } from "@/context/UserContext";
import { useFormStore } from "@/store/formStore";
import FloatingInput from "@/components/common/FloatingInput";
import ModalTriggerInput from "@/components/common/ModalTriggerInput";
import SelectImageModal from "@/components/common/SelectImageModal";
import AddRelatedDescriptionModal from "@/components/common/AddRelatedDescriptionModal";
import Image from "next/image";
import { useRouter } from "next/navigation";

// ===================== TYPES =====================
interface ImageItem {
  src: string;
  file?: File;
  fromApi?: boolean;
  isMain?: boolean;
}

interface DigitalForm {
  title: string;
  minBudget: string;
  maxBudget: string;
  description: string;
  skills: string[];
  mainImage: string | null;
  images: ImageItem[];
  // سایر فیلدهای دیجیتال را در صورت نیاز اضافه کنید
  projectNames?: string[];
  projectDescriptions?: string[];
  digitalTotalDesc?: string;
  requiredSkills?: any[];
}

interface EditFormDigitalProjectsProps {
  adId: string;
  onCancel?: () => void;
}

// ===================== TOAST COMPONENT =====================
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

// ===================== MAIN COMPONENT =====================
const EditFormDigitalProjects: React.FC<EditFormDigitalProjectsProps> = ({
  adId,
  onCancel,
}) => {
  const router = useRouter();
  const parentRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();

  const [state, setState] = useState<DigitalForm>({
    title: "",
    minBudget: "",
    maxBudget: "",
    description: "",
    skills: [],
    mainImage: null,
    images: [],
  });

  const [imagesFromApi, setImagesFromApi] = useState<
    { url: string; isMain?: boolean }[]
  >([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);

  const [skillInput, setSkillInput] = useState("");
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [descriptionModalOpen, setDescriptionModalOpen] = useState(false);

  // ===== Toast =====
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

  // ===== دریافت آگهی از سرور =====
  useEffect(() => {
    if (!adId || !user?.id) return;

    const fetchAd = async () => {
      try {
        const response = await fetch(
          `/api/ads/digital/owner/${user.id}/${adId}`,
        );
        if (!response.ok) throw new Error("خطا در دریافت آگهی");

        const result = await response.json();
        const adData = result.ad || result;

        // نگاشت داده‌ها
        let skills: string[] = [];
        if (adData.requiredSkills) {
          if (Array.isArray(adData.requiredSkills)) {
            skills = adData.requiredSkills.map((s: any) =>
              typeof s === "string" ? s : s.name || "",
            );
          } else if (typeof adData.requiredSkills === "string") {
            skills = adData.requiredSkills.split(",").filter(Boolean);
          }
        }

        setState({
          title: adData.title || "",
          minBudget: adData.minBudget || "",
          maxBudget: adData.maxBudget || "",
          description: adData.description || "",
          skills: skills.filter(Boolean),
          mainImage:
            adData.images && adData.images.length > 0
              ? adData.images[0]?.url
              : null,
          images: adData.images || [],
        });

        // ذخیره تصاویر موجود از API
        if (adData.images && adData.images.length > 0) {
          const apiImages = adData.images.map((img: any) => ({
            url: img.url,
            isMain: !!img.isMain,
          }));
          setImagesFromApi(apiImages);
        }
      } catch (err: any) {
        console.error("❌ خطا در بارگذاری آگهی دیجیتال:", err);
        showToast(err.message || "خطا در بارگذاری آگهی", "error");
      }
    };

    fetchAd();
  }, [adId, user]);

  // ===== مدیریت مهارت‌ها =====
  const handleAddSkill = () => {
    if (!skillInput.trim()) return;
    setState((prev) => ({
      ...prev,
      skills: [...prev.skills, skillInput.trim()],
    }));
    setSkillInput("");
  };

  const handleRemoveSkill = (index: number) => {
    setState((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  // ===== ارسال ویرایش =====
  const handleSubmit = async () => {
    try {
      if (!user?.id) throw new Error("شناسه کاربر یافت نشد");

      if (!state.title || !state.minBudget || !state.maxBudget) {
        showToast("لطفاً فیلدهای ضروری را پر کنید", "error");
        return;
      }

      const formData = new FormData();
      formData.append("title", state.title);
      formData.append("minBudget", state.minBudget);
      formData.append("maxBudget", state.maxBudget);
      formData.append("description", state.description);
      formData.append("requiredSkills", JSON.stringify(state.skills));
      formData.append("adStatus", "updated");

      // تصاویر جدید
      newImageFiles.forEach((file) => formData.append("images", file));
      // تصاویر موجود از API
      formData.append("imagesFromApi", JSON.stringify(imagesFromApi));

      const response = await fetch(
        `/api/ads/digital/owner/${user.id}/${adId}`,
        {
          method: "PUT",
          body: formData,
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "خطا در ذخیره تغییرات");
      }

      showToast("تغییرات با موفقیت ذخیره شد!", "success");
      // در صورت نیاز، پس از موفقیت به صفحه‌ی قبل برگردید
      if (onCancel) onCancel();
      else router.push("/dashboard/myads");
    } catch (err: any) {
      console.error("❌ خطا در ذخیره آگهی دیجیتال:", err);
      showToast(err.message || "خطا در ذخیره تغییرات", "error");
    }
  };

  return (
    <>
      {/* Toast */}
      <Toast
        message={toast.message}
        progress={toast.progress}
        visible={toast.visible}
        type={toast.type}
      />

      <div
        ref={parentRef}
        className="relative w-full h-full p-4 md:p-6 bg-gray-100 flex flex-col gap-4 rounded-md"
      >
        {onCancel && (
          <div
            onClick={onCancel}
            className="absolute left-4 top-[1vh] w-9 h-9 flex items-center justify-center rounded-full bg-gray-200 hover:bg-red-100 cursor-pointer z-10"
          >
            ✕
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mx-auto w-full max-w-[95%] md:max-w-none">
          {/* تصویر اصلی */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setImageModalOpen(true)}
          >
            <img
              src={state.mainImage || "/images/img_form.svg"}
              alt="عکس پروژه"
              className="w-[7vh] h-[7vh] object-cover rounded-md"
            />
            <span className="text-gray-500 font-medium">عکس پروژه</span>
          </div>

          <FloatingInput
            placeholder="عنوان پروژه"
            value={state.title}
            onChange={(v) => setState({ ...state, title: v })}
          />

          <FloatingInput
            placeholder="حداقل بودجه (تومان)"
            inputType="price"
            value={state.minBudget}
            onChange={(v) => setState({ ...state, minBudget: v })}
          />

          <FloatingInput
            placeholder="حداکثر بودجه (تومان)"
            inputType="price"
            value={state.maxBudget}
            onChange={(v) => setState({ ...state, maxBudget: v })}
          />

          <ModalTriggerInput
            placeholder="توضیحات پروژه"
            value={state.description}
            onClick={() => setDescriptionModalOpen(true)}
          />

          {/* قسمت مهارت‌ها - به‌صورت یک فیلد جداگانه */}
          <div className="col-span-1 md:col-span-2 flex flex-wrap gap-2 items-center">
            <div className="flex-1 min-w-[200px]">
              <FloatingInput
                placeholder="مهارت مورد نیاز"
                value={skillInput}
                onChange={setSkillInput}
              />
            </div>
            <Button
              onClick={handleAddSkill}
              style={{
                backgroundColor: "#143A62",
                color: "#fff",
                fontWeight: 600,
              }}
            >
              افزودن
            </Button>
          </div>

          <div className="col-span-1 md:col-span-2 flex flex-wrap gap-2 mt-2">
            {state.skills.map((skill, index) => (
              <div
                key={index}
                className="relative bg-[#143A62] text-white px-3 py-1 rounded"
              >
                {skill}
                <span
                  onClick={() => handleRemoveSkill(index)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs cursor-pointer"
                >
                  ✕
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* دکمه ثبت */}
        <Button
          onClick={handleSubmit}
          className="block w-[88%] h-[5vh] rounded-[10px] mx-auto md:mx-0"
          style={{
            backgroundColor: "rgba(20,58,98,0.85)",
            color: "#fff",
            fontSize: "1.2rem",
            fontWeight: 600,
          }}
        >
          ثبت ویرایش
        </Button>

        {/* مودال انتخاب تصویر */}
        <SelectImageModal
          isOpen={imageModalOpen}
          onClose={() => setImageModalOpen(false)}
          onSelect={(imgs: ImageItem[]) => {
            const main = imgs.find((i) => i.isMain) || imgs[0];
            setState((prev) => ({
              ...prev,
              mainImage: main?.file
                ? URL.createObjectURL(main.file)
                : main?.src || null,
              images: imgs,
            }));

            const newFiles = imgs.filter((i) => i.file).map((i) => i.file!);
            const fromApi = imgs
              .filter((i) => i.fromApi)
              .map((i) => ({ url: i.src, isMain: i.isMain || false }));

            setNewImageFiles(newFiles);
            setImagesFromApi(fromApi);

            // ذخیره در store (در صورت نیاز)
            useFormStore.getState().setField("editDigital", "images", {
              newFiles,
              imagesFromApi: fromApi,
            });
          }}
          parentRef={parentRef}
          userType="editDigital"
          entityId={adId}
        />

        {/* مودال توضیحات */}
        <AddRelatedDescriptionModal
          isOpen={descriptionModalOpen}
          onClose={() => setDescriptionModalOpen(false)}
          onSave={(desc: string) =>
            setState((prev) => ({ ...prev, description: desc }))
          }
          parentRef={parentRef}
          titleModal="توضیحات پروژه"
          titleAdd="شرح پروژه:"
          titleAddHolder="عنوان"
          titleDescription="جزئیات:"
          userType="digital"
        />
      </div>
    </>
  );
};

export default EditFormDigitalProjects;
