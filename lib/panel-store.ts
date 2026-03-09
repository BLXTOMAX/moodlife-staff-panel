import { promises as fs } from "fs";
import path from "path";

export type StoredUser = {
  email: string;
  password: string;
};

export type AccessMap = Record<string, string[]>;

const dataDir = path.join(process.cwd(), "data");
const usersFile = path.join(dataDir, "users.json");
const accessFile = path.join(dataDir, "access.json");

async function ensureFile(filePath: string, defaultValue: unknown) {
  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(defaultValue, null, 2), "utf-8");
  }
}

export async function readUsers(): Promise<StoredUser[]> {
  await ensureFile(usersFile, []);
  const raw = await fs.readFile(usersFile, "utf-8");
  return JSON.parse(raw);
}

export async function writeUsers(users: StoredUser[]) {
  await ensureFile(usersFile, []);
  await fs.writeFile(usersFile, JSON.stringify(users, null, 2), "utf-8");
}

export async function upsertUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const users = await readUsers();

  const existingIndex = users.findIndex(
    (user) => user.email.trim().toLowerCase() === normalizedEmail
  );

  if (existingIndex === -1) {
    users.push({
      email: normalizedEmail,
      password,
    });
  } else {
    users[existingIndex] = {
      ...users[existingIndex],
      password,
    };
  }

  await writeUsers(users);
  return users;
}

export async function readAccessMap(): Promise<AccessMap> {
  await ensureFile(accessFile, {});
  const raw = await fs.readFile(accessFile, "utf-8");
  return JSON.parse(raw);
}

export async function writeAccessMap(accessMap: AccessMap) {
  await ensureFile(accessFile, {});
  await fs.writeFile(accessFile, JSON.stringify(accessMap, null, 2), "utf-8");
}