import { useState } from 'react';
import { StatusPill } from '../atoms/StatusPill';

type Status = 'pending' | 'partial' | 'complete' | 'error';

function statusColorHex(status: Status): string {
  switch (status) {
    case 'pending':
      return '#f59e0b';
    case 'partial':
      return '#3b82f6';
    case 'complete':
      return '#10b981';
    case 'error':
      return '#ef4444';
  }
}

export function TransformBox({
  name,
  status,
  nodeId,
  values,
  onAdd,
}: {
  name: string;
  status: Status;
  nodeId?: string;
  values?: Record<string, string>;
  onAdd?: (nodeId: string, field: string) => void;
}) {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(true);
  const extras = Object.keys(values || {});
  return (
    <div
      className="relative rounded-xl bg-white shadow-sm w-56"
      style={{ border: `1px dashed ${statusColorHex(status)}` }}
    >
      <div className="px-3 py-1 text-xs font-semibold rounded-t-xl bg-node-transform text-white">
        TRANSFORM
      </div>
      <div
        className="absolute left-0 top-0 h-full w-1.5 rounded-bl-xl rounded-tl-xl"
        style={{ backgroundColor: '#8b5cf6' }}
      />
      <div className="p-3">
        <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <span>{name}</span>
          <StatusPill status={status} />
        </div>
        <div className="text-xs text-slate-500 mt-0.5">Category: Transform</div>
        {/* Only show configuration section for transforms that need it - NEVER for Dummy Transform */}
        {name !== 'Map & Validate' && name !== 'Cleanse' && name !== 'Dummy Transform' && (
          <div className="mt-2 text-xs text-slate-600">Configure transform parameters</div>
        )}
        {name !== 'Map & Validate' && name !== 'Cleanse' && name !== 'Dummy Transform' ? (
          <>
            <button
              type="button"
              className="mt-2 w-full min-h-[44px] flex items-center justify-between text-left text-xs font-medium text-slate-700 px-2 py-2 rounded hover:bg-slate-50 transition-colors"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="transform-extras"
              aria-label={`${open ? 'Collapse' : 'Expand'} transform extras section`}
            >
              <span>Extras</span>
              <span
                className="text-slate-400 min-w-[24px] min-h-[24px] flex items-center justify-center"
                aria-hidden="true"
              >
                {open ? '−' : '+'}
              </span>
            </button>
            {open ? (
              <div id="transform-extras" className="mt-1">
                {extras.length ? (
                  <div
                    className="text-[12px] text-slate-700"
                    role="list"
                    aria-label="Current extra fields"
                  >
                    {extras.map((k) => (
                      <div key={k} className="mt-1" role="listitem">
                        {k}
                      </div>
                    ))}
                  </div>
                ) : null}
                <input
                  className="mt-1 w-full rounded px-1.5 py-0.5 text-[12px] focus:outline-none h-6"
                  style={{ border: '0', backgroundColor: '#f8fafc' }}
                  placeholder="Add field name and press Enter"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && input.trim()) {
                      if (nodeId) {
                        onAdd?.(nodeId, input.trim());
                      }
                      setInput('');
                    }
                  }}
                  aria-label="Add new transform field"
                  aria-describedby="field-help"
                />
                <div id="field-help" className="sr-only">
                  Enter a field name and press Enter to add it to the transform configuration
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
