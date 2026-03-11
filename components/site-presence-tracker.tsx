"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getSessionEmail } from "@/lib/access";

export default function SitePresenceTracker() {
  useEffect(() => {
    const email = getSessionEmail();

    if (!email) return;

    let heartbeat: ReturnType<typeof setInterval> | null = null;

    const markOnline = async () => {
      await supabase.from("site_presence").upsert({
        email,
        name: email,
        is_online: true,
        connected_at: new Date().toISOString(),
        last_seen: new Date().toISOString(),
      });
    };

    const updateHeartbeat = async () => {
      await supabase
        .from("site_presence")
        .update({
          is_online: true,
          last_seen: new Date().toISOString(),
        })
        .eq("email", email);
    };

    const markOffline = async () => {
      await supabase
        .from("site_presence")
        .update({
          is_online: false,
          last_seen: new Date().toISOString(),
        })
        .eq("email", email);
    };

    markOnline();

    heartbeat = setInterval(() => {
      updateHeartbeat();
    }, 5000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        updateHeartbeat();
      }
    };

    const handleBeforeUnload = () => {
      markOffline();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (heartbeat) clearInterval(heartbeat);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      markOffline();
    };
  }, []);

  return null;
}