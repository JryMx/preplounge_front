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

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/favorites', favoritesRoutes);

// ===============================
// BACKEND HEALTH CHECK (VERSIONED)
// ===============================
app.get('/api/v1/healthz', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server running' });
});

// Legacy backend health route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

// ===============================
// FRONTEND HEALTH CHECK
// ===============================
app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', message: 'Frontend is running' });
});

// =========================================
// PROFILE ANALYSIS ENDPOINT (unchanged)
// =========================================
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

Return ONLY valid JSON...`;

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
        messages: [{ role: 'user', content: prompt }],
        temperature: 1,
        max_tokens: 4000,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!apiResponse.ok) {
      throw new Error(`API request failed: ${apiResponse.status} ${apiResponse.statusText}`);
    }

    const data = await apiResponse.json();
    let analysisText = data.choices?.[0]?.message?.content || '';

    // Strip markdown formatting and parse JSON
    analysisText = analysisText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch {
      analysis = analysisText;
    }

    res.json({ analysis });

  } catch (error) {
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: 'Request timeout' });
    }

    res.status(500).json({
      error: 'Failed to analyze profile',
      message: error.message
    });
  }
});

// ============================================
// FRONTEND BUILD SERVING (PRODUCTION ONLY)
// ============================================
if (process.env.NODE_ENV === 'production') {
  import('path').then(({ default: path }) => {
    import('url').then(({ fileURLToPath }) => {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);

      app.use(express.static(path.join(__dirname, 'dist')));

      app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
      });
    });
  });
} else {
  // Vite dev server proxy
  app.use('/', createProxyMiddleware({
    target: 'http://localhost:5173',
    changeOrigin: true,
    ws: true,
    logLevel: 'silent'
  }));
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on http://0.0.0.0:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
