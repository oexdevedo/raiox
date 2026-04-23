import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { apiRegister, apiLogin, ApiUser } from '@/lib/api';
import { supabase } from '@/lib/supabase';
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

  const fetchProfile = async (userId: string) => {
    try {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .single();
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profile) {
        setUser({ ...profile, id: userId } as ApiUser);
        setIsAdmin(!!roleData);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const result = await apiLogin(email, password);
      // Profile will be set by onAuthStateChange listener
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
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

