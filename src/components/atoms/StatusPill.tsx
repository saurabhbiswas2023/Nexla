import { useEffect, useRef, useState } from 'react';
import { statusColorHex, Status } from '../../lib/status';
import { FLOW_CONSTANTS } from '../../lib/constants';

export function StatusPill({ status }: { status: Status }) {
  const color = statusColorHex(status);
  const prev = useRef<Status | null>(null);
  const [anim, setAnim] = useState<string>('');

  useEffect(() => {
    const from = prev.current;
    const { ANIMATION_DURATIONS } = FLOW_CONSTANTS;
    let name = '';

    if (status === 'pending') {
      name = `pulseSlow ${ANIMATION_DURATIONS.pulseSlow}ms ease-in-out infinite`;
    }
    if (status === 'partial') {
      name =
        from === 'complete'
          ? `downgrade ${ANIMATION_DURATIONS.downgrade}ms ease-out forwards`
          : `scaleIn ${ANIMATION_DURATIONS.scaleIn}ms ease-out`;
    }
    if (status === 'complete') {
      name = `pop ${ANIMATION_DURATIONS.pop}ms cubic-bezier(0.2,0.8,0.2,1)`;
    }

    setAnim(name);
    prev.current = status;
  }, [status]);

  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border px-2 py-0.5 text-[11px] transition-colors duration-300 w-20"
      style={{ borderColor: color, color }}
    >
      <span
        className="relative grid place-items-center h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color, animation: anim }}
      >
        {status === 'complete' ? (
          <span
            className="absolute inset-0 rounded-full"
            style={{ animation: `ripple ${FLOW_CONSTANTS.ANIMATION_DURATIONS.ripple}ms ease-out` }}
          />
        ) : null}
        {status === 'partial' && prev.current === 'complete' ? (
          <span
            className="absolute inset-0 rounded-full"
            style={{
              animation: `ringOut ${FLOW_CONSTANTS.ANIMATION_DURATIONS.ringOut}ms ease-out`,
            }}
          />
        ) : null}
      </span>
      {status}
      <style>
        {`
        @keyframes scaleIn{0%{transform:scale(0.94)}100%{transform:scale(1)}}
        @keyframes pop{0%{transform:scale(0.85)}60%{transform:scale(1.06)}100%{transform:scale(1)}}
        @keyframes pulseSlow{0%,100%{opacity:0.65}50%{opacity:1}}
        @keyframes ripple{0%{box-shadow:0 0 0 0 ${color}55}100%{box-shadow:0 0 0 10px ${color}00}}
        @keyframes ringOut{0%{box-shadow:0 0 0 10px ${color}33;opacity:1}100%{box-shadow:0 0 0 18px ${color}00;opacity:0}}
        @keyframes downgrade{0%{transform:scale(1);box-shadow:0 0 0 0 ${color}00}30%{transform:scale(0.95);box-shadow:0 0 0 8px ${color}22}70%{transform:scale(0.98);box-shadow:0 0 0 4px ${color}11}100%{transform:scale(1);box-shadow:0 0 0 0 ${color}00}}
        `}
      </style>
    </span>
  );
}
