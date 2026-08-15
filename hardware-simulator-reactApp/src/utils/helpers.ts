import {
  Plug,
  ToggleRight,
  Flame,
  Lightbulb,
  Video,
  type LucideIcon,
} from 'lucide-react';
import type { DeviceType, PlanStyle, PlanStyleId } from '../types';

export interface RoomZone {
  name: string;
  rowStart: number;
  colStart: number;
  rowEnd: number;
  colEnd: number;
  color: string;
}

// 2x2 zoning: Kitchen (top-left), Bedroom (top-right), Bathroom (bottom-left), Living Area (bottom-right)
export const ROOM_ZONES: RoomZone[] = [
  { name: 'Kitchen', rowStart: 0, colStart: 0, rowEnd: 0.5, colEnd: 0.5, color: '#FFB74D' },
  { name: 'Bedroom', rowStart: 0, colStart: 0.5, rowEnd: 0.5, colEnd: 1, color: '#64B5F6' },
  { name: 'Bathroom', rowStart: 0.5, colStart: 0, rowEnd: 1, colEnd: 0.5, color: '#4DB6AC' },
  { name: 'Living Area', rowStart: 0.5, colStart: 0.5, rowEnd: 1, colEnd: 1, color: '#81C784' },
];

export function roomForCell(
  row: number,
  col: number,
  gridRows: number,
  gridCols: number,
): RoomZone | undefined {
  const fr = (row + 0.5) / gridRows;
  const fc = (col + 0.5) / gridCols;
  return ROOM_ZONES.find((z) => fr >= z.rowStart && fr < z.rowEnd && fc >= z.colStart && fc < z.colEnd);
}

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
    bgColor: 'rgba(26, 35, 126, 0.45)',
    borderColor: 'rgba(63, 81, 181, 0.8)',
    gridLineColor: 'rgba(197, 202, 233, 0.35)',
  },
  plan_2: {
    name: 'Modern',
    bgColor: 'rgba(0, 77, 64, 0.45)',
    borderColor: 'rgba(0, 137, 123, 0.8)',
    gridLineColor: 'rgba(128, 203, 196, 0.3)',
  },
  plan_3: {
    name: 'Classic',
    bgColor: 'rgba(62, 39, 35, 0.45)',
    borderColor: 'rgba(121, 85, 72, 0.8)',
    gridLineColor: 'rgba(215, 204, 200, 0.3)',
  },
  plan_4: {
    name: 'Minimal',
    bgColor: 'rgba(55, 71, 79, 0.45)',
    borderColor: 'rgba(84, 110, 122, 0.8)',
    gridLineColor: 'rgba(176, 190, 197, 0.3)',
  },
  plan_5: {
    name: 'Bright',
    bgColor: 'rgba(27, 94, 32, 0.45)',
    borderColor: 'rgba(56, 142, 60, 0.8)',
    gridLineColor: 'rgba(165, 214, 167, 0.3)',
  },
  plan_6: {
    name: 'Rooms',
    bgColor: 'rgba(40, 55, 71, 0.5)',
    borderColor: 'rgba(143, 166, 184, 0.9)',
    gridLineColor: 'rgba(170, 183, 184, 0.4)',
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
