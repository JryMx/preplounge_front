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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${getBackendURL()}/api/auth/user`, {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.user) {
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        setUser(data.user);
        return data.user;
      } else {
        localStorage.removeItem('auth_user');
        setUser(null);
        return null;
      }
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
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      localStorage.removeItem('auth_user');
      localStorage.removeItem('student_profile');
      
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('prepLoungeFavorites_')) {
          localStorage.removeItem(key);
        }
      });
      
      setUser(null);
    }
  };

  useEffect(() => {
    const cleanup = async () => {
      const storedUser = localStorage.getItem('auth_user');
      if (storedUser) {
        try {
          JSON.parse(storedUser);
        } catch (e) {
          console.log('Clearing invalid localStorage auth data');
          localStorage.removeItem('auth_user');
        }
      }
      await checkAuth();
    };
    cleanup();
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