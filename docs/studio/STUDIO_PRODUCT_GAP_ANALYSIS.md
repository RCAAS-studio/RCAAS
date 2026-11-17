# Studio product gaps and roadmap
17 November 2026. Existing implementations were checked before assigning gaps. The platform already has per-project roles, staff invitations, private/resumable uploads, revision conflicts, explicit recovery, publishing history, camera tracks, templates, calendars, waitlists, reporting and backup tooling. These should not be rebuilt.

## Feature Book comparison
The actual docs/RCAAS-Feature-Book.pdf is 14,994,949 bytes, SHA-256 0aae7011a133a4a670bcddfa285443d0a243e0c3a1723a909a6d787c870bc71d, matching the prior complete 27-page extraction. The current audit read that extraction and the existing page-by-page FEATURE_BOOK_REVIEW.md. Re-extraction was attempted but its ignored cached PDF reader was missing; no fresh PDF rendering is claimed. The September edition and October appendix are historical, not today's acceptance criteria.

- Page 12 autosave: current Save space is explicit. Local undo and manual draft download do not imply server autosave or crash recovery.
- Every-save history: numbered history is created by Publish, not ordinary saves.
- S3-only/no-local storage language: assets can be remote; accounts may use PG; projects/scenes/sites/reservations/leads/stats/activity and upload staging still require local persistence.
- Historical seven-hotspot count: current union has nine: image, video, text, link, portal, audio, table, room, hall.
- Cloud, notifications and booking engine examples do not establish enabled/live integrations.
- Metrics measure visits, time and interactions, not uniquely identified guests or payment completion.
- VR is not a verified deliverable; no headset/SDK capability is inferred.

## Prioritized implementation order
| Category / priority | Work | Dependencies and migration | Planning scope / acceptance |
|---|---|---|---|
| A reliable launch / P1 | Harden outbound availability connector | Confirm legitimate providers; pinned DNS/IP handling; no booking default changes | Medium (roughly 2–4 engineering days plus provider acceptance); blocked private/redirect/rebind/oversize cases |
| A / P1 | Patch installed framework vulnerability | Review precise affected range; keep Three.js/SDK pinned | Small–medium, 1–3 days plus full Node/Pages/browser regression; no dependency change in this task |
| A / P1 | Complete live infrastructure acceptance | Owner provides isolated PostgreSQL/R2 staging, host/TLS, verified mail domain | Several days plus provider lead time; account isolation, private assets, delivery, restore and rollback evidence |
| A / P2 | Recovery and failed-copy UX | Existing strict save/revision contract; clear per-target batch state | Small–medium; retry must not duplicate copied objects or replace unrelated changes |
| A / P2 | Complete real device and failure matrix | Test phones/tablet, genuine assets, throttled network | Several focused QA days; no paid reservations or provider messages |
| B commercial / P2 | Automatic local crash recovery | Account/project/scene/revision keys, quotas, expiry, logout clearing | Medium, 3–5 days; preserve data on refresh without leaking it across accounts |
| B / P2 | Optional server autosave | Agree debounce, conflict behavior, version policy and failure UI | Medium–large, 1–2 weeks; explicit save/publish invariant retained |
| C UX / P3 | Multi-hotspot selection | Selection set, grouped history, inspector mixed values, transforms | Medium, 3–5 days plus GPU regression; preserve single-selection behavior |
| C / P3 | Better track timeline | Existing authored versus baked tracks, seek/preview semantics | Large, 1–2 weeks; no unsupported SDK editing of baked tracks |
| B / P3 | Visual conflict merge | Three-way base/local/remote model and stable object IDs | Large, 1–2 weeks; schema/version strategy and conflict tests before UI |
| B / P3 | Asset organization and report refinements | Usage index, filters, explicit metric definitions | Medium; no deletion or retention-policy change without decision |
| D advanced / P4 | VR, CRM, payments | Business scope, headset/SDK/provider contracts | Separate projects; do not advertise before acceptance |
| E unnecessary now | Whole-platform rewrite, microservices, database-everything migration | No demonstrated need | Defer; avoid destabilizing working capture/publish paths |

Estimates are planning ranges, not delivery commitments. They assume available fixtures and infrastructure and exclude owner/provider delays.

Owner decisions: approved booking-engine endpoints; production domain/host and private staging credentials; account backend choice; verified sender and notification channels; whether sample projects may be public; backup retention/off-machine destination and recovery objectives; autosave/history/recovery retention policy. No secret values are included in this report. Existing embed-first versus client-site add-on policy remains.
