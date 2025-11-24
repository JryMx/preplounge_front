import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import pg from 'pg';
import connectPgSimple from 'connect-pg-simple';
import { createProxyMiddleware } from 'http-proxy-middleware';
import passportLib from './config/passport.js';
import { configurePassport, initializeDatabase } from './config/passport.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import favoritesRoutes from './routes/favorites.js';

const PgSession = connectPgSimple(session);

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed CORS origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5000'
];

if (process.env.REPLIT_DEV_DOMAIN) {
  allowedOrigins.push(`https://${process.env.REPLIT_DEV_DOMAIN}`);
}

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

const prodDomains = ['https://dev.preplounge.ai', 'https://preplounge.ai'];
allowedOrigins.push(...prodDomains);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Ensure session secret exists
if (!process.env.SESSION_SECRET) {
  console.error('FATAL: SESSION_SECRET environment variable is not set.');
  process.exit(1);
}

const isReplit = !!(process.env.REPLIT_DEV_DOMAIN || process.env.REPLIT_DOMAINS);
const isProduction = process.env.NODE_ENV === 'production';

// Required for secure cookies on proxies
if (isProduction || isReplit) {
  app.set('trust proxy', 1);
}

// Session configuration
const sessionConfig = {
  store: new PgSession({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    pruneSessionInterval: 60 * 15
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  }
};

if (isProduction || isReplit) {
  sessionConfig.cookie.secure = true;
  sessionConfig.cookie.sameSite = 'none';
}

app.use(session(sessionConfig));

// Initialize DB + Passport
initializeDatabase();
configurePassport();
app.use(passportLib.initialize());
app.use(passportLib.session());

// API routes at /api/v1/* (versioned) AND /api/* (for infrastructure proxy compatibility)
// Some hosting providers (like dev.preplounge.ai) have hard-coded /api/* → Node proxying
// So we serve routes at both paths to ensure compatibility
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/favorites', favoritesRoutes);

// Duplicate routes at /api/* for infrastructure proxy compatibility
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/favorites', favoritesRoutes);

// Profile analysis endpoint (versioned)
app.post('/api/v1/analyze-profile', async (req, res) => {
  try {
    const { academicData, nonAcademicData, extracurriculars, recommendationLetters } = req.body;

    const prompt = `You are a friendly college admissions counselor. Analyze this student's profile and return ONLY a JSON object with strengths and weaknesses.

Student Profile:
- GPA: ${academicData.gpa}/4.0
- High School Type: ${academicData.highSchoolType}
- Intended Major: ${academicData.intendedMajor || 'Undecided'}
- ${academicData.standardizedTest === 'SAT' ? `SAT: ${parseInt(academicData.satEBRW) + parseInt(academicData.satMath)}/1600 (EBRW: ${academicData.satEBRW}, Math: ${academicData.satMath})` : ''}
- ${academicData.standardizedTest === 'ACT' ? `ACT: ${academicData.actScore}/36` : ''}
- ${academicData.englishProficiencyTest ? `${academicData.englishProficiencyTest}: ${academicData.englishTestScore}` : ''}
- Personal Statement Quality: ${nonAcademicData.personalStatement || 'Not provided'}
- Extracurricular Activities: ${extracurriculars.length} activities
- Recommendation Letters: ${recommendationLetters.length} letters
- Citizenship: ${nonAcademicData.citizenship}
- Legacy Status: ${nonAcademicData.legacyStatus ? 'Yes' : 'No'}

Return ONLY this JSON format (no other text):
{
  "strengths": [
    "Brief strength statement",
    "Another strength",
    "One more strength"
  ],
  "weaknesses": [
    "Brief area to improve",
    "Another area to work on",
    "One more area for growth"
  ]
}

Rules:
1. Return ONLY valid JSON - no markdown, no code blocks, no extra text
2. List 2-4 strengths and 2-4 weaknesses
3. Use "you" and "your" - talk directly to the student
4. Be honest, realistic, and conversational
5. Keep each point brief (10-15 words max per item)
6. NO em dashes (—), use regular dashes (-) or commas
7. Cover the FULL RANGE of schools appropriately (community colleges to Ivy League)`;

    if (!process.env.OPEN_AI_KEY) {
      throw new Error('OPEN_AI_KEY environment variable is not set');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);
    
    const apiResponse = await fetch('https://llm.signalplanner.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPEN_AI_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-5',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 1,
        max_tokens: 4000,
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeout);

    if (!apiResponse.ok) {
      const errorData = await apiResponse.text();
      console.error('API Error:', errorData);
      throw new Error(`API request failed: ${apiResponse.status} ${apiResponse.statusText}`);
    }

    const data = await apiResponse.json();
    console.log('AI API Response:', JSON.stringify(data, null, 2));
    
    const choice = data.choices?.[0];
    let analysisText = choice?.message?.content || '';
    const finishReason = choice?.finish_reason;
    
    if (finishReason === 'length') {
      console.error('CRITICAL: AI response truncated due to token limit');
      return res.status(500).json({ 
        error: 'AI token limit exceeded',
        message: 'The AI analysis used too many tokens for reasoning. Please try again or contact support if this persists.'
      });
    }
    
    if (!analysisText) {
      console.error('Empty analysis received from API. Full response:', data);
      throw new Error('AI failed to generate analysis content');
    }
    
    let analysis;
    try {
      analysisText = analysisText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      analysis = JSON.parse(analysisText);
      
      if (!analysis.strengths || !Array.isArray(analysis.strengths) || 
          !analysis.weaknesses || !Array.isArray(analysis.weaknesses)) {
        throw new Error('Invalid JSON structure');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Raw response:', analysisText);
      analysis = analysisText;
    }
    
    res.json({ analysis });

  } catch (error) {
    console.error('Error analyzing profile:', error);
    
    if (error.name === 'AbortError') {
      return res.status(504).json({ 
        error: 'Request timeout',
        message: 'The AI analysis request took too long (>60 seconds). Please try again.' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to analyze profile',
      message: error.message 
    });
  }
});

// Duplicate analyze-profile endpoint at /api/* for infrastructure proxy compatibility
app.post('/api/analyze-profile', async (req, res) => {
  try {
    const { academicData, nonAcademicData, extracurriculars, recommendationLetters } = req.body;

    const prompt = `You are a friendly college admissions counselor. Analyze this student's profile and return ONLY a JSON object with strengths and weaknesses.

Student Profile:
- GPA: ${academicData.gpa}/4.0
- High School Type: ${academicData.highSchoolType}
- Intended Major: ${academicData.intendedMajor || 'Undecided'}
- ${academicData.standardizedTest === 'SAT' ? `SAT: ${parseInt(academicData.satEBRW) + parseInt(academicData.satMath)}/1600 (EBRW: ${academicData.satEBRW}, Math: ${academicData.satMath})` : ''}
- ${academicData.standardizedTest === 'ACT' ? `ACT: ${academicData.actScore}/36` : ''}
- ${academicData.englishProficiencyTest ? `${academicData.englishProficiencyTest}: ${academicData.englishTestScore}` : ''}
- Personal Statement Quality: ${nonAcademicData.personalStatement || 'Not provided'}
- Extracurricular Activities: ${extracurriculars.length} activities
- Recommendation Letters: ${recommendationLetters.length} letters
- Citizenship: ${nonAcademicData.citizenship}
- Legacy Status: ${nonAcademicData.legacyStatus ? 'Yes' : 'No'}

Return ONLY this JSON format (no other text):
{
  "strengths": [
    "Brief strength statement",
    "Another strength",
    "One more strength"
  ],
  "weaknesses": [
    "Brief weakness statement",
    "Another weakness",
    "One more weakness"
  ]
}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    const apiResponse = await fetch('https://llm.signalplanner.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SIGNALPLANNER_API_KEY || 'dummy-key'}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeout);

    if (!apiResponse.ok) {
      const errorData = await apiResponse.text();
      console.error('API Error:', errorData);
      throw new Error(`API request failed: ${apiResponse.status} ${apiResponse.statusText}`);
    }

    const data = await apiResponse.json();
    console.log('AI API Response:', JSON.stringify(data, null, 2));
    
    const choice = data.choices?.[0];
    let analysisText = choice?.message?.content || '';
    const finishReason = choice?.finish_reason;
    
    if (finishReason === 'length') {
      console.error('CRITICAL: AI response truncated due to token limit');
      return res.status(500).json({ 
        error: 'AI token limit exceeded',
        message: 'The AI analysis used too many tokens for reasoning. Please try again or contact support if this persists.'
      });
    }
    
    if (!analysisText) {
      console.error('Empty analysis received from API. Full response:', data);
      throw new Error('AI failed to generate analysis content');
    }
    
    let analysis;
    try {
      analysisText = analysisText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      analysis = JSON.parse(analysisText);
      
      if (!analysis.strengths || !Array.isArray(analysis.strengths) || 
          !analysis.weaknesses || !Array.isArray(analysis.weaknesses)) {
        throw new Error('Invalid JSON structure');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Raw response:', analysisText);
      analysis = analysisText;
    }
    
    res.json({ analysis });

  } catch (error) {
    console.error('Error analyzing profile:', error);
    
    if (error.name === 'AbortError') {
      return res.status(504).json({ 
        error: 'Request timeout',
        message: 'The AI analysis request took too long (>60 seconds). Please try again.' 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to analyze profile',
      message: error.message 
    });
  }
});

// Health check endpoint (both versioned and unversioned for compatibility)
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

// Serve static files and SPA in production, OR if dist/ folder exists (safer fallback)
import('path').then(({ default: path }) => {
  import('url').then(({ fileURLToPath }) => {
    import('fs').then(({ default: fs }) => {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const distPath = path.join(__dirname, 'dist');
      
      // Check if we should serve static files (production OR dist exists)
      const shouldServeStatic = process.env.NODE_ENV === 'production' || fs.existsSync(distPath);
      
      if (shouldServeStatic) {
        console.log('Serving static files from dist/ folder');
        app.use(express.static(distPath));
        
        app.get('*', (req, res) => {
          res.sendFile(path.join(distPath, 'index.html'));
        });
      } else {
        // ONLY proxy to Vite if we're definitely in development AND dist/ doesn't exist
        console.log('Development mode: proxying to Vite dev server at localhost:5173');
        app.use('/', createProxyMiddleware({
          target: 'http://localhost:5173',
          changeOrigin: true,
          ws: true,
          logLevel: 'silent'
        }));
      }
    });
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on http://0.0.0.0:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
