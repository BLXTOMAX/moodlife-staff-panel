"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

const SESSION_STORAGE_KEY = "moodlife-session-email";
const SESSION_NAME_KEY = "moodlife-session-name";

export default function SitePresenceTracker() {
  useEffect(() => {
    const sessionEmail =
      typeof window !== "undefined"
        ? localStorage.getItem(SESSION_STORAGE_KEY)
        : null;

    const sessionName =
      typeof window !== "undefined"
        ? localStorage.getItem(SESSION_NAME_KEY)
        : null;

    console.log("Presence tracker email =", sessionEmail);
    console.log("Presence tracker name =", sessionName);

    if (!sessionEmail) return;

    let heartbeat: ReturnType<typeof setInterval> | null = null;

    const markOnline = async () => {
      const { error } = await supabase.from("site_presence").upsert({
        email: sessionEmail,
        name: sessionName || sessionEmail,
        is_online: true,
        connected_at: new Date().toISOString(),
        last_seen: new Date().toISOString(),
      });

      if (error) {
        console.error("Erreur markOnline :", error);
      } else {
        console.log("Présence enregistrée");
      }
    };

    const updateHeartbeat = async () => {
      const { error } = await supabase
        .from("site_presence")
        .update({
          is_online: true,
          last_seen: new Date().toISOString(),
        })
        .eq("email", sessionEmail);

      if (error) {
        console.error("Erreur heartbeat :", error);
      }
    };

    const markOffline = async () => {
      const { error } = await supabase
        .from("site_presence")
        .update({
          is_online: false,
          last_seen: new Date().toISOString(),
        })
        .eq("email", sessionEmail);

      if (error) {
        console.error("Erreur markOffline :", error);
      }
    };

    markOnline();

    heartbeat = setInterval(() => {
      updateHeartbeat();
    }, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        updateHeartbeat();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (heartbeat) clearInterval(heartbeat);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      markOffline();
    };
  }, []);

  return null;
}