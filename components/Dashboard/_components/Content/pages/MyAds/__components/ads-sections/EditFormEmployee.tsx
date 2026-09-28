"use client";

import React, { useState, useRef, useEffect } from "react";
import FloatingInput from "@/components/common/FloatingInput";
import FloatingSelect from "@/components/common/FloatingSelect";
import ModalTriggerInput from "@/components/common/ModalTriggerInput";
import SelectImageModal from "@/components/common/SelectImageModal";
import AddRelatedDescriptionModal from "@/components/common/AddRelatedDescriptionModal";
import AdAttributesModal from "../../../CreatePostForm/__components/FormEmployee/___components/OtherFeaturesModal";
import AddJobModal from "../../../CreatePostForm/__components/FormEmployee/___components/AddJobModal";
import Button from "@mui/material/Button";
import { useUser } from "@/context/UserContext";
import { useProvinces, useCities } from "@/api/authApi";
import { useFormStore } from "@/store/formStore";
import { fetchEmployerAd, updateEmployerAd } from "@/api/apiAdsQueries";

/* ===================== HELPERS ===================== */
const toArray = (value: any): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") {
    if (value.includes(",")) {
      return value
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
    }
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(String) : [value];
    } catch {
      return [value];
    }
  }
  return [];
};

/* ===================== TYPES ===================== */
interface EmployeeAdState {
  name: string;
  title: string;
  description: string;
  category: string[];
  cooperationType: string[];
  militaryStatus: string;
  paymentMethod: string[];
  minSalary: string[];
  maxSalary: string[];
  startTime: string[];
  endTime: string[];
  gender: string;
  experience: string;
  stateProvince: string;
  city: string;
  otherFeatures: string;
  companyName?: string;
  companyType?: string;
  benefits?: string;
  insurance?: string;
  education?: string;
  companyDescription?: string;
}

interface EditFormEmployeeProps {
  adId: string;
  onCancel?: () => void;
  onSuccess?: () => void;
}

// -----------------------------------------------------------------
// کامپوننت Toast
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

/* ===================== COMPONENT ===================== */
const EditFormEmployee: React.FC<EditFormEmployeeProps> = ({
  adId,
  onCancel,
  onSuccess,
}) => {
  const { user } = useUser();
  const parentRef = useRef<HTMLDivElement>(null);

  const [mainImage, setMainImage] = useState<string | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [imagesFromApi, setImagesFromApi] = useState<
    { url: string; isMain?: boolean }[]
  >([]);

  const [descriptionModalOpen, setDescriptionModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [attributesModalOpen, setAttributesModalOpen] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [state, setState] = useState<EmployeeAdState>({
    name: user ? `${user.name} ${user.lastName}` : "",
    title: "",
    description: "",
    category: [],
    cooperationType: [],
    militaryStatus: "",
    paymentMethod: [],
    minSalary: [],
    maxSalary: [],
    startTime: [],
    endTime: [],
    gender: user?.gender || "",
    experience: "",
    stateProvince: "",
    city: "",
    otherFeatures: "",
    companyName: "",
    companyType: "",
    benefits: "",
    insurance: "",
    education: "",
    companyDescription: "",
  });

  const { data: provincesData, isLoading: provincesLoading } = useProvinces();
  const { data: citiesData } = useCities(state.stateProvince);

  const provinceOptions =
    provincesData?.map((p: { id: number; name: string }) => ({
      label: p.name,
      value: p.name,
    })) || [];

  const cityOptions =
    citiesData?.map((c: string) => ({ label: c, value: c })) || [];

  // -----------------------------------------------------------------
  // Toast
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

  // ===================== FETCH AD =====================
  useEffect(() => {
    if (!adId || !user?.id) return;

    const fetchAd = async () => {
      try {
        console.log("🔍 [EditEmployee] دریافت آگهی با adId:", adId);
        const adData = await fetchEmployerAd(user.id, adId);
        console.log("📦 [EditEmployee] داده‌های دریافتی:", adData);

        if (adData) {
          const ad = adData.ad || adData;

          // اصلاح: پردازش category به عنوان رشته یا آرایه با تایپ‌دهی صریح
          let categoryArray: string[] = [];
          if (ad.category) {
            if (typeof ad.category === "string") {
              categoryArray = ad.category
                .split(",")
                .map((s: string) => s.trim())
                .filter(Boolean);
            } else if (Array.isArray(ad.category)) {
              categoryArray = ad.category
                .map((cat: any) =>
                  typeof cat === "string" ? cat : cat.name || "",
                )
                .filter(Boolean);
            }
          }

          // اصلاح: استفاده از adPaymentMethod در صورت خالی بودن paymentMethod
          const paymentMethodValue =
            ad.paymentMethod || ad.adPaymentMethod || "";
          const paymentMethodArray = toArray(paymentMethodValue);

          setState({
            name: ad.name || "",
            title: ad.title || "",
            description: ad.description || "",
            category: categoryArray,
            cooperationType: toArray(ad.cooperationType),
            militaryStatus: ad.militaryStatus || "",
            paymentMethod: paymentMethodArray,
            minSalary: toArray(ad.minSalary),
            maxSalary: toArray(ad.maxSalary),
            startTime: toArray(ad.startTime),
            endTime: toArray(ad.endTime),
            gender: ad.gender || "",
            experience: ad.experience || "",
            stateProvince: ad.state || "",
            city: ad.city || "",
            otherFeatures: ad.otherFeatures || "",
            companyName: ad.companyName || "",
            companyType: ad.companyType || "",
            benefits: ad.benefits || "",
            insurance: ad.insurance || "",
            education: ad.education || "",
            companyDescription: ad.companyDescription || "",
          });

          if (ad.images && ad.images.length > 0) {
            const apiImages = ad.images.map((img: any) => ({
              url: img.url,
              isMain: img.isMain || false,
            }));
            setImagesFromApi(apiImages);
            const main = apiImages.find((i: any) => i.isMain) || apiImages[0];
            setMainImage(main.url);
            useFormStore.getState().setField("editEmployer", adId, {
              imagesFromApi: apiImages,
            });
          } else {
            setImagesFromApi([]);
            setImages([]);
            setMainImage(null);
          }
        }
      } catch (err) {
        console.error("❌ [EditEmployee] خطا در بارگذاری آگهی:", err);
        showToast("خطا در دریافت اطلاعات آگهی", "error");
      }
    };

    fetchAd();
  }, [adId, user]);

  /* ===================== SUBMIT ===================== */
  const handleSubmit = async () => {
    try {
      if (!user?.id) throw new Error("شناسه کاربر یافت نشد");

      const formData = new FormData();
      formData.append("title", state.title || "");
      formData.append("name", state.name || "");
      formData.append("description", state.description || "");
      formData.append("otherFeatures", state.otherFeatures || "");
      formData.append("state", state.stateProvince || "");
      formData.append("city", state.city || "");
      formData.append("gender", state.gender || "");
      formData.append("experience", state.experience || "");
      formData.append("militaryStatus", state.militaryStatus || "");

      formData.append("category", state.category[0] || "");
      formData.append("cooperationType", state.cooperationType[0] || "");
      formData.append("paymentMethod", state.paymentMethod[0] || "");
      formData.append("minSalary", state.minSalary[0] || "");
      formData.append("maxSalary", state.maxSalary[0] || "");
      formData.append("startTime", state.startTime[0] || "");
      formData.append("endTime", state.endTime[0] || "");

      formData.append("adStatus", "updated");

      images.forEach((file) => formData.append("images", file));
      formData.append("imagesFromApi", JSON.stringify(imagesFromApi));

      await updateEmployerAd(user.id, adId, formData);

      showToast("تغییرات با موفقیت ذخیره شد!", "success");
      onSuccess?.();
    } catch (error: any) {
      showToast(error.message || "خطا در ثبت تغییرات", "error");
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
        className="relative w-full h-full p-0 md:p-6 bg-gray-100 rounded-md m-0"
      >
        {onCancel && (
          <div
            onClick={onCancel}
            className="absolute left-2 top-[1vh] md:left-4 md:top-[1vh] w-6 h-6 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-100 cursor-pointer z-10 text-sm md:text-base"
          >
            ✕
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 items-center mr-[10%] sm:mr-[5%] md:mr-[1%] w-full">
          {/* تصویر */}
          <div
            className="flex items-center justify-center md:justify-start cursor-pointer mb-4 w-full"
            onClick={() => setImageModalOpen(true)}
          >
            <img
              src={mainImage || "/images/img_form.svg"}
              alt="عکس کارفرما"
              className="w-[7vh] h-[7vh] object-cover rounded-md"
            />
            <span className="text-gray-400 font-medium mr-2">عکس کارفرما</span>
          </div>

          <div className="w-full">
            <FloatingInput
              placeholder="عنوان آگهی"
              value={state.title}
              onChange={(v) => setState({ ...state, title: v })}
              height="5vh"
            />
          </div>
          <div className="w-full">
            <ModalTriggerInput
              placeholder="توضیحات"
              value={state.description}
              onClick={() => setDescriptionModalOpen(true)}
              height="5vh"
            />
          </div>
          <div className="w-full">
            <FloatingInput
              placeholder="نام"
              value={state.name}
              onChange={(v) => setState({ ...state, name: v })}
              height="5vh"
            />
          </div>
          <div className="w-full">
            <ModalTriggerInput
              placeholder="دسته شغلی"
              value={state.category.join(", ")}
              onClick={() => setShowCategoryModal(true)}
              height="5vh"
            />
          </div>

          <div className="w-full">
            <FloatingSelect
              placeholder={provincesLoading ? "در حال بارگذاری..." : "استان"}
              options={provinceOptions}
              value={state.stateProvince}
              onChange={(val) => {
                const province = val as string;
                setState({ ...state, stateProvince: province, city: "" });
              }}
              height="5vh"
              width="77%"
            />
          </div>
          <div className="w-full">
            <FloatingSelect
              placeholder="شهر / منطقه"
              options={cityOptions}
              value={state.city}
              onChange={(val) => {
                const city = val as string;
                setState({ ...state, city });
              }}
              height="5vh"
              width="77%"
            />
          </div>

          <div className="w-full">
            <FloatingSelect
              placeholder="نوع همکاری"
              options={[
                { label: "تمام‌وقت", value: "full_time" },
                { label: "پاره‌وقت", value: "part_time" },
                { label: "پروژه‌ای", value: "contract" },
                { label: "کارآموزی", value: "internship" },
              ]}
              value={state.cooperationType[0] || ""}
              onChange={(v) =>
                setState({ ...state, cooperationType: [String(v)] })
              }
              height="5vh"
              width="77%"
            />
          </div>

          <div className="w-full">
            <FloatingSelect
              placeholder="وضعیت سربازی"
              options={[
                { label: "پایان خدمت", value: "completed" },
                { label: "معافیت دائم", value: "exempt" },
                { label: "در حال خدمت", value: "serving" },
                { label: "مشمول", value: "subject" },
              ]}
              value={state.militaryStatus}
              onChange={(v) =>
                setState({ ...state, militaryStatus: String(v) })
              }
              disabled={state.gender === "female"}
              height="5vh"
              width="77%"
            />
          </div>

          <div className="w-full">
            <FloatingSelect
              placeholder="شیوه پرداخت"
              options={[
                { label: "ماهانه", value: "monthly" },
                { label: "ساعتی", value: "hourly" },
                { label: "پورسانتی", value: "commission" },
              ]}
              value={state.paymentMethod[0] || ""}
              onChange={(v) =>
                setState({ ...state, paymentMethod: [String(v)] })
              }
              height="5vh"
              width="77%"
            />
          </div>

          <div className="w-full">
            <FloatingSelect
              placeholder="حداقل حقوق"
              options={[
                { label: "۱۰ تا ۱۵ میلیون", value: "10-15" },
                { label: "۱۵ تا ۲۰ میلیون", value: "15-20" },
                { label: "۲۰ تا ۳۰ میلیون", value: "20-30" },
              ]}
              value={state.minSalary[0] || ""}
              onChange={(v) => setState({ ...state, minSalary: [String(v)] })}
              height="5vh"
              width="77%"
            />
          </div>

          <div className="w-full">
            <FloatingSelect
              placeholder="حداکثر حقوق"
              options={[
                { label: "۲۰ میلیون", value: "20" },
                { label: "۳۰ میلیون", value: "30" },
                { label: "۴۰ میلیون+", value: "40+" },
              ]}
              value={state.maxSalary[0] || ""}
              onChange={(v) => setState({ ...state, maxSalary: [String(v)] })}
              height="5vh"
              width="77%"
            />
          </div>

          <div className="w-full">
            <FloatingSelect
              placeholder="ساعت شروع کار"
              options={[
                { label: "۸ صبح", value: "08:00" },
                { label: "۹ صبح", value: "09:00" },
                { label: "۱۰ صبح", value: "10:00" },
              ]}
              value={state.startTime[0] || ""}
              onChange={(v) => setState({ ...state, startTime: [String(v)] })}
              height="5vh"
              width="77%"
            />
          </div>

          <div className="w-full">
            <FloatingSelect
              placeholder="ساعت پایان کار"
              options={[
                { label: "۱۲", value: "12:00" },
                { label: "۱۴", value: "14:00" },
                { label: "۱۶", value: "16:00" },
                { label: "۱۷", value: "17:00" },
                { label: "۱۸", value: "18:00" },
              ]}
              value={state.endTime[0] || ""}
              onChange={(v) => setState({ ...state, endTime: [String(v)] })}
              height="5vh"
              width="77%"
            />
          </div>

          <div className="w-full">
            <FloatingSelect
              placeholder="جنسیت"
              options={[
                { label: "زن", value: "female" },
                { label: "مرد", value: "male" },
              ]}
              value={state.gender}
              onChange={(v) => setState({ ...state, gender: String(v) })}
              height="5vh"
              width="77%"
            />
          </div>

          <div className="w-full">
            <FloatingSelect
              placeholder="سابقه"
              options={[
                { label: "بدون سابقه", value: "none" },
                { label: "۱ تا ۳ سال", value: "1-3" },
                { label: "۳ تا ۵ سال", value: "3-5" },
                { label: "بیش از ۵ سال", value: "5+" },
              ]}
              value={state.experience}
              onChange={(v) => setState({ ...state, experience: String(v) })}
              height="5vh"
              width="77%"
            />
          </div>

          <div className="w-full">
            <ModalTriggerInput
              placeholder="ویژگی‌ها و امکانات"
              value={state.otherFeatures ? "مشخصات ثبت شد" : ""}
              onClick={() => setAttributesModalOpen(true)}
              height="5vh"
            />
          </div>

          <Button
            onClick={handleSubmit}
            className="w-[77%] h-[4vh] mb-[-10vh] rounded-[10px] mx-auto"
            style={{
              backgroundColor: "rgba(20,58,98,0.85)",
              color: "#fff",
              fontSize: "1.1rem",
              fontWeight: 600,
            }}
          >
            ثبت ویرایش
          </Button>
        </div>

        <SelectImageModal
          isOpen={imageModalOpen}
          onClose={() => setImageModalOpen(false)}
          onSelect={(imgs) => {
            const main = imgs.find((i: any) => i.isMain) || imgs[0];
            if (main) {
              setMainImage(
                main.file ? URL.createObjectURL(main.file) : main.src,
              );
            }
            const newFiles = imgs
              .filter((i: any) => i.file)
              .map((i: any) => i.file!) as File[];
            const fromApi = imgs
              .filter((i: any) => i.fromApi)
              .map((i: any) => ({ url: i.src, isMain: i.isMain || false }));
            setImages(newFiles);
            setImagesFromApi(fromApi);
            useFormStore.getState().setField("editEmployer", adId, {
              images: newFiles,
              imagesFromApi: fromApi,
            });
          }}
          parentRef={parentRef}
          userType="editEmployer"
          entityId={adId}
        />

        <AddRelatedDescriptionModal
          isOpen={descriptionModalOpen}
          onClose={() => setDescriptionModalOpen(false)}
          onSave={(desc) => setState({ ...state, description: desc })}
          parentRef={parentRef}
          titleModal="توضیحات موقعیت شغلی"
          titleAdd="شرح موقعیت شغلی:"
          titleAddHolder="موقعیت شغلی"
          titleDescription="معرفی شرکت:"
          userType="employer"
        />

        {showCategoryModal && (
          <AddJobModal
            parentRef={parentRef}
            onClose={() => setShowCategoryModal(false)}
            onSelectCategories={(cats) => {
              const categoryNames = cats.map((cat: any) => cat.name);
              setState({ ...state, category: categoryNames });
            }}
          />
        )}

        {attributesModalOpen && (
          <AdAttributesModal
            onClose={() => setAttributesModalOpen(false)}
            parentRef={parentRef}
            initialDataFromApi={{
              companyName: state.companyName || "",
              companyType: state.companyType || "",
              benefits: state.benefits || "",
              insurance: state.insurance || "",
              education: state.education || "",
              companyDescription: state.companyDescription || "",
            }}
          />
        )}
      </div>
    </>
  );
};

export default EditFormEmployee;
