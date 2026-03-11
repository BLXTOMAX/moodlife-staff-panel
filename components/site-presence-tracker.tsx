"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type PresenceRow = {
  email: string;
  name: string | null;
  is_online: boolean;
  connected_at: string | null;
  last_seen: string;
};

function formatLastSeen(value: string) {
  const diff = Math.floor((Date.now() - new Date(value).getTime()) / 1000);

  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  return `il y a ${Math.floor(diff / 86400)} j`;
}

export default function SitePresenceWidget() {
  const [rows, setRows] = useState<PresenceRow[]>([]);

  async function loadPresence() {
    const { data, error } = await supabase
      .from("site_presence")
      .select("*")
      .order("last_seen", { ascending: false });

    if (error) {
      console.error("Erreur chargement présence :", error);
      return;
    }

    setRows((data || []) as PresenceRow[]);
  }

  useEffect(() => {
    loadPresence();

    const interval = setInterval(() => {
      loadPresence();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const { onlineUsers, offlineUsers } = useMemo(() => {
    const now = Date.now();

    const online = rows.filter((user) => {
      const lastSeen = new Date(user.last_seen).getTime();
      return now - lastSeen < 60000;
    });

    const offline = rows.filter((user) => {
      const lastSeen = new Date(user.last_seen).getTime();
      return now - lastSeen >= 60000;
    });

    return {
      onlineUsers: online,
      offlineUsers: offline,
    };
  }, [rows]);

  return (
    <div className="rounded-3xl border border-white/10 bg-[#111111]/88 p-6">
      <h2 className="text-2xl font-black text-white">Présence sur le site</h2>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-emerald-400/15 bg-emerald-500/10 p-4">
          <p className="text-sm text-emerald-200">En ligne</p>
          <p className="mt-2 text-3xl font-black text-white">
            {onlineUsers.length}
          </p>
        </div>

        <div className="rounded-2xl border border-rose-400/15 bg-rose-500/10 p-4">
          <p className="text-sm text-rose-200">Hors ligne</p>
          <p className="mt-2 text-3xl font-black text-white">
            {offlineUsers.length}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-bold text-white">Connectés</h3>
        <div className="mt-3 space-y-2">
          {onlineUsers.length === 0 ? (
            <p className="text-sm text-white/60">Personne en ligne.</p>
          ) : (
            onlineUsers.map((user) => (
              <div
                key={user.email}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
              >
                <p className="font-semibold text-white">
                  {user.name || user.email}
                </p>
                <p className="text-sm text-white/55">{user.email}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-bold text-white">Hors ligne</h3>
        <div className="mt-3 space-y-2">
          {offlineUsers.length === 0 ? (
            <p className="text-sm text-white/60">Tout le monde est en ligne.</p>
          ) : (
            offlineUsers.map((user) => (
              <div
                key={user.email}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3"
              >
                <p className="font-semibold text-white">
                  {user.name || user.email}
                </p>
                <p className="text-sm text-white/55">{user.email}</p>
                <p className="mt-1 text-xs text-white/40">
                  Vu {formatLastSeen(user.last_seen)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}