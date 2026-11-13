import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { PLACEHOLDER_REGISTER } from '../data/siteData';

interface PlaceholderRegisterModalProps { isOpen: boolean; onClose: () => void; }
const needsInput = (status: string) => status !== 'Confirmed' && status !== 'Implemented locally';

export const PlaceholderRegisterModal: React.FC<PlaceholderRegisterModalProps> = ({ isOpen, onClose }) => {
  const dialog = useRef<HTMLDialogElement>(null);
  const [priority, setPriority] = useState<'ALL' | 'B' | 'H' | 'N'>('ALL');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  useEffect(() => {
    const element = dialog.current;
    if (!isOpen || !element) return;
    element.showModal();
    element.querySelector<HTMLInputElement>('input')?.focus();
    return () => element.close();
  }, [isOpen]);
  if (!isOpen) return null;
  const query = search.trim().toLowerCase();
  const pending = PLACEHOLDER_REGISTER.filter(item => needsInput(item.status)).length;
  const filtered = PLACEHOLDER_REGISTER.filter(item =>
    (priority === 'ALL' || item.priority === priority) &&
    (status === 'all' || (status === 'needs' && needsInput(item.status)) || (status === 'confirmed' && item.status === 'Confirmed') || (status === 'local' && item.status === 'Implemented locally')) &&
    [item.id, item.item, item.usedOn, item.status, item.simulatedValue, item.nextAction].some(value => value?.toLowerCase().includes(query))
  );
  return (
    <dialog ref={dialog} className="audit-dialog" aria-labelledby="audit-register-title" aria-describedby="audit-register-description"
      onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="audit-dialog-content">
        <div className="flex items-start justify-between gap-4 border-b border-line bg-surface px-6 py-5">
          <div>
            <h2 id="audit-register-title" className="text-base font-semibold text-ink">Audit register</h2>
            <p id="audit-register-description" className="mt-1 max-w-2xl text-xs leading-relaxed text-muted">
              {PLACEHOLDER_REGISTER.length} items reviewed against current source and recorded owner decisions. {pending} need input or verification.
              Local implementation does not establish production readiness.
            </p>
          </div>
          <button type="button" onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line bg-white text-ink" aria-label="Close audit register"><X size={18} aria-hidden="true" /></button>
        </div>
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-6 py-4">
          <label className="sr-only" htmlFor="audit-register-search">Search audit register</label>
          <input id="audit-register-search" type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search items, evidence or actions…" className="min-h-10 min-w-0 flex-1 rounded-lg border border-line bg-white px-3 text-xs text-ink" />
          <label className="sr-only" htmlFor="audit-register-status">Filter by status</label>
          <select id="audit-register-status" value={status} onChange={event => setStatus(event.target.value)} className="min-h-10 rounded-lg border border-line bg-white px-3 text-xs text-ink">
            <option value="all">All statuses</option><option value="needs">Needs input / verification ({pending})</option><option value="confirmed">Confirmed facts</option><option value="local">Implemented locally</option>
          </select>
          <div className="flex flex-wrap gap-1" role="group" aria-label="Filter by priority">
            {(['ALL', 'B', 'H', 'N'] as const).map(value => {
              const count = PLACEHOLDER_REGISTER.filter(item => value === 'ALL' || item.priority === value).length;
              return <button type="button" key={value} onClick={() => setPriority(value)} aria-pressed={priority === value}
                className={`min-h-10 rounded-lg px-3 text-xs ${priority === value ? 'bg-zinc-950 text-white' : 'bg-surface text-ink'}`}>
                {value === 'ALL' ? 'All' : value === 'B' ? 'Blocking' : value === 'H' ? 'High' : 'Normal'} ({count})
              </button>;
            })}
          </div>
        </div>
        <div className="audit-dialog-scroll">
          <table className="w-full min-w-[850px] text-left text-xs">
            <caption className="sr-only">Audit findings, current evidence and actions still needed</caption>
            <thead className="sticky top-0 bg-white"><tr className="border-b border-line text-muted">
              <th scope="col" className="p-3 font-medium">ID</th><th scope="col" className="p-3 font-medium">Priority</th><th scope="col" className="p-3 font-medium">Item / location</th><th scope="col" className="p-3 font-medium">Current evidence</th><th scope="col" className="p-3 font-medium">Next action</th><th scope="col" className="p-3 font-medium">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map(item => <tr key={item.id} className="align-top hover:bg-surface">
                <th scope="row" className="p-3 text-accent">{item.id}</th>
                <td className="p-3"><span className={`rounded px-2 py-1 ${item.priority === 'B' ? 'bg-rose-50 text-rose-800' : item.priority === 'H' ? 'bg-amber-50 text-amber-800' : 'bg-zinc-100 text-zinc-700'}`}>{item.priority}</span></td>
                <td className="p-3"><p className="font-medium text-ink">{item.item}</p><p className="mt-1 text-muted">{item.usedOn}</p></td>
                <td className="p-3 leading-relaxed text-muted">{item.simulatedValue || 'No confirmed value recorded.'}</td>
                <td className="p-3 leading-relaxed text-muted">{item.nextAction || 'No further content input identified in this review.'}</td>
                <td className="p-3"><span className={`inline-block whitespace-nowrap rounded px-2 py-1 ${item.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-800' : item.status === 'Implemented locally' ? 'bg-sky-50 text-sky-800' : 'bg-amber-50 text-amber-800'}`}>{item.status}</span></td>
              </tr>)}
              {!filtered.length && <tr><td colSpan={6} className="p-8 text-center text-muted">No items match. Clear the search or change the filters.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-surface px-6 py-4 text-xs text-muted">
          <span role="status">Showing {filtered.length} of {PLACEHOLDER_REGISTER.length}. Reviewed 13 November 2026.</span>
          <button type="button" onClick={onClose} className="loro-btn-secondary min-h-10 px-4 text-xs">Close register</button>
        </div>
      </div>
    </dialog>
  );
};
