import express from 'express';

const router = express.Router();

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
};

// Transform API response to frontend format
const apiToFrontend = (apiProfile) => {
  if (!apiProfile) return null;
  
  return {
    gpa: parseFloat(apiProfile.gpa) || 0,
    satEBRW: apiProfile.sat_ebrw || apiProfile.satEBRW || 0,
    satMath: apiProfile.sat_math || apiProfile.satMath || 0,
    actScore: apiProfile.act_score || apiProfile.actScore || 0,
    toeflScore: apiProfile.toefl_score || apiProfile.toeflScore || 0,
    apCourses: apiProfile.ap_courses || apiProfile.apCourses || 0,
    ibScore: apiProfile.ib_score || apiProfile.ibScore || 0,
    intendedMajor: apiProfile.intended_major || apiProfile.intendedMajor || '',
    personalStatement: apiProfile.personal_statement || apiProfile.personalStatement || '',
    legacyStatus: apiProfile.legacy_status !== undefined ? apiProfile.legacy_status : (apiProfile.legacyStatus || false),
    citizenship: apiProfile.citizenship || 'domestic',
    extracurriculars: apiProfile.extracurriculars || [],
    recommendationLetters: apiProfile.recommendation_letters || apiProfile.recommendationLetters || [],
    applicationComponents: apiProfile.application_components || apiProfile.applicationComponents || {},
    leadership: apiProfile.leadership || [],
    volunteering: apiProfile.volunteering || [],
    awards: apiProfile.awards || [],
    profileScore: apiProfile.profile_score || apiProfile.profileScore || 0,
    profileRigorScore: apiProfile.profile_rigor_score || apiProfile.profileRigorScore || 0,
    recommendations: apiProfile.recommendations || []
  };
};

// Transform frontend format to API request
const frontendToApi = (frontendProfile) => {
  return {
    gpa: frontendProfile.gpa || 0,
    sat_ebrw: frontendProfile.satEBRW || 0,
    sat_math: frontendProfile.satMath || 0,
    act_score: frontendProfile.actScore || 0,
    toefl_score: frontendProfile.toeflScore || 0,
    ap_courses: frontendProfile.apCourses || 0,
    ib_score: frontendProfile.ibScore || 0,
    intended_major: frontendProfile.intendedMajor || '',
    personal_statement: frontendProfile.personalStatement || '',
    legacy_status: frontendProfile.legacyStatus || false,
    citizenship: frontendProfile.citizenship || 'domestic',
    extracurriculars: frontendProfile.extracurriculars || [],
    recommendation_letters: frontendProfile.recommendationLetters || [],
    application_components: frontendProfile.applicationComponents || {},
    leadership: frontendProfile.leadership || [],
    volunteering: frontendProfile.volunteering || [],
    awards: frontendProfile.awards || [],
    profile_score: frontendProfile.profileScore || 0,
    profile_rigor_score: frontendProfile.profileRigorScore || 0,
    recommendations: frontendProfile.recommendations || []
  };
};

// Get user's profile
router.get('/', requireAuth, async (req, res) => {
  try {
    const response = await fetch(`https://api-dev.loaning.ai/v1/user/${req.user.id}/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${req.user.accessToken}`
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return res.json({ profile: null });
      }
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    const apiProfile = data.profile || data.student_profile || data || null;
    const profile = apiToFrontend(apiProfile);
    res.json({ profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Save or update user's profile
router.post('/', requireAuth, async (req, res) => {
  try {
    console.log('=== POST /api/profile called ===');
    console.log('Session ID:', req.sessionID);
    console.log('Is Authenticated:', req.isAuthenticated());
    console.log('User:', req.user);
    console.log('================================');
    
    const frontendProfile = req.body;
    const apiProfile = frontendToApi(frontendProfile);
    
    const response = await fetch(`https://api-dev.loaning.ai/v1/user/${req.user.id}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${req.user.accessToken}`
      },
      body: JSON.stringify(apiProfile)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error:', response.status, errorText);
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error saving profile:', error);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

export default router;
