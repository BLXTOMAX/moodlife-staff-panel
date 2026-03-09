const ACCESS_STORAGE_KEY = "moodlife-user-access";
const SESSION_STORAGE_KEY = "moodlife-session-email";
const LEGACY_SESSION_STORAGE_KEY = "moodlife-session";

const OWNER_EMAILS = ["paristom356@gmail.com"];

export function getSessionEmail(): string | null {
  if (typeof window === "undefined") return null;

  const directSession = localStorage.getItem(SESSION_STORAGE_KEY);
  if (directSession) {
    return directSession.trim().toLowerCase();
  }

  const legacySession = localStorage.getItem(LEGACY_SESSION_STORAGE_KEY);
  if (!legacySession) return null;

  try {
    const parsed = JSON.parse(legacySession);

    if (typeof parsed === "string") {
      return parsed.trim().toLowerCase();
    }

    if (parsed?.email && typeof parsed.email === "string") {
      return parsed.email.trim().toLowerCase();
    }
  } catch {
    if (typeof legacySession === "string") {
      return legacySession.trim().toLowerCase();
    }
  }

  return null;
}

export function isOwner(email?: string | null): boolean {
  if (!email) return false;
  return OWNER_EMAILS.includes(email.trim().toLowerCase());
}

export function getAccessMap(): Record<string, string[]> {
  if (typeof window === "undefined") return {};

  try {
    const raw = localStorage.getItem(ACCESS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function hasPermission(path: string): boolean {
  const sessionEmail = getSessionEmail();

  if (!sessionEmail) return false;
  if (isOwner(sessionEmail)) return true;

  const accessMap = getAccessMap();
  const permissions = accessMap[sessionEmail] ?? [];

  return permissions.includes(path);
}