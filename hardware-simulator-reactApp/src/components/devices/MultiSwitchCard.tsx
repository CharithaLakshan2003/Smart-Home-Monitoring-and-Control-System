import type { Device } from '../../types';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { toggleSwitch, toggleAllSwitches } from '../../actions/deviceActions';

interface MultiSwitchCardProps {
  device: Device;
  isDisabled: boolean;
}

export function MultiSwitchCard({ device, isDisabled }: MultiSwitchCardProps) {
  const switchCount = device.switchCount || 1;
  const switchNames = device.switchNames || [];
  const switchStates = device.switchStates || [];
  const allOn = switchStates.length > 0 && switchStates.every((s) => s === true);

  return (
    <>
      {/* Master toggle */}
      <div className="flex items-center gap-5 mt-8">
        <span className="text-[1rem] text-[var(--text-secondary)] font-medium w-28">Master (All)</span>
        <ToggleSwitch
          checked={allOn}
          disabled={isDisabled}
          onChange={(checked) => toggleAllSwitches(device.id, switchCount, checked)}
        />
      </div>

      {/* Individual switches */}
      <div className="mt-6 flex flex-col gap-4">
        {Array.from({ length: switchCount }, (_, i) => {
          const name = switchNames[i] || `Switch ${i + 1}`;
          const isOn = switchStates[i] === true;

          return (
            <div
              key={i}
              className="flex items-center justify-between px-5 py-4 rounded-xl transition-colors duration-200 hover:bg-white/[0.05]"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <span className="text-[0.82rem] text-[var(--text-secondary)] font-medium">{name}</span>
              <ToggleSwitch
                checked={isOn}
                disabled={isDisabled}
                onChange={(checked) => toggleSwitch(device.id, i, checked)}
                size="small"
              />
            </div>
          );
        })}
      </div>
    </>
  );
}
