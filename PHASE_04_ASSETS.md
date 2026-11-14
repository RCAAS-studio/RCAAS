# Phase 04 — asset handling and upload integrity

Reviewed 14 November 2026 against the supplied *RCAAS Studio 90% Product Completion Blueprint*, pages 6 and 17. Baseline: local `main` at `4ecb924`; the worktree was initially clean. Changes remain uncommitted. The user authorized checking the current phase and changing files. The PDF's model-selection, merge, approval and deployment prompts were treated as reference material, not separate user commands.

**Status: in progress.** The local upload-safety slice is implemented and tested. Live R2, browser/device evidence and the remaining lifecycle features below are still required; this is not a phase-completion or release-readiness claim.

## Earlier phases checked

| Phase | Evidence checked now | Gate still open |
| --- | --- | --- |
| 00 Audit | Current source, clean starting worktree, recent phase-4 commits and historical audit reports. | Old inventories and test failures are historical, not today's state. |
| 01 Domains | `test/hosts.test.mjs`, API public URL/origin tests and same-origin studio asset URL tests. | Actual DNS, proxy, TLS and browser host routing. |
| 02 Identity | API tenant/staff guards, upload ownership, membership/password revocation and production session tests. | Actual deployment, additional planned roles/MFA/device management. |
| 03 Data | Atomic-write, concurrent-edit, snapshot, backup/restore and Windows deployment regressions. | PostgreSQL was not rerun here; off-machine restore, scheduling and protected configuration recovery remain deployment gates. |

## Existing phase-4 implementation, verified rather than rebuilt

- `server/src/storage.js` selects local disk or the signed S3 driver. R2 is accessed by the API; no bucket address or credential is sent to the browser. The browser sends 8 MiB chunks to local staging; S3 finalization streams individual objects with known lengths. This is **not S3 multipart upload**.
- `assetCatalog.js` records uploader, staging/ready state, timestamps, original-file bytes and SHA-256. Existing legacy assets may have no catalog/checksum record. Generated gzip/floor-plan derivatives are not included in source-file totals.
- `assetAccess.js` and `assetReferences.js` index drafts, retained scene versions, projects and websites. Public reads derive from the current published snapshot; website media is exposed by exact referenced filename. Authenticated project access is rechecked for private reads. Guessed private IDs and removed members cannot read drafts.
- Whole-asset deletion refuses references from drafts, retained snapshots and sites. Saves/publication/deletion use the document write queue. The old `assets:unused` script is a local, read-only report; it is not an approved purge workflow.
- Range responses, suffix ranges, compressed GLB delivery, upload ownership and bounded client chunk retries already existed. The SDK's index/tile URLs continue through `/api/assets/:assetId/*`; the studio uses its own origin to retain host-only cookies.
- Private responses use `private, no-store`; public responses use `public, no-cache` with appropriate `Vary` headers. Public access must be revalidated after unpublish. **Do not add an unconditional CDN cache override to this route.** Previously downloaded public files cannot be recalled.

## Changes in this slice

| Files | Change and reason |
| --- | --- |
| `server/src/uploadPolicy.js` | Shared package/file/count limits, portable path validation, manifest validation and streamed-upload completeness checks. |
| `server/src/routes/assets.js` | Enforce declared files and lengths before finalization; reject unexpected chunks; bound legacy chunks; safely extract and check ZIPs; validate LCC index structure/size; retain source staging until readiness commits. |
| `src/lib/api.ts`, `src/features/studio/upload.ts` | The studio declares every original file before sending scans, ZIPs, converted GLB, audio or 360 video. Invalid server progress fails visibly. |
| `server/.env.example` | Document configurable per-upload limits. No real environment file was changed. |
| `server/test/assets-privacy.test.js`, `server/test/fakeS3.js` | Regressions for truncation/resume, limits, hostile/corrupt ZIPs, simulated S3 failures and an actual interrupted HTTP request. Existing privacy/publication/range/deletion regressions remain. |
| `server/src/dataDir.js`, `server/test/dataDir.test.js` | Earlier-phase recheck reproduced Windows sharing failures beyond the old 300 ms retry budget. Bounded exponential retries allow ~1.8 seconds; a regression covers recovery, permanent failure, preservation of old data and temporary-file cleanup. |
| `CLAUDE.md`, `PHASE_STATUS.md`, this file | Correct stale phase status and unsafe blanket-cache advice; record implementation, evidence and next tasks. |

### Upload contract

The studio starts an upload using `POST /api/assets` with:

```json
{"files":[{"relPath":"scan.lcc2","bytes":128},{"relPath":"data/tile.bin","bytes":8388608}]}
```

Lengths above are illustrative; send the actual `File.size`. Paths must be unique, including case differences. Empty files are rejected.

1. The server validates and budgets the declaration before creating an upload.
2. The existing `POST /api/assets/:id/files` returns the durable byte offset. PUT chunks must stay within the declared path/length. A repeated accepted chunk returns `409` with the actual offset.
3. Finalization compares the complete staged file list and lengths with the declaration. Incomplete packages return `409` and retain staging for resumption; they remain unreadable and cannot be attached/published as ready assets.
4. ZIPs are extracted serially, with expanded size/entry bounds, safe unique paths, regular-file checks and per-file CRC verification. Invalid archives are discarded from staging. Extracted file sizes replace the archive declaration so failed cloud copies can retry.
5. SHA-256 values are calculated while streaming sources. Readiness is committed only after the source copy succeeds. Partial objects from a failed copy remain inaccessible while the catalog is staging. A subsequent finalization retries the copy.

Defaults are `UPLOAD_MAX_BYTES=10737418240` (10 GiB), `UPLOAD_MAX_FILE_BYTES=4294967296` (4 GiB), and `UPLOAD_MAX_FILES=10000`. LCC JSON indexes are capped at 16 MiB. Invalid limit settings refuse startup. Loose-file counts and ZIP entries are bounded; ZIP directory entries count too. These are operational limits, not scan decimation or performance targets.

Limits are **per upload**, not per account or server. A ZIP can temporarily occupy its compressed size plus expanded data; local finalization also copies sources into asset storage. Budget disk space accordingly. Declared uploads do not rescan all staged files for every chunk; legacy undeclared uploads do, to enforce limits without trusting a client total.

Compatibility: older API callers may omit the manifest and existing staged uploads can continue. Their original byte lengths cannot be proved. Nonempty checks, format checks and limits still apply, but do not label such uploads verified against an original file. A declared length and recorded SHA-256 are not a full semantic validation of LCC tile data or a comparison with a trusted source checksum.

## Verification

- `node --test server/test/assets-privacy.test.js`: 7 passed, 0 failed, covering local and fake-S3 privacy/publication/revocation, retained-reference deletion, declared truncation and resume, byte ranges, limits, hostile ZIPs and CRC mismatch, cloud-copy outage/retry, and a socket disconnect after an 8 MiB tile chunk. The resumed tile's SHA-256 matches its source.
- `npm.cmd test`: exit 0, **245 passed, 0 failed, 2 intentional skips** (60 root tests + 185 API tests passed). This includes earlier-phase regressions, local storage and fake S3. Optional PostgreSQL and the file-suite's S3-only counterpart are intentionally skipped.
- `node node_modules/typescript/bin/tsc --noEmit`: exit 0.
- `npm.cmd run lint`: exit 0, 6 pre-existing warnings, no errors.
- `npm.cmd run build`: exit 0; 56 pages generated. Initial sandbox build could not fetch Google Fonts; retry with approved network access succeeded.
- Two full runs hit Windows `EPERM` during the existing atomic-write concurrency test, although isolated and one intermediate full run passed. The repeated failure justified extending the bounded sharing-conflict retry window from 300 ms to ~1.8 seconds. The existing concurrency assertion was retained; a new deterministic regression verifies transient recovery and permanent-failure cleanup without deleting old data.

No new dependency or lockfile change. Tests use disposable data and simulated services. No real email, R2 transfer, production data mutation, DNS change or deployment. Browser upload interaction, real GPU rendering, multi-GiB transfer throughput, actual R2 permissions/ranges and off-machine restore were not verified.

## Manual verification instructions

Use a disposable project and local API data, not a customer's live project. Start with `npm.cmd run dev` and use the actual local URL printed by the script. Sign in, upload a small complete LCC export or supported model, and check that the browser's upload-start request declares file lengths. Save the draft and verify that its media opens for its editor while an incognito request returns 404. Publish it and verify public byte-range delivery; change the draft model and confirm the existing published snapshot remains visible until republished. Unpublish and confirm a fresh public request is denied.

For deterministic interruption, hostile archive, permissions and simulated outage checks, run the dedicated test command above. It creates and destroys its own fixtures and does not require private scans or credentials. Do not infer real GPU performance from headless/API tests.

## Remaining phase-4 work and operating decisions

| Priority | Work | Owner / evidence needed |
| --- | --- | --- |
| P0 before deployment | Verify private bucket configuration, proxy/range behavior, cache policy and failed/recovered reads against actual R2. | Operator + engineer; isolated test prefix, genuine range/checksum/access evidence. Keep `ASSET_DRIVER=local` until the existing cutover decision changes. |
| P0 before deployment | Exercise studio upload → save → publish → mobile viewer using real export/media and actual browsers. | Engineer + owner/device reviewer; loading/error evidence, including host-only cookie preview. |
| P1 | Persistent resume UI and retry-finalization action. | Engineer; current retry recovers transient chunks and the API supports retained IDs, but a refreshed page or UI retry does not restore an upload session. |
| P1 | Catalog/usage reporting, project/account storage quotas and upload/finalize rate limits. | Engineer + operator; source-byte records exist, full storage/transfer metering does not. |
| P1 | Retention and explicit purge policy, abandoned staging/partial-copy cleanup, shared media replacement/deletion audit and cloud orphan reporting. | Owner + engineer; preserve retained versions and recheck references under the same write queue before removal. No timed deletion introduced here. |
| P1 | Durable thumbnail/processing queue with retry and resource budgets. | Engineer; current thumbnails/automatic floor plans are not that queue. |
| P1 | Evaluate S3 multipart/resume and large-transfer capacity if 4 GiB object or staging limits are insufficient. | Engineer + operator; retain bounded memory and prove abort/retry behavior before changing delivery. |

Cost assumptions: each finalized source currently needs an object PUT; public/private serving proxies reads and HEAD operations through the API, and retries can repeat writes. Staging uses local disk; backups/derivatives add storage. No currency estimate or provider free-tier claim is made because current pricing, scan sizes, request counts and traffic were not measured. Collect these before estimating R2 and VPS cost.

## Migration and rollback

No schema migration or public URL change. New upload-owner records add an optional `files` map; old records remain readable. Completed scene snapshots and stored source-file checksums are unchanged. Deploy API and studio together to gain declared-size checks; cached older clients retain the documented compatibility path. Keep exactly one API process while file-store write queues are used.

Rollback this slice by reverting its code/config/documentation changes as a unit; no data restore is required. That removes new limits and completeness checks, so it is a functional rollback, not equivalent protection. Do not roll back the earlier private-asset access commits. Retain staging and catalog records for operator review instead of deleting them during rollback.
