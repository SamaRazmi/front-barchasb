import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://barchasb-apis.liara.run/api/provinces", {
      method: "GET",
      credentials: "include",
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("Provinces proxy error:", error);
    return NextResponse.json(
      { message: "خطا در دریافت استان‌ها: " + error.message },
      { status: 500 },
    );
  }
}
