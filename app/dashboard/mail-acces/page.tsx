"use client";

import { useEffect, useMemo, useState } from "react";
import { Mail, Shield, Search, CheckCircle2 } from "lucide-react";
import ProtectedPage from "@/components/protected-page";

type User = {
  email: string;
  password: string;
};

type UserAccessMap = Record<string, string[]>;

const availablePermissions = [
  { key: "/dashboard/info", label: "Info serveur" },
  { key: "/dashboard/regles-staff", label: "Règles staff" },
  { key: "/dashboard/commandes-staff", label: "Commandes staff" },
  { key: "/dashboard/license", label: "License" },
  { key: "/dashboard/mail", label: "Mail Suicide RP" },
  { key: "/dashboard/absence-staff", label: "Absence staff" },
  { key: "/dashboard/espace-sa-gerant", label: "Espace S-A / Gérant staff" },
  { key: "/dashboard/heures-staff", label: "Heures staff" },
  { key: "/dashboard/bl-staff", label: "BL staff" },
  { key: "/dashboard/remontees", label: "Remontées" },
  { key: "/dashboard/deban-non-autorise", label: "Deban non autorisé" },
  { key: "/dashboard/deban-anticheat", label: "Deban anticheat" },
  { key: "/dashboard/responsable-event", label: "Responsable event" },
  { key: "absence-validation", label: "Validation des absences" },
] as const;

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
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
    <div className="rounded-[24px] border border-yellow-400/15 bg-[#111111]/88 p-5 shadow-[0_10px_28px_rgba(0,0,0,0.30)] backdrop-blur-md">
      <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/80">
        {label}
      </p>
      <p className={`mt-3 text-3xl font-black ${valueClassName}`}>{value}</p>
      <p className="mt-2 text-sm leading-6 text-white/60">{description}</p>
    </div>
  );
}

export default function MailAccesPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [accessMap, setAccessMap] = useState<UserAccessMap>({});
  const [search, setSearch] = useState("");
  const [loaded, setLoaded] = useState(false);

  async function loadData() {
    try {
      const [usersRes, accessRes] = await Promise.all([
        fetch("/api/users", { cache: "no-store" }),
        fetch("/api/access", { cache: "no-store" }),
      ]);

      const usersData = await usersRes.json();
      const accessData = await accessRes.json();

      if (usersData?.success) {
        setUsers(usersData.users ?? []);
      }

      if (accessData?.success) {
        setAccessMap(accessData.accessMap ?? {});
      }
    } catch (error) {
      console.error("Erreur chargement Mail accès :", error);
    } finally {
      setLoaded(true);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function saveAccess(nextMap: UserAccessMap) {
    setAccessMap(nextMap);

    try {
      await fetch("/api/access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accessMap: nextMap }),
      });
    } catch (error) {
      console.error("Erreur sauvegarde Mail accès :", error);
    }
  }

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = normalize(search);
    return users.filter((user) => normalize(user.email).includes(q));
  }, [users, search]);

  const totalPermissionsGiven = useMemo(() => {
    return Object.values(accessMap).reduce((acc, permissions) => {
      return acc + permissions.length;
    }, 0);
  }, [accessMap]);

  function togglePermission(email: string, permission: string) {
    const current = accessMap[email] ?? [];
    const exists = current.includes(permission);

    const nextMap = {
      ...accessMap,
      [email]: exists
        ? current.filter((item) => item !== permission)
        : [...current, permission],
    };

    saveAccess(nextMap);
  }

  function grantAll(email: string) {
    const nextMap = {
      ...accessMap,
      [email]: availablePermissions.map((item) => item.key),
    };

    saveAccess(nextMap);
  }

  function clearAll(email: string) {
    const nextMap = {
      ...accessMap,
      [email]: [],
    };

    saveAccess(nextMap);
  }

  return (
    <ProtectedPage permission="/dashboard/mail-acces">
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[32px] border border-yellow-400/15 bg-gradient-to-r from-black/80 via-black/70 to-black/40 p-8 shadow-[0_10px_40px_rgba(0,0,0,0.45)]">
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-yellow-400/10 blur-3xl" />
          <div className="absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-yellow-300/10 blur-3xl" />

          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-yellow-300">
              Gestion des accès
            </p>

            <h1 className="mt-4 text-4xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.75)]">
              Mail accès
            </h1>

            <div className="mt-4 h-px w-40 bg-gradient-to-r from-yellow-400 via-yellow-300 to-transparent" />

            <p className="mt-4 max-w-4xl text-sm leading-7 text-white/82">
              Gère ici les mails connectés au panel et choisis précisément quelles
              catégories chaque personne peut voir.
            </p>
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-3">
          <StatCard
            label="Utilisateurs"
            value={users.length}
            description="Nombre total de mails enregistrés via la page login."
          />
          <StatCard
            label="Résultats visibles"
            value={filteredUsers.length}
            description="Nombre d’utilisateurs affichés avec la recherche."
            valueClassName="text-sky-300"
          />
          <StatCard
            label="Permissions"
            value={totalPermissionsGiven}
            description="Total des accès attribués sur l’ensemble des comptes."
            valueClassName="text-emerald-300"
          />
        </div>

        <div className="rounded-[30px] border border-yellow-400/15 bg-[#111111]/88 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-yellow-300/80">
                Recherche
              </p>
              <h2 className="mt-1 text-2xl font-black text-white">
                Comptes enregistrés
              </h2>
            </div>
          </div>

          <div className="relative mt-5">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <input
              type="text"
              placeholder="Rechercher un mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-yellow-400/15 bg-[#0b0b0b]/90 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-yellow-400/35 focus:bg-[#111111]"
            />
          </div>

          <div className="mt-6 space-y-4">
            {!loaded ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-white/55">
                Chargement...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-white/55">
                Aucun utilisateur trouvé.
              </div>
            ) : (
              filteredUsers.map((user) => {
                const userPermissions = accessMap[user.email] ?? [];

                return (
                  <div
                    key={user.email}
                    className="rounded-[28px] border border-yellow-400/15 bg-[#151515]/92 p-5 shadow-[0_8px_22px_rgba(0,0,0,0.28)]"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-yellow-300" />
                          <p className="text-lg font-bold text-white">
                            {user.email}
                          </p>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs text-white/65">
                            {userPermissions.length} accès
                          </span>

                          {userPermissions.length > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Configuré
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => grantAll(user.email)}
                          className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/15"
                        >
                          Tout autoriser
                        </button>

                        <button
                          type="button"
                          onClick={() => clearAll(user.email)}
                          className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/15"
                        >
                          Tout retirer
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {availablePermissions.map((permission) => {
                        const checked = userPermissions.includes(permission.key);

                        return (
                          <label
                            key={`${user.email}-${permission.key}`}
                            className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                              checked
                                ? "border-yellow-400/25 bg-yellow-400/[0.06]"
                                : "border-white/10 bg-black/25 hover:border-yellow-400/15"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                togglePermission(user.email, permission.key)
                              }
                              className="mt-1 h-4 w-4 accent-yellow-400"
                            />

                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-white">
                                {permission.label}
                              </p>
                              <p className="mt-1 break-all text-xs text-white/45">
                                {permission.key}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-[28px] border border-yellow-400/15 bg-[#111111]/88 p-5 shadow-[0_10px_24px_rgba(0,0,0,0.28)]">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-2 text-yellow-300">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Étape suivante
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/72">
                Une fois les accès attribués ici, on pourra filtrer automatiquement
                le menu du dashboard et bloquer les pages non autorisées selon le
                mail connecté.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}