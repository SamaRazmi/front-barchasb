// api/apiClient.ts

// ✅ export اضافه شد
export const BASE_URL = "/api";

export const get = async <T>(
  endpoint: string,
  withCredentials = true,
): Promise<T> => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "GET",
    credentials: withCredentials ? "include" : "omit",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
};

export const post = async <T>(endpoint: string, data?: any): Promise<T> => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
};

export const postFormData = async <T>(
  endpoint: string,
  formData: FormData,
): Promise<T> => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
};

// ✅ اضافه شد: متد PUT (برای بروزرسانی تنظیمات)
export const put = async <T>(endpoint: string, data?: any): Promise<T> => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
};

// ✅ اضافه شد: متد PATCH (برای مارک کردن به عنوان خوانده شده)
export const patch = async <T>(endpoint: string, data?: any): Promise<T> => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
};
