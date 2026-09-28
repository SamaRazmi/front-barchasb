import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://barchasb-apis.liara.run/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  try {
    const { categoryId } = await params;

    if (!categoryId || categoryId === "undefined") {
      console.error("Error: categoryId is missing");
      return NextResponse.json({ message: "ID نامعتبر است" }, { status: 400 });
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

    const apiUrl = `${API_URL}/tests/categories/${categoryId}/types`;

    console.log("Fetching from:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 0 },
    });

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } else {
      const errorText = await response.text();
      console.error("External API sent non-JSON response:", errorText);
      return NextResponse.json(
        { message: "پاسخ نامعتبر از سرور اصلی" },
        { status: 502 },
      );
    }
  } catch (error: any) {
    console.error("Detailed API Route Error:", error);
    return NextResponse.json(
      { message: "خطای سرور داخلی", detail: error.message },
      { status: 500 },
    );
  }
}
