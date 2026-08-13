import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Using the same Firebase project as the mobile app
const firebaseConfig = {
  apiKey: 'AIzaSyDoTPNjXnYksZ9TqqpH4VOgddPe7iO1rw0',
  databaseURL: 'https://smart-home-1c2af-default-rtdb.firebaseio.com',
  projectId: 'smart-home-1c2af',
  storageBucket: 'smart-home-1c2af.firebasestorage.app',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
