"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Lock, Mail, ShieldCheck, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: `${5 + ((i * 17) % 90)}%`,
        top: `${8 + ((i * 29) % 80)}%`,
        size: 2 + (i % 4),
        duration: 7 + (i % 6),
        delay: (i % 5) * 0.8,
      })),
    []
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !password) {
      alert("Remplis tous les champs");
      return;
    }

    try {
      setLoading(true);

      const normalizedEmail = email.trim().toLowerCase();

      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result?.success) {
        alert(result?.message || "Identifiants invalides.");
        return;
      }

      localStorage.setItem("moodlife-session-email", normalizedEmail);
      localStorage.removeItem("moodlife-email");

      window.location.href = "/dashboard/info";
    } catch (error) {
      console.error("Erreur login :", error);
      alert("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#040404] px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(234,179,8,0.08),transparent_26%),radial-gradient(circle_at_right,rgba(250,204,21,0.10),transparent_24%),linear-gradient(135deg,#030303,#090909,#050505)]" />

      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:70px_70px]" />

      <div className="mood-orb absolute left-1/2 top-[-120px] h-[460px] w-[460px] -translate-x-1/2 rounded-full bg-yellow-400/12 blur-[140px]" />
      <div className="mood-orb-slow absolute bottom-[-120px] left-[-80px] h-[320px] w-[320px] rounded-full bg-amber-300/10 blur-[130px]" />
      <div className="mood-orb absolute right-[-80px] top-[20%] h-[300px] w-[300px] rounded-full bg-yellow-500/10 blur-[130px]" />

      <div className="pointer-events-none absolute inset-0">
        {particles.map((particle) => (
          <span
            key={particle.id}
            className="mood-particle absolute rounded-full bg-yellow-300/70 shadow-[0_0_16px_rgba(250,204,21,0.35)]"
            style={{
              left: particle.left,
              top: particle.top,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-[1180px]">
        <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
          <section className="hidden lg:block">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-yellow-300">
                <Sparkles className="h-3.5 w-3.5" />
                Accès privé MoodLife
              </div>

              <div className="mt-7 flex items-center gap-4">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-[26px] border border-yellow-400/20 bg-yellow-400/10 shadow-[0_0_40px_rgba(250,204,21,0.08)]">
                  <Image
                    src="/moodlife-logo.png"
                    alt="MoodLife"
                    width={46}
                    height={46}
                    className="object-contain"
                    priority
                  />
                </div>

                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-yellow-300/85">
                    MoodLife
                  </p>
                  <h1 className="mt-2 text-6xl font-black leading-[0.95] tracking-tight text-white">
                    Panel Staff
                  </h1>
                </div>
              </div>

              <div className="mt-6 h-px w-44 bg-gradient-to-r from-yellow-400 via-yellow-300 to-transparent" />

              <p className="mt-6 max-w-lg text-base leading-8 text-white/68">
                Connecte-toi à l’espace interne pour accéder aux outils staff,
                aux commandes, aux procédures et aux informations importantes du
                serveur dans une interface premium.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-2 text-yellow-300">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold text-white">
                      Espace sécurisé
                    </p>
                  </div>

                  <p className="mt-3 text-sm leading-7 text-white/58">
                    Connexion réservée au staff autorisé avec accès interne
                    protégé.
                  </p>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-2 text-yellow-300">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold text-white">
                      Interface premium
                    </p>
                  </div>

                  <p className="mt-3 text-sm leading-7 text-white/58">
                    Un design haut de gamme pensé pour l’usage quotidien de
                    l’équipe.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="relative">
            <div className="absolute inset-0 rounded-[36px] bg-[linear-gradient(135deg,rgba(250,204,21,0.16),rgba(255,255,255,0.02),rgba(0,0,0,0.02))] blur-2xl" />

            <div className="relative overflow-hidden rounded-[34px] border border-yellow-400/15 bg-[linear-gradient(180deg,rgba(12,12,12,0.94),rgba(7,7,7,0.90))] p-8 shadow-[0_30px_90px_rgba(0,0,0,0.58)] backdrop-blur-xl sm:p-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.08),transparent_28%)]" />
              <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-yellow-300/8 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-yellow-500/8 blur-3xl" />

              <div className="relative">
                <div className="mb-8 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] border border-yellow-400/20 bg-yellow-400/10 shadow-[0_0_40px_rgba(250,204,21,0.10)]">
                    <Image
                      src="/moodlife-logo.png"
                      alt="MoodLife"
                      width={44}
                      height={44}
                      className="object-contain"
                      priority
                    />
                  </div>

                  <p className="mt-5 text-xs font-semibold uppercase tracking-[0.35em] text-yellow-300">
                    Connexion sécurisée
                  </p>

                  <h2 className="mt-4 text-4xl font-black tracking-tight text-white">
                    Connexion MoodLife
                  </h2>

                  <p className="mt-3 text-sm leading-7 text-white/58">
                    Accède au panel privé avec ton adresse mail et ton mot de
                    passe.
                  </p>

                  <div className="mx-auto mt-5 h-px w-40 bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-white/42">
                      Adresse mail
                    </label>

                    <div className="group relative">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30 transition group-focus-within:text-yellow-300" />
                      <input
                        type="email"
                        placeholder="exemple@moodlife-rp.net"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.03] py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-white/25 focus:border-yellow-400/30 focus:bg-white/[0.05]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-white/42">
                      Mot de passe
                    </label>

                    <div className="group relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30 transition group-focus-within:text-yellow-300" />
                      <input
                        type="password"
                        placeholder="Entre ton mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.03] py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-white/25 focus:border-yellow-400/30 focus:bg-white/[0.05]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative mt-2 w-full overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#fde047,#facc15,#f59e0b)] px-4 py-4 font-bold text-black shadow-[0_18px_34px_rgba(250,204,21,0.22)] transition duration-300 hover:scale-[1.01] hover:shadow-[0_22px_42px_rgba(250,204,21,0.30)] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <span className="relative z-10">
                      {loading ? "Connexion..." : "Se connecter"}
                    </span>
                    <div className="absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100 bg-[linear-gradient(135deg,#facc15,#fde047,#fbbf24)]" />
                  </button>
                </form>

                <div className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-white/38">
                  <ShieldCheck className="h-3.5 w-3.5 text-yellow-300/70" />
                  Session interne MoodLife • accès réservé au staff autorisé
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <style jsx>{`
        @keyframes floatParticle {
          0% {
            transform: translateY(0px) scale(1);
            opacity: 0.15;
          }
          25% {
            opacity: 0.9;
          }
          50% {
            transform: translateY(-18px) scale(1.15);
            opacity: 0.45;
          }
          75% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(0px) scale(1);
            opacity: 0.2;
          }
        }

        @keyframes glowMove {
          0%,
          100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-12px) scale(1.04);
          }
        }

        @keyframes glowMoveSlow {
          0%,
          100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(14px) scale(1.06);
          }
        }

        .mood-particle {
          animation-name: floatParticle;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }

        .mood-orb {
          animation: glowMove 9s ease-in-out infinite;
        }

        .mood-orb-slow {
          animation: glowMoveSlow 12s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}