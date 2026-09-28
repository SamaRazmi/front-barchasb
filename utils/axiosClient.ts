import axios from "axios";

const axiosClient = axios.create({
  // ✅ تغییر: استفاده از مسیر نسبی پروکسی
  baseURL: "/api",
  withCredentials: true, // ارسال کوکی‌ها (شامل accessToken)
});

export default axiosClient;
