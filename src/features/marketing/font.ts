import { Comfortaa } from 'next/font/google';

// The rcaas.tech face, served from this site by next/font (no request to Google
// from visitors). Put `comfortaa.variable` on the .rcaas wrapper: rcaas.css reads
// --font-comfortaa. JetBrains Mono comes from the root layout (--font-ui).
export const comfortaa = Comfortaa({ subsets: ['latin'], variable: '--font-comfortaa', display: 'swap' });
