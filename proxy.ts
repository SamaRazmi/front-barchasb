// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// مسیرهای عمومی
const publicPaths = ["/", "/login", "/register", "/about-us", "/club"];
// مسیرهای محافظت‌شده
const protectedPaths = ["/dashboard", "/profile", "/settings"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // مسیرهای عمومی
  if (publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // مسیرهای محافظت‌شده
  if (protectedPaths.some((p) => pathname.startsWith(p))) {
    const token = request.cookies.get("accessToken")?.value;

    if (!token) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/settings/:path*"],
};
