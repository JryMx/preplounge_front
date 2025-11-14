import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
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

  useEffect(() => {
    if (loading) return;

    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
      localStorage.removeItem('prepLoungeFavorites');
    }
  }, [user, loading]);

  const fetchFavorites = async () => {
    try {
      const response = await fetch(`${getBackendURL()}/api/favorites`, {
        credentials: 'include'
      });
      
      if (response.status === 401) {
        setFavorites([]);
        localStorage.removeItem('prepLoungeFavorites');
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        const favs = data.favorites || [];
        setFavorites(favs);
        localStorage.setItem('prepLoungeFavorites', JSON.stringify(favs));
      } else {
        console.error('Failed to fetch favorites:', response.status);
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setFavorites([]);
    }
  };

  const addFavorite = async (universityId: string) => {
    if (!user) return;
    
    setFavorites(prev => {
      if (!prev.includes(universityId)) {
        const newFavorites = [...prev, universityId];
        localStorage.setItem('prepLoungeFavorites', JSON.stringify(newFavorites));
        return newFavorites;
      }
      return prev;
    });

    try {
      const response = await fetch(`${getBackendURL()}/api/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ universityId })
      });
      
      if (!response.ok) {
        console.error('Failed to add favorite:', response.status);
        setFavorites(prev => {
          const reverted = prev.filter(id => id !== universityId);
          localStorage.setItem('prepLoungeFavorites', JSON.stringify(reverted));
          return reverted;
        });
      }
    } catch (error) {
      console.error('Error adding favorite:', error);
      setFavorites(prev => {
        const reverted = prev.filter(id => id !== universityId);
        localStorage.setItem('prepLoungeFavorites', JSON.stringify(reverted));
        return reverted;
      });
    }
  };

  const removeFavorite = async (universityId: string) => {
    if (!user) return;
    
    setFavorites(prev => {
      const newFavorites = prev.filter(id => id !== universityId);
      localStorage.setItem('prepLoungeFavorites', JSON.stringify(newFavorites));
      return newFavorites;
    });

    try {
      const response = await fetch(`${getBackendURL()}/api/favorites/${universityId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.error('Failed to remove favorite:', response.status);
        setFavorites(prev => {
          if (!prev.includes(universityId)) {
            const reverted = [...prev, universityId];
            localStorage.setItem('prepLoungeFavorites', JSON.stringify(reverted));
            return reverted;
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      setFavorites(prev => {
        if (!prev.includes(universityId)) {
          const reverted = [...prev, universityId];
          localStorage.setItem('prepLoungeFavorites', JSON.stringify(reverted));
          return reverted;
        }
        return prev;
      });
    }
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
