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

const TYPE_COLORS: Record<string, { accent: string; iconBg: string; shadow: string }> = {
  OUTLET: { accent: '#3b82f6', iconBg: 'rgba(59, 130, 246, 0.1)', shadow: 'rgba(59, 130, 246, 0.25)' },
  MULTI_SWITCH: { accent: '#8b5cf6', iconBg: 'rgba(139, 92, 246, 0.1)', shadow: 'rgba(139, 92, 246, 0.25)' },
  SAFETY_TIMED: { accent: '#f97316', iconBg: 'rgba(249, 115, 22, 0.1)', shadow: 'rgba(249, 115, 22, 0.25)' },
  SCHEDULED_LIGHT: { accent: '#eab308', iconBg: 'rgba(234, 179, 8, 0.1)', shadow: 'rgba(234, 179, 8, 0.25)' },
  CAMERA: { accent: '#14b8a6', iconBg: 'rgba(20, 184, 166, 0.1)', shadow: 'rgba(20, 184, 166, 0.25)' },
};

export const DeviceCard = forwardRef<HTMLDivElement, DeviceCardProps>(({ device, floor }, ref) => {
  const type = device.type || 'OUTLET';
  const deviceState = device.state || 'OFF';
  const isOn = deviceState === 'ON';
  const isDisabled = deviceState === 'ERROR' || deviceState === 'DISCONNECTED';
  const Icon = getDeviceIcon(type);
  const typeName = getDeviceTypeName(type);
  const floorName = floor?.name || 'Unknown Location';
  const colors = TYPE_COLORS[type] || TYPE_COLORS.OUTLET;

  // Obsidian Glass Styling
  const cardClasses = `
    p-10 flex flex-col gap-6 relative overflow-hidden transition-all duration-500 ease-out
    rounded-[28px] border
    ${isOn ? 'bg-[var(--bg-card)]' : 'bg-[var(--bg-card)] opacity-90 grayscale-[20%]'}
  `;

  const dynamicStyles: React.CSSProperties = {
    borderColor: isOn ? colors.shadow : 'var(--border-glass)',
    boxShadow: isOn ? `0 8px 32px ${colors.shadow}, inset 0 1px 0 rgba(255,255,255,0.1)` : '0 4px 20px rgba(0,0,0,0.5)',
  };

  if (deviceState === 'ERROR') {
    dynamicStyles.borderColor = 'rgba(239, 68, 68, 0.4)';
    dynamicStyles.boxShadow = '0 0 40px rgba(239, 68, 68, 0.15)';
  } else if (deviceState === 'DISCONNECTED') {
    dynamicStyles.borderColor = 'rgba(245, 158, 11, 0.2)';
    dynamicStyles.opacity = 0.6;
  }

  const renderBody = () => {
    switch (type) {
      case 'OUTLET': return <OutletCard device={device} isOn={isOn} isDisabled={isDisabled} />;
      case 'MULTI_SWITCH': return <MultiSwitchCard device={device} isDisabled={isDisabled} />;
      case 'SAFETY_TIMED': return <SafetyTimedCard device={device} isOn={isOn} isDisabled={isDisabled} />;
      case 'SCHEDULED_LIGHT': return <ScheduledLightCard device={device} isOn={isOn} isDisabled={isDisabled} />;
      case 'CAMERA': return <CameraCard device={device} isOn={isOn} isDisabled={isDisabled} />;
    }
  };

  return (
    <div ref={ref} data-device-id={device.id} className={cardClasses} style={dynamicStyles}>

      {/* Background ambient glow when ON */}
      {isOn && (
        <div
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[60px] opacity-40 pointer-events-none transition-opacity duration-1000"
          style={{ background: colors.accent }}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-5">
          <div
            className="w-16 h-16 rounded-[20px] flex items-center justify-center transition-all duration-500 shadow-inner"
            style={{
              background: isOn ? colors.accent : 'rgba(255,255,255,0.03)',
              color: isOn ? '#fff' : 'var(--text-secondary)'
            }}
          >
            <Icon size={28} strokeWidth={isOn ? 2.5 : 2} />
          </div>
          <div>
            <h3 className="text-[1.15rem] font-bold text-white tracking-wide leading-tight">
              {device.label || 'Unnamed Device'}
            </h3>
            <p className="text-[0.8rem] text-[var(--text-muted)] font-medium mt-1.5 uppercase tracking-wider">
              {typeName}
            </p>
          </div>
        </div>
        <StateBadge state={deviceState} />
      </div>

      {/* Location Badge */}
      <div className="flex items-center gap-2.5 self-start px-5 py-2.5 rounded-xl bg-white/5 border border-white/5 text-[0.8rem] text-[var(--text-secondary)] font-medium mt-3 relative z-10">
        <MapPin size={14} /> {floorName}
      </div>

      {/* Controls Area */}
      <div className="flex-1 flex flex-col justify-center relative z-10 py-6">
        {renderBody()}
      </div>

      {/* Admin Actions Footer */}
      <div className="pt-6 mt-4 border-t border-[var(--border-subtle)] flex items-center justify-between relative z-10">
        <span className="text-[0.7rem] text-[var(--text-dim)] font-mono">
          ID: {device.id.substring(0, 8)}
        </span>
        <div className="flex gap-3">
          <button
            onClick={() => simulateState(device.id, 'ERROR')}
            className="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
            title="Trigger Error State"
          >
            <AlertTriangle size={14} />
          </button>
          <button
            onClick={() => simulateState(device.id, 'DISCONNECTED')}
            className="p-3 rounded-xl bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 hover:text-orange-300 transition-colors"
            title="Trigger Disconnected State"
          >
            <WifiOff size={14} />
          </button>
          {(deviceState === 'ERROR' || deviceState === 'DISCONNECTED') && (
            <button
              onClick={() => simulateState(device.id, 'OFF')}
              className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 text-[0.8rem] font-bold flex items-center gap-2 transition-colors"
            >
              <RotateCcw size={14} /> RECOVER
            </button>
          )}
        </div>
      </div>

    </div>
  );
});

DeviceCard.displayName = 'DeviceCard';
