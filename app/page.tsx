import { Enricher } from "@/components/enricher";
import { SiteHeader } from "@/components/site-header";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <Enricher />

        <section className="mt-10 grid gap-6 border-t border-zinc-200 pt-8 sm:grid-cols-3">
          <div>
            <h2 className="text-sm font-bold text-zinc-900">Any log format</h2>
            <p className="mt-1.5 text-sm leading-6 text-zinc-500">
              nginx, Apache, syslog, JSON lines, CSV or plain text. Addresses are found
              by pattern, so the format does not matter. Ports and brackets are handled,
              and timestamps are not mistaken for IPv6.
            </p>
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-900">Counted and deduplicated</h2>
            <p className="mt-1.5 text-sm leading-6 text-zinc-500">
              Every address is counted, so the noisiest clients sort to the top. IPv6 is
              normalised, so the compressed and expanded forms of the same address count
              together.
            </p>
          </div>
          <div>
            <h2 className="text-sm font-bold text-zinc-900">One bulk call</h2>
            <p className="mt-1.5 text-sm leading-6 text-zinc-500">
              Public addresses are enriched in batches through the ipgeolocation.io bulk
              endpoint. Private and reserved ranges are detected locally and never leave
              the server.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
