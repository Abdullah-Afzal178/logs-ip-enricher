import type { EnrichedRow } from "@/lib/enrich";

export function ResultsTable({ rows }: { rows: EnrichedRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] border-collapse text-left text-sm">
        <thead>
          <tr className="bg-zinc-900 text-[11px] uppercase tracking-wider text-zinc-300">
            <th scope="col" className="px-4 py-2 font-semibold">IP address</th>
            <th scope="col" className="px-3 py-2 text-right font-semibold">Hits</th>
            <th scope="col" className="px-3 py-2 font-semibold">Country</th>
            <th scope="col" className="px-3 py-2 font-semibold">City</th>
            <th scope="col" className="px-3 py-2 font-semibold">Organization</th>
            <th scope="col" className="px-3 py-2 font-semibold">ASN</th>
            <th scope="col" className="px-3 py-2 font-semibold">Type</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={row.ip}
              className={index % 2 === 1 ? "bg-zinc-50/70" : undefined}
            >
              <td className="px-4 py-2 font-mono text-[13px] font-medium text-zinc-900">
                <span className="break-all">{row.ip}</span>
                {row.scope ? (
                  <span className="ml-2 rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-600">
                    {row.scope}
                  </span>
                ) : null}
              </td>
              <td className="tabular px-3 py-2 text-right font-mono text-[13px] text-zinc-700">
                {row.hits.toLocaleString("en-US")}
              </td>
              <td className="px-3 py-2 text-zinc-700">
                {row.countryName ? (
                  <span className="whitespace-nowrap">
                    {row.countryEmoji ? `${row.countryEmoji} ` : ""}
                    {row.countryName}
                  </span>
                ) : (
                  <Empty note={row.note} />
                )}
              </td>
              <td className="px-3 py-2 text-zinc-700">{row.city || <Dash />}</td>
              <td className="px-3 py-2 text-zinc-700">
                <span className="block max-w-[15rem] truncate" title={row.organization}>
                  {row.organization || <Dash />}
                </span>
              </td>
              <td className="px-3 py-2 font-mono text-[13px] text-zinc-600">
                {row.asNumber || <Dash />}
              </td>
              <td className="px-3 py-2">
                {row.companyType ? (
                  <span className="rounded bg-lime-100 px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-lime-800">
                    {row.companyType}
                  </span>
                ) : (
                  <Dash />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Dash() {
  return <span className="text-zinc-300">—</span>;
}

function Empty({ note }: { note: string | null }) {
  return <span className="text-xs text-zinc-400">{note ?? "—"}</span>;
}
