import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type StoredUser = {
  id: string;
  email: string;
  password: string;
  created_at?: string;
};

const DEFAULT_PERMISSIONS = ["/dashboard", "/dashboard/info"];

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

    const { data: existingUser, error: selectError } = await supabase
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

    if (!existingUser) {
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

    const { data: currentPermissions, error: permissionsFetchError } =
      await supabase
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
          {
            success: false,
            message: "Utilisateur créé mais permissions incomplètes.",
          },
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

    return NextResponse.json({
      success: true,
      users: users || [],
    });
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
    const email = String(body?.email || "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email manquant." },
        { status: 400 }
      );
    }

    const { error: permissionsError } = await supabase
      .from("user_permissions")
      .delete()
      .eq("email", email);

    if (permissionsError) {
      console.error("DELETE /api/users permissions error:", permissionsError);
      return NextResponse.json(
        { success: false, message: "Impossible de supprimer les permissions." },
        { status: 500 }
      );
    }

    const { error: userError } = await supabase
      .from("users")
      .delete()
      .eq("email", email);

    if (userError) {
      console.error("DELETE /api/users user error:", userError);
      return NextResponse.json(
        { success: false, message: "Impossible de supprimer l'utilisateur." },
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