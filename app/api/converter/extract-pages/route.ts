import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://barchasb-apis.liara.run/api";

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

    const liaraRes = await fetch(`${API_URL}/converter/extract-pages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!liaraRes.ok) {
      const errorText = await liaraRes.text();

      return NextResponse.json(
        { message: errorText || "خطا در استخراج صفحات PDF" },
        { status: liaraRes.status },
      );
    }

    const blob = await liaraRes.blob();

    return new Response(blob, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="extracted.pdf"',
      },
    });
  } catch (error: any) {
    console.error("Extract Pages API Error:", error);

    return NextResponse.json(
      { message: "خطای سرور: " + error.message },
      { status: 500 },
    );
  }
}
