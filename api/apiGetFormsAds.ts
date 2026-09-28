/* =======================
   GET ADS - FRONTEND
   با پشتیبانی از صفحه‌بندی و پروکسی
======================= */

// استفاده از BASE_URL از طریق پروکسی (همانند بقیه API‌ها)
// در Next.js با پروکسی، مسیر /api به سرور بک‌اند هدایت می‌شود
const BASE_URL = "/api"; // یا می‌توانید از متغیر محیطی استفاده کنید

/* =======================
   EMPLOYER ADS (GET)
======================= */
export const getEmployerAds = async (page: number = 1, limit: number = 10) => {
  const res = await fetch(
    `${BASE_URL}/ads/employer?page=${page}&limit=${limit}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  const result = await res.json();

  console.log("📥 EMPLOYER ADS RECEIVED:", result);

  if (!res.ok) {
    throw new Error(result?.message || "Failed to fetch employer ads");
  }

  const ads = result.data || [];
  const pagination = result.pagination || {
    page,
    limit,
    total: 0,
    totalPages: 0,
  };

  // مرتب‌سازی از جدید به قدیم
  ads.sort(
    (a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return {
    data: ads,
    pagination,
  };
};

/* =======================
   JOB SEEKER ADS (GET)
======================= */
export const getJobSeekerAds = async (page: number = 1, limit: number = 10) => {
  const res = await fetch(
    `${BASE_URL}/ads/jobseeker?page=${page}&limit=${limit}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  const result = await res.json();

  console.log("📥 JOB SEEKER ADS RECEIVED:", result);

  if (!res.ok) {
    throw new Error(result?.message || "Failed to fetch job seeker ads");
  }

  const ads = result.data || [];
  const pagination = result.pagination || {
    page,
    limit,
    total: 0,
    totalPages: 0,
  };

  ads.sort(
    (a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return {
    data: ads,
    pagination,
  };
};

/* =======================
   SELLER ADS (GET)
======================= */
export const getSellerAds = async (page: number = 1, limit: number = 10) => {
  // seller API نیز page و limit را پشتیبانی می‌کند
  const res = await fetch(
    `${BASE_URL}/ads/seller?page=${page}&limit=${limit}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  const result = await res.json();

  console.log("📥 SELLER ADS RECEIVED:", result);

  if (!res.ok) {
    throw new Error(result?.message || "Failed to fetch seller ads");
  }

  const ads = result.data || [];
  const pagination = result.pagination || {
    page,
    limit,
    total: 0,
    totalPages: 0,
  };

  ads.sort(
    (a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return {
    data: ads,
    pagination,
  };
};

/* =======================
   DIGITAL ADS (GET)
======================= */
export const getDigitalAds = async (page: number = 1, limit: number = 10) => {
  const res = await fetch(
    `${BASE_URL}/ads/digital?page=${page}&limit=${limit}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  const result = await res.json();

  console.log("📥 DIGITAL ADS RECEIVED:", result);

  if (!res.ok) {
    throw new Error(result?.message || "Failed to fetch digital ads");
  }

  const ads = result.data || [];
  const pagination = result.pagination || {
    page,
    limit,
    total: 0,
    totalPages: 0,
  };

  ads.sort(
    (a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return {
    data: ads,
    pagination,
  };
};