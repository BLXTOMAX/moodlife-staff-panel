import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { markStaffOffline } from "@/lib/staff-presence";

export async function POST() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("staff_sid")?.value;

  if (sessionId) {
    markStaffOffline(sessionId);
  }

  const response = NextResponse.json({
    success: true,
    message: "Déconnexion réussie.",
  });

  response.cookies.set("staff_session", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  response.cookies.set("staff_sid", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
}