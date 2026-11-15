import { notFound } from 'next/navigation';
import { INDUSTRY_CONTENT } from '@/features/marketing/content/industries';
import { IndustryEntry } from '@/features/marketing/industries/IndustryEntry';
import { marketingMetadata } from '@/features/marketing/routing/metadata';

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() {
  return INDUSTRY_CONTENT.map(industry => ({ slug: industry.slug }));
}
async function industryFor(params: Props['params']) {
  const { slug } = await params;
  const industry = INDUSTRY_CONTENT.find(item => item.slug === slug);
  if (!industry) notFound();
  return industry;
}
export async function generateMetadata({ params }: Props) {
  const industry = await industryFor(params);
  return marketingMetadata(`/industries/${industry.slug}/`);
}
export default async function Page({ params }: Props) {
  const industry = await industryFor(params);
  return <IndustryEntry slug={industry.slug} />;
}
