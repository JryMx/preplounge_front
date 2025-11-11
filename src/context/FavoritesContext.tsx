import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FavoritesContextType {
  favorites: string[];
  addFavorite: (universityId: string) => void;
  removeFavorite: (universityId: string) => void;
  isFavorite: (universityId: string) => boolean;
  toggleFavorite: (universityId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>(() => {
    const stored = localStorage.getItem('prepLoungeFavorites');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('prepLoungeFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (universityId: string) => {
    setFavorites(prev => {
      if (!prev.includes(universityId)) {
        return [...prev, universityId];
      }
      return prev;
    });
  };

  const removeFavorite = (universityId: string) => {
    setFavorites(prev => prev.filter(id => id !== universityId));
  };

  const isFavorite = (universityId: string) => {
    return favorites.includes(universityId);
  };

  const toggleFavorite = (universityId: string) => {
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
