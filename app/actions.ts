"use server";

import { enrichIps } from "@/lib/enrich";
import { MAX_INPUT_CHARS, MAX_UNIQUE_IPS } from "@/lib/constants";
import { extractIps } from "@/lib/log-parse";
import { initialEnrichState, type EnrichState } from "@/lib/enrich-state";

export async function enrichLogAction(
  _previous: EnrichState,
  formData: FormData,
): Promise<EnrichState> {
  const raw = String(formData.get("log") ?? "");

  if (raw.trim() === "") {
    return {
      ...initialEnrichState,
      status: "error",
      message: "Paste some log output first.",
    };
  }

  if (raw.length > MAX_INPUT_CHARS) {
    return {
      ...initialEnrichState,
      status: "error",
      message: `That input is ${raw.length.toLocaleString("en-US")} characters. Paste at most ${MAX_INPUT_CHARS.toLocaleString("en-US")}.`,
      input: raw.slice(0, MAX_INPUT_CHARS),
    };
  }

  const extraction = extractIps(raw, MAX_UNIQUE_IPS);

  if (extraction.ips.length === 0) {
    return {
      ...initialEnrichState,
      status: "error",
      message: "No IP addresses were found in that text.",
      input: raw,
    };
  }

  const { rows, lookedUp, error } = await enrichIps(extraction.ips);

  return {
    status: "done",
    message: error,
    rows,
    stats: {
      lineCount: extraction.lineCount,
      totalMatches: extraction.totalMatches,
      uniqueCount: extraction.ips.length,
      publicCount: extraction.publicCount,
      privateCount: extraction.privateCount,
      lookedUp,
      truncated: extraction.truncated,
    },
    input: raw,
  };
}
