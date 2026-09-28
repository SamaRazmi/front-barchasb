import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://barchasb-apis.liara.run/api";

export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const tokenMatch = cookieHeader.match(/accessToken=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized: missing token" },
        { status: 401 },
      );
    }

    const formData = await request.formData();

    const liaraRes = await fetch(`${API_URL}/converter/image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!liaraRes.ok) {
      const errorText = await liaraRes.text();
      return NextResponse.json(
        { message: errorText || "خطا در تبدیل تصویر" },
        { status: liaraRes.status },
      );
    }

    const blob = await liaraRes.blob();
    const contentType =
      liaraRes.headers.get("content-type") || "application/octet-stream";

    return new Response(blob, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": 'attachment; filename="converted-file"',
      },
    });
  } catch (error: any) {
    console.error("Image Convert API Error:", error);
    return NextResponse.json(
      { message: "خطای سرور: " + error.message },
      { status: 500 },
    );
  }
}
