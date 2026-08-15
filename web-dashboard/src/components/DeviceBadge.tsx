import { DEVICE_TYPE_LABELS, type Device } from '../types';
import { DeviceIcon } from './DeviceIcon';
import { STATE_COLORS, STATE_GLOW, STATE_LABELS } from '../utils/helpers';

interface Props {
  device: Device;
  size?: number;
}

/** Circular grid badge — mirrors the app's DeviceGridBadge.kt:
 *  surfaceContainerHigh fill, 2px state-colored ring, glow when ON/alert. */
export function DeviceBadge({ device, size = 44 }: Props) {
  const color = STATE_COLORS[device.state];
  const glow = STATE_GLOW[device.state];
  const isMini = size < 40;
  const showTimer = device.type === 'SAFETY_TIMED' && !isMini;

  return (
    <div
      title={`${device.label || 'Device'} · ${DEVICE_TYPE_LABELS[device.type]} · ${STATE_LABELS[device.state]}`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: showTimer ? 1 : 0,
        background: 'var(--surface-3)',
        border: `${isMini ? 1 : 2}px solid ${color}`,
        color,
        boxShadow: glow === 'transparent' ? 'none' : `0 0 ${isMini ? 6 : 12}px ${glow}`,
        cursor: 'default',
        transition: 'transform 0.15s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {showTimer && (
        <span style={{ fontSize: 6.5, fontWeight: 700, letterSpacing: '0.02em', lineHeight: 1 }}>
          TIMER
        </span>
      )}
      <DeviceIcon type={device.type} size={size * (isMini ? 0.5 : 0.46)} />
    </div>
  );
}
