import type { TeamMember } from './types';
import { gauravPandey } from './gaurav-pandey';
import { sumanBaral } from './suman-baral';
import { prabhatBhusal } from './prabhat-bhusal';
import { kabirajRokaya } from './kabiraj-rokaya';
import { gameDevelopers } from './game-developers';

export type { TeamMember } from './types';

export const TEAM_MEMBERS: TeamMember[] = [gauravPandey, sumanBaral, prabhatBhusal, kabirajRokaya, gameDevelopers].sort(
  (a, b) => a.order - b.order
);

// Build note: don't publish a card without a photo and role.
export const isMemberPublished = (member: TeamMember) => Boolean(member.name && member.photo && !member.photoIsPlaceholder && member.role);

// Person @id, so Learn guides can cite team members as authors.
export const personId = (member: TeamMember) => `https://rcaas.tech/about/#${member.slug}`;
