# PrepLounge - Study Abroad Platform

## Overview
PrepLounge is a study abroad platform designed to assist students in their journey to U.S. universities. It offers AI-powered analysis, university comparisons, detailed profile analysis, and personalized consulting recommendations to streamline the application process. The platform aims to simplify complex university admissions, providing a comprehensive tool for prospective students.

## Recent Changes

### October 28, 2025 - Housing Availability Restriction to CA and GA ✅
Restricted housing searches to California and Georgia only, with clear messaging throughout:

**Changes Made:**
1. **State Validation**: Added `isValidState()` function to check if search is for CA or GA
2. **Availability Notice Banner**: Blue banner displayed prominently showing "Currently available in California and Georgia only"
3. **Search Validation**: All searches (parsed and geocoded) are validated before calling API
4. **Updated Placeholder**: Changed to show CA/GA examples: "Los Angeles, Atlanta, Fresno, Savannah"
5. **Error Messaging**: Clear error when user searches outside CA/GA with examples of valid cities
6. **Empty State Updates**: When no listings found, shows CA and GA city examples

**Translation Keys Added:**
- `housing.availability.notice` - Banner text for availability
- `housing.search.error.invalid-state` - Error for invalid state searches
- `housing.search.error.examples` - Examples of valid cities
- `housing.empty.examples` - California city examples
- `housing.empty.examples.ga` - Georgia city examples

**User Experience:**
- ✅ Clear upfront notice that only CA/GA are available
- ✅ Prevents searches outside these states
- ✅ Helpful error messages with city examples
- ✅ Works in both Korean and English

### October 28, 2025 - Hero Section Layout Fix ✅
Fixed layout issues where buttons overlapped with description text when using English language:

**Problem:**
- Hero sections had fixed height (`height: 454px`) causing content overflow
- English text is longer than Korean, causing buttons to overlap description
- Issue affected homepage hero section and housing page hero section

**Solution:**
- Changed `.hero-section` from `height: 454px` to `min-height: 454px` - allows section to expand with longer content
- Removed fixed `height: 204px` from `.hero-content` - no longer constrains content
- Added horizontal padding (`padding: 80px 20px`) for better mobile responsiveness  
- Added `max-width: 1200px` to `.hero-content` for better desktop layout

**Result:**
- ✅ No more overlapping text in English or Korean
- ✅ Responsive layout that adapts to content length
- ✅ Works across homepage and housing page hero sections

### October 27, 2025 - Profile Analysis Navigation Update ✅
Changed the "Profile Analysis" navigation link to scroll to the calculator section on the homepage instead of navigating to a separate page:

**Implementation:**
- Added `id="profile-calculator"` to the calculator section on the homepage
- Modified navbar to use `scrollToCalculator()` function instead of Link component
- Function checks current location and navigates to homepage first if needed
- Then smoothly scrolls to the calculator section
- Works on both desktop and mobile navigation

**User Experience:**
- Clicking "프로필 분석" / "Profile Analysis" in navbar scrolls to calculator
- No page navigation required - instant access to calculator
- Smooth scroll animation for better UX
- Mobile menu closes automatically after clicking

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