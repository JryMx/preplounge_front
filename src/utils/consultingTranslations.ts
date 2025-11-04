// Consulting tags and specialties translations
export const consultingTranslations: Record<string, { ko: string; en: string }> = {
  // Tags
  'A-Level': { ko: 'A-Level', en: 'A-Level' },
  'ACT': { ko: 'ACT', en: 'ACT' },
  'AP': { ko: 'AP', en: 'AP' },
  'Duolingo': { ko: 'Duolingo', en: 'Duolingo' },
  'GPA 관리': { ko: 'GPA 관리', en: 'GPA Management' },
  'IB': { ko: 'IB', en: 'IB' },
  'IELTS': { ko: 'IELTS', en: 'IELTS' },
  'IGCSE': { ko: 'IGCSE', en: 'IGCSE' },
  'SAT': { ko: 'SAT', en: 'SAT' },
  'STEM': { ko: 'STEM', en: 'STEM' },
  'TOEFL': { ko: 'TOEFL', en: 'TOEFL' },
  '대외활동': { ko: '대외활동', en: 'Extracurricular Activities' },
  '대회': { ko: '대회', en: 'Competitions' },
  '로스쿨': { ko: '로스쿨', en: 'Law School' },
  '메디컬': { ko: '메디컬', en: 'Medical School' },
  '봉사활동': { ko: '봉사활동', en: 'Volunteer Service' },
  '아트 컨설팅': { ko: '아트 컨설팅', en: 'Art Consulting' },
  '에세이 작성': { ko: '에세이 작성', en: 'Essay Writing' },
  '연구활동': { ko: '연구활동', en: 'Research Activities' },
  '영어시험': { ko: '영어시험', en: 'English Tests' },
  '인터뷰 준비': { ko: '인터뷰 준비', en: 'Interview Prep' },
  '인턴십': { ko: '인턴십', en: 'Internships' },
  '집중 컨설팅': { ko: '집중 컨설팅', en: 'Intensive Consulting' },
  '추천서 관리': { ko: '추천서 관리', en: 'Recommendation Letters' },
  
  // Specialties
  'EC': { ko: 'EC', en: 'EC' },
  'EC 컨설팅': { ko: 'EC 컨설팅', en: 'EC Consulting' },
  'NIW': { ko: 'NIW', en: 'NIW' },
  '대입 컨설팅': { ko: '대입 컨설팅', en: 'College Admissions' },
  '메디컬/로스쿨 컨설팅': { ko: '메디컬/로스쿨 컨설팅', en: 'Medical/Law School Consulting' },
  '미국 법인 설립': { ko: '미국 법인 설립', en: 'US Company Formation' },
  '미국 투자이민': { ko: '미국 투자이민', en: 'US Investment Immigration' },
  '미대 컨설팅': { ko: '미대 컨설팅', en: 'Art School Consulting' },
  '비숙련 취업이민': { ko: '비숙련 취업이민', en: 'Unskilled Employment Immigration' },
  '비자': { ko: '비자', en: 'Visa' },
  '비자/영주권 수속 등': { ko: '비자/영주권 수속 등', en: 'Visa/Green Card Processing' },
  '시험대비': { ko: '시험대비', en: 'Test Preparation' },
  '어학': { ko: '어학', en: 'Language Learning' },
  '어학연수': { ko: '어학연수', en: 'Language Training' },
  '어학원': { ko: '어학원', en: 'Language Institute' },
  '온라인스쿨': { ko: '온라인스쿨', en: 'Online School' },
  '유학': { ko: '유학', en: 'Study Abroad' },
  '자격증': { ko: '자격증', en: 'Certifications' },
  '조기유학': { ko: '조기유학', en: 'Early Study Abroad' },
  '편입유학': { ko: '편입유학', en: 'Transfer Abroad' },
};

export const translateConsulting = (text: string, language: 'ko' | 'en'): string => {
  const translation = consultingTranslations[text];
  if (translation) {
    return translation[language];
  }
  // If no translation found, return the original text
  return text;
};
