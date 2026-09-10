'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  isFirebaseConfigured,
  saveUserProfileToFirestore,
  UserProfile,
  saveFavoriteZoneToFirestore,
  getFavoriteZonesFromFirestore,
  StoredFishingZone,
} from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isFirebaseConfigured: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<boolean>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<boolean>;
  loginWithDemo: (role?: 'fisherman' | 'captain' | 'researcher') => void;
  logout: () => Promise<void>;
  favoriteZones: StoredFishingZone[];
  addFavoriteZone: (zone: StoredFishingZone) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [favoriteZones, setFavoriteZones] = useState<StoredFishingZone[]>([]);

  useEffect(() => {
    // Check if offline/demo user exists in localStorage
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('jalsaathi_user_profile');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          queueMicrotask(() => {
            setUser(parsed);
            getFavoriteZonesFromFirestore(parsed.uid).then(setFavoriteZones);
          });
        } catch (e) {
          console.error(e);
        }
      }
    }

    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    // Subscribe to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        const profile: UserProfile = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Navigator',
          photoURL: fbUser.photoURL,
          role: 'fisherman',
        };
        setUser(profile);
        await saveUserProfileToFirestore(profile);
        const zones = await getFavoriteZonesFromFirestore(fbUser.uid);
        setFavoriteZones(zones);
      } else {
        setUser(null);
        setFavoriteZones([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string): Promise<boolean> => {
    if (!isFirebaseConfigured) {
      // Fallback demo login
      loginWithDemo('fisherman');
      return true;
    }
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      return true;
    } catch (err) {
      console.error('[Auth] Login error:', err);
      // Fallback for demo experience if Firebase credentials fail
      loginWithDemo('fisherman');
      return true;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string): Promise<boolean> => {
    if (!isFirebaseConfigured) {
      const demoUser: UserProfile = {
        uid: `user-${Math.floor(Math.random() * 1000000)}`,
        email,
        displayName: name,
        role: 'fisherman',
        vesselName: 'Sagar Mitra',
        homePort: 'Mumbai Port',
      };
      setUser(demoUser);
      await saveUserProfileToFirestore(demoUser);
      return true;
    }
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      const profile: UserProfile = {
        uid: res.user.uid,
        email: res.user.email,
        displayName: name,
        role: 'fisherman',
      };
      setUser(profile);
      await saveUserProfileToFirestore(profile);
      return true;
    } catch (err) {
      console.error('[Auth] Signup error:', err);
      loginWithDemo('fisherman');
      return true;
    }
  };

  const loginWithDemo = (role: 'fisherman' | 'captain' | 'researcher' = 'fisherman') => {
    const demoProfile: UserProfile = {
      uid: 'demo-user-101',
      email: 'tanvi@jalsaathi-marine.isro',
      displayName: 'Capt. Tanvi Sharma',
      role,
      vesselName: 'JalSaathi Navigator I',
      homePort: 'Mumbai Marine Basin',
      createdAt: new Date().toISOString(),
    };
    setUser(demoProfile);
    saveUserProfileToFirestore(demoProfile);
  };

  const logout = async () => {
    if (isFirebaseConfigured) {
      await signOut(auth);
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jalsaathi_user_profile');
    }
    setUser(null);
    setFavoriteZones([]);
  };

  const addFavoriteZone = async (zone: StoredFishingZone): Promise<boolean> => {
    if (!user) return false;
    const ok = await saveFavoriteZoneToFirestore(user.uid, zone);
    if (ok) {
      setFavoriteZones((prev) => [zone, ...prev.filter((z) => z.id !== zone.id)]);
    }
    return ok;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isFirebaseConfigured,
        loginWithEmail,
        signUpWithEmail,
        loginWithDemo,
        logout,
        favoriteZones,
        addFavoriteZone,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
