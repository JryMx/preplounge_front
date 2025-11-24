import express from 'express';

const router = express.Router();

// loaning.ai API base URL from environment variable
const LOANING_API_URL = process.env.LOANING_API_BASE_URL || 'https://api-dev.loaning.ai/v1';

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
};

// Get user's favorites
router.get('/', requireAuth, async (req, res) => {
  console.log(`[GET /api/favorites] Loading favorites for user: ${req.user.id}`);
  try {
    const response = await fetch(`${LOANING_API_URL}/user/${req.user.id}/favorites`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${req.user.accessToken}`
      }
    });
    
    console.log(`[GET /api/favorites] API response status: ${response.status}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log('[GET /api/favorites] No favorites found (404), returning empty array');
        return res.json({ favorites: [] });
      }
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    const favorites = data.favorites || data.favorite_schools || data || [];
    console.log(`[GET /api/favorites] Returning favorites:`, favorites);
    res.json({ favorites: Array.isArray(favorites) ? favorites : [] });
  } catch (error) {
    console.error('[GET /api/favorites] Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites', favorites: [] });
  }
});

// Save user's favorites
router.post('/', requireAuth, async (req, res) => {
  console.log(`[POST /api/favorites] Saving favorites for user: ${req.user.id}`);
  console.log(`[POST /api/favorites] Favorites to save:`, req.body.favorites);
  try {
    const { favorites } = req.body;
    
    const response = await fetch(`${LOANING_API_URL}/user/${req.user.id}/favorites`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${req.user.accessToken}`
      },
      body: JSON.stringify({ favorites: favorites || [] })
    });
    
    console.log(`[POST /api/favorites] API response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[POST /api/favorites] API error:', response.status, errorText);
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('[POST /api/favorites] Successfully saved favorites');
    res.json({ success: true, data });
  } catch (error) {
    console.error('[POST /api/favorites] Error saving favorites:', error);
    res.status(500).json({ error: 'Failed to save favorites' });
  }
});

export default router;
