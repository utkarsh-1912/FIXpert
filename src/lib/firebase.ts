// src/lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyCgIzj_07NSPAq2euBvX968oJZodMICIE4",
  authDomain: "studio-4305945131-b5e3e.firebaseapp.com",
  projectId: "studio-4305945131-b5e3e",
  appId: "1:538411774967:web:eee4cc3c5f6d694d0d74f2",
};

let app: FirebaseApp;

// Initialize Firebase
export function getFirebaseApp(): FirebaseApp {
    if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
    } else {
        app = getApp();
    }
    return app;
}
