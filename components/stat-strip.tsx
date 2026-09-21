type Stats = {
  lineCount: number;
  totalMatches: number;
  uniqueCount: number;
  publicCount: number;
  privateCount: number;
  lookedUp: number;
  truncated: boolean;
};

export function StatStrip({ stats }: { stats: Stats }) {
  const tiles = [
    { label: "Lines", value: stats.lineCount },
    { label: "IP mentions", value: stats.totalMatches },
    { label: "Unique IPs", value: stats.uniqueCount },
    { label: "Public", value: stats.publicCount, accent: true },
    { label: "Private", value: stats.privateCount },
    { label: "Enriched", value: stats.lookedUp, accent: true },
  ];

  return (
    <section
      aria-label="Summary"
      className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-zinc-200 bg-zinc-200 sm:grid-cols-3 lg:grid-cols-6"
    >
      {tiles.map((tile) => (
        <div key={tile.label} className="bg-white px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            {tile.label}
          </p>
          <p
            className={`tabular mt-1 font-mono text-2xl font-bold ${
              tile.accent ? "text-lime-700" : "text-zinc-900"
            }`}
          >
            {tile.value.toLocaleString("en-US")}
          </p>
        </div>
      ))}
    </section>
  );
}
