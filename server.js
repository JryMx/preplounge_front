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

if (!process.env.SESSION_SECRET) {
  console.error('FATAL: SESSION_SECRET environment variable is not set. This is required for secure session management.');
  console.error('Please set SESSION_SECRET in your environment variables before starting the server.');
  process.exit(1);
}

const isReplit = !!(process.env.REPLIT_DEV_DOMAIN || process.env.REPLIT_DOMAINS);
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction || isReplit) {
  app.set('trust proxy', 1);
}

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

initializeDatabase();

configurePassport();
app.use(passportLib.initialize());
app.use(passportLib.session());

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/favorites', favoritesRoutes);

// Profile analysis endpoint
app.post('/api/analyze-profile', async (req, res) => {
  try {
    const { academicData, nonAcademicData, extracurriculars, recommendationLetters } = req.body;

    // Build a structured prompt for the LLM to return strengths and weaknesses
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
7. Cover the FULL RANGE of schools appropriately (community colleges to Ivy League)

Example output for a strong profile:
{
  "strengths": [
    "Your 3.9 GPA and 1500 SAT make you competitive for top 50 schools",
    "Strong test scores put you in range for selective universities",
    "You're a standout candidate at most flagship state schools"
  ],
  "weaknesses": [
    "Limited extracurriculars may hurt at highly selective schools",
    "Consider adding more leadership roles to strengthen your profile",
    "Personal statement needs development to stand out"
  ]
}

Now analyze this student's profile and return the JSON:`;

    // Check if API key is available
    if (!process.env.OPEN_AI_KEY) {
      throw new Error('OPEN_AI_KEY environment variable is not set');
    }

    // Call OpenAI-compatible API with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
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
    
    // Hard safeguard: Treat token limit exhaustion as an error
    if (finishReason === 'length') {
      console.error('CRITICAL: AI response truncated due to token limit');
      console.error('Reasoning tokens used:', data.usage?.completion_tokens_details?.reasoning_tokens);
      console.error('Total completion tokens:', data.usage?.completion_tokens);
      console.error('Max tokens configured:', 4000);
      
      return res.status(500).json({ 
        error: 'AI token limit exceeded',
        message: 'The AI analysis used too many tokens for reasoning. Please try again or contact support if this persists.'
      });
    }
    
    if (!analysisText) {
      console.error('Empty analysis received from API. Full response:', data);
      throw new Error('AI failed to generate analysis content');
    }
    
    // Try to parse the JSON response
    let analysis;
    try {
      // Remove markdown code blocks if present
      analysisText = analysisText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      analysis = JSON.parse(analysisText);
      
      // Validate structure
      if (!analysis.strengths || !Array.isArray(analysis.strengths) || 
          !analysis.weaknesses || !Array.isArray(analysis.weaknesses)) {
        throw new Error('Invalid JSON structure');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Raw response:', analysisText);
      // Return as plain text if JSON parsing fails
      analysis = analysisText;
    }
    
    res.json({ analysis });

  } catch (error) {
    console.error('Error analyzing profile:', error);
    
    // Check if it was a timeout
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

// Health check endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', message: 'PrepLounge backend is healthy' });
});

// Detect production environment
const isProductionEnv = process.env.NODE_ENV === 'production' || 
                        process.env.REPLIT_DEPLOYMENT === '1' ||
                        !process.env.REPLIT_DEV_DOMAIN;

if (isProductionEnv) {
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
  app.use('/', createProxyMiddleware({
    target: 'http://localhost:5173',
    changeOrigin: true,
    ws: true,
    logLevel: 'silent'
  }));
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on http://0.0.0.0:${PORT}`);
  console.log(`Environment: ${isProductionEnv ? 'production' : 'development'}`);
  console.log(`Serving: ${isProductionEnv ? 'Static files from /dist' : 'Proxying to Vite dev server'}`);
});
