import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

type AccessMap = Record<string, string[]>;

const dataDir = path.join(process.cwd(), "data");
const accessFile = path.join(dataDir, "access.json");

async function ensureAccessFile() {
  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.access(accessFile);
  } catch {
    await fs.writeFile(accessFile, JSON.stringify({}, null, 2), "utf-8");
  }
}

async function readAccessMap(): Promise<AccessMap> {
  await ensureAccessFile();
  const raw = await fs.readFile(accessFile, "utf-8");
  return JSON.parse(raw);
}

async function writeAccessMap(accessMap: AccessMap) {
  await ensureAccessFile();
  await fs.writeFile(accessFile, JSON.stringify(accessMap, null, 2), "utf-8");
}

export async function GET() {
  try {
    const accessMap = await readAccessMap();
    return NextResponse.json({ success: true, accessMap });
  } catch (error) {
    console.error("GET /api/access error:", error);
    return NextResponse.json(
      { success: false, message: "Impossible de charger les accès." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const accessMap = body?.accessMap;

    if (!accessMap || typeof accessMap !== "object") {
      return NextResponse.json(
        { success: false, message: "AccessMap invalide." },
        { status: 400 }
      );
    }

    await writeAccessMap(accessMap);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/access error:", error);
    return NextResponse.json(
      { success: false, message: "Impossible d'enregistrer les accès." },
      { status: 500 }
    );
  }
}