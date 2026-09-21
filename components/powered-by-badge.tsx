import { POWERED_BY_URL } from "@/lib/constants";

export function PoweredByBadge({ className }: { className?: string }) {
  return (
    <a
      href={POWERED_BY_URL}
      target="_blank"
      rel="noreferrer"
      className={[
        "inline-flex items-center gap-2 rounded border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-900",
        className ?? "",
      ].join(" ")}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-lime-500" aria-hidden="true" />
      Powered by ipgeolocation.io
    </a>
  );
}
