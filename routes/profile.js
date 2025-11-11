import express from 'express';
import { pool } from '../config/passport.js';

const router = express.Router();

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
};

// Get user's profile
router.get('/', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM student_profiles WHERE user_id = $1',
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.json({ profile: null });
    }
    
    const dbProfile = result.rows[0];
    
    // Transform database format to frontend format
    const profile = {
      gpa: parseFloat(dbProfile.gpa) || 0,
      satEBRW: dbProfile.sat_ebrw || 0,
      satMath: dbProfile.sat_math || 0,
      actScore: dbProfile.act_score || 0,
      toeflScore: dbProfile.toefl_score || 0,
      apCourses: dbProfile.ap_courses || 0,
      ibScore: dbProfile.ib_score || 0,
      intendedMajor: dbProfile.intended_major || '',
      personalStatement: dbProfile.personal_statement || '',
      legacyStatus: dbProfile.legacy_status || false,
      citizenship: dbProfile.citizenship || 'domestic',
      extracurriculars: dbProfile.extracurriculars || [],
      recommendationLetters: dbProfile.recommendation_letters || [],
      applicationComponents: dbProfile.application_components || {},
      leadership: dbProfile.leadership || [],
      volunteering: dbProfile.volunteering || [],
      awards: dbProfile.awards || [],
      profileScore: dbProfile.profile_score || 0,
      profileRigorScore: dbProfile.profile_rigor_score || 0,
      recommendations: dbProfile.recommendations || []
    };
    
    res.json({ profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Save or update user's profile
router.post('/', requireAuth, async (req, res) => {
  try {
    const profile = req.body;
    
    // Check if profile exists
    const existingResult = await pool.query(
      'SELECT id FROM student_profiles WHERE user_id = $1',
      [req.user.id]
    );
    
    const now = new Date();
    
    if (existingResult.rows.length > 0) {
      // Update existing profile
      await pool.query(
        `UPDATE student_profiles SET
          gpa = $1,
          sat_ebrw = $2,
          sat_math = $3,
          act_score = $4,
          toefl_score = $5,
          ap_courses = $6,
          ib_score = $7,
          intended_major = $8,
          personal_statement = $9,
          legacy_status = $10,
          citizenship = $11,
          extracurriculars = $12,
          recommendation_letters = $13,
          application_components = $14,
          leadership = $15,
          volunteering = $16,
          awards = $17,
          profile_score = $18,
          profile_rigor_score = $19,
          recommendations = $20,
          updated_at = $21
        WHERE user_id = $22`,
        [
          profile.gpa || 0,
          profile.satEBRW || 0,
          profile.satMath || 0,
          profile.actScore || 0,
          profile.toeflScore || 0,
          profile.apCourses || 0,
          profile.ibScore || 0,
          profile.intendedMajor || '',
          profile.personalStatement || '',
          profile.legacyStatus || false,
          profile.citizenship || 'domestic',
          JSON.stringify(profile.extracurriculars || []),
          JSON.stringify(profile.recommendationLetters || []),
          JSON.stringify(profile.applicationComponents || {}),
          JSON.stringify(profile.leadership || []),
          JSON.stringify(profile.volunteering || []),
          JSON.stringify(profile.awards || []),
          profile.profileScore || 0,
          profile.profileRigorScore || 0,
          JSON.stringify(profile.recommendations || []),
          now,
          req.user.id
        ]
      );
    } else {
      // Insert new profile
      await pool.query(
        `INSERT INTO student_profiles (
          user_id, gpa, sat_ebrw, sat_math, act_score, toefl_score,
          ap_courses, ib_score, intended_major, personal_statement,
          legacy_status, citizenship, extracurriculars, recommendation_letters,
          application_components, leadership, volunteering, awards,
          profile_score, profile_rigor_score, recommendations, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)`,
        [
          req.user.id,
          profile.gpa || 0,
          profile.satEBRW || 0,
          profile.satMath || 0,
          profile.actScore || 0,
          profile.toeflScore || 0,
          profile.apCourses || 0,
          profile.ibScore || 0,
          profile.intendedMajor || '',
          profile.personalStatement || '',
          profile.legacyStatus || false,
          profile.citizenship || 'domestic',
          JSON.stringify(profile.extracurriculars || []),
          JSON.stringify(profile.recommendationLetters || []),
          JSON.stringify(profile.applicationComponents || {}),
          JSON.stringify(profile.leadership || []),
          JSON.stringify(profile.volunteering || []),
          JSON.stringify(profile.awards || []),
          profile.profileScore || 0,
          profile.profileRigorScore || 0,
          JSON.stringify(profile.recommendations || []),
          now,
          now
        ]
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving profile:', error);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

export default router;
