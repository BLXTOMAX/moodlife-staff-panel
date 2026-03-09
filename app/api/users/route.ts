import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

type StoredUser = {
  email: string;
  password: string;
};

const dataDir = path.join(process.cwd(), "data");
const usersFile = path.join(dataDir, "users.json");

async function ensureUsersFile() {
  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.access(usersFile);
  } catch {
    await fs.writeFile(usersFile, JSON.stringify([], null, 2), "utf-8");
  }
}

async function readUsers(): Promise<StoredUser[]> {
  await ensureUsersFile();
  const raw = await fs.readFile(usersFile, "utf-8");
  return JSON.parse(raw);
}

async function writeUsers(users: StoredUser[]) {
  await ensureUsersFile();
  await fs.writeFile(usersFile, JSON.stringify(users, null, 2), "utf-8");
}

export async function GET() {
  try {
    const users = await readUsers();
    return NextResponse.json({ success: true, users });
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

    const users = await readUsers();
    const exists = users.find(
      (user) => user.email.trim().toLowerCase() === email
    );

    if (!exists) {
      users.push({ email, password });
      await writeUsers(users);
    }

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("POST /api/users error:", error);
    return NextResponse.json(
      { success: false, message: "Impossible d'enregistrer l'utilisateur." },
      { status: 500 }
    );
  }
}