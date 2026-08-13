import {
  Plug,
  ToggleRight,
  Flame,
  Lightbulb,
  Video,
  type LucideIcon,
} from 'lucide-react';
import type { DeviceType, PlanStyle, PlanStyleId } from '../types';

// ── Device Type Icons ──
const DEVICE_ICON_MAP: Record<DeviceType, LucideIcon> = {
  OUTLET: Plug,
  MULTI_SWITCH: ToggleRight,
  SAFETY_TIMED: Flame,
  SCHEDULED_LIGHT: Lightbulb,
  CAMERA: Video,
};

export function getDeviceIcon(type: DeviceType): LucideIcon {
  return DEVICE_ICON_MAP[type] || Plug;
}

// ── Device Type Display Names ──
const DEVICE_TYPE_NAMES: Record<DeviceType, string> = {
  OUTLET: 'Electrical Outlet',
  MULTI_SWITCH: 'Multi-Switch Unit',
  SAFETY_TIMED: 'Safety-Timed Device',
  SCHEDULED_LIGHT: 'Scheduled Light',
  CAMERA: 'Security Camera',
};

export function getDeviceTypeName(type: DeviceType): string {
  return DEVICE_TYPE_NAMES[type] || type;
}

// ── Duration Formatter ──
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// ── Plan Style Colors ──
const PLAN_STYLES: Record<PlanStyleId, PlanStyle> = {
  plan_1: {
    name: 'Blueprint',
    bgColor: 'rgba(26, 35, 126, 0.35)',
    borderColor: 'rgba(26, 35, 126, 0.6)',
    gridLineColor: 'rgba(130, 177, 255, 0.15)',
  },
  plan_2: {
    name: 'Modern',
    bgColor: 'rgba(0, 77, 64, 0.35)',
    borderColor: 'rgba(0, 77, 64, 0.6)',
    gridLineColor: 'rgba(128, 203, 196, 0.15)',
  },
  plan_3: {
    name: 'Classic',
    bgColor: 'rgba(62, 39, 35, 0.35)',
    borderColor: 'rgba(62, 39, 35, 0.6)',
    gridLineColor: 'rgba(188, 170, 164, 0.15)',
  },
  plan_4: {
    name: 'Minimal',
    bgColor: 'rgba(55, 71, 79, 0.35)',
    borderColor: 'rgba(55, 71, 79, 0.6)',
    gridLineColor: 'rgba(176, 190, 197, 0.15)',
  },
  plan_5: {
    name: 'Bright',
    bgColor: 'rgba(27, 94, 32, 0.35)',
    borderColor: 'rgba(27, 94, 32, 0.6)',
    gridLineColor: 'rgba(165, 214, 167, 0.15)',
  },
};

export function getPlanStyle(imageUrl: string): PlanStyle {
  return PLAN_STYLES[imageUrl as PlanStyleId] || PLAN_STYLES.plan_1;
}

// ── Device Type Sort Order ──
const TYPE_ORDER: DeviceType[] = ['OUTLET', 'MULTI_SWITCH', 'SAFETY_TIMED', 'SCHEDULED_LIGHT', 'CAMERA'];

export function getDeviceTypeSortOrder(type: DeviceType): number {
  const idx = TYPE_ORDER.indexOf(type);
  return idx >= 0 ? idx : 999;
}
