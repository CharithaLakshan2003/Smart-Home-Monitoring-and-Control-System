import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';

/** Tracks the Realtime Database connection state (`.info/connected`). */
export function useFirebaseConnection(): boolean {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const connectedRef = ref(database, '.info/connected');
    const unsubscribe = onValue(connectedRef, (snap) => {
      setIsConnected(snap.val() === true);
    });
    return () => unsubscribe();
  }, []);

  return isConnected;
}
