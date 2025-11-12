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
- **Favorites System**: Client-side management with `localStorage` persistence.

### Feature Specifications
- **Authentication System**: OAuth-only authentication (Google, Kakao) integrated with `loaning.ai`'s remote PostgreSQL database. Features secure token verification, bidirectional data transformation (camelCase/snake_case), and session management. Dynamic backend URL detection for Replit environments.
- **AI-Powered Profile Analysis**: Provides real admission predictions via PrepLounge AI API, categorizing university recommendations (Safety/Target/Reach/Prestige). Displays live score previews and detailed recommendations on dedicated pages and the dashboard.
- **AI-Powered Profile Assessment**: Integrates with an OpenAI-compatible API (`llm.signalplanner.ai`) via a Node.js/Express backend to generate personalized, honest assessments of student profiles.
- **University Profile Pages**: Detailed profiles for 1,234 U.S. universities with comprehensive IPEDS 2024 data (address, size, Carnegie Classification, urbanization, website, majors). Features full bilingual support, clickable Google Maps links, and a favorites toggle.
- **University Browsing**: Displays 1,234 curated U.S. universities with infinite scroll, dual-handle range sliders for tuition/SAT, and sorting options.
- **University Comparison**: Side-by-side comparison of up to 4 universities based on key metrics.
- **Housing Support**: Provides real estate listings, currently limited to California and Georgia.
- **Consulting Programs Directory**: Lists 21 verified Korean study abroad consulting companies with filtering by 24 service tags and infinite scroll.
- **Interactive University Map**: Displays 38 universities with geographic coordinates, custom markers, zoom-based filtering, and real-time search functionality. Uses CARTO tile provider.
- **Dashboard**: Personalized for authenticated users, displaying profile statistics, a history of profile inputs, favorited schools, and AI-recommended universities with actionable insights.
- **Core Pages**: Includes HomePage, UniversitiesPage, UniversityProfilePage, UniversityMapPage, StudentProfilePage, ProfileCalculatorPage, DashboardPage, ConsultingPage, ComparePage, HousingPage, LoginPage, and SignupPage.

### System Design Choices
- The profile score is a deterministic, mathematical calculation based on academic and non-academic components, ensuring transparency.
- Scores categorize competitiveness from "Exceptional" (90-100) to "Early Stage" (Below 40).

## External Dependencies
- **loaning.ai Database API**: Remote PostgreSQL database for user authentication and profiles (`https://api-dev.loaning.ai`).
- **PrepLounge AI API**: For admission probability analysis and university recommendations (`https://dev.preplounge.ai/`).
- **SignalPlanner AI API**: OpenAI-compatible API for student profile analysis (`https://llm.signalplanner.ai`).
- **OpenStreetMap Nominatim API**: Geocoding for housing search.
- **Cozying Production API**: Real estate listings (`https://cozying.ai/cozying-api/v1/home/list`).
- **HomeJunction CDN**: Property images for housing listings (`https://listing-images.homejunction.com`).