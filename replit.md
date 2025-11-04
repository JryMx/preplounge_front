# PrepLounge - Study Abroad Platform

## Overview
PrepLounge is an AI-powered study abroad platform designed to assist students in their application journey to U.S. universities. It offers tools for university comparisons, detailed profile analysis, and personalized consulting recommendations, aiming to simplify the complex admissions process and provide a comprehensive resource for prospective students.

## User Preferences
- N/A (to be added as user specifies preferences)

## System Architecture

### UI/UX Decisions
- **Bilingual Support**: Comprehensive internationalization for Korean and English, with language preferences persisted.
- **Responsive Design**: Layouts are optimized for both desktop and mobile, with dynamic adjustments for content length (e.g., hero sections).
- **Streamlined User Experience**: The Student Profile page is simplified for efficient data input, and forms/content areas are centered with `max-width` for readability.
- **Compact Layouts**: Profile Calculator page optimized for reduced scrolling with tighter spacing (48px section padding, 24px container gap, 12px form fields), horizontal form-results layout, and flex-start alignment to prevent unnecessary vertical stretching.
- **Navigation**: Utilizes both scroll-based navigation for quick access to homepage sections and dedicated page navigation for deeper content.

### Technical Implementations
- **Frontend Stack**: React 18, TypeScript, Vite, Tailwind CSS, and Lucide React.
- **State Management**: React Context API (`LanguageProvider`, `AuthProvider`, `StudentProfileProvider`) for global state.
- **Routing**: React Router for client-side navigation.
- **Location Search**: Integration with OpenStreetMap's Nominatim API for geocoding and standardizing location inputs.
- **Internationalization**: Custom `LanguageContext` for managing and applying translations across the application.
- **Data Handling**: Integration of real university data from CSV sources, including institution types, GPA, tuition, and acceptance rates, stored in `universities.json`.
- **Infinite Scroll**: Universities page uses infinite scroll for seamless browsing - loads 12 universities initially, then loads 12 more as user scrolls down. Automatically manages state and provides visual feedback when all results are displayed.

### Feature Specifications
- **AI-Powered Profile Analysis**: 
  - Available in TWO locations: Dedicated page (`/profile-calculator`) AND HomePage calculator section
  - Connects to PrepLounge AI API (`https://dev.preplounge.ai/`) for real admission predictions
  - Supports both SAT (Math + EBRW) and ACT scoring systems with toggle
  - Returns comprehensive university recommendations categorized as Safety/Target/Reach/Prestige
  - **HomePage**: Displays top 3 highest-quality schools per category with "More Detailed Analysis" button linking to `/student-profile`
  - **Profile Calculator Page**: Displays top 12 highest-quality schools per category for comprehensive analysis
  - All schools sorted by quality score for optimal recommendations
  - Full bilingual support for all results (Korean/English)
  - Real-time analysis with loading states and error handling
  - Clickable school cards navigate to detailed university profiles
- **AI-Powered Profile Analysis** (Student Profile Page):
  - Uses OpenAI-compatible API (gpt-5 model via https://llm.signalplanner.ai)
  - Backend API server (Node.js/Express on port 3001) handles AI requests
  - Requires OPEN_AI_KEY environment variable for authentication
  - Automatically triggers when user clicks "Calculate Profile Score" button
  - Generates brief, honest 2-3 sentence assessment of student's profile
  - Analysis is realistic and personalized - acknowledges both strengths and areas for improvement
  - Integrated directly into Profile Score section (not a separate section)
  - Page automatically scrolls to Profile Score section when calculation completes
  - Displays score, rating, and AI analysis together in one cohesive view
  - Loading states, error handling, and bilingual UI (Korean/English)
- **University Profile Pages**: 
  - Detailed profiles for 1,234 unique U.S. universities
  - Quick stats: Acceptance rate, tuition, SAT/ACT ranges, GPA
  - **Application Requirements section**: Displays accurate, school-specific requirements from IPEDS data (2023)
    - 11 requirement categories: GPA, rank, transcript, prep program, recommendations, competencies, work experience, essay, legacy status, test scores, English proficiency
    - Three status types: Required (red badge), Optional/Considered if submitted (yellow badge), Not Considered (gray badge)
    - Fully data-driven from Excel source, showing only applicable requirements per school
  - **Academic Information section**: Displays real data from IPEDS 2023
    - Graduation rates: Actual 4-year completion rates for each institution (e.g., 84% for University of Miami)
    - Degree types: Shows which programs the school offers (Bachelor's, Master's, Doctoral)
    - Available programs: Scrollable list of all actual programs offered by each university
      - 26,145 total program entries mapped across all 1,234 universities
      - Programs organized by 26 major categories from IPEDS data
      - Full Korean translations for all program categories
    - Custom scrollbar styling for improved UX
  - **Action Buttons**: Two interactive buttons for future functionality
    - "Check Admission Probability" (primary button) - Links to Profile Calculator
    - "Add to Comparison List" (secondary button) - For university comparison feature
  - Full bilingual support with complete language separation
- **University Browsing & Detail**: 
  - Displays 1,234 curated U.S. universities (filtered from verified list with duplicates removed)
  - Infinite scroll implementation loads 12 schools initially, then 12 more as user scrolls down
  - Single dual-handle range sliders for tuition ($0-$70k) and SAT scores (800-1600) with automatic handle collision prevention
  - "Recommended" sort (default) prioritizes schools with official logos and verified data
  - Additional sorting: Alphabetical (A-Z, Z-A), SAT Range (ascending/descending)
  - Full bilingual support with complete language separation
- **University Comparison**: 
  - Side-by-side comparison of up to 4 universities
  - Clean, text-only university search interface sorted alphabetically (no seal images)
  - Displays up to 100 search results for easy browsing
  - Compare key metrics: Acceptance rate, tuition, SAT/ACT ranges, GPA, type, size, location
  - Comprehensive table view with all comparison data
  - Full bilingual support for all metrics and labels
- **Housing Support**: Provides real estate listings, currently restricted to California and Georgia, with clear messaging and validation for state-specific searches.
- **Core Pages**: Includes HomePage, UniversitiesPage, UniversityProfilePage, StudentProfilePage, ProfileCalculatorPage, DashboardPage, ConsultingPage, ComparePage, HousingPage, LoginPage, and SignupPage.

## External Dependencies
- **PrepLounge AI API**: For real-time admission probability analysis and university recommendations (`https://dev.preplounge.ai/`). No authentication required.
- **SignalPlanner AI API**: OpenAI-compatible API for student profile analysis (`https://llm.signalplanner.ai`). Requires OPEN_AI_KEY environment variable.
  - Configured to provide conversational, human-like feedback
  - Writing style: No em dashes, casual tone, everyday language
  - Covers FULL RANGE of schools: from community colleges to Ivy League
  - Mentions state schools, regional universities, and 2-year colleges as appropriate
  - Temperature: 1 (only supported value)
- **OpenStreetMap Nominatim API**: For geocoding locations in the housing search (rate limit: 1 request/second).
- **Cozying Production API**: For real estate listings (`https://cozying.ai/cozying-api/v1/home/list`).
- **HomeJunction CDN**: For displaying property images in housing listings (`https://listing-images.homejunction.com`).

## Profile Score Calculation Methodology

**Important: Checklist items are IGNORED for scoring. Only actual form inputs count.**

The profile score (out of 100) is a deterministic, transparent metric that evaluates college application competitiveness. The same inputs always produce the same output.

### Scoring Breakdown

**ACADEMIC COMPONENTS (65 points total)**

1. **GPA (30 points)** - Most important academic metric
   - 3.9-4.0: 30 points (Exceptional)
   - 3.7-3.8: 27 points (Excellent)
   - 3.5-3.6: 24 points (Very Good)
   - 3.3-3.4: 20 points (Good)
   - 3.0-3.2: 16 points (Above Average)
   - 2.7-2.9: 12 points (Average)
   - 2.5-2.6: 8 points (Below Average)
   - <2.5: Proportional (up to 8 points)

2. **Standardized Test Scores (25 points)**
   - SAT:
     - 1500-1600: 25 points
     - 1400-1499: 22 points
     - 1300-1399: 19 points
     - 1200-1299: 15 points
     - 1100-1199: 11 points
     - 1000-1099: 7 points
     - <1000: Proportional (up to 7 points)
   - ACT:
     - 34-36: 25 points
     - 31-33: 22 points
     - 28-30: 19 points
     - 25-27: 15 points
     - 22-24: 11 points
     - 19-21: 7 points
     - <19: Proportional (up to 7 points)

3. **Course Rigor - AP/IB (10 points)**
   - AP Courses: 1.5 points per course (max 10)
   - IB Score: (Score/45) × 10
   - Fallback: 5 points if GPA ≥ 3.5 (assumes some rigor)

**NON-ACADEMIC COMPONENTS (35 points total)**

4. **Extracurricular Activities (15 points)**
   - Recognition Level per activity:
     - International: 3 points
     - National: 2.5 points
     - Regional: 1.5 points
     - Local: 0.5 points
   - Time Commitment per activity:
     - 15+ hours/week: 1.5 points
     - 10-14 hours/week: 1 point
     - 5-9 hours/week: 0.5 points
   - Total capped at 15 points (3-4 strong activities max out score)

5. **Personal Statement (10 points)**
   - Has essay: 10 points
   - No essay: 0 points

6. **Recommendation Letters (5 points)**
   - Base points for quantity:
     - 3+ letters: 2 points
     - 2 letters: 1.5 points
     - 1 letter: 0.5 points
   - Quality bonus per letter:
     - Depth: "knows very well" (+0.8), "knows well" (+0.5), "knows somewhat" (+0.2)
     - Relevance: "very relevant" (+0.5), "somewhat relevant" (+0.2)
   - Total capped at 5 points

7. **Legacy Status (2 points)**
   - Has legacy: 2 points
   - No legacy: 0 points

8. **English Proficiency (3 points)**
   - International students (TOEFL):
     - 110-120: 3 points
     - 100-109: 2.5 points
     - 90-99: 2 points
     - 80-89: 1.5 points
     - <80: Proportional (up to 1.5 points)
   - Domestic students: 3 points (no language barrier)

### Score Ratings & School Competitiveness
This score helps you understand where you stand across the full spectrum of U.S. universities:

- **90-100: Exceptional**
  - Competitive for: Ivy League, MIT, Stanford, Top 10 schools
  - Examples: Harvard, Yale, Princeton, Stanford, MIT, Caltech
  
- **80-89: Very Strong**
  - Competitive for: Top 20-50 highly selective universities
  - Examples: Duke, Northwestern, Vanderbilt, Rice, USC, NYU
  
- **70-79: Strong**
  - Competitive for: Top 50-100 competitive universities
  - Examples: Boston University, Tulane, Pepperdine, SMU, University of Miami
  
- **60-69: Good**
  - Competitive for: Top 100-200 solid universities, flagship state schools
  - Examples: Penn State, Ohio State, Indiana University, University of Arizona
  
- **50-59: Fair**
  - Competitive for: Many regional universities, less selective state schools
  - Examples: San Jose State, University of Nevada, Cal State schools
  
- **40-49: Developing**
  - Competitive for: Community colleges, open admission schools
  - Options: 2-year colleges, transfer pathway programs
  
- **Below 40: Early Stage**
  - Focus: Building foundational skills, community college pathway
  - Strategy: Start at community college, transfer to 4-year university

### Deterministic Nature
The calculation is purely mathematical and deterministic:
- Same inputs ALWAYS produce same output
- No randomness or AI-based scoring in the calculation
- All thresholds and weights are clearly defined
- Score can be manually verified using the formulas above

## Running Workflows
Two workflows must be running for full functionality:
1. **Start application** - Frontend React app on port 5000
2. **Backend Server** - Express API on port 3001 for AI profile analysis (connects to SignalPlanner AI)