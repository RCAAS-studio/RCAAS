# Studio feature inventory
17 November 2026. Local main checkout (baseline 8f1b3ab), including pre-existing uncommitted carousel work. That work was preserved.

Statuses apply to the evidence explicitly named, not to every device or edge case. VERIFIED WORKING means the stated automated contract passed in disposable storage. IMPLEMENTED BUT UNVERIFIED means source exists but the full user journey lacks current evidence. PARTIALLY IMPLEMENTED distinguishes a narrower working capability from a larger promised one. BROKEN is a reproduced defect; fixed defects are in the functional audit. NOT IMPLEMENTED and DOCUMENTATION ONLY are not passes.

Evidence: A = server/test/api.test.js and its fake-S3 rerun; S = security-regressions/assets-privacy/session tests; C = client/history/draft tests; B = Studio component browser suite (fixture/API simulation, not renderer evidence); R = two actual production Studio scenarios with real API and copied LCC capture. Commands/results and omissions are in STUDIO_RELEASE_READINESS.md.
Paths below are relative to src/features unless prefixed server/ or app/. API paths are relative to /api. Project permissions are owner/member/admin for authoring; staff have only assigned operational access. Accounts use file JSON or PostgreSQL; other business records remain JSON.

| Feature / UI | Status and evidence | Source / API | Persistence and permissions | Limits / recommended action |
|---|---|---|---|---|
| Signup, login, logout, invalid sessions, password change/reset | VERIFIED WORKING: A/S/R local file accounts | auth/AuthPanel, PasswordChange; auth routes | users JSON or optional PG; own account, reset token | Live reset delivery and PG not verified here |
| Dashboard empty/error/loading, project cards, last project, thumbnails | IMPLEMENTED BUT UNVERIFIED as complete UX matrix; R opens project | app/studio/page.tsx; properties, scenes, gallery | properties/scenes JSON; visible projects only | No full first-user/many-project/expiry screenshot matrix |
| Create/list/rename/delete/claim projects | VERIFIED WORKING: A | NewProjectDialog, ProjectDialogs; properties CRUD/claim | properties JSON; owner/admin; deletion releases spaces | Real client deletion never exercised |
| Kind, status, feature toggles, waiting counts | VERIFIED WORKING: A contracts | PlaceKindPicker, project home; properties/:id/kind,status,features | properties JSON; owner/admin | Every kind's browser onboarding unverified |
| Membership, staff invitations, revocation | VERIFIED WORKING: A/S | ProjectDialogs, TeamDialog; members and team routes | users + project membership | Provider invitation delivery unverified |
| Storage/account administration | IMPLEMENTED BUT UNVERIFIED UI; API tests cover guards | StorageDialog, TeamDialog; storage and team routes | asset records/staging, users; admin | No real orphan deletion; review report before cleanup |
| Space create/move and editor entry | VERIFIED WORKING: A/R for named flows | Uploader, app/studio/[property]/edit | scenes JSON; author | Upload-to-editor complete UI sequence not covered |
| Hierarchy search, selection, rename | VERIFIED WORKING: B/C/R tested commands | editor/SceneTree, scenes.ts | in-memory until Save; author | Multi-selection absent |
| Translation/rotation/scale and gizmos | IMPLEMENTED BUT UNVERIFIED all drags | Gizmo, transform, PlacementSection | scene transform; author | Numeric/history logic tested; physical pointer/GPU matrix pending |
| Hotspot coordinates/payload/delete | VERIFIED WORKING: B/C/R representative text hotspot | HotspotInspector, HotspotGizmo, hotspotMove | scene hotspots; author | Every type's complete create/publish/public cycle pending |
| Image/video/text/link/audio hotspots | IMPLEMENTED BUT UNVERIFIED full lifecycle | hotspot.types, HotspotInspector, HotspotMarkers | scene payload + authorized media | Nine total actual types, not arbitrary custom actions |
| Portal hotspots and dead-target warnings | VERIFIED WORKING: A target/readiness contracts | HotspotMarkers; scenes/:id/publish | scene payload; public published targets | Every coordinate/occlusion case unverified |
| Table/room/hall hotspots | VERIFIED WORKING: A request/availability contracts | HotspotBookCard, TableCard, RoomCard | scene payload + reservations JSON | Real tour forms across devices pending |
| Viewpoints, camera tracks and narration | IMPLEMENTED BUT UNVERIFIED complete motion; B/C commands pass | viewpoints, TrackInspector, Filmstrip | tracks in scenes; author | No advanced timeline; baked-track restrictions exist |
| Camera walk/fly/orbit/viewpoint and touch | IMPLEMENTED BUT UNVERIFIED full behavior matrix | useLccWalker, useCameraDirector, navMode, TouchControls | scene spawn/camera + session | Real capture draws; collision/wall traversal on physical devices pending |
| Colliders | VERIFIED WORKING: B/C numeric/history contracts | ColliderInspector, ColliderBoxes, collision | scene colliders | Full GPU collision acceptance pending |
| Measurements and calibration | IMPLEMENTED BUT UNVERIFIED survey accuracy | MeasureTool, SceneInspector, unitScale | scene unitScale; author | No certified measurement accuracy claimed |
| Floor plans/room marks/uploads/print | VERIFIED WORKING: server plan tests for algorithms/storage | FloorPlanInspector, PlanMarker, app/studio/[property]/plan/[space]; assets floorplan routes | derived assets + marks | Survey comparison and full print UX pending |
| Explicit Save and dirty state | VERIFIED WORKING: C/B/R | DraftControls, draftActions, sceneDoc; PUT scenes/:id | scene draft; expected revision | No background server autosave |
| Undo/redo and gesture grouping | VERIFIED WORKING: C/B/R named edits | history.ts | per-tab, per-space snapshots, bounded stack | Not persistent version history; all complex drags unverified |
| Failure/conflict download and reload | VERIFIED WORKING: C/B | DraftRecovery; GET/PUT scene | local memory + manual JSON download | No automatic crash recovery or merge screen |
| Copy hotspots/tracks to spaces | VERIFIED WORKING: new C failure/retry/conflict cases | DraftControls, updateDestinationDraft | destination draft; author | Partial batch success reported; not a multi-project transaction |
| Preview/readiness/publish/unpublish | VERIFIED WORKING: A/B/R | publishing/PublishButton; scenes publish endpoints | immutable numbered snapshots | Missing-file condition remains warning by existing policy |
| Restore/revert/version list | VERIFIED WORKING: A contracts | PublishButton; versions,restore,revert | published versions restored as draft/new publication | Ordinary saves have no version history |
| Anonymous tours and published isolation | VERIFIED WORKING: A/S/R | tour/Viewer, app/t; scenes published/gallery | published snapshot; anonymous | Original snapshots hash-checked; public assets intentionally accessible |
| LCC Gaussian capture | VERIFIED WORKING: R desktop capture load/draw | useSceneManager, vendor SDK | local/S3 asset IDs | Not arbitrary splat formats; phone/GPU endurance unverified |
| GLB models, OBJ/FBX/PLY preparation | IMPLEMENTED BUT UNVERIFIED renderer matrix; A upload checks | modelPrep, modelConvert.worker, meshModel | converted GLB assets | Not all model variants/materials certified |
| Equirectangular 360 video | IMPLEMENTED BUT UNVERIFIED playback; A upload/range checks | panoModel, assets routes | MP4 asset | INSV is refused; headset support absent |
| Quality tiers, cleanup, missing-asset fallback | IMPLEMENTED BUT UNVERIFIED exhaustive failures | deviceTier, useSceneManager, meshModel/panoModel, scene/App | runtime | Late mesh resolution disposed; long soak/context loss still needed |
| Client site templates/content/branding/images | IMPLEMENTED BUT UNVERIFIED full UI; A contracts pass | app/studio/[property]/site, siteTemplates, website/SiteView; sites routes | site JSON; author | No broad website redesign performed |
| Site preview/publish/schedule and isolation | VERIFIED WORKING: A/S | site preview route; sites draft,publish,schedule | saved draft + published copy | Browser flow G not freshly automated end to end |
| Tables, room nights, hall sessions, multiple outlets | VERIFIED WORKING: A local + fake S3 | booking components; reservations routes | per-project reservations queue; public request, staff manage | Single API process; no payment processor |
| Requested/confirmed/declined/cancelled, manual blocks | VERIFIED WORKING: A | reservations inbox; PATCH/mark routes | same JSON/queue | Existing hold policy preserved |
| Waitlists and event attachments | VERIFIED WORKING: A synthetic delivery/one-time upload key | WaitlistForm; waitlist/attachment routes | reservations + private attachments | Live email/SMS/WhatsApp unverified |
| External booking-engine availability | PARTIALLY IMPLEMENTED | engine.js, room hotspot availabilityUrl | short in-process cache | Provider adapter needed; DNS/private-address hardening open |
| Visit/time/source/hotspot/intent/conversion metrics | VERIFIED WORKING: A calculations | lib/stats, server/stats, report route | per-project/month JSON; public validated beacon, private report | Counts aren't unique humans; conversion dedupe is monthly |
| Leads, CSV export, activity trail | VERIFIED WORKING: A | report/project home; leads.csv,activity | leads/activity JSON; assigned operators | Not a tamper-evident compliance ledger |
| AI translation/suggestion/concierge and budget | VERIFIED WORKING: simulated-provider API contracts | ClaudeTools, studioAi, concierge, ai-budget | scene words, budget/outbox where applicable | Live provider, content quality and costs unverified |
| Private uploads/resume/checksum/ZIP limits | VERIFIED WORKING: A/S/upload-resume tests | upload.ts, assets.js, assetAccess | staging/asset records + local/S3; creator and authorized projects | Browser interruption/large-file endurance incomplete |
| S3/R2 | IMPLEMENTED BUT UNVERIFIED live service | storage-s3, push-assets | bucket objects + local metadata/staging | Fake-S3 passes; cloud does not replace DATA_DIR |
| Backup/restore and migrations | VERIFIED WORKING: isolated tooling tests | deploy backup/restore, dataDir, migrate, db | files + optional PG dump | Off-machine operational restore/rollback unverified |
| Multi-hotspot selection, advanced timeline, visual merge | NOT IMPLEMENTED | single Selection and TrackInspector/DraftRecovery | design needed | Prioritize after reliability acceptance |
| Automatic server autosave/every-save history | DOCUMENTATION ONLY in historical Feature Book | current explicit-save code contradicts claim | no automatic persistence contract | Correct docs; design separately |
| Payments, CRM sync, VR/headsets | NOT IMPLEMENTED as commercial capabilities | no complete implemented provider/headset workflow | none | Do not advertise; future scope/SDK evidence required |

The inventory covers the discovered capability families and identifies representative endpoints. It is not a claim that every button, screen, dependency or input combination received runtime verification. See the generated source/endpoint index for exact discovery breadth.

## Source discovery index

Generated from the local tree, 17 November 2026. This is discovery evidence, not additional runtime acceptance. API methods below are relative to each router mount in server/src/index.js.

### studio

- `src/features/studio/BrandInfoFields.tsx`
- `src/features/studio/ClaudeTools.tsx`
- `src/features/studio/ColliderBoxes.tsx`
- `src/features/studio/draftActions.ts`
- `src/features/studio/DraftRecovery.tsx`
- `src/features/studio/editor/ColliderInspector.tsx`
- `src/features/studio/editor/controls.tsx`
- `src/features/studio/editor/DraftControls.tsx`
- `src/features/studio/editor/EditorTopBar.tsx`
- `src/features/studio/editor/FloorPlanInspector.tsx`
- `src/features/studio/editor/HotspotInspector.tsx`
- `src/features/studio/editor/PlacementSection.tsx`
- `src/features/studio/editor/SceneInspector.tsx`
- `src/features/studio/editor/SceneTree.tsx`
- `src/features/studio/editor/TrackInspector.tsx`
- `src/features/studio/editor/types.ts`
- `src/features/studio/editor.css`
- `src/features/studio/EditorShell.tsx`
- `src/features/studio/Gizmo.tsx`
- `src/features/studio/history.ts`
- `src/features/studio/home.css`
- `src/features/studio/hotspotControls.ts`
- `src/features/studio/HotspotGizmo.tsx`
- `src/features/studio/hotspotMove.ts`
- `src/features/studio/modelConvert.ts`
- `src/features/studio/modelConvert.worker.ts`
- `src/features/studio/modelPrep.ts`
- `src/features/studio/NewProjectDialog.tsx`
- `src/features/studio/PlaceKindPicker.tsx`
- `src/features/studio/PlanMarker.tsx`
- `src/features/studio/planmarks.css`
- `src/features/studio/planMarks.ts`
- `src/features/studio/ProjectDialogs.tsx`
- `src/features/studio/publishing/PublishButton.tsx`
- `src/features/studio/QrCode.tsx`
- `src/features/studio/ShortcutSheet.tsx`
- `src/features/studio/siteTemplates.ts`
- `src/features/studio/StorageDialog.tsx`
- `src/features/studio/TeamDialog.tsx`
- `src/features/studio/upload.ts`
- `src/features/studio/uploader.css`
- `src/features/studio/Uploader.tsx`

### scene

- `src/features/scene/App.tsx`
- `src/features/scene/collision.ts`
- `src/features/scene/deviceTier.ts`
- `src/features/scene/editorActive.ts`
- `src/features/scene/lccConfig.ts`
- `src/features/scene/measure.css`
- `src/features/scene/MeasureTool.tsx`
- `src/features/scene/meshModel.ts`
- `src/features/scene/mobileInput.ts`
- `src/features/scene/navMode.ts`
- `src/features/scene/panoModel.ts`
- `src/features/scene/sceneDoc.ts`
- `src/features/scene/scenes.ts`
- `src/features/scene/TouchControls.tsx`
- `src/features/scene/transform.ts`
- `src/features/scene/useCameraDirector.ts`
- `src/features/scene/useLccWalker.ts`
- `src/features/scene/useSceneManager.ts`
- `src/features/scene/viewpoints.ts`
- `src/features/scene/walkerConfig.ts`

### tour

- `src/features/tour/ConciergePanel.tsx`
- `src/features/tour/DotVeil.tsx`
- `src/features/tour/FloorMap.tsx`
- `src/features/tour/floorMapData.ts`
- `src/features/tour/viewer.css`
- `src/features/tour/Viewer.tsx`

### website

- `src/features/website/SiteNav.tsx`
- `src/features/website/SiteParts.tsx`
- `src/features/website/SiteView.tsx`
- `src/features/website/SpaceView.tsx`
- `src/features/website/website.css`

### booking

- `src/features/booking/booking.ts`
- `src/features/booking/BookingCard.tsx`
- `src/features/booking/EventBooking.tsx`
- `src/features/booking/HallCalendar.tsx`
- `src/features/booking/HotspotBookCard.tsx`
- `src/features/booking/RoomBooking.tsx`
- `src/features/booking/RoomCard.tsx`
- `src/features/booking/table-booking.css`
- `src/features/booking/TableBooking.tsx`
- `src/features/booking/TableCard.tsx`
- `src/features/booking/WaitlistForm.tsx`

### hotspots

- `src/features/hotspots/HotspotIcon.tsx`
- `src/features/hotspots/hotspotLayout.ts`
- `src/features/hotspots/HotspotMarkers.tsx`
- `src/features/hotspots/hotspotProjector.ts`
- `src/features/hotspots/hotspots.css`
- `src/features/hotspots/localized.ts`

### auth

- `src/features/auth/AuthPanel.tsx`
- `src/features/auth/PasswordChange.tsx`
- `src/features/auth/useSession.ts`
- `src/features/auth/useStudioSession.ts`

### API route declarations

- `server/src/routes/assets.js`: `POST /`; `POST /:assetId/files`; `PUT /:assetId/files/chunk`; `POST /:assetId/finalize`; `GET /:assetId/*`; `GET /:assetId`; `POST /:assetId/floorplan`; `PUT /:assetId/floorplan/marks`; `PATCH /:assetId/floorplan/rooms`; `PUT /:assetId/floorplan/upload`; `DELETE /:assetId/floorplan/upload`; `DELETE /:assetId`
- `server/src/routes/auth.js`: `POST /signup`; `POST /login`; `POST /logout`; `POST /reset`; `POST /password`; `POST /forgot`; `GET /session`
- `server/src/routes/concierge.js`: `GET /:project`; `POST /:project`
- `server/src/routes/demoEngine.js`: `GET /availability`; `GET /book`
- `server/src/routes/embed.js`: `GET /check`; `GET /:id`; `POST /:id`
- `server/src/routes/leads.js`: `POST /`; `GET /`
- `server/src/routes/properties.js`: `GET /:id/theme`; `GET /:id/leads`; `GET /:id/report`; `GET /:id/leads.csv`; `PUT /:id/lead-emails`; `PUT /:id/features`; `PUT /:id/status`; `PUT /:id/kind`; `POST /:id/lead-emails/test`; `PUT /:id/theme`; `PUT /:id/:image(logo|favicon)`; `DELETE /:id/:image(logo|favicon)`; `PUT /:id/info`; `GET /`; `POST /:id/claim`; `GET /:id`; `POST /`; `GET /:id/activity`; `PATCH /:id`; `DELETE /:id`; `POST /:id/members`; `DELETE /:id/members/:userId`
- `server/src/routes/reservations.js`: `GET /:id/booking`; `GET /:id/availability`; `GET /:id/preview/availability`; `GET /:id/stays`; `GET /:id/stays/availability`; `GET /:id/preview/stays/availability`; `GET /:id/events`; `GET /:id/events/availability`; `POST /:id/reservations`; `POST /:id/stays`; `POST /:id/events`; `GET /:id/requests/tables`; `GET /:id/requests/halls`; `GET /:id/requests/halls/calendar`; `GET /:id/requests/rooms`; `POST /:id/requests`; `POST /:id/waitlist`; `GET /:id/reservations`; `POST /:id/reservations/mark`; `PUT /:id/reservations/:rid/attachment`; `GET /:id/reservations/:rid/attachment`; `PATCH /:id/reservations/:rid`
- `server/src/routes/scenes.js`: `GET /`; `GET /:id/thumb.jpg`; `GET /:id/published`; `GET /:id/published/thumbs/:track.jpg`; `GET /:id/publish`; `POST /:id/publish`; `POST /:id/unpublish`; `POST /:id/revert`; `GET /:id/versions`; `POST /:id/restore`; `POST /:id/property`; `GET /`; `GET /:id`; `PUT /:id`
- `server/src/routes/sites.js`: `GET /`; `GET /:id`; `GET /:id/preview`; `GET /:id/draft`; `PUT /:id/draft`; `POST /:id/publish`; `POST /:id/schedule`; `DELETE /:id/schedule`; `POST /:id/images`
- `server/src/routes/stats.js`: `POST /`; `GET /conversion/:pid/:key.gif`
- `server/src/routes/storage.js`: `GET /`; `POST /remove-idle-uploads`
- `server/src/routes/studioAi.js`: `POST /:id/translate`; `POST /:id/suggest`
- `server/src/routes/team.js`: `GET /`; `PATCH /:id/role`; `POST /:id/reset`; `DELETE /:id`
