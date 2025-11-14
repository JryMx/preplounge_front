import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { favoritesStorage } from '../lib/favoritesStorage';

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
        const loadedFavorites = favoritesStorage.load(user.id);
        setFavorites(loadedFavorites);
        loadedUserIdRef.current = user.id;
      }
    } else {
      setFavorites([]);
      loadedUserIdRef.current = null;
    }
  }, [user, loading]);

  const addFavorite = (universityId: string) => {
    if (!user) return;
    
    setFavorites(prev => {
      if (!prev.includes(universityId)) {
        const updated = [...prev, universityId];
        favoritesStorage.save(user.id, updated);
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
