import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBY5pXm-TRg5UkLBaDbBuW7mrffcl6tAc4",
  authDomain: "upi-shield-abc05.firebaseapp.com",
  projectId: "upi-shield-abc05",
  storageBucket: "upi-shield-abc05.firebasestorage.app",
  messagingSenderId: "908989066745",
  appId: "1:908989066745:web:2318d5f3b9aae7f0906128"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
