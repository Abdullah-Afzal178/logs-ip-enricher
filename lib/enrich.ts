import "server-only";

import type { ExtractedIp } from "@/lib/log-parse";

type JsonObject = Record<string, unknown>;

export type EnrichedRow = ExtractedIp & {
  countryName: string;
  countryEmoji: string;
  city: string;
  organization: string;
  asNumber: string;
  companyType: string;
  /** Set when this row could not be enriched (private, invalid, API error). */
  note: string | null;
};

export type EnrichResult = {
  rows: EnrichedRow[];
  /** Number of addresses actually sent to the API. */
  lookedUp: number;
  error: string | null;
};

const ENDPOINT = "https://api.ipgeolocation.io/v3/ipgeo-bulk";

const FIELDS = [
  "ip",
  "location.country_name",
  "location.country_emoji",
  "location.city",
  "asn",
  "company",
].join(",");

/** The API accepts large batches; this keeps individual requests modest. */
const BATCH_SIZE = 50;

export async function enrichIps(entries: ExtractedIp[]): Promise<EnrichResult> {
  const rows: EnrichedRow[] = entries.map((entry) => ({
    ...entry,
    countryName: "",
    countryEmoji: "",
    city: "",
    organization: "",
    asNumber: "",
    companyType: "",
    note: entry.scope ? `${entry.scope} — not routable` : null,
  }));

  const lookupIndexes = rows
    .map((row, index) => (row.scope === null ? index : -1))
    .filter((index) => index !== -1);

  if (lookupIndexes.length === 0) {
    return { rows, lookedUp: 0, error: null };
  }

  const apiKey = process.env.IPGEOLOCATION_API_KEY;

  if (!apiKey) {
    return {
      rows,
      lookedUp: 0,
      error: "Set IPGEOLOCATION_API_KEY in your .env file to enrich addresses.",
    };
  }

  let error: string | null = null;

  for (let offset = 0; offset < lookupIndexes.length; offset += BATCH_SIZE) {
    const batch = lookupIndexes.slice(offset, offset + BATCH_SIZE);
    const params = new URLSearchParams({ apiKey, fields: FIELDS });

    try {
      const response = await fetch(`${ENDPOINT}?${params.toString()}`, {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ ips: batch.map((index) => rows[index].ip) }),
      });

      if (!response.ok) {
        const body = (await safeReadJson(response)) as JsonObject | null;
        error =
          readString(body?.message) ??
          `The bulk lookup failed with status ${response.status}.`;

        for (const index of batch) {
          rows[index].note = "Lookup failed";
        }

        continue;
      }

      const payload = (await safeReadJson(response)) as unknown;

      if (!Array.isArray(payload)) {
        error = "The API returned an unexpected bulk response.";
        continue;
      }

      // Results are positional: a failed entry is {message} with no ip field,
      // and IPv6 comes back expanded, so index is the only safe join key.
      batch.forEach((rowIndex, batchIndex) => {
        const item = payload[batchIndex];
        const entry = asObject(item);

        if (!entry) {
          rows[rowIndex].note = "No data";
          return;
        }

        const message = readString(entry.message);

        if (message) {
          rows[rowIndex].note = message.replace(/^'[^']*'\s*/, "").trim() || "No data";
          return;
        }

        const location = asObject(entry.location);
        const asn = asObject(entry.asn);
        const company = asObject(entry.company);

        rows[rowIndex] = {
          ...rows[rowIndex],
          countryName: readString(location?.country_name) ?? "",
          countryEmoji: readString(location?.country_emoji) ?? "",
          city: readString(location?.city) ?? "",
          organization:
            readString(company?.name) ?? readString(asn?.organization) ?? "",
          asNumber: readString(asn?.as_number) ?? "",
          companyType: readString(company?.type) ?? readString(asn?.type) ?? "",
          note: null,
        };
      });
    } catch (caught) {
      error =
        caught instanceof Error
          ? caught.message
          : "The bulk lookup could not be completed.";

      for (const index of batch) {
        rows[index].note = "Lookup failed";
      }
    }
  }

  return { rows, lookedUp: lookupIndexes.length, error };
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

function asObject(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : null;
}

async function safeReadJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
