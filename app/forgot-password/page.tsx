"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setMessage(data.message || data.error || "Une erreur est survenue.");
    } catch {
      setMessage("Erreur serveur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl border border-yellow-400/20 bg-white/5 p-6 space-y-4"
      >
        <h1 className="text-2xl font-black">Mot de passe oublié</h1>

        <input
          type="email"
          placeholder="Ton adresse mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-yellow-400 px-4 py-3 font-bold text-black"
        >
          {loading ? "Envoi..." : "Recevoir un lien"}
        </button>

        {message && <p className="text-sm text-white/80">{message}</p>}
      </form>
    </div>
  );
}