# PrepLounge - Study Abroad Platform

## Overview
PrepLounge is an AI-powered study abroad platform designed to assist students in their application journey to U.S. universities. It offers tools for university comparisons, detailed profile analysis, and personalized consulting recommendations, aiming to simplify the complex admissions process and provide a comprehensive resource for prospective students.

## User Preferences
- N/A (to be added as user specifies preferences)

## System Architecture

### UI/UX Decisions
- **Bilingual Support**: Comprehensive internationalization for Korean and English, with language preferences persisted.
- **Responsive Design**: Layouts are optimized for both desktop and mobile.
- **Streamlined User Experience**: Simplified data input, centered content with `max-width` for readability.
- **Compact Layouts**: Profile Calculator page optimized for reduced scrolling with tighter spacing and horizontal form-results layout.
- **Navigation**: Utilizes both scroll-based navigation for quick access and dedicated page navigation.

### Technical Implementations
- **Frontend Stack**: React 18, TypeScript, Vite, Tailwind CSS, and Lucide React.
- **State Management**: React Context API (`LanguageProvider`, `AuthProvider`, `StudentProfileProvider`) for global state.
- **Routing**: React Router for client-side navigation.
- **Internationalization**: Custom `LanguageContext` for managing translations.
- **Data Handling**: Integration of real university data from CSV sources, stored in `universities.json`.
- **Infinite Scroll**: Used for seamless browsing on university and consulting pages.

### Feature Specifications
- **Authentication System**:
  - Multiple authentication methods: Email/Password, Google OAuth, and Kakao OAuth.
  - PostgreSQL database stores user accounts with support for multiple providers.
  - Secure password hashing with bcrypt for email/password accounts.
  - Session-based authentication with express-session and passport.js.
  - AuthModal component provides tabbed interface for Sign In and Sign Up.
  - Database schema supports nullable emails for Kakao users without email permissions.
  - Partial unique indexes allow multiple accounts without emails while preventing duplicate emails.
  - Users can sign in with any method; separate accounts are created for different providers even with the same email.
  - Navbar displays user menu with logout functionality when authenticated.
  - CORS configured for both localhost and 127.0.0.1 origins.
  - Requires SESSION_SECRET environment variable for secure session management.
  - Google and Kakao OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, KAKAO_CLIENT_ID, KAKAO_CLIENT_SECRET) can be configured when available.
- **AI-Powered Profile Analysis**:
  - Available on a dedicated page (`/profile-calculator`) and HomePage calculator section.
  - Connects to PrepLounge AI API for real admission predictions.
  - Supports SAT and ACT scoring systems.
  - Returns comprehensive university recommendations categorized as Safety/Target/Reach/Prestige.
  - **HomePage**: Live profile score preview with real-time calculation and top 3 highest-quality schools per category in a fixed 2x2 grid layout (3 schools + "See More" button positioned as 4th grid item).
  - **Profile Calculator Page**: Displays top 12 highest-quality schools per category in a fixed 2-column grid layout.
  - **Dashboard Page**: Displays top 3 schools per category.
  - All schools sorted by quality score.
  - Full bilingual support, loading states, and error handling.
  - Clickable school cards navigate to detailed university profiles.
  - Recommendations saved to profile context.
- **AI-Powered Profile Assessment (Student Profile Page)**:
  - Uses OpenAI-compatible API (gpt-5 model via `https://llm.signalplanner.ai`).
  - Backend API server (Node.js/Express on port 3001) handles AI requests.
  - Generates a brief, honest 2-3 sentence assessment of the student's profile, integrated into the Profile Score section.
  - Analysis is realistic and personalized, acknowledging strengths and areas for improvement.
  - Features loading states, error handling, and bilingual UI.
- **University Profile Pages**:
  - Detailed profiles for 1,234 unique U.S. universities.
  - Displays location and type with map icon directly under university name:
    - English format: "📍 City, State Abbreviation • Type" (e.g., "📍 Cambridge, MA • Private")
    - Korean format: "📍 State명 City명 • Type" (e.g., "📍 캘리포니아주 클레어몬트 • 사립", "📍 매사추세츠주 케임브리지 • 사립", "📍 아이오와주 그리넬 • 사립")
    - All 50 U.S. states have official Korean translations from IPEDS dictionary.
    - **100% City Coverage with Korean Translations**: All 796 unique city names across all 1,234 universities have Korean translations.
      - **Centralized Translation System**: `src/data/cityTranslations.ts` contains 849 entries covering all city name variants.
      - **Smart Normalization**: Automatic handling of variants like "St." vs "Saint" and spacing differences.
      - **Complete Coverage**: Every university displays Korean city names in Korean language mode across all pages (UniversitiesPage, UniversityProfilePage, ComparePage, UniversityMapPage, etc.).
  - All 1,234 universities include comprehensive data from IPEDS 2024 dataset:
    - **Full Address**: Clickable Google Maps link with street, city, state, and ZIP code (e.g., "Massachusetts Hall, Cambridge, MA, 2138"). Gracefully handles missing street addresses.
    - **School Size**: Based on Institution size category and Carnegie Classification (e.g., "Large (20,000 and above)" or "대형 (20,000명 이상)")
    - **Carnegie Classification 2025**: Institutional classification showing degree focus (e.g., "Mixed Undergraduate/Graduate-Doctorate Large" or "박사 학위 수여 대학"). All 31 classification types have official Korean translations.
    - **Degree of Urbanization**: Location classification (e.g., "Midsize City" or "중규모 도시", "Large Suburb" or "대도시 교외")
    - **Official Website**: Clickable link to university's official website (e.g., "www.harvard.edu/")
  - State names automatically converted to standard abbreviations (MA, CA, NY, etc.).
  - Displays quick stats, application requirements (data-driven from IPEDS 2023 with status badges), and academic information (graduation rates, degree types, 26,145 program entries across 26 categories).
  - **Available Majors**: All 38 program categories have official Korean translations from IPEDS translation dictionary (e.g., "Engineering" → "공학", "Computer and Information Sciences" → "컴퓨터과학").
  - Includes action buttons: "Check Admission Probability" and "Add to Comparison List".
  - Full bilingual support with Korean translations for all data fields.
- **University Browsing & Detail**:
  - Displays 1,234 curated U.S. universities with infinite scroll.
  - Features dual-handle range sliders for tuition and SAT scores.
  - Sorting options: "Recommended" (default), Alphabetical, SAT Range.
  - Full bilingual support with Korean-translated city names on listing cards.
  - **Location Display on Listing Cards**: Consistent format across all pages showing Korean state + city names (e.g., "캘리포니아주 클레어몬트 • 사립", "매사추세츠주 케임브리지 • 사립").
  - **University Images**: 1,134 universities use PrepLounge logo (displayed at 20% opacity for subtle branding), 100 universities retain official seals at full opacity.
- **University Comparison**:
  - Side-by-side comparison of up to 4 universities.
  - Clean, text-only search interface with up to 100 results.
  - Compares key metrics: Acceptance rate, tuition, SAT/ACT ranges, GPA, type, size, location.
  - Comprehensive table view and full bilingual support.
- **Housing Support**: Provides real estate listings, currently restricted to California and Georgia, with state-specific validation.
- **Consulting Programs Directory**:
  - Displays 21 verified Korean study abroad consulting companies.
  - Features 24 unique service tags for filtering (e.g., SAT, TOEFL, Essay Writing).
  - Infinite scroll loads 10 companies initially.
  - Filtering by specialization tags (multi-select).
  - Full bilingual support with English translations for all Korean tags.
  - Company details include name, address, contact, and service tags.
- **Interactive University Map**:
  - Displays 38 universities with geographic coordinates on an interactive U.S. map.
  - Uses CARTO tile provider for reliable map rendering (600px fixed height).
  - Custom markers show university abbreviations and tuition prices ($K format).
  - Zoom-based marker filtering to prevent clutter: 10 universities at zoom ≤5, 20 at zoom ≤7, all 38 at zoom >7.
  - Live counter shows visible/total universities with helpful zoom hint.
  - **University Search**: Real-time autocomplete search by Korean/English name or abbreviation, with smooth fly-to animation on selection.
  - Search results dropdown with university details (name, abbreviation, tuition).
  - Keyboard support (Enter key) and click-to-select functionality.
  - Reset button to return to default USA view.
  - Clicking markers opens popups with university details and navigation links.
  - Multiple zoom methods: scroll wheel, trackpad gestures, touch zoom, double-click, keyboard (+/-), box zoom (Shift+drag).
  - Full bilingual support with react-leaflet@4.2.1.
- **Core Pages**: Includes HomePage, UniversitiesPage, UniversityProfilePage, UniversityMapPage, StudentProfilePage, ProfileCalculatorPage, DashboardPage, ConsultingPage, ComparePage, HousingPage, LoginPage, and SignupPage.

### System Design Choices
- The profile score is a deterministic, mathematical calculation (out of 100) based on academic (GPA, test scores, course rigor) and non-academic components (extracurriculars, personal statement, recommendations, legacy, English proficiency).
- The same inputs always produce the same output, ensuring transparency and manual verifiability.
- Score ratings categorize competitiveness from "Exceptional" (90-100) for Ivy League to "Early Stage" (Below 40) for foundational skill building.

## External Dependencies
- **PrepLounge AI API**: For real-time admission probability analysis and university recommendations (`https://dev.preplounge.ai/`).
- **SignalPlanner AI API**: OpenAI-compatible API for student profile analysis (`https://llm.signalplanner.ai`). Requires `OPEN_AI_KEY` environment variable.
- **OpenStreetMap Nominatim API**: For geocoding locations in the housing search.
- **Cozying Production API**: For real estate listings (`https://cozying.ai/cozying-api/v1/home/list`).
- **HomeJunction CDN**: For displaying property images in housing listings (`https://listing-images.homejunction.com`).