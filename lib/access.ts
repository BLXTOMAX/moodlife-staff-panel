export const OWNER_EMAIL = "paristom356@gmail.com";

export const ACCESS_STORAGE_KEY = "moodlife-user-access";
export const SESSION_STORAGE_KEY = "moodlife-session";

export function getSessionEmail() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_STORAGE_KEY);
}

export function getAccessMap(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem(ACCESS_STORAGE_KEY);
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function isOwner(email: string | null) {
  return email === OWNER_EMAIL;
}

export function hasPermission(path: string) {
  const email = getSessionEmail();

  if (!email) return false;
  if (isOwner(email)) return true;

  const accessMap = getAccessMap();
  const permissions = accessMap[email] ?? [];

  return permissions.includes(path);
}