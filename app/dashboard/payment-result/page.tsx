"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const status = searchParams.get("status") || "unknown";
  const paymentId = searchParams.get("paymentId") || "نامشخص";
  const refId = searchParams.get("refId") || "نامشخص";
  const message = searchParams.get("message") || "";

  let title = "نامشخص";
  let color = "#6c757d";
  let icon = "❓";
  let description = "";

  if (status === "success") {
    title = "پرداخت با موفقیت انجام شد ✅";
    color = "#28a745";
    icon = "✅";
    description = `شماره پیگیری: ${refId}<br />شناسه پرداخت: ${paymentId}`;
  } else if (status === "failed") {
    title = "پرداخت ناموفق ❌";
    color = "#dc3545";
    icon = "❌";
    description = `دلیل: ${message || "خطای ناشناخته"}`;
  } else if (status === "error") {
    title = "خطا در پردازش پرداخت ⚠️";
    color = "#ffc107";
    icon = "⚠️";
    description = `خطا: ${message || "خطای ناشناخته"}`;
  } else {
    title = "وضعیت نامشخص";
    description = "اطلاعاتی برای نمایش وجود ندارد.";
  }

  const now = new Date();
  now.setHours(now.getHours() + 1);
  const formattedTime = now.toLocaleString("fa-IR");

  const goHome = () => {
    router.push("/dashboard/myads");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans"
      dir="rtl"
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
        <div className="text-7xl mb-4">{icon}</div>
        <h1 className="text-2xl font-bold mb-4" style={{ color }}>
          {title}
        </h1>
        <div className="bg-gray-50 rounded-lg p-4 text-gray-700 text-sm leading-relaxed mb-6">
          <p dangerouslySetInnerHTML={{ __html: description }} />
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          {status === "success" ? (
            <button
              onClick={goHome}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors text-base"
            >
              تایید
            </button>
          ) : (
            <button
              onClick={goHome}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-base"
            >
              بازگشت
            </button>
          )}
        </div>
        <div className="mt-6 p-3 bg-gray-100 rounded-lg text-xs text-gray-500 text-left dir-ltr overflow-x-auto">
          <strong>اطلاعات تکمیلی:</strong>
          <br />
          وضعیت: {status}
          <br />
          شناسه پرداخت: {paymentId}
          <br />
          کد رهگیری: {refId}
          <br />
          زمان: {formattedTime}
        </div>
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          در حال بارگذاری...
        </div>
      }
    >
      <PaymentResultContent />
    </Suspense>
  );
}
