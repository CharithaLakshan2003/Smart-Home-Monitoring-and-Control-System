// ── Type definitions (mirrors the Android app's data models) ──

export type DeviceType =
  | 'OUTLET'
  | 'MULTI_SWITCH'
  | 'SAFETY_TIMED'
  | 'SCHEDULED_LIGHT'
  | 'CAMERA';

export type DeviceState = 'ON' | 'OFF' | 'ERROR' | 'DISCONNECTED';

export interface Device {
  id: string;
  floorId: string;
  label: string;
  type: DeviceType;
  state: DeviceState;
  gridX: number;
  gridY: number;
  // Multi-Switch
  switchCount: number;
  switchNames: string[];
  switchStates: boolean[];
  // Safety-Timed
  maxOnDurationSec: number;
  turnedOnAt: number;
  autoOffTriggered: boolean;
  // Scheduled Light
  scheduleStart: string;
  scheduleEnd: string;
  scheduleEnabled: boolean;
  // Camera
  snapshotUrl: string;
  streamUrl: string;
  // Common
  lastUpdated: number;
}

export interface Floor {
  id: string;
  name: string;
  imageUrl: string;
  gridRows: number;
  gridCols: number;
  userId: string;
  deviceCount: number;
  onCount: number;
  alertCount: number;
}

export interface Alert {
  id: string;
  userId: string;
  deviceId: string;
  floorId: string;
  deviceName: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export interface UsageLog {
  id: string;
  userId: string;
  deviceId: string;
  deviceName: string;
  floorId: string;
  onTime: number;
  offTime: number;
  durationSeconds: number;
}

export type DateRange = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH';

export const DATE_RANGE_LABELS: Record<DateRange, string> = {
  TODAY: 'Today',
  THIS_WEEK: 'This Week',
  THIS_MONTH: 'This Month',
};

export const DEVICE_TYPE_LABELS: Record<DeviceType, string> = {
  OUTLET: 'Outlet',
  MULTI_SWITCH: 'Multi-Switch',
  SAFETY_TIMED: 'Safety-Timed',
  SCHEDULED_LIGHT: 'Scheduled Light',
  CAMERA: 'Camera',
};
