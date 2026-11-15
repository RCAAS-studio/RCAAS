import { GameWorldsEntry } from '@/features/marketing/services/ServiceEntries';
import { marketingMetadata } from '@/features/marketing/routing/metadata';

export const metadata = marketingMetadata('/services/game-worlds-assets/');

export default function Page() {
  return <GameWorldsEntry />;
}
