// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: 'studio-4305945131-b5e3e',
  appId: '1:538411774967:web:cc1531f5ac1c2d300d74f2',
  apiKey: 'AIzaSyCgIzj_07NSPAq2euBvX968oJZodMICIE4',
  authDomain: 'studio-4305945131-b5e3e.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '538411774967',
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
