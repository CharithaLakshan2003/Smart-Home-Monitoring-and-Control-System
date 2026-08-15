import { Check, X, CircleAlert, Unlink, type LucideProps } from 'lucide-react';
import type { ComponentType } from 'react';
import type { DeviceState } from '../types';
import { STATE_COLORS, STATE_LABELS } from '../utils/helpers';

// Icons mirror the app's StatusChip.kt (Check / Close / Error / LinkOff).
const STATE_ICONS: Record<DeviceState, ComponentType<LucideProps>> = {
  ON: Check,
  OFF: X,
  ERROR: CircleAlert,
  DISCONNECTED: Unlink,
};

/** Pill status chip — bg = state color @ 15%, content = state color. */
export function StatusChip({ state }: { state: DeviceState }) {
  const color = STATE_COLORS[state];
  const Icon = STATE_ICONS[state];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 10px',
        borderRadius: 20,
        background: `${color}26`,
        color,
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      <Icon size={13} />
      {STATE_LABELS[state]}
    </span>
  );
}
