/** Service copy and enquiry context. Media paths are local; apply withBase at render time. */
export const STORY_FORMATS = [
  {
    id: 'guided-tours', name: 'Guided 3D Tours', short: 'Let people find their own way in.',
    description: 'Give visitors a clear route through your place, with room to stop, look around and explore the details that matter to them.',
    image: '/media/tour/1.jpg', imageAlt: 'Computer lab seen inside a captured 3D space',
    imageCaption: 'Still from a captured computer lab',
    includes: ['A route through selected spaces', 'Viewpoints and information at useful stops', 'A clear next step, such as an enquiry or visit'],
    ideal: 'Campus introductions, hotel visits and property walkthroughs.',
    specs: 'Browser-based 3D. Agree the supported devices, hosting period, stops and any narration in the proposal.',
  },
  {
    id: 'films', name: 'Cinematic Fly-Through Films', short: 'Choose the pace. Shape the story.',
    description: 'Lead your audience through a captured place with considered camera movement, an edited sequence and a clear beginning and end.',
    image: '/media/hero.jpg', imageAlt: 'The Chilancho Stupa courtyard in a 3D capture',
    imageCaption: 'Chilancho Stupa capture excerpt',
    includes: ['A storyboard and virtual camera route', 'An edited film for your chosen channel', 'Sound, titles and narration where agreed'],
    ideal: 'Website introductions, presentations and launch campaigns.',
    specs: 'Agree runtime, codec, aspect ratio and output resolution after reviewing the source capture. Music and voice rights are part of the scope.',
  },
  {
    id: 'social', name: 'Social Media Content', short: 'A place, seen in a moment.',
    description: 'Build a focused set of short clips and stills around the details your audience will want to see, sized for the channels you use.',
    image: '/media/hero.jpg', imageAlt: 'Architectural detail around the captured Chilancho courtyard',
    imageCaption: 'Capture imagery; social edits are scoped separately',
    includes: ['A selection of moments and story hooks', 'Short edits or stills for agreed placements', 'Space for captions and your brand identity'],
    ideal: 'Social campaigns, open-day invitations and seasonal updates.',
    specs: 'Vertical, square or widescreen compositions can be planned. Confirm the number of edits, lengths and channel requirements before production.',
  },
  {
    id: 'exhibitions', name: 'Exhibition & Event Displays', short: 'Bring the place to the room.',
    description: 'Help an audience experience a distant place through a display film or an interactive presentation suited to the event setting.',
    image: '/media/tour/2.jpg', imageAlt: 'Another view into a captured computer lab',
    imageCaption: 'Capture imagery; event setup is project-specific',
    includes: ['A presentation concept for the venue', 'Media sized for the agreed display', 'Playback requirements and a device review'],
    ideal: 'Exhibitions, admissions events and property presentations.',
    specs: 'Confirm screen dimensions, playback hardware, connectivity and staffing. Offline kiosks and headset experiences require separate feasibility and device testing.',
  },
  {
    id: 'change-over-time', name: 'Change Over Time', short: 'Make the difference visible.',
    description: 'Plan repeat captures so people can compare a place at meaningful milestones, with dates and viewpoints that give the changes context.',
    image: '/media/hero.jpg', imageAlt: 'Chilancho Stupa capture used for the comparison concept',
    imageCaption: 'Single-capture concept; no dated comparison supplied',
    includes: ['A repeat-capture and viewpoint plan', 'Clearly labelled dates and milestones', 'A comparison presentation suited to the record'],
    ideal: 'Renovation records, construction updates and conservation stories.',
    specs: 'Comparable viewpoints and capture conditions must be planned. Visual comparisons alone do not establish survey or coordinate accuracy.',
  },
] as const;

export type StoryFormatId = typeof STORY_FORMATS[number]['id'];
export function storytellingFormat(value: string | null) {
  return STORY_FORMATS.find(format => format.id === value);
}
export function storytellingEnquiry(id?: StoryFormatId) {
  return `/contact/?type=storytelling${id ? `&format=${encodeURIComponent(id)}` : ''}#form`;
}

/** The two independent tab groups use automatic activation and roving focus. */
export function nextStoryTab(key: string, current: number, length: number) {
  if (key === 'Home') return 0;
  if (key === 'End') return length - 1;
  if (key === 'ArrowRight') return (current + 1) % length;
  if (key === 'ArrowLeft') return (current + length - 1) % length;
  return null;
}

export const STORY_AUDIENCES = [
  { id: 'hotel', name: 'Hotels', examples: ['A guest choosing a stay, or a planner finding a venue.', 'The atmosphere of arriving and feeling welcome.', 'The room, the courtyard and the spaces between them.', 'Ask about a stay or arrange a visit.'] },
  { id: 'education', name: 'Education', examples: ['A prospective student and the family helping them decide.', 'Curiosity about learning and confidence in the setting.', 'Classrooms, labs and the places used every day.', 'Explore the course offer or book a campus visit.'] },
  { id: 'property', name: 'Property', examples: ['A buyer or tenant exploring an existing property from afar.', 'A clear sense of the layout, light and character.', 'How rooms connect and the details worth seeing in person.', 'Request more information or arrange a viewing.'] },
] as const;

export const STORY_QUESTIONS = [
  { question: 'Who is watching?', reason: 'Start with the person, not the camera.' },
  { question: 'What should they feel?', reason: 'Let the mood guide the pace and sound.' },
  { question: 'What should they notice?', reason: 'Give the important details their moment.' },
  { question: 'What should they do next?', reason: 'Make the next step easy to find.' },
] as const;
