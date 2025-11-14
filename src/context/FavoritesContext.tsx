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
    const loadFavorites = async () => {
      if (!user) return;
      
      const storageKey = `prepLoungeFavorites_${user.id}`;
      console.log('[FavoritesContext] Loading favorites for user:', user.id);
      
      try {
        const response = await fetch(`${getBackendURL()}/api/favorites`, {
          credentials: 'include',
        });
        
        console.log('[FavoritesContext] Favorites API response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('[FavoritesContext] Favorites data from server:', data);
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
          console.warn('[FavoritesContext] Failed to load favorites from server');
          const stored = localStorage.getItem(storageKey);
          if (stored) {
            setFavorites(JSON.parse(stored));
          } else {
            setFavorites([]);
          }
        }
      } catch (error) {
        console.error('[FavoritesContext] Error loading favorites:', error);
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          setFavorites(JSON.parse(stored));
        } else {
          setFavorites([]);
        }
      }
    };
    
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

  const saveFavoritesToServer = async (updatedFavorites: string[]) => {
    if (!user) return;
    
    console.log('[FavoritesContext] Saving favorites to server:', updatedFavorites);
    
    try {
      const response = await fetch(`${getBackendURL()}/api/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ favorites: updatedFavorites }),
      });
      
      console.log('[FavoritesContext] Save favorites response status:', response.status);
      
      if (!response.ok) {
        console.error('[FavoritesContext] Failed to save favorites:', await response.text());
      }
    } catch (error) {
      console.error('[FavoritesContext] Error saving favorites to server:', error);
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
