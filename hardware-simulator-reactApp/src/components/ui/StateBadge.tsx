import type { DeviceState } from '../../types';

interface StateBadgeProps {
  state: DeviceState;
}

const STATE_CONFIG: Record<DeviceState, { bg: string; text: string; border: string; dotBg: string; dotShadow?: string; dotAnimate?: boolean }> = {
  ON: {
    bg: 'rgba(34, 197, 94, 0.15)',
    text: '#4ade80',
    border: 'rgba(34, 197, 94, 0.25)',
    dotBg: '#4ade80',
    dotShadow: '0 0 6px rgba(34, 197, 94, 0.5)',
  },
  OFF: {
    bg: 'rgba(100, 116, 139, 0.15)',
    text: '#94a3b8',
    border: 'rgba(100, 116, 139, 0.2)',
    dotBg: '#94a3b8',
  },
  ERROR: {
    bg: 'rgba(239, 68, 68, 0.15)',
    text: '#f87171',
    border: 'rgba(239, 68, 68, 0.25)',
    dotBg: '#f87171',
    dotAnimate: true,
  },
  DISCONNECTED: {
    bg: 'rgba(245, 158, 11, 0.15)',
    text: '#fbbf24',
    border: 'rgba(245, 158, 11, 0.25)',
    dotBg: '#fbbf24',
  },
};

export function StateBadge({ state }: StateBadgeProps) {
  const config = STATE_CONFIG[state];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.72rem] font-semibold uppercase tracking-wide flex-shrink-0`}
      style={{
        background: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
      }}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${config.dotAnimate ? 'animate-[pulse-dot_1s_infinite]' : ''}`}
        style={{
          background: config.dotBg,
          boxShadow: config.dotShadow,
        }}
      />
      {state}
    </span>
  );
}
