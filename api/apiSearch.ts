// استفاده از پروکسی Next.js
const BASE_URL = "/api";

export interface SearchFilters {
  q?: string;
  state?: string;
  type?: string; // "employer,jobseeker,seller,digital" یا تکی
}

export interface AdItem {
  id: string;
  type: string;
  title: string;
  category: string;
  state: string;
  city: string;
  images: string[];
  adStatus: string;
  createdAt: string;
  owner: string;
}

export const searchAds = async (
  filters: SearchFilters = {},
): Promise<AdItem[]> => {
  const params = new URLSearchParams();
  if (filters.q) params.append("q", filters.q);
  if (filters.state) params.append("state", filters.state);
  if (filters.type) params.append("type", filters.type);

  // مسیر جدید با پروکسی
  const url = `${BASE_URL}/ads/search?${params.toString()}`;

  // console.log("🌐 Fetching URL:", url);

  const res = await fetch(url, {
    method: "GET",
    credentials: "include", // ارسال کوکی‌ها
    headers: {
      Accept: "application/json",
    },
  });

  //console.log("📡 Response Status:", res.status, res.statusText);

  if (!res.ok) {
    console.error(`❌ Search error! status: ${res.status}`);
    throw new Error(`Search error! status: ${res.status}`);
  }

  const data = await res.json();
  //console.log("✅ Raw API Response:", data);

  // خروجی مستقیم آرایه است (مطابق با کنترلر)
  return data as AdItem[];
};
