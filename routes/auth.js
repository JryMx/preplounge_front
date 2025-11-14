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
    console.log('=== Google OAuth Callback Received ===');
    console.log('Query params:', JSON.stringify(req.query, null, 2));
    console.log('=====================================');
    
    const { accessToken, refreshToken, userId, name, email, success } = req.query;
    
    const replitDomain = process.env.REPLIT_DOMAINS || process.env.REPLIT_DEV_DOMAIN;
    const frontendUrl = replitDomain 
      ? `https://${replitDomain}`
      : 'http://localhost:5173';
    
    if (!accessToken || !userId) {
      console.error('OAuth callback missing required parameters');
      console.error('Available query params:', Object.keys(req.query));
      return res.redirect(`${frontendUrl}/oauth/callback?error=missing_oauth_data`);
    }
    
    if (success === 'false') {
      console.error('OAuth authentication failed on provider side');
      return res.redirect(`${frontendUrl}/oauth/callback?success=false`);
    }
    
    const params = new URLSearchParams({
      accessToken,
      refreshToken: refreshToken || '',
      userId,
      name: name || '',
      email: email || '',
      provider: 'google',
      success: 'true'
    });
    
    console.log('Redirecting to frontend with OAuth tokens for session creation');
    res.redirect(`${frontendUrl}/oauth/callback?${params.toString()}`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    const replitDomain = process.env.REPLIT_DOMAINS || process.env.REPLIT_DEV_DOMAIN;
    const frontendUrl = replitDomain 
      ? `https://${replitDomain}`
      : 'http://localhost:5173';
    res.redirect(`${frontendUrl}/oauth/callback?error=authentication_failed`);
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
    console.log('=== Kakao OAuth Callback Received ===');
    console.log('Query params:', JSON.stringify(req.query, null, 2));
    console.log('=====================================');
    
    const { accessToken, refreshToken, userId, name, email, success } = req.query;
    
    const replitDomain = process.env.REPLIT_DOMAINS || process.env.REPLIT_DEV_DOMAIN;
    const frontendUrl = replitDomain 
      ? `https://${replitDomain}`
      : 'http://localhost:5173';
    
    if (!accessToken || !userId) {
      console.error('OAuth callback missing required parameters');
      console.error('Available query params:', Object.keys(req.query));
      return res.redirect(`${frontendUrl}/oauth/callback?error=missing_oauth_data`);
    }
    
    if (success === 'false') {
      console.error('OAuth authentication failed on provider side');
      return res.redirect(`${frontendUrl}/oauth/callback?success=false`);
    }
    
    const params = new URLSearchParams({
      accessToken,
      refreshToken: refreshToken || '',
      userId,
      name: name || '',
      email: email || '',
      provider: 'kakao',
      success: 'true'
    });
    
    console.log('Redirecting to frontend with OAuth tokens for session creation');
    res.redirect(`${frontendUrl}/oauth/callback?${params.toString()}`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    const replitDomain = process.env.REPLIT_DOMAINS || process.env.REPLIT_DEV_DOMAIN;
    const frontendUrl = replitDomain 
      ? `https://${replitDomain}`
      : 'http://localhost:5173';
    res.redirect(`${frontendUrl}/oauth/callback?error=authentication_failed`);
  }
});

router.post('/session', async (req, res) => {
  try {
    console.log('=== Creating Session from OAuth Tokens ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Request headers:', {
      origin: req.headers.origin,
      referer: req.headers.referer,
      cookie: req.headers.cookie ? 'present' : 'none'
    });
    console.log('==========================================');
    
    const { accessToken, refreshToken, userId, name, email, role, partner, provider } = req.body;
    
    if (!accessToken || !userId) {
      console.error('Session creation missing required parameters');
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    req.login({
      id: userId,
      email: email || '',
      displayName: name || '',
      provider: provider || 'google',
      accessToken: accessToken,
      refreshToken: refreshToken || '',
      role: role || '',
      partner: partner || ''
    }, (err) => {
      if (err) {
        console.error('Session creation error:', err);
        return res.status(500).json({ error: 'Failed to create session' });
      }
      
      console.log('✓ Session created successfully for user:', userId, 'via provider:', provider || 'google');
      console.log('✓ Session ID:', req.sessionID);
      console.log('✓ Session cookie will be set with options:', {
        secure: req.session.cookie.secure,
        httpOnly: req.session.cookie.httpOnly,
        sameSite: req.session.cookie.sameSite,
        domain: req.session.cookie.domain,
        path: req.session.cookie.path
      });
      res.json({ success: true, user: req.user });
    });
  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

router.get('/user', (req, res) => {
  console.log('=== /api/auth/user called ===');
  console.log('Session ID:', req.sessionID);
  console.log('Session:', req.session);
  console.log('Is Authenticated:', req.isAuthenticated());
  console.log('User:', req.user);
  console.log('Cookies:', req.headers.cookie);
  console.log('============================');
  
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
