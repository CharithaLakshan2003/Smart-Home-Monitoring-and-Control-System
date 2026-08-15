import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';
import type { Device } from '../types';

function normalizeDevice(id: string, data: Record<string, unknown>): Device {
  return {
    id,
    floorId: '',
    label: '',
    type: 'OUTLET',
    state: 'OFF',
    gridX: 0,
    gridY: 0,
    switchCount: 1,
    switchNames: [],
    switchStates: [],
    maxOnDurationSec: 1800,
    turnedOnAt: 0,
    autoOffTriggered: false,
    scheduleStart: '18:00',
    scheduleEnd: '23:00',
    scheduleEnabled: true,
    snapshotUrl: '',
    streamUrl: '',
    lastUpdated: 0,
    ...data,
  } as Device;
}

/** Live read-only subscription to all devices in the Realtime Database. */
export function useDevices(): Record<string, Device> {
  const [devices, setDevices] = useState<Record<string, Device>>({});

  useEffect(() => {
    const devicesRef = ref(database, 'devices');
    const unsubscribe = onValue(devicesRef, (snapshot) => {
      const next: Record<string, Device> = {};
      snapshot.forEach((child) => {
        next[child.key!] = normalizeDevice(child.key!, child.val() ?? {});
      });
      setDevices(next);
    });
    return () => unsubscribe();
  }, []);

  return devices;
}
