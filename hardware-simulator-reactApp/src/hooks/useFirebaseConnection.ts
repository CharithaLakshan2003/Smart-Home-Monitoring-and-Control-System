import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';

export function useFirebaseConnection(): boolean {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const connRef = ref(database, '.info/connected');
    const unsubscribe = onValue(connRef, (snapshot) => {
      setIsConnected(snapshot.val() === true);
    });

    return () => unsubscribe();
  }, []);

  return isConnected;
}
