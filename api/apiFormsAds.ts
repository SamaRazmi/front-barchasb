"use client";

/* =======================
   DIGITAL AD - FRONTEND
======================= */

const BASE_URL = "/api";

const fetchWithToken = async (url: string, options: any = {}) => {
  const headers = { ...options.headers };
  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  const contentType = res.headers.get("content-type");
  let data;
  if (contentType && contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    console.error("❌ API ERROR status:", res.status, res.statusText);
    console.error("❌ API ERROR body:", data);
    throw new Error(data?.message || `HTTP ${res.status}`);
  }

  return data;
};

/* =======================
   DIGITAL AD
======================= */
export const submitDigitalAd = async (formData: any, ownerId: string) => {
  console.log("📝 [دیجیتال] شروع ارسال");
  console.log("📄 [دیجیتال] توضیحات (description):", formData.description);
  console.log(
    "📄 [دیجیتال] توضیحات تکمیلی (additionalInfo):",
    formData.additionalInfo,
  );
  console.log(
    "📄 [دیجیتال] توضیحات پروژه‌ها (projectDescription):",
    formData.projectDescription,
  );
  console.log("📍 [دیجیتال] استان (state):", formData.state);
  console.log("📍 [دیجیتال] شهر (city):", formData.city);

  const form = new FormData();

  form.append("owner", ownerId);
  form.append("title", formData.title || "");
  form.append("description", formData.description || "");
  form.append("digitalTotalDesc", formData.additionalInfo || "");

  (formData.projectName || []).forEach((name: string) =>
    form.append("projectNames[]", name),
  );
  (formData.projectDescription || []).forEach((desc: string) =>
    form.append("projectDescriptions[]", desc),
  );

  form.append("minBudget", formData.minBudget || "");
  form.append("maxBudget", formData.maxBudget || "");

  if (Array.isArray(formData.skills)) {
    form.append(
      "requiredSkills",
      JSON.stringify(formData.skills.map((s: string) => ({ name: s }))),
    );
  }

  // شخص و شماره دیگر
  form.append(
    "person",
    formData.person === "khodam" ? "self" : formData.person || "self",
  );
  form.append("phoneOther", formData.phoneOther || "");

  // ✅ اصلاح: خواندن enableChat و enablePhone از formData (نه remote و thursdayHalf)
  const enableChat =
    formData.enableChat !== undefined ? JSON.parse(formData.enableChat) : false;
  const enablePhone =
    formData.enablePhone !== undefined
      ? JSON.parse(formData.enablePhone)
      : false;
  form.append("enableChat", String(enableChat));
  form.append("enablePhone", String(enablePhone));
  form.append("verifyCode", formData.verifyCode || "");

  form.append(
    "paymentMethod",
    formData.paymentMethod === "subscription"
      ? "Subscription"
      : formData.paymentMethod === "wallet"
        ? "Wallet"
        : "Bank card",
  );

  (formData.images || []).forEach((file: File, index: number) => {
    form.append("images", file);
    if (index === 0) form.append("mainImageIndex", "0");
  });

  form.append("requestType", formData.requestType || "");
  form.append("durationUnit", formData.durationUnit || "");
  form.append("durationAmount", formData.durationAmount || "");

  form.append("province", formData.state || "");
  form.append("city", formData.city || "");

  console.log(
    "📤 [دیجیتال] فیلدهای ارسالی:",
    Array.from(form.entries()).filter(([key]) =>
      [
        "description",
        "digitalTotalDesc",
        "province",
        "city",
        "person",
        "phoneOther",
        "enableChat",
        "enablePhone",
      ].includes(key),
    ),
  );

  try {
    const result = await fetchWithToken(`${BASE_URL}/ads/digital`, {
      method: "POST",
      body: form,
    });
    console.log("✅ [دیجیتال] آگهی با موفقیت ذخیره شد:", result);
    return result;
  } catch (error) {
    console.error("❌ [دیجیتال] خطا در ذخیره‌سازی:", error);
    throw error;
  }
};

/* =======================
   EMPLOYER AD
======================= */
export const submitEmployerAd = async (formData: any, ownerId: string) => {
  console.log("🧠 [کارفرما] داده‌های اولیه:", formData);
  console.log(
    "📄 [کارفرما] توضیحات شرکت (additionalInfo):",
    formData.additionalInfo,
  );
  console.log(
    "📄 [کارفرما] توضیحات موقعیت‌ها (positionDescription):",
    formData.positionDescription,
  );
  console.log("📍 [کارفرما] استان (state):", formData.state);
  console.log("📍 [کارفرما] شهر (city):", formData.city);

  const form = new FormData();
  form.append("owner", ownerId);
  form.append("name", formData.name || "");
  form.append("title", formData.title || "");

  if (formData.categories && Array.isArray(formData.categories)) {
    form.append("categories", JSON.stringify(formData.categories));
  } else {
    form.append("categories", JSON.stringify([]));
  }

  // شخص و شماره دیگر
  form.append(
    "person",
    formData.person === "khodam" ? "self" : formData.person || "self",
  );
  form.append("phoneOther", formData.phoneOther || "");

  // ✅ اصلاح: خواندن enableChat و enablePhone از formData
  const enableChat =
    formData.enableChat !== undefined ? JSON.parse(formData.enableChat) : false;
  const enablePhone =
    formData.enablePhone !== undefined
      ? JSON.parse(formData.enablePhone)
      : false;
  form.append("enableChat", String(enableChat));
  form.append("enablePhone", String(enablePhone));

  form.append(
    "adPaymentMethod",
    formData.paymentMethod === "subscription"
      ? "Subscription"
      : formData.paymentMethod === "wallet"
        ? "Wallet"
        : "Bank card",
  );
  form.append("cooperationType", formData.cooperationType?.join(", ") || "");
  form.append("gender", formData.gender || "");
  form.append("militaryStatus", formData.militaryStatus || "None");
  form.append("experience", formData.experience || "");
  form.append("isRemote", String(formData.remote === "true"));
  form.append("thursdayUntilNoon", String(formData.thursdayHalf === "true"));
  form.append("startTime", formData.startTime?.[0] || "");
  form.append("endTime", formData.endTime?.[0] || "");
  form.append("minSalary", formData.minSalary?.[0] || "");
  form.append("maxSalary", formData.maxSalary?.[0] || "");
  form.append("companyName", formData.companyName || "");
  form.append("companyType", formData.companyType || "");
  form.append("benefits", formData.benefits || "");
  form.append("insurance", formData.insurance || "");
  form.append("education", formData.education || "");
  form.append("companyDescription", formData.additionalInfo || "");
  form.append("state", formData.state || "");
  form.append("city", formData.city || "");

  if (Array.isArray(formData.positionName)) {
    formData.positionName.forEach((name: string, index: number) => {
      form.append(`jobDetails[${index}][title]`, name || "");
      form.append(
        `jobDetails[${index}][description]`,
        formData.positionDescription?.[index] || "",
      );
    });
  }

  (formData.images || []).forEach((file: File, index: number) => {
    form.append("images", file);
    if (index === 0) form.append("mainImageIndex", "0");
  });

  console.log(
    "📤 [کارفرما] فیلدهای توضیحی ارسالی:",
    Array.from(form.entries()).filter(([key]) =>
      [
        "companyDescription",
        "jobDetails",
        "state",
        "city",
        "person",
        "phoneOther",
        "enableChat",
        "enablePhone",
      ].some((k) => key.includes(k)),
    ),
  );

  try {
    const result = await fetchWithToken(`${BASE_URL}/ads/employer`, {
      method: "POST",
      body: form,
    });
    console.log("✅ [کارفرما] آگهی با موفقیت ذخیره شد:", result);
    return result;
  } catch (error) {
    console.error("❌ [کارفرما] خطا در ذخیره‌سازی:", error);
    throw error;
  }
};

/* =======================
   JOB SEEKER AD
======================= */
export const submitJobSeekerAd = async (formData: any, ownerId: string) => {
  console.log("📝 [جوینده کار] شروع ارسال");
  console.log(
    "📄 [جوینده کار] درباره من (otherDetails):",
    formData.otherDetails,
  );
  console.log("📄 [جوینده کار] توضیحات کاربر (userDesc):", formData.userDesc);
  console.log(
    "📄 [جوینده کار] توضیحات سابقه شغلی (experienceDescription):",
    formData.experienceDescription,
  );
  console.log("📍 [جوینده کار] استان (province):", formData.province);
  console.log("📍 [جوینده کار] شهر (city):", formData.city);

  const form = new FormData();
  form.append("owner", ownerId || "");
  form.append("name", formData.name || "");
  form.append("phoneNumber", formData.phoneNumber || "");
  form.append(
    "category",
    Array.isArray(formData.jobCategory)
      ? formData.jobCategory.join(",")
      : formData.jobCategory || "",
  );
  form.append("state", formData.province || "");
  form.append("city", formData.city || "");
  form.append("age", formData.age || "");
  form.append("gender", formData.gender || "");
  form.append("maritalStatus", formData.maritalStatus || "");
  form.append("militaryStatus", formData.militaryStatus || "");
  form.append("education", formData.education || "");
  form.append("suggestedSalaryIRT", formData.salary || "");
  form.append("aboutMe", formData.otherDetails || "");

  // شخص و شماره دیگر
  form.append(
    "person",
    formData.person === "khodam" ? "self" : formData.person || "self",
  );
  form.append("phoneOther", formData.phoneOther || "");

  // ✅ اصلاح: خواندن enableChat و enablePhone از formData
  const enableChat =
    formData.enableChat !== undefined ? JSON.parse(formData.enableChat) : false;
  const enablePhone =
    formData.enablePhone !== undefined
      ? JSON.parse(formData.enablePhone)
      : false;
  form.append("enableChat", String(enableChat));
  form.append("enablePhone", String(enablePhone));

  form.append(
    "paymentMethod",
    formData.paymentMethod === "subscription"
      ? "Subscription"
      : formData.paymentMethod === "wallet"
        ? "Wallet"
        : "Bank card",
  );
  form.append("remote", String(formData.remote === "true"));
  form.append("thursdayHalf", String(formData.thursdayHalf === "true"));
  form.append("isVerified", String(formData.verify === 1));
  form.append("verifyCode", formData.verifyCode || "");

  (formData.skills || []).forEach((skill: string) =>
    form.append("skills[]", skill),
  );
  (formData.experiencePosition || []).forEach((title: string, i: number) => {
    form.append(`careerHistory[${i}][title]`, title);
    form.append(
      `careerHistory[${i}][description]`,
      formData.experienceDescription?.[i] || "",
    );
  });
  form.append("userDesc", formData.userDesc || "");
  (formData.images || []).forEach((file: File) => form.append("images", file));

  console.log(
    "📤 [جوینده کار] فیلدهای توضیحی ارسالی:",
    Array.from(form.entries()).filter(([key]) =>
      [
        "aboutMe",
        "userDesc",
        "careerHistory",
        "state",
        "city",
        "person",
        "phoneOther",
        "enableChat",
        "enablePhone",
      ].some((k) => key.includes(k)),
    ),
  );

  try {
    const adResult = await fetchWithToken(`${BASE_URL}/ads/jobseeker`, {
      method: "POST",
      body: form,
    });
    const adId = adResult?.id;
    if (!adId) throw new Error("❌ JobSeeker Ad ID not returned");

    if (formData.resumeFile) {
      const resumeForm = new FormData();
      resumeForm.append("resumeFile", formData.resumeFile);
      await fetchWithToken(`${BASE_URL}/ads/jobseeker/${adId}/resume`, {
        method: "POST",
        body: resumeForm,
      });
    }

    if (formData.portfolioFile) {
      const workForm = new FormData();
      workForm.append("workSampleFile", formData.portfolioFile);
      await fetchWithToken(`${BASE_URL}/ads/jobseeker/${adId}/work-sample`, {
        method: "POST",
        body: workForm,
      });
    }

    console.log("✅ [جوینده کار] آگهی با موفقیت ذخیره شد:", adResult);
    return adResult;
  } catch (error) {
    console.error("❌ [جوینده کار] خطا در ذخیره‌سازی:", error);
    throw error;
  }
};

/* =======================
   SELLER AD
======================= */
export const submitSellerAd = async (formData: any, ownerId: string) => {
  console.log("📝 [فروشنده] شروع ارسال");
  console.log("📄 [فروشنده] توضیحات (description):", formData.description);
  console.log("📍 [فروشنده] استان (province):", formData.province);
  console.log("📍 [فروشنده] شهر (city):", formData.city);
  console.log("💰 [فروشنده] قیمت خام (price) به تومان:", formData.price);
  console.log("📌 [فروشنده] وضعیت (status):", formData.status);
  console.log("📌 [فروشنده] کاربرد (usage):", formData.usage);
  console.log("📌 [فروشنده] priceOptions:", formData.priceOptions);

  const form = new FormData();
  form.append("owner", ownerId);
  form.append("title", formData.title || "");
  form.append("description", formData.description || "");
  form.append("category", formData.category || "");
  form.append("state", formData.province || "");
  form.append("city", formData.city || "");

  // شخص و شماره دیگر
  form.append(
    "person",
    formData.person === "khodam" ? "self" : formData.person || "self",
  );
  form.append("phoneOther", formData.phoneOther || "");

  // ✅ اصلاح: خواندن enableChat و enablePhone از formData
  const enableChat =
    formData.enableChat !== undefined ? JSON.parse(formData.enableChat) : false;
  const enablePhone =
    formData.enablePhone !== undefined
      ? JSON.parse(formData.enablePhone)
      : false;
  form.append("enableChat", String(enableChat));
  form.append("enablePhone", String(enablePhone));

  form.append(
    "paymentMethod",
    formData.paymentMethod === "subscription"
      ? "Subscription"
      : formData.paymentMethod === "wallet"
        ? "Wallet"
        : "Bank card",
  );

  let priceValue = 0;
  if (formData.price) {
    const cleanedPrice = String(formData.price).replace(/,/g, "");
    priceValue = parseInt(cleanedPrice, 10) || 0;
  }
  console.log("💰 [فروشنده] قیمت ارسالی (priceIRT) به تومان:", priceValue);
  form.append("priceIRT", String(priceValue));

  form.append("isFixedPrice", String(formData.isFixedPrice || false));

  let isNegotiable = false;
  if (formData.priceOptions) {
    try {
      const priceOptions =
        typeof formData.priceOptions === "string"
          ? JSON.parse(formData.priceOptions)
          : formData.priceOptions;
      isNegotiable = priceOptions.swap === true;
    } catch (e) {
      // ignore
    }
  }
  console.log("🔄 [فروشنده] isNegotiable (معاوضه):", isNegotiable);
  form.append("isNegotiable", String(isNegotiable));

  form.append("hasWarranty", String(formData.warranty === "true"));
  form.append("isShippable", String(formData.shipping === "true"));

  let statusValue = "";
  if (Array.isArray(formData.status) && formData.status.length > 0) {
    statusValue = formData.status[0];
  } else if (typeof formData.status === "string") {
    statusValue = formData.status;
  }
  console.log("📌 [فروشنده] status ارسالی:", statusValue);
  form.append("status", statusValue);

  let usageValue = "";
  if (Array.isArray(formData.usage) && formData.usage.length > 0) {
    usageValue = formData.usage[0];
  } else if (typeof formData.usage === "string") {
    usageValue = formData.usage;
  }
  console.log("📌 [فروشنده] usage ارسالی:", usageValue);
  form.append("usage", usageValue);

  form.append(
    "extraFeatures",
    JSON.stringify({
      ...JSON.parse(formData.attributes || "{}"),
      ...JSON.parse(formData.additionalOptions || "{}"),
      status: statusValue,
      usage: usageValue,
    }),
  );

  if (formData.images && formData.images.length > 0) {
    formData.images.forEach((file: File, idx: number) => {
      form.append("images", file);
      if (idx === 0) form.append("mainImageIndex", "0");
    });
  } else if (formData.mainImage) {
    form.append("imagesUrls", formData.mainImage);
    form.append("mainImageIndex", "0");
  }

  console.log(
    "📤 [فروشنده] فیلدهای ارسالی (کلیدهای مهم):",
    Array.from(form.entries()).filter(([key]) =>
      [
        "description",
        "state",
        "city",
        "priceIRT",
        "status",
        "usage",
        "isNegotiable",
        "paymentMethod",
        "person",
        "phoneOther",
        "enableChat",
        "enablePhone",
      ].includes(key),
    ),
  );

  try {
    const result = await fetchWithToken(`${BASE_URL}/ads/seller`, {
      method: "POST",
      body: form,
    });
    console.log("✅ [فروشنده] آگهی با موفقیت ذخیره شد:", result);
    return result;
  } catch (error) {
    console.error("❌ [فروشنده] خطا در ذخیره‌سازی:", error);
    throw error;
  }
};
