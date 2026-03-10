import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type StoredUser = {
  id: string;
  email: string;
  password: string;
  created_at?: string;
};

const DEFAULT_PERMISSIONS = ["info", "dashboard"];

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

    return NextResponse.json({
      success: true,
      users: (data || []) as StoredUser[],
    });
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
      .select("id, email")
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

    // Vérifie toujours les permissions par défaut, même si l'utilisateur existe déjà
    const { data: currentPermissions, error: permissionsFetchError } = await supabase
      .from("user_permissions")
      .select("permission")
      .eq("email", email);

    if (permissionsFetchError) {
      console.error(
        "POST /api/users fetch permissions error:",
        permissionsFetchError
      );
      return NextResponse.json(
        { success: false, message: "Impossible de vérifier les permissions." },
        { status: 500 }
      );
    }

    const existingPermissions = new Set(
      (currentPermissions || []).map((item) => String(item.permission))
    );

    const missingPermissions = DEFAULT_PERMISSIONS.filter(
      (permission) => !existingPermissions.has(permission)
    );

    if (missingPermissions.length > 0) {
      const { error: permissionsInsertError } = await supabase
        .from("user_permissions")
        .insert(
          missingPermissions.map((permission) => ({
            email,
            permission,
          }))
        );

      if (permissionsInsertError) {
        console.error(
          "POST /api/users insert permissions error:",
          permissionsInsertError
        );
        return NextResponse.json(
          { success: false, message: "Utilisateur créé mais permissions incomplètes." },
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
        {
          success: false,
          message: "Utilisateur créé mais rechargement impossible.",
        },
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

    if (id) {
      const { data: userRow, error: userFetchError } = await supabase
        .from("users")
        .select("email")
        .eq("id", id)
        .maybeSingle();

      if (userFetchError) {
        console.error("DELETE /api/users fetch by id error:", userFetchError);
        return NextResponse.json(
          { success: false, message: "Impossible de récupérer l'utilisateur." },
          { status: 500 }
        );
      }

      const userEmail = String(userRow?.email || "").trim().toLowerCase();

      const { error: permissionsByUserIdError } = await supabase
        .from("user_permissions")
        .delete()
        .eq("user_id", id);

      if (permissionsByUserIdError) {
        console.error(
          "DELETE /api/users permissions by id error:",
          permissionsByUserIdError
        );
      }

      if (userEmail) {
        const { error: permissionsByEmailError } = await supabase
          .from("user_permissions")
          .delete()
          .eq("email", userEmail);

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
        console.error("DELETE /api/users delete by id error:", userError);
        return NextResponse.json(
          { success: false, message: userError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    const targetEmail = email;

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
      console.error("DELETE /api/users delete by email error:", userError);
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