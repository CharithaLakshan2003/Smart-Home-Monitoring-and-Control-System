import { useState, useEffect, useRef, useCallback } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';
import type { Device, ActivityLogEntry, LogIconType } from '../types';

interface UseDevicesReturn {
  devices: Record<string, Device>;
  activityLog: ActivityLogEntry[];
  clearLog: () => void;
}

export function useDevices(): UseDevicesReturn {
  const [devices, setDevices] = useState<Record<string, Device>>({});
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const prevDevicesRef = useRef<Record<string, Device>>({});
  const isFirstLoad = useRef(true);

  const addLogEntry = useCallback(
    (deviceName: string, message: string, iconType: LogIconType) => {
      const now = new Date();
      const time = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });

      setActivityLog((prev) => {
        const newLog = [{ deviceName, message, iconType, time }, ...prev];
        return newLog.slice(0, 100); // Keep last 100
      });
    },
    []
  );

  const clearLog = useCallback(() => {
    setActivityLog([]);
  }, []);

  useEffect(() => {
    const devicesRef = ref(database, 'devices');
    const unsubscribe = onValue(devicesRef, (snapshot) => {
      const newDevices: Record<string, Device> = {};
      snapshot.forEach((child) => {
        const data = child.val();
        newDevices[child.key!] = {
          id: child.key!,
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
        };
      });

      // Detect changes for activity log (skip first load)
      if (!isFirstLoad.current) {
        const oldDevices = prevDevicesRef.current;

        for (const id in newDevices) {
          const newDev = newDevices[id];
          const oldDev = oldDevices[id];

          if (!oldDev) {
            addLogEntry(newDev.label || id, `Device added (${newDev.type || 'OUTLET'})`, 'on');
            continue;
          }

          // State change
          if (oldDev.state !== newDev.state) {
            const stateClass = (newDev.state || 'OFF').toLowerCase();
            const iconType: LogIconType =
              stateClass === 'on'
                ? 'on'
                : stateClass === 'error'
                  ? 'error'
                  : stateClass === 'disconnected'
                    ? 'disconnected'
                    : 'off';
            addLogEntry(
              newDev.label || id,
              `State changed: ${oldDev.state || 'OFF'} → ${newDev.state || 'OFF'}`,
              iconType
            );
          }

          // Switch state changes
          if (newDev.switchStates && oldDev.switchStates) {
            for (let i = 0; i < newDev.switchStates.length; i++) {
              if (oldDev.switchStates[i] !== newDev.switchStates[i]) {
                const switchName =
                  (newDev.switchNames && newDev.switchNames[i]) || `Switch ${i + 1}`;
                addLogEntry(
                  newDev.label || id,
                  `${switchName}: ${newDev.switchStates[i] ? 'ON' : 'OFF'}`,
                  'switch'
                );
              }
            }
          }

          // Auto-off triggered
          if (!oldDev.autoOffTriggered && newDev.autoOffTriggered) {
            addLogEntry(newDev.label || id, 'Auto-off triggered (safety cutoff)', 'error');
          }
        }

        // Detect deleted devices
        for (const id in oldDevices) {
          if (!newDevices[id]) {
            addLogEntry(oldDevices[id].label || id, 'Device removed', 'off');
          }
        }
      }

      isFirstLoad.current = false;
      prevDevicesRef.current = newDevices;
      setDevices(newDevices);
    });

    return () => unsubscribe();
  }, [addLogEntry]);

  return { devices, activityLog, clearLog };
}
