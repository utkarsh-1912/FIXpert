// src/lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  appId: "your-app-id",
};

// Initialize Firebase
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
