import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Language = 'ko' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  ko: {
    // Navbar
    'nav.universities': '학교 모아보기',
    'nav.universities.all': '전체 학교 보기',
    'nav.universities.compare': '학교 비교하기',
    'nav.profile': '프로필 분석',
    'nav.consulting': '컨설팅 추천',
    'nav.housing': '주거 지원',
    'nav.dashboard': '대시보드',
    'nav.login': '로그인',
    'nav.language': 'English',
    
    // HomePage
    'home.hero.subtitle': 'AI가 분석하는 나만의 유학 로드맵',
    'home.hero.title': '꿈의 대학, 현실이 됩니다',
    'home.hero.description': '복잡한 입시 장벽을 한눈에, 개인 맞춤 유학 플랜까지\n프렙라운지와 함께 성공적인 미국 유학을 시작하세요.',
    'home.hero.cta.predict': '합격 예측 해보기',
    'home.hero.cta.input': '입시 정보 둘러보기',
  },
  en: {
    // Navbar
    'nav.universities': 'Browse Schools',
    'nav.universities.all': 'View All Schools',
    'nav.universities.compare': 'Compare Schools',
    'nav.profile': 'Profile Analysis',
    'nav.consulting': 'Consulting',
    'nav.housing': 'Housing Support',
    'nav.dashboard': 'Dashboard',
    'nav.login': 'Login',
    'nav.language': '한국어',
    
    // HomePage
    'home.hero.subtitle': 'AI-Powered Study Abroad Roadmap',
    'home.hero.title': 'Your Dream University, Made Reality',
    'home.hero.description': 'Navigate complex admissions at a glance and get your personalized study plan.\nStart your successful U.S. college journey with PrepLounge.',
    'home.hero.cta.predict': 'Predict Admission',
    'home.hero.cta.input': 'Browse Info',
  },
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'en' || saved === 'ko') ? saved : 'ko';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return (translations[language] as Record<string, string>)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
