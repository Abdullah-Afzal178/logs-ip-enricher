# Log File IP Enricher

Paste raw server logs and get every IP address extracted, counted, and enriched with country, city, organisation, and ASN — then export the table as CSV. Powered by the [ipgeolocation.io bulk API](https://ipgeolocation.io/documentation/ip-location-api.html).

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-000?logo=nextdotjs)](https://nextjs.org/)
[![Powered by ipgeolocation.io](https://img.shields.io/badge/Powered%20by-ipgeolocation.io-1a73e8)](https://ipgeolocation.io)

<!-- Add a screenshot of the tool running locally at ./public/tool.png and reference it here -->

---

## What It Does

Drop in log output from anywhere — nginx, Apache, syslog, JSON lines, CSV, or plain text — and the tool:

1. **Finds every IP address**, IPv4 and IPv6, regardless of log format
2. **Counts and deduplicates** them, so the noisiest clients sort to the top
3. **Flags private and reserved ranges** locally — they are never sent to the API
4. **Enriches the public ones** with country, city, organisation, ASN, and network type in batched bulk calls
5. **Exports to CSV** for a spreadsheet or ticket

Turning this:

```
45.83.64.12 - - [07/Sep/2026:10:14:53 +0000] "POST /wp-login.php HTTP/1.1" 404 209
45.83.64.12 - - [07/Sep/2026:10:14:54 +0000] "POST /wp-login.php HTTP/1.1" 404 209
{"ts":"2026-09-07T10:15:04Z","client_ip":"24.48.0.1","upstream":"10.0.0.5:9000"}
```

into this:

| IP | Hits | Country | Organisation | ASN | Type |
|---|--:|---|---|---|---|
| 45.83.64.12 | 2 | 🇩🇪 Germany | Internet Security Research | AS208843 | HOSTING |
| 24.48.0.1 | 1 | 🇨🇦 Canada | Videotron Ltee | AS5769 | ISP |
| 10.0.0.5 `PRIVATE` | 1 | — | *not routable* | — | — |

---

## Parsing that holds up on real logs

The extractor is pure, dependency-free TypeScript in [`lib/log-parse.ts`](lib/log-parse.ts), covered by unit tests for the cases that break naive regex approaches:

- **Timestamps are not IPv6.** `10:14:52` and `[07/Sep/2026:10:14:52 +0000]` contain valid hex groups, so every candidate is strictly validated instead of pattern-matched.
- **Version strings are not IPv4.** `1.2.3.4.5` and `next@16.3.4` do not produce partial matches.
- **Ports and brackets are handled.** `203.0.113.9:8080` and `[2606:4700:4700::1111]:443` yield the address alone.
- **IPv6 is normalised.** `2606:4700:4700:0:0:0:0:1111` and `2606:4700:4700::1111` are the same address and count together.
- **Embedded IPv4 is not double counted.** `::ffff:192.168.1.1` is one address, not two.
- **Invalid octets rejected.** `256.1.1.1` and `010.1.1.1` are ignored.

---

## Why ipgeolocation.io

Enriching a log means hundreds of lookups, which is exactly what the bulk endpoint is for:

- **One request per 50 addresses** — `POST /v3/ipgeo-bulk` returns geo, ASN, and company data together, so a busy log costs a handful of calls rather than hundreds.
- **Narrowed `fields`** — only the columns the table shows are requested.
- **Free tier** — the bulk endpoint works on the free plan.

> ipgeolocation.io also offers dedicated APIs for [ASN](https://ipgeolocation.io/documentation/asn-api.html), [Security](https://ipgeolocation.io/documentation/ip-security-api.html) (VPN, proxy, Tor detection), [Timezone](https://ipgeolocation.io/documentation/timezone-api.html), [Astronomy](https://ipgeolocation.io/documentation/astronomy-api.html), [User-Agent parsing](https://ipgeolocation.io/documentation/user-agent-api.html), and [Abuse Contact](https://ipgeolocation.io/documentation/ip-abuse-contact-api.html) lookups.

**[Get your free API key →](https://ipgeolocation.io/signup)**

---

## Features

- **Format agnostic** — nginx, Apache, syslog, JSON, CSV, plain text
- **Hit counts** — the noisiest addresses sort first, which is usually what you are looking for
- **Private ranges detected locally** — no wasted API credits, and internal addresses never leave the server
- **Batched bulk enrichment** — 50 addresses per request
- **CSV export** — straight into a spreadsheet or an incident ticket
- **Sample log built in** — the tool is useful before you paste anything
- **Nothing stored** — logs are parsed in the request and discarded
- **Server-side API calls only** — your API key is never exposed to the browser
- **SEO-ready** — Open Graph tags, meta description, `robots.txt`, `sitemap.xml`, and favicon

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js](https://nextjs.org/) (App Router, Server Actions) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Language | TypeScript |
| Icons | [lucide-react](https://lucide.dev/) |
| Enrichment | [ipgeolocation.io](https://ipgeolocation.io) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- An [ipgeolocation.io](https://ipgeolocation.io/signup) API key (free tier is enough)

### Run It Locally

1. Clone the repo:

```bash
git clone https://github.com/Abdullah-Afzal178/logs-ip-enricher.git
cd logs-ip-enricher
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the project root:

```env
IPGEOLOCATION_API_KEY=your_api_key_here
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) and press **Load sample**.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `IPGEOLOCATION_API_KEY` | Yes | Your [ipgeolocation.io](https://ipgeolocation.io/signup) API key |
| `NEXT_PUBLIC_SITE_URL` | No | Your production URL if you choose to deploy (used for sitemap and OG metadata) |

---

## How It Works

1. You paste log text and submit. The form posts to a **Server Action**, so large inputs are not squeezed into a URL.
2. The server extracts every IP, deduplicates, counts occurrences, and classifies each address's scope — all locally, with no API call.
3. Public addresses are batched 50 at a time into `POST /v3/ipgeo-bulk` with a narrowed `fields` list. The API key stays server-side.
4. Results are merged back **by array index** — the bulk endpoint returns results positionally, a failed entry is `{ "message": … }` with no `ip` field, and IPv6 comes back expanded, so index is the only safe join key.
5. The table renders with hit counts, and CSV export is generated in the browser from the same rows.

### Limits

- **250 unique addresses** per run (`MAX_UNIQUE_IPS`); beyond that the run is flagged as truncated
- **400,000 characters** of input (`MAX_INPUT_CHARS`)

---

## Project Structure

```
logs-ip-enricher/
├── app/
│   ├── actions.ts        # Server Action: parse + enrich
│   ├── layout.tsx
│   ├── page.tsx
│   ├── opengraph-image.tsx
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── enricher.tsx      # Form, state, CSV export (client)
│   ├── results-table.tsx
│   ├── stat-strip.tsx
│   └── site-header.tsx
├── lib/
│   ├── log-parse.ts      # IP extraction and scope classification (no API, no deps)
│   ├── enrich.ts         # Batched bulk calls to ipgeolocation.io
│   ├── enrich-state.ts   # Action state shape
│   └── sample-log.ts
├── .env                  # API key (not committed)
└── README.md
```

---

## Want to Deploy It?

Works out of the box on any platform that supports Next.js:

- **Vercel** — import the repo, add `IPGEOLOCATION_API_KEY`, deploy.
- **Netlify**, **Cloudflare Pages**, **Railway** — similar process.
- **Self-hosted** — `npm run build && npm start`.

---

## License

MIT — see [LICENSE](LICENSE) for details.
