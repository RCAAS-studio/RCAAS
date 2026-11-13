# Visual Storytelling implementation review

Review: 13 November 2026. Scope: the company service page and its enquiry handoff. Existing platform/API/database changes are outside this task.

## Initial audit and implementation checklist

- [x] Read the complete 1,272-line page, its state, data, navigation, FAQ and media dependencies, project brief, route generation and Pages workflow.
- [x] Verify media before designing: `public/media/hero.mp4` is a real silent H.264 Chilancho capture excerpt, 1600 × 900, 30 fps, 10.3 seconds, 4,132,587 bytes (`ffprobe`). Its provenance is recorded in `public/media/README.md`. The four `media/tour` stills come from the recorded computer-lab capture.
- [x] Identify misleading interactions: the film facade changes stills and prints “Now playing”; `SplatEmbed` draws generated canvas points rather than loading a captured model. Preserve that shared, already-edited component; replace its use on this page with the existing owner-confirmed XGRIDS experience.
- [x] Check before/after inputs: the first is a campus, the second a heritage courtyard collage. They are not a corresponding dated pair. Do not reuse them as restoration evidence.
- [x] Check project evidence: Chilancho is recorded as an in-house research project, with an owner-confirmed external viewer URL. Other case-study content still has unresolved facts; do not promote invented outcomes or link visitors into draft evidence.
- [x] Check contact flow: existing `/contact/?type=storytelling` selection and `sendLead` support a format handoff without a new backend. The unconfirmed budget control exposes a public placeholder.
- [ ] Replace simulated playback with native video and a deliberate external 3D load, with recovery paths.
- [ ] Build the hero, five-format explorer, audience framework, real evidence, four-step process and enquiry journey.
- [ ] Repair comparison clipping, keyboard/touch operation and honest labels.
- [ ] Remove public placeholders and qualify unverified output, accuracy, language, timing, licensing and business-result claims.
- [ ] Check lint, types, existing tests, root production and `/RCAAS` static builds, then browser layouts/interactions and errors.

## Design direction

Use the existing Inter family and RCAAS tokens: white `#FFFFFF`, ink `#09090B`, muted `#52525B`, surface `#FAFAFA`, line `#E4E4E7`, accent `#E11D48`. A large, left-aligned two-line headline leads into a panoramic genuine capture. The media is the memorable element; section labels, navigation and format choices stay quiet. Alternate a light format explorer with a dark audience workshop; give the actual project evidence more space than technical specifications. Small radii frame media; avoid turning every paragraph into a card. Keep the original light footer and company grid.

Layout: headline + brief → full-width capture → playable/interactive showcase → five format choices + detail → four questions by audience → documented research example → four process steps → selected-format enquiry.

## Validation and handoff

To be completed after implementation. Public URLs could not be read by the web browsing tool during the initial audit; runtime verification is recorded separately. No publication, deployment, new dependency or live lead submission is authorized by this work.
