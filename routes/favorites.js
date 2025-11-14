import express from 'express';

const router = express.Router();

const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
};

router.get('/', requireAuth, async (req, res) => {
  try {
    const response = await fetch(`https://api-dev.loaning.ai/v1/user/${req.user.id}/favorites?type=preplounge`, {
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
      const errorText = await response.text();
      console.error('API error fetching favorites:', response.status, errorText);
      return res.status(response.status).json({ 
        error: `Failed to fetch favorites: ${response.status}` 
      });
    }
    
    const data = await response.json();
    const favorites = data.favorites || data.university_ids || [];
    res.json({ favorites });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { universityId } = req.body;
    
    if (!universityId) {
      return res.status(400).json({ error: 'universityId is required' });
    }
    
    const response = await fetch(`https://api-dev.loaning.ai/v1/user/${req.user.id}/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${req.user.accessToken}`
      },
      body: JSON.stringify({
        type: 'preplounge',
        university_id: universityId
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error adding favorite:', response.status, errorText);
      return res.status(response.status).json({ 
        error: `Failed to add favorite: ${response.status}` 
      });
    }
    
    const data = await response.json();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

router.delete('/:universityId', requireAuth, async (req, res) => {
  try {
    const { universityId } = req.params;
    
    const response = await fetch(`https://api-dev.loaning.ai/v1/user/${req.user.id}/favorites/${universityId}?type=preplounge`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${req.user.accessToken}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error removing favorite:', response.status, errorText);
      return res.status(response.status).json({ 
        error: `Failed to remove favorite: ${response.status}` 
      });
    }
    
    const data = await response.json();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

export default router;
