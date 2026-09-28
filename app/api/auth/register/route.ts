import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://barchasb-apis.liara.run/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("🔵 Register proxy: sending to", `${API_URL}/auth/register`);

    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(body),
    });

    console.log("🟢 Register proxy: received status", response.status);

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "خطا در ثبت نام" },
        { status: response.status },
      );
    }

    const nextResponse = NextResponse.json(data, {
      status: response.status,
    });

    // انتقال کوکی اگر بک‌اند تنظیم کرده باشد
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      nextResponse.headers.set("set-cookie", setCookie);
    }

    return nextResponse;
  } catch (error: any) {
    console.error("❌ Register proxy error:", error);
    return NextResponse.json(
      { message: "خطا در ارتباط با سرور: " + error.message },
      { status: 500 },
    );
  }
}
