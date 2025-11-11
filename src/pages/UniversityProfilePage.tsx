import React, { useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Users, DollarSign, BookOpen, ArrowLeft, Heart, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useFavorites } from '../context/FavoritesContext';
import universitiesData from '../data/universities.json';
import { getCityTranslation } from '../data/cityTranslations';
import './university-profile-page.css';

interface ApplicationRequirements {
  gpa?: string;
  rank?: string;
  record?: string;
  prepProgram?: string;
  recommendations?: string;
  competencies?: string;
  workExperience?: string;
  essay?: string;
  legacyStatus?: string;
  testScores?: string;
  englishProficiency?: string;
}

interface AcademicInfo {
  graduationRate?: number;
  averageEarnings?: number;
  degreeTypes?: {
    bachelors: boolean;
    masters: boolean;
    doctoral: boolean;
  };
}

interface University {
  id: string;
  name: string;
  englishName: string;
  location: string;
  city?: string;
  state?: string;
  street?: string;
  zipCode?: number;
  url?: string;
  sizeCategory?: string;
  carnegieSize?: string;
  urbanization?: string;
  carnegieClassification?: string;
  tuition: number;
  acceptanceRate: number;
  satRange: string;
  actRange: string;
  image: string;
  type: string;
  size: string;
  estimatedGPA?: number | null;
  applicationRequirements?: ApplicationRequirements;
  academicInfo?: AcademicInfo;
  programs?: string[];
}

const universities: University[] = universitiesData as University[];

const getUniversityData = (id: string) => {
  return universities.find(uni => uni.id === id);
};

const getStateAbbreviation = (state: string): string => {
  const stateAbbreviations: Record<string, string> = {
    'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
    'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
    'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
    'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
    'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
    'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
    'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
    'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
    'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
    'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY',
    'District of Columbia': 'DC', 'Puerto Rico': 'PR'
  };
  return stateAbbreviations[state] || state;
};

const getStateTranslation = (state: string): string => {
  const translations: Record<string, string> = {
    'Alabama': '앨라배마주',
    'Alaska': '알래스카주',
    'Arizona': '애리조나주',
    'Arkansas': '아칸소주',
    'California': '캘리포니아주',
    'Colorado': '콜로라도주',
    'Connecticut': '코네티컷주',
    'Delaware': '델라웨어주',
    'District of Columbia': '워싱턴 D.C.',
    'Florida': '플로리다주',
    'Georgia': '조지아주',
    'Hawaii': '하와이주',
    'Idaho': '아이다호주',
    'Illinois': '일리노이주',
    'Indiana': '인디애나주',
    'Iowa': '아이오와주',
    'Kansas': '캔자스주',
    'Kentucky': '켄터키주',
    'Louisiana': '루이지애나주',
    'Maine': '메인주',
    'Maryland': '메릴랜드주',
    'Massachusetts': '매사추세츠주',
    'Michigan': '미시간주',
    'Minnesota': '미네소타주',
    'Mississippi': '미시시피주',
    'Missouri': '미주리주',
    'Montana': '몬태나주',
    'Nebraska': '네브래스카주',
    'Nevada': '네바다주',
    'New Hampshire': '뉴햄프셔주',
    'New Jersey': '뉴저지주',
    'New Mexico': '뉴멕시코주',
    'New York': '뉴욕주',
    'North Carolina': '노스캐롤라이나주',
    'North Dakota': '노스다코타주',
    'Ohio': '오하이오주',
    'Oklahoma': '오클라호마주',
    'Oregon': '오리건주',
    'Pennsylvania': '펜실베이니아주',
    'Rhode Island': '로드아일랜드주',
    'South Carolina': '사우스캐롤라이나주',
    'South Dakota': '사우스다코타주',
    'Tennessee': '테네시주',
    'Texas': '텍사스주',
    'Utah': '유타주',
    'Vermont': '버몬트주',
    'Virginia': '버지니아주',
    'Washington': '워싱턴주',
    'West Virginia': '웨스트버지니아주',
    'Wisconsin': '위스콘신주',
    'Wyoming': '와이오밍주',
    'Puerto Rico': '푸에르토리코'
  };
  return translations[state] || state;
};

// City translation moved to src/data/cityTranslations.ts for centralized management
// Import with: import { getCityTranslation } from '../data/cityTranslations';


const formatLocationDisplay = (city?: string, state?: string, language?: 'ko' | 'en'): string => {
  // If both are missing, show country
  if (!city && !state) {
    return language === 'ko' ? '미국' : 'United States';
  }
  
  // If only state is available
  if (!city && state) {
    return language === 'ko' ? getStateTranslation(state) : state;
  }
  
  // If only city is available
  if (city && !state) {
    return language === 'ko' ? getCityTranslation(city) : city;
  }
  
  // Both city and state are available
  if (language === 'ko') {
    // Format: "State명 City명" (e.g., "캘리포니아주 클레어몬트")
    return `${getStateTranslation(state!)} ${getCityTranslation(city!)}`;
  }
  
  return `${city}, ${getStateAbbreviation(state!)}`;
};

const formatSchoolSize = (sizeCategory?: string, carnegieSize?: string, language?: 'ko' | 'en'): string => {
  if (!sizeCategory) return language === 'ko' ? '정보 없음' : 'N/A';
  
  if (language === 'ko') {
    if (sizeCategory === '20,000 and above') return '대형 (20,000명 이상)';
    if (sizeCategory === '10,000 - 19,999') return '대형 (10,000-19,999명)';
    if (sizeCategory === '5,000 - 9,999') return '중형 (5,000-9,999명)';
    if (sizeCategory === '1,000 - 4,999') return '소형 (1,000-4,999명)';
    if (sizeCategory.includes('Under')) return '소형 (1,000명 미만)';
  } else {
    // English translations
    if (sizeCategory === '20,000 and above') return 'Large (20,000 and above)';
    if (sizeCategory === '10,000 - 19,999') return 'Large (10,000-19,999)';
    if (sizeCategory === '5,000 - 9,999') return 'Medium (5,000-9,999)';
    if (sizeCategory === '1,000 - 4,999') return 'Small (1,000-4,999)';
    if (sizeCategory.includes('Under')) return 'Small (Under 1,000)';
  }
  
  return `${carnegieSize || ''} (${sizeCategory})`.trim();
};

const translateUrbanization = (urbanization?: string, language?: 'ko' | 'en'): string => {
  if (!urbanization) return language === 'ko' ? '정보 없음' : 'N/A';
  
  // Translate urbanization categories
  if (language === 'ko') {
    if (urbanization.includes('City: Large')) return '대도시';
    if (urbanization.includes('City: Midsize')) return '중소도시';
    if (urbanization.includes('City: Small')) return '소도시';
    if (urbanization.includes('Suburb: Large')) return '교외';
    if (urbanization.includes('Suburb: Midsize')) return '교외';
    if (urbanization.includes('Suburb: Small')) return '교외';
    if (urbanization.includes('Town: Fringe')) return '지방도시';
    if (urbanization.includes('Town: Distant')) return '지방도시';
    if (urbanization.includes('Town: Remote')) return '지방도시';
    if (urbanization.includes('Rural: Fringe')) return '시골';
    if (urbanization.includes('Rural: Distant')) return '시골';
    if (urbanization.includes('Rural: Remote')) return '시골';
    if (urbanization.includes('Rural')) return '시골';
  } else {
    // For English, clean up the format to show just the descriptive part
    if (urbanization.includes('City: Large')) return 'Large City';
    if (urbanization.includes('City: Midsize')) return 'Midsize City';
    if (urbanization.includes('City: Small')) return 'Small City';
    if (urbanization.includes('Suburb: Large')) return 'Large Suburb';
    if (urbanization.includes('Suburb: Midsize')) return 'Midsize Suburb';
    if (urbanization.includes('Suburb: Small')) return 'Small Suburb';
    if (urbanization.includes('Town: Fringe')) return 'Town: Fringe';
    if (urbanization.includes('Town: Distant')) return 'Town: Distant';
    if (urbanization.includes('Town: Remote')) return 'Town: Remote';
    if (urbanization.includes('Rural')) return 'Rural';
  }
  
  return urbanization;
};

const translateCarnegieClassification = (classification?: string, language?: 'ko' | 'en'): string => {
  if (!classification) return language === 'ko' ? '정보 없음' : 'N/A';
  if (language === 'en') return classification;
  
  const translations: Record<string, string> = {
    'Mixed Associate Large': '전문학사 학위 수여 대학',
    'Mixed Associate Medium': '전문학사 학위 수여 대학',
    'Mixed Associate Small': '전문학사 학위 수여 대학',
    'Mixed Associate/Baccalaureate': '전문학사 및 학사 학위 수여 대학',
    'Mixed Baccalaureate': '학사 학위 수여 대학',
    'Mixed Undergraduate/Graduate-Doctorate Large': '박사 학위 수여 대학',
    'Mixed Undergraduate/Graduate-Doctorate Medium': '박사 학위 수여 대학',
    'Mixed Undergraduate/Graduate-Doctorate Small': '박사 학위 수여 대학',
    'Mixed Undergraduate/Graduate-Master\'s Large/Medium': '석사 학위 수여 대학',
    'Mixed Undergraduate/Graduate-Master\'s Small': '석사 학위 수여 대학',
    'Professions-focused Associate Large/Medium': '직업 중심 전문학사 학위 수여 대학',
    'Professions-focused Associate Small': '직업 중심 전문학사 학위 수여 대학',
    'Professions-focused Associate/Baccalaureate': '직업 중심 전문학사 및 학사 학위 수여 대학',
    'Professions-focused Baccalaureate Medium': '직업 중심 학사 학위 수여 대학',
    'Professions-focused Baccalaureate Small': '직업 중심 학사 학위 수여 대학',
    'Professions-focused Undergraduate/Graduate-Doctorate Large': '직업 중심 박사 학위 수여 대학',
    'Professions-focused Undergraduate/Graduate-Doctorate Medium': '직업 중심 박사 학위 수여 대학',
    'Professions-focused Undergraduate/Graduate-Doctorate Small': '직업 중심 박사 학위 수여 대학',
    'Professions-focused Undergraduate/Graduate-Master\'s Large/Medium': '직업 중심 석사 학위 수여 대학',
    'Professions-focused Undergraduate/Graduate-Master\'s Small': '직업 중심 석사 학위 수여 대학',
    'Special Focus: Applied and Career Studies': '실용·직업전문학교',
    'Special Focus: Arts and Sciences': '인문·자연과학 대학',
    'Special Focus: Arts, Music, and Design': '예술대학',
    'Special Focus: Business': '경영대학',
    'Special Focus: Graduate Studies': '대학원',
    'Special Focus: Law': '법과대학',
    'Special Focus: Medical Schools and Centers': '의과대학',
    'Special Focus: Nursing': '간호대학',
    'Special Focus: Other Health Professions': '기타 보건대학',
    'Special Focus: Technology, Engineering, and Sciences': '공과대학',
    'Special Focus: Theological Studies': '신학대학',
    'Not classified': '분류 없음'
  };
  
  return translations[classification] || classification;
};

const formatFullAddress = (street?: string, city?: string, state?: string, zipCode?: number): string => {
  const parts = [];
  if (street) parts.push(street);
  if (city) parts.push(city);
  if (state) parts.push(getStateAbbreviation(state));
  if (zipCode) parts.push(zipCode.toString());
  
  return parts.length > 0 ? parts.join(', ') : 'N/A';
};

const getGoogleMapsLink = (street?: string, city?: string, state?: string, zipCode?: number): string => {
  const addressParts = [];
  if (street) addressParts.push(street);
  if (city) addressParts.push(city);
  if (state) addressParts.push(state);
  if (zipCode) addressParts.push(zipCode.toString());
  
  const query = addressParts.join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};

const formatWebsiteUrl = (url?: string): string => {
  if (!url) return '';
  // Add https:// if not present
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
};

const getRequirementBadgeType = (status?: string): 'required' | 'optional' | 'not-considered' => {
  if (!status) return 'not-considered';
  if (status.includes('Required')) return 'required';
  if (status.includes('Not required') || status.includes('considered if submitted')) return 'optional';
  return 'not-considered';
};

const translateRequirementStatus = (language: 'ko' | 'en', status?: string): string => {
  if (!status) return language === 'ko' ? '불필요' : 'Not Considered';
  
  if (status.includes('Required')) {
    return language === 'ko' ? '필수' : 'Required';
  }
  if (status.includes('Not required') || status.includes('considered if submitted')) {
    return language === 'ko' ? '선택 (제출 시 고려)' : 'Optional (Considered if submitted)';
  }
  if (status.includes('Not considered')) {
    return language === 'ko' ? '불필요' : 'Not Considered';
  }
  
  return status;
};

// Program name translations (official translation dictionary)
const translateProgramName = (program: string, language: 'ko' | 'en'): string => {
  if (language === 'en') return program;
  
  const translations: Record<string, string> = {
    'Agricultural/Animal/Plant/Veterinary Science and Related Fields': '농학, 생물과학, 수의학 등',
    'Natural Resources and Conservation': '자연자원 및 환경보전학',
    'Architecture and Related Services': '건축학',
    'Area, Ethnic, Cultural, Gender, and Group Studies': '지역, 민족, 문화, 젠더 및 집단 연구',
    'Communication, Journalism, and Related Programs': '커뮤니케이션학 및 언론학',
    'Communications Technologies/Technicians and Support Services': '커뮤니케이션 기술',
    'Computer and Information Sciences and Support Services': '컴퓨터과학',
    'Culinary, Entertainment, and Personal Services': '조리학, 엔터테인먼트학, 서비스학 등',
    'Education': '교육학',
    'Engineering': '공학',
    'Engineering/Engineering-related Technologies/Technicians': '공학 기술',
    'Foreign Languages, Literatures, and Linguistics': '어문학',
    'Family and Consumer Sciences/Human Sciences': '소비자과학 및 인류학',
    'Legal Professions and Studies': '법학',
    'English Language and Literature/Letters': '영어영문학',
    'Liberal Arts and Sciences, General Studies and Humanities': '인문학',
    'Library Science': '문헌학',
    'Biological and Biomedical Sciences': '생명학 및 의생명과학',
    'Mathematics and Statistics': '수학 및 통계학',
    'Military Technologies and Applied Sciences': '군사학',
    'Multi/Interdisciplinary Studies': '다학제 및 융합학',
    'Parks, Recreation, Leisure, Fitness, and Kinesiology': '레저스포츠학',
    'Philosophy and Religious Studies': '철학 및 종교학',
    'Theology and Religious Vocations': '신학',
    'Physical Sciences': '물상과학',
    'Science Technologies/Technicians': '과학기술학',
    'Psychology': '심리학',
    'Homeland Security, Law Enforcement, Firefighting and Related Protective Services': '안전학, 법행정학, 소방학 등',
    'Public Administration and Social Service Professions': '행정학',
    'Social Sciences': '사회과학',
    'Construction Trades': '건설무역학',
    'Mechanic and Repair Technologies/Technicians': '정비 기술',
    'Precision Production': '정밀공학',
    'Transportation and Materials Moving': '운수 및 원자재이송학',
    'Visual and Performing Arts': '시각 및 공연예술',
    'Health Professions and Related Programs': '보건학',
    'Business, Management, Marketing, and Related Support Services': '경영학',
    'History': '사학'
  };
  
  return translations[program] || program;
};

const UniversityProfilePage: React.FC = () => {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const location = useLocation();
  const university = getUniversityData(id || '1');
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Determine where to navigate back based on where user came from
  const backLink = (location.state as { from?: string })?.from || '/universities';

  // Handle favorite toggle
  const handleFavoriteToggle = () => {
    if (university) {
      toggleFavorite(university.id);
    }
  };

  const isUniversityFavorite = university ? isFavorite(university.id) : false;

  if (!university) {
    return (
      <div className="university-profile-not-found">
        <div className="university-profile-not-found-content">
          <h2 className="university-profile-not-found-title">{t('university.notfound.title')}</h2>
          <Link to={backLink} className="university-profile-not-found-link">
            {t('university.notfound.back')}
          </Link>
        </div>
      </div>
    );
  }

  const universityName = language === 'ko' ? university.name : university.englishName;

  return (
    <div className="university-profile-page">
      {/* Header */}
      <div className="university-profile-header">
        <div className="university-profile-header-container">
          <Link
            to={backLink}
            className="university-profile-back-link"
            data-testid="link-back-to-universities"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('university.back')}
          </Link>

          <div className="university-profile-hero">
            <img
              src={university.image}
              alt={universityName}
              className="university-profile-image"
              data-testid="img-university-logo"
              style={{ opacity: university.image.includes('preplounge-logo') ? 0.2 : 1 }}
              onError={(e) => { e.currentTarget.src = '/preplounge-logo-final.png'; e.currentTarget.style.opacity = '0.2'; }}
            />

            <div className="university-profile-hero-content">
              <div className="university-profile-title-row">
                <h1 className="university-profile-title" data-testid="text-university-name">
                  {universityName}
                </h1>
              </div>

              {/* Location and Type */}
              <div style={{ marginTop: '8px', fontSize: '16px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin className="h-4 w-4" style={{ flexShrink: 0 }} />
                <span>{formatLocationDisplay(university.city, university.state, language)} • {university.type === '공립' ? (language === 'ko' ? '공립' : 'Public') : (language === 'ko' ? '사립' : 'Private')}</span>
              </div>

              {/* School Details */}
              <div className="university-profile-details-grid">
                {/* Full Address with Google Maps link */}
                <div className="university-profile-detail-item">
                  <span className="university-profile-detail-label">{language === 'ko' ? '주소' : 'Address'}:</span>
                  <a 
                    href={getGoogleMapsLink(university.street, university.city, university.state, university.zipCode)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="university-profile-detail-value"
                    style={{ color: '#3B82F6', textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    {formatFullAddress(university.street, university.city, university.state, university.zipCode)}
                  </a>
                </div>

                {/* School Size */}
                <div className="university-profile-detail-item">
                  <span className="university-profile-detail-label">{language === 'ko' ? '학교 규모' : 'School Size'}:</span>
                  <span className="university-profile-detail-value">{formatSchoolSize(university.sizeCategory, university.carnegieSize, language)}</span>
                </div>

                {/* Carnegie Classification */}
                {university.carnegieClassification && (
                  <div className="university-profile-detail-item">
                    <span className="university-profile-detail-label">{language === 'ko' ? '카네기 분류' : 'Carnegie Classification'}:</span>
                    <span className="university-profile-detail-value">{translateCarnegieClassification(university.carnegieClassification, language)}</span>
                  </div>
                )}

                {/* Degree of Urbanization */}
                <div className="university-profile-detail-item">
                  <span className="university-profile-detail-label">{language === 'ko' ? '지역 유형' : 'Urbanization'}:</span>
                  <span className="university-profile-detail-value">{translateUrbanization(university.urbanization, language)}</span>
                </div>

                {/* Official Website */}
                {university.url && (
                  <div className="university-profile-detail-item">
                    <span className="university-profile-detail-label">{language === 'ko' ? '공식 웹사이트' : 'Official Website'}:</span>
                    <a 
                      href={formatWebsiteUrl(university.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="university-profile-detail-value"
                      style={{ color: '#3B82F6', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      {university.url}
                    </a>
                  </div>
                )}
              </div>

              <button 
                className="university-profile-compare-btn" 
                data-testid="button-favorite"
                onClick={handleFavoriteToggle}
                style={{ 
                  marginTop: '16px',
                  backgroundColor: isUniversityFavorite ? '#DC2626' : '#082F49',
                  color: '#FFFFFF',
                  transition: 'all 0.2s'
                }}
              >
                <Heart 
                  className="h-4 w-4" 
                  fill={isUniversityFavorite ? 'currentColor' : 'none'}
                />
                {isUniversityFavorite ? t('university.removeFromFavorites') : t('university.addToFavorites')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="university-profile-content">
        {/* Quick Stats */}
        <div className="university-profile-stats">
          <div className="university-profile-stat-card" data-testid="card-acceptance-rate">
            <div className="university-profile-stat-header">
              <Users className="h-5 w-5" style={{color: '#082F49'}} />
              <span className="university-profile-stat-label">{t('university.stat.acceptance')}</span>
            </div>
            <div className="university-profile-stat-value" data-testid="text-acceptance-rate">
              {university.acceptanceRate}%
            </div>
          </div>

          <div className="university-profile-stat-card" data-testid="card-tuition">
            <div className="university-profile-stat-header">
              <DollarSign className="h-5 w-5" style={{color: '#082F49'}} />
              <span className="university-profile-stat-label">{t('university.stat.tuition')}</span>
            </div>
            <div className="university-profile-stat-value" data-testid="text-tuition">
              ${university.tuition.toLocaleString()}
            </div>
          </div>

          <div className="university-profile-stat-card" data-testid="card-sat">
            <div className="university-profile-stat-header">
              <BookOpen className="h-5 w-5" style={{color: '#082F49'}} />
              <span className="university-profile-stat-label">{t('university.stat.sat')}</span>
            </div>
            <div className="university-profile-stat-value" data-testid="text-sat-range">
              {university.satRange}
            </div>
          </div>

          <div className="university-profile-stat-card" data-testid="card-act">
            <div className="university-profile-stat-header">
              <BookOpen className="h-5 w-5" style={{color: '#082F49'}} />
              <span className="university-profile-stat-label">{t('university.stat.act')}</span>
            </div>
            <div className="university-profile-stat-value" data-testid="text-act-range">
              {university.actRange}
            </div>
          </div>

          {university.estimatedGPA && (
            <div className="university-profile-stat-card" data-testid="card-gpa">
              <div className="university-profile-stat-header">
                <BookOpen className="h-5 w-5" style={{color: '#082F49'}} />
                <span className="university-profile-stat-label">{t('university.stat.gpa')}</span>
              </div>
              <div className="university-profile-stat-value" data-testid="text-gpa">
                {university.estimatedGPA.toFixed(2)}
              </div>
            </div>
          )}
        </div>

        {/* Two Column Layout: Application Requirements & Academic Information */}
        <div className="university-profile-two-column">
          {/* Left Column: Application Requirements */}
          <div className="university-profile-section">
            <h2 className="university-profile-section-title" data-testid="title-application-requirements">
              <BookOpen className="h-6 w-6" />
              {language === 'ko' ? '지원 요건' : 'Application Requirements'}
            </h2>
            <div className="university-profile-requirements-list">
              {university.applicationRequirements?.gpa && (
                <div className="requirement-item">
                  <span className="requirement-name">{language === 'ko' ? '고등학교 GPA' : 'High School GPA'}</span>
                  <span className={`requirement-badge ${getRequirementBadgeType(university.applicationRequirements.gpa)}`} data-testid="badge-gpa">
                    {translateRequirementStatus(language, university.applicationRequirements.gpa)}
                  </span>
                </div>
              )}
              {university.applicationRequirements?.rank && (
                <div className="requirement-item">
                  <span className="requirement-name">{language === 'ko' ? '고등학교 석차' : 'High School Rank'}</span>
                  <span className={`requirement-badge ${getRequirementBadgeType(university.applicationRequirements.rank)}`} data-testid="badge-rank">
                    {translateRequirementStatus(language, university.applicationRequirements.rank)}
                  </span>
                </div>
              )}
              {university.applicationRequirements?.record && (
                <div className="requirement-item">
                  <span className="requirement-name">{language === 'ko' ? '고등학교 성적표' : 'High School Transcript'}</span>
                  <span className={`requirement-badge ${getRequirementBadgeType(university.applicationRequirements.record)}`} data-testid="badge-transcript">
                    {translateRequirementStatus(language, university.applicationRequirements.record)}
                  </span>
                </div>
              )}
              {university.applicationRequirements?.prepProgram && (
                <div className="requirement-item">
                  <span className="requirement-name">{language === 'ko' ? '대학 준비 과정 이수 경험' : 'College Prep Program Completion'}</span>
                  <span className={`requirement-badge ${getRequirementBadgeType(university.applicationRequirements.prepProgram)}`} data-testid="badge-prep">
                    {translateRequirementStatus(language, university.applicationRequirements.prepProgram)}
                  </span>
                </div>
              )}
              {university.applicationRequirements?.recommendations && (
                <div className="requirement-item">
                  <span className="requirement-name">{language === 'ko' ? '추천서 여부' : 'Recommendation'}</span>
                  <span className={`requirement-badge ${getRequirementBadgeType(university.applicationRequirements.recommendations)}`} data-testid="badge-recommendation">
                    {translateRequirementStatus(language, university.applicationRequirements.recommendations)}
                  </span>
                </div>
              )}
              {university.applicationRequirements?.competencies && (
                <div className="requirement-item">
                  <span className="requirement-name">{language === 'ko' ? '대외활동 경력' : 'Demonstration of Competencies'}</span>
                  <span className={`requirement-badge ${getRequirementBadgeType(university.applicationRequirements.competencies)}`} data-testid="badge-competencies">
                    {translateRequirementStatus(language, university.applicationRequirements.competencies)}
                  </span>
                </div>
              )}
              {university.applicationRequirements?.workExperience && (
                <div className="requirement-item">
                  <span className="requirement-name">{language === 'ko' ? '근무 경험' : 'Work Experience'}</span>
                  <span className={`requirement-badge ${getRequirementBadgeType(university.applicationRequirements.workExperience)}`} data-testid="badge-work-experience">
                    {translateRequirementStatus(language, university.applicationRequirements.workExperience)}
                  </span>
                </div>
              )}
              {university.applicationRequirements?.essay && (
                <div className="requirement-item">
                  <span className="requirement-name">{language === 'ko' ? '자기소개서/에세이' : 'Personal Statement/Essay'}</span>
                  <span className={`requirement-badge ${getRequirementBadgeType(university.applicationRequirements.essay)}`} data-testid="badge-essay">
                    {translateRequirementStatus(language, university.applicationRequirements.essay)}
                  </span>
                </div>
              )}
              {university.applicationRequirements?.legacyStatus && (
                <div className="requirement-item">
                  <span className="requirement-name">{language === 'ko' ? '가족 중 동문 여부' : 'Legacy Status'}</span>
                  <span className={`requirement-badge ${getRequirementBadgeType(university.applicationRequirements.legacyStatus)}`} data-testid="badge-legacy">
                    {translateRequirementStatus(language, university.applicationRequirements.legacyStatus)}
                  </span>
                </div>
              )}
              {university.applicationRequirements?.testScores && (
                <div className="requirement-item">
                  <span className="requirement-name">{language === 'ko' ? '입학 시험 점수' : 'Admission Test Scores'}</span>
                  <span className={`requirement-badge ${getRequirementBadgeType(university.applicationRequirements.testScores)}`} data-testid="badge-test-scores">
                    {translateRequirementStatus(language, university.applicationRequirements.testScores)}
                  </span>
                </div>
              )}
              {university.applicationRequirements?.englishProficiency && (
                <div className="requirement-item">
                  <span className="requirement-name">{language === 'ko' ? '영어 능력 시험 점수' : 'English Proficiency Test'}</span>
                  <span className={`requirement-badge ${getRequirementBadgeType(university.applicationRequirements.englishProficiency)}`} data-testid="badge-english">
                    {translateRequirementStatus(language, university.applicationRequirements.englishProficiency)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Academic Information */}
          <div className="university-profile-section">
            <h2 className="university-profile-section-title" data-testid="title-academic-info">
              <BookOpen className="h-6 w-6" />
              {language === 'ko' ? '학업 정보' : 'Academic Information'}
            </h2>
            <div className="academic-info-content">
              {/* Graduation Rate */}
              {university.academicInfo?.graduationRate !== undefined && (
                <div className="academic-info-item">
                  <span className="academic-info-label">{language === 'ko' ? '졸업률' : 'Graduation Rate'}</span>
                  <span className="academic-info-value graduation-rate" data-testid="text-graduation-rate">
                    {university.academicInfo.graduationRate}%
                  </span>
                </div>
              )}

              {/* Average Earnings After Graduation */}
              {university.academicInfo?.averageEarnings !== undefined && (
                <div className="academic-info-item">
                  <span className="academic-info-label">{language === 'ko' ? '졸업 후 평균 소득' : 'Average Earnings After Graduation'}</span>
                  <span className="academic-info-value" data-testid="text-average-earnings">
                    ${university.academicInfo.averageEarnings.toLocaleString()}
                  </span>
                </div>
              )}

              {/* Data Source Note */}
              {(university.academicInfo?.graduationRate !== undefined || university.academicInfo?.averageEarnings !== undefined) && (
                <div className="academic-info-item">
                  <span style={{ fontSize: '12px', color: '#6B7280', fontStyle: 'italic' }}>
                    {language === 'ko' ? '출처: College Scorecard' : 'Source: College Scorecard'}
                  </span>
                </div>
              )}

              {/* Degree Types */}
              {university.academicInfo?.degreeTypes && (
                <div className="academic-info-item">
                  <span className="academic-info-label">{language === 'ko' ? '수여 학위' : 'Degree Types Offered'}</span>
                  <div className="degree-types" data-testid="section-degree-types">
                    {university.academicInfo.degreeTypes.bachelors && (
                      <span className="degree-badge">{language === 'ko' ? '학사' : 'Bachelor\'s'}</span>
                    )}
                    {university.academicInfo.degreeTypes.masters && (
                      <span className="degree-badge">{language === 'ko' ? '석사' : 'Master\'s'}</span>
                    )}
                    {university.academicInfo.degreeTypes.doctoral && (
                      <span className="degree-badge">{language === 'ko' ? '박사' : 'Doctoral'}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Available Majors/Programs */}
              {university.programs && university.programs.filter(p => p !== 'Grand total').length > 0 && (
                <div className="academic-info-item">
                  <span className="academic-info-label">{language === 'ko' ? '개설 전공' : 'Available Majors'}</span>
                  <div className="majors-list" data-testid="section-majors">
                    {university.programs
                      .filter(program => program !== 'Grand total')
                      .map((program, index) => (
                        <div key={index} className="major-item">
                          {translateProgramName(program, language)}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="university-profile-actions">
              <Link 
                to="/profile-calculator" 
                className="action-button primary"
                data-testid="button-check-admission"
              >
                <BookOpen className="h-5 w-5" />
                {language === 'ko' ? '합격 가능성 확인하기' : 'Check Admission Probability'}
              </Link>
              <button 
                className="action-button secondary"
                data-testid="button-add-favorite"
                onClick={handleFavoriteToggle}
                style={{ 
                  backgroundColor: isUniversityFavorite ? '#DC2626' : undefined,
                  borderColor: isUniversityFavorite ? '#DC2626' : undefined,
                  color: isUniversityFavorite ? '#FFFFFF' : undefined,
                  transition: 'all 0.2s'
                }}
              >
                <Heart 
                  className="h-5 w-5" 
                  fill={isUniversityFavorite ? 'currentColor' : 'none'}
                />
                {isUniversityFavorite ? t('university.removeFromFavorites') : t('university.addToFavorites')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversityProfilePage;
