import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Profile analysis endpoint
app.post('/api/analyze-profile', async (req, res) => {
  try {
    const { academicData, nonAcademicData, extracurriculars, recommendationLetters } = req.body;

    // Build a concise prompt for the LLM
    const prompt = `You are a college admissions counselor. Analyze this student's profile and provide a brief, honest assessment in 2-3 sentences.

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

Instructions:
1. Be HONEST and REALISTIC - don't inflate weak profiles
2. For strong profiles (GPA 3.7+, high test scores, good ECs): Acknowledge their competitive standing
3. For average profiles (GPA 3.0-3.7, moderate scores): Be encouraging but realistic about match schools
4. For weaker profiles: Be constructive but honest about needing improvement
5. Keep it to 2-3 sentences maximum
6. Focus on: academic competitiveness, extracurriculars, and overall college prospects

Example for strong student: "You've got a strong profile - your GPA and test scores are competitive for the major you chose, and your personal statement is unique and tells a strong story. You're likely to be competitive for many top schools in the United States."

Provide your honest, brief analysis now:`;

    // Check if API key is available
    if (!process.env.OPEN_AI_KEY) {
      throw new Error('OPEN_AI_KEY environment variable is not set');
    }

    // Call OpenAI-compatible API
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
        max_tokens: 1000,
      }),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.text();
      console.error('API Error:', errorData);
      throw new Error(`API request failed: ${apiResponse.status} ${apiResponse.statusText}`);
    }

    const data = await apiResponse.json();
    const analysis = data.choices[0].message.content;
    
    res.json({ analysis });

  } catch (error) {
    console.error('Error analyzing profile:', error);
    res.status(500).json({ 
      error: 'Failed to analyze profile',
      message: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
