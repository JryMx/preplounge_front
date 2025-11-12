import express from 'express';
import passport from '../config/passport.js';

const router = express.Router();

router.get('/google', (req, res) => {
  const replitDomain = process.env.REPLIT_DOMAINS || process.env.REPLIT_DEV_DOMAIN;
  
  const frontendUrl = replitDomain 
    ? `https://${replitDomain}`
    : 'http://localhost:5173';
  
  const backendUrl = replitDomain 
    ? `https://${replitDomain}`
    : 'http://localhost:5000';
  
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
      
      if (!verifiedData.user || !verifiedData.user.id) {
        console.error('Verification response missing user data');
        return res.redirect('/?error=invalid_verification_response');
      }
      
      userData = verifiedData.user;
    } catch (verifyError) {
      console.error('Token verification error:', verifyError);
      return res.redirect('/?error=verification_failed');
    }
    
    req.login({
      id: userData.id,
      email: userData.email,
      displayName: userData.name,
      provider: 'google',
      photo: userData.photo,
      token: token
    }, (err) => {
      if (err) {
        console.error('Login error:', err);
        return res.redirect('/?error=session_failed');
      }
      
      const replitDomain = process.env.REPLIT_DOMAINS || process.env.REPLIT_DEV_DOMAIN;
      const frontendUrl = replitDomain 
        ? `https://${replitDomain}`
        : 'http://localhost:5173';
      res.redirect(frontendUrl);
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect('/?error=authentication_failed');
  }
});

router.get('/kakao', (req, res) => {
  const replitDomain = process.env.REPLIT_DOMAINS || process.env.REPLIT_DEV_DOMAIN;
  
  const frontendUrl = replitDomain 
    ? `https://${replitDomain}`
    : 'http://localhost:5173';
  
  const backendUrl = replitDomain 
    ? `https://${replitDomain}`
    : 'http://localhost:5000';
  
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
      
      if (!verifiedData.user || !verifiedData.user.id) {
        console.error('Verification response missing user data');
        return res.redirect('/?error=invalid_verification_response');
      }
      
      userData = verifiedData.user;
    } catch (verifyError) {
      console.error('Token verification error:', verifyError);
      return res.redirect('/?error=verification_failed');
    }
    
    req.login({
      id: userData.id,
      email: userData.email,
      displayName: userData.name,
      provider: 'kakao',
      photo: userData.photo,
      token: token
    }, (err) => {
      if (err) {
        console.error('Login error:', err);
        return res.redirect('/?error=session_failed');
      }
      
      const replitDomain = process.env.REPLIT_DOMAINS || process.env.REPLIT_DEV_DOMAIN;
      const frontendUrl = replitDomain 
        ? `https://${replitDomain}`
        : 'http://localhost:5173';
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
