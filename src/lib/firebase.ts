// ============================================================
// ORCA — Firebase Authentication & Firestore Data Storage Service
// ============================================================

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

// Firebase configuration from env or fallback
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'orca-marine.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'orca-marine',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'orca-marine.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:abcdef',
};

// Determine if real credentials are configured
export const isFirebaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
);

// Initialize Firebase SDK safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  vesselName?: string;
  homePort?: string;
  role?: 'fisherman' | 'captain' | 'researcher' | 'authority';
  createdAt?: string;
}

export interface StoredFishingZone {
  id: string;
  name: string;
  center: { lat: number; lon: number };
  suitabilityScore: number;
  sst: number;
  chlorophyll: number;
  savedAt: string;
}

export interface StoredQueryLog {
  id?: string;
  userId: string;
  question: string;
  safetyScore: number;
  timestamp: string;
}

// ---- Firestore CRUD Operations ----

// Save user profile to Firestore
export async function saveUserProfileToFirestore(profile: UserProfile): Promise<boolean> {
  if (!isFirebaseConfigured) {
    // Offline local storage fallback
    if (typeof window !== 'undefined') {
      localStorage.setItem('orca_user_profile', JSON.stringify(profile));
    }
    return true;
  }

  try {
    const userRef = doc(db, 'users', profile.uid);
    await setDoc(userRef, {
      ...profile,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn('[Firebase] Firestore user profile save error:', err);
    return false;
  }
}

// Save favorite fishing zone to Firestore
export async function saveFavoriteZoneToFirestore(userId: string, zone: StoredFishingZone): Promise<boolean> {
  if (!isFirebaseConfigured) {
    if (typeof window !== 'undefined') {
      const existing = JSON.parse(localStorage.getItem(`orca_zones_${userId}`) || '[]');
      const updated = [zone, ...existing.filter((z: StoredFishingZone) => z.id !== zone.id)];
      localStorage.setItem(`orca_zones_${userId}`, JSON.stringify(updated));
    }
    return true;
  }

  try {
    const docRef = doc(db, `users/${userId}/favorite_zones`, zone.id);
    await setDoc(docRef, zone);
    return true;
  } catch (err) {
    console.warn('[Firebase] Firestore zone save error:', err);
    return false;
  }
}

// Get user's saved favorite fishing zones
export async function getFavoriteZonesFromFirestore(userId: string): Promise<StoredFishingZone[]> {
  if (!isFirebaseConfigured) {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem(`orca_zones_${userId}`) || '[]');
    }
    return [];
  }

  try {
    const colRef = collection(db, `users/${userId}/favorite_zones`);
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map((doc) => doc.data() as StoredFishingZone);
  } catch (err) {
    console.warn('[Firebase] Firestore fetch zones error:', err);
    return [];
  }
}

// Log user AI Assistant query to Firestore
export async function logQueryToFirestore(userId: string, question: string, safetyScore: number): Promise<boolean> {
  const queryItem: StoredQueryLog = {
    userId,
    question,
    safetyScore,
    timestamp: new Date().toISOString(),
  };

  if (!isFirebaseConfigured) {
    if (typeof window !== 'undefined') {
      const existing = JSON.parse(localStorage.getItem(`orca_queries_${userId}`) || '[]');
      localStorage.setItem(`orca_queries_${userId}`, JSON.stringify([queryItem, ...existing].slice(0, 20)));
    }
    return true;
  }

  try {
    const colRef = collection(db, `users/${userId}/query_logs`);
    await addDoc(colRef, queryItem);
    return true;
  } catch (err) {
    console.warn('[Firebase] Firestore log query error:', err);
    return false;
  }
}
