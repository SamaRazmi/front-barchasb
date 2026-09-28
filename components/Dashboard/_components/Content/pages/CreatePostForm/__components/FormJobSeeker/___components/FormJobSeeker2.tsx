"use client";
import React, { useState, useRef, useEffect } from "react";
import { PersonProvider } from "@/context/PersonContext";
import StepProgress from "@/components/common/StepProgress";
import FloatingSelect from "@/components/common/FloatingSelect";
import FloatingInput from "@/components/common/FloatingInput";
import Button from "@mui/material/Button";
import { useFormStore } from "@/store/formStore";
import FormJobSeeker1 from "./FormJobSeeker1";
import Form3 from "../../CommonForms/Form3";
import { useProvinces, useCities } from "@/api/authApi";
import ModalTriggerInput from "@/components/common/ModalTriggerInput";
import AddRelatedDescriptionModal from "@/components/common/AddRelatedDescriptionModal";
import AdditionalInfoModal from "./AdditionalInfoModal";
import { useUser } from "@/context/UserContext";
import { useQuery } from "@tanstack/react-query";
import { fetchMainCategories, fetchSubCategories } from "@/api/apiCategories";

// ---------------------- Helper ----------------------
const toArray = (value: string | number | (string | number)[]): any[] =>
  Array.isArray(value) ? value : value ? [value] : [];

// ------------------- Helper for id (supports both id and _id) -------------------
const getId = (item: any): string => item?.id || item?._id || "";

// -----------------------------------------------------------------
// Toast component with error/success colors
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
        top: "20px",
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
// Main component
// -----------------------------------------------------------------
const FormJobSeeker2: React.FC = () => {
  const parentRef = useRef<HTMLDivElement>(null);
  const { setField, getFormData } = useFormStore();
  const [experienceModalOpen, setExperienceModalOpen] = useState(false);
  const [additionalInfoOpen, setAdditionalInfoOpen] = useState(false);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const jobSeekerData = getFormData("jobSeeker") as Record<string, any>;
  const { user, loading } = useUser();
  const activeTab = jobSeekerData.person || "khodam";

  // ---------- main form state ----------
  const [state, setState] = useState({
    skills: toArray(jobSeekerData?.skills || []),
    resumeFile: jobSeekerData?.resumeFile || null,
    phoneNumber:
      jobSeekerData?.phoneNumber ||
      (activeTab === "khodam" ? user?.phone || "" : ""),
    province:
      jobSeekerData?.province ||
      (activeTab === "khodam" ? user?.province || "" : ""),
    city:
      jobSeekerData?.city || (activeTab === "khodam" ? user?.city || "" : ""),
    experienceDetails: jobSeekerData?.experienceDetails || "",
    otherDetails: jobSeekerData?.otherDetails || "",
    jobCategory: toArray(jobSeekerData?.jobCategory || []),
    portfolioFile: jobSeekerData?.portfolioFile || null,
  });

  const [selectedProvince, setSelectedProvince] = useState(
    state.province || "",
  );
  const [selectedCity, setSelectedCity] = useState(state.city || "");

  // ---------- Maps for id -> name ----------
  const [mainCategoryIdToName, setMainCategoryIdToName] = useState<
    Map<string, string>
  >(new Map());
  const [skillIdToName, setSkillIdToName] = useState<Map<string, string>>(
    new Map(),
  );

  // ---------- Query for main categories ----------
  const {
    data: mainData,
    isLoading: mainLoading,
    error: mainError,
  } = useQuery({
    queryKey: ["main-categories"],
    queryFn: fetchMainCategories,
  });
  const mainCategories = mainData?.categories || [];

  // debug logs
  useEffect(() => {
    if (mainError) console.error("❌ Error fetching categories:", mainError);
    if (mainData) console.log("✅ Categories received:", mainData);
  }, [mainError, mainData]);

  // fill main category map (using id or _id)
  useEffect(() => {
    if (mainCategories.length) {
      const map = new Map();
      mainCategories.forEach((cat: any) => {
        const id = getId(cat);
        if (id) map.set(id, cat.name);
      });
      setMainCategoryIdToName(map);
    }
  }, [mainCategories]);

  // job category options (main categories) – value is id or _id
  const jobCategoryOptions = mainCategories.map((cat: any) => ({
    label: cat.name,
    value: getId(cat),
  }));

  // ---------- Fetch subcategories (skills) for selected main categories ----------
  const [skillsOptions, setSkillsOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [isFetchingSkills, setIsFetchingSkills] = useState(false);

  useEffect(() => {
    const fetchAllSubCategories = async () => {
      if (!state.jobCategory.length) {
        setSkillsOptions([]);
        setSkillIdToName(new Map());
        return;
      }
      setIsFetchingSkills(true);
      try {
        const promises = state.jobCategory.map((parentId: string) =>
          fetchSubCategories(parentId).then((res) => res.categories || []),
        );
        const results = await Promise.all(promises);
        const allSubs = results.flat();
        const uniqueMap = new Map();
        const idToNameMap = new Map();
        allSubs.forEach((sub: any) => {
          const id = getId(sub);
          if (!id) return;
          if (!uniqueMap.has(sub.name)) {
            uniqueMap.set(sub.name, { label: sub.name, value: id });
            idToNameMap.set(id, sub.name);
          }
        });
        setSkillsOptions(Array.from(uniqueMap.values()));
        setSkillIdToName(idToNameMap);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
        setSkillsOptions([]);
        setSkillIdToName(new Map());
      } finally {
        setIsFetchingSkills(false);
      }
    };

    fetchAllSubCategories();
  }, [state.jobCategory]);

  // Clear skills when main categories change
  useEffect(() => {
    setState((prev) => ({ ...prev, skills: [] }));
  }, [state.jobCategory]);

  // ---------- Province and city ----------
  const { data: provincesData, isLoading: provincesLoading } = useProvinces();
  const { data: citiesData } = useCities(selectedProvince);
  const provinceOptions =
    provincesData?.map((p: { id: number; name: string }) => ({
      label: p.name,
      value: p.name,
    })) || [];
  const cityOptions =
    citiesData?.map((c: string) => ({ label: c, value: c })) || [];

  // ---------- Validation and navigation ----------
  const [showPrev, setShowPrev] = useState(false);
  const [showNext, setShowNext] = useState(false);

  // -----------------------------------------------------------------
  // Toast state
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

  // ---------- Next step handler ----------
  const handleNext = () => {
    const errors: string[] = [];
    if (!state.skills || state.skills.length === 0) errors.push("مهارت‌ها");
    if (!state.phoneNumber) errors.push("شماره تماس");
    if (!state.experienceDetails) errors.push("جزئیات سابقه کار");
    if (!state.otherDetails) errors.push("سایر توضیحات");
    if (!state.jobCategory || state.jobCategory.length === 0)
      errors.push("دسته شغلی");
    if (!state.province) errors.push("استان");
    if (!state.city) errors.push("شهر");

    if (errors.length > 0) {
      showToast("لطفاً فیلدهای زیر را پر کنید: " + errors.join("، "), "error");
      return;
    }

    // ✅ Convert main category ids to names (using map that works with id or _id)
    const categoryNames = state.jobCategory.map(
      (id: string) => mainCategoryIdToName.get(id) || id,
    );
    // ✅ Convert skill ids to names
    const skillNames = state.skills.map(
      (id: string) => skillIdToName.get(id) || id,
    );

    // Store in store (names instead of ids)
    setField("jobSeeker", "jobCategory", categoryNames);
    setField("jobSeeker", "skills", skillNames);
    // other fields unchanged
    setField("jobSeeker", "resumeFile", state.resumeFile);
    setField("jobSeeker", "phoneNumber", state.phoneNumber);
    setField("jobSeeker", "province", state.province);
    setField("jobSeeker", "city", state.city);
    setField("jobSeeker", "experienceDetails", state.experienceDetails);
    setField("jobSeeker", "otherDetails", state.otherDetails);
    setField("jobSeeker", "portfolioFile", state.portfolioFile);

    console.log(
      "💾 All stored data in jobSeeker (category and skill names):",
      getFormData("jobSeeker"),
    );
    setShowNext(true);
  };

  const handleExperienceSave = (newValue: string) => {
    setState((prev) => ({ ...prev, experienceDetails: newValue }));
    setExperienceModalOpen(false);
  };

  // ===================================================================
  // 🔧 FIX: Convert stored names back to IDs when re‑entering this step
  // ===================================================================
  const hasConvertedCategories = useRef(false);
  const hasConvertedSkills = useRef(false);

  // Convert stored category names to IDs
  useEffect(() => {
    if (hasConvertedCategories.current) return;
    if (mainCategoryIdToName.size === 0) return;

    const stored = jobSeekerData?.jobCategory;
    if (stored && Array.isArray(stored) && stored.length > 0) {
      const first = stored[0];
      const isName = !mainCategoryIdToName.has(first);
      if (isName) {
        // Build reverse map: name -> id
        const nameToId = new Map();
        mainCategories.forEach((cat: any) => {
          const id = getId(cat);
          if (id) nameToId.set(cat.name, id);
        });
        const ids = stored.map((name: string) => nameToId.get(name) || name);
        setState((prev) => ({ ...prev, jobCategory: ids }));
      }
    }
    hasConvertedCategories.current = true;
  }, [mainCategoryIdToName, mainCategories, jobSeekerData?.jobCategory]);

  // Convert stored skill names to IDs
  useEffect(() => {
    if (hasConvertedSkills.current) return;
    if (skillIdToName.size === 0) return;

    const stored = jobSeekerData?.skills;
    if (stored && Array.isArray(stored) && stored.length > 0) {
      const first = stored[0];
      const isName = !skillIdToName.has(first);
      if (isName) {
        // Build reverse map for skills
        const nameToId = new Map();
        skillsOptions.forEach((opt) => {
          nameToId.set(opt.label, opt.value);
        });
        const ids = stored.map((name: string) => nameToId.get(name) || name);
        setState((prev) => ({ ...prev, skills: ids }));
      }
    }
    hasConvertedSkills.current = true;
  }, [skillIdToName, skillsOptions, jobSeekerData?.skills]);

  // -----------------------------------------------------------------

  if (showPrev) return <FormJobSeeker1 />;
  if (showNext) return <Form3 />;

  return (
    <>
      {/* Toast at top */}
      <Toast
        message={toast.message}
        progress={toast.progress}
        visible={toast.visible}
        type={toast.type}
      />

      <PersonProvider>
        <div
          className="relative z-10 flex flex-col sm:flex-row justify-center items-stretch sm:items-start auto sm:h-[90%] mt-4 px-3"
          ref={parentRef}
        >
          <div
            className="absolute inset-0 w-full h-full rounded-[20px]"
            style={{ backgroundColor: "rgba(247, 247, 247, 0.98)", zIndex: 0 }}
          />
          <img
            src="/images/bg_support_formik_desk.svg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover rounded-[20px]"
            style={{ zIndex: 1 }}
            loading="lazy"
          />
          <div className="flex flex-col justify-start h-[95%] p-4 relative z-20 w-[77%] mx-auto">
            <StepProgress currentStep={2} />

            <div className="relative z-20 flex flex-col sm:flex-row gap-4 w-[95%] mt-[5vh] mr-[8%]">
              {/* Column 1 */}
              <div className="flex flex-col gap-4 flex-1">
                <FloatingSelect
                  placeholder={
                    mainLoading ? "در حال بارگذاری دسته‌ها..." : "دسته شغلی"
                  }
                  options={jobCategoryOptions}
                  value={state.jobCategory}
                  onChange={(v) => {
                    const selected = toArray(v);
                    setState({ ...state, jobCategory: selected });
                  }}
                  multiSelect
                  showCloseIcon={true}
                />
                <FloatingSelect
                  placeholder={
                    isFetchingSkills
                      ? "در حال بارگذاری مهارت‌ها..."
                      : "مهارت‌ها"
                  }
                  options={skillsOptions}
                  value={state.skills}
                  onChange={(v) => setState({ ...state, skills: toArray(v) })}
                  multiSelect
                  showCloseIcon={true}
                />

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
                    setState((prev) => ({ ...prev, resumeFile: file }));
                    setField("jobSeeker", "resumeFile", file);
                  }}
                />
                <FloatingInput
                  placeholder="شماره تلفن"
                  inputType="number"
                  value={state.phoneNumber}
                  onChange={(v) => setState({ ...state, phoneNumber: v })}
                />
                <ModalTriggerInput
                  placeholder="سوابق شغلی"
                  value={state.experienceDetails}
                  onClick={() => setExperienceModalOpen(true)}
                />
                <ModalTriggerInput
                  placeholder="سایر مشخصات"
                  value={
                    jobSeekerData?.marital ||
                    jobSeekerData?.gender ||
                    jobSeekerData?.militaryStatus
                      ? "ثبت شده"
                      : ""
                  }
                  onClick={() => setAdditionalInfoOpen(true)}
                />
              </div>

              {/* Column 2 */}
              <div className="flex flex-col gap-4 flex-1">
                <ModalTriggerInput
                  placeholder="بارگذاری فایل رزومه (اختیاری)"
                  value={state.resumeFile ? state.resumeFile.name : ""}
                  type="file"
                  onClick={() => resumeInputRef.current?.click()}
                />
                <ModalTriggerInput
                  placeholder="بارگذاری نمونه کارها (PDF) (اختیاری)"
                  value={state.portfolioFile ? state.portfolioFile.name : ""}
                  type="file"
                  onClick={() => portfolioInputRef.current?.click()}
                />
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
                    setState((prev) => ({ ...prev, portfolioFile: file }));
                    setField("jobSeeker", "portfolioFile", file);
                  }}
                />
                <FloatingSelect
                  placeholder={
                    provincesLoading ? "در حال بارگذاری..." : "استان"
                  }
                  options={provinceOptions}
                  value={state.province}
                  onChange={(val) => {
                    const province = val as string;
                    setSelectedProvince(province);
                    setState({ ...state, province, city: "" });
                    setSelectedCity("");
                  }}
                />
                <FloatingSelect
                  placeholder="شهر / منطقه"
                  options={cityOptions}
                  value={state.city}
                  onChange={(val) =>
                    setState({ ...state, city: val as string })
                  }
                />

                <div className="flex gap-4 w-[75%] mt-[-1vh]">
                  <Button
                    onClick={() => setShowPrev(true)}
                    className="w-[76%] h-[5vh] md:h-[7vh]  rounded-[10px] text-[2vh] md:text-[2.4vh] whitespace-nowrap"
                    style={{
                      backgroundColor: "#00B6FF",
                      color: "#FFFFFF",
                      fontWeight: 600,
                      textTransform: "none",
                    }}
                  >
                    مرحله قبل
                  </Button>

                  <Button
                    onClick={handleNext}
                    className="w-[76%] h-[5vh] md:h-[7vh]  rounded-[10px] text-[2vh] md:text-[2.4vh] whitespace-nowrap"
                    style={{
                      backgroundColor: "rgba(20,58,98,0.85)",
                      color: "#FFFFFF",
                      fontWeight: 600,
                      textTransform: "none",
                    }}
                  >
                    مرحله بعد
                  </Button>
                </div>
              </div>
            </div>

            <AddRelatedDescriptionModal
              isOpen={experienceModalOpen}
              onClose={() => setExperienceModalOpen(false)}
              parentRef={parentRef}
              titleModal="سوابق شغلی"
              titleAdd="شرح سوابق"
              titleAddHolder="موقعیت شغلی"
              titleDescription="درباره من:"
              userType="jobSeeker"
              onSave={handleExperienceSave}
            />

            {additionalInfoOpen && (
              <AdditionalInfoModal
                onClose={() => setAdditionalInfoOpen(false)}
                parentRef={parentRef}
                onSave={(value: string) => {
                  setState((prev) => ({ ...prev, otherDetails: value }));
                  setAdditionalInfoOpen(false);
                }}
              />
            )}
          </div>
        </div>
      </PersonProvider>
    </>
  );
};

export default FormJobSeeker2;
