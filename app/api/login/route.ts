import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { markStaffOnline } from "@/lib/staff-presence";

export async function POST(request: Request) {
  const body = await request.json();
  const email = body?.email?.toLowerCase();
  const password = body?.password;

  if (!email || !password) {
    return NextResponse.json(
      { success: false, message: "Email ou mot de passe manquant." },
      { status: 400 }
    );
  }

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !user) {
    return NextResponse.json(
      { success: false, message: "Utilisateur introuvable." },
      { status: 401 }
    );
  }

  if (user.password !== password) {
    return NextResponse.json(
      { success: false, message: "Mot de passe incorrect." },
      { status: 401 }
    );
  }

  const sessionId = crypto.randomUUID();
  markStaffOnline(sessionId);

  const response = NextResponse.json({
    success: true,
    message: "Connexion réussie.",
  });

  response.cookies.set("staff_session", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  response.cookies.set("staff_sid", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}