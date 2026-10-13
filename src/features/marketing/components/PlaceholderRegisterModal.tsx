import React, { useState } from 'react';
import { PLACEHOLDER_REGISTER } from '../data/siteData';

interface PlaceholderRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlaceholderRegisterModal: React.FC<PlaceholderRegisterModalProps> = ({ isOpen, onClose }) => {
  const [filterPriority, setFilterPriority] = useState<'ALL' | 'B' | 'H' | 'N'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filtered = PLACEHOLDER_REGISTER.filter((item) => {
    const matchesPriority = filterPriority === 'ALL' || item.priority === filterPriority;
    const matchesSearch =
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.usedOn.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPriority && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[85dvh] flex flex-col overflow-hidden rounded-lg border border-line bg-white shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-6 py-4 bg-surface">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent"></span>
              <h2 className="text-base font-bold text-ink font-display">
                Placeholder Register (§13 Specification Audit)
              </h2>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Tracking all production-simulated values and to-be-confirmed parameters across the RCAAS site.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-3 bg-white">
          <div className="flex items-center gap-1.5">
            {(['ALL', 'B', 'H', 'N'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`px-3 py-1 text-xs font-mono font-medium rounded transition-all ${
                  filterPriority === p
                    ? 'bg-accent text-white'
                    : 'text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200'
                }`}
              >
                {p === 'ALL' ? 'All (26)' : p === 'B' ? 'Blocking (B)' : p === 'H' ? 'High (H)' : 'Normal (N)'}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search register id, item, location..."
            className="rounded-md border border-line bg-surface px-3 py-1 text-xs text-ink placeholder-zinc-400 focus:border-accent focus:outline-none focus:bg-white"
          />
        </div>

        {/* Register Table */}
        <div className="overflow-y-auto p-6">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-line text-zinc-500 font-mono">
                <th className="pb-2 font-medium">ID</th>
                <th className="pb-2 font-medium">Priority</th>
                <th className="pb-2 font-medium">Item Name</th>
                <th className="pb-2 font-medium">Used On</th>
                <th className="pb-2 font-medium">Production Simulated Value</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-mono text-[11px]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="py-2.5 font-bold text-accent">{item.id}</td>
                  <td className="py-2.5">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${
                        item.priority === 'B'
                          ? 'bg-rose-100 text-rose-700 font-bold'
                          : item.priority === 'H'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-zinc-100 text-zinc-600'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </td>
                  <td className="py-2.5 font-sans font-medium text-zinc-900">{item.item}</td>
                  <td className="py-2.5 text-zinc-500">{item.usedOn}</td>
                  <td className="py-2.5 text-zinc-700">{item.simulatedValue}</td>
                  <td className="py-2.5">
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-sans">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      <span>Simulated</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t border-line px-6 py-3 bg-surface text-right">
          <button
            onClick={onClose}
            className="loro-btn-secondary px-4 py-1.5 text-xs"
          >
            Close Audit View
          </button>
        </div>

      </div>
    </div>
  );
};
