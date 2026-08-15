import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';
import type { UsageLog } from '../types';

/** Live read-only subscription to usage logs, newest first. */
export function useUsageLogs(): UsageLog[] {
  const [logs, setLogs] = useState<UsageLog[]>([]);

  useEffect(() => {
    const usageRef = ref(database, 'usage_logs');
    const unsubscribe = onValue(usageRef, (snapshot) => {
      const list: UsageLog[] = [];
      snapshot.forEach((child) => {
        const val = child.val() ?? {};
        list.push({
          id: child.key!,
          userId: '',
          deviceId: '',
          deviceName: '',
          floorId: '',
          onTime: 0,
          offTime: 0,
          durationSeconds: 0,
          ...val,
        });
      });
      list.sort((a, b) => b.onTime - a.onTime);
      setLogs(list);
    });
    return () => unsubscribe();
  }, []);

  return logs;
}
