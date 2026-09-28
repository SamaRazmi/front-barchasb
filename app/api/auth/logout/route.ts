import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://barchasb-apis.liara.run/api";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value; // ← تغییر به accessToken

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized: missing token" },
        { status: 401 },
      );
    }

    const response = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    const data = await response.json();

    const nextResponse = NextResponse.json(data, { status: response.status });
    nextResponse.cookies.set({
      name: "accessToken", // ← تغییر به accessToken
      value: "",
      httpOnly: true,
      maxAge: 0,
      path: "/",
    });

    return nextResponse;
  } catch (error: any) {
    console.error("❌ Logout proxy error:", error);
    return NextResponse.json(
      { message: "خطا در ارتباط با سرور" },
      { status: 500 },
    );
  }
}
