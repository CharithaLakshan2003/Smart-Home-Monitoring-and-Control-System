import type { Device, DeviceState } from '../types';
import { getDeviceIcon } from '../utils/helpers';
import { formatDuration } from '../utils/helpers';

interface DeviceGridBadgeProps {
  device: Device;
  onClick: () => void;
}

const STATE_COLORS: Record<DeviceState, { border: string; glow: string; iconColor: string }> = {
  ON: {
    border: '#22c55e',
    glow: '0 0 12px rgba(34, 197, 94, 0.5), 0 0 24px rgba(34, 197, 94, 0.2)',
    iconColor: '#22c55e',
  },
  OFF: {
    border: '#64748b',
    glow: 'none',
    iconColor: '#64748b',
  },
  ERROR: {
    border: '#ef4444',
    glow: '0 0 12px rgba(239, 68, 68, 0.5)',
    iconColor: '#ef4444',
  },
  DISCONNECTED: {
    border: '#f59e0b',
    glow: '0 0 8px rgba(245, 158, 11, 0.4)',
    iconColor: '#f59e0b',
  },
};

export function DeviceGridBadge({ device, onClick }: DeviceGridBadgeProps) {
  const stateConfig = STATE_COLORS[device.state] || STATE_COLORS.OFF;
  const Icon = getDeviceIcon(device.type);

  let iconColor = stateConfig.iconColor;
  if (device.type === 'SAFETY_TIMED') {
    iconColor = device.state === 'ON' ? '#f97316' : '#64748b';
  }

  const isSafetyTimed = device.type === 'SAFETY_TIMED';
  const turnedOnAt = device.turnedOnAt || 0;
  const maxDuration = device.maxOnDurationSec || 1800;
  const autoOffTriggered = device.autoOffTriggered || false;
  let remainingText = '';

  if (isSafetyTimed && turnedOnAt > 0 && !autoOffTriggered) {
    const elapsed = Math.floor((Date.now() - turnedOnAt) / 1000);
    const rem = Math.max(0, maxDuration - elapsed);
    remainingText = rem > 0 ? `Rem: ${formatDuration(rem)}` : 'Auto-off';
  }

  return (
    <div
      className="flex flex-col items-center gap-1.5 w-full pt-1"
    >
      <button
        onClick={onClick}
        title={`${device.label} — ${device.type} (${device.state})`}
        className={`
          w-11 h-11 rounded-full flex items-center justify-center cursor-pointer
          transition-all duration-300 hover:scale-110
          ${device.state === 'ERROR' ? 'animate-[pulse-dot_1s_infinite]' : ''}
        `}
        style={{
          background: '#1e293b',
          border: `2px solid ${stateConfig.border}`,
          boxShadow: stateConfig.glow,
        }}
      >
        <Icon size={20} color={iconColor} />
      </button>
      {remainingText && (
        <span className="text-[0.65rem] text-[var(--text-muted)] capitalize">{remainingText}</span>
      )}
    </div>
  );
}
