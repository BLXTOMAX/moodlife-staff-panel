import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    const cleanToken = String(token || "").trim();
    const cleanPassword = String(password || "").trim();

    if (!cleanToken || !cleanPassword) {
      return NextResponse.json(
        { error: "Token et mot de passe requis." },
        { status: 400 }
      );
    }

    if (cleanPassword.length < 8) {
      return NextResponse.json(
        { error: "Le mot de passe doit contenir au moins 8 caractères." },
        { status: 400 }
      );
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, reset_token, reset_token_expires_at")
      .eq("reset_token", cleanToken)
      .maybeSingle();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Lien invalide ou expiré." },
        { status: 400 }
      );
    }

    const expiresAt = user.reset_token_expires_at
      ? new Date(user.reset_token_expires_at).getTime()
      : 0;

    if (!expiresAt || Date.now() > expiresAt) {
      return NextResponse.json(
        { error: "Lien invalide ou expiré." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(cleanPassword, 10);

    const { error: updateError } = await supabase
      .from("users")
      .update({
        password: hashedPassword,
        reset_token: null,
        reset_token_expires_at: null,
      })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Impossible de mettre à jour le mot de passe." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Mot de passe réinitialisé avec succès.",
    });
  } catch (error) {
    console.error("reset-password error:", error);
    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}