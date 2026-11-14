# Current implementation and next work

Review date: 14 November 2026. Current phase: **04, in progress**. Rechecked the attached 26-page PDF against the current checkout and earlier phase reports; this pass did not receive a separate Markdown companion. The attachment is a planning reference; its proposed features and approval prompts are not evidence of completion or authorization to deploy. The user requested actual file changes as well as a review. No 90% readiness score is claimed.

## What exists

| Blueprint phase | Current status and evidence | Remaining gate |
| --- | --- | --- |
| 00 Audit | Existing `PHASE_00_AUDIT.md`; refreshed tests and source review in this pass. | Older findings must be read with this update. |
| 01 Hosts and links | Central host map/proxy, same-origin browser API, link builders, negative host tests. | Public DNS, proxy configuration, wildcard TLS and staged link checks. |
| 02 Identity and isolation | PostgreSQL/file adapters, owner/member/staff guards, secure cookies, reset/invite flows, rate limits; production shared login disabled. Real PostgreSQL API checks passed. | Actual deployment/provider check; reviewer role, MFA and individual-device session revocation are not implemented. |
| 03 Data and recovery | Atomic writes, one-process queues, scene/site revision conflicts, transactional account import, Windows backup and restore verification. Actual account dump/restore and outage recovery passed locally. | Scheduled off-server restore and secrets/config recovery on the VPS. PostgreSQL holds accounts only. |
| 04 R2/assets | Existing private draft reads, project/session revocation, snapshot-scoped public reads, checksums and reference-safe whole-asset deletion were verified. Added declared upload sizes, bounded ZIP extraction with CRC checks, stricter LCC validation and cloud-copy retry coverage. See `PHASE_04_ASSETS.md`. | Live R2 and browser/GPU verification; persistent resume UI, processing queue, usage/quota accounting and a complete retention/purge policy. Legacy clients without manifests still cannot prove original file lengths. |
| 05 Studio/publishing | Existing authoring, undo, snapshots, ready checks and website preview. | Full authoring workflow browser/device evidence and additional planned UX. |
| 06 Viewer | Existing navigation, auto quality, hotspots, translations and reduced-motion paths. | Real GPU/mobile/4G timing and accessibility checks. |
| 07 Client websites | Existing templates, draft/publish, preview and host helpers. | Final client content, clean links and actual host/TLS checks. |
| 08 Bookings/leads | Server validation, clash checks, per-project queues and stored delivery results. | Verified sender/recipient delivery and durable notification retries. |
| 09 Analytics | Existing visitor/intent reports. | Validate definitions, privacy choices and real reporting journeys. |
| 10 Commercial lifecycle | Some project/review functionality exists. | Renewal, suspension, retention, billing and named operating responsibilities. |
| 11 AI/languages | Optional existing concierge/translation features and translated viewer. | Keys, budgets, grounded output checks; company pages are English. |
| 12 Security/accessibility/performance | Headers, guards, negative regressions and dependency checks exist. | Complete measured production/security/accessibility review. |
| 13 CI/release/monitoring | Existing lint/types/tests/build, PostgreSQL matrix and Windows deployment tests. | Passing hosted CI on the reviewed revision, browser workflows, alerts and rollback rehearsal. |
| 14 Windows staging | Current repository provides Caddy + WinSW tooling. IIS in the blueprint is a proposed alternative. | Pick and rehearse the actual proxy topology; no VPS deployment or DNS change was performed. |
| 15 Release signoff | Pending. | Clear the real deployment/recovery/content/device gates before scoring readiness. |

## Changes completed in this pass

The following company-site/database entries record the **13 November pass**. The **14 November phase-4 changes** are in `PHASE_04_ASSETS.md`; fresh validation is recorded below separately from historical results.

- Footer combines the supplied column/legal-bar reference with the original light RCAAS palette, signup and contact links. Empty signup now shows a required-email error.
- Company pages have a subtle blurred grid, with a localized mouse response that stops when idle. Touch and reduced-motion visitors get a static grid. It is confined to the company frontend.
- About team portraits transition from grayscale to colour on hover or keyboard focus. The generic image-reveal animation excludes them so it cannot override the filter.
- Audit Register now has 41 reviewed entries: 6 confirmed facts, 4 local implementations and 31 requiring input or verification. It shows current evidence, next actions and accurate statuses. Search/status/priority filters, empty results, native modal focus, Escape and focus restoration are included. Missing equipment, guides and legal decisions are listed. The unsupported 8.4 MB payload wording was removed from its entry, and the illustrative canvas demo is labelled honestly.
- PostgreSQL backup now supplies separate libpq connection parameters; a whole URL in `PGDATABASE` could make the dump connect to defaults. The configured database CA can no longer be silently discarded by conflicting URL SSL parameters. Regressions cover both issues.
- Both database hosting options and cutover/recovery steps are in `deploy/POSTGRESQL.md`.

## Current data status

Read-only inventory found 3 projects (`basera`, `chyasal-house`, `office-chyasal`), 6 scene/snapshot JSON files, 3 website files and 1 file account. None of the three projects points to a missing current account. The previously reported five orphaned projects and missing-model scenes were already removed in the current working tree before this pass; those removals were preserved. Historical audit findings do not describe today's inventory.

## What you need to manage

| Responsibility | Required action |
| --- | --- |
| Hosting and DNS | VPS access, production URLs, HTTPS, firewall, one API process, service restart/reboot and release rollback. |
| Accounts | Choose VPS or managed PostgreSQL, import preserving IDs, issue individual accounts, remove departing members and keep the signup code private. |
| Backups | Schedule daily snapshots, monitor success/off-machine copies, and rehearse restores. Include database, files, scans and separately protected configuration. |
| Storage | Transfer complete referenced scans; verify real chunk/range loads; track capacity, staging and R2 usage. Do not delete files still used by a published snapshot. |
| Enquiries/bookings | Review incoming queues, confirm availability, handle failed notifications and verify actual sender delivery. |
| Business content | Supply official socials/profile, case results, equipment, prices/turnaround and team permissions; review the remaining Audit Register actions. |
| Policies and contracts | Approve privacy, consent, publishing rights, hosting periods, retention and deletion responsibilities. |
| Maintenance | Review security updates, uptime/health, disk usage, provider invoices and domain/certificate renewal. |

## Next implementation slice

Continue Phase 04 using `PHASE_04_ASSETS.md`: verify real private R2 delivery and browser uploads, then add usage/catalog reporting, deliberate abandoned-upload cleanup and a persistent resume workflow. Draft privacy and whole-asset reference protection already exist; do not reimplement them. Keep staging/restore deployment gates open and do not advance to Phase 05 based on test totals alone.

## Validation

### 14 November phase-4 review

- Fresh `npm.cmd test`: 245 passed, 0 failed, 2 intentional skips. Type check and production build passed; lint has 0 errors and 6 existing warnings. Evidence and the Windows atomic-write retry fix are documented in `PHASE_04_ASSETS.md`.
- Earlier-phase host, authentication/isolation, write-conflict and backup/restore regressions were included in the full suite. This does not revalidate real PostgreSQL, public hosts/TLS or off-machine recovery.
- No deployment, live R2 operation, production-data edit, commit or push was performed.

### Historical validation from 13 November

- `npm test`: 234 passed, 0 failed, 2 intentional skips (the optional PostgreSQL run and its file-only counterpart). PostgreSQL was tested separately below.
- `npx tsc --noEmit` and the production build passed.
- `npm run lint`: 0 errors, 6 existing warnings.
- Browser checks passed at 1440, 390 and 320 px: original light footer colour, 36 links, no horizontal overflow, validation and mocked signup success, navigation, reduced motion, pointer grid, portrait filters, register search/empty results and modal keyboard/close/focus restoration.
- Local PostgreSQL: account concurrency/migration regression, 64 local-asset API checks and 65 fake-S3 API checks passed; actual database dump/restore and production outage/recovery passed.

Logs/screenshots are in the ignored `qa-bug-hunt/` directory. A successful local run does not prove live DNS, public HTTPS, real email delivery, managed-provider TLS or mobile GPU performance. Nothing was deployed, and no production account or database was changed.
