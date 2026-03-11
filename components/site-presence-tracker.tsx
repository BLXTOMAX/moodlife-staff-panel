"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getSessionEmail } from "@/lib/access";

export default function SitePresenceTracker() {
  useEffect(() => {
    const email = getSessionEmail();

    console.log("TRACKER EMAIL =", email);

    if (!email) return;

    const markOnline = async () => {
      const { error } = await supabase.from("site_presence").upsert({
        email,
        name: email,
        is_online: true,
        connected_at: new Date().toISOString(),
        last_seen: new Date().toISOString(),
      });

      if (error) {
        console.error("Erreur Supabase :", error);
      } else {
        console.log("Utilisateur enregistré online");
      }
    };

    markOnline();
  }, []);

  return null;
}