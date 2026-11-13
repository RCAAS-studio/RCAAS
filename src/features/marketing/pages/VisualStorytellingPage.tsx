import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowUpRight, Compass, Film, MessageCircle, Monitor, Smartphone, SplitSquareHorizontal } from 'lucide-react';
import type { RoutePath } from '../types';
import { withBase } from '../../../lib/basePath';
import { SITE_METADATA } from '../data/siteData';
import { STORY_AUDIENCES, STORY_FORMATS, STORY_QUESTIONS, nextStoryTab, storytellingEnquiry, storytellingFormat } from '../content/storytelling';
import { StorytellingShowcase } from '../components/StorytellingShowcase';
import { StoryComparison } from '../components/StoryComparison';
import '../storytelling.css';

interface Props { onNavigate: (path: RoutePath) => void }
const FORMAT_ICONS = [Compass, Film, Smartphone, Monitor, SplitSquareHorizontal];
const PROCESS = [
  { title: 'Discover the goal', text: 'Define the audience, the story and the action you want to invite. Agree a scope, budget and plan.' },
  { title: 'Capture the place', text: 'Plan access, permissions and suitable capture conditions. Coordinate the visit around the people using your space.' },
  { title: 'Create the experience', text: 'Shape the camera route, sequence and content around the brief. Add sound, titles or narration where agreed.' },
  { title: 'Review and deliver', text: 'Review the work together, check the agreed devices and channels, and hand over the approved outputs and publishing guidance.' },
];
const FAQS = [
  { question: 'Is the film above a finished client campaign?', answer: 'It is a short, silent excerpt from the Chilancho Stupa capture. It shows a real captured place, not a commissioned hotel film or a complete edited campaign.' },
  { question: 'Can one capture support several formats?', answer: 'Often, yes. A suitable capture can support camera sequences, stills and an interactive experience. We review the source and agree which outputs it can support before committing to the scope.' },
  { question: 'What resolution, languages and delivery time can we choose?', answer: 'These depend on the capture, production brief and available resources. We agree resolution, runtime, aspect ratios, narration languages, revisions and delivery dates in the proposal. The sample on this page is not a 4K master.' },
  { question: 'What about media rights and hosting?', answer: 'Site access and permission to publish need to be agreed before capture. The proposal should specify usage rights, music and voice licensing, hosting duration and the files included in the handover.' },
];

export const VisualStorytellingPage: React.FC<Props> = ({ onNavigate }) => {
  const [activeFormat, setActiveFormat] = useState(0);
  const [audience, setAudience] = useState(0);
  const selected = STORY_FORMATS[activeFormat];

  // Retain the old deep links while moving the lengthy format list into tabs.
  useEffect(() => {
    const readHash = () => {
      const format = storytellingFormat(window.location.hash.slice(1));
      if (format) {
        setActiveFormat(STORY_FORMATS.findIndex(item => item.id === format.id));
        requestAnimationFrame(() => document.getElementById('capabilities')?.scrollIntoView());
      }
    };
    readHash(); window.addEventListener('hashchange', readHash);
    return () => window.removeEventListener('hashchange', readHash);
  }, []);

  const link = (path: string) => ({
    href: withBase(path),
    onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); onNavigate(path as RoutePath);
    },
  });
  const tabKeys = (event: React.KeyboardEvent, current: number, count: number, prefix: string, select: (index: number) => void) => {
    const next = nextStoryTab(event.key, current, count);
    if (next === null) return;
    event.preventDefault(); select(next); document.getElementById(`${prefix}-${next}`)?.focus();
  };

  return (
    <article className="story-page" aria-labelledby="story-title">
      <header className="story-hero story-wrap">
        <nav className="story-breadcrumb" aria-label="Breadcrumb"><ol>
          <li><a {...link('/')}>Home</a></li><li><a {...link('/services/')}>What we create</a></li><li aria-current="page">Visual storytelling</li>
        </ol></nav>
        <p className="story-service">Visual storytelling</p>
        <div className="story-hero-intro">
          <h1 id="story-title">Real places.<br />Remarkable stories.</h1>
          <div className="story-hero-brief">
            <p>Turn captured spaces into cinematic films, guided experiences, and content that moves your audience.</p>
            <div className="story-actions">
              <a {...link(storytellingEnquiry())} className="story-button story-button-accent">Discuss your project <ArrowUpRight size={18} aria-hidden="true" /></a>
              <a href="#showcase" className="story-text-link">Explore our work <ArrowDown size={17} aria-hidden="true" /></a>
            </div>
          </div>
        </div>
        <figure className="story-hero-media">
          <img src={withBase('/media/hero.jpg')} alt="A view through the captured brick courtyard towards Chilancho Stupa in Kirtipur"
            width="1600" height="900" fetchPriority="high" decoding="async" data-fx="seen" />
          <figcaption><span>Chilancho Stupa, Kirtipur</span><span>Still from a 3D capture</span></figcaption>
        </figure>
        <div className="story-hero-foot"><p>One place. More ways to share it.</p><a href="#capabilities">Find your format <ArrowDown size={16} aria-hidden="true" /></a></div>
      </header>

      <nav className="story-section-nav" aria-label="On this page"><div className="story-wrap">
        <a href="#showcase">The experience</a><a href="#capabilities">Formats</a><a href="#why-story">The story</a><a href="#evidence">The work</a><a href="#process">Our process</a>
      </div></nav>

      <section id="showcase" className="story-section story-surface" aria-labelledby="showcase-title">
        <div className="story-wrap">
          <div className="story-section-heading"><h2 id="showcase-title">See what reality capture<br className="story-desktop-break" /> makes possible.</h2><p>Watch a real capture in motion, then explore the published 3D experience. Two ways into Chilancho Stupa, from our in-house research.</p></div>
          <StorytellingShowcase />
        </div>
      </section>

      <section id="capabilities" className="story-section story-wrap" aria-labelledby="formats-title">
        <div className="story-section-heading"><h2 id="formats-title">A format for<br />your next chapter.</h2><p>Start with where your story will be seen. We’ll shape the right combination around your place, audience and brief.</p></div>
        <div className="story-format-tabs" role="tablist" aria-label="Storytelling format">
          {STORY_FORMATS.map((format, index) => {
            const Icon = FORMAT_ICONS[index];
            return <button type="button" role="tab" id={`format-tab-${index}`} aria-controls={`format-panel-${index}`}
              aria-selected={activeFormat === index} tabIndex={activeFormat === index ? 0 : -1} key={format.id}
              onClick={() => setActiveFormat(index)} onKeyDown={event => tabKeys(event, index, STORY_FORMATS.length, 'format-tab', setActiveFormat)}>
              <Icon size={23} strokeWidth={1.5} aria-hidden="true" /><span>{format.name}</span><span className="story-format-hint">{format.short}</span>
            </button>;
          })}
        </div>
        {STORY_FORMATS.map((format, index) => (
          <div key={format.id} role="tabpanel" id={`format-panel-${index}`} aria-labelledby={`format-tab-${index}`} hidden={activeFormat !== index} tabIndex={0}>
            {activeFormat === index && <div className="story-format-detail" id={format.id}>
              <figure className="story-format-image"><img src={withBase(format.image)} alt={format.imageAlt} width="1600" height="900" loading="lazy" decoding="async" data-fx="seen" /><figcaption>{format.imageCaption}</figcaption></figure>
              <div className="story-format-copy"><h3>{format.name}</h3><p>{format.description}</p><h4>What we plan together</h4><ul>{format.includes.map(item => <li key={item}>{item}</li>)}</ul><p className="story-ideal"><strong>Ideal for</strong> {format.ideal}</p>
                <details className="story-specs"><summary>Production details</summary><p>{format.specs}</p></details>
                <a {...link(storytellingEnquiry(format.id))} className="story-button story-button-dark">Discuss this format <ArrowUpRight size={17} aria-hidden="true" /><span className="sr-only">: {format.name}</span></a>
              </div>
            </div>}
          </div>
        ))}
        {selected.id === 'change-over-time' && <div className="story-comparison-layout"><div><h3>Plan a meaningful comparison.</h3><p>A useful before/after story needs the same place, recorded at known moments. This concept shows how a reveal can work while we plan a genuine repeat-capture example.</p></div><StoryComparison /></div>}
        <p className="story-scope-note">Each project has its own agreed outputs, permissions and delivery plan. The imagery above illustrates the capture source, rather than a complete example of every format.</p>
      </section>

      <section id="why-story" className="story-section story-dark" aria-labelledby="why-title"><div className="story-wrap">
        <div className="story-section-heading"><h2 id="why-title">A good story starts<br />with better questions.</h2><p>Before choosing a camera path, we decide what the journey needs to say. See how the same four questions shape different briefs.</p></div>
        <div id="industries" className="story-audience-tabs" role="tablist" aria-label="Example audience">
          {STORY_AUDIENCES.map((item, index) => <button type="button" role="tab" id={`audience-tab-${index}`} aria-controls={`audience-panel-${index}`} aria-selected={audience === index}
            tabIndex={audience === index ? 0 : -1} onClick={() => setAudience(index)} key={item.id}
            onKeyDown={event => tabKeys(event, index, STORY_AUDIENCES.length, 'audience-tab', setAudience)}>{item.name}</button>)}
        </div>
        {STORY_AUDIENCES.map((item, index) => <div role="tabpanel" id={`audience-panel-${index}`} aria-labelledby={`audience-tab-${index}`} hidden={audience !== index} tabIndex={0} key={item.id}>
          <dl className="story-questions">{STORY_QUESTIONS.map((question, questionIndex) => <div key={question.question}>
            <dt>{question.question}<span>{question.reason}</span></dt><dd>{item.examples[questionIndex]}</dd>
          </div>)}</dl>
        </div>)}
        <p className="story-audience-note">Illustrative project briefs, rather than client outcomes or predictions.</p>
      </div></section>

      <section id="evidence" className="story-section story-wrap" aria-labelledby="evidence-title">
        <div className="story-section-heading"><h2 id="evidence-title">A real place.<br />A starting point for stories.</h2><p>The Chilancho Stupa capture is an in-house RCAAS research project. The excerpt and existing interactive viewer above are the available evidence.</p></div>
        <div className="story-evidence">
          <figure><img src={withBase('/media/hero.jpg')} alt="Brick stupas and carved architectural details in the Chilancho capture" width="1600" height="900" loading="lazy" decoding="async" data-fx="seen" /><figcaption>Chilancho Stupa · Kirtipur, Kathmandu Valley</figcaption></figure>
          <div><p className="story-service">Heritage research</p><h3>Chilancho Stupa</h3><dl><div><dt>The objective</dt><dd>Record the place in 3D so its form and architectural detail can be explored.</dd></div><div><dt>The available work</dt><dd>A captured model in the existing XGRIDS viewer and a short camera-move excerpt.</dd></div><div><dt>The next possibility</dt><dd>A story-led edit, with interpretation and approved context shaped around an audience.</dd></div></dl><a href="#showcase" className="story-text-link">See the capture <ArrowUpRight size={17} aria-hidden="true" /></a></div>
        </div>
      </section>

      <section id="process" className="story-section story-surface" aria-labelledby="process-title"><div className="story-wrap">
        <div className="story-section-heading"><h2 id="process-title">From the first idea<br />to the final experience.</h2><p>A shared brief keeps the work focused. Access, production, review and delivery are planned around your project.</p></div>
        <ol className="story-process">{PROCESS.map((step, index) => <li key={step.title}><span aria-hidden="true">0{index + 1}</span><h3>{step.title}</h3><p>{step.text}</p></li>)}</ol>
      </div></section>

      <section id="faq" className="story-section story-wrap story-faq" aria-labelledby="faq-title"><h2 id="faq-title">A few useful details.</h2><div>{FAQS.map(item => <details key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div></section>

      <section id="project-enquiry" className="story-conversion" aria-labelledby="enquiry-title"><div className="story-wrap">
        <p className="story-service">Let’s make something worth exploring.</p><h2 id="enquiry-title">Let’s turn your place into an experience worth sharing.</h2>
        <p>Tell us about the place, who you want to reach and where the story will live. We’ll help turn that into a clear project brief.</p>
        <div className="story-enquiry-controls"><label htmlFor="story-enquiry-format">I’m interested in</label><select id="story-enquiry-format" value={selected.id} onChange={event => setActiveFormat(STORY_FORMATS.findIndex(item => item.id === event.target.value))}>{STORY_FORMATS.map(format => <option key={format.id} value={format.id}>{format.name}</option>)}</select></div>
        <div className="story-actions"><a {...link(storytellingEnquiry(selected.id))} className="story-button story-button-accent">Send a project enquiry <ArrowUpRight size={18} aria-hidden="true" /></a><a href={SITE_METADATA.whatsappUrl} target="_blank" rel="noopener noreferrer" className="story-button story-button-outline"><MessageCircle size={18} aria-hidden="true" />Chat on WhatsApp<span className="sr-only"> in a new tab</span></a></div>
        <nav className="story-related" aria-label="Related services and work"><a {...link('/services/immersive-experiences/3d-virtual-tours/')}>Explore 3D virtual tours <ArrowUpRight size={15} aria-hidden="true" /></a><a {...link('/work/')}>Browse our work <ArrowUpRight size={15} aria-hidden="true" /></a></nav>
      </div></section>
    </article>
  );
};
