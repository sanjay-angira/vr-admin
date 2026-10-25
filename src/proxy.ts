import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { STORAGE_KEYS } from "@/services/api/storage";

const ADMIN_PUBLIC_PATHS = new Set([
  "/login",
  "/forgot-password",
  "/reset-password",
]);

function hasAdminSession(request: NextRequest): boolean {
  return request.cookies.get(STORAGE_KEYS.adminSession)?.value === "1";
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/admin" ? "/" : pathname.slice("/admin".length);
    return NextResponse.redirect(url);
  }

  if (pathname === "/") {
    if (hasAdminSession(request)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (ADMIN_PUBLIC_PATHS.has(pathname)) {
    if (hasAdminSession(request)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (!hasAdminSession(request)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
