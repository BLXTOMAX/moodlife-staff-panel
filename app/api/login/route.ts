import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const email = body?.email;
  const password = body?.password;

  const adminEmail = "admin@moodlife.fr";
  const adminPassword = "Moodlife123!";

  if (email !== adminEmail || password !== adminPassword) {
    return NextResponse.json(
      { success: false, message: "Identifiants invalides." },
      { status: 401 }
    );
  }

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

  return response;
}