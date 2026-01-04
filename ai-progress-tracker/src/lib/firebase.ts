import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth as firebaseGetAuth, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  Auth 
} from 'firebase/auth';
import { getFirestore as firebaseGetFirestore, Firestore } from 'firebase/firestore';
import { getStorage as firebaseGetStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Lazy singleton pattern for Firebase services
let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;
let _initialized = false;

function initializeFirebase() {
  if (_initialized) return;
  _initialized = true;

  // Skip initialization in demo mode or during SSR without config
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || 
      !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    return;
  }

  try {
    _app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    _auth = firebaseGetAuth(_app);
    _db = firebaseGetFirestore(_app);
    _storage = firebaseGetStorage(_app);
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

// Initialize only on client side
if (typeof window !== 'undefined') {
  initializeFirebase();
}

// Export getters that handle demo mode gracefully
export const auth = {
  get current() {
    initializeFirebase();
    return _auth;
  }
};

export const db = {
  get current() {
    initializeFirebase();
    return _db;
  }
};

export const storage = {
  get current() {
    initializeFirebase();
    return _storage;
  }
};

// Auth providers
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

export default _app;
