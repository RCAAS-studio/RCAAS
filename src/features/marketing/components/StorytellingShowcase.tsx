import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Box, Film, Play } from 'lucide-react';
import { withBase } from '../../../lib/basePath';
import { chilanchoStupa } from '../content/work/chilancho-stupa-digital-heritage';
import { nextStoryTab } from '../content/storytelling';

const POSTER = withBase('/media/hero.jpg');
const CLIP = withBase('/media/hero.mp4');
// This existing owner-confirmed experience loads the real capture. SplatEmbed's
// generated canvas remains untouched and is not presented as project evidence.
const VIEWER = chilanchoStupa.embedUrl;

export function StorytellingShowcase() {
  const [mode, setMode] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const [viewer, setViewer] = useState<'idle' | 'loading' | 'opened' | 'slow' | 'unsupported'>('idle');
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (viewer !== 'loading') return;
    const timer = window.setTimeout(() => setViewer('slow'), 15000);
    return () => window.clearTimeout(timer);
  }, [viewer]);

  const loadViewer = () => {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2');
    if (!gl) { setViewer('unsupported'); return; }
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    setViewer('loading');
  };

  const selectMode = (next: number) => {
    video.current?.pause();
    setMode(next);
  };

  return (
    <div className="story-showcase">
      <div className="story-media-tabs" role="tablist" aria-label="Experience type">
        {['Capture film', 'Interactive 3D'].map((label, index) => (
          <button type="button" role="tab" id={`experience-tab-${index}`} aria-controls={`experience-panel-${index}`}
            aria-selected={mode === index} tabIndex={mode === index ? 0 : -1} key={label}
            onClick={() => selectMode(index)}
            onKeyDown={event => {
              const next = nextStoryTab(event.key, index, 2);
              if (next === null) return;
              event.preventDefault(); selectMode(next);
              document.getElementById(`experience-tab-${next}`)?.focus();
            }}>
            {index === 0 ? <Film size={18} aria-hidden="true" /> : <Box size={18} aria-hidden="true" />}{label}
          </button>
        ))}
      </div>

      <div id="experience-panel-0" role="tabpanel" aria-labelledby="experience-tab-0" hidden={mode !== 0}>
        {mode === 0 && (
          <>
            <div className="story-player">
              {videoError ? (
                <div className="story-media-fallback">
                  <img src={POSTER} alt="The Chilancho Stupa courtyard in the captured model" width="1600" height="900" />
                  <div role="status"><p>The clip could not be played here.</p><a href={CLIP}>Open the video file</a></div>
                </div>
              ) : (
                <video ref={video} controls playsInline preload="none" poster={POSTER} width="1600" height="900"
                  aria-label="Chilancho Stupa: silent 3D capture excerpt" aria-describedby="capture-film-description"
                  onError={() => setVideoError(true)}>
                  <source src={CLIP} type="video/mp4" />
                  Your browser cannot play this clip. <a href={CLIP}>Open the video file.</a>
                </video>
              )}
            </div>
            <div className="story-media-caption">
              <div><h3>Chilancho Stupa, Kirtipur</h3><p id="capture-film-description">A short, silent camera move through the captured courtyard and around the stupa. A capture excerpt, rather than a finished campaign film.</p></div>
              <a href={CLIP} target="_blank" rel="noopener noreferrer">Open clip <ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only"> in a new tab</span></a>
            </div>
          </>
        )}
      </div>

      <div id="experience-panel-1" role="tabpanel" aria-labelledby="experience-tab-1" hidden={mode !== 1}>
        {mode === 1 && (
          <>
            <div className="story-player story-viewer-stage">
              {viewer === 'idle' || viewer === 'unsupported' ? (
                <div className="story-viewer-poster">
                  <img src={POSTER} alt="Preview of the Chilancho Stupa capture" width="1600" height="900" loading="lazy" />
                  <div>
                    {viewer === 'unsupported' ? <p role="status">This browser could not start WebGL 2. Watch the capture film or try the viewer on another device.</p> : (
                      <><button type="button" className="story-button story-button-light" onClick={loadViewer}><Play size={18} aria-hidden="true" />Load the 3D experience</button><p>Opens the existing XGRIDS viewer. Loads 3D data after you choose to explore.</p></>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <iframe title="Explore the Chilancho Stupa 3D capture on XGRIDS" src={VIEWER} allow="fullscreen" allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    onLoad={() => setViewer(current => current === 'loading' || current === 'slow' ? 'opened' : current)}
                    onError={() => setViewer('slow')} />
                  {viewer === 'loading' && <p className="story-viewer-status" role="status">Opening the 3D viewer…</p>}
                </>
              )}
            </div>
            <div className="story-media-caption">
              <div><h3>A place you can look around</h3><p role="status">{viewer === 'slow' ? 'The viewer is taking longer than expected. Open it separately, try another connection, or watch the capture film.' : 'The external viewer needs a compatible device and connection. If it stays blank or is difficult to navigate, open it separately or watch the capture film.'}</p></div>
              <a href={VIEWER} target="_blank" rel="noopener noreferrer">Open 3D viewer <ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only"> in a new tab</span></a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
