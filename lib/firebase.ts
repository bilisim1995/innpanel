import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAwiQhr9W76_lu14pojXpen07x6PPwsat0",
  authDomain: "innpanel.firebaseapp.com",
  projectId: "innpanel",
  storageBucket: "innpanel.firebasestorage.app",
  messagingSenderId: "806238157165",
  appId: "1:806238157165:web:6ed066e0eee2a70c92c264",
  measurementId: "G-HFJ43XHXB9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable public access for Firestore in browser environment
if (typeof window !== 'undefined') {
  // Set persistence to local for better offline experience
  import('firebase/auth').then(({ setPersistence, browserLocalPersistence }) => {
    setPersistence(auth, browserLocalPersistence).catch(error => {
      console.error('Auth persistence error:', error);
    });
  });
}


export default app;