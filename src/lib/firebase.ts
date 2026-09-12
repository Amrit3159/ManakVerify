import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  browserLocalPersistence,
  setPersistence,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase singleton
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Configure local session persistence
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn('Firebase persistence initialization error:', err);
});

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Convert Firebase error codes into clear, human-readable messages
export function getFriendlyFirebaseError(error: any): string {
  const code = typeof error === 'string' ? error : (error?.code || error?.message || '');
  
  if (process.env.NODE_ENV !== 'production') {
    console.error('[Firebase Auth Technical Details]:', { code, error });
  }

  switch (code) {
    case 'auth/operation-not-allowed':
    case 'OPERATION_NOT_ALLOWED':
      return 'Google Sign-In is not enabled in Firebase Console. Please enable the Google provider under Authentication → Sign-in method in Firebase Console.';
    case 'auth/unauthorized-domain':
      return 'This domain (e.g. localhost) is not authorized in Firebase Console. Please add it to Firebase Console → Authentication → Settings → Authorized domains.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled.';
    case 'auth/popup-blocked':
      return 'Your browser blocked the Google sign-in popup. Please allow popups for this site and try again.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with another sign-in method using this email address. Please sign in with that method instead.';
    case 'auth/cancelled-popup-request':
      return 'Only one sign-in attempt can be active at a time. Please complete or close the existing prompt.';
    case 'auth/invalid-api-key':
      return 'Firebase configuration is incorrect: invalid API key.';
    case 'auth/app-not-authorized':
      return 'This application is not authorized to use Firebase Authentication with this API key.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters with a combination of letters and numbers.';
    case 'auth/user-disabled':
      return 'This account has been disabled by an administrator.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please wait a few minutes before trying again.';
    case 'auth/internal-error':
      return 'An internal authentication error occurred. Please check your Firebase setup and try again.';
    default:
      if (typeof code === 'string' && code.includes('OPERATION_NOT_ALLOWED')) {
        return 'Google Sign-In is not enabled in Firebase Console. Please enable Google under Authentication → Sign-in method.';
      }
      return error?.message || 'Authentication failed. Please check your credentials and try again.';
  }
}
