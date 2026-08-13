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
    <div className="flex items-center gap-3 mt-3.5">
      <span className="text-[0.8rem] text-[var(--text-secondary)] font-medium">Power</span>
      <ToggleSwitch
        checked={isOn}
        disabled={isDisabled}
        onChange={(checked) => toggleDevice(device.id, checked)}
      />
    </div>
  );
}
