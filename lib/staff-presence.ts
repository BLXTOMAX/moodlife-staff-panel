type SessionData = {
  lastSeen: number;
};

const STAFF_TTL = 60 * 1000; // 60 secondes
const globalForStaff = globalThis as typeof globalThis & {
  staffPresence?: Map<string, SessionData>;
};

const sessions = globalForStaff.staffPresence ?? new Map<string, SessionData>();

if (!globalForStaff.staffPresence) {
  globalForStaff.staffPresence = sessions;
}

function cleanupExpiredSessions() {
  const now = Date.now();

  for (const [sessionId, data] of sessions.entries()) {
    if (now - data.lastSeen > STAFF_TTL) {
      sessions.delete(sessionId);
    }
  }
}

export function markStaffOnline(sessionId: string) {
  cleanupExpiredSessions();

  sessions.set(sessionId, {
    lastSeen: Date.now(),
  });
}

export function markStaffOffline(sessionId: string) {
  sessions.delete(sessionId);
}

export function getStaffOnlineCount() {
  cleanupExpiredSessions();
  return sessions.size;
}

export function getAllStaffSessions() {
  cleanupExpiredSessions();
  return [...sessions.entries()];
}