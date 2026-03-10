import { NextResponse } from "next/server";
import { getStaffOnlineCount } from "@/lib/staff-presence";

export async function GET() {
  const count = getStaffOnlineCount();

  return NextResponse.json({ count });
}