# Phase 00 — read-only audit (13 November 2026)

Blueprint: *RCAAS Studio 90% Product Completion Blueprint* v1.0. This audit made **no code changes**. The checks below were run on this PC. Logs are in the session scratchpad and are not kept in the repo.

## 1. Repository state

| Item | Finding |
|---|---|
| Branch | `polish-2026-11-03` at `4c6eea5` |
| vs `origin/main` (`7564fb0`, the blueprint's baseline) | **4 commits ahead, 0 behind** (`7ffdd4b`, `a8a8b92`, `96acbe9`, `4c6eea5`) |
| Uncommitted | 35 modified files (+570 / −281), ~20 untracked (`deploy/`, `PRE_VPS_AUDIT.md`, `CONTENT_TODO.md`, `server/src/writeQueue.js`, `server/src/draftRevision.js`, `src/features/marketing/routeMatch.ts`, hotspot gizmo files, 8 test files) |
| Remotes | `origin` = RCAAS-studio/RCAAS, `personal` = prabhatbhusal/Three-D-GS-platform (the GitHub Pages portfolio) |
| Runtime | Node 24.13.0, npm 11.21.1, Next ^16.3.5 (webpack pinned), React 19.2.7, three 0.164 |
| Working-tree risk | Most of the hardening since 3 Nov (write queues, draft revisions, upload ownership, Windows deploy kit) is **uncommitted**. A reset or checkout would lose it. Commit it on a branch before Phase 02. |

**Discrepancies with the blueprint:**
- `deploy/` **exists locally** (untracked). It targets Windows Server 2022 with **Caddy + WinSW**, not the IIS ARR the blueprint assumes. Caddy already does `/api/*` → 4000 and the rest → 3000 on one host. Choosing between them is a Phase 14 decision. Phase 01 is written to work behind either, as long as the proxy **preserves the Host header** (Caddy does by default; IIS ARR needs `preserveHostHeader=true`).
- `PRE_VPS_AUDIT.md` (5 Nov) exists locally. Its findings 3–6 and 10 are recorded as fixed. Findings 1, 2, 7, 8, 9, 11, 13, 14 and 16 are still open.
- The CI workflow `.github/workflows/nextjs.yml` is locally modified. It now also has a Postgres job and a Windows deployment-test job.

## 2. Baseline checks (run 13 Nov)

| Command | Result |
|---|---|
| `npx tsc --noEmit` | **pass** |
| `npm run lint` | **fail: 80 errors, 3,277 warnings.** All errors come from a stray Chrome profile in `qa-bug-hunt/frontend-scratch/` (local, not in git). Project code has the **6 known warnings** only. |
| `node --test test/*.test.mjs` (client) | **45 pass, 2 fail**: (a) `deployment.test.mjs` backup restore: `tar` resolves to Git Bash's GNU tar, which reads `C:\…` in `-C` as a remote host (environment-dependent, test-side); (b) `frontend-audit.test.mjs` expects a header named `If-None-Match`, but `request()` builds headers through `new Headers()`, which lowercases names. The header is sent correctly (names are case-insensitive), so this is test-side. |
| `npm test` | **fails at the client step**, so the server suite never ran in it (the script chains with `&&`) |
| `cd server && npm test` (disk + fake S3) | **172 pass, 0 fail, 2 skipped** |
| `npm run build` | not re-run in Phase 00 (passed on 5 Nov per `PRE_VPS_AUDIT.md`); run in Phase 01 |

## 3. Architecture map (verified in code)

```
Browser ──► [Caddy :443 per deploy/Caddyfile]
              ├─ /api/*  ─► Express :4000 (server/src/index.js, binds 127.0.0.1 in prod)
              │              routes/: auth, scenes(+gallery), studioAi, embed, leads, assets,
              │              properties, team, stats, concierge, reservations, sites, demoEngine
              │              stores: JSON in DATA_DIR (writeFileWhole + writeQueue, 1 process)
              │              accounts: file or Postgres (DATABASE_URL; off on this PC)
              │              assets: local disk or S3/R2 (ASSET_DRIVER)
              └─ rest    ─► Next 16 :3000 (no proxy.ts / middleware today)
                             (site)/[[...slug]]  marketing (client App + meta.ts)
                             /studio/**, /login  studio (client pages, cookie session via API)
                             /tour, /t/[p], /t/[p]/[s]   public tours (XGRIDS LCC singleton)
                             /s/[p], /s/[p]/[s], /s/[p]/review  client websites
                             /sitemap.xml /robots.txt /llms.txt /blog/rss.xml  route handlers
```

- **Sessions:** `splatspace_session`, a JWT HS256 cookie (12 h), httpOnly, SameSite=Lax, Secure in production, **host-only** (no `Domain`) (`server/src/middleware/auth.js:38`). Revoked by password change (`staleReason`). Roles are read fresh for admin actions.
- **CSRF:** cookies are SameSite=Lax, and non-GET requests with a disallowed `Origin` get a 403 (`index.js:58`). Only **one** `CLIENT_ORIGIN` is allowed, plus localhost in development.
- **API origin:** `NEXT_PUBLIC_API_URL` is used for every browser fetch, server-side fetch, `<img>`, next/image and OG image (`src/lib/api.ts:14`). It defaults to `localhost:4000`. There is no separate internal origin for server-side fetches.
- **Absolute URLs:** `SITE_URL` (`src/lib/shareMeta.ts:7`) for canonical, sitemap and robots. In the browser: `location.origin` + path (Publish panel, QR codes, review link, invites). On the server: `CLIENT_ORIGIN` + path (reset mail, booking mails, embed own-site).
- **Embeds:** an HMAC key per space plus an optional allowed-sites list, checked against `ancestorOrigins`/referrer (`routes/embed.js`). Our own site (`CLIENT_ORIGIN` host and its subdomains) is always allowed.
- **Asset reads:** public by asset id with byte ranges, no session (`routes/assets.js:521`). Ids are random (`ast_<12 hex>`).

## 4. Current vs target domain matrix

| Target | Today | Gap |
|---|---|---|
| `rcaas.tech` marketing | `/` catch-all on the single host | none for paths. Needs `www` → apex redirect |
| `studio.rcaas.tech` | `/studio/**`, `/login` on the same host | **MISSING**: no host routing; cookie and API origin assume one host |
| `tours.rcaas.tech/{project}[/{space}]` | `/t/{project}[/{space}]`, `/tour?space=` | **MISSING**: rewrite, redirect and link builders |
| `{slug}.sites.rcaas.tech` | `/s/{slug}[/{space}]` | **MISSING**: rewrite, tenant scoping per host, links and canonicals |
| same-origin `/api` per host | Caddy proxies `/api` on its one host | **PARTIAL**: Express refuses writes from any origin except `CLIENT_ORIGIN` |
| unknown host | Caddy serves only its site blocks | **PARTIAL**: nothing in the app rejects one |

## 5. Feature inventory

Status: **E** existing · **P** partial · **M** missing · **U** unsupported/needs SDK proof · **D** deferred by owner decision · **?** not inspected.

Evidence: file references were checked in this session. "(§4)" means the item is taken from `CLAUDE.md` §4 (the recorded checks there) and was not re-run here.

**A. Domains & publishing**
A01 P0 **M** no host registry · A02 P0 **M** · A03 P0 **P** builders are scattered (`location.origin`, `CLIENT_ORIGIN`, `SITE_URL`) · A04 P0 **M** (only `/how-it-works`, `/gaussian-splatting` redirects) · A05 P0 **P** CSP, HSTS and frame rules exist for one host (`next.config.mts`) · A06 P0 **E** draft/published snapshots, visitors read only snapshots (§4, rule 3) · A07 P0 **E** ready checklist, dead-portal and missing-file warnings, version history and revert (§4) · A08 P1 **P** scheduled site publish exists; no approval gate for tours · A09 P1 **P** QR codes and campaign links exist; no expiry · A10 P1 **P** embed key and allowed sites; no password or invite-only tours · A11 P1 **M** · A12 P2 **M**

**B. Identity & tenancy**
B01 P0 **E** guards in `server/src/access.js` (`sceneGuard`, `assetGuard`, `mayWorkOn*`); 2026-10-27 pentest (§4) · B02 P0 **P** admin/editor/staff + owner/member; no reviewer or viewer role · B03 P0 **P** session revocation on password change, reset links, Origin check; no per-session revoke list · B04 P0 **E** invites with expiry (TeamDialog, §4) · B05 P0 **P** drafts guarded; **asset files readable by id without a session** · B06 P0 **E** `server/src/rateLimit.js` (§4) · B07 **M** · B08 P1 **M** (no MFA code found) · B09 **P** staff accounts (bookings only) · B10 **M** · B11 **D**

**C. Lifecycle**
C01 P0 **E** create/rename/archive/delete (§4) · C02 P0 **P** atomic writes and backup scripts tested on disposable data; **no off-server copy or real restore drill** · C03 P0 **P** `assets:unused` lists orphans; no checksums recorded · C04 P0 **E** chunked upload with ownership checks (PRE_VPS fix 6) · C05 **M** · C06 **E** resumable chunks (`test/frontend-audit`) · C07 **P** · C08 **P** thumbnails client-side · C09 **M** · C10 **M** · C11 **P** browser-side model conversion in a worker · C12 **U**

**D. Studio**
D01 P0 **E** save, preview, publish, undo/redo, draft-revision conflicts (`api.ts`, `draftRevision.js`) · D02 P0 **P** desktop-first; phone preview exists · D03 **P** tree, no search or multi-select · D04 **M** · D05 **P** tracks without a timeline · D06 **E** · D07 **P** 409 on a stale save; no merge UI · D08 **E** "?" shortcut sheet · D09 **P** phone preview only · D10–D12 **M**

**E. Viewer**
E01 P0 **E** tier auto-downgrade, no-WebGL2 enquiry path (rule 4) · E02 P0 **P** manual checks only, no automated navigation tests · E03 P0 **E** · E04 **P** no measured budget (Next up #3) · E05 **P** captions and reduced motion; no transcripts · E06 **E** floor map · E07 **P** tracks, `?space=`; no viewpoint deep link · E08 **E** · E09 **E** EN/NE/ZH · E10 **P** · E11 **M** · E12 **U** measure exists (scale correctable); VR not offered

**F. Client websites**
F01 P0 **E** draft/preview/publish/review link · F02 P0 **P** canonicals are path-only on the main host · F03 **E** 5 looks, venue templates · F04 **E** · F05 **P** · F06 **P** scheduled publish, no device preview · F07 **M** · F08 **P** · F09 **M** · F10–F12 **M**

**G. Bookings & leads**
G01 P0 **P** zod checks, honeypot, rate limits; no explicit consent capture · G02 P0 **E** Kathmandu venue day, 409 on clashes, write queues (single process) · G03 P0 **E** · G04 P0 **P** Resend refusals stored on the lead; **no retry queue**; domain not verified (test mode) · G05 **M** · G06 **M** · G07 **P** · G08 **P** · G09 **P** · G10 **P** conversion pixel and demo engine · G11 **P** CSV · G12 **D**

**H. Analytics**
H01 P0 **P** no cookies or IPs stored (policy pages); no consent banner (none needed today) · H02 P0 **E** · H03 **E** visits, time, sources · H04 **E** · H05 **P** · H06 **P** printable · H07 **M** · H08 **M** · H09–H11 **M**

**I. Collaboration**
I01 P0 **P** activity log; no rights review · I02 **E** project home · I03 **P** review key, no expiry · I04 **P** website comments only · I05 **P** · I06 **M** · I07 **M** · I08 **P** sample project seed · I09 **P** · I10–I11 **M**

**J. Business admin**
J01 P0 **M** no named owner or escalation path · J02 P0 **P** hosting expiry stated in the FAQ (14 + 30 days); not enforced in code · J03 **M** · J04–J10 **M**

**K. AI**
K01 P0 **P** off without a key; concierge capped (§4); no spend meter · K02 **E** published info only · K03 **E** suggestions and translations are added only when the author saves · K04 **M** · K05 **M** · K06–K10 **M/U**

**L. Verticals**: L01–L03 **P** (heritage pages and content, no permission model) · L04–L10 **M/U**

**M. Security**
M01 P0 **M** no ASVS checklist · M02 P0 **P** `server/test/security-regressions.test.js`, pentest 2026-10-27 · M03 P0 **P** startup refuses weak secrets; this PC's are example or short values · M04 P0 **E** · M05 P0 **P** CSP and HSTS; trust proxy is loopback only · M06 P0 **P** activity logs hold names and emails · M07 P0 **M** policies are drafts awaiting a lawyer (§4) · M08 **M** · M09 **P** `npm audit`, manual · M10 **M** · M11 **M** · M12 **M**

**N. Reliability**
N01 P0 **P** `/api/health` only; console logs, no alerts · N02 P0 **P** see C02 · N03 P0 **P** account SQL migrations; `migrate.js` on read for scenes · N04 P0 **P** CI runs lint, types, tests and build on Ubuntu; **local lint and tests are red today** (section 2) · N05 P0 **M** no e2e runner (no Playwright, Cypress or Puppeteer dependency) · N06 P0 **P** release switch and rollback documented in `deploy/README.md` §9; not rehearsed · N07–N12 **M**/P

**O. APIs**
O01 P0 **P** input checks in each route; no shared schema layer · O02 P0 **P** conversion pixel is HMAC-keyed; no inbound webhooks · O03–O10 **M**

**P. Hosting**
P01 P0 **P** Caddy config for one host (not IIS) · P02 P0 **P** WinSW XMLs, not installed · P03 P0 **P** API on 127.0.0.1; firewall steps documented only · P04 P0 **P** NTFS permission steps documented · P05 P0 **M** · P06 P0 **P** documented · P07–P11 **M**

## 6. P0 risks: vulnerabilities and data loss

1. **Host routing does not exist.** Introducing subdomains without it would put the studio cookie, CSRF origin checks and canonicals out of step: every studio write from `studio.rcaas.tech` would get a 403 from the Origin check. → Phase 01.
2. **Uncommitted hardening** (writeQueue, draftRevision, upload ownership, reset-token serialisation): one wrong git command away from loss. → commit on a branch (owner action).
3. **No off-server backup or restore drill** (hard stop). `Backup.ps1` is tested only against disposable folders.
4. **Production secrets are example values on this PC** (PRE_VPS #1): a hard stop until set on the server.
5. **Five projects point at owner accounts that no longer exist** (PRE_VPS #7): they can't be reached through accounts.
6. **Single-process locks**: `writeQueue` coordinates one API process only. Run exactly one API instance.
7. **Asset files are public by id**, drafts included. The ids are 48 random bits, so this is P1, not P0, but a published-snapshot-only rule doesn't cover files.
8. **Email delivery unverified** (Resend test mode): booking and reset mails don't reach clients yet.
9. **Legal**: privacy and terms are drafts; consent and publishing permissions are undecided (hard stop).

## 7. Journey coverage (J01–J12)

| J | Status | Evidence / gap |
|---|---|---|
| J01 create project, roles, upload | P | API tests; no e2e |
| J02 author, preview, publish, roll back | E | API tests + §4 manual checks |
| J03 mobile visitor tour + enquiry | P | manual only; no device test recorded |
| J04 branded site on subdomain | **M** | no subdomains |
| J05 booking without double-booking | E (1 process) | API tests |
| J06 tenant isolation | E | API tests, pentest 2026-10-27 |
| J07 revocation, invites, reset | E | `session.test.js`, API tests |
| J08 interrupted upload | E | `frontend-audit.test.mjs`, server tests |
| J09 deploy rollback | P | documented, not rehearsed |
| J10 restore to test environment | P | disposable restore test only |
| J11 DNS, HTTPS, host routing, consent | **M** | |
| J12 renewal or closure process | **M** | |

## 8. Proposed PR order

1. **Phase 01a**: host registry, `src/proxy.ts`, URL builders, same-origin API for the browser plus an internal API origin for server fetches, Express same-origin write rule, server link builders, tests. Restore the green local baseline (lint ignores, the 2 test-side failures).
2. Phase 01b: deploy templates and check-config for the multi-host variables; Caddy multi-host example (needs a wildcard-certificate decision: Cloudflare DNS-01).
3. Phase 03 before 02: off-server backup and restore drill (it clears a hard stop sooner than the RBAC work).
4. Phase 02: reviewer/viewer roles, MFA for admins, asset read scoping.
5. Phase 13: an e2e runner (adding a dependency needs the owner's approval), then journeys J01–J08.
6. Phases 08/12/14 as the blueprint lists them.

## 9. Resource and cost estimate (2 vCPU / 4 GB Windows)

Not measured; these are estimates to check in Phase 14. Next (`next start`) ~250–400 MB RSS, Express ~100–200 MB, Caddy ~30 MB, Windows Server ~1.5–2 GB. That leaves roughly 1 GB of headroom. Image optimisation (sharp) and the floor-plan generator are the CPU spikes. Scans must go on R2, because the 50 GB disk holds only ~5–10 typical LCC scans. R2 storage cost is per GB-month with no egress charge. Real numbers depend on scan sizes, which aren't measured here.

## 10. Baseline readiness score

| Category (weight) | Score | Why |
|---|---|---|
| Journeys (25) | 11 | 6 of 12 existing, none automated end-to-end; J04, J11, J12 missing |
| Security / tenancy (20) | 13 | guards, rate limits, CSP, pentest; no MFA; public asset reads; example secrets |
| Data / recovery (15) | 6 | atomic writes and queues; no off-server backup or restore drill; one process |
| Reliability / perf (15) | 4 | health route only; no monitoring, alerts, budgets or e2e |
| Publishing / domains / SEO (10) | 4 | strong single-host SEO; no subdomains or TLS live |
| Usability / a11y (10) | 6 | contrast measured, Esc, focus rings; no WCAG audit |
| Operations (5) | 1.5 | runbook drafted; no owner, support or renewal process |
| **Total** | **≈ 45.5 / 100** | **Not release-ready.** Open hard stops: unverified off-server restore, no live HTTPS, legal drafts, no rehearsed rollback or incident owner, example secrets. |
