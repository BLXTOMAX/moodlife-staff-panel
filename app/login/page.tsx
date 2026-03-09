"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Remplis tous les champs");
      return;
    }

    const { error } = await supabase
      .from("users")
      .insert([
        {
          email,
          password,
        },
      ]);

    if (error) {
      console.error(error);
    }

    localStorage.setItem("moodlife-email", email);

    router.push("/dashboard/info");
  };

  return (
    <div className="login">
      <input
        type="email"
        placeholder="Adresse mail"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Mot de passe"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>
        Se connecter
      </button>
    </div>
  );
}