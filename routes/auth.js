import express from 'express';
import passport from '../config/passport.js';
import { pool } from '../config/passport.js';

const router = express.Router();

router.get('/google', (req, res) => {
  const frontendUrl = process.env.REPLIT_DEV_DOMAIN 
    ? `https://${process.env.REPLIT_DEV_DOMAIN}`
    : 'http://localhost:5000';
  
  const backendUrl = process.env.REPLIT_DEV_DOMAIN 
    ? `https://${process.env.REPLIT_DEV_DOMAIN}:4200`
    : 'http://localhost:3001';
  
  const redirectUri = `${backendUrl}/api/auth/google/callback`;
  const oauthUrl = `https://api-dev.loaning.ai/v1/oauth/google?type=preplounge&redirect=${encodeURIComponent(redirectUri)}&platform=web`;
  
  res.redirect(oauthUrl);
});

router.get('/google/callback', async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      console.error('OAuth callback missing required token parameter');
      return res.redirect('/?error=missing_token');
    }
    
    let userData;
    
    try {
      const verifyResponse = await fetch('https://api-dev.loaning.ai/v1/oauth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          token,
          type: 'preplounge'
        })
      });
      
      if (!verifyResponse.ok) {
        console.error('Token verification failed:', verifyResponse.status, await verifyResponse.text());
        return res.redirect('/?error=invalid_token');
      }
      
      const verifiedData = await verifyResponse.json();
      
      if (!verifiedData.user || !verifiedData.user.email) {
        console.error('Verification response missing user data');
        return res.redirect('/?error=invalid_verification_response');
      }
      
      userData = verifiedData.user;
    } catch (verifyError) {
      console.error('Token verification error:', verifyError);
      return res.redirect('/?error=verification_failed');
    }
    
    let dbUser = await pool.query(
      'SELECT * FROM users WHERE provider = $1 AND provider_id = $2',
      ['google', userData.provider_id || userData.id]
    );
    
    if (dbUser.rows.length === 0) {
      const insertResult = await pool.query(
        'INSERT INTO users (email, name, provider, provider_id, photo, type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [userData.email, userData.name, 'google', userData.provider_id || userData.id, userData.photo, 'preplounge']
      );
      dbUser = insertResult;
    } else {
      await pool.query(
        'UPDATE users SET type = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['preplounge', dbUser.rows[0].id]
      );
    }
    
    req.login({
      id: dbUser.rows[0].id,
      email: dbUser.rows[0].email,
      displayName: dbUser.rows[0].name,
      provider: dbUser.rows[0].provider,
      photo: dbUser.rows[0].photo
    }, (err) => {
      if (err) {
        console.error('Login error:', err);
        return res.redirect('/?error=session_failed');
      }
      
      const frontendUrl = process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}`
        : 'http://localhost:5000';
      res.redirect(frontendUrl);
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect('/?error=authentication_failed');
  }
});

router.get('/kakao', (req, res) => {
  const frontendUrl = process.env.REPLIT_DEV_DOMAIN 
    ? `https://${process.env.REPLIT_DEV_DOMAIN}`
    : 'http://localhost:5000';
  
  const backendUrl = process.env.REPLIT_DEV_DOMAIN 
    ? `https://${process.env.REPLIT_DEV_DOMAIN}:4200`
    : 'http://localhost:3001';
  
  const redirectUri = `${backendUrl}/api/auth/kakao/callback`;
  const oauthUrl = `https://api-dev.loaning.ai/v1/oauth/kakao?type=preplounge&redirect=${encodeURIComponent(redirectUri)}&platform=web`;
  
  res.redirect(oauthUrl);
});

router.get('/kakao/callback', async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      console.error('OAuth callback missing required token parameter');
      return res.redirect('/?error=missing_token');
    }
    
    let userData;
    
    try {
      const verifyResponse = await fetch('https://api-dev.loaning.ai/v1/oauth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          token,
          type: 'preplounge'
        })
      });
      
      if (!verifyResponse.ok) {
        console.error('Token verification failed:', verifyResponse.status, await verifyResponse.text());
        return res.redirect('/?error=invalid_token');
      }
      
      const verifiedData = await verifyResponse.json();
      
      if (!verifiedData.user || !verifiedData.user.email) {
        console.error('Verification response missing user data');
        return res.redirect('/?error=invalid_verification_response');
      }
      
      userData = verifiedData.user;
    } catch (verifyError) {
      console.error('Token verification error:', verifyError);
      return res.redirect('/?error=verification_failed');
    }
    
    let dbUser = await pool.query(
      'SELECT * FROM users WHERE provider = $1 AND provider_id = $2',
      ['kakao', userData.provider_id || userData.id]
    );
    
    if (dbUser.rows.length === 0) {
      const insertResult = await pool.query(
        'INSERT INTO users (email, name, provider, provider_id, photo, type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [userData.email, userData.name, 'kakao', userData.provider_id || userData.id, userData.photo, 'preplounge']
      );
      dbUser = insertResult;
    } else {
      await pool.query(
        'UPDATE users SET type = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['preplounge', dbUser.rows[0].id]
      );
    }
    
    req.login({
      id: dbUser.rows[0].id,
      email: dbUser.rows[0].email,
      displayName: dbUser.rows[0].name,
      provider: dbUser.rows[0].provider,
      photo: dbUser.rows[0].photo
    }, (err) => {
      if (err) {
        console.error('Login error:', err);
        return res.redirect('/?error=session_failed');
      }
      
      const frontendUrl = process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}`
        : 'http://localhost:5000';
      res.redirect(frontendUrl);
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect('/?error=authentication_failed');
  }
});

router.get('/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      user: {
        id: req.user.id,
        provider: req.user.provider,
        displayName: req.user.displayName,
        email: req.user.email,
        photo: req.user.photo,
      }
    });
  } else {
    res.json({ user: null });
  }
});

router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true });
  });
});

export default router;
