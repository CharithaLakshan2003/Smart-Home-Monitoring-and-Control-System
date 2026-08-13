import { ref, update, set } from 'firebase/database';
import { database } from '../firebase';

export async function toggleDevice(deviceId: string, isOn: boolean): Promise<void> {
  const updates = {
    state: isOn ? 'ON' : 'OFF',
    lastUpdated: Date.now(),
  };
  await update(ref(database, `devices/${deviceId}`), updates);
}

export async function toggleSafetyDevice(deviceId: string, isOn: boolean): Promise<void> {
  const updates = {
    state: isOn ? 'ON' : 'OFF',
    turnedOnAt: isOn ? Date.now() : 0,
    autoOffTriggered: false,
    lastUpdated: Date.now(),
  };
  await update(ref(database, `devices/${deviceId}`), updates);
}

export async function toggleSwitch(
  deviceId: string,
  switchIndex: number,
  isOn: boolean
): Promise<void> {
  await set(ref(database, `devices/${deviceId}/switchStates/${switchIndex}`), isOn);
  await set(ref(database, `devices/${deviceId}/lastUpdated`), Date.now());
}

export async function toggleAllSwitches(
  deviceId: string,
  count: number,
  isOn: boolean
): Promise<void> {
  const newStates = Array(count).fill(isOn);
  await update(ref(database, `devices/${deviceId}`), {
    switchStates: newStates,
    state: isOn ? 'ON' : 'OFF',
    lastUpdated: Date.now(),
  });
}

export async function toggleSchedule(deviceId: string, enabled: boolean): Promise<void> {
  await update(ref(database, `devices/${deviceId}`), {
    scheduleEnabled: enabled,
    lastUpdated: Date.now(),
  });
}

export async function simulateState(
  deviceId: string,
  newState: 'ERROR' | 'DISCONNECTED' | 'OFF'
): Promise<void> {
  const updates: Record<string, unknown> = {
    state: newState,
    lastUpdated: Date.now(),
  };
  // If recovering, also clear auto-off
  if (newState === 'OFF') {
    updates.autoOffTriggered = false;
    updates.turnedOnAt = 0;
  }
  await update(ref(database, `devices/${deviceId}`), updates);
}
