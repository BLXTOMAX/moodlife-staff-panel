"use client";

import { useEffect, useMemo, useState } from "react";

type RemonteeType = "Erreur" | "Point positif";
type PrevenuType = "Oui" | "Non";

type RemonteeRow = {
id: number;
staffRemonte: string;
type: RemonteeType;
description: string;
prevenu: PrevenuType;
auteur: string;
date: string;
};

const STORAGE_KEY = "moodlife-remontees-staff";

export default function RemonteesPage() {
const [rows, setRows] = useState<RemonteeRow[]>([]);
const [nextId, setNextId] = useState(1);

useEffect(() => {
const saved = localStorage.getItem(STORAGE_KEY);
if (!saved) return;

try {
const parsed = JSON.parse(saved);
setRows(parsed.rows || []);
setNextId(parsed.nextId || 1);
} catch {}
}, []);

useEffect(() => {
localStorage.setItem(
STORAGE_KEY,
JSON.stringify({
rows,
nextId,
})
);
}, [rows, nextId]);

const stats = useMemo(() => {
const erreurs = rows.filter((r) => r.type === "Erreur").length;
const positifs = rows.filter((r) => r.type === "Point positif").length;
const prevenus = rows.filter((r) => r.prevenu === "Oui").length;

return { erreurs, positifs, prevenus };
}, [rows]);

function addRow() {
setRows((prev) => [
...prev,
{
id: nextId,
staffRemonte: "",
type: "Erreur",
description: "",
prevenu: "Non",
auteur: "",
date: "",
},
]);
setNextId((p) => p + 1);
}

function removeRow(id: number) {
setRows((prev) => prev.filter((r) => r.id !== id));
}

function updateRow(id: number, field: keyof RemonteeRow, value: any) {
setRows((prev) =>
prev.map((r) =>
r.id === id
? {
...r,
[field]: value,
}
: r
)
);
}

function clearAll() {
setRows([]);
setNextId(1);
localStorage.removeItem(STORAGE_KEY);
}

return (

<div className="space-y-8 relative">
  <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(255,200,0,0.18),transparent_70%)]" />
  <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom,rgba(255,200,0,0.12),transparent_70%)]" />

{/* HEADER */}

<div className="panel-card p-6 border border-yellow-500/20 shadow-[0_0_20px_rgba(255,200,0,0.05)]">

<div className="flex flex-wrap items-center justify-between gap-4">

<div>

<p className="text-xs uppercase tracking-[0.3em] text-yellow-400/70">
Gestion Staff
</p>

<h1 className="text-4xl font-black text-white mt-2">
Remontées Staff
</h1>

<p className="text-zinc-400 mt-2">
Suivi des erreurs et points positifs remontés sur les staffs.
</p>

</div>

<div className="flex gap-3">

<button
onClick={addRow}
className="bg-yellow-400 text-black font-bold px-5 py-3 rounded-xl hover:brightness-105 transition"

>

* Ajouter une remontée

  </button>

<button
onClick={clearAll}
className="px-5 py-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/20 transition"

>

Tout vider </button>

</div>

</div>

</div>

{/* STATS */}

<div className="grid lg:grid-cols-4 gap-4">

<Stat title="Total remontées" value={rows.length} color="text-yellow-300" />

<Stat title="Erreurs" value={stats.erreurs} color="text-red-300" />

<Stat title="Points positifs" value={stats.positifs} color="text-emerald-300" />

<Stat title="Staff prévenus" value={stats.prevenus} color="text-sky-300" />

</div>

{/* TABLE */}

<div className="panel-card p-6 overflow-x-auto">

<table className="w-full text-sm">

<thead className="border-b border-yellow-500/10 text-zinc-400 text-xs uppercase tracking-wider">

<tr>

<th className="py-3 text-left">Staff remonté</th>

<th className="py-3 text-center">Type</th>

<th className="py-3 text-left">Description</th>

<th className="py-3 text-center">Prévenu</th>

<th className="py-3 text-left">Auteur</th>

<th className="py-3 text-center">Date</th>

<th className="py-3 text-center">Action</th>

</tr>

</thead>

<tbody>

{rows.length === 0 && (

<tr>

<td colSpan={7} className="text-center py-10 text-zinc-500">
Aucune remontée pour le moment
</td>

</tr>

)}

{rows.map((row) => (

<tr
key={row.id}
className="border-b border-yellow-500/20 hover:bg-yellow-500/[0.06] transition"
>

{/* STAFF */}

<td className="py-4 pr-4">

<Input
value={row.staffRemonte}
placeholder="Pseudo du staff"
onChange={(v: string) => updateRow(row.id, "staffRemonte", v)}
/>

</td>

{/* TYPE */}

<td className="py-4 text-center">

<select
value={row.type}
onChange={(e) => updateRow(row.id, "type", e.target.value)}
className={`px-3 py-2 rounded-lg border text-sm font-medium
${
row.type === "Erreur"
? "bg-red-500/10 border-red-500/20 text-red-300"
: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
}`}

>

<option value="Erreur">Erreur</option>

<option value="Point positif">Point positif</option>

</select>

</td>

{/* DESCRIPTION */}

<td className="py-4 pr-4">

<textarea
rows={3}
value={row.description}
placeholder="Description détaillée"
onChange={(e) =>
updateRow(row.id, "description", e.target.value)
}
className="w-full px-3 py-2 rounded-xl bg-black/40 border border-yellow-500/20 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-yellow-400/60"
/>

</td>

{/* PREVENU */}

<td className="py-4 text-center">

<select
value={row.prevenu}
onChange={(e) => updateRow(row.id, "prevenu", e.target.value)}
className={`px-3 py-2 rounded-lg border text-sm
${
row.prevenu === "Oui"
? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
: "bg-red-500/10 border-red-500/20 text-red-300"
}`}
>

<option value="Oui">Oui</option>

<option value="Non">Non</option>

</select>

</td>

{/* AUTEUR */}

<td className="py-4 pr-4">

<Input
value={row.auteur}
placeholder="Staff qui remonte"
onChange={(v: string) => updateRow(row.id, "auteur", v)}
/>

</td>

{/* DATE */}

<td className="py-4 text-center">

<input
type="date"
value={row.date}
onChange={(e) => updateRow(row.id, "date", e.target.value)}
className="px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-sm text-white"
/>

</td>

{/* ACTION */}

<td className="py-4 text-center">

<button
onClick={() => removeRow(row.id)}
className="px-3 py-2 text-sm rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition"
>

Suppr.

</button>

</td>

</tr>

))}

</tbody>

</table>

</div>

</div>
);
}

function Stat({ title, value, color }: any) {
return (
<div className="panel-card p-5 border border-yellow-500/10 hover:border-yellow-400/30 transition">

<p className="text-xs uppercase tracking-wider text-zinc-400">
{title}
</p>

<p className={`text-3xl font-black mt-2 ${color}`}>
{value}
</p>

</div>
);
}

function Input({
 value,
 placeholder,
 onChange,
}: {
 value: string
 placeholder: string
 onChange: (v: string) => void
}) {
return (
<input
value={value}
placeholder={placeholder}
onChange={(e) => onChange(e.target.value)}
className="w-full px-3 py-2 rounded-xl bg-black/40 border border-yellow-500/20 focus:border-yellow-400/60"
/>
);
}
