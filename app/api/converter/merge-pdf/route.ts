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

    const response = await fetch(`${API_URL}/converter/merge-pdf`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json();

      return NextResponse.json(
        { message: data?.message || "External API error" },
        { status: response.status },
      );
    }

    const blob = await response.blob();

    return new Response(blob, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="merged.pdf"',
      },
    });
  } catch (error: any) {
    console.error("Merge PDF API error:", error);

    return NextResponse.json(
      { message: "Server error: " + error.message },
      { status: 500 },
    );
  }
}
