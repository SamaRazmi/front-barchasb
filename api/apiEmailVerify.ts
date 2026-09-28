// استفاده از پروکسی Next.js به‌جای آدرس مستقیم
const BASE_URL = "/api";

/* =======================
   SEND VERIFY EMAIL
======================= */
export const sendVerifyEmail = async (email: string, userId: string) => {
  if (!email) throw new Error("ایمیل ارسال نشده است");
  if (!userId) throw new Error("شناسه کاربر ارسال نشده است");

  const res = await fetch(`${BASE_URL}/send-verify-email/${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // برای ارسال کوکی‌ها (در صورت نیاز)
    body: JSON.stringify({ email }),
  });

  const result = await res.json();

  // console.log("📨 VERIFY EMAIL SENT:", result);

  if (!res.ok) {
    throw new Error(result?.msg || "ارسال ایمیل تایید ناموفق بود");
  }

  return result;
};

/* =======================
   VERIFY EMAIL BY TOKEN
======================= */
export const verifyEmailByToken = async (token: string) => {
  if (!token) throw new Error("توکن تایید ارسال نشده است");

  const res = await fetch(`${BASE_URL}/verify-email/${token}`, {
    method: "GET",
    credentials: "include",
  });

  const result = await res.json();

  //console.log("✅ EMAIL VERIFY RESULT:", result);

  if (!res.ok) {
    throw new Error(result?.msg || "لینک تایید نامعتبر است");
  }

  return result;
};

/* =======================
   VERIFY EMAIL BY CODE
======================= */
export const verifyEmailByCode = async (code: string, userId: string) => {
  if (!code) throw new Error("کد تایید ارسال نشده است");
  if (!userId) throw new Error("شناسه کاربر ارسال نشده است");

  const res = await fetch(`${BASE_URL}/verify-email-code/${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ code }),
  });

  const result = await res.json();

  //  console.log("✅ EMAIL CODE VERIFY RESULT:", result);

  if (!res.ok) {
    throw new Error(result?.msg || "کد تایید نامعتبر است");
  }

  return result;
};
