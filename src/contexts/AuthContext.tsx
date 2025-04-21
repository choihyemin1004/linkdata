import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  isAuthenticated: boolean;
  authenticate: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ADMIN_EMAIL = 'planhompro@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session && session.user.email === ADMIN_EMAIL);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session && session.user.email === ADMIN_EMAIL);
    setIsLoading(false);
  };

  const authenticate = async (email: string, password: string) => {
    try {
      if (email !== ADMIN_EMAIL) {
        console.error('Invalid admin email');
        return false;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Authentication error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated,
      authenticate,
      logout,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};