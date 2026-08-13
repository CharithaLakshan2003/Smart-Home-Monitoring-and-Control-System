import { forwardRef } from 'react';
import { AlertTriangle, WifiOff, RotateCcw, MapPin } from 'lucide-react';
import type { Device, Floor } from '../types';
import { getDeviceIcon, getDeviceTypeName } from '../utils/helpers';
import { StateBadge } from './ui/StateBadge';
import { OutletCard } from './devices/OutletCard';
import { MultiSwitchCard } from './devices/MultiSwitchCard';
import { SafetyTimedCard } from './devices/SafetyTimedCard';
import { ScheduledLightCard } from './devices/ScheduledLightCard';
import { CameraCard } from './devices/CameraCard';
import { simulateState } from '../actions/deviceActions';

interface DeviceCardProps {
  device: Device;
  floor?: Floor;
}

// Type-specific accent colors
const TYPE_COLORS: Record<string, { accent: string; iconBg: string; glow: string }> = {
  OUTLET: { accent: '#3b82f6', iconBg: 'rgba(59, 130, 246, 0.15)', glow: '0 0 25px rgba(59, 130, 246, 0.3)' },
  MULTI_SWITCH: { accent: '#8b5cf6', iconBg: 'rgba(139, 92, 246, 0.15)', glow: '0 0 25px rgba(139, 92, 246, 0.3)' },
  SAFETY_TIMED: { accent: '#f97316', iconBg: 'rgba(249, 115, 22, 0.15)', glow: '0 0 25px rgba(249, 115, 22, 0.3)' },
  SCHEDULED_LIGHT: { accent: '#eab308', iconBg: 'rgba(234, 179, 8, 0.15)', glow: '0 0 25px rgba(234, 179, 8, 0.3)' },
  CAMERA: { accent: '#14b8a6', iconBg: 'rgba(20, 184, 166, 0.15)', glow: '0 0 25px rgba(20, 184, 166, 0.3)' },
};

export const DeviceCard = forwardRef<HTMLDivElement, DeviceCardProps>(({ device, floor }, ref) => {
  const type = device.type || 'OUTLET';
  const deviceState = device.state || 'OFF';
  const isOn = deviceState === 'ON';
  const isDisabled = deviceState === 'ERROR' || deviceState === 'DISCONNECTED';
  const Icon = getDeviceIcon(type);
  const typeName = getDeviceTypeName(type);
  const floorName = floor?.name || 'Unknown Floor';
  const lastUpdated = device.lastUpdated ? new Date(device.lastUpdated).toLocaleString() : 'Unknown';
  const colors = TYPE_COLORS[type] || TYPE_COLORS.OUTLET;

  // Card style based on state
  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-card)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid var(--border-glass)',
    borderRadius: 'var(--radius-lg)',
  };

  if (deviceState === 'ON') {
    cardStyle.borderColor = 'rgba(34, 197, 94, 0.2)';
    cardStyle.boxShadow = colors.glow;
  } else if (deviceState === 'ERROR') {
    cardStyle.borderColor = 'rgba(239, 68, 68, 0.3)';
    cardStyle.animation = 'error-pulse 2s infinite';
  } else if (deviceState === 'DISCONNECTED') {
    cardStyle.opacity = 0.6;
    cardStyle.borderStyle = 'dashed';
    cardStyle.borderColor = 'rgba(245, 158, 11, 0.3)';
  }

  // Render device-type-specific body
  const renderBody = () => {
    switch (type) {
      case 'OUTLET':
        return <OutletCard device={device} isOn={isOn} isDisabled={isDisabled} />;
      case 'MULTI_SWITCH':
        return <MultiSwitchCard device={device} isDisabled={isDisabled} />;
      case 'SAFETY_TIMED':
        return <SafetyTimedCard device={device} isOn={isOn} isDisabled={isDisabled} />;
      case 'SCHEDULED_LIGHT':
        return <ScheduledLightCard device={device} isOn={isOn} isDisabled={isDisabled} />;
      case 'CAMERA':
        return <CameraCard device={device} isOn={isOn} isDisabled={isDisabled} />;
    }
  };

  return (
    <div
      ref={ref}
      data-device-id={device.id}
      className="p-5 relative overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:border-[var(--border-glass-hover)] hover:-translate-y-0.5 hover:shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
      style={cardStyle}
    >
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] opacity-80"
        style={{
          background: colors.accent,
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
        }}
      />

      {/* Disconnected stripe overlay */}
      {deviceState === 'DISCONNECTED' && (
        <div
          className="absolute inset-0 pointer-events-none rounded-[var(--radius-lg)]"
          style={{
            background:
              'repeating-linear-gradient(-45deg, transparent, transparent 8px, rgba(245, 158, 11, 0.03) 8px, rgba(245, 158, 11, 0.03) 16px)',
          }}
        />
      )}

      {/* Card Header */}
      <div className="flex items-start justify-between mb-3.5">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Device icon */}
          <div
            className="w-[42px] h-[42px] rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
            style={{ background: colors.iconBg }}
          >
            <Icon size={20} color={colors.accent} />
          </div>

          <div className="min-w-0">
            <div className="text-[0.95rem] font-semibold text-[var(--text-primary)] truncate leading-tight">
              {device.label || 'Unnamed Device'}
            </div>
            <div className="text-[0.75rem] text-[var(--text-muted)] font-medium mt-0.5">
              {typeName}
            </div>
            <div
              className="text-[0.65rem] text-[var(--text-dim)] inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md mt-1"
              style={{ background: 'rgba(255, 255, 255, 0.05)' }}
            >
              <MapPin size={10} /> {floorName}
            </div>
          </div>
        </div>

        <StateBadge state={deviceState} />
      </div>

      {/* Device Type Body */}
      {renderBody()}

      {/* Last Updated */}
      <div className="text-[0.68rem] text-[var(--text-dim)] mt-1.5 font-mono">
        Last updated: {lastUpdated}
      </div>

      {/* Action Buttons */}
      <div className="mt-3.5 pt-3 border-t border-white/[0.08] flex gap-1.5 flex-wrap">
        <button
          onClick={() => simulateState(device.id, 'ERROR')}
          className="px-3 py-1 rounded-lg text-[0.7rem] font-medium cursor-pointer transition-all duration-200 hover:-translate-y-px flex items-center gap-1"
          style={{
            border: '1px solid rgba(239, 68, 68, 0.2)',
            background: 'rgba(255, 255, 255, 0.03)',
            color: '#f87171',
          }}
          title="Simulate Error"
        >
          <AlertTriangle size={12} /> Error
        </button>
        <button
          onClick={() => simulateState(device.id, 'DISCONNECTED')}
          className="px-3 py-1 rounded-lg text-[0.7rem] font-medium cursor-pointer transition-all duration-200 hover:-translate-y-px flex items-center gap-1"
          style={{
            border: '1px solid rgba(245, 158, 11, 0.2)',
            background: 'rgba(255, 255, 255, 0.03)',
            color: '#fbbf24',
          }}
          title="Simulate Disconnect"
        >
          <WifiOff size={12} /> Disconnect
        </button>
        {(deviceState === 'ERROR' || deviceState === 'DISCONNECTED') && (
          <button
            onClick={() => simulateState(device.id, 'OFF')}
            className="px-3 py-1 rounded-lg text-[0.7rem] font-medium cursor-pointer transition-all duration-200 hover:-translate-y-px flex items-center gap-1"
            style={{
              border: '1px solid var(--border-glass)',
              background: 'rgba(255, 255, 255, 0.03)',
              color: 'var(--text-secondary)',
            }}
            title="Recover to OFF"
          >
            <RotateCcw size={12} /> Recover
          </button>
        )}
      </div>
    </div>
  );
});

DeviceCard.displayName = 'DeviceCard';
