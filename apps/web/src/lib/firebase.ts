import { initializeApp, getApps, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

export const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/** Sem chaves públicas (ex.: build GitHub Pages), não inicializa — evita auth/invalid-api-key no export estático. */
export const isFirebaseConfigured = Boolean(
  typeof process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "string" &&
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY.trim().length > 0,
);

let app: FirebaseApp | undefined;
if (isFirebaseConfigured) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
}

if (typeof window !== "undefined" && app && firebaseConfig.measurementId) {
  import("firebase/analytics").then(({ getAnalytics }) => getAnalytics(app!));
}

export const db: Firestore | null = app ? getFirestore(app) : null;
export const auth: Auth | null = app ? getAuth(app) : null;

export default app ?? null;
