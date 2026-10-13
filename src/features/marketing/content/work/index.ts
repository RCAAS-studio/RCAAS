import type { RoutePath } from '../../types';
import type { CaseStudyContent } from './types';
import { chilanchoStupa } from './chilancho-stupa-digital-heritage';
import { nepathya } from './nepathya-school-college-3d-campus-tour';
import { madanAshrit } from './madan-ashrit-polytechnic-3d-campus-tour';
import { basera } from './basera-boutique-hotel-3d-experience';

export type { CaseStudyContent } from './types';

export const CASE_STUDY_CONTENT: CaseStudyContent[] = [chilanchoStupa, nepathya, madanAshrit, basera];

export const findCaseStudy = (slug: string) => CASE_STUDY_CONTENT.find((study) => study.slug === slug);

export const caseStudyPath = (study: CaseStudyContent) => `/work/${study.slug}/` as RoutePath;

// Launch rule: a case study missing its 3D link, location or date stays draft (noindex, with a notice).
export const isCaseStudyPublished = (study: CaseStudyContent) => Boolean(study.embedUrl && study.location && study.date);
