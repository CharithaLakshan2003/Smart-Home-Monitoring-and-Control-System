import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Same Firebase Realtime Database project used by the Android app and the
// hardware simulator. This dashboard only READS from it (monitor-only).
const firebaseConfig = {
  apiKey: 'AIzaSyDoTPNjXnYksZ9TqqpH4VOgddPe7iO1rw0',
  databaseURL: 'https://smart-home-1c2af-default-rtdb.firebaseio.com',
  projectId: 'smart-home-1c2af',
  storageBucket: 'smart-home-1c2af.firebasestorage.app',
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
