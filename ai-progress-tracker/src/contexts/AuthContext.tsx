'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import {
  User,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  Auth,
} from 'firebase/auth';
import { doc, setDoc, getDoc, Firestore } from 'firebase/firestore';
import { auth as firebaseAuth, db as firebaseDb, googleProvider, githubProvider } from '@/lib/firebase';
import { UserProfile } from '@/types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);
  
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || 
    !process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  // Get Firebase instances (will be null in demo mode)
  const auth = firebaseAuth.current as Auth | null;
  const db = firebaseDb.current as Firestore | null;

  // Initialize auth state
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (isDemoMode) {
      // Demo mode: Load from localStorage asynchronously
      const initDemo = async () => {
        await new Promise(resolve => requestAnimationFrame(resolve));
        const savedProfile = localStorage.getItem('demoUserProfile');
        if (savedProfile) {
          const profile = JSON.parse(savedProfile);
          setUserProfile(profile);
          setUser({ uid: profile.uid, email: profile.email, displayName: profile.displayName } as User);
        }
        setLoading(false);
      };
      initDemo();
      return;
    }

    if (!auth || !db) {
      requestAnimationFrame(() => setLoading(false));
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const profileDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (profileDoc.exists()) {
          setUserProfile(profileDoc.data() as UserProfile);
        } else {
          // Create new profile
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Anonymous',
            photoURL: firebaseUser.photoURL,
            shareProgress: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
          setUserProfile(newProfile);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isDemoMode, auth, db]);

  const createOrUpdateProfile = useCallback(async (firebaseUser: User) => {
    if (!db) return;
    
    const profileRef = doc(db, 'users', firebaseUser.uid);
    const profileDoc = await getDoc(profileRef);
    
    if (!profileDoc.exists()) {
      const newProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'Anonymous',
        photoURL: firebaseUser.photoURL,
        shareProgress: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await setDoc(profileRef, newProfile);
      setUserProfile(newProfile);
    } else {
      setUserProfile(profileDoc.data() as UserProfile);
    }
  }, [db]);

  const signInWithGoogle = useCallback(async () => {
    if (isDemoMode) {
      const profile: UserProfile = {
        uid: 'demo-user-' + Date.now(),
        email: 'demo@example.com',
        displayName: 'Demo User',
        photoURL: null,
        shareProgress: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      localStorage.setItem('demoUserProfile', JSON.stringify(profile));
      setUserProfile(profile);
      setUser({ uid: profile.uid, email: profile.email, displayName: profile.displayName } as User);
      return;
    }
    
    if (!auth) throw new Error('Firebase not initialized');
    const result = await signInWithPopup(auth, googleProvider);
    await createOrUpdateProfile(result.user);
  }, [isDemoMode, auth, createOrUpdateProfile]);

  const signInWithGithub = useCallback(async () => {
    if (isDemoMode) {
      return signInWithGoogle();
    }
    
    if (!auth) throw new Error('Firebase not initialized');
    const result = await signInWithPopup(auth, githubProvider);
    await createOrUpdateProfile(result.user);
  }, [isDemoMode, auth, signInWithGoogle, createOrUpdateProfile]);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (isDemoMode) {
      const profile: UserProfile = {
        uid: 'demo-user-' + Date.now(),
        email: email,
        displayName: email.split('@')[0],
        photoURL: null,
        shareProgress: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      localStorage.setItem('demoUserProfile', JSON.stringify(profile));
      setUserProfile(profile);
      setUser({ uid: profile.uid, email: profile.email, displayName: profile.displayName } as User);
      return;
    }
    
    if (!auth) throw new Error('Firebase not initialized');
    const result = await signInWithEmailAndPassword(auth, email, password);
    await createOrUpdateProfile(result.user);
  }, [isDemoMode, auth, createOrUpdateProfile]);

  const signUpWithEmail = useCallback(async (email: string, password: string, displayName: string) => {
    if (isDemoMode) {
      const profile: UserProfile = {
        uid: 'demo-user-' + Date.now(),
        email: email,
        displayName: displayName,
        photoURL: null,
        shareProgress: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      localStorage.setItem('demoUserProfile', JSON.stringify(profile));
      setUserProfile(profile);
      setUser({ uid: profile.uid, email: profile.email, displayName: profile.displayName } as User);
      return;
    }
    
    if (!auth) throw new Error('Firebase not initialized');
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    await createOrUpdateProfile(result.user);
  }, [isDemoMode, auth, createOrUpdateProfile]);

  const signOut = useCallback(async () => {
    if (isDemoMode) {
      localStorage.removeItem('demoUserProfile');
      localStorage.removeItem('demoProgress');
      setUser(null);
      setUserProfile(null);
      return;
    }
    
    if (!auth) return;
    await firebaseSignOut(auth);
    setUserProfile(null);
  }, [isDemoMode, auth]);

  const updateUserProfileFn = useCallback(async (data: Partial<UserProfile>) => {
    if (!user) return;
    
    const updatedProfile = {
      ...userProfile,
      ...data,
      updatedAt: Date.now(),
    } as UserProfile;

    if (isDemoMode) {
      localStorage.setItem('demoUserProfile', JSON.stringify(updatedProfile));
      setUserProfile(updatedProfile);
      return;
    }
    
    if (!db) return;
    await setDoc(doc(db, 'users', user.uid), updatedProfile, { merge: true });
    setUserProfile(updatedProfile);
  }, [user, userProfile, isDemoMode, db]);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signInWithGoogle,
        signInWithGithub,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        updateUserProfile: updateUserProfileFn,
        isDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
