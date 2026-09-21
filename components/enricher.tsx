"use client";

import {
  AlertTriangle,
  Download,
  Eraser,
  FileText,
  Loader2,
  Play,
} from "lucide-react";
import { useActionState, useMemo, useRef, useState } from "react";

import { ResultsTable } from "@/components/results-table";
import { StatStrip } from "@/components/stat-strip";
import { enrichLogAction } from "@/app/actions";
import { initialEnrichState } from "@/lib/enrich-state";
import { SAMPLE_LOG } from "@/lib/sample-log";

export function Enricher() {
  const [state, formAction, pending] = useActionState(
    enrichLogAction,
    initialEnrichState,
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Uncontrolled textarea; this only forces a remount when we replace content.
  const [resetKey, setResetKey] = useState(0);

  const csv = useMemo(() => buildCsv(state.rows ?? []), [state.rows]);

  function loadSample() {
    if (textareaRef.current) {
      textareaRef.current.value = SAMPLE_LOG;
      textareaRef.current.focus();
    }
  }

  function clearInput() {
    if (textareaRef.current) {
      textareaRef.current.value = "";
      textareaRef.current.focus();
    }
    setResetKey((key) => key + 1);
  }

  function downloadCsv() {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "enriched-ips.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <form action={formAction} className="rounded-lg border border-zinc-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-zinc-400" />
            <span className="text-sm font-semibold text-zinc-700">Log input</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={loadSample}
              className="rounded border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50"
            >
              Load sample
            </button>
            <button
              type="button"
              onClick={clearInput}
              className="inline-flex items-center gap-1 rounded border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50"
            >
              <Eraser className="h-3 w-3" />
              Clear
            </button>
          </div>
        </div>

        <textarea
          key={resetKey}
          ref={textareaRef}
          name="log"
          rows={12}
          defaultValue={state.input}
          spellCheck={false}
          placeholder={"Paste nginx, Apache, syslog, JSON or any text containing IP addresses…\n\n203.0.113.42 - - [07/Sep/2026:10:14:52 +0000] \"GET / HTTP/1.1\" 200 1043"}
          className="block w-full resize-y bg-white px-4 py-3 font-mono text-[13px] leading-6 text-zinc-800 outline-none placeholder:text-zinc-300"
        />

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 bg-zinc-50 px-4 py-2.5">
          <p className="text-xs text-zinc-500">
            Logs are parsed on the server and never stored. Private ranges are
            detected locally and never sent to the API.
          </p>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded bg-lime-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-lime-700 disabled:opacity-60"
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {pending ? "Enriching…" : "Extract & enrich"}
          </button>
        </div>
      </form>

      {state.status === "error" && state.message ? (
        <p className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {state.message}
        </p>
      ) : null}

      {state.status === "done" && state.stats ? (
        <>
          <StatStrip stats={state.stats} />

          {state.message ? (
            <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {state.message}
            </p>
          ) : null}

          {state.stats.truncated ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Only the first {state.stats.uniqueCount.toLocaleString("en-US")} unique
              addresses were processed. Split the log into smaller chunks to cover the
              rest.
            </p>
          ) : null}

          <div className="rounded-lg border border-zinc-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 px-4 py-2.5">
              <span className="text-sm font-semibold text-zinc-700">
                {state.rows.length.toLocaleString("en-US")} unique addresses
              </span>
              <button
                type="button"
                onClick={downloadCsv}
                className="inline-flex items-center gap-1.5 rounded border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50"
              >
                <Download className="h-3 w-3" />
                Download CSV
              </button>
            </div>
            <ResultsTable rows={state.rows} />
          </div>
        </>
      ) : null}
    </div>
  );
}

function buildCsv(rows: Array<Record<string, unknown>>) {
  const header = [
    "ip",
    "hits",
    "version",
    "scope",
    "country",
    "city",
    "organization",
    "asn",
    "type",
    "note",
  ];

  const lines = rows.map((row) =>
    [
      row.ip,
      row.hits,
      `IPv${row.version}`,
      row.scope ?? "",
      row.countryName ?? "",
      row.city ?? "",
      row.organization ?? "",
      row.asNumber ?? "",
      row.companyType ?? "",
      row.note ?? "",
    ]
      .map((cell) => {
        const value = String(cell ?? "");
        return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
      })
      .join(","),
  );

  return [header.join(","), ...lines].join("\n");
}
