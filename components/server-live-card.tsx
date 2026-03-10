"use client";

import { useEffect, useState } from "react";

export default function ServerLiveCard() {
  const [staffOnline, setStaffOnline] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchStaffOnline = async () => {
    try {
      const res = await fetch("/api/staff-online", {
        cache: "no-store",
      });

      if (!res.ok) return;

      const data = await res.json();
      setStaffOnline(data.count ?? 0);
    } catch (error) {
      console.error("Erreur récupération staff online :", error);
    } finally {
      setLoading(false);
    }
  };

  const sendHeartbeat = async () => {
    try {
      await fetch("/api/staff-heartbeat", {
        method: "POST",
        cache: "no-store",
      });
    } catch (error) {
      console.error("Erreur heartbeat :", error);
    }
  };

  useEffect(() => {
    fetchStaffOnline();
    sendHeartbeat();

    const interval = setInterval(() => {
      sendHeartbeat();
      fetchStaffOnline();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-2xl border border-yellow-500/20 bg-black p-6">
      <p className="text-xs uppercase tracking-[0.3em] text-yellow-400">
        Nombre de staff Moodlife
      </p>

      <div className="mt-4">
        <h2 className="text-5xl font-bold text-white">
          {loading ? "..." : staffOnline}
        </h2>
        <p className="mt-2 text-sm text-white/70">
          Staff ayant accès à cette page.
        </p>
      </div>
    </div>
  );
}