import express from 'express';

const router = express.Router();

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
};

// Get user's favorites
router.get('/', requireAuth, async (req, res) => {
  try {
    const response = await fetch(`https://api-dev.loaning.ai/v1/user/${req.user.id}/favorites`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${req.user.accessToken}`
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return res.json({ favorites: [] });
      }
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    const favorites = data.favorites || data.favorite_schools || data || [];
    res.json({ favorites: Array.isArray(favorites) ? favorites : [] });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites', favorites: [] });
  }
});

// Save user's favorites
router.post('/', requireAuth, async (req, res) => {
  try {
    const { favorites } = req.body;
    
    const response = await fetch(`https://api-dev.loaning.ai/v1/user/${req.user.id}/favorites`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${req.user.accessToken}`
      },
      body: JSON.stringify({ favorites: favorites || [] })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error:', response.status, errorText);
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error saving favorites:', error);
    res.status(500).json({ error: 'Failed to save favorites' });
  }
});

export default router;
