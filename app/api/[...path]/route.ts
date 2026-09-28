import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://barchasb-apis.liara.run/api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxyRequest(req, path, "GET");
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxyRequest(req, path, "POST");
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxyRequest(req, path, "PUT");
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxyRequest(req, path, "DELETE");
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxyRequest(req, path, "PATCH");
}

async function proxyRequest(req: NextRequest, path: string[], method: string) {
  try {
    const pathStr = path.join("/");
    const url = `${BACKEND_URL}/${pathStr}`;
    const searchParams = req.nextUrl.searchParams.toString();
    const fullUrl = searchParams ? `${url}?${searchParams}` : url;

   // console.log(`🔄 [${method}] ${fullUrl}`);

    const cookieHeader = req.headers.get("cookie") || "";
    //console.log(`🍪 [proxy] هدر cookie:`, cookieHeader);

    const tokenMatch = cookieHeader.match(/accessToken=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (token) {
    //  console.log(`✅ [proxy] توکن استخراج شد: ${token.substring(0, 20)}...`);
    } else {
      console.warn(`⚠️ [proxy] توکن در کوکی یافت نشد!`);
    }

    const headers = new Headers(req.headers);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    let body: BodyInit | null = null;
    if (method !== "GET" && method !== "HEAD") {
      const contentType = req.headers.get("content-type") || "";
      if (contentType.includes("multipart/form-data")) {
        const arrayBuffer = await req.arrayBuffer();
        body = Buffer.from(arrayBuffer);
      } else {
        try {
          const json = await req.json();
          body = JSON.stringify(json);
          headers.set("Content-Type", "application/json");
        } catch {
          body = null;
        }
      }
    }

    const response = await fetch(fullUrl, {
      method,
      headers,
      body,
      credentials: "include",
    });

    const data = await response.text();
   // console.log(`📡 [${method}] ${fullUrl} → ${response.status}`);

    let responseData;
    try {
      responseData = JSON.parse(data);
    } catch {
      responseData = data;
    }

    const nextResponse = NextResponse.json(responseData, {
      status: response.status,
    });

    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      nextResponse.headers.set("set-cookie", setCookie);
    }

    return nextResponse;
  } catch (error: any) {
    console.error("❌ Proxy error:", error);
    return NextResponse.json(
      { error: "خطا در ارتباط با سرور", message: error.message },
      { status: 500 },
    );
  }
}
