"use client";

const BASE_URL = "/api";

// GET RECENT VIEWS
export const getRecentViews = async (
  ownerId: string,
  time: string = "all",
  adType: string = "all",
) => {
  console.log("🔍 [getRecentViews] شروع درخواست");
  console.log("   📌 ownerId:", ownerId);
  console.log("   📌 time:", time);
  console.log("   📌 adType:", adType);

  if (!ownerId) {
    console.error("❌ [getRecentViews] ownerId الزامی است");
    throw new Error("ownerId is required");
  }

  const url = `${BASE_URL}/users/${ownerId}/recent-views?time=${time}&adType=${adType}`;
  console.log(`🌐 [getRecentViews] ارسال درخواست به: ${url}`);

  try {
    const res = await fetch(url, {
      method: "GET",
      credentials: "include",
    });

    console.log(
      `📡 [getRecentViews] وضعیت پاسخ: ${res.status} ${res.statusText}`,
    );

    const result = await res.json();
    console.log("📦 [getRecentViews] داده‌های خام دریافت‌شده:", result);

    if (!res.ok) {
      console.error(
        `❌ [getRecentViews] خطای HTTP ${res.status}:`,
        result?.message,
      );
      throw new Error(result?.message || "Failed to fetch recent views");
    }

    // مرتب‌سازی از جدید به قدیم بر اساس viewedAt
    const sorted = result.sort(
      (a: any, b: any) =>
        new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime(),
    );
    console.log(
      `✅ [getRecentViews] دریافت ${sorted.length} بازدید (مرتب‌شده)`,
    );
    console.log("   📋 نمونه اول:", sorted[0] || "هیچ");
    return sorted;
  } catch (error) {
    console.error("❌ [getRecentViews] خطا در دریافت بازدیدهای اخیر:", error);
    throw error;
  }
};

// ADD / UPDATE RECENT VIEW
export const addRecentView = async (
  ownerId: string,
  adId: string,
  adType: string,
) => {
  console.log("➕ [addRecentView] شروع ثبت بازدید جدید");
  console.log("   📌 ownerId:", ownerId);
  console.log("   📌 adId:", adId);
  console.log("   📌 adType:", adType);

  if (!ownerId || !adId || !adType) {
    console.error("❌ [addRecentView] پارامترهای الزامی缺失");
    throw new Error("ownerId, adId and adType are required");
  }

  const url = `${BASE_URL}/ads/${adType}/${ownerId}/${adId}/view`;
  console.log(`🌐 [addRecentView] ارسال درخواست به: ${url}`);

  try {
    const res = await fetch(url, {
      method: "POST",
      credentials: "include",
    });

    console.log(
      `📡 [addRecentView] وضعیت پاسخ: ${res.status} ${res.statusText}`,
    );

    const result = await res.json();
    console.log("📦 [addRecentView] پاسخ سرور:", result);

    if (!res.ok) {
      console.error(
        `❌ [addRecentView] خطای HTTP ${res.status}:`,
        result?.message,
      );
      throw new Error(result?.message || "Failed to add recent view");
    }

    console.log("✅ [addRecentView] بازدید با موفقیت ثبت شد");
    return result;
  } catch (error) {
    console.error("❌ [addRecentView] خطا در ثبت بازدید:", error);
    throw error;
  }
};
