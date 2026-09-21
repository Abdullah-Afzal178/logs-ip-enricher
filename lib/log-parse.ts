/**
 * Pulls IP addresses out of arbitrary log text. No dependencies and no API
 * calls, so it runs the same on the server and in tests.
 */

export type ExtractedIp = {
  ip: string;
  /** How many times the address appears in the pasted text. */
  hits: number;
  /** Order of first appearance, used for stable display. */
  firstSeen: number;
  version: 4 | 6;
  /** Private, loopback, link-local, CGNAT, documentation, multicast… */
  scope: string | null;
};

export type ExtractionResult = {
  ips: ExtractedIp[];
  /** Unique public addresses (candidates for enrichment). */
  publicCount: number;
  /** Unique private/reserved addresses (never sent to the API). */
  privateCount: number;
  totalMatches: number;
  lineCount: number;
  /** True when uniques were capped by `limit`. */
  truncated: boolean;
};

// Bare IPv4 not preceded/followed by another digit or dot, so "1.2.3.4.5"
// and version strings like "10.0.0.1.2" do not produce partial matches.
const IPV4_PATTERN = /(?<![\w.])(?:\d{1,3}\.){3}\d{1,3}(?![\w.])/g;

// Broad IPv6 candidate; every hit is then strictly validated, which rejects
// look-alikes such as the "10:14:52" inside a timestamp.
const IPV6_PATTERN =
  /(?<![0-9A-Fa-f:.])(?:[0-9A-Fa-f]{0,4}:){2,7}(?:[0-9A-Fa-f]{0,4}|\d{1,3}(?:\.\d{1,3}){3})(?![0-9A-Fa-f:.])/g;

export function extractIps(text: string, limit = 250): ExtractionResult {
  const lineCount = text.trim() === "" ? 0 : text.split(/\r?\n/).length;
  const order = new Map<string, ExtractedIp>();
  let totalMatches = 0;
  let truncated = false;

  const record = (raw: string, version: 4 | 6) => {
    const ip = version === 4 ? raw : normalizeIpv6(raw);

    if (!ip) {
      return;
    }

    totalMatches += 1;
    const existing = order.get(ip);

    if (existing) {
      existing.hits += 1;
      return;
    }

    if (order.size >= limit) {
      truncated = true;
      return;
    }

    order.set(ip, {
      ip,
      hits: 1,
      firstSeen: order.size,
      version,
      scope: classifyScope(ip, version),
    });
  };

  // IPv6 first, masking each hit, so an embedded IPv4 tail such as the
  // "192.168.1.1" in "::ffff:192.168.1.1" is not counted a second time.
  const characters = [...text];

  for (const match of text.matchAll(IPV6_PATTERN)) {
    if (!isValidIpv6(match[0]) || match.index === undefined) {
      continue;
    }

    record(match[0], 6);

    for (let offset = 0; offset < match[0].length; offset += 1) {
      characters[match.index + offset] = " ";
    }
  }

  for (const match of characters.join("").matchAll(IPV4_PATTERN)) {
    if (isValidIpv4(match[0])) {
      record(match[0], 4);
    }
  }

  const ips = [...order.values()].sort(
    (a, b) => b.hits - a.hits || a.firstSeen - b.firstSeen,
  );

  return {
    ips,
    publicCount: ips.filter((entry) => entry.scope === null).length,
    privateCount: ips.filter((entry) => entry.scope !== null).length,
    totalMatches,
    lineCount,
    truncated,
  };
}

export function isValidIpv4(value: string): boolean {
  const octets = value.split(".");

  if (octets.length !== 4) {
    return false;
  }

  return octets.every((octet) => {
    if (!/^\d{1,3}$/.test(octet)) {
      return false;
    }

    // Reject "01" style octets, which are not valid dotted-quad notation.
    if (octet.length > 1 && octet.startsWith("0")) {
      return false;
    }

    return Number(octet) <= 255;
  });
}

export function isValidIpv6(value: string): boolean {
  return expandIpv6(value) !== null;
}

/** Lower-cased, fully expanded 8-group form — the canonical dedupe key. */
function normalizeIpv6(value: string): string | null {
  const groups = expandIpv6(value);
  return groups ? compressIpv6(groups) : null;
}

function expandIpv6(value: string): number[] | null {
  let text = value.trim();

  if (text === "" || !text.includes(":")) {
    return null;
  }

  // An IPv4 tail (::ffff:1.2.3.4) becomes two 16-bit groups.
  const tail = text.match(/(\d{1,3}(?:\.\d{1,3}){3})$/);

  if (tail) {
    if (!isValidIpv4(tail[1])) {
      return null;
    }

    const octets = tail[1].split(".").map(Number);
    const high = (octets[0] << 8) | octets[1];
    const low = (octets[2] << 8) | octets[3];
    text =
      text.slice(0, tail.index) +
      high.toString(16) +
      ":" +
      low.toString(16);
  }

  const doubleColons = text.match(/::/g)?.length ?? 0;

  if (doubleColons > 1) {
    return null;
  }

  let head: string[];
  let rest: string[];

  if (doubleColons === 1) {
    const [left, right] = text.split("::");
    head = left === "" ? [] : left.split(":");
    rest = right === "" ? [] : right.split(":");
  } else {
    head = text.split(":");
    rest = [];
  }

  const parts = [...head, ...rest];

  if (parts.some((part) => !/^[0-9A-Fa-f]{1,4}$/.test(part))) {
    return null;
  }

  if (doubleColons === 1) {
    // "::" must stand in for at least one omitted group.
    if (parts.length > 7) {
      return null;
    }
  } else if (parts.length !== 8) {
    return null;
  }

  const fill = 8 - parts.length;
  const full = [
    ...head.map((part) => Number.parseInt(part, 16)),
    ...Array.from({ length: fill }, () => 0),
    ...rest.map((part) => Number.parseInt(part, 16)),
  ];

  return full.length === 8 ? full : null;
}

/** RFC 5952: lowercase, longest run of zero groups collapsed to "::". */
function compressIpv6(groups: number[]): string {
  const hextets = groups.map((group) => group.toString(16));

  let bestStart = -1;
  let bestLength = 0;
  let runStart = -1;
  let runLength = 0;

  hextets.forEach((hextet, index) => {
    if (hextet === "0") {
      if (runStart === -1) {
        runStart = index;
        runLength = 0;
      }
      runLength += 1;

      if (runLength > bestLength) {
        bestStart = runStart;
        bestLength = runLength;
      }
    } else {
      runStart = -1;
      runLength = 0;
    }
  });

  if (bestLength < 2) {
    return hextets.join(":");
  }

  const head = hextets.slice(0, bestStart).join(":");
  const tail = hextets.slice(bestStart + bestLength).join(":");

  return `${head}::${tail}`;
}

const IPV4_SCOPES: Array<{ test: (octets: number[]) => boolean; label: string }> = [
  { test: (o) => o[0] === 10, label: "Private" },
  { test: (o) => o[0] === 172 && o[1] >= 16 && o[1] <= 31, label: "Private" },
  { test: (o) => o[0] === 192 && o[1] === 168, label: "Private" },
  { test: (o) => o[0] === 127, label: "Loopback" },
  { test: (o) => o[0] === 169 && o[1] === 254, label: "Link-local" },
  { test: (o) => o[0] === 100 && o[1] >= 64 && o[1] <= 127, label: "CGNAT" },
  { test: (o) => o[0] === 0, label: "Unspecified" },
  { test: (o) => o[0] === 192 && o[1] === 0 && o[2] === 2, label: "Documentation" },
  { test: (o) => o[0] === 198 && o[1] === 51 && o[2] === 100, label: "Documentation" },
  { test: (o) => o[0] === 203 && o[1] === 0 && o[2] === 113, label: "Documentation" },
  { test: (o) => o[0] >= 224 && o[0] <= 239, label: "Multicast" },
  { test: (o) => o[0] >= 240, label: "Reserved" },
];

/** Returns a label for non-routable addresses, or null when globally routable. */
export function classifyScope(ip: string, version: 4 | 6): string | null {
  if (version === 4) {
    const octets = ip.split(".").map(Number);
    return IPV4_SCOPES.find((scope) => scope.test(octets))?.label ?? null;
  }

  const groups = expandIpv6(ip);

  if (!groups) {
    return null;
  }

  const [first] = groups;

  if (groups.every((group) => group === 0)) {
    return "Unspecified";
  }

  if (groups.slice(0, 7).every((group) => group === 0) && groups[7] === 1) {
    return "Loopback";
  }

  if ((first & 0xfe00) === 0xfc00) {
    return "Unique local";
  }

  if ((first & 0xffc0) === 0xfe80) {
    return "Link-local";
  }

  if ((first & 0xff00) === 0xff00) {
    return "Multicast";
  }

  if (first === 0x2001 && groups[1] === 0x0db8) {
    return "Documentation";
  }

  return null;
}
