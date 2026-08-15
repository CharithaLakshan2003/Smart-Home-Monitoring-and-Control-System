import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';
import type { Floor } from '../types';

/** Live read-only subscription to all floors. */
export function useFloors(): Record<string, Floor> {
  const [floors, setFloors] = useState<Record<string, Floor>>({});

  useEffect(() => {
    const floorsRef = ref(database, 'floors');
    const unsubscribe = onValue(floorsRef, (snapshot) => {
      const next: Record<string, Floor> = {};
      snapshot.forEach((child) => {
        next[child.key!] = {
          id: child.key!,
          name: '',
          imageUrl: 'plan_1',
          gridRows: 4,
          gridCols: 4,
          userId: '',
          deviceCount: 0,
          onCount: 0,
          alertCount: 0,
          ...child.val(),
        };
      });
      setFloors(next);
    });
    return () => unsubscribe();
  }, []);

  return floors;
}
