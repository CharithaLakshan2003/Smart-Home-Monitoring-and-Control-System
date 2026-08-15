import { ref, update } from 'firebase/database';
import { database } from '../firebase';
import type { Device, DeviceState } from '../types';
import { addAlert } from './alertService';

/**
 * Write operations against `devices` — mirrors the Android DeviceRepository
 * and the toggle logic in DeviceViewModel.
 *
 * These use `update()` (partial writes) rather than `set()`, so a field the
 * dashboard does not model is never clobbered. Field names and the string form
 * of the enums match Device.kt exactly.
 *
 * Usage logs are intentionally NOT written here. The app derives them from an
 * ON->OFF transition observer (DeviceViewModel.observeUsageTransitions), so
 * logging from the dashboard as well would double-count every switch-off.
 */

/** Pads/truncates switchStates to switchCount so index writes are always safe. */
function normalizedSwitchStates(device: Device): boolean[] {
  const count = Math.max(device.switchCount ?? 1, device.switchStates?.length ?? 0);
  const states = Array.from({ length: count }, (_, i) => device.switchStates?.[i] ?? false);
  return states;
}

function switchLabel(device: Device, index: number): string {
  return device.switchNames?.[index] || `Switch ${index + 1}`;
}

/** Sets state + lastUpdated, and stamps turnedOnAt when switching ON. */
export async function setDeviceState(device: Device, state: DeviceState): Promise<void> {
  const now = Date.now();
  await update(ref(database, `devices/${device.id}`), {
    state,
    lastUpdated: now,
    ...(state === 'ON' ? { turnedOnAt: now } : {}),
  });
}

/**
 * Flips ON <-> OFF. Mirrors DeviceViewModel.toggleDeviceState: devices in
 * ERROR or DISCONNECTED are left alone, and an OFF->ON transition raises an
 * alert. `ownerUserId` should be the userId of the device's floor.
 */
export async function toggleDevice(device: Device, ownerUserId: string): Promise<void> {
  if (device.state !== 'ON' && device.state !== 'OFF') return;
  const newState: DeviceState = device.state === 'ON' ? 'OFF' : 'ON';
  const now = Date.now();

  await update(ref(database, `devices/${device.id}`), {
    state: newState,
    lastUpdated: now,
    ...(newState === 'ON' ? { turnedOnAt: now } : {}),
  });

  if (newState === 'ON') {
    await addAlert({
      userId: ownerUserId,
      deviceId: device.id,
      floorId: device.floorId,
      deviceName: device.label,
      message: `${device.label} turned on`,
      timestamp: now,
    });
  }
}

/**
 * Toggles one switch of a Multi-Switch device and re-derives the device state
 * (ON when any switch is on). Mirrors DeviceViewModel.toggleSwitch.
 */
export async function toggleSwitch(
  device: Device,
  switchIndex: number,
  ownerUserId: string
): Promise<void> {
  const states = normalizedSwitchStates(device);
  if (switchIndex < 0 || switchIndex >= states.length) return;

  const wasOn = states[switchIndex];
  states[switchIndex] = !wasOn;
  const anyOn = states.some(Boolean);
  const now = Date.now();

  await update(ref(database, `devices/${device.id}`), {
    switchStates: states,
    state: anyOn ? 'ON' : 'OFF',
    lastUpdated: now,
    ...(anyOn && device.state !== 'ON' ? { turnedOnAt: now } : {}),
  });

  await addAlert({
    userId: ownerUserId,
    deviceId: device.id,
    floorId: device.floorId,
    deviceName: device.label,
    message: `${switchLabel(device, switchIndex)} turned ${wasOn ? 'off' : 'on'}`,
    timestamp: now,
  });
}

/** Turns every switch of a Multi-Switch device on or off at once. */
export async function setAllSwitches(device: Device, isOn: boolean): Promise<void> {
  const states = normalizedSwitchStates(device).map(() => isOn);
  const now = Date.now();
  await update(ref(database, `devices/${device.id}`), {
    switchStates: states,
    state: isOn ? 'ON' : 'OFF',
    lastUpdated: now,
    ...(isOn ? { turnedOnAt: now } : {}),
  });
}

/** Updates the on/off window of a Scheduled Light. Times are "HH:mm". */
export async function updateSchedule(
  deviceId: string,
  schedule: { scheduleStart: string; scheduleEnd: string; scheduleEnabled: boolean }
): Promise<void> {
  await update(ref(database, `devices/${deviceId}`), {
    ...schedule,
    lastUpdated: Date.now(),
  });
}

/** Updates the auto-shutoff window of a Safety-Timed device, in seconds. */
export async function updateMaxOnDuration(
  deviceId: string,
  maxOnDurationSec: number
): Promise<void> {
  await update(ref(database, `devices/${deviceId}`), {
    maxOnDurationSec,
    lastUpdated: Date.now(),
  });
}
