'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AuthService from '@/api/service/AuthService';

interface AuthContextType {
  user: LoginUserRes | null;
  login: (email: string, password: string, stayLoggedIn?: boolean) => Promise<void>;
  register: (data: any) => Promise<ActionRes | undefined>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LoginUserRes | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Public paths that don't require authentication
  const publicPaths = ['/login', '/register', '/forgot-password'];

  useEffect(() => {
    // Check if user is logged in (e.g., from localStorage or cookie)
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const stored = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        if (stored) {
          const authData: LoginUserRes = JSON.parse(stored);
          setUser(authData);
        }
      } catch (error) {
        console.error('Failed to parse user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const isPublicPath = publicPaths.includes(pathname);

      if (!user && !isPublicPath) {
        router.replace('/login');
      } else if (user && isPublicPath) {
        router.replace('/');
      }
    }
  }, [user, isLoading, pathname, router]);

  const login = async (email: string, password: string, stayLoggedIn: boolean = true) => {
    setIsLoading(true);
    try {
      const res = await AuthService.login(email, password);
      if (res) {
        const storage = stayLoggedIn ? localStorage : sessionStorage;
        storage.setItem('currentUser', JSON.stringify(res));
        setUser(res);
        router.replace('/');
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any): Promise<ActionRes | undefined> => {
    setIsLoading(true);
    try {
      const res = await AuthService.register(data);
      return res;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    setUser(null);
    router.replace('/login');
  };

  const isPublicPath = publicPaths.includes(pathname);
  const showLoading = isLoading || (!user && !isPublicPath) || (user && isPublicPath);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {showLoading ? (
        <div className="auth-loading-screen">
          <div className="loader"></div>
          <p>사용자 정보를 확인 중입니다...</p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
