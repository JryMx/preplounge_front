# PrepLounge - Study Abroad Platform

## Overview
PrepLounge is an AI-powered platform assisting students with U.S. university applications. It provides tools for university comparison, personalized profile analysis, and consulting recommendations, aiming to simplify the admissions process for prospective students. The platform's business vision is to become a comprehensive, AI-driven resource for international students, maximizing their chances of admission to U.S. universities.

## User Preferences
- N/A (to be added as user specifies preferences)

## System Architecture

### UI/UX Decisions
- **Bilingual Support**: Full internationalization for Korean and English with persistent language preferences.
- **Responsive Design**: Optimized for desktop and mobile.
- **Streamlined User Experience**: Simplified data input, centered content, and compact layouts to reduce scrolling.
- **Navigation**: Combines scroll-based and dedicated page navigation.

### Technical Implementations
- **Frontend Stack**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React.
- **State Management**: React Context API for global state (`LanguageProvider`, `AuthProvider`, `StudentProfileProvider`, `FavoritesProvider`).
- **Routing**: React Router for client-side navigation.
- **Internationalization**: Custom `LanguageContext` for translations.
- **Data Handling**: University data from CSVs stored in `universities.json`.
- **Infinite Scroll**: Implemented for university and consulting pages.
- **Favorites System**: Client-side management with per-user `localStorage` persistence (temporary until backend API is available). Uses storage abstraction layer in `favoritesStorage.ts` for easy future migration to backend.
- **Environment Configuration**: Vite proxy configured via `VITE_BACKEND_URL` environment variable (defaults to `http://localhost:5000` for local development). Production deployments should set this to the actual backend service URL to enable proper API routing. When `VITE_BACKEND_URL` is set, paths are automatically rewritten from `/api/*` to `/api/v1/*` to match production backend routing.

### Feature Specifications
- **Authentication System**: OAuth-only authentication (Google, Kakao) integrated with `loaning.ai`'s remote PostgreSQL database. Frontend initiates OAuth flow directly with `https://api-dev.loaning.ai/v1/oauth/{provider}` endpoint, receives tokens via query parameters, and establishes backend sessions via `/api/auth/session` POST endpoint. Features secure token verification, provider identification, bidirectional data transformation (camelCase/snake_case), and session management. Dynamic backend URL detection for Replit environments.
- **AI-Powered Profile Analysis**: Provides real admission predictions via PrepLounge AI API, categorizing university recommendations (Safety/Target/Reach/Prestige). Displays live score previews and detailed recommendations on dedicated pages and the dashboard.
- **AI-Powered Profile Assessment**: Integrates with an OpenAI-compatible API (`llm.signalplanner.ai`) via a Node.js/Express backend to generate personalized, honest assessments of student profiles.
- **University Profile Pages**: Detailed profiles for 1,234 U.S. universities with comprehensive IPEDS 2024 data (address, size, Carnegie Classification, urbanization, website, majors). Features full bilingual support, clickable Google Maps links, and a favorites toggle.
- **University Browsing**: Displays 1,234 curated U.S. universities with infinite scroll, dual-handle range sliders for tuition/SAT, and sorting options.
- **University Comparison**: Side-by-side comparison of up to 4 universities based on key metrics.
- **Housing Support**: Provides real estate listings, currently limited to California and Georgia.
- **Consulting Programs Directory**: Lists 23 verified Korean study abroad consulting companies with filtering by 24 service tags and infinite scroll.
- **Interactive University Map**: Displays 38 universities with geographic coordinates, custom markers, zoom-based filtering, and real-time search functionality. Uses CARTO tile provider.
- **Dashboard**: Personalized for authenticated users, displaying profile statistics, a history of profile inputs, favorited schools, and AI-recommended universities with actionable insights.
- **Core Pages**: Includes HomePage, UniversitiesPage, UniversityProfilePage, UniversityMapPage, StudentProfilePage, ProfileCalculatorPage, DashboardPage, ConsultingPage, ComparePage, HousingPage, LoginPage, and SignupPage.

### System Design Choices
- **Profile Score Algorithm (Updated Nov 2025)**: Composite scoring system combining GPA + test scores using IPEDS 2023 quartile data from 1,234+ U.S. universities:
  - **SAT Percentile**: Calculated using 25th/50th/75th percentile data (Q25=1083, Q50=1185, Q75=1285)
  - **ACT Percentile**: Calculated using 25th/50th/75th percentile data (Q25=22.2, Q50=24.95, Q75=27.7)
  - **GPA Percentile**: Estimated via SAT→GPA linear regression trained on satgpa.csv (m=0.0163, b=1.5106)
  - **Composite Score**: 50% Test Percentile + 50% GPA Percentile (0-100 scale)
  - Uses normal CDF with IQR-based standard deviation estimation (σ = IQR / 1.349)
  - Examples: SAT 1400 + GPA 3.8 → ~85/100 (top 15%), SAT 1200 + GPA 3.5 → ~50/100 (top 50%)
- Both GPA and test scores (SAT or ACT) are required fields for profile submission and scoring.

### Data Persistence Architecture
- **Student Profile Storage (Updated Nov 2025)**: All profile data (academic scores, test scores, extracurriculars, AI recommendations) now persists EXCLUSIVELY on loaning.ai servers via `/api/profile` endpoints. No localStorage fallbacks. On API failures, error state is exposed to UI while preserving in-memory data. Users must be authenticated to access profile data.
- **Favorites Storage (Pending Migration)**: Still uses browser localStorage with per-user keys (`prepLoungeFavorites_${userId}`). Backend `/api/favorites` route exists and logs requests, but frontend FavoritesContext.tsx still needs to be updated to remove localStorage and use API exclusively (same pattern as StudentProfileContext).
- **Error Handling**: API failures surface clear error messages to users instead of silently falling back to localStorage, ensuring data integrity and user awareness.

## External Dependencies
- **loaning.ai Database API**: Remote PostgreSQL database for user authentication and profiles (`https://api-dev.loaning.ai`).
- **PrepLounge AI API**: For admission probability analysis and university recommendations (`https://dev.preplounge.ai/`).
- **SignalPlanner AI API**: OpenAI-compatible API for student profile analysis (`https://llm.signalplanner.ai`).
- **OpenStreetMap Nominatim API**: Geocoding for housing search.
- **Cozying Production API**: Real estate listings (`https://cozying.ai/cozying-api/v1/home/list`).
- **HomeJunction CDN**: Property images for housing listings (`https://listing-images.homejunction.com`).