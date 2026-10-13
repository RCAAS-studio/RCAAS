import React, { useState, useEffect, useRef } from 'react';

// Rotating phrase set
const PHRASES = [
  'move people.',
  'sell spaces.',
  'stay with you.',
];

// Longest phrase used to pre-reserve width and prevent layout shift (zero CLS)
const LONGEST_PHRASE = 'stay with you.';

// Calibrated calm timing
const TYPE_SPEED_MS = 45;       // ~45 ms per character
const HOLD_DURATION_MS = 2500;  // hold each phrase for ~2.5 seconds
const DELETE_SPEED_MS = 25;     // delete faster at ~25 ms per character
const PAUSE_BEFORE_NEXT_MS = 280; // calm breathing pause before next word

export const TypewriterHeroPhrase: React.FC = () => {
  const [displayText, setDisplayText] = useState('move people.');
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Animation state refs (immune to re-render latency and race conditions)
  const currentTextRef = useRef('move people.');
  const phraseIndexRef = useRef(0);
  const phaseRef = useRef<'typing' | 'holding' | 'deleting' | 'paused'>('holding');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isHiddenRef = useRef<boolean>(false);

  // Check for reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => {
      setIsReducedMotion(event.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', listener);
    } else {
      mediaQuery.addListener(listener);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', listener);
      } else {
        mediaQuery.removeListener(listener);
      }
    };
  }, []);

  // Main calm typewriter state-machine loop
  useEffect(() => {
    // If visitor has enabled "reduce motion", show the final phrase statically with no animation
    if (isReducedMotion) {
      const finalPhrase = PHRASES[PHRASES.length - 1]; // "stay with you."
      setDisplayText(finalPhrase);
      currentTextRef.current = finalPhrase;
      return;
    }

    let isDisposed = false;

    const scheduleNext = (delayMs: number) => {
      if (isDisposed) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (!isDisposed && !isHiddenRef.current) {
          step();
        }
      }, delayMs);
    };

    const step = () => {
      if (isDisposed || isHiddenRef.current) return;

      const targetPhrase = PHRASES[phraseIndexRef.current];

      switch (phaseRef.current) {
        case 'typing': {
          if (currentTextRef.current.length < targetPhrase.length) {
            const nextLength = currentTextRef.current.length + 1;
            const nextText = targetPhrase.slice(0, nextLength);
            currentTextRef.current = nextText;
            setDisplayText(nextText);
            scheduleNext(TYPE_SPEED_MS);
          } else {
            // Full phrase typed: hold calmly for 2.5s
            phaseRef.current = 'holding';
            scheduleNext(HOLD_DURATION_MS);
          }
          break;
        }

        case 'holding': {
          // Transition from holding to deleting
          phaseRef.current = 'deleting';
          scheduleNext(DELETE_SPEED_MS);
          break;
        }

        case 'deleting': {
          if (currentTextRef.current.length > 0) {
            const nextText = currentTextRef.current.slice(0, -1);
            currentTextRef.current = nextText;
            setDisplayText(nextText);
            scheduleNext(DELETE_SPEED_MS);
          } else {
            // Deleted completely: transition to brief pause before typing next
            phaseRef.current = 'paused';
            scheduleNext(PAUSE_BEFORE_NEXT_MS);
          }
          break;
        }

        case 'paused': {
          // Advance to next phrase and begin typing
          phraseIndexRef.current = (phraseIndexRef.current + 1) % PHRASES.length;
          phaseRef.current = 'typing';
          scheduleNext(TYPE_SPEED_MS);
          break;
        }
      }
    };

    // Pause animation when the browser tab is hidden to save battery & CPU
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isHiddenRef.current = true;
        if (timerRef.current) clearTimeout(timerRef.current);
      } else {
        isHiddenRef.current = false;
        // Resume smoothly from current state
        scheduleNext(120);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial hold on the first phrase ("move people.") before deleting and rotating
    phaseRef.current = 'holding';
    scheduleNext(HOLD_DURATION_MS);

    return () => {
      isDisposed = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isReducedMotion]);

  // If visitor has enabled "reduce motion", render the final phrase static with no animation
  if (isReducedMotion) {
    return (
      <span className="block mt-1 sm:mt-0 sm:inline-block font-bold text-accent">
        {PHRASES[PHRASES.length - 1]}
      </span>
    );
  }

  return (
    <span
      className="grid mt-1 sm:mt-0 sm:inline-grid grid-cols-1 grid-rows-1 justify-items-center sm:justify-items-start align-baseline relative font-bold text-accent"
      aria-hidden="true"
    >
      {/* 
        Phantom Reservation Layer:
        Reserves the width of the longest phrase ("stay with you.")
        preventing any layout jump (CLS score = 0) and avoiding button movement below.
      */}
      <span
        className="invisible pointer-events-none select-none col-start-1 row-start-1 inline-flex items-baseline font-bold"
        aria-hidden="true"
      >
        <span>{LONGEST_PHRASE}</span>
      </span>

      {/* Visible Active Typewriter Layer */}
      <span className="col-start-1 row-start-1 inline-flex items-baseline whitespace-nowrap font-bold text-accent">
        <span>{displayText}</span>
      </span>
    </span>
  );
};
