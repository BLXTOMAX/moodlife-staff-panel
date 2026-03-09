"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  email: string;
  password: string;
};

const USERS_STORAGE_KEY = "moodlife-users";
const SESSION_STORAGE_KEY = "moodlife-session-email";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      alert("Merci de remplir tous les champs");
      return;
    }

    const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);

    let users: User[] = [];

    if (savedUsers) {
      try {
        users = JSON.parse(savedUsers);
      } catch (error) {
        console.error("Erreur lecture utilisateurs :", error);
        users = [];
      }
    }

    const existingUser = users.find(
      (u) => u.email.trim().toLowerCase() === normalizedEmail
    );

    if (!existingUser) {
      users.push({
        email: normalizedEmail,
        password,
      });

      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }

    localStorage.setItem(SESSION_STORAGE_KEY, normalizedEmail);

    router.push("/dashboard/info");
  }

  return (
    <div className="flex min-h-screen items-center justify-center text-white">
      <form onSubmit={handleLogin} className="flex w-[320px] flex-col gap-4">
        <h1 className="text-center text-2xl font-bold">Connexion MoodLife</h1>

        <input
          type="email"
          placeholder="Adresse mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl bg-black/40 p-3"
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-xl bg-black/40 p-3"
        />

        <button
          type="submit"
          className="rounded-xl bg-yellow-400 p-3 font-bold text-black"
        >
          Se connecter
        </button>
      </form>
    </div>
  );
}