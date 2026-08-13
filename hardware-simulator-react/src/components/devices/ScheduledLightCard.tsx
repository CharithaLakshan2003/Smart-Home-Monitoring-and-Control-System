import { Clock, ArrowRight } from 'lucide-react';
import type { Device } from '../../types';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { toggleDevice, toggleSchedule } from '../../actions/deviceActions';

interface ScheduledLightCardProps {
  device: Device;
  isOn: boolean;
  isDisabled: boolean;
}

export function ScheduledLightCard({ device, isOn, isDisabled }: ScheduledLightCardProps) {
  const scheduleStart = device.scheduleStart || '18:00';
  const scheduleEnd = device.scheduleEnd || '23:00';
  const scheduleEnabled = device.scheduleEnabled !== false;

  return (
    <>
      {/* Power toggle */}
      <div className="flex items-center gap-3 mt-3.5">
        <span className="text-[0.8rem] text-[var(--text-secondary)] font-medium">Power</span>
        <ToggleSwitch
          checked={isOn}
          disabled={isDisabled}
          onChange={(checked) => toggleDevice(device.id, checked)}
        />
      </div>

      {/* Schedule panel */}
      <div
        className="mt-3.5 p-3 rounded-lg"
        style={{
          background: 'rgba(234, 179, 8, 0.08)',
          border: '1px solid rgba(234, 179, 8, 0.15)',
        }}
      >
        <div className="flex items-center gap-2.5 font-mono text-[0.9rem] text-[#eab308] font-medium">
          <span className="flex items-center gap-1">
            <Clock size={14} /> {scheduleStart}
          </span>
          <span className="text-[var(--text-muted)]">
            <ArrowRight size={14} />
          </span>
          <span className="flex items-center gap-1">
            <Clock size={14} /> {scheduleEnd}
          </span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="text-[0.75rem] text-[var(--text-muted)] font-medium">Schedule Active</span>
          <ToggleSwitch
            checked={scheduleEnabled}
            disabled={isDisabled}
            onChange={(checked) => toggleSchedule(device.id, checked)}
            size="small"
          />
        </div>
      </div>
    </>
  );
}
