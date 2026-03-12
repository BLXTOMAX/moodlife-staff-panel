import { NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const cleanEmail = String(email || "").trim().toLowerCase();

    if (!cleanEmail) {
      return NextResponse.json(
  { error: "Adresse mail requise." },
  { status: 400 }
);
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (userError) {
      return NextResponse.json(
        { error: "Erreur serveur." },
        { status: 500 }
      );
    }

    // On renvoie toujours le même message pour éviter de révéler
    // si l'adresse existe ou non.
    if (!user) {
      return NextResponse.json({
        message:
          "Si un compte existe avec cette adresse, un email de réinitialisation a été envoyé.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString(); // 30 min

    const { error: updateError } = await supabase
      .from("users")
      .update({
        reset_token: token,
        reset_token_expires_at: expiresAt,
      })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Impossible de générer le lien de réinitialisation." },
        { status: 500 }
      );
    }

    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Moodlife Staff" <${process.env.SMTP_FROM}>`,
      to: cleanEmail,
      subject: "Réinitialisation de votre mot de passe",
      html: `
        <div style="font-family:Arial,sans-serif;padding:24px;color:#111;">
          <h2>Réinitialisation du mot de passe</h2>
          <p>Une demande de réinitialisation a été effectuée pour votre compte.</p>
          <p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p>
          <p style="margin:24px 0;">
            <a
              href="${resetUrl}"
              style="background:#facc15;color:#000;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:700;"
            >
              Réinitialiser mon mot de passe
            </a>
          </p>
          <p>Ce lien expire dans 30 minutes.</p>
          <p>Si vous n’êtes pas à l’origine de cette demande, ignorez simplement cet email.</p>
        </div>
      `,
    });

    return NextResponse.json({
      message:
        "Si un compte existe avec cette adresse, un email de réinitialisation a été envoyé.",
    });
  } catch (error) {
    console.error("forgot-password error:", error);
    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}