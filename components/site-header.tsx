import Link from "next/link";
import { Terminal } from "lucide-react";

import { PoweredByBadge } from "@/components/powered-by-badge";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-zinc-900 text-lime-400">
              <Terminal className="h-4 w-4" />
            </span>
            <span className="text-lg font-bold tracking-tight text-zinc-900">
              {SITE_NAME}
            </span>
          </Link>
          <p className="mt-1 text-sm text-zinc-500">{SITE_TAGLINE}</p>
        </div>
        <PoweredByBadge />
      </div>
    </header>
  );
}
