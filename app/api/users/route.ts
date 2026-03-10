import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type StoredUser = {
  id: string;
  email: string;
  password: string;
  created_at?: string;
};

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("GET /api/users error:", error);
      return NextResponse.json(
        { success: false, message: "Impossible de charger les utilisateurs." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, users: (data || []) as StoredUser[] });
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json(
      { success: false, message: "Impossible de charger les utilisateurs." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email manquant." },
        { status: 400 }
      );
    }

    const { data: existing, error: selectError } = await supabase
      .from("users")
      .select("id,email")
      .eq("email", email)
      .maybeSingle();

    if (selectError) {
      console.error("POST /api/users select error:", selectError);
      return NextResponse.json(
        { success: false, message: "Impossible de vérifier l'utilisateur." },
        { status: 500 }
      );
    }

    if (!existing) {
      const { error: insertError } = await supabase
        .from("users")
        .insert([{ email, password }]);

      if (insertError) {
        console.error("POST /api/users insert error:", insertError);
        return NextResponse.json(
          { success: false, message: "Impossible d'enregistrer l'utilisateur." },
          { status: 500 }
        );
      }
    }

    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (usersError) {
      console.error("POST /api/users reload error:", usersError);
      return NextResponse.json(
        { success: false, message: "Utilisateur créé mais rechargement impossible." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, users: users || [] });
  } catch (error) {
    console.error("POST /api/users error:", error);
    return NextResponse.json(
      { success: false, message: "Impossible d'enregistrer l'utilisateur." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const id = String(body?.id || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();

    if (!id && !email) {
      return NextResponse.json(
        { success: false, message: "Identifiant manquant." },
        { status: 400 }
      );
    }

    const targetEmail = email
      ? email
      : (() => {
          return "";
        })();

    if (id) {
      const { error: permissionsError } = await supabase
        .from("user_permissions")
        .delete()
        .eq("user_id", id);

      if (permissionsError) {
        console.error("DELETE /api/users permissions by id error:", permissionsError);
      }

      const { data: userRow } = await supabase
        .from("users")
        .select("email")
        .eq("id", id)
        .maybeSingle();

      if (userRow?.email) {
        const { error: permissionsByEmailError } = await supabase
          .from("user_permissions")
          .delete()
          .eq("email", userRow.email);

        if (permissionsByEmailError) {
          console.error(
            "DELETE /api/users permissions by email error:",
            permissionsByEmailError
          );
        }
      }

      const { error: userError } = await supabase
        .from("users")
        .delete()
        .eq("id", id);

      if (userError) {
        return NextResponse.json(
          { success: false, message: userError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    const { error: permissionsError } = await supabase
      .from("user_permissions")
      .delete()
      .eq("email", targetEmail);

    if (permissionsError) {
      console.error("DELETE /api/users permissions error:", permissionsError);
    }

    const { error: userError } = await supabase
      .from("users")
      .delete()
      .eq("email", targetEmail);

    if (userError) {
      return NextResponse.json(
        { success: false, message: userError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/users error:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur." },
      { status: 500 }
    );
  }
}