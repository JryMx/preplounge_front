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
7. IMPORTANT: Talk about the FULL RANGE of schools they're competitive for, not just elite schools. Most students aren't applying to Ivies - mention community colleges, state schools, regional universities as appropriate.

Good Examples:
- Strong profile (3.9+ GPA, 1500+ SAT): "You've got a really solid profile here. Your GPA and test scores put you in a competitive position for top 50 schools, and you'd be a strong candidate at many flagship state universities too. I'd say you have a good shot at selective universities and would likely be a standout applicant at most state schools."

- Good profile (3.5-3.8 GPA, 1300-1400 SAT): "Your academics are solid and put you in a good position for many state universities and regional schools. You'd be competitive at schools like Penn State, Ohio State, or University of Arizona, and you could be a strong candidate at less selective state schools. Focus on schools where your stats are in the middle 50% or higher."

- Average profile (3.0-3.4 GPA, 1100-1200 SAT): "You have plenty of college options with these stats. You'd fit well at many regional universities and less selective state schools where you can really thrive. Look at schools like Cal State schools, directional state universities, or solid regional colleges where your GPA is at or above their average."

- Developing profile (2.5-2.9 GPA, under 1100 SAT): "Community college can be a great starting point, or look at open-admission universities where you can build a strong record. Many students start at a 2-year school and transfer to a 4-year university after proving themselves. This path gives you solid options and can save money too."

Now provide your honest, conversational analysis:`;

    // Check if API key is available
    if (!process.env.OPEN_AI_KEY) {
      throw new Error('OPEN_AI_KEY environment variable is not set');
    }

    // Call OpenAI-compatible API with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
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
    
    const analysis = data.choices?.[0]?.message?.content || '';
    
    if (!analysis) {
      console.error('Empty analysis received from API. Full response:', data);
    }
    
    res.json({ analysis });

  } catch (error) {
    console.error('Error analyzing profile:', error);
    
    // Check if it was a timeout
    if (error.name === 'AbortError') {
      return res.status(504).json({ 
        error: 'Request timeout',
        message: 'The AI analysis request took too long. Please try again.' 
      });
    }
    
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
