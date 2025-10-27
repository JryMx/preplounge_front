# PrepLounge - Study Abroad Platform

## Overview
PrepLounge is a study abroad platform designed to assist students in their journey to U.S. universities. It offers AI-powered analysis, university comparisons, detailed profile analysis, and personalized consulting recommendations to streamline the application process. The platform aims to simplify complex university admissions, providing a comprehensive tool for prospective students.

## User Preferences
- N/A (to be added as user specifies preferences)

## System Architecture

### UI/UX Decisions
- **Bilingual Support**: Full internationalization for Korean and English across the entire application, with language preference persisting in local storage.
- **Responsive Design**: Hero sections adapt to content length, and layouts are optimized for both desktop and mobile viewing.
- **Minimalist Design**: Student Profile page is ultra-simplified, focusing on core academic data for quick completion.
- **Centered Layouts**: Forms and content areas are often centered with `max-width` for improved readability and aesthetics.

### Technical Implementations
- **Frontend Stack**: React 18 with TypeScript, Vite for build tooling, Tailwind CSS for styling, and Lucide React for icons.
- **State Management**: Utilizes React Context API with `LanguageProvider`, `AuthProvider`, and `StudentProfileProvider` for global state management.
- **Routing**: React Router is used for client-side navigation.
- **Location Search**: Smart location search uses OpenStreetMap's Nominatim API for geocoding, converting natural language city names into "City, State" formats.
- **Internationalization**: A custom `LanguageContext` manages translations, allowing for easy addition of new keys.

### Feature Specifications
- **AI-Powered Profile Analysis**: Students input GPA and standardized test scores (SAT/ACT) for a calculated profile score.
- **University Comparison**: Search and categorize universities as safety, target, or reach based on student profiles.
- **Housing Support**: Integrates with a real estate API to display property listings with images and details.
- **Core Pages**:
    - **HomePage**: Landing page with hero section and a quick profile calculator.
    - **UniversitiesPage**: Browse all universities.
    - **UniversityProfilePage**: Detailed university information.
    - **StudentProfilePage**: Input and analysis of student academic profile.
    - **DashboardPage**: User-specific dashboard.
    - **ConsultingPage**: Consulting recommendations.
    - **ComparePage**: Compare multiple universities.
    - **HousingPage**: Housing support information.
    - **LoginPage / SignupPage**: User authentication.

## External Dependencies
- **OpenStreetMap Nominatim API**: Used for geocoding locations in the housing search feature. It is a free, open-source service with a rate limit of 1 request/second.
- **Cozying Production API**: Integrated for real estate listings on the Housing Support page. The endpoint is `https://cozying.ai/cozying-api/v1/home/list`, and it does not require authentication.
- **HomeJunction CDN**: Used to retrieve and display property images for housing listings, with the image CDN base URL being `https://listing-images.homejunction.com`.