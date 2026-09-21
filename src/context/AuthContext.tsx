import { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextValue {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = window.sessionStorage.getItem('arvash-user');
    return stored ? (JSON.parse(stored) as User) : null;
  });

  const login = (u: User) => {
    setUser(u);
    window.sessionStorage.setItem('arvash-user', JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    window.sessionStorage.removeItem('arvash-user');
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
