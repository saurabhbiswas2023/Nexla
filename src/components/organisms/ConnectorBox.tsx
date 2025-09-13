import { useEffect, useRef, useState } from 'react';
import { ConnectorInstance } from '../../types/connectors';
import { StatusPill } from '../atoms/StatusPill';
import { FLOW_CONSTANTS, HAPTIC_FEEDBACK } from '../../lib/constants';
import { validateFieldValue, sanitizeInput, maskCredentialValue } from '../../lib/security';
import { statusColorHex, Status } from '../../lib/status';

function roleThemeHex(role: 'source' | 'destination'): string {
  return role === 'source'
    ? FLOW_CONSTANTS.COLORS.node.source
    : FLOW_CONSTANTS.COLORS.node.destination;
}

type Props = {
  instance: ConnectorInstance & { status?: Status };
  nodeId?: string;
  onEditValue?: (nodeId: string, key: string, value: string) => void;
};

export function ConnectorBox({ instance, nodeId, onEditValue }: Props) {
  const { role, spec, values, status } = instance;
  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [localValues, setLocalValues] = useState<Record<string, string | undefined>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showCreds, setShowCreds] = useState<boolean>(true);
  const [fieldAnnouncement, setFieldAnnouncement] = useState<string>('');
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [ix, setIx] = useState(12);
  const [iy, setIy] = useState(12);
  const [panelHeight, setPanelHeight] = useState<number>(0);
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const update = () => setPanelHeight(el.scrollHeight);
    update();
    const RO = (
      window as unknown as {
        ResizeObserver?: new (callback: ResizeObserverCallback) => ResizeObserver;
      }
    ).ResizeObserver;
    const ro = RO ? new RO(() => update()) : undefined;
    if (ro) ro.observe(el);
    return () => ro && ro.disconnect();
  }, []);
  const badge = role === 'source' ? 'bg-node-source text-white' : 'bg-node-destination text-white';
  const borderStyle = { borderColor: statusColorHex(status || 'pending') } as React.CSSProperties;
  const theme = roleThemeHex(role);
  const bgTint = { backgroundColor: theme + '14' } as React.CSSProperties; // ~8% opacity
  return (
    <div className="relative rounded-xl border bg-white shadow-sm w-56" style={borderStyle}>
      <div className={`px-3 py-1 text-xs font-semibold rounded-t-xl ${badge}`}>
        {role.toUpperCase()}
      </div>
      {/* role ribbon */}
      <div
        className="absolute left-0 top-0 h-full w-1.5 rounded-bl-xl rounded-tl-xl"
        style={{ backgroundColor: theme }}
      />
      <div className="p-3" style={bgTint}>
        <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <span>{spec.name}</span>
          <span className="ml-auto" />
          {status ? <StatusPill status={status} /> : null}
        </div>
        <div className="text-xs text-slate-500 mt-0.5">Category: {spec.category}</div>
        <div className="mt-2 text-xs">
          <button
            type="button"
            aria-expanded={showCreds}
            className="w-full flex items-center justify-between text-left font-medium text-slate-700 select-none active:scale-[0.98] transition-transform"
            onClick={() => {
              if ('vibrate' in navigator) {
                try {
                  (navigator as unknown as { vibrate?: (duration: number) => void }).vibrate?.(
                    HAPTIC_FEEDBACK.light
                  );
                } catch {
                  // Haptic feedback not supported
                }
              }
              setShowCreds((v) => !v);
            }}
          >
            <span>Credentials</span>
            <span
              className={`text-slate-400 text-xl leading-none transition-transform duration-200 ripple-ink ${showCreds ? '' : 'rotate-90'}`}
              onMouseMove={(e) => {
                const r = (e.currentTarget as HTMLSpanElement).getBoundingClientRect();
                setIx(e.clientX - r.left);
                setIy(e.clientY - r.top);
              }}
              style={{ '--rx': ix + 'px', '--ry': iy + 'px' } as React.CSSProperties}
            >
              <span className="ink-symbol">{showCreds ? '−' : '+'}</span>
            </span>
          </button>
          <div
            ref={panelRef}
            className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
            style={{ maxHeight: showCreds ? panelHeight : 0 }}
          >
            <div className="mt-1">
              <div className="text-[11px] text-slate-500">Mandatory</div>
              {spec.credentials.mandatory.map((k) => {
                const raw = values?.[k];
                const value = typeof raw === 'string' ? raw : (raw ?? '');
                const displayValue = maskCredentialValue(k, value);
                const missing = !value;
                const isPending = instance.status === 'pending';
                return (
                  <div
                    key={k}
                    className={`mt-1 text-[12px] ${missing && isPending ? 'text-red-600' : 'text-slate-700'}`}
                  >
                    <div className="font-medium">{k}</div>
                    {missing || editing[k] ? (
                      <input
                        className="mt-1 w-full rounded border px-2 py-1 text-[12px] focus:outline-none"
                        style={{ borderColor: missing && isPending ? '#ef4444' : '#cbd5e1' }}
                        type={k.toLowerCase().includes('password') ? 'password' : 'text'}
                        value={localValues[k] ?? (typeof raw === 'string' ? raw : (raw ?? ''))}
                        onChange={(e) =>
                          setLocalValues((prev) => ({ ...prev, [k]: e.target.value }))
                        }
                        onBlur={() => {
                          const finalValue =
                            localValues[k] ?? (typeof raw === 'string' ? raw : (raw ?? ''));

                          // Validate and sanitize the input
                          const validation = validateFieldValue(k, finalValue);
                          if (validation.isValid) {
                            const sanitizedValue = sanitizeInput(finalValue);
                            if (nodeId) {
                              onEditValue?.(nodeId, k, sanitizedValue);
                            }
                            setFieldErrors((prev) => ({ ...prev, [k]: '' }));
                            setFieldAnnouncement(`${k} field updated successfully`);
                          } else {
                            setFieldErrors((prev) => ({
                              ...prev,
                              [k]: validation.error || 'Invalid input',
                            }));
                            setFieldAnnouncement(
                              `${k} field validation failed: ${validation.error}`
                            );
                          }
                          setTimeout(() => setFieldAnnouncement(''), 2000);

                          setEditing((m: Record<string, boolean>) => ({ ...m, [k]: false }));
                          setLocalValues((prev) => ({ ...prev, [k]: undefined }));
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const finalValue =
                              localValues[k] ?? (typeof raw === 'string' ? raw : (raw ?? ''));

                            // Validate and sanitize the input
                            const validation = validateFieldValue(k, finalValue);
                            if (validation.isValid) {
                              const sanitizedValue = sanitizeInput(finalValue);
                              if (nodeId) {
                                onEditValue?.(nodeId, k, sanitizedValue);
                              }
                              setFieldErrors((prev) => ({ ...prev, [k]: '' }));
                            } else {
                              setFieldErrors((prev) => ({
                                ...prev,
                                [k]: validation.error || 'Invalid input',
                              }));
                            }

                            setEditing((m: Record<string, boolean>) => ({ ...m, [k]: false }));
                            setLocalValues((prev) => ({ ...prev, [k]: undefined }));
                          }
                        }}
                        autoFocus={editing[k] === true}
                        aria-label={`Enter ${k} for ${role} connector`}
                        aria-required={missing && isPending}
                        aria-invalid={missing && isPending}
                      />
                    ) : (
                      <div
                        className="mt-1 min-h-[44px] text-[12px] text-slate-800 cursor-text truncate flex items-center px-2 py-1 rounded hover:bg-slate-50 transition-colors"
                        onClick={() =>
                          setEditing((m: Record<string, boolean>) => ({ ...m, [k]: true }))
                        }
                        onKeyDown={(e) =>
                          e.key === 'Enter' &&
                          setEditing((m: Record<string, boolean>) => ({ ...m, [k]: true }))
                        }
                        title={typeof value === 'string' ? value : ''}
                        tabIndex={0}
                        role="button"
                        aria-label={`Edit ${k} field. Current value: ${displayValue || 'empty'}`}
                      >
                        {displayValue}
                      </div>
                    )}
                    {fieldErrors[k] && (
                      <div className="mt-1 text-[10px] text-red-600" role="alert">
                        {fieldErrors[k]}
                      </div>
                    )}
                  </div>
                );
              })}
              {spec.credentials.optional?.length ? (
                <div className="mt-2">
                  <div className="text-[11px] text-slate-500">Optional</div>
                  {spec.credentials.optional?.map((k) => {
                    const raw = values?.[k];
                    const value = typeof raw === 'string' ? raw : (raw ?? '');
                    const displayValue = maskCredentialValue(k, value);
                    return (
                      <div key={k} className="mt-1 text-[12px] text-slate-700">
                        <div className="font-medium">{k}</div>
                        {(editing[k] ?? true) ? (
                          <input
                            className="mt-1 w-full rounded border px-2 py-1 text-[12px] focus:outline-none"
                            style={{ borderColor: '#cbd5e1' }}
                            type={k.toLowerCase().includes('password') ? 'password' : 'text'}
                            value={localValues[k] ?? (typeof raw === 'string' ? raw : (raw ?? ''))}
                            onChange={(e) =>
                              setLocalValues((prev) => ({ ...prev, [k]: e.target.value }))
                            }
                            onBlur={() => {
                              const finalValue =
                                localValues[k] ?? (typeof raw === 'string' ? raw : (raw ?? ''));
                              // Only save optional fields if they have a value (not empty)
                              if (
                                finalValue.trim() !== '' ||
                                spec.credentials.mandatory.includes(k)
                              ) {
                                if (nodeId) {
                                  onEditValue?.(nodeId, k, finalValue);
                                }
                              }
                              setEditing((m: Record<string, boolean>) => ({ ...m, [k]: false }));
                              setLocalValues((prev) => ({ ...prev, [k]: undefined }));
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const finalValue =
                                  localValues[k] ?? (typeof raw === 'string' ? raw : (raw ?? ''));
                                // Only save optional fields if they have a value (not empty)
                                if (
                                  finalValue.trim() !== '' ||
                                  spec.credentials.mandatory.includes(k)
                                ) {
                                  if (nodeId) {
                                    onEditValue?.(nodeId, k, finalValue);
                                  }
                                }
                                setEditing((m: Record<string, boolean>) => ({ ...m, [k]: false }));
                                setLocalValues((prev) => ({ ...prev, [k]: undefined }));
                              }
                            }}
                            autoFocus
                          />
                        ) : (
                          <div
                            className="mt-1 min-h-[44px] text-[12px] cursor-text truncate flex items-center px-2 py-1 rounded hover:bg-slate-50 transition-colors"
                            onClick={() =>
                              setEditing((m: Record<string, boolean>) => ({ ...m, [k]: true }))
                            }
                            onKeyDown={(e) =>
                              e.key === 'Enter' &&
                              setEditing((m: Record<string, boolean>) => ({ ...m, [k]: true }))
                            }
                            title={value || ''}
                            tabIndex={0}
                            role="button"
                            aria-label={`Edit ${k} field. Current value: ${displayValue || 'empty'}`}
                          >
                            {value ? (
                              <span className="text-slate-800">{displayValue}</span>
                            ) : (
                              <span className="text-slate-400 italic">
                                {spec.credentials.mandatory.includes(k)
                                  ? 'Required'
                                  : 'Optional - click to add'}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <style>
        {`
        .ripple-ink{position:relative;display:inline-grid;place-items:center;width:28px;height:28px;border-radius:9999px}
        .ripple-ink .ink-symbol{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);line-height:1}
        /* soft filled circular background */
        .ripple-ink::before{content:"";position:absolute;inset:0;border-radius:inherit;background:currentColor;opacity:.08;transform:scale(.98);transition:opacity 220ms ease,transform 220ms ease}
        /* concentric ring at the edge */
        .ripple-ink::after{content:"";position:absolute;inset:-2px;border-radius:inherit;border:2px solid currentColor;opacity:0;transform:scale(.9)}
        .ripple-ink:hover::before{opacity:.14;transform:scale(1.06)}
        .ripple-ink:hover::after{opacity:.35;animation:ringPulse 1200ms ease-in-out infinite}
        .ripple-ink:active::after{opacity:.45}
        @keyframes ringPulse{0%{transform:scale(.92)}50%{transform:scale(1.08)}100%{transform:scale(.92)}}
        `}
      </style>

      {/* Screen Reader Announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {fieldAnnouncement}
      </div>
    </div>
  );
}
