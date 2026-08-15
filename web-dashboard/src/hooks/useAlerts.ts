import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';
import type { Alert } from '../types';

/** Live read-only subscription to alerts, newest first. */
export function useAlerts(): Alert[] {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const alertsRef = ref(database, 'alerts');
    const unsubscribe = onValue(alertsRef, (snapshot) => {
      const list: Alert[] = [];
      snapshot.forEach((child) => {
        const val = child.val() ?? {};
        list.push({
          id: child.key!,
          userId: '',
          deviceId: '',
          floorId: '',
          deviceName: '',
          message: '',
          timestamp: 0,
          read: false,
          ...val,
        });
      });
      list.sort((a, b) => b.timestamp - a.timestamp);
      setAlerts(list);
    });
    return () => unsubscribe();
  }, []);

  return alerts;
}
