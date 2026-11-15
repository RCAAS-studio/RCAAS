import { notFound } from 'next/navigation';
import { CASE_STUDY_CONTENT, findCaseStudy } from '@/features/marketing/content/work';
import { CaseStudyEntry } from '@/features/marketing/work/CaseStudyEntry';
import { marketingMetadata } from '@/features/marketing/routing/metadata';

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() {
  return CASE_STUDY_CONTENT.map(study => ({ slug: study.slug }));
}
async function studyFor(params: Props['params']) {
  const { slug } = await params;
  const study = findCaseStudy(slug);
  if (!study) notFound();
  return study;
}
export async function generateMetadata({ params }: Props) {
  const study = await studyFor(params);
  return marketingMetadata(`/work/${study.slug}/`);
}
export default async function Page({ params }: Props) {
  const study = await studyFor(params);
  return <CaseStudyEntry slug={study.slug} />;
}
