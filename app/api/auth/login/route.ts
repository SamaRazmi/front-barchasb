import { NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://barchasb-apis.liara.run/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("🔵 Login proxy ->", `${API_URL}/auth/login`);

    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log("🟢 Login status:", response.status);

    if (response.status === 429) {
      return NextResponse.json(
        {
          message:
            data.message ||
            "تعداد درخواست‌های شما از حد مجاز بیشتر شده، لطفاً بعداً تلاش کنید.",
        },
        { status: 429 },
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "خطا در ورود" },
        { status: response.status },
      );
    }

    let token = null;
    if (data.token) {
      token = data.token.startsWith("Bearer ")
        ? data.token.slice(7)
        : data.token;
    }

    const nextResponse = NextResponse.json(data, { status: 200 });

    if (token) {
      nextResponse.cookies.set({
        name: "accessToken", // ← تغییر از "token" به "accessToken"
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      console.log("✅ Cookie set with accessToken");
    } else {
      console.warn("⚠️ No token found in response");
    }

    return nextResponse;
  } catch (error: any) {
    console.error("❌ Login error:", error);
    return NextResponse.json(
      { message: "خطا در ارتباط با سرور: " + error.message },
      { status: 500 },
    );
  }
}
