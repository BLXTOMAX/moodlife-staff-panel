import { NextResponse } from "next/server";

const JOIN_CODE = "5g6lmd";

export async function GET() {
  try {
    const res = await fetch(
      `https://servers-frontend.fivem.net/api/servers/single/${JOIN_CODE}`,
      {
        headers: {
          "User-Agent": "MoodLifeRP-Panel/1.0",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Impossible de récupérer les stats serveur." },
        { status: 500 }
      );
    }

    const data = await res.json();

    // La structure peut varier selon la réponse,
    // donc on sécurise un peu les accès.
    const serverData = data?.Data ?? data?.data ?? data ?? {};

    const players =
      serverData?.clients ??
      serverData?.sv_maxclients_current ??
      serverData?.players ??
      0;

    const maxPlayers =
      serverData?.sv_maxclients ??
      serverData?.maxClients ??
      serverData?.vars?.sv_maxClients ??
      0;

    const hostname =
      serverData?.hostname ??
      serverData?.sv_projectName ??
      serverData?.vars?.sv_projectName ??
      "MoodLife";

    return NextResponse.json({
      players,
      maxPlayers,
      hostname,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur serveur pendant la récupération des stats." },
      { status: 500 }
    );
  }
}