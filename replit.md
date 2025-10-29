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
- **Navigation**: Utilizes both scroll-based navigation for quick access to homepage sections and dedicated page navigation for deeper content.

### Technical Implementations
- **Frontend Stack**: React 18, TypeScript, Vite, Tailwind CSS, and Lucide React.
- **State Management**: React Context API (`LanguageProvider`, `AuthProvider`, `StudentProfileProvider`) for global state.
- **Routing**: React Router for client-side navigation.
- **Location Search**: Integration with OpenStreetMap's Nominatim API for geocoding and standardizing location inputs.
- **Internationalization**: Custom `LanguageContext` for managing and applying translations across the application.
- **Data Handling**: Integration of real university data from CSV sources, including institution types, GPA, tuition, and acceptance rates, stored in `universities.json`.
- **Pagination**: Implemented for efficient display and loading of university listings, with smart controls and auto-reset on search/filter.

### Feature Specifications
- **AI-Powered Profile Analysis**: Calculates a student's profile score based on GPA and standardized test scores (SAT/ACT), accessible via a dedicated page.
- **University Browsing & Detail**: Allows searching, filtering, and viewing detailed profiles for 1,696 unique U.S. universities, with full bilingual support and key statistics (acceptance rate, tuition, SAT/ACT ranges, GPA).
- **Housing Support**: Provides real estate listings, currently restricted to California and Georgia, with clear messaging and validation for state-specific searches.
- **Core Pages**: Includes HomePage, UniversitiesPage, UniversityProfilePage, StudentProfilePage, DashboardPage, ConsultingPage, ComparePage, HousingPage, LoginPage, and SignupPage.

## External Dependencies
- **OpenStreetMap Nominatim API**: For geocoding locations in the housing search (rate limit: 1 request/second).
- **Cozying Production API**: For real estate listings (`https://cozying.ai/cozying-api/v1/home/list`).
- **HomeJunction CDN**: For displaying property images in housing listings (`https://listing-images.homejunction.com`).