import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { auth } from '../config/firebase';
import authService from '../services/authService';

interface AuthContextType {
  currentUser: User | null;
  userData: any;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (data: any) => Promise<any>;
  loginWithGoogle: () => Promise<any>;
  loginWithFacebook: () => Promise<any>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    console.log('AuthContext: Setting up auth state listener');
    
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('AuthContext: Timeout reached, setting loading to false');
      setLoading(false);
    }, 5000); // 5 second timeout
    
    // Listen to Firebase auth state changes
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log('AuthContext: Auth state changed', user);
      clearTimeout(timeoutId); // Clear timeout if auth state resolves
      setCurrentUser(user);
      
      if (user && authService.isAuthenticated()) {
        console.log('AuthContext: User authenticated');
        // Fetch user data from backend
        const storedUser = authService.getStoredUser();
        setUserData(storedUser);
        setIsAuthenticated(true);
      } else {
        console.log('AuthContext: User not authenticated');
        setUserData(null);
        setIsAuthenticated(false);
      }
      
      setLoading(false);
    });

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authService.login({ email, password });
    if (result.success) {
      setUserData(result.user);
      setIsAuthenticated(true);
    }
    return result;
  };

  const register = async (data: any) => {
    const result = await authService.register(data);
    if (result.success) {
      setUserData(result.user);
      setIsAuthenticated(true);
    }
    return result;
  };

  const loginWithGoogle = async () => {
    const result = await authService.loginWithGoogle();
    if (result.success) {
      const storedUser = authService.getStoredUser();
      setUserData(storedUser);
      setIsAuthenticated(true);
    }
    return result;
  };

  const loginWithFacebook = async () => {
    const result = await authService.loginWithFacebook();
    if (result.success) {
      const storedUser = authService.getStoredUser();
      setUserData(storedUser);
      setIsAuthenticated(true);
    }
    return result;
  };

  const logout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setUserData(null);
    setIsAuthenticated(false);
  };

  const resetPassword = async (email: string) => {
    return await authService.resetPassword(email);
  };

  const value = {
    currentUser,
    userData,
    loading,
    isAuthenticated,
    login,
    register,
    loginWithGoogle,
    loginWithFacebook,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
