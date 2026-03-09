import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("staff_session")?.value;
  const { pathname } = request.nextUrl;

  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/absence-staff") ||
    pathname.startsWith("/bl-staff") ||
    pathname.startsWith("/commandes-staff") ||
    pathname.startsWith("/deban-anticheat") ||
    pathname.startsWith("/deban-non-autorise") ||
    pathname.startsWith("/espace-sa-gerant") ||
    pathname.startsWith("/heures-staff") ||
    pathname.startsWith("/info") ||
    pathname.startsWith("/license") ||
    pathname.startsWith("/mail") ||
    pathname.startsWith("/regles-staff") ||
    pathname.startsWith("/remontees") ||
    pathname.startsWith("/responsable-event") ||
    pathname.startsWith("/responsable-illegal") ||
    pathname.startsWith("/responsable-legal");

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/dashboard/:path*",
    "/absence-staff/:path*",
    "/bl-staff/:path*",
    "/commandes-staff/:path*",
    "/deban-anticheat/:path*",
    "/deban-non-autorise/:path*",
    "/espace-sa-gerant/:path*",
    "/heures-staff/:path*",
    "/info/:path*",
    "/license/:path*",
    "/mail/:path*",
    "/regles-staff/:path*",
    "/remontees/:path*",
    "/responsable-event/:path*",
    "/responsable-illegal/:path*",
    "/responsable-legal/:path*",
  ],
};