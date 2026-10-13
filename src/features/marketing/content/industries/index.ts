import type { IndustryContent } from './types';
import { hospitalityTourism } from './hospitality-tourism';
import { education } from './education';
import { realEstateArchitecture } from './real-estate-architecture';
import { heritageCulture } from './heritage-culture';
import { governmentMunicipalities } from './government-municipalities';
import { factories } from './factories';
import { nonLifeInsurance } from './non-life-insurance';
import { gaming } from './gaming';
import { filmmaking } from './filmmaking';
import { nonprofitInternationalDevelopment } from './nonprofit-international-development';
import { bankingFinancialInstitutions } from './banking-financial-institutions';

export type { IndustryContent, IndustryItem, IndustryLink, IndustryTrack } from './types';

// Industry pages built from final copy.
export const INDUSTRY_CONTENT: IndustryContent[] = [hospitalityTourism, education, realEstateArchitecture, factories, heritageCulture, governmentMunicipalities, nonLifeInsurance, gaming, filmmaking, nonprofitInternationalDevelopment, bankingFinancialInstitutions];

export const findIndustryContent = (path: string) => {
  const match = path.match(/^\/industries\/([a-z0-9-]+)\/?$/);
  return match ? INDUSTRY_CONTENT.find((industry) => industry.slug === match[1]) : undefined;
};

export const isResolvedAnswer = (answer: string) => !answer.includes('[[');
