import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { apiRegister, apiLogin, ApiUser } from '@/lib/api';
import { setSecureItem, getSecureItem } from '@/lib/storage';

const SESSION_KEY = 'raiox_session';

interface SessionData {
  user: ApiUser;
  isAdmin: boolean;
}

interface AuthContextType {
  user: ApiUser | null;
  profile: ApiUser | null;
  signUp: (email: string, metadata: Record<string, string>) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage
  useEffect(() => {
    const saved = getSecureItem<SessionData>(SESSION_KEY);
    if (saved?.user) {
      setUser(saved.user);
      setIsAdmin(saved.isAdmin);
    }
    setLoading(false);
  }, []);

  const persistSession = (data: SessionData | null) => {
    if (data) {
      setSecureItem(SESSION_KEY, data);
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  };

  const signUp = useCallback(async (email: string, metadata: Record<string, string>) => {
    try {
      const result = await apiRegister({
        name: metadata.name || '',
        email,
        gender: metadata.gender || '',
        region: metadata.region || '',
        birth_date: metadata.birthDate || '',
        whatsapp: metadata.whatsapp || '',
        profession: metadata.profession || '',
      });

      const session: SessionData = { user: result.user, isAdmin: false };
      setUser(result.user);
      setIsAdmin(false);
      persistSession(session);

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const result = await apiLogin(email, password);
      const session: SessionData = { user: result.user, isAdmin: result.isAdmin };
      setUser(result.user);
      setIsAdmin(result.isAdmin);
      persistSession(session);

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setIsAdmin(false);
    persistSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      profile: user,
      signUp,
      signIn,
      logout,
      isAuthenticated: !!user,
      isAdmin,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
