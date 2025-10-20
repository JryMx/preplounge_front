# PrepLounge - Study Abroad Platform

## Project Overview
PrepLounge is a study abroad platform focused on helping students plan their journey to U.S. universities. The application provides AI-powered analysis, university comparisons, profile analysis, and consulting recommendations.

## Recent Changes (October 20, 2025)

### Migration from Bolt to Replit ✅
- Successfully migrated the project from Bolt environment to Replit
- Configured Vite to run on port 5000 (required for Replit)
- Workflow "Start application" set up with `npm run dev`
- All dependencies installed and working correctly

### Internationalization System ✅
Implemented a complete bilingual system supporting Korean and English across the entire homepage:

#### Implementation Details:
1. **LanguageContext** (`src/context/LanguageContext.tsx`):
   - Manages language state (Korean 'ko' / English 'en')
   - Provides translation function `t(key)`
   - Persists language preference in localStorage
   - Wraps entire application for global access
   - Contains 55+ translation keys

2. **Complete Translation Coverage**:
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

#### Translation Key Structure:
```
nav.*                         - Navigation items
home.hero.*                   - Hero section
home.calculator.*             - Calculator section
home.features.*               - Features section
home.majors.*                 - Majors section
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
