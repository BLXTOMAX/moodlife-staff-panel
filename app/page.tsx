"use client";

import Link from "next/link";
import { ArrowRight, Shield, MessageCircle } from "lucide-react";
import Image from "next/image";
import { Lock } from "lucide-react";
import { getSessionEmail, hasPermission, isOwner } from "@/lib/access";

function FloatingParticles() {
  const particles = [
    "left-[8%] top-[12%]",
    "left-[18%] top-[72%]",
    "left-[28%] top-[22%]",
    "left-[36%] top-[82%]",
    "left-[48%] top-[18%]",
    "left-[58%] top-[66%]",
    "left-[66%] top-[28%]",
    "left-[76%] top-[14%]",
    "left-[84%] top-[74%]",
    "left-[90%] top-[34%]",
    "left-[12%] top-[46%]",
    "left-[70%] top-[86%]",
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((pos, index) => (
        <span
          key={index}
          className={`absolute ${pos} h-2.5 w-2.5 rounded-full bg-yellow-300/80 shadow-[0_0_18px_rgba(253,224,71,0.9)] animate-pulse`}
          style={{
            animationDuration: `${2.4 + (index % 5) * 0.6}s`,
            transform: `scale(${0.75 + (index % 4) * 0.25})`,
          }}
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(250,204,21,0.16),transparent_30%),radial-gradient(circle_at_50%_50%,rgba(250,204,21,0.12),transparent_26%),radial-gradient(circle_at_80%_30%,rgba(250,204,21,0.10),transparent_22%),linear-gradient(to_right,rgba(255,215,0,0.04),transparent_35%,transparent_65%,rgba(255,215,0,0.03))]" />
      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute left-[-8rem] top-[-5rem] h-[24rem] w-[24rem] rounded-full bg-yellow-400/10 blur-3xl" />
      <div className="absolute bottom-[-8rem] right-[-4rem] h-[26rem] w-[26rem] rounded-full bg-yellow-300/10 blur-3xl" />
      <FloatingParticles />

      <section className="relative mx-auto flex min-h-screen max-w-7xl items-center px-6 py-16">
        <div className="grid w-full gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-yellow-300 shadow-[0_0_20px_rgba(250,204,21,0.08)]">
              <Shield className="h-4 w-4" />
              MoodLifeRP
            </div>

            <h1 className="mt-6 text-5xl font-black tracking-tight text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.8)] sm:text-6xl xl:text-7xl">
              MoodLife
              <span className="block bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-300 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(250,204,21,0.22)]">
                Staff Panel
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">
              Accède rapidement au panel staff MoodLife, retrouve les outils
              essentiels, les règlements, les accès rapides et les espaces de
              gestion dans une interface claire, moderne et premium.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/login"
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-7 py-4 text-sm font-bold text-black shadow-[0_10px_35px_rgba(250,204,21,0.24)] transition duration-300 hover:-translate-y-0.5 hover:bg-yellow-300"
              >
                Accéder au panel
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>

              <a
                href="https://discord.gg/moodlife"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-sm font-bold text-white shadow-[0_10px_30px_rgba(0,0,0,0.28)] backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-yellow-400/20 hover:bg-white/10"
              >
                <MessageCircle className="h-4 w-4 text-yellow-300" />
                Rejoindre le Discord
              </a>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-yellow-400/15 bg-[#111111]/80 p-5 shadow-[0_10px_28px_rgba(0,0,0,0.30)] backdrop-blur-md">
                <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/80">
                  Accès
                </p>
                <p className="mt-3 text-2xl font-black text-white">Panel staff</p>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  Entrée rapide vers l’espace de gestion.
                </p>
              </div>

              <div className="rounded-2xl border border-yellow-400/15 bg-[#111111]/80 p-5 shadow-[0_10px_28px_rgba(0,0,0,0.30)] backdrop-blur-md">
                <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/80">
                  Serveur
                </p>
                <p className="mt-3 text-2xl font-black text-white">MoodLifeRP</p>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  Interface interne propre et centralisée.
                </p>
              </div>

              <div className="rounded-2xl border border-yellow-400/15 bg-[#111111]/80 p-5 shadow-[0_10px_28px_rgba(0,0,0,0.30)] backdrop-blur-md">
                <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/80">
                  Style
                </p>
                <p className="mt-3 text-2xl font-black text-white">Premium</p>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  Glow gold, contraste fort et rendu plus clean.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[32px] bg-yellow-400/10 blur-3xl" />

            <div className="relative overflow-hidden rounded-[32px] border border-yellow-400/20 bg-[#0d0d0d]/85 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.42)] backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/[0.06] via-transparent to-transparent" />
              <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent" />

              <div className="relative">
                <p className="text-xs uppercase tracking-[0.3em] text-yellow-300/80">
                  Bienvenue
                </p>

                <h2 className="mt-3 text-3xl font-black text-white">
                  logo-moodlife.png
                </h2>

                <div className="mt-6 flex h-56 items-center justify-center rounded-[28px] border border-yellow-400/15 bg-black/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <div className="text-center">
                    <Image
  src="/logo-moodlife.png"
  alt="MoodLife Logo"
  width={120}
  height={120}
  className="mx-auto drop-shadow-[0_0_20px_rgba(250,204,21,0.4)]"
/>
                    <p className="mt-5 text-2xl font-black text-white">
                      MoodLifeRP
                    </p>
                    <p className="mt-2 text-sm text-white/60">
                      Remplace ce bloc par ton vrai logo si tu veux.
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <p className="text-sm font-semibold text-white">
                      Navigation rapide
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/65">
                      Utilise la page d’accueil comme point d’entrée avant
                      d’accéder au dashboard et aux outils staff.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <p className="text-sm font-semibold text-white">
                      Ambiance visuelle
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/65">
                      Fond animé sombre, particules glow gold et cartes glass
                      pour un rendu plus premium.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}