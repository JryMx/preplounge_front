export const favoritesStorage = {
  getKey(userId: string): string {
    return `prepLoungeFavorites_${userId}`;
  },

  load(userId: string): string[] {
    try {
      const key = this.getKey(userId);
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading favorites from storage:', error);
      return [];
    }
  },

  save(userId: string, favorites: string[]): void {
    try {
      const key = this.getKey(userId);
      localStorage.setItem(key, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites to storage:', error);
    }
  },

  clear(userId: string): void {
    try {
      const key = this.getKey(userId);
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error clearing favorites from storage:', error);
    }
  },
};
