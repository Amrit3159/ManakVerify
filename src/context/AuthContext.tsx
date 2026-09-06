import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthUser, UserRole } from '@/types';
import {
  getAuthUser,
  setAuthUser,
  clearAuthUser,
  findUserByCredentials,
  findUserById,
  seedIfNeeded,
} from '@/data/localStorage';

// ============================================================
// Types
// ============================================================

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: (userId: string) => void;
  logout: () => void;
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
  const [isLoading, setIsLoading] = useState(true);

  // On mount: seed data and restore session
  useEffect(() => {
    seedIfNeeded();
    const stored = getAuthUser();
    if (stored) {
      setUser({
        id:          stored.id,
        name:        stored.name,
        email:       stored.email,
        role:        stored.role,
        phone:       stored.phone,
        businessId:  stored.businessId,
        inspectorId: stored.inspectorId,
      });
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      const found = findUserByCredentials(email, password);
      if (!found) {
        return { success: false, error: 'Invalid email or password.' };
      }
      const authUser: AuthUser = {
        id:          found.id,
        name:        found.name,
        email:       found.email,
        role:        found.role,
        phone:       found.phone,
        businessId:  found.businessId,
        inspectorId: found.inspectorId,
      };
      setAuthUser(found);
      setUser(authUser);
      return { success: true };
    },
    []
  );

  const loginAsDemo = useCallback((userId: string) => {
    const found = findUserById(userId);
    if (!found) return;
    const authUser: AuthUser = {
      id:          found.id,
      name:        found.name,
      email:       found.email,
      role:        found.role,
      phone:       found.phone,
      businessId:  found.businessId,
      inspectorId: found.inspectorId,
    };
    setAuthUser(found);
    setUser(authUser);
  }, []);

  const logout = useCallback(() => {
    clearAuthUser();
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (role: UserRole) => user?.role === role,
    [user]
  );

  const value: AuthContextValue = {
    user,
    isLoading,
    login,
    loginAsDemo,
    logout,
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
