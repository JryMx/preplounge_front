# PrepLounge - Study Abroad Platform

## Project Overview
PrepLounge is a study abroad platform focused on helping students plan their journey to U.S. universities. The application provides AI-powered analysis, university comparisons, profile analysis, and consulting recommendations.

## Recent Changes

### October 27, 2025 - Smart Location Search with Geocoding ✅
Implemented intelligent location search using OpenStreetMap's Nominatim API:

#### Problem Solved:
- ❌ **Old System**: Required exact formats like "Boston, MA" - users couldn't just type "boston"
- ✅ **New System**: Type any city name and it automatically finds the city and state

#### Implementation Details:

1. **Nominatim Geocoding Integration** (`geocodeLocation()` in `src/lib/cozyingApi.ts`):
   - **Free OpenStreetMap API** - No API key required
   - Automatically converts simple city names to "City, State" format
   - Examples: "boston" → "Boston, MA", "austin" → "Austin, TX"
   - Handles misspellings and partial matches
   - Rate-limited to 1 request/second (sufficient for user searches)

2. **Two-Stage Search Logic** (`src/pages/HousingPage.tsx`):
   - **Stage 1**: Try parsing structured input (e.g., "Boston, MA", "Seattle WA")
   - **Stage 2**: If parsing fails, geocode the query (e.g., "boston" → "Boston, MA")
   - Shows loading state during geocoding
   - Clear error messages if location not found

3. **User Experience**:
   - **Super simple**: Just type "boston", "austin", "seattle" - no state needed!
   - Also supports structured formats: "Boston, MA", "Austin, Texas", "Seattle WA"
   - Price display fixed: Removed "/mo" suffix (listings are purchase prices, not rentals)
   - Helpful error messages with examples if search fails
   - Works for ANY U.S. city without code changes

#### Supported Input Formats:
```
✅ "boston"               → Boston, MA (via geocoding)
✅ "austin"               → Austin, TX (via geocoding)
✅ "new york"             → New York, NY (via geocoding)
✅ "Boston, MA"           → Boston, MA (direct parse)
✅ "Austin, Texas"        → Austin, TX (direct parse)
✅ "Seattle WA"           → Seattle, WA (direct parse)
✅ "San Francisco, CA"    → San Francisco, CA (direct parse)
✅ "Portland Oregon"      → Portland, OR (direct parse)
```

#### Technical Details:
- **Geocoding API**: Nominatim (OpenStreetMap)
- **Endpoint**: `https://nominatim.openstreetmap.org/search`
- **Cost**: Free (open-source)
- **Rate Limit**: 1 request/second
- **Coverage**: All U.S. cities and towns

### October 24, 2025 - Cozying Production API Integration ✅
Successfully integrated the Housing Support page with Cozying's production API for real estate listings:

#### API Integration Details:
- **Production Endpoint**: `https://cozying.ai/cozying-api/v1/home/list`
- **Image CDN**: HomeJunction (`https://listing-images.homejunction.com`)
- **CORS**: Domain whitelisted for public Replit domain (not localhost)
- **No authentication required**: Publicly accessible API
- **Response Format**: JSON with homes array containing property details and image URLs

#### Features:
- Real-time data fetching from Cozying production API
- Displays real property data with actual images from HomeJunction CDN
- Loading states with spinner animation
- Empty states when no listings found
- Complete bilingual support maintained (Korean/English)
- Shows up to 6 listings per search
- Property cards show: images, full address, price, bedrooms, bathrooms
- Functional "View Details" buttons linking to Cozying.ai

### October 22, 2025 - Housing Support Page Translation ✅
Complete bilingual translation of the Housing Support page with 17 translation keys:

#### Sections Translated:
1. **Hero Section**: Subtitle, title, description, CTA button
2. **Search Section**: Title, description, search input placeholder
3. **Listings Section**: Section title, availability badge, price period, details button
4. **Features Section**: 
   - Main title
   - 3 feature cards (Location filtering, Search preferences, Expert consultation)
   - Each with title and multi-line description

#### Translation Key Structure:
```
housing.hero.*                  - Hero section
housing.search.*                - Search section
housing.listings.*              - Listings section
housing.badge.*                 - Status badges
housing.price.*                 - Pricing display
housing.button.*                - Action buttons
housing.features.*              - Features section
```

### October 21, 2025 - Student Profile Page Translation ✅
Complete bilingual translation of the Student Profile page with 100+ translation keys:

#### Sections Translated:
1. **Hero Section**: Title and description
2. **Score Display**: All score labels and descriptions
3. **Application Checklist**: 8 components (GPA, rank, transcript, college prep, recommendations, extracurriculars, essay, test scores)
4. **Academic Tab**: 
   - GPA, major selection (8 options)
   - Standardized test selection (SAT/ACT)
   - SAT EBRW and Math scores
   - ACT composite score
   - English proficiency test selection
5. **Non-Academic Tab**:
   - Personal statement/essay
   - Extracurriculars (type, name, grades, recognition level, hours, description)
   - Empty state messages
6. **Recommendations**: Source, depth, relevance fields with options
7. **Legacy & Citizenship**: Radio button options
8. **Save Button**: Calculate profile score
9. **School Comparison**: Search, results, categories (safety/target/reach), scoring display

#### Translation Key Structure:
```
profile.hero.*                      - Hero section
profile.score.*                     - Score display section
profile.checklist.*                 - Application checklist
profile.tabs.*                      - Tab navigation
profile.academic.*                  - Academic tab fields
profile.non-academic.*              - Non-academic tab fields
profile.extracurriculars.*          - Extracurriculars section
profile.recommendations.*           - Recommendations section
profile.legacy.*                    - Legacy status
profile.citizenship.*               - Citizenship options
profile.save                        - Save button
profile.comparison.*                - School comparison section
```

### October 20, 2025 - Migration & Homepage Translation ✅

#### Migration from Bolt to Replit ✅
- Successfully migrated the project from Bolt environment to Replit
- Configured Vite to run on port 5000 (required for Replit)
- Workflow "Start application" set up with `npm run dev`
- All dependencies installed and working correctly

#### Internationalization System ✅
Implemented a complete bilingual system supporting Korean and English across the entire homepage:

**Implementation Details:**
1. **LanguageContext** (`src/context/LanguageContext.tsx`):
   - Manages language state (Korean 'ko' / English 'en')
   - Provides translation function `t(key)`
   - Persists language preference in localStorage
   - Wraps entire application for global access
   - Now contains 172+ translation keys (55 homepage + 100 student profile + 17 housing)

2. **Homepage Translation Coverage**:
   - **Navigation**: All menu items, dropdowns, authentication buttons
   - **Hero Section**: Subtitle, title, description, CTA buttons
   - **Calculator Section**: Title, subtitle, all form labels (GPA, SAT EBRW, SAT Math), score display, description, action button
   - **Features Section**: Title, subtitle, all 3 feature cards (Schools, Profile, Consulting) with descriptions and links
   - **Majors Section**: Title, subtitle, all 5 major cards (Engineering, Business, Liberal Arts, Natural Sciences, Social Sciences) with specializations and statistics

3. **User Experience**:
   - Clickable language button in navbar with globe icon
   - Shows "English" when in Korean mode, "한국어" when in English mode
   - Smooth hover effects and transitions on language button
   - Language preference saved across sessions in localStorage
   - All interactive elements have proper data-testid attributes

#### Complete Translation Key Structure:
```
nav.*                         - Navigation items
home.hero.*                   - Hero section
home.calculator.*             - Calculator section
home.features.*               - Features section
home.majors.*                 - Majors section
profile.*                     - Student Profile page (all sections)
housing.*                     - Housing Support page (all sections)
```

#### How to Add More Translations:
Edit `src/context/LanguageContext.tsx` and add translation keys to both `ko` and `en` objects:

```typescript
const translations = {
  ko: {
    'your.key': '한국어 텍스트',
  },
  en: {
    'your.key': 'English text',
  },
};
```

Then use in components:
```typescript
const { t } = useLanguage();
return <div>{t('your.key')}</div>;
```

For multi-line text with line breaks:
```typescript
{t('your.key').split('\n').map((line, i) => (
  <span key={i}>{line}{i === 0 && <br />}</span>
))}
```

## Project Architecture

### Frontend Stack:
- React 18 with TypeScript
- React Router for navigation
- Vite for build tooling
- Tailwind CSS for styling
- Lucide React for icons

### Context Providers:
1. **LanguageProvider**: Manages internationalization
2. **AuthProvider**: Manages authentication state
3. **StudentProfileProvider**: Manages student profile data

### Pages:
- **HomePage**: Landing page with hero section and quick calculator
- **UniversitiesPage**: Browse all universities
- **UniversityProfilePage**: Detailed university information
- **StudentProfilePage**: Student profile input and analysis
- **DashboardPage**: User dashboard
- **ConsultingPage**: Consulting recommendations
- **ComparePage**: Compare multiple universities
- **HousingPage**: Housing support information
- **LoginPage** / **SignupPage**: Authentication flows

## Development

### Running the Project:
The workflow "Start application" runs automatically with:
```bash
npm run dev
```
This starts Vite dev server on port 5000.

### Key Configuration:
- Vite configured to bind to `0.0.0.0:5000` for Replit compatibility
- Hot module replacement (HMR) enabled for fast development
- TypeScript strict mode enabled

## Deployment
- Deployment target: autoscale (configured)
- Build command: `npm run build`
- Start command: `npm run start`

## User Preferences
- N/A (to be added as user specifies preferences)

## Notes
- The application is currently frontend-only
- Default language is Korean (ko)
- Language selection persists across browser sessions
