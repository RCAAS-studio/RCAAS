import { submitLead } from '../../../lib/api';

/** Every form on these pages files an enquiry with the API (POST /api/leads,
 *  server/src/routes/leads.js). It belongs to no project, so it is emailed to
 *  LEADS_TO and listed for admins (GET /api/leads). The API needs a name and a
 *  phone or email that look real (the forms check first: lib/contactRules.ts), and drops a filled honeypot (`website`) or a too-fast form silently.
 *  `details` become the message, one "Label: value" line each. */
export function sendLead(form: string, renderedAt: number, lead: {
  name: string;
  phone: string;
  email?: string;
  requirement?: string;
  dates?: string;
  website?: string;
  details: Record<string, string>;
}) {
  const message = Object.entries(lead.details)
    .filter(([, value]) => value.trim())
    .map(([label, value]) => `${label}: ${value.trim()}`)
    .join('\n');
  return submitLead({
    sceneId: 'hub',
    sceneName: `rcaas.tech ${form}`,
    name: lead.name,
    phone: lead.phone,
    email: lead.email ?? '',
    requirement: (lead.requirement ?? '').slice(0, 200),
    dates: (lead.dates ?? '').slice(0, 100),
    message: message.slice(0, 2000),
    website: lead.website ?? '',
    formRenderedAt: renderedAt
  });
}
