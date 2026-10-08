import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyAICLoWhudYlTb7Zm6DpmP2hMmnglN4U9Y",
  authDomain: "tienda-de-sol.firebaseapp.com",
  projectId: "tienda-de-sol",
  storageBucket: "tienda-de-sol.firebasestorage.app",
  messagingSenderId: "884228244792",
  appId: "1:884228244792:web:1c76a53ff8d633fbe62dcd",
  measurementId: "G-P9SL9R3R8J"
};

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  timestamp: string;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    timestamp: new Date().toISOString()
  };
  console.warn('[Firebase Firestore Warning/Notice]:', JSON.stringify(errInfo));
}

// Test connection helper
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, '_aura_health', 'ping'));
    return true;
  } catch (err) {
    // If permission or offline
    console.log('[Firestore ping note]:', err);
    return false;
  }
}
