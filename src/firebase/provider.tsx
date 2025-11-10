'use client';

import { createContext, useContext, ReactNode } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

interface FirebaseContextValue {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

export function FirebaseProvider({ children, firebaseApp, auth, firestore }: FirebaseProviderProps) {
  const value = { firebaseApp, auth, firestore };
  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>;
}

export const useFirebase = (): FirebaseContextValue => {
    const context = useContext(FirebaseContext);
    if (!context) {
        throw new Error('useFirebase must be used within a FirebaseProvider');
    }
    return context;
}

export const useFirebaseApp = (): FirebaseApp => {
    const context = useFirebase();
    if (!context.firebaseApp) {
        throw new Error('Firebase App not available');
    }
    return context.firebaseApp;
}

export const useAuth = (): Auth => {
    const context = useFirebase();
    if (!context.auth) {
        throw new Error('Firebase Auth not available');
    }
    return context.auth;
}

export const useFirestore = (): Firestore => {
    const context = useFirebase();
    if (!context.firestore) {
        throw new Error('Firebase Firestore not available');
    }
    return context.firestore;
}
