export const SESSION_COOKIE_NAME = "ipgeo_session_id";
export const SITE_NAME = "Log IP Enricher";
export const PAGE_TITLE = "Log File IP Enricher — Enrich Server Log IPs with Geo & ASN";
export const PAGE_DESCRIPTION =
  "Paste server logs and get every IP address extracted, counted, and enriched with country, city, ISP, and ASN. Exports to CSV. Powered by ipgeolocation.io.";
export const SITE_TAGLINE =
  "Paste raw logs. Get every IP extracted, counted, and enriched with country, ISP, and ASN.";
export const POWERED_BY_URL = "https://ipgeolocation.io";

/** Maximum unique addresses enriched in one run. */
export const MAX_UNIQUE_IPS = 250;

/** Guard against pasting an enormous file into the textarea. */
export const MAX_INPUT_CHARS = 400_000;
