import { Power, ToggleRight, Timer, Sun, Camera, type LucideProps } from 'lucide-react';
import type { ComponentType } from 'react';
import type { DeviceType } from '../types';

// Matches the app's DeviceIcon.kt (Power / ToggleOn / Timer / LightMode / CameraAlt).
const ICONS: Record<DeviceType, ComponentType<LucideProps>> = {
  OUTLET: Power,
  MULTI_SWITCH: ToggleRight,
  SAFETY_TIMED: Timer,
  SCHEDULED_LIGHT: Sun,
  CAMERA: Camera,
};

interface Props extends LucideProps {
  type: DeviceType;
}

export function DeviceIcon({ type, ...rest }: Props) {
  const Icon = ICONS[type] ?? Power;
  return <Icon {...rest} />;
}
