import type { EnrichedRow } from "@/lib/enrich";

export type EnrichStats = {
  lineCount: number;
  totalMatches: number;
  uniqueCount: number;
  publicCount: number;
  privateCount: number;
  lookedUp: number;
  truncated: boolean;
};

export type EnrichState = {
  status: "idle" | "done" | "error";
  message: string | null;
  rows: EnrichedRow[];
  stats: EnrichStats | null;
  /** Echoed back so the textarea keeps its content after submit. */
  input: string;
};

export const initialEnrichState: EnrichState = {
  status: "idle",
  message: null,
  rows: [],
  stats: null,
  input: "",
};
