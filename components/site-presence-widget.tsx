"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getSessionEmail } from "@/lib/access";

type PresenceRow = {
  email: string;
  name: string | null;
  is_online: boolean;
  connected_at: string | null;
  last_seen: string;
};

export default function SitePresenceWidget() {
  const [rows, setRows] = useState<PresenceRow[]>([]);
  const [canSeeDetails, setCanSeeDetails] = useState(false);

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

  async function loadPermission() {
    const email = getSessionEmail();

    if (!email) {
      setCanSeeDetails(false);
      return;
    }

    const { data, error } = await supabase
      .from("user_permissions")
      .select("permission")
      .eq("email", email);

    if (error) {
      console.error("Erreur chargement permission présence :", error);
      setCanSeeDetails(false);
      return;
    }

    const permissions = (data || []).map((item) => item.permission);
    const hasMailAccess =
      permissions.includes("Mail Acces") ||
      permissions.includes("Mail Access") ||
      permissions.includes("Mail Accès");

    setCanSeeDetails(hasMailAccess);
  }

  useEffect(() => {
    loadPresence();
    loadPermission();

    const interval = setInterval(() => {
      loadPresence();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const { onlineUsers, offlineUsers } = useMemo(() => {
    const now = Date.now();

    const online = rows.filter((user) => {
      const lastSeen = new Date(user.last_seen).getTime();
      return user.is_online && now - lastSeen < 60000;
    });

    const offline = rows.filter((user) => {
      const lastSeen = new Date(user.last_seen).getTime();
      return !user.is_online || now - lastSeen >= 60000;
    });

    return {
      onlineUsers: online,
      offlineUsers: offline,
    };
  }, [rows]);

  return (
    <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6 shadow-[0_14px_34px_rgba(0,0,0,0.36)] backdrop-blur-xl">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.24em] text-yellow-200/80">
          Staff panel
        </p>
        <h2 className="mt-2 text-2xl font-black text-white">
          Présence sur le site
        </h2>
        <p className="mt-2 text-sm leading-6 text-white/60">
          Nombre de personnes actuellement connectées ou déconnectées du panel.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[24px] border border-emerald-400/15 bg-emerald-500/10 p-5">
          <p className="text-sm text-emerald-200">Connectés</p>
          <p className="mt-2 text-4xl font-black text-white">
            {onlineUsers.length}
          </p>
        </div>

        <div className="rounded-[24px] border border-rose-400/15 bg-rose-500/10 p-5">
          <p className="text-sm text-rose-200">Déconnectés</p>
          <p className="mt-2 text-4xl font-black text-white">
            {offlineUsers.length}
          </p>
        </div>
      </div>

      {canSeeDetails && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <h3 className="text-lg font-bold text-white">Connectés</h3>
            <div className="mt-3 space-y-2">
              {onlineUsers.length === 0 ? (
                <p className="text-sm text-white/60">Personne en ligne.</p>
              ) : (
                onlineUsers.map((user) => (
                  <div
                    key={user.email}
                    className="rounded-xl border border-white/10 bg-black/25 px-3 py-2"
                  >
                    <p className="text-sm font-medium text-white">
                      {user.name || user.email}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <h3 className="text-lg font-bold text-white">Déconnectés</h3>
            <div className="mt-3 space-y-2">
              {offlineUsers.length === 0 ? (
                <p className="text-sm text-white/60">
                  Tout le monde est connecté.
                </p>
              ) : (
                offlineUsers.map((user) => (
                  <div
                    key={user.email}
                    className="rounded-xl border border-white/10 bg-black/25 px-3 py-2"
                  >
                    <p className="text-sm font-medium text-white">
                      {user.name || user.email}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}