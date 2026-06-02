'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AuthService from '@/api/service/AuthService';

export const servicePrefix = '/portal';

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
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const authPaths = ['/login', '/register', '/forgot-password'];

  useEffect(() => {
    // Check if user is logged in (e.g., from localStorage or cookie)
    const checkAuth = () => {
      try {
        const stored = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
        if (stored) {
          const authData: LoginUserRes = JSON.parse(stored);
          setUser(authData);
        }
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!isLoading && pathname) {
      const isPrivatePath = pathname.startsWith(servicePrefix);
      const isAuthPath = authPaths.includes(pathname);

      if (!user) {
        if (isPrivatePath) {
          router.replace('/login');
        }
      } else {
        if (isAuthPath) {
          router.replace(servicePrefix);
        }
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
        router.replace(`${servicePrefix}`);
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

  const isPrivatePath = pathname ? pathname.startsWith(servicePrefix) : false;
  const isAuthPath = pathname ? authPaths.includes(pathname) : false;
  const showLoading = isLoading || (!user && isPrivatePath) || (user && isAuthPath);

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
