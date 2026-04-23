import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { apiRegister, apiLogin, ApiUser } from '@/lib/api';
import { toast } from 'sonner';

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

  // Initialize session from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('raiox_user');
    const storedIsAdmin = localStorage.getItem('raiox_is_admin') === 'true';
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setIsAdmin(storedIsAdmin);
      } catch (err) {
        console.error('Failed to parse stored user', err);
        localStorage.removeItem('raiox_user');
        localStorage.removeItem('raiox_is_admin');
      }
    }
    setLoading(false);
  }, []);

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
      
      if (result.success && result.user) {
        setUser(result.user);
        localStorage.setItem('raiox_user', JSON.stringify(result.user));
        localStorage.setItem('raiox_is_admin', 'false');
      }
      
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const result = await apiLogin(email, password);
      
      if (result.success && result.user) {
        setUser(result.user);
        setIsAdmin(!!result.isAdmin);
        localStorage.setItem('raiox_user', JSON.stringify(result.user));
        localStorage.setItem('raiox_is_admin', String(!!result.isAdmin));
        toast.success('Login realizado com sucesso!');
      }
      
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('raiox_user');
    localStorage.removeItem('raiox_is_admin');
    toast.info('Sessão encerrada');
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

