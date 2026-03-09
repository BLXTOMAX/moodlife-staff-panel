export default function Topbar() {
  return (
    <header className="flex h-[76px] items-center justify-between border-b border-white/5 bg-black/30 px-6">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-yellow-400/70">
          MoodLifeRP
        </p>
        <h2 className="text-2xl font-bold text-white">Panel Staff</h2>
      </div>

      <div className="rounded-2xl border border-yellow-400/15 bg-yellow-400/5 px-4 py-2 text-sm text-zinc-300">
        Connecté
      </div>
    </header>
  );
}