import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://barchasb-apis.liara.run/api";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ province: string }> },
) {
  try {
    // ✅ استفاده از await برای دریافت پارامترها
    const { province } = await params;

    if (!province) {
      return NextResponse.json(
        { message: "استان مشخص نشده است" },
        { status: 400 },
      );
    }

    // ارسال به بک‌اند با آدرس صحیح /cities/{province}
    const response = await fetch(
      `${API_URL}/cities/${encodeURIComponent(province)}`,
      {
        method: "GET",
        credentials: "include",
      },
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("Cities proxy error:", error);
    return NextResponse.json(
      { message: "خطا در دریافت شهرها: " + error.message },
      { status: 500 },
    );
  }
}
