import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyFakeKeyForDevLocal",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "microalgae-carbon-capture.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://microalgae-carbon-capture-default-rtdb.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "microalgae-carbon-capture",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "microalgae-carbon-capture.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

let app: any;
let database: any;
let firestore: any;
let auth: any;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  database = getDatabase(app);
  firestore = getFirestore(app);
  auth = getAuth(app);
} catch (e) {
  console.warn("Firebase client initialized in fallback mode:", e);
}

export { app, database, firestore, auth };
