import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

  useEffect(() => {
    if (loading) return;

    if (user) {
      const loadedFavorites = favoritesStorage.load(user.id);
      setFavorites(loadedFavorites);
    } else {
      setFavorites([]);
    }
  }, [user, loading]);

  useEffect(() => {
    if (user && favorites.length >= 0) {
      favoritesStorage.save(user.id, favorites);
    }
  }, [favorites, user]);

  const addFavorite = (universityId: string) => {
    if (!user) return;
    
    setFavorites(prev => {
      if (!prev.includes(universityId)) {
        return [...prev, universityId];
      }
      return prev;
    });
  };

  const removeFavorite = (universityId: string) => {
    if (!user) return;
    
    setFavorites(prev => prev.filter(id => id !== universityId));
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
