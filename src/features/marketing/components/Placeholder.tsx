import React from 'react';

// Unresolved copy from the placeholder register, kept visible until confirmed.
export const Placeholder: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline rounded border border-dashed border-amber-400 bg-amber-50 px-1.5 py-0.5 font-mono text-[11px] text-amber-800">
    {children}
  </span>
);

// Renders text, turning any [[TBI: …]] / [[TBC: …]] segment into a Placeholder.
export const WithPlaceholders: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text.split(/(\[\[[\s\S]*?\]\])/).map((part, i) =>
      part.startsWith('[[') ? <Placeholder key={i}>{part}</Placeholder> : <React.Fragment key={i}>{part}</React.Fragment>
    )}
  </>
);
