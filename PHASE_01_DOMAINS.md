# Phase 01 — separate hosts, link safety, old links (13 November 2026)

Scope: a central host map, host routing, link builders, same-origin API calls, and the API's origin rule and emailed links. **Off by default:** with the three new settings empty, every request and every link behaves exactly as before.

## Settings

| Where | Name | Example (production) |
|---|---|---|
| site (build time) | `NEXT_PUBLIC_SITE_URL` | `https://rcaas.tech` (already existed) |
| site (build time) | `NEXT_PUBLIC_STUDIO_URL` | `https://studio.rcaas.tech` |
| site (build time) | `NEXT_PUBLIC_TOURS_URL` | `https://tours.rcaas.tech` |
| site (build time) | `NEXT_PUBLIC_SITES_DOMAIN` | `sites.rcaas.tech` |
| site (runtime) | `API_INTERNAL_URL` | `http://127.0.0.1:4000` (server-side fetches skip the public name) |
| site (runtime) | `LEGACY_REDIRECT_STATUS` | empty = 307; `308` once old links are checked |
| API | `STUDIO_URL`, `TOURS_URL`, `SITES_DOMAIN` | the same three values |
| API | `CLIENT_ORIGIN` | `https://rcaas.tech` (unchanged) |

All three host settings must be set together (`MULTI_HOST`). The `NEXT_PUBLIC_*` values are inlined at build time, so changing them needs a rebuild.

## Route matrix (`src/lib/hosts.ts routeFor`, tested in `test/hosts.test.mjs`)

| Host | Path | Result |
|---|---|---|
| rcaas.tech | marketing pages | served |
| rcaas.tech | `/studio/**`, `/login` | → studio host, same path and query |
| rcaas.tech | `/tour?…` | → tours host `/tour?…` (embed snippets already pasted on hotel sites keep working) |
| rcaas.tech | `/t/{p}[/{s}]` | → tours host `/{p}[/{s}]` |
| rcaas.tech | `/s/{p}[/rest]` | → `{p}.sites` host `/{rest}` (an id that isn't a DNS label stays served here) |
| www.rcaas.tech | anything | → straight to the final host (never via rcaas.tech) |
| studio | `/` | → `/studio` |
| studio | `/studio/**`, `/login`, `/tour` | served (`/tour`: the studio's previews frame it) |
| studio | anything else | → the host that owns it |
| tours | `/` | → rcaas.tech `/gallery` |
| tours | `/{p}`, `/{p}/{s}` | served by `/t/{p}[/{s}]` (rewrite) |
| tours | `/tour`, `/t/**` | served |
| tours | deeper paths, invalid ids | 404 |
| {p}.sites | `/` , `/{space}`, `/review` | served by `/s/{p}…` (rewrite) |
| {p}.sites | `/tour` | served (the website frames its tour on its own host: postMessage stays same-origin) |
| {p}.sites | `/s/{p}/**` | served (in-page links still use these paths; the canonical is the clean URL) |
| {p}.sites | `/s/{other}/**` | **404**: no project is reachable from another project's host |
| unknown host | anything | 404 (plain text) |

Next's own files, `/api/*` and any path with a dot (pictures, `robots.txt`, `sitemap.xml`) are skipped by the proxy and are the same on every host. Every host's `robots.txt` names the main site's sitemap, which lists the website and tour URLs on their own hosts (a sitemap may list other hosts that point their robots.txt at it).

**Every redirect lands on a path its target serves:** one move, never a loop. The test follows each redirect from 5 hosts × 16 paths and checks this.

## What else changed

- **The browser calls `/api` on its own host** when hosts are split (`src/lib/api.ts FETCH_BASE`). The studio's session cookie is then set on the studio's host only. Tours and websites never receive it, and the cookie never gets a `Domain=.rcaas.tech`. Server components fetch through `API_INTERNAL_URL` (`SERVER_API_URL`). Pictures, scan files and link previews keep the absolute `NEXT_PUBLIC_API_URL`.
- **The API's origin rule** (`server/src/publicUrls.js originAllowed`): it allows the main site, our studio, tours and `*.sites` hosts (https only, valid labels), and same-host requests (`req.hostname`, from Host or a loopback proxy's `X-Forwarded-Host`). Before, a studio on its own host would have been refused every write (403), and the tours host couldn't read scan files (CORS).
- **Links:** embed snippet and share link → tours host; the website QR code, review link and "Open site" → the website's host; canonicals for `/s/` and `/t/` pages and the sitemap → their own hosts; password-reset mail → studio; booking mails → website and tours hosts.
- **Unchanged on purpose:**
  - The website's in-page links still use `/s/{p}/…`. They're served on its own host, so a clean-URL rewrite of them is left to Phase 07.
  - Plain links to `/login`, `/s/`, `/t/` and `/tour` elsewhere rely on the one redirect.
  - Embed own-site matching already covers subdomains of `CLIENT_ORIGIN`.

## Staging on one PC (no DNS)

`*.localhost` resolves to this machine in Chrome. From a terminal, send the Host header: `curl -H "Host: studio.rcaas.localhost:3300" http://127.0.0.1:3300/`. A build with the hosts set (`NEXT_DIST_DIR=.next-preview`, the four `NEXT_PUBLIC_*` values on `http://*.rcaas.localhost:3300`, `API_INTERNAL_URL` to a second API on a scratch copy of the data) was checked this way. The results are in the session report. A browser on these hosts also needs a proxy that sends `/api/*` to the API on each host, as Caddy will; `next start` alone doesn't.

## Production proxy requirements (Phase 14)

- Pass the original **Host** through. Caddy does by default; IIS ARR needs `preserveHostHeader=true`.
- Send `/api/*` to the API on **every** host.
- Certificates: `rcaas.tech`, `www`, `studio` and `tours` are ordinary certificates. `*.sites.rcaas.tech` needs a **wildcard certificate (DNS-01)**, e.g. Caddy built with the Cloudflare DNS module, or Cloudflare's own edge certificate. Decide this before any DNS change.
- Never route an unconfigured hostname to the app. The app returns 404 for it anyway.

## Rollback

- **Config only:** empty the three `NEXT_PUBLIC_*` host settings (and the API's `STUDIO_URL`/`TOURS_URL`/`SITES_DOMAIN`), rebuild and restart. Everything is back on one host, and old links never stopped working.
- **Code:** delete `src/proxy.ts`. With the settings empty it already does nothing.
- Keep redirects at 307 until each old link type (QR codes, embeds, emails, `/s/`, `/t/`) has been tried on the new hosts. A 308 is cached by browsers and can't be withdrawn.

## Known limits

- A project or space id equal to `t`, `s`, `tour`, `studio`, `login` or `review` collides with a fixed path on the tours or website host. This was already true for `review` under `/s/{p}/`.
- Same-host requests are matched by host name only, not port.
- Static files are served on any Host (the proxy skips them). Caddy only answers configured hosts.
- On rcaas.tech the header always shows "Sign in", because the session cookie lives on the studio host. This is intended.
