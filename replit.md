# PrepLounge - Study Abroad Platform

## Overview
PrepLounge is a study abroad platform designed to assist students in their journey to U.S. universities. It offers AI-powered analysis, university comparisons, detailed profile analysis, and personalized consulting recommendations to streamline the application process. The platform aims to simplify complex university admissions, providing a comprehensive tool for prospective students.

## Recent Changes

### October 29, 2025 - GPA Data Integration ✅
Added estimated GPA data from CSV file to all universities:

**Data Integration:**
- Successfully integrated GPA data for 870 out of 1,698 universities
- GPA values range from 3.0 to 4.0 based on real admission statistics
- Created Python script to merge CSV GPA data into universities.json
- GPA displays conditionally (only shown if data is available)

**UI Updates:**
- Added 5th stat card on University Detail Page showing "Average GPA" (평균 GPA)
- GPA displays with 2 decimal places (e.g., 3.00, 3.74, 3.63)
- Updated TypeScript interfaces to include optional `estimatedGPA` field
- Added bilingual translation keys: `university.stat.gpa`

**Technical Implementation:**
- Updated `universities.json` with estimatedGPA field
- Modified `UniversityProfilePage.tsx` to display GPA stat card
- Modified `UniversitiesPage.tsx` interface to include GPA
- Only displays GPA card when data is available (conditional rendering)

### October 29, 2025 - University Detail Page with Bilingual Support ✅
Created comprehensive university detail page that displays when clicking on a school:

**Features:**
- Full bilingual support (Korean/English) for all content
- Displays language-appropriate university names (Korean name for Korean mode, English for English mode)
- Real university data from CSV including logos, tuition, acceptance rates, test scores
- Five prominent stat cards: Acceptance Rate, Tuition, SAT Range, ACT Range, Average GPA
- Back navigation to universities list
- Common App availability badge
- Compare button for future functionality
- Admission Requirements section
- Academic Information section

**Implementation:**
- Updated `UniversityProfilePage.tsx` to use real university data from JSON
- Added translation keys for all university profile content in `LanguageContext.tsx`
- Supports dynamic routing via `/university/:id`
- Clean, professional layout matching design specifications

### October 29, 2025 - Pagination for Universities Page ✅
Implemented pagination to display universities 4 at a time:

**Features:**
- Shows only 4 universities per page (instead of all 1,698)
- Universities with real logos appear first by default for better visual appeal
- Smart pagination controls with Previous/Next buttons
- Shows up to 5 page numbers at a time
- Page counter displaying current page and total pages
- Bilingual pagination controls (Korean: 이전/다음, English: Previous/Next)
- Auto-reset to page 1 when searching or filtering
- Smooth scroll to top when changing pages

**Performance:**
- Dramatically improved page load speed
- ~425 total pages across all universities
- First 21 pages show universities with real logos (84 universities)

### October 29, 2025 - Real University Data Integration ✅
Integrated real university data from CSV file into the Universities page:

**Data Source:**
- Extracted data from comprehensive CSV file containing 1,698 U.S. universities
- All 1,698 universities included in the application

**Real Data Included:**
- Authentic university names in both English and Korean (e.g., Alabama A & M University / 앨라배마 A&M 대학교)
- Real tuition data from actual university statistics
- Authentic acceptance rates (ranging from 3% to 100%)
- Real SAT and ACT score ranges
- Institution sizes and types
- Real university logo images for 84 top universities (Harvard, Yale, Stanford, MIT, Princeton, etc.)
- Placeholder images for remaining universities

**Implementation:**
- Created `src/data/universities.json` with processed university data from CSV
- Updated `UniversitiesPage.tsx` to import and use real data
- Maintained all existing filtering, sorting, and search functionality
- Full bilingual support with Korean university names

**Performance:**
- Complete dataset of 1,698 real U.S. universities
- All filtering, sorting, and search features work with full dataset
- Seamless bilingual display in both Korean and English

### October 29, 2025 - Universities Page Translation ✅
Added full bilingual support to the Universities (Browse Schools) page:

**Implementation:**
- Added translation keys for all Universities page content to `LanguageContext.tsx`
- Updated `UniversitiesPage.tsx` to use `useLanguage` hook and `t()` function
- Replaced all hardcoded Korean text with translation keys

**Translation Keys Added:**
- `universities.title` - Page title ("대학 찾기" / "Find Universities")
- `universities.description` - Page description
- `universities.search.placeholder` - Search input placeholder
- `universities.filter.*` - All filter labels and options (Institution Type, Sort By, Tuition, SAT Range)
- `universities.results` - Results count display with {total} and {filtered} placeholders
- `universities.acceptance` - Acceptance rate label
- `universities.empty.*` - Empty state messages and reset button

**User Experience:**
- ✅ Complete English translation of Universities/Browse Schools page
- ✅ All UI elements (title, description, search, filters, results) properly translated
- ✅ Dynamic text like result counts work in both languages
- ✅ Consistent with the rest of the application's bilingual implementation

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