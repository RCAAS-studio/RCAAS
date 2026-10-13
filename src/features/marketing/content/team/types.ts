// A team card. null means the value is still to be input (Register T01) and renders as a placeholder.
export interface TeamMember {
  slug: string;
  // Cards are ordered by this value.
  order: number;
  name: string | null;
  discipline: string | null;
  role: string | null;
  // Role text still to be confirmed ([[TBC]]); the card is not published until confirmed.
  roleToConfirm?: string;
  bio: string | null;
  // Shown after the bio while details are missing.
  bioPending?: string;
  linkedin: string | null;
  github?: string;
  website?: string;
  email?: string;
  // Path under public/. Replace the file at /images/team/{slug}.svg (or point to a .jpg) with the real photo.
  photo: string | null;
  // True while photo is the stand-in silhouette; the card stays unpublished until a real photo is set.
  photoIsPlaceholder?: boolean;
  knowsAbout?: string[];
}
