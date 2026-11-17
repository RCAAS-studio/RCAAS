'use client';

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import { flushSync } from 'react-dom';
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Pause, Play } from 'lucide-react';
import { withBase } from '../../../../lib/basePath';
import { srcSetFor } from '../../data/images';
import { INDUSTRIES } from '../../data/siteData';
import type { RoutePath } from '../../types';
import { INDUSTRY_IMAGES } from '../data';
import type { HomePageProps } from '../types';
import styles from './IndustriesSection.module.css';

const COUNT = INDUSTRIES.length;
const wrap = (index: number) => (index + COUNT) % COUNT;
const AUTO_PIXELS_PER_SECOND = 24;

export function IndustriesSection({ onNavigate }: Pick<HomePageProps, 'onNavigate'>) {
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inView, setInView] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const viewport = useRef<HTMLDivElement>(null);
  const pointer = useRef<{ id: number; x: number; y: number } | null>(null);
  const suppressClick = useRef(false);
  const progress = useRef(0);

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const motionChanged = () => { setReducedMotion(preference.matches); if (preference.matches) setPlaying(false); };
    const visibilityChanged = () => setHidden(document.hidden);
    motionChanged(); visibilityChanged();
    preference.addEventListener('change', motionChanged);
    document.addEventListener('visibilitychange', visibilityChanged);
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.25 });
    if (viewport.current) observer.observe(viewport.current);
    return () => { observer.disconnect(); preference.removeEventListener('change', motionChanged); document.removeEventListener('visibilitychange', visibilityChanged); };
  }, []);

  useEffect(() => {
    if (!playing || hovered || focused || !inView || hidden || reducedMotion) return;
    const stage = viewport.current;
    if (!stage) return;
    let frame = 0, previousTime: number | null = null;
    let distance = 1;
    const measure = () => {
      const panel = stage.querySelector<HTMLElement>('[data-industry-slide]');
      const gap = Number.parseFloat(getComputedStyle(stage).getPropertyValue('--industry-gap')) || 0;
      distance = Math.max(1, (panel?.offsetWidth || 650) + gap);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    const advance = (time: number) => {
      if (previousTime !== null) progress.current += Math.min(time - previousTime, 64) * AUTO_PIXELS_PER_SECOND / (distance * 1000);
      previousTime = time;
      if (progress.current >= 0.5) {
        progress.current -= 1;
        // Commit the nearest slide and its offset together before paint: the loop never jumps.
        flushSync(() => { setActive(index => wrap(index + 1)); setExpanded(false); });
      }
      stage.style.setProperty('--industry-progress', String(progress.current));
      frame = requestAnimationFrame(advance);
    };
    frame = requestAnimationFrame(advance);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, [playing, hovered, focused, inView, hidden, reducedMotion]);

  const select = (index: number, reveal = false) => {
    setPlaying(false);
    progress.current = 0;
    viewport.current?.style.setProperty('--industry-progress', '0');
    setActive(wrap(index));
    setExpanded(reveal);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const next = event.key === 'ArrowRight' ? wrap(active + 1)
      : event.key === 'ArrowLeft' ? wrap(active - 1)
        : event.key === 'Home' ? 0 : event.key === 'End' ? COUNT - 1 : null;
    if (next === null) return;
    event.preventDefault();
    select(next);
    viewport.current?.focus({ preventScroll: true });
  };
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary || event.button !== 0) return;
    suppressClick.current = false;
    if ((event.target as Element).closest('[data-industry-action]')) return;
    setPlaying(false);
    pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointer.current;
    if (!start || start.id !== event.pointerId) return;
    const dx = Math.abs(event.clientX - start.x), dy = Math.abs(event.clientY - start.y);
    if (dx > 10 && dx > dy && !event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointer.current;
    pointer.current = null;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x, dy = event.clientY - start.y;
    if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      suppressClick.current = true;
      event.preventDefault();
      select(active + (dx < 0 ? 1 : -1));
    }
  };

  return (
    <section id="industries" aria-labelledby="industries-heading" className="relative overflow-hidden py-24 sm:py-28 bg-ink"
      onFocusCapture={event => setFocused(!(event.target as Element).closest('[data-industry-rotation]'))}
      onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); }}>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-14">
          <span className="text-xs font-mono uppercase tracking-wider text-accent-soft font-semibold">Industry Solutions</span>
          <h2 id="industries-heading" className="text-2xl sm:text-3xl md:text-4xl mt-2 font-bold tracking-tight text-white font-display">Built around your goal</h2>
          <p className="mt-4 text-base text-zinc-300 leading-relaxed">Tell us what you want people to do. We will design the experience around it.</p>
        </div>
        <div className={styles.toolbar}
          onPointerEnter={event => { if (event.pointerType === 'mouse') setHovered(true); }}
          onPointerLeave={event => { if (event.pointerType === 'mouse') setHovered(false); }}>
          <label className={styles.chooser} htmlFor="industry-picker">
            <span>Choose an industry</span>
            <span className={styles.selectWrap}>
              <select id="industry-picker" value={active} onChange={event => select(Number(event.target.value))} aria-controls="industry-filmstrip">
                {INDUSTRIES.map((industry, index) => <option value={index} key={industry.id}>{industry.title}</option>)}
              </select>
              <ChevronDown size={16} aria-hidden="true" />
            </span>
          </label>
          <div className={styles.navigation}>
            <p className={styles.position} aria-live={playing ? 'off' : 'polite'} aria-atomic="true">
              {String(active + 1).padStart(2, '0')} <span>/ {COUNT}</span>
              <span className="sr-only">: {INDUSTRIES[active].title}</span>
            </p>
            <button type="button" className={styles.arrow} data-industry-rotation="" aria-label={playing ? 'Pause automatic industry slides' : 'Play automatic industry slides'} aria-describedby="industry-motion-note" disabled={reducedMotion} onClick={() => setPlaying(value => !value)}>
              {playing ? <Pause size={17} aria-hidden="true" /> : <Play size={17} aria-hidden="true" />}
            </button>
            <button type="button" className={styles.arrow} aria-label="Previous industry" aria-controls="industry-filmstrip" onClick={() => select(active - 1)}><ArrowLeft size={19} aria-hidden="true" /></button>
            <button type="button" className={styles.arrow} aria-label="Next industry" aria-controls="industry-filmstrip" onClick={() => select(active + 1)}><ArrowRight size={19} aria-hidden="true" /></button>
          </div>
        </div>
        <p id="industry-instructions" className="sr-only">Use the left and right arrow keys to change industry, Home for the first, or End for the last. You can also swipe the photograph, choose an industry above, or reveal its details.</p>
        <div id="industry-filmstrip" ref={viewport} className={styles.viewport} data-auto-moving={playing && !hovered && !focused && inView && !hidden && !reducedMotion} role="region" aria-roledescription="carousel" aria-label="Industry photographs" aria-describedby="industry-instructions" tabIndex={0}
          onPointerEnter={event => { if (event.pointerType === 'mouse') setHovered(true); }}
          onPointerLeave={event => { if (event.pointerType === 'mouse') setHovered(false); }}
          onKeyDown={onKeyDown} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
          onPointerCancel={() => { pointer.current = null; suppressClick.current = false; }}
          onClickCapture={event => {
            if (event.detail !== 0 && suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; }
          }}>
          {INDUSTRIES.map((industry, index) => {
            // Circular offsets keep neighbours close across the last/first boundary.
            const offset = (index - active + COUNT + Math.floor(COUNT / 2)) % COUNT - Math.floor(COUNT / 2);
            const selected = index === active, near = Math.abs(offset) <= 2;
            const open = selected && expanded;
            const image = INDUSTRY_IMAGES[industry.id];
            return (
              <article key={industry.id} className={styles.panel} data-industry-slide={industry.id} data-active={selected} data-near={near}
                style={{ '--industry-offset': offset } as CSSProperties}
                role="group" aria-roledescription="slide" aria-label={(index + 1) + ' of ' + COUNT + ': ' + industry.title} aria-hidden={!near} inert={!near}
                onPointerEnter={event => { if (selected && event.pointerType === 'mouse') setExpanded(true); }}
                onPointerLeave={event => { if (selected && event.pointerType === 'mouse') setExpanded(false); }}
                onFocusCapture={event => { if (selected && (event.target as HTMLElement).matches(':focus-visible')) select(index, true); }}
                onBlurCapture={event => { if (selected && !event.currentTarget.contains(event.relatedTarget as Node | null)) setExpanded(false); }}>
                {image && <img className={styles.photo} src={image.src} srcSet={srcSetFor(image.src)} sizes="(max-width: 639px) calc(100vw - 88px), (max-width: 1200px) 54vw, 650px" alt="" loading="lazy" decoding="async" draggable={false} />}
                <button type="button" className={styles.photoButton} tabIndex={selected ? 0 : -1}
                  aria-label={(selected ? 'Reveal details for ' : 'Select ') + industry.title}
                  aria-controls={'industry-details-' + industry.id} aria-expanded={open}
                  onClick={() => select(index, !(selected && expanded))} />
                <div className={styles.caption}>
                  <h3>{industry.title}</h3>
                  <p className={styles.goal}>{industry.goalHeadline}</p>
                  <div id={'industry-details-' + industry.id} className={styles.details} data-open={open} aria-hidden={!open} data-industry-action="">
                    <div><p>{industry.summary}</p><p className={styles.audience}>For {industry.whoItsFor}</p></div>
                  </div>
                  <div className={styles.actions}>
                    <a href={withBase(industry.link)} tabIndex={selected ? 0 : -1} data-industry-action="" data-industry-link=""
                      onClick={event => {
                        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                        event.preventDefault(); onNavigate(industry.link as RoutePath);
                      }}>Explore industry <ArrowRight size={17} aria-hidden="true" /><span className="sr-only">: {industry.title}</span></a>
                    <button type="button" tabIndex={selected ? 0 : -1} data-industry-action="" aria-expanded={open} aria-controls={'industry-details-' + industry.id} onClick={() => select(index, !(selected && expanded))}>
                      {open ? 'Less detail' : 'Details'} {open ? <ChevronUp size={15} aria-hidden="true" /> : <ChevronDown size={15} aria-hidden="true" />}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        <p id="industry-motion-note" className={styles.motionNote}>{reducedMotion ? 'Automatic motion is off for reduced motion.' : playing ? (hovered || focused ? 'Paused while you explore.' : 'Slow continuous motion. Pause whenever you like.') : 'Automatic motion paused. Explore at your own pace.'}</p>
        <noscript><ul className={styles.noScriptList}>{INDUSTRIES.map(industry => <li key={industry.id}><a href={withBase(industry.link)}>{industry.title}</a><p>{industry.summary}</p></li>)}</ul></noscript>
      </div>
    </section>
  );
}
