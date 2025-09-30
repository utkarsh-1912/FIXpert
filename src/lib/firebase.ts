// src/lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';

const firebaseConfig = {
  projectId: 'studio-4305945131-b5e3e',
  appId: '1:538411774967:web:cc1531f5ac1c2d300d74f2',
  apiKey: 'AIzaSyAgnLS2jKHKlYUUbRCadpIzVTue0cFmhyo',
  authDomain: 'studio-4305945131-b5e3e.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '538411774967',
};

// Initialize Firebase
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export { app };
