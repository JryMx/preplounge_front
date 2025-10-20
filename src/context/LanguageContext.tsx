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
    
    // HomePage - Hero
    'home.hero.subtitle': 'AI가 분석하는 나만의 유학 로드맵',
    'home.hero.title': '꿈의 대학, 현실이 됩니다',
    'home.hero.description': '복잡한 입시 정보를 한눈에, 개인 맞춤 유학 플랜까지\n프렙라운지와 함께 성공적인 미국 유학을 시작하세요.',
    'home.hero.cta.predict': '합격 예측 해보기',
    'home.hero.cta.input': '입시 정보 둘러보기',
    
    // HomePage - Calculator
    'home.calculator.title': '합격 가능성 미리보기',
    'home.calculator.subtitle': '성적 정보를 입력하고 프로필 점수를 확인해 보세요.',
    'home.calculator.gpa': 'GPA (4.0점 만점)',
    'home.calculator.sat.ebrw': 'SAT EBRW (800점 만점)',
    'home.calculator.sat.math': 'SAT Math (800점 만점)',
    'home.calculator.score': '프로필 점수',
    'home.calculator.score.total': '/ 100점',
    'home.calculator.description': 'GPA와 SAT 점수를 기반으로 한 간단한 계산입니다.\n과외활동, 에세이, 개인화된 대학 추천을 포함한 종합적인\n분석을 위해서는 전체 프로필을 완성해주세요.',
    'home.calculator.button': '합격 가능성 상세 분석하기',
    
    // HomePage - Features
    'home.features.title': '핵심 서비스',
    'home.features.subtitle': '프렙라운지는 국제학교 학생들의 성공적인 대입을 위한 다양한 서비스를 제공합니다.',
    'home.features.schools.title': '학교 정보\n모아보기',
    'home.features.schools.description': '입학에 필요한 서류와 지원 일정 등, 미국 1,200여 개 대학의 입학 정보를 한눈에 확인하세요.',
    'home.features.profile.title': '개인 맞춤\n프로필 분석',
    'home.features.profile.description': '학생의 성적과 대외활동 경력을 토대로 AI가 입학 가능성을 분석해줘요.',
    'home.features.consulting.title': '컨설팅 프로그램\n비교/추천',
    'home.features.consulting.description': '국내 컨설팅 학원을 비교하고 프로필 강화를 위한 최적의 프로그램을 만나보세요.',
    'home.features.link': '바로가기 →',
    
    // HomePage - Majors
    'home.majors.title': '전공 선택, 아직도 고민되시나요?',
    'home.majors.subtitle': '간단한 테스트로 나에게 맞는 전공을 찾아보세요.\n* 평균 연봉과 취업률은 추정치입니다.',
    'home.majors.engineering': '공학 (Engineering)',
    'home.majors.engineering.specializations': '컴퓨터 과학, 전기공학, 기계공학',
    'home.majors.engineering.salary': '평균 연봉 $85,000',
    'home.majors.engineering.employment': '취업률 94%',
    'home.majors.engineering.opt': 'STEM OPT 3년 가능',
    'home.majors.business': '경영 (Business)',
    'home.majors.business.specializations': '경영학, 경제학, 금융학, 마케팅',
    'home.majors.business.salary': '평균 연봉 $78,000',
    'home.majors.business.employment': '취업률 88%',
    'home.majors.business.networking': '네트워킹 기회 풍부',
    'home.majors.liberal': '인문학 (Liberal Arts)',
    'home.majors.liberal.specializations': '문학, 철학, 역사, 언어학, 문화연구',
    'home.majors.liberal.salary': '평균 연봉 $65,000',
    'home.majors.liberal.employment': '취업률 82%',
    'home.majors.liberal.thinking': '비판적 사고력 개발',
    'home.majors.natural': '자연과학 (Natural Sciences)',
    'home.majors.natural.specializations': '생물학, 화학, 물리학, 수학, 환경과학',
    'home.majors.natural.salary': '평균 연봉 $72,000',
    'home.majors.natural.employment': '취업률 85%',
    'home.majors.natural.graduate': '대학원 진학률 높음',
    'home.majors.social': '사회과학 (Social Sciences)',
    'home.majors.social.specializations': '심리학, 정치학, 사회학, 국제관계학',
    'home.majors.social.salary': '평균 연봉 $68,000',
    'home.majors.social.employment': '취업률 83%',
    'home.majors.social.problem': '사회 문제 해결',
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
    
    // HomePage - Hero
    'home.hero.subtitle': 'AI-Powered Study Abroad Roadmap',
    'home.hero.title': 'Your Dream University, Made Reality',
    'home.hero.description': 'Navigate complex admissions at a glance and get your personalized study plan.\nStart your successful U.S. college journey with PrepLounge.',
    'home.hero.cta.predict': 'Predict Admission',
    'home.hero.cta.input': 'Browse Info',
    
    // HomePage - Calculator
    'home.calculator.title': 'Preview Your Admission Chances',
    'home.calculator.subtitle': 'Enter your grades and check your profile score.',
    'home.calculator.gpa': 'GPA (4.0 Scale)',
    'home.calculator.sat.ebrw': 'SAT EBRW (800 max)',
    'home.calculator.sat.math': 'SAT Math (800 max)',
    'home.calculator.score': 'Profile Score',
    'home.calculator.score.total': '/ 100',
    'home.calculator.description': 'This is a simple calculation based on GPA and SAT scores.\nFor comprehensive analysis including extracurricular activities, essays,\nand personalized university recommendations, please complete your full profile.',
    'home.calculator.button': 'Get Detailed Admission Analysis',
    
    // HomePage - Features
    'home.features.title': 'Key Services',
    'home.features.subtitle': 'PrepLounge provides diverse services for successful college admissions for international school students.',
    'home.features.schools.title': 'School\nInformation',
    'home.features.schools.description': 'View admission information for over 1,200 U.S. universities, including required documents and application deadlines.',
    'home.features.profile.title': 'Personalized\nProfile Analysis',
    'home.features.profile.description': 'AI analyzes your admission chances based on your grades and extracurricular activities.',
    'home.features.consulting.title': 'Consulting Programs\nComparison',
    'home.features.consulting.description': 'Compare domestic consulting academies and find the best programs to strengthen your profile.',
    'home.features.link': 'Go →',
    
    // HomePage - Majors
    'home.majors.title': 'Still Wondering About Your Major?',
    'home.majors.subtitle': 'Find your ideal major with a simple test.\n* Average salary and employment rates are estimates.',
    'home.majors.engineering': 'Engineering',
    'home.majors.engineering.specializations': 'Computer Science, Electrical Engineering, Mechanical Engineering',
    'home.majors.engineering.salary': 'Avg. Salary $85,000',
    'home.majors.engineering.employment': '94% Employment',
    'home.majors.engineering.opt': '3-Year STEM OPT Available',
    'home.majors.business': 'Business',
    'home.majors.business.specializations': 'Business, Economics, Finance, Marketing',
    'home.majors.business.salary': 'Avg. Salary $78,000',
    'home.majors.business.employment': '88% Employment',
    'home.majors.business.networking': 'Rich Networking Opportunities',
    'home.majors.liberal': 'Liberal Arts',
    'home.majors.liberal.specializations': 'Literature, Philosophy, History, Linguistics, Cultural Studies',
    'home.majors.liberal.salary': 'Avg. Salary $65,000',
    'home.majors.liberal.employment': '82% Employment',
    'home.majors.liberal.thinking': 'Critical Thinking Development',
    'home.majors.natural': 'Natural Sciences',
    'home.majors.natural.specializations': 'Biology, Chemistry, Physics, Mathematics, Environmental Science',
    'home.majors.natural.salary': 'Avg. Salary $72,000',
    'home.majors.natural.employment': '85% Employment',
    'home.majors.natural.graduate': 'High Grad School Rate',
    'home.majors.social': 'Social Sciences',
    'home.majors.social.specializations': 'Psychology, Political Science, Sociology, International Relations',
    'home.majors.social.salary': 'Avg. Salary $68,000',
    'home.majors.social.employment': '83% Employment',
    'home.majors.social.problem': 'Social Problem Solving',
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
