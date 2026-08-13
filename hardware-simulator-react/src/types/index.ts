// ── TypeScript Type Definitions ──

export type DeviceType = 'OUTLET' | 'MULTI_SWITCH' | 'SAFETY_TIMED' | 'SCHEDULED_LIGHT' | 'CAMERA';

export type DeviceState = 'ON' | 'OFF' | 'ERROR' | 'DISCONNECTED';

export type LogIconType = 'on' | 'off' | 'error' | 'disconnected' | 'switch';

export type PlanStyleId = 'plan_1' | 'plan_2' | 'plan_3' | 'plan_4' | 'plan_5';

export interface Device {
  id: string;
  floorId: string;
  label: string;
  type: DeviceType;
  state: DeviceState;
  gridX: number;
  gridY: number;
  // Multi-Switch fields
  switchCount: number;
  switchNames: string[];
  switchStates: boolean[];
  // Safety-Timed fields
  maxOnDurationSec: number;
  turnedOnAt: number;
  autoOffTriggered: boolean;
  // Scheduled Light fields
  scheduleStart: string;
  scheduleEnd: string;
  scheduleEnabled: boolean;
  // Camera fields
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

export interface ActivityLogEntry {
  deviceName: string;
  message: string;
  iconType: LogIconType;
  time: string;
}

export interface PlanStyle {
  name: string;
  bgColor: string;
  borderColor: string;
  gridLineColor: string;
}
