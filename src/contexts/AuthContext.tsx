import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '../lib/api';
import type { AccountType, User, UserRole } from '../types';
import { loadJson, saveJson } from '../lib/storage';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, accountType?: AccountType) => Promise<User>;
  register: (
    email: string,
    password: string,
    full_name: string,
    role?: UserRole,
    phone?: string,
  ) => Promise<{ user: User; otp_code?: string | null }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAdmin: boolean;
  isFarmer: boolean;
  isCustomer: boolean;
  isDistrictHub: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USER_KEY = 'oyedesi_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => loadJson<User | null>(USER_KEY, null));
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const u = await api.me();
    setUser(u);
    saveJson(USER_KEY, u);
  };

  useEffect(() => {
    const onAuthExpired = () => {
      setUser(null);
      saveJson(USER_KEY, null);
    };
    window.addEventListener('oyedesi:auth-expired', onAuthExpired);
    return () => window.removeEventListener('oyedesi:auth-expired', onAuthExpired);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('oyedesi_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api.me()
      .then((u) => {
        setUser(u);
        saveJson(USER_KEY, u);
      })
      .catch(() => {
        localStorage.removeItem('oyedesi_token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string, accountType?: AccountType) => {
    const res = await api.login({ email, password, account_type: accountType });
    localStorage.setItem('oyedesi_token', res.access_token);
    setUser(res.user);
    saveJson(USER_KEY, res.user);
    return res.user;
  };

  const register = async (
    email: string,
    password: string,
    full_name: string,
    role: UserRole = 'customer',
    phone = '',
  ) => {
    const res = await api.register({
      email,
      password,
      full_name,
      role: role === 'farmer' ? 'farmer' : 'customer',
      phone,
    });
    localStorage.setItem('oyedesi_token', res.access_token);
    setUser(res.user);
    saveJson(USER_KEY, res.user);
    return { user: res.user, otp_code: res.otp_code };
  };

  const logout = () => {
    localStorage.removeItem('oyedesi_token');
    setUser(null);
    saveJson(USER_KEY, null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAdmin: user?.role === 'admin',
        isFarmer: user?.role === 'farmer',
        isCustomer: user?.role === 'customer',
        isDistrictHub: user?.role === 'district_hub',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
