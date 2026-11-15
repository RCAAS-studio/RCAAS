import type { pageMeta } from '../meta';

export type GraphItem = Record<string, unknown>;
export type GraphContext = Pick<ReturnType<typeof pageMeta>, 'pathOnly' | 'blogRoute' | 'caseStudyRoute'> & {
  currentPath: string;
  baseOrg: GraphItem;
  graphItems: GraphItem[];
};
