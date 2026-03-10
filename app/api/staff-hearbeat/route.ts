import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { markStaffOnline } from "@/lib/staff-presence";

export async function POST() {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("staff_session")?.value;
  const sessionId = cookieStore.get("staff_sid")?.value;

  if (!isAuthenticated || !sessionId) {
    return NextResponse.json(
      { success: false, message: "Non authentifié." },
      { status: 401 }
    );
  }

  markStaffOnline(sessionId);

  return NextResponse.json({
    success: true,
    message: "Présence mise à jour.",
  });
}