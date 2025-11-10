// This file is the "barrel" for all firebase related files.
// It exports all the necessary components and hooks to be used in the app.

import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';

import { firebaseConfig } from './config';

// Hooks
export { useUser } from './auth/use-user';
export { useCollection } from './firestore/use-collection';
export { useDoc } from './firestore/use-doc';

// Components
export { FirebaseProvider, useFirebase, useFirebaseApp, useFirestore, useAuth } from './provider';

// Initialize firebase
export function initializeFirebase(config: FirebaseOptions = firebaseConfig): {
  firebaseApp: any;
  firestore: Firestore;
  auth: Auth;
} {
  if (getApps().length) {
    const firebaseApp = getApp();
    const firestore = getFirestore(firebaseApp);
    const auth = getAuth(firebaseApp);
    return { firebaseApp, firestore, auth };
  }

  const firebaseApp = initializeApp(config);
  const firestore = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);

  return { firebaseApp, firestore, auth };
}
