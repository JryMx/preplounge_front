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
    const prompt = `You are a friendly college admissions counselor talking directly to a student. Give them a brief, honest assessment of their profile in 2-3 sentences. Write like you're having a conversation, not writing a formal report.

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

Writing Style Rules:
1. Write like a human advisor having a casual conversation. Use "you" and "your".
2. NEVER use em dashes (—). Use regular dashes (-) or commas if needed.
3. Keep it simple and natural. Avoid robotic or overly formal language.
4. Be honest and realistic. Don't sugarcoat weak profiles, but be encouraging.
5. Keep it to 2-3 sentences total.
6. Use everyday words, not academic jargon.

Good Examples:
- Strong profile: "You've got a really solid profile here. Your GPA and test scores put you in a competitive position for top schools, and your extracurriculars show genuine commitment. I'd say you have a strong shot at many selective universities."
- Average profile: "Your academics are solid, though your test scores could be a bit stronger for the most competitive schools. Focus on target schools where your GPA puts you in the middle 50%, and you should have good options."
- Developing profile: "Your profile has potential, but you'll want to focus on less selective schools where you can really stand out. Consider schools where your GPA is above their average, and use your personal statement to show what makes you unique."

Now provide your honest, conversational analysis:`;

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
