import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://barchasb-apis.liara.run/api";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ resumeId: string }> },
) {
  try {
    const { resumeId } = await params;

    if (!resumeId) {
      return NextResponse.json(
        { message: "Missing resumeId" },
        { status: 400 },
      );
    }

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
    const file = formData.get("resumeFile");
    if (!file) {
      return NextResponse.json(
        { message: "No file provided" },
        { status: 400 },
      );
    }

    const liaraFormData = new FormData();
    liaraFormData.append("resumeFile", file);

    const uploadUrl = `${API_URL}/resume/upload/${resumeId}`;
    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: liaraFormData,
    });

    const contentType = response.headers.get("content-type");
    let data;
    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error("Non‑JSON response:", text.substring(0, 500));
      return NextResponse.json(
        {
          message: "External API returned non‑JSON",
          details: text.substring(0, 200),
        },
        { status: response.status },
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("Upload proxy error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
