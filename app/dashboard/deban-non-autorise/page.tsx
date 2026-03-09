"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Ban,
  FileText,
  Search,
  ShieldAlert,
  TerminalSquare,
} from "lucide-react";

const verificationReasons = [
  "Attempted to use 'Infinite Stamina'",
  "Attempted to use GodMode",
  "Attempted to use 'No Ragdoll'",
  "Attempted to use a Lua Menu",
  "Attempted to use 'NoClip'",
  "Attempted to use Invisibility",
  "Attempted to use No Reload",
  "Attempted to use HX Softwares",
  "Attempted to use Weapon Spawn Safe",
  "Attempted to use Red Engine",
  "Attempted to use Spoofed Bullets",
  "Attempted to use Explosive Bullets",
  "Attempted to use Super Punch on a player",
  "Attempted to use Super Punch on a vehicle",
  "Attempted to use an executor",
  "Attempted to use a blacklisted weapon",
  "Attempted to spawn a blacklisted explosion",
  "Attempted to spawn a blacklisted projectile",
  "Attempted to spawn a blacklisted vehicle",
  "Attempted to spawn a blacklisted object",
  "Attempted to spawn [NOMBRE] explosions in less than 5 seconds",
  "Attempted to spawn [NOMBRE] projectiles in less than 5 seconds",
  "Attempted to spawn [NOMBRE] vehicles in less than 5 seconds",
  "Attempted to spawn [NOMBRE] objects in less than 5 seconds",
  "Attempted to spawn an invisible explosion",
  "Attempted to spawn an invisible projectiles",
  "Attempted to spawn an invisible objects",
  "Attempted to spawn an explosion",
  "Attempted to spawn a particle",
  "Attempted to spawn a weapon",
  "Attempted to spawn a ped",
  "Attempted to change his vehicle handling",
  "Attempted to change his ped model",
  "Attempted to change his vehicle's power",
  "Attempted to request control of a vehicle",
  "Attempted to request control of an entity",
  "Attempted to request control of a ped",
  "Attempted to modify players' hitbox dimensions",
  "Attempted to modify component damages",
  "Attempted to kill a player silently with Skript",
  "Attempted to kill a player (Eulen)",
  "Attempted to stop a resource",
  "Attempted to inject a resource",
  "Attempted to spectate a player",
  "Attempted to stop WaveShield",
  "Attempted to trigger a server event / Attempted to re-trigger a server event",
  "Attempted to remove a weapon from ...",
  "Attempted to add ammos in his weapon",
  "Attempted to override default damages",
  "Attempted to Aim Bot",
  "Attempted to modify player hitboxes",
  "Attempted to bomb a vehicle",
  "Attempted to throw a vehicle",
  "Attempted to add a blip on a player",
  "Attempted to crash players",
  "Attempted to ban evade (Spoof)",
  "Spawn Mass Vehicles",
  "Spawn Blacklist Vehicle",
  "Anti Spectate",
  "Anti Shoot Player",
  "Bad Native Execution",
  "CONSOLE",
  "Use Protected Trigger",
  "Clear Ped Tasks Event",
  "Tente de ce setjob",
  "Streamed Blacklist Textures",
];

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function highlight(text: string, query: string) {
  if (!query.trim()) return text;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "ig");
  const parts = text.split(regex);

  return parts.map((part, index) =>
    regex.test(part) ? (
      <mark
        key={`${part}-${index}`}
        className="rounded-md bg-yellow-400/20 px-1 py-0.5 text-yellow-200"
      >
        {part}
      </mark>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    )
  );
}

function StatCard({
  label,
  value,
  description,
  valueClassName = "text-white",
}: {
  label: string;
  value: string | number;
  description: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-2xl border border-yellow-400/15 bg-[#111111]/88 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.32)] backdrop-blur-md">
      <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/80">
        {label}
      </p>
      <p className={`mt-3 text-3xl font-black ${valueClassName}`}>{value}</p>
      <p className="mt-2 text-sm leading-6 text-white/60">{description}</p>
    </div>
  );
}

function ReasonCard({
  reason,
  index,
  search,
}: {
  reason: string;
  index: number;
  search: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-yellow-400/15 bg-[#151515]/92 p-4 shadow-[0_8px_22px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-0.5 hover:border-yellow-400/30 hover:bg-[#1b1b1b]">
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/[0.05] via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
      <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent" />

      <div className="relative flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-yellow-400/30 bg-yellow-400/15 text-sm font-extrabold text-yellow-200 shadow-[0_0_12px_rgba(255,215,0,0.12)]">
          {index + 1}
        </div>

        <p className="text-sm leading-7 text-white/90">{highlight(reason, search)}</p>
      </div>
    </div>
  );
}

export default function DebanNonAutorisePage() {
  const [search, setSearch] = useState("");

  const filteredReasons = useMemo(() => {
    if (!search.trim()) return verificationReasons;
    const q = normalize(search);
    return verificationReasons.filter((item) => normalize(item).includes(q));
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-red-500/20 bg-gradient-to-r from-black/85 via-black/75 to-black/45 p-7 shadow-[0_10px_40px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-red-500/10 blur-3xl" />
        <div className="absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-yellow-400/10 blur-3xl" />

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-yellow-300">
            Deban Non Autorisé
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.75)]">
            Procédure de vérification PC & gestion AC
          </h1>

          <div className="mt-4 h-px w-48 bg-gradient-to-r from-red-400 via-yellow-300 to-transparent" />

          <p className="mt-4 max-w-5xl text-sm leading-7 text-white/82">
            Si une personne fait un ticket ou vient en BDA pour demander un unban,
            et que la raison de son ban correspond à l’un des motifs ci-dessous,
            une vérification PC doit être effectuée.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-red-500/20 bg-red-500/[0.08] p-5 shadow-[0_10px_24px_rgba(127,29,29,0.16)]">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-2 text-red-300">
            <ShieldAlert className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">Accès restreint</h2>
            <p className="mt-2 text-sm leading-6 text-white/78">
              Les vérifications de PC ainsi que les unban AC sont{" "}
              <span className="font-semibold text-red-300">
                uniquement autorisés aux Anticheat
              </span>{" "}
              avec au minimum le grade{" "}
              <span className="font-semibold text-yellow-300">
                Administrateur
              </span>.
            </p>
          </div>
        </div>
      </div>

      <div className={`grid gap-4 ${search.trim() ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
        <StatCard
          label="Motifs listés"
          value={verificationReasons.length}
          description="Raisons de vérification PC répertoriées."
        />

        {search.trim() && (
          <StatCard
            label="Résultats"
            value={filteredReasons.length}
            description="Motifs correspondant à la recherche."
            valueClassName="text-sky-300"
          />
        )}

        <div className="rounded-2xl border border-yellow-400/15 bg-[#111111]/88 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.32)] backdrop-blur-md">
          <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/80">
            Unban AC
          </p>
          <p className="mt-3 text-sm font-semibold text-white">
            F8 → waveshield unban [id ban]
          </p>
          <p className="mt-2 text-sm text-white/60">
            Exemple : waveshield unban 21324
          </p>
        </div>

        <div className="rounded-2xl border border-yellow-400/15 bg-[#111111]/88 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.32)] backdrop-blur-md">
          <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/80">
            Ban AC
          </p>
          <p className="mt-3 text-sm font-semibold text-white">
            F8 → waveshield ban [id] [raison]
          </p>
          <p className="mt-2 text-sm text-white/60">
            Exemple : waveshield ban 54 moddeur
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-3xl border border-yellow-400/15 bg-[#111111]/88 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/80">
                Raisons de vérification
              </p>
              <h2 className="mt-1 text-2xl font-bold text-white">
                Motifs nécessitant une vérification PC
              </h2>
            </div>
          </div>

          <div className="relative mt-5">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <input
              type="text"
              placeholder="Rechercher un motif, un mot-clé, une raison..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-yellow-400/15 bg-[#0b0b0b]/90 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-yellow-400/35 focus:bg-[#111111]"
            />
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {filteredReasons.map((reason, index) => (
              <ReasonCard
                key={`${reason}-${index}`}
                reason={reason}
                index={index}
                search={search}
              />
            ))}

            {filteredReasons.length === 0 && (
              <div className="md:col-span-2 rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-white/60">
                Aucun motif trouvé pour{" "}
                <span className="text-yellow-300">“{search}”</span>.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-yellow-400/15 bg-[#111111]/88 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-2 text-yellow-300">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/80">
                  Document
                </p>
                <h2 className="mt-1 text-xl font-bold text-white">
                  Doc vérification PC
                </h2>
              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-white/75">
              Nouveau document de référence pour les vérifications de PC,
              repris du document de Nico.
            </p>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-yellow-300/80">
                Dernière modification
              </p>
              <p className="mt-2 text-sm text-white/85">
                Vendredi 16 août 2024 à 00:33
              </p>
              <p className="mt-2 text-sm leading-6 text-white/60">
                Ajout de 31 bans, total de 67 bans, remise en page des bans et
                modification du document de vérifications PC.
              </p>
            </div>

            <a
              href="https://docs.google.com/document/d/1KLfrinkKH6eBt2LwhEzOI2R9MhRKAl-JvadeOGdlT4k/edit?usp=sharing"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex rounded-2xl border border-yellow-400/20 bg-yellow-400/10 px-4 py-3 text-sm font-semibold text-yellow-200 transition hover:bg-yellow-400/15"
            >
              Ouvrir le document
            </a>
          </div>

          <div className="rounded-3xl border border-yellow-400/15 bg-[#111111]/88 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-2 text-red-300">
                <Ban className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/80">
                  Procédure
                </p>
                <h2 className="mt-1 text-xl font-bold text-white">
                  Rappel important
                </h2>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-sm font-semibold text-white">
                  Si la raison du ban est dans la liste
                </p>
                <p className="mt-2 text-sm leading-6 text-white/68">
                  Une vérification PC doit être faite avant toute décision,
                  uniquement par les membres autorisés.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-sm font-semibold text-white">Unban AC</p>
                <code className="mt-2 block break-all text-sm text-yellow-200">
                  waveshield unban [son id ban]
                </code>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-sm font-semibold text-white">Ban AC</p>
                <code className="mt-2 block break-all text-sm text-yellow-200">
                  waveshield ban [id en jeu] [raison]
                </code>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-red-500/20 bg-red-500/[0.08] p-5 shadow-[0_10px_24px_rgba(127,29,29,0.16)]">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-2 text-red-300">
                <TerminalSquare className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  Restriction absolue
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/78">
                  Vérification des PC et unban AC :{" "}
                  <span className="font-semibold text-red-300">
                    Anticheat uniquement
                  </span>{" "}
                  avec au minimum{" "}
                  <span className="font-semibold text-yellow-300">
                    Administrateur
                  </span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}