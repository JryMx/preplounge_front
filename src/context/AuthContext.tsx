import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getBackendURL } from '../lib/backendUrl';

interface User {
  id: string;
  provider: string;
  displayName: string;
  email?: string;
  photo?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('auth_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const storedUser = localStorage.getItem('auth_user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setLoading(false);
        return userData;
      }
      
      const response = await fetch(`${getBackendURL()}/api/auth/user`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.user) {
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        setUser(data.user);
      } else {
        localStorage.removeItem('auth_user');
        setUser(null);
      }
      return data.user;
    } catch (error) {
      console.error('Error checking auth:', error);
      localStorage.removeItem('auth_user');
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${getBackendURL()}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        await checkAuth();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error logging in:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${getBackendURL()}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      localStorage.removeItem('auth_user');
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
      localStorage.removeItem('auth_user');
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout, checkAuth, login, isAuthenticated: !!user }}>
      {children}
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