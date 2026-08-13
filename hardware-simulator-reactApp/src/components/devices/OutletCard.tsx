import type { Device } from '../../types';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { toggleDevice } from '../../actions/deviceActions';

interface OutletCardProps {
  device: Device;
  isOn: boolean;
  isDisabled: boolean;
}

export function OutletCard({ device, isOn, isDisabled }: OutletCardProps) {
  return (
    <div className="flex items-center gap-5 mt-8">
      <span className="text-[1rem] text-[var(--text-secondary)] font-medium w-28">Power</span>
      <ToggleSwitch
        checked={isOn}
        disabled={isDisabled}
        onChange={(checked) => toggleDevice(device.id, checked)}
      />
    </div>
  );
}
