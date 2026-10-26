import { z } from 'zod';

/** A visitor's phone and email, checked before a form sends them. The API
 *  checks the same (server/src/notify.js validPhone/validEmail), so keep the
 *  two in step; these messages are also the API's, and the tour translates
 *  them (i18n.ts). */
export const PHONE_WRONG = 'That phone number doesn’t look right. Use digits, with + and the country code if it isn’t a Nepali number.';
export const EMAIL_WRONG = 'That email address doesn’t look right.';

// Digits with the marks people write them with; 7 to 15 digits (E.164's most).
const phone = z.string().trim()
  .regex(/^\+?[\d\s().-]+$/, PHONE_WRONG)
  .refine((s) => { const n = s.replace(/\D/g, '').length; return n >= 7 && n <= 15; }, PHONE_WRONG);
// Optional on most forms: empty is fine, anything typed must be an address.
const email = z.union([z.literal(''), z.email(EMAIL_WRONG)], { error: EMAIL_WRONG });

const first = (r: { success: boolean; error?: z.ZodError }) => (r.success ? '' : r.error!.issues[0].message);

/** What's wrong with it, or '' when it will do. */
export const phoneProblem = (s: string) => first(phone.safeParse(s));
export const emailProblem = (s: string) => first(email.safeParse(s.trim()));

/** A form's phone and optional email. Call it after the form's own
 *  "name and phone are required" check. */
export const contactProblem = (v: { phone?: string; email?: string }) => phoneProblem(v.phone ?? '') || emailProblem(v.email ?? '');

/** The website's one "phone or email" box: an email if it has an @, else a phone. */
export const reachProblem = (reach: string) => (reach.includes('@') ? emailProblem(reach) : phoneProblem(reach));
