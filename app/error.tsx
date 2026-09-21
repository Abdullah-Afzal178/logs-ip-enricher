"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="w-full max-w-xl rounded-lg border border-zinc-200 bg-white p-8">
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Unexpected error
        </p>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900">
          The page could not be rendered.
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          Try the enrichment again. If the problem continues, verify the API key and the
          response from ipgeolocation.io.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 inline-flex items-center rounded bg-lime-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-lime-700"
        >
          Retry
        </button>
      </section>
    </main>
  );
}
