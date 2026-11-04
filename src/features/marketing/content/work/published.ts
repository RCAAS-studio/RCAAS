import type { CaseStudyContent } from './types';

// Launch rule: a case study missing its 3D link, location or date, or still showing a [[TBI]]/[[TBC]], stays draft (noindex, with a notice).
const shownText = (s: CaseStudyContent) => [s.titleTag, s.metaDescription, s.h1, s.heroResult, s.embedCaption, s.challenge, s.story, s.built, s.received, s.usedPending ?? '', ...s.snapshot.map((row) => row.value)];
// Each gallery view is drawn as a [[TBI: view]] frame until real photos are wired in, so a listed view counts as a placeholder.
export const isCaseStudyPublished = (study: CaseStudyContent) =>
  Boolean(study.embedUrl && study.location && study.date) &&
  study.gallery.length === 0 &&
  !shownText(study).some((text) => text.includes('[['));
