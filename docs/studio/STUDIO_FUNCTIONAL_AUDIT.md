# Studio functional audit

## Production-blocker remediation — 17 November 2026

This update supersedes the open framework/engine-network findings below; their original entries remain historical evidence. See [STUDIO_PRODUCTION_BLOCKERS.md](STUDIO_PRODUCTION_BLOCKERS.md) for exact advisory applicability, package versions, tests and remaining staging gates. Next/React received same-minor security patches; booking-engine requests now validate and pin public DNS destinations, bound response bytes and total time, reject redirects and unsafe URL forms, coalesce requests and cap concurrency. Booking availability/hold semantics are unchanged. Added whole-store disposable recovery checks and expanded real-browser project/site/failure-recovery coverage. A stale running development process caused HTTP 500 after the dependency update; a scoped restart/cache move restored home, Studio, login and API health to 200. No live provider or client-data operation was performed.

17 November 2026. The authoritative source is the local checkout. Existing marketing/carousel changes were preserved. No client storage, accounts, reservations or published files were mutated.

## Implemented correction: copy destination load failure (P1)
Root cause: CopyToSpaces awaited loadSceneDoc(target) in its permissive mode. That loader intentionally resolves null after failed reads. Copy then mutated local hotspots/tracks and saved sceneDocFor(target), potentially sending defaults instead of the actual destination document when connectivity recovered. Ordinary Save already used strict loading; copy bypassed that protection.

Correction: draftActions.updateDestinationDraft requires a successful strict destination load before invoking the mutation, then delegates to saveDraft for payload cloning, expected-revision handling and correct dirty-state bookkeeping. Existing cached local destination edits remain intact; there is no force reload.

Evidence: test/studio-drafts.test.mjs now verifies a 503 produces one GET, no mutation and no PUT; a successful retry preserves destination hotspots/assets; a 409 retains copied unsaved work and existing destination content. Seven draft tests pass; the full final client suite has 85 passes. This regression tests the same operation called by the production dialog. The actual copy dialog's full batch UI is not newly browser-tested.

Files: src/features/studio/draftActions.ts; src/features/studio/editor/DraftControls.tsx; test/studio-drafts.test.mjs. No schema or publication policy changed.

## Corrected stale engineering descriptions
server/src/store.js still described a Django/DRF plan and assets in Next public storage. It now describes actual Express, file documents, optional PostgreSQL accounts and authorized local/S3 assets.
server/src/access.js still claimed unattached uploads were available to any signed-in user. Its comment now matches the creator-private asset access implementation. These are comment-only corrections, not authorization changes.

## Findings retained for follow-up
- P1 security: engine.js PRIVATE_HOST checks URL spelling, not resolved DNS addresses. HTTPS and redirect rejection reduce exposure but a hostname resolving privately can bypass that check. The configurable URL is author-supplied, and public availability requests invoke it. Source evidence: engineBooked URL validation and fetch. No private host was contacted to demonstrate exploitation. Add a constrained, DNS-pinned outbound connector with IPv4/IPv6 private-range validation and response streaming limits; test redirects, rebinding, timeout and size caps. An owner-approved provider allow-list is an alternative policy decision.
- P1 launch: the installed Next build emitted a known-vulnerability upgrade warning. This task did not upgrade the framework or renderer. Review the advisory and patch the framework with full regression coverage before production.
- P2 recovery: draft download/reload is explicit, not automatic crash recovery. Manual copy retry after a partial failed batch can require inspecting the destination to avoid duplicate copies. Do not add blind automatic retries.
- P2 runtime: file queues coordinate one process only. Multiple API workers writing the same JSON data are unsupported, even with S3 assets. Keep one writer until a transactional persistence migration.
- P2 performance: reservations/stats queue maps retain keys; large document/global-lock contention and long-session GPU memory need measurements before redesign. No fabricated latency or FPS figures.
- P2 verification: room/table/hall forms, site builder, reports, all hotspot types and every editor tool still lack a complete fresh real-browser matrix. Automated contracts provide narrower evidence.
- P3 usability: multi-selection, timeline and conflict merge are larger roadmap items, not tiny polish fixes.

## Scope and evidence quality
The component suite uses simulated API responses and an editor fixture; it is not GPU evidence. The critical suite uses a real disposable API, a copied genuine capture and native browser drawing. All external notifications are disabled or routed to test servers. The product retains pinned Three.js/XGRIDS compatibility.

Changes to .gitignore retain these four reports; temporary build/browser logs stay ignored. CLAUDE.md links the audit. No commit, push, merge or deploy.
