import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthUser, UserRole } from '@/types';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider, getFriendlyFirebaseError } from '@/lib/firebase';
import { authApi, getStoredToken } from '@/services/api';

// ============================================================
// Types
// ============================================================

interface AuthContextValue {
  user: AuthUser | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isEmailVerified: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    password: string,
    phone?: string,
    businessName?: string
  ) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resendVerificationEmail: () => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  loginAsDemo: (userId: string) => Promise<{ success: boolean; error?: string }>;
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
}

// ============================================================
// Context
// ============================================================

const AuthContext = createContext<AuthContextValue | null>(null);

// ============================================================
// Provider
// ============================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync Firebase User with MaanakVerify Backend
  const syncWithBackend = useCallback(async (fbUser: FirebaseUser, extra?: { name?: string; phone?: string; businessName?: string }) => {
    try {
      const idToken = await fbUser.getIdToken();
      const syncedUser = await authApi.sync({
        name: extra?.name || fbUser.displayName || undefined,
        phone: extra?.phone || fbUser.phoneNumber || undefined,
        businessName: extra?.businessName || undefined,
      }, idToken);

      const authUser: AuthUser = {
        id: syncedUser.id,
        name: syncedUser.name,
        email: syncedUser.email,
        role: syncedUser.role,
        phone: syncedUser.phone,
        businessId: syncedUser.businessId,
        inspectorId: syncedUser.inspectorId,
      };

      setUser(authUser);
      return authUser;
    } catch (err) {
      console.error('Failed to sync user with backend:', err);
      // Try getMe as fallback
      try {
        const me = await authApi.getMe();
        const authUser: AuthUser = {
          id: me.id,
          name: me.name,
          email: me.email,
          role: me.role,
          phone: me.phone,
          businessId: me.businessId,
          inspectorId: me.inspectorId,
        };
        setUser(authUser);
        return authUser;
      } catch {
        return null;
      }
    }
  }, []);

  // On mount: listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        await syncWithBackend(fbUser);
      } else {
        setFirebaseUser(null);
        // Fallback check for offline/test session tokens
        const storedToken = getStoredToken();
        if (storedToken) {
          try {
            const me = await authApi.getMe();
            setUser({
              id: me.id,
              name: me.name,
              email: me.email,
              role: me.role,
              phone: me.phone,
              businessId: me.businessId,
              inspectorId: me.inspectorId,
            });
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [syncWithBackend]);

  // Email + Password Sign In
  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        setFirebaseUser(cred.user);
        const synced = await syncWithBackend(cred.user);
        if (!synced) {
          return { success: false, error: 'Failed to synchronize user account with MaanakVerify.' };
        }
        return { success: true };
      } catch (err: any) {
        return { success: false, error: getFriendlyFirebaseError(err) };
      }
    },
    [syncWithBackend]
  );

  // Google Sign In
  const loginWithGoogle = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      setFirebaseUser(cred.user);
      const synced = await syncWithBackend(cred.user);
      if (!synced) {
        return { success: false, error: 'Failed to synchronize Google account with MaanakVerify.' };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: getFriendlyFirebaseError(err) };
    }
  }, [syncWithBackend]);

  // Email + Password Registration
  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      phone?: string,
      businessName?: string
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        
        // Update display name in Firebase profile
        await updateProfile(cred.user, { displayName: name.trim() }).catch(() => {});

        // Send verification email
        await sendEmailVerification(cred.user).catch((e) => {
          console.warn('Could not send verification email immediately:', e);
        });

        setFirebaseUser(cred.user);

        // Sync with MaanakVerify database
        await syncWithBackend(cred.user, {
          name: name.trim(),
          phone: phone?.trim(),
          businessName: businessName?.trim(),
        });

        return { success: true };
      } catch (err: any) {
        return { success: false, error: getFriendlyFirebaseError(err) };
      }
    },
    [syncWithBackend]
  );

  // Password Reset Email
  const resetPassword = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { success: true };
    } catch (err: any) {
      return { success: false, error: getFriendlyFirebaseError(err) };
    }
  }, []);

  // Resend Email Verification
  const resendVerificationEmail = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!auth.currentUser) {
      return { success: false, error: 'No active session found.' };
    }
    try {
      await sendEmailVerification(auth.currentUser);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: getFriendlyFirebaseError(err) };
    }
  }, []);

  // Refresh User State & Verification Status
  const refreshUser = useCallback(async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setFirebaseUser({ ...auth.currentUser });
      await syncWithBackend(auth.currentUser);
    }
  }, [syncWithBackend]);

  // Sign Out
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      await authApi.logout();
    } finally {
      setUser(null);
      setFirebaseUser(null);
    }
  }, []);

  // Demo Login (development / judge convenience fallback)
  const loginAsDemo = useCallback(async (userId: string) => {
    try {
      const { user: userData } = await authApi.demoLogin(userId);
      const authUser: AuthUser = {
        id:          userData.id,
        name:        userData.name,
        email:       userData.email,
        role:        userData.role,
        phone:       userData.phone,
        businessId:  userData.businessId,
        inspectorId: userData.inspectorId,
      };
      setUser(authUser);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Demo login failed.' };
    }
  }, []);

  const hasRole = useCallback(
    (role: UserRole) => user?.role === role,
    [user]
  );

  const value: AuthContextValue = {
    user,
    firebaseUser,
    isLoading,
    isEmailVerified: firebaseUser?.emailVerified ?? true,
    login,
    loginWithGoogle,
    register,
    resetPassword,
    resendVerificationEmail,
    refreshUser,
    logout,
    loginAsDemo,
    isAuthenticated: user !== null,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================
// Hook
// ============================================================

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
