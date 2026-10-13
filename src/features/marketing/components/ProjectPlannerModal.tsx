import React, { useState } from 'react';
import { SITE_METADATA } from '../data/siteData';
import { sendLead } from '../lib/leads';

interface ProjectPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectPlannerModal: React.FC<ProjectPlannerModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [spaceType, setSpaceType] = useState('Hotels & Tourism');
  const [deliverables, setDeliverables] = useState<string[]>([
    '3D Virtual Tour (Web)',
    '4K Cinematic Fly-Through Film',
  ]);
  const [scaleArea, setScaleArea] = useState('Medium (1,000 – 3,500 m²)');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [renderedAt] = useState(() => Date.now());

  if (!isOpen) return null;

  const toggleDeliverable = (item: string) => {
    if (deliverables.includes(item)) {
      setDeliverables(deliverables.filter((d) => d !== item));
    } else {
      setDeliverables([...deliverables, item]);
    }
  };

  // Files the request with the API (lib/leads.ts).
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      await sendLead('project planner', renderedAt, {
        name: contactName,
        phone: contactPhone,
        email: contactEmail,
        requirement: `Plan your experience: ${spaceType}`,
        details: {
          Organisation: organization,
          'Type of space': spaceType,
          Size: scaleArea,
          Deliverables: deliverables.join(', '),
          Notes: notes,
        },
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-lg border border-line bg-white p-6 sm:p-8 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
          aria-label="Close modal"
        >
          ✕
        </button>

        {!submitted ? (
          <div>
            {/* Header */}
            <div className="mb-6">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-accent">
                Plan Your Experience · Step {step} of 2
              </span>
              <h2 className="mt-1 text-2xl font-bold text-ink font-display">
                {step === 1 ? 'Configure your place & deliverables' : 'Tell us about your project & timeline'}
              </h2>
              <p className="mt-1 text-xs text-zinc-500">
                {step === 1
                  ? 'Select your space classification and required visual assets.'
                  : 'Enter your project details so our engineering team can estimate scanning duration and quotation.'}
              </p>
            </div>

            {step === 1 ? (
              <div className="space-y-6">
                
                {/* Space Type */}
                <div>
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-zinc-700 mb-2">
                    1. Space Classification
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      'Hotels & Tourism',
                      'Education & Campus',
                      'Heritage & Sacred Site',
                      'Real Estate & Villa',
                      'Commercial / Retail',
                      'Factory & Industrial',
                      'Game / Real-time Asset',
                      'Civil / Infrastructure',
                    ].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSpaceType(type)}
                        className={`p-3 text-left rounded-md text-xs border transition-all ${
                          spaceType === type
                            ? 'border-accent bg-rose-50/50 text-accent-strong font-semibold'
                            : 'border-line bg-surface text-zinc-700 hover:border-zinc-400'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Approximate Scale */}
                <div>
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-zinc-700 mb-2">
                    2. Approximate Physical Footprint
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      'Compact (< 1,000 m²)',
                      'Medium (1,000 – 3,500 m²)',
                      'Campus / Large (> 3,500 m²)',
                    ].map((scale) => (
                      <button
                        key={scale}
                        type="button"
                        onClick={() => setScaleArea(scale)}
                        className={`p-2.5 text-center rounded-md text-xs border transition-all ${
                          scaleArea === scale
                            ? 'border-accent bg-rose-50/50 text-accent-strong font-semibold'
                            : 'border-line bg-surface text-zinc-700 hover:border-zinc-400'
                        }`}
                      >
                        {scale}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Desired Deliverables */}
                <div>
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-zinc-700 mb-2">
                    3. Target Deliverables (Multi-select)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { name: '3D Virtual Tour (Web)', detail: 'Zero-app browser walkthrough' },
                      { name: '4K Cinematic Fly-Through Film', detail: 'Drone + virtual camera direction' },
                      { name: 'SLAM LiDAR Point Cloud (±5mm)', detail: 'As-built engineering CAD/BIM' },
                      { name: 'VR Headset Experience (6DoF)', detail: 'Exhibitions and VR showrooms' },
                      { name: 'Heritage Archival Package', detail: 'Orthophotos, elevations & mesh' },
                      { name: 'Interactive Hotspots & Booking Sync', detail: 'Direct lead conversions' },
                    ].map((del) => {
                      const active = deliverables.includes(del.name);
                      return (
                        <button
                          key={del.name}
                          type="button"
                          onClick={() => toggleDeliverable(del.name)}
                          className={`flex items-start gap-2.5 p-3 rounded-md text-left border transition-all ${
                            active
                              ? 'border-accent bg-rose-50/50 text-ink'
                              : 'border-line bg-surface text-zinc-600 hover:border-zinc-400'
                          }`}
                        >
                          <div
                            className={`mt-0.5 h-3.5 w-3.5 rounded shrink-0 flex items-center justify-center border ${
                              active ? 'bg-accent border-accent' : 'border-zinc-400'
                            }`}
                          >
                            {active && <span className="text-white text-[9px]">✓</span>}
                          </div>
                          <div>
                            <div className="text-xs font-medium">{del.name}</div>
                            <div className="text-[11px] text-zinc-500">{del.detail}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 1 Actions */}
                <div className="pt-4 flex items-center justify-between border-t border-line">
                  <span className="text-xs font-mono text-zinc-500">
                    Selected: {deliverables.length} deliverable(s)
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={deliverables.length === 0}
                    className="loro-btn-primary px-6 py-2.5 text-xs font-semibold uppercase tracking-wider disabled:opacity-50"
                  >
                    Continue to Details &rarr;
                  </button>
                </div>

              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-zinc-600 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Ramesh Shrestha"
                      className="w-full rounded-lg border border-line bg-surface px-3.5 py-2 text-xs text-ink focus:border-accent focus:outline-none focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-zinc-600 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="e.g. ramesh@organization.np"
                      className="w-full rounded-lg border border-line bg-surface px-3.5 py-2 text-xs text-ink focus:border-accent focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-zinc-600 mb-1">
                      Phone / Mobile *
                    </label>
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+977 98XXXXXXXX"
                      className="w-full rounded-lg border border-line bg-surface px-3.5 py-2 text-xs text-ink focus:border-accent focus:outline-none focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-zinc-600 mb-1">
                      Organization / Property Name
                    </label>
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="e.g. Basera Boutique Hotel"
                      className="w-full rounded-lg border border-line bg-surface px-3.5 py-2 text-xs text-ink focus:border-accent focus:outline-none focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-600 mb-1">
                    Location &amp; Special Project Requirements
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Provide details about the space, location in Nepal, timing, and any specific goals you have..."
                    className="w-full rounded-lg border border-line bg-surface px-3.5 py-2 text-xs text-ink focus:border-accent focus:outline-none focus:bg-white resize-none"
                  />
                </div>

                {/* Configuration Summary Badge */}
                <div className="p-3 rounded-md bg-surface-sunken border border-line text-xs font-mono text-zinc-600">
                  <div className="flex justify-between">
                    <span>Scope:</span>
                    <span className="text-ink font-semibold">{spaceType} ({scaleArea})</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Deliverables:</span>
                    <span className="text-accent-strong font-semibold">{deliverables.length} selected</span>
                  </div>
                </div>

                {error && (
                  <p role="alert" className="text-xs text-accent-strong">
                    {error}
                  </p>
                )}

                {/* Step 2 Actions */}
                <div className="pt-4 flex items-center justify-between border-t border-line">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="loro-btn-secondary px-4 py-2 text-xs"
                  >
                    &larr; Back
                  </button>
                  <button
                    type="submit"
                    disabled={sending}
                    className="loro-btn-primary px-7 py-2.5 text-xs font-semibold uppercase tracking-wider disabled:opacity-60"
                  >
                    {sending ? 'Sending…' : <>Submit Proposal Request &rarr;</>}
                  </button>
                </div>

              </form>
            )}

          </div>
        ) : (
          /* Submission Confirmation View */
          <div className="py-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 border border-emerald-300 text-emerald-600">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h3 className="mt-4 text-xl font-bold text-ink font-display">
              Proposal Request Received
            </h3>
            
            <p className="mt-2 text-xs text-zinc-600 max-w-md mx-auto leading-relaxed">
              Thank you, <strong className="text-zinc-900">{contactName || 'there'}</strong>. Our reality capture team in Kathmandu will review your scope for {spaceType} and reach out within 24 hours.
            </p>

            <div className="mt-6 flex justify-center gap-3">
              <a
                href={SITE_METADATA.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="loro-btn-secondary px-4 py-2 text-xs flex items-center gap-1.5"
              >
                <span>Need urgent advice? WhatsApp</span>
                <span>↗</span>
              </a>
              <button
                onClick={onClose}
                className="loro-btn-primary px-5 py-2 text-xs"
              >
                Done
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
