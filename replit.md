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
Implemented a complete bilingual system supporting Korean and English:

#### Implementation Details:
1. **LanguageContext** (`src/context/LanguageContext.tsx`):
   - Manages language state (Korean 'ko' / English 'en')
   - Provides translation function `t(key)`
   - Persists language preference in localStorage
   - Wraps entire application for global access

2. **Translation Coverage**:
   - Navigation menu (all items and dropdowns)
   - Authentication buttons (Login, Dashboard)
   - Homepage hero section (subtitle, title, description, CTAs)
   - Language toggle button

3. **User Experience**:
   - Clickable language button in navbar with globe icon
   - Shows "English" when in Korean mode, "한국어" when in English mode
   - Smooth hover effects and transitions
   - Language preference saved across sessions

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
