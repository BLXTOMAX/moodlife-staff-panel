import { NextResponse } from "next/server";

const JOIN_CODE = "5g6lmd";
const API_URL = `https://servers-frontend.fivem.net/api/servers/single/${JOIN_CODE}`;
const REQUEST_TIMEOUT_MS = 5000;

type FiveMResponse = {
  Data?: Record<string, unknown>;
  data?: Record<string, unknown>;
} & Record<string, unknown>;

function toSafeNumber(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function toSafeString(value: unknown, fallback = "MoodLife") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

export async function GET() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(API_URL, {
      headers: {
        "User-Agent": "MoodLifeRP-Panel/1.0",
        Accept: "application/json",
      },
      signal: controller.signal,

      // Petit cache serveur pour éviter de taper l'API externe à chaque hit.
      // Ajuste si tu veux plus ou moins frais.
      next: { revalidate: 10 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Impossible de récupérer les stats serveur." },
        { status: 502 }
      );
    }

    const data = (await res.json()) as FiveMResponse;
    const serverData = data?.Data ?? data?.data ?? data ?? {};

    const players = toSafeNumber(
      (serverData as Record<string, unknown>)?.clients ??
        (serverData as Record<string, unknown>)?.sv_maxclients_current ??
        (serverData as Record<string, unknown>)?.players,
      0
    );

    const vars =
      typeof (serverData as Record<string, unknown>)?.vars === "object" &&
      (serverData as Record<string, unknown>)?.vars !== null
        ? ((serverData as Record<string, unknown>).vars as Record<string, unknown>)
        : {};

    const maxPlayers = toSafeNumber(
      (serverData as Record<string, unknown>)?.sv_maxclients ??
        (serverData as Record<string, unknown>)?.maxClients ??
        vars?.sv_maxClients,
      0
    );

    const hostname = toSafeString(
      (serverData as Record<string, unknown>)?.hostname ??
        (serverData as Record<string, unknown>)?.sv_projectName ??
        vars?.sv_projectName,
      "MoodLife"
    );

    return NextResponse.json(
      {
        players,
        maxPlayers,
        hostname,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "s-maxage=10, stale-while-revalidate=30",
        },
      }
    );
  } catch (error) {
    const isAbortError =
      error instanceof Error && error.name === "AbortError";

    return NextResponse.json(
      {
        error: isAbortError
          ? "Timeout pendant la récupération des stats."
          : "Erreur serveur pendant la récupération des stats.",
      },
      {
        status: isAbortError ? 504 : 500,
      }
    );
  } finally {
    clearTimeout(timeout);
  }
}