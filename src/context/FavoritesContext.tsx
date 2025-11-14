import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { favoritesStorage } from '../lib/favoritesStorage';
import { getBackendURL } from '../lib/backendUrl';

interface FavoritesContextType {
  favorites: string[];
  addFavorite: (universityId: string) => void;
  removeFavorite: (universityId: string) => void;
  isFavorite: (universityId: string) => boolean;
  toggleFavorite: (universityId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const loadedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (loading) return;

    if (user) {
      if (loadedUserIdRef.current !== user.id) {
        loadFavorites();
        loadedUserIdRef.current = user.id;
      }
    } else {
      setFavorites([]);
      loadedUserIdRef.current = null;
    }
  }, [user, loading]);

  const loadFavorites = async () => {
    if (!user) return;
    
    const storageKey = `prepLoungeFavorites_${user.id}`;
    
    try {
      const response = await fetch(`${getBackendURL()}/api/favorites`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.favorites && Array.isArray(data.favorites)) {
          localStorage.setItem(storageKey, JSON.stringify(data.favorites));
          setFavorites(data.favorites);
        } else {
          const stored = localStorage.getItem(storageKey);
          if (stored) {
            setFavorites(JSON.parse(stored));
          } else {
            setFavorites([]);
          }
        }
      } else {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          setFavorites(JSON.parse(stored));
        } else {
          setFavorites([]);
        }
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setFavorites(JSON.parse(stored));
      } else {
        setFavorites([]);
      }
    }
  };

  const saveFavoritesToServer = async (updatedFavorites: string[]) => {
    if (!user) return;
    
    try {
      await fetch(`${getBackendURL()}/api/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ favorites: updatedFavorites }),
      });
    } catch (error) {
      console.error('Error saving favorites to server:', error);
    }
  };

  const addFavorite = (universityId: string) => {
    if (!user) return;
    
    setFavorites(prev => {
      if (!prev.includes(universityId)) {
        const updated = [...prev, universityId];
        favoritesStorage.save(user.id, updated);
        saveFavoritesToServer(updated);
        return updated;
      }
      return prev;
    });
  };

  const removeFavorite = (universityId: string) => {
    if (!user) return;
    
    setFavorites(prev => {
      const updated = prev.filter(id => id !== universityId);
      favoritesStorage.save(user.id, updated);
      saveFavoritesToServer(updated);
      return updated;
    });
  };

  const isFavorite = (universityId: string) => {
    if (!user) return false;
    return favorites.includes(universityId);
  };

  const toggleFavorite = (universityId: string) => {
    if (!user) return;
    
    if (isFavorite(universityId)) {
      removeFavorite(universityId);
    } else {
      addFavorite(universityId);
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
