import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://barchasb-apis.liara.run/api";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      console.warn("🔴 No accessToken cookie found");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const cleanToken = token.startsWith("Bearer ") ? token.slice(7) : token;

    console.log("🔵 Me proxy: forwarding to", `${API_URL}/auth/me`);
    console.log("🔵 Token being sent:", cleanToken.substring(0, 20) + "...");

    const response = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }

    console.log("🟢 Me status:", response.status);
    console.log("🟢 Me response:", data);

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("❌ Me proxy error:", error);
    return NextResponse.json(
      { message: "خطا در ارتباط با سرور" },
      { status: 500 },
    );
  }
}
