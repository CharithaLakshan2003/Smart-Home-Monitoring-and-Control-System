import type { DeviceState, DeviceType } from '../types';

// ── Device state → color (exact values from the app's Color.kt) ──
export const STATE_COLORS: Record<DeviceState, string> = {
  ON: '#4caf50', // DeviceOn
  OFF: '#757575', // DeviceOff
  ERROR: '#ff5252', // DeviceError
  DISCONNECTED: '#ffb74d', // DeviceDisconnected
};

// Glow color per state (mirrors the app's Glow* colors on the grid badge).
export const STATE_GLOW: Record<DeviceState, string> = {
  ON: 'rgba(76,175,80,0.45)',
  OFF: 'transparent',
  ERROR: 'rgba(255,82,82,0.45)',
  DISCONNECTED: 'rgba(255,183,77,0.45)',
};

export const STATE_LABELS: Record<DeviceState, string> = {
  ON: 'On',
  OFF: 'Off',
  ERROR: 'Error',
  DISCONNECTED: 'Disconnected',
};

export function isAlertState(state: DeviceState): boolean {
  return state === 'ERROR' || state === 'DISCONNECTED';
}

// ── Device type sort order (matches the app's grouping) ──
const TYPE_ORDER: DeviceType[] = [
  'OUTLET',
  'MULTI_SWITCH',
  'SAFETY_TIMED',
  'SCHEDULED_LIGHT',
  'CAMERA',
];

export function getDeviceTypeSortOrder(type: DeviceType): number {
  const idx = TYPE_ORDER.indexOf(type);
  return idx === -1 ? TYPE_ORDER.length : idx;
}

// ── Floor-plan background styles (mirrors the app's plan_1..plan_6) ──
export interface PlanStyle {
  bg: string;
  border: string;
  grid: string;
}

// Exact values from the app's PlanStyle.kt (solid backgrounds).
const PLAN_STYLES: Record<string, PlanStyle> = {
  plan_1: { bg: '#1a237e', border: '#3f51b5', grid: '#c5cae9' }, // Blueprint
  plan_2: { bg: '#004d40', border: '#00897b', grid: '#80cbc4' }, // Modern
  plan_3: { bg: '#3e2723', border: '#795548', grid: '#d7ccc8' }, // Classic
  plan_4: { bg: '#37474f', border: '#546e7a', grid: '#b0bec5' }, // Minimal
  plan_5: { bg: '#1b5e20', border: '#388e3c', grid: '#a5d6a7' }, // Bright
  plan_6: { bg: '#283747', border: '#8fa6b8', grid: '#aab7b8' }, // Rooms
};

export function getPlanStyle(id: string): PlanStyle {
  return PLAN_STYLES[id] ?? PLAN_STYLES.plan_1;
}

// ── Formatting ──
export function formatDuration(seconds: number): string {
  if (seconds <= 0) return '0s';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 && h === 0) parts.push(`${s}s`);
  return parts.length ? parts.join(' ') : '0s';
}

export function formatClock(timestamp: number): string {
  if (!timestamp) return '--:--';
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function formatRelativeTime(timestamp: number): string {
  if (!timestamp) return '';
  const diff = Date.now() - timestamp;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
