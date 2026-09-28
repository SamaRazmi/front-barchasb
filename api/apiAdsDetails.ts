// api/apiAdsDetails.ts

const BASE_URL = "/api";

// ============================================================
// نوع بازگشتی برای fetchUserById
// ============================================================
interface UserInfo {
  phone: string;
  phoneNumber: string; // همیشه وجود دارد
  name: string;
  id: string;
}

// ============================================================
// دریافت اطلاعات آگهی‌ها
// ============================================================

export const fetchJobSeekerAd = async (id: string) => {
  const response = await fetch(`${BASE_URL}/ads/jobseeker/${id}`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error(`خطا در دریافت آگهی: ${response.status}`);
  return response.json();
};

export const fetchEmployerAd = async (id: string) => {
  const response = await fetch(`${BASE_URL}/ads/employer/${id}`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error(`خطا در دریافت آگهی: ${response.status}`);
  return response.json();
};

export const fetchSellerAd = async (id: string) => {
  const response = await fetch(`${BASE_URL}/ads/seller/${id}`, {
    credentials: "include",
  });
  if (!response.ok) throw new Error(`خطا در دریافت آگهی: ${response.status}`);
  return response.json();
};

// ============================================================
// دریافت اطلاعات کاربر (با پشتیبانی از انواع ورودی)
// ============================================================

export const fetchUserById = async (userId: any): Promise<UserInfo> => {
  console.log("🔍 fetchUserById دریافت شد:", userId);

  // اگر userId یک شیء است که خودش حاوی اطلاعات کاربر است
  if (typeof userId === "object" && userId !== null) {
    // اگر خود شیء دارای phoneNumber یا phone باشد، آن را به عنوان کاربر برگردان
    if (userId.phoneNumber || userId.phone || userId.fullName) {
      const phone = userId.phoneNumber || userId.phone || "";
      console.log("📞 شماره تماس از خود شیء کاربر:", phone);
      return {
        phone: phone,
        phoneNumber: phone,
        name: userId.fullName || userId.name || "",
        id: userId.id || userId._id || "",
      };
    }

    // در غیر این صورت، شناسه را از شیء استخراج کن
    let id =
      userId.id || userId._id || userId.userId || userId.ownerId || userId.uuid;
    if (!id && userId.user) id = userId.user.id || userId.user._id;
    if (!id && userId.owner) id = userId.owner.id || userId.owner._id;

    if (id) {
      // اگر شناسه پیدا شد، به سرور درخواست بده
      return await fetchUserFromServer(id);
    }

    // اگر هیچ شناسه‌ای پیدا نشد، کل شیء را به عنوان کاربر برگردان (احتمالاً خودش کاربر است)
    console.warn("⚠️ شناسه پیدا نشد، خود شیء به عنوان کاربر برگردانده می‌شود");
    const phone = userId.phoneNumber || userId.phone || "";
    return {
      phone: phone,
      phoneNumber: phone,
      name: userId.fullName || userId.name || "",
      id: userId.id || userId._id || "",
    };
  }

  // اگر userId یک رشته است
  if (typeof userId === "string" && userId.trim()) {
    return await fetchUserFromServer(userId.trim());
  }

  // اگر userId یک عدد یا نوع دیگر است
  if (userId) {
    return await fetchUserFromServer(String(userId));
  }

  // در غیر این صورت، کاربر خالی برگردان
  console.warn("⚠️ userId معتبر نیست، کاربر خالی برمی‌گردد");
  return { phone: "", phoneNumber: "", name: "", id: "" };
};

// ============================================================
// تابع کمکی برای درخواست به سرور
// ============================================================

const fetchUserFromServer = async (id: string): Promise<UserInfo> => {
  try {
    const response = await fetch(`${BASE_URL}/get-one-user/${id}`, {
      credentials: "include",
    });
    if (!response.ok) {
      console.error(`❌ خطا در دریافت کاربر: ${response.status}`);
      return { phone: "", phoneNumber: "", name: "", id: "" };
    }
    const result = await response.json();
    const userData = result?.data || result || {};

    const phone =
      userData?.phone || userData?.phoneNumber || userData?.phone_number || "";
    console.log("📞 شماره تماس از سرور:", phone);

    return {
      phone: phone,
      phoneNumber: phone,
      name: userData?.name || userData?.fullName || "",
      id: userData?.id || userData?._id || id,
    };
  } catch (error) {
    console.error("❌ خطا در fetchUserFromServer:", error);
    return { phone: "", phoneNumber: "", name: "", id: "" };
  }
};

// ============================================================
// دریافت شماره تماس آگهی‌دهنده (با اولویت خود آگهی)
// ============================================================

export const fetchOwnerPhone = async (adData: any): Promise<string> => {
  // اولویت اول: شماره تماس خود آگهی
  if (adData?.phoneNumber) {
    console.log("📞 شماره تماس از خود آگهی:", adData.phoneNumber);
    return adData.phoneNumber;
  }

  // در غیر این صورت، از اطلاعات کاربر دریافت می‌کنیم
  const ownerId = adData?.owner?.id || adData?.owner?._id || adData?.owner;
  if (!ownerId) {
    console.warn("⚠️ شناسه آگهی‌دهنده موجود نیست");
    return "";
  }

  try {
    const user = await fetchUserById(ownerId);
    // همیشه phone و phoneNumber در user وجود دارد
    return user?.phone || "";
  } catch (error) {
    console.error("❌ خطا در fetchOwnerPhone:", error);
    return "";
  }
};
