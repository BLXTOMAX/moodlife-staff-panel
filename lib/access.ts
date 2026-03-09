const ACCESS_STORAGE_KEY = "moodlife-user-access";
const SESSION_STORAGE_KEY = "moodlife-session-email";

const OWNER_EMAILS = ["paristom356@gmail.com"];

export function getSessionEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_STORAGE_KEY);
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