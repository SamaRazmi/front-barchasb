"use client";

import React, { useState, useRef, useEffect } from "react";
import FloatingInput from "@/components/common/FloatingInput";
import FloatingSelect from "@/components/common/FloatingSelect";
import ModalTriggerInput from "@/components/common/ModalTriggerInput";
import SelectImageModal from "@/components/common/SelectImageModal";
import AddAdsModal from "../../../CreatePostForm/__components/FormAdvertiser/___components/AddAdsModal";
import AdAttributesModal from "../../../CreatePostForm/__components/FormAdvertiser/___components/AdAttributesModal";
import Button from "@mui/material/Button";
import { useProvinces, useCities } from "@/api/authApi";
import { useUser } from "@/context/UserContext";
import { useFormStore } from "@/store/formStore";
import { fetchSellerAd, updateSellerAd } from "@/api/apiAdsQueries";

/* ===================== TYPES ===================== */
interface ImageItem {
  src: string;
  file?: File;
  fromApi?: boolean;
  isMain?: boolean;
}

interface AdvertiserForm {
  title: string;
  description: string;
  category: string[];
  province: string;
  city: string;
  status: string;
  application: string;
  price: string;
  attributes?: Record<string, any>;
}

interface EditFormAdvertiserProps {
  adId: string;
  onCancel?: () => void;
}

/* ===================== TOAST COMPONENT ===================== */
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

/* ===================== COMPONENT ===================== */
const EditFormAdvertiser: React.FC<EditFormAdvertiserProps> = ({
  adId,
  onCancel,
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();

  const [state, setState] = useState<AdvertiserForm>({
    title: "",
    description: "",
    category: [],
    status: "",
    application: "",
    price: "",
    province: user?.province || "",
    city: user?.city || "",
    attributes: {},
  });

  const [mainImage, setMainImage] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [imagesFromApi, setImagesFromApi] = useState<
    { url: string; isMain?: boolean }[]
  >([]);

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [attrModalOpen, setAttrModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

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

  const { data: provincesData } = useProvinces();
  const { data: citiesData } = useCities(state.province);

  const provinceOptions =
    provincesData?.map((p: any) => ({ label: p.name, value: p.name })) || [];
  const cityOptions =
    citiesData?.map((c: string) => ({ label: c, value: c })) || [];

  const categoryName = state.category?.[0] || "";

  // لاگ‌گیری تغییرات state
  useEffect(() => {
    console.log("🔄 [EditAdvertiser] state تغییر کرد:", state);
  }, [state]);

  /* ===================== FETCH AD ===================== */
  useEffect(() => {
    if (!adId || !user?.id) return;

    const fetchAd = async () => {
      try {
        console.log("🔍 [EditAdvertiser] دریافت آگهی با adId:", adId);
        const rawData = await fetchSellerAd(user.id, adId);
        console.log("📦 [EditAdvertiser] داده‌ی خام از سرور:", rawData);

        // اگر داده در کلیدهای ad یا data باشد، استخراج کن
        const adData = rawData.ad || rawData.data || rawData;
        console.log("📦 [EditAdvertiser] داده‌ی اصلی آگهی:", adData);

        if (!adData || typeof adData !== "object") {
          throw new Error("داده‌ای دریافت نشد");
        }

        // استخراج category
        let categoryArray: string[] = [];
        if (adData.category) {
          if (typeof adData.category === "string") {
            categoryArray = adData.category.split(",").filter(Boolean);
          } else if (Array.isArray(adData.category)) {
            categoryArray = adData.category.map(String);
          }
        }

        // status
        let statusValue = adData.status || "";
        if (Array.isArray(statusValue)) statusValue = statusValue[0] || "";
        if (typeof statusValue === "string" && statusValue.includes(",")) {
          statusValue = statusValue.split(",")[0];
        }

        // application: از extraFeatures.usage یا application
        let applicationValue = "";
        if (adData.extraFeatures?.usage) {
          applicationValue = adData.extraFeatures.usage;
        } else if (adData.application) {
          applicationValue = adData.application;
          if (Array.isArray(applicationValue))
            applicationValue = applicationValue[0] || "";
          if (
            typeof applicationValue === "string" &&
            applicationValue.includes(",")
          ) {
            applicationValue = applicationValue.split(",")[0];
          }
        }

        const newState = {
          title: adData.title || "",
          description: adData.description || "",
          category: categoryArray,
          status: statusValue,
          application: applicationValue,
          price: adData.priceIRT?.toString() || "",
          province: adData.state || user?.province || "",
          city: adData.city || user?.city || "",
          attributes: adData.extraFeatures || {},
        };

        console.log("📝 [EditAdvertiser] state جدید:", newState);
        setState(newState);

        // تصاویر
        if (adData.images && adData.images.length > 0) {
          const apiImages = adData.images.map((img: any) => ({
            url: img.url,
            isMain: !!img.isMain,
          }));
          setImagesFromApi(apiImages);
          const main = apiImages.find((i: any) => i.isMain) || apiImages[0];
          setMainImage(main.url);
          useFormStore.getState().setField("editAdvertiser", adId, {
            imagesFromApi: apiImages,
          });
        }
      } catch (err: any) {
        console.error("❌ [EditAdvertiser] خطا در بارگذاری آگهی:", err);
        showToast(err.message || "خطا در بارگذاری آگهی", "error");
      }
    };

    fetchAd();
  }, [adId, user]);

  /* ===================== SUBMIT ===================== */
  const handleSubmit = async () => {
    try {
      if (!user?.id) throw new Error("شناسه کاربر یافت نشد");

      const updatedAttributes = {
        ...state.attributes,
        usage: state.application,
      };

      const formData = new FormData();
      formData.append("title", state.title);
      formData.append("description", state.description);
      formData.append("category", state.category[0] || "");
      formData.append("state", state.province);
      formData.append("city", state.city);
      formData.append("priceIRT", state.price);
      formData.append("status", state.status);
      formData.append("application", state.application);
      formData.append("extraFeatures", JSON.stringify(updatedAttributes));
      formData.append("adStatus", "updated");

      images.forEach((file) => formData.append("images", file));
      formData.append("imagesFromApi", JSON.stringify(imagesFromApi));

      console.log(
        "📤 [EditAdvertiser] ارسال داده‌ها:",
        Array.from(formData.entries()),
      );

      await updateSellerAd(user.id, adId, formData);

      showToast("تغییرات با موفقیت ذخیره شد!", "success");
    } catch (err: any) {
      console.error("❌ [EditAdvertiser] خطا در ذخیره:", err);
      showToast(err.message || "خطا در ذخیره تغییرات", "error");
    }
  };

  return (
    <>
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
          {/* تصویر آگهی */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setImageModalOpen(true)}
          >
            <img
              src={mainImage || "/images/img_form.svg"}
              alt="عکس آگهی"
              className="w-[7vh] h-[7vh] object-cover rounded-md"
            />
            <span className="text-gray-500 font-medium">عکس آگهی</span>
          </div>

          <FloatingInput
            placeholder="عنوان آگهی"
            value={state.title}
            onChange={(v) => setState({ ...state, title: v })}
          />
          <FloatingInput
            placeholder="توضیحات"
            value={state.description}
            onChange={(v) => setState({ ...state, description: v })}
          />
          <FloatingInput
            placeholder="قیمت (تومان)"
            value={state.price}
            onChange={(v) => setState({ ...state, price: v })}
          />
          <ModalTriggerInput
            placeholder="دسته آگهی"
            value={state.category.join(", ")}
            onClick={() => setCategoryModalOpen(true)}
          />
          <FloatingSelect
            placeholder="استان"
            options={provinceOptions}
            value={state.province}
            onChange={(v) =>
              setState({ ...state, province: v as string, city: "" })
            }
          />
          <FloatingSelect
            placeholder="شهر"
            options={cityOptions}
            value={state.city}
            onChange={(v) => setState({ ...state, city: v as string })}
          />
          <FloatingSelect
            placeholder="وضعیت"
            options={[
              { label: "نو", value: "new" },
              { label: "کارکرده / دست دوم", value: "used" },
              { label: "آکبند", value: "sealed" },
              { label: "بازسازی شده", value: "refurbished" },
              { label: "معیوب / نیاز به تعمیر", value: "damaged" },
              { label: "قدیمی / کلکسیونی", value: "vintage" },
            ]}
            value={state.status}
            onChange={(v) => setState({ ...state, status: v as string })}
          />
          <FloatingSelect
            placeholder="کاربرد"
            options={[
              { label: "شخصی", value: "personal" },
              { label: "تجاری / کسب‌وکار", value: "commercial" },
              { label: "آموزشی / یادگیری", value: "educational" },
              { label: "هدیه", value: "gift" },
              { label: "صنعتی", value: "industrial" },
            ]}
            value={state.application}
            onChange={(v) => setState({ ...state, application: v as string })}
          />
          <ModalTriggerInput
            placeholder="ویژگی‌ها و امکانات"
            value={
              state.attributes && Object.keys(state.attributes).length
                ? "مشخصات ثبت شد"
                : ""
            }
            onClick={() => setAttrModalOpen(true)}
          />
        </div>

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

        <SelectImageModal
          isOpen={imageModalOpen}
          onClose={() => setImageModalOpen(false)}
          onSelect={(imgs: ImageItem[]) => {
            const main = imgs.find((i: any) => i.isMain) || imgs[0];
            setMainImage(
              main?.file ? URL.createObjectURL(main.file) : main?.src || null,
            );

            const newFiles = imgs
              .filter((i: any) => i.file)
              .map((i: any) => i.file!);
            const fromApi = imgs
              .filter((i: any) => i.fromApi)
              .map((i: any) => ({ url: i.src, isMain: i.isMain || false }));

            setImages(newFiles);
            setImagesFromApi(fromApi);

            useFormStore.getState().setField("editAdvertiser", adId, {
              images: newFiles,
              imagesFromApi: fromApi,
            });
          }}
          parentRef={parentRef}
          userType="editAdvertiser"
          entityId={adId}
        />

        {attrModalOpen && (
          <AdAttributesModal
            categoryName={categoryName}
            onClose={() => setAttrModalOpen(false)}
            parentRef={parentRef}
          />
        )}

        {categoryModalOpen && (
          <AddAdsModal
            parentRef={parentRef}
            onClose={() => setCategoryModalOpen(false)}
          />
        )}
      </div>
    </>
  );
};

export default EditFormAdvertiser;
