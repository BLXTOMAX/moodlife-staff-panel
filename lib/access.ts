import { supabase } from "@/lib/supabase";

const SESSION_STORAGE_KEY = "moodlife-session-email";
const LEGACY_SESSION_STORAGE_KEY = "moodlife-session";

const OWNER_EMAILS = ["paristom356@gmail.com"];

export function getSessionEmail(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const directSession = localStorage.getItem(SESSION_STORAGE_KEY);
    if (directSession && directSession.trim()) {
      return directSession.trim().toLowerCase();
    }

    const legacySession = localStorage.getItem(LEGACY_SESSION_STORAGE_KEY);
    if (!legacySession) return null;

    try {
      const parsed = JSON.parse(legacySession);

      if (typeof parsed === "string" && parsed.trim()) {
        return parsed.trim().toLowerCase();
      }

      if (parsed?.email && typeof parsed.email === "string" && parsed.email.trim()) {
        return parsed.email.trim().toLowerCase();
      }
    } catch {
      if (typeof legacySession === "string" && legacySession.trim()) {
        return legacySession.trim().toLowerCase();
      }
    }

    return null;
  } catch (error) {
    console.error("Erreur lecture session locale :", error);
    return null;
  }
}

export function isOwner(email?: string | null): boolean {
  if (!email) return false;
  return OWNER_EMAILS.includes(email.trim().toLowerCase());
}

export async function hasPermission(path: string): Promise<boolean> {
  const sessionEmail = getSessionEmail();

  if (!sessionEmail) {
    console.warn("Aucun email de session trouvé dans le navigateur.");
    return false;
  }

  if (isOwner(sessionEmail)) return true;

  const { data, error } = await supabase
    .from("user_permissions")
    .select("permission")
    .eq("email", sessionEmail.trim().toLowerCase());

  if (error) {
    console.error("Erreur récupération permissions :", error);
    return false;
  }

  const permissions = (data || [])
    .map((item) => item.permission)
    .filter(Boolean);

  return permissions.includes(path);
}