import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import jwt from 'jsonwebtoken';
import { config } from '../config';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  try {
    // If a service account is provided via env, use it
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      initializeApp({
        credential: cert(serviceAccount),
        projectId: config.firebaseProjectId,
      });
    } else {
      // Default initialization with Project ID (uses Google JWKS for token verification)
      initializeApp({
        projectId: config.firebaseProjectId,
      });
    }
  } catch (err) {
    console.warn('Firebase Admin initialization warning:', err);
  }
}

export interface DecodedFirebaseUser {
  uid: string;
  email: string;
  name?: string;
  emailVerified?: boolean;
}

export async function verifyFirebaseToken(token: string): Promise<DecodedFirebaseUser | null> {
  // 1. Primary: Verify with Firebase Admin SDK
  try {
    const decoded = await getAuth().verifyIdToken(token);
    return {
      uid: decoded.uid,
      email: decoded.email || '',
      name: decoded.name || decoded.display_name || undefined,
      emailVerified: decoded.email_verified || false,
    };
  } catch (primaryErr) {
    // 2. Fallback: Development & automated test JWT tokens
    try {
      const decoded: any = jwt.verify(token, config.jwt.secret);
      if (decoded && (decoded.uid || decoded.id)) {
        return {
          uid: decoded.uid || decoded.id,
          email: decoded.email || '',
          name: decoded.name || undefined,
          emailVerified: decoded.emailVerified ?? true,
        };
      }
    } catch {
      // Both verifications failed
    }

    return null;
  }
}
