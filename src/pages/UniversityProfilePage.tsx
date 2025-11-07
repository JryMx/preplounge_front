import React, { useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { Users, DollarSign, BookOpen, ArrowLeft, Plus, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import universitiesData from '../data/universities.json';
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

const getCityTranslation = (city: string): string => {
  const translations: Record<string, string> = {
    'New York': '뉴욕',
    'Chicago': '시카고',
    'Boston': '보스턴',
    'Baltimore': '볼티모어',
    'Los Angeles': '로스앤젤레스',
    'Washington': '워싱턴',
    'Springfield': '스프링필드',
    'Houston': '휴스턴',
    'Philadelphia': '필라델피아',
    'Atlanta': '애틀랜타',
    'Pittsburgh': '피츠버그',
    'New Orleans': '뉴올리언스',
    'Portland': '포틀랜드',
    'Saint Paul': '세인트폴',
    'Rochester': '로체스터',
    'Madison': '매디슨',
    'Providence': '프로비던스',
    'Nashville': '내슈빌',
    'Milwaukee': '밀워키',
    'Denver': '덴버',
    'Columbus': '컬럼버스',
    'Cleveland': '클리블랜드',
    'Charleston': '찰스턴',
    'Worcester': '우스터',
    'Columbia': '컬럼비아',
    'Saint Louis': '세인트루이스',
    'Buffalo': '버팔로',
    'Brooklyn': '브루클린',
    'San Antonio': '샌안토니오',
    'Jacksonville': '잭슨빌',
    'San Diego': '샌디에이고',
    'Irvine': '어바인',
    'Claremont': '클레어몬트',
    'Athens': '아테네',
    'Richmond': '리치먼드',
    'Louisville': '루이빌',
    'Lexington': '렉싱턴',
    'Cambridge': '케임브리지',
    'Salem': '세일럼',
    'Grand Rapids': '그랜드래피즈',
    'Kansas City': '캔자스시티',
    'Canton': '캔턴',
    'Omaha': '오마하',
    'Bronx': '브롱크스',
    'Charlotte': '샬럿',
    'Dallas': '댈러스',
    'Spartanburg': '스파탄버그',
    'Huntsville': '헌츠빌',
    'Montgomery': '몽고메리',
    'Troy': '트로이',
    'San Francisco': '샌프란시스코',
    'Seattle': '시애틀',
    'Detroit': '디트로이트',
    'Miami': '마이애미',
    'Phoenix': '피닉스',
    'Minneapolis': '미니애폴리스',
    'Tampa': '탬파',
    'Cincinnati': '신시내티',
    'Memphis': '멤피스',
    'Austin': '오스틴',
    'Las Vegas': '라스베이거스',
    'Tucson': '투손',
    'Albuquerque': '앨버커키',
    'Fresno': '프레즈노',
    'Sacramento': '새크라멘토',
    'Long Beach': '롱비치',
    'Oakland': '오클랜드',
    'Raleigh': '롤리',
    'Indianapolis': '인디애나폴리스',
    'San Jose': '산호세',
    'Fort Worth': '포트워스',
    'El Paso': '엘패소',
    'Salt Lake City': '솔트레이크시티',
    'Boise': '보이시',
    'Spokane': '스포캔',
    'Anchorage': '앵커리지',
    'Honolulu': '호놀룰루',
    'Newark': '뉴어크',
    'Jersey City': '저지시티',
    'New Haven': '뉴헤이븐',
    'Hartford': '하트퍼드',
    'Stamford': '스탬퍼드',
    'Bridgeport': '브리지포트',
    'Des Moines': '디모인',
    'Wichita': '위치타',
    'Topeka': '토피카',
    'Lincoln': '링컨',
    'Little Rock': '리틀록',
    'Baton Rouge': '배턴루지',
    'Jackson': '잭슨',
    'Birmingham': '버밍햄',
    'Mobile': '모빌',
    'Knoxville': '녹스빌',
    'Chattanooga': '채터누가',
    'Shreveport': '슈리브포트',
    'Augusta': '오거스타',
    'Savannah': '사바나',
    'Greenville': '그린빌',
    'Roanoke': '로어노크',
    'Norfolk': '노퍽',
    'Virginia Beach': '버지니아비치',
    'Arlington': '알링턴',
    'Alexandria': '알렉산드리아',
    'Annapolis': '아나폴리스',
    'Dover': '도버',
    'Wilmington': '윌밍턴',
    'Trenton': '트렌턴',
    'Princeton': '프린스턴',
    'Syracuse': '시러큐스',
    'Albany': '올버니',
    'Utica': '유티카',
    'Schenectady': '스케넥터디',
    'Ithaca': '이타카',
    'Burlington': '벌링턴',
    'Montpelier': '몬트필리어',
    'Concord': '콩코드',
    'Manchester': '맨체스터',
    'Bangor': '뱅거',
    'Harrisburg': '해리스버그',
    'Erie': '이리',
    'Allentown': '앨런타운',
    'Scranton': '스크랜턴',
    'Reading': '레딩',
    'Youngstown': '영스타운',
    'Akron': '애크런',
    'Toledo': '톨레도',
    'Dayton': '데이턴',
    'Fort Wayne': '포트웨인',
    'Evansville': '에번스빌',
    'South Bend': '사우스벤드',
    'Cedar Rapids': '시더래피즈',
    'Sioux City': '수시티',
    'Duluth': '덜루스',
    'Fargo': '파고',
    'Bismarck': '비스마크',
    'Sioux Falls': '수폴스',
    'Rapid City': '래피드시티',
    'Cheyenne': '샤이엔',
    'Casper': '캐스퍼',
    'Billings': '빌링스',
    'Missoula': '미줄라',
    'Helena': '헬레나',
    'Bozeman': '보즈먼',
    'Fayetteville': '페이엣빌',
    'Conway': '콘웨이',
    'Pasadena': '패서디나',
    'Riverside': '리버사이드',
    'Fairfield': '페어필드',
    'Daytona Beach': '데이토나비치',
    'Boca Raton': '보카레이턴',
    'Lakeland': '레이크랜드',
    'Gainesville': '게인즈빌',
    'Mount Vernon': '마운트버논',
    'Fayette': '페이엇',
    'Amherst': '앰허스트',
    'Northfield': '노스필드',
    'Marshall': '마셜',
    'Clinton': '클린턴',
    'Durham': '더럼',
    'Orangeburg': '오렌지버그',
    'Greensboro': '그린즈버러',
    'Ashland': '애슐랜드',
    'Lancaster': '랭커스터',
    'Normal': '노멀',
    'Florence': '플로렌스',
    'Tempe': '템피',
    'Arkadelphia': '아카델피아',
    'Fullerton': '풀러턴',
    'Santa Barbara': '산타바바라',
    'Colorado Springs': '콜로라도스프링스',
    'Boulder': '볼더',
    'New London': '뉴런던',
    'West Hartford': '웨스트하트퍼드',
    'Middletown': '미들타운',
    'Tallahassee': '탤러해시',
    'Miami Gardens': '마이애미가든스',
    'Fort Lauderdale': '포트로더데일',
    'Decatur': '디케이터',
    'Brunswick': '브런즈윅',
    'Marietta': '마리에타',
    'Macon': '메이컨',
    'Caldwell': '콜드웰',
    'Lewiston': '루이스턴',
    'River Forest': '리버포레스트',
    'Lisle': '라일',
    'Bloomington': '블루밍턴',
    'Lebanon': '레바논',
    'Hanover': '하노버',
    'Huntington': '헌팅턴',
    'Terre Haute': '테러호트',
    'Notre Dame': '노트르담',
    'Angola': '앙골라',
    'Dubuque': '듀뷰크',
    'Berea': '베리아',
    'Danville': '댄빌',
    'Williamsburg': '윌리엄즈버그',
    'Georgetown': '조지타운',
    'Bowling Green': '볼링그린',
    'Hammond': '해먼드',
    'Waterville': '워터빌',
    'Salisbury': '솔즈베리',
    'Wellesley': '웰즐리',
    'Waltham': '월섬',
    'Bridgewater': '브리지워터',
    'Easton': '이스턴',
    'Adrian': '에이드리언',
    'Kalamazoo': '칼라마주',
    'Saginaw': '새기노',
    'Flint': '플린트',
    'Dulce': '둘스',
    'Mankato': '맨케이토',
    'Saint Peter': '세인트피터',
    'Winona': '위노나',
    'Moorhead': '무어헤드',
    'Bemidji': '베미지',
    'Oxford': '옥스퍼드',
    'Hattiesburg': '해티즈버그',
    'Starkville': '스타크빌',
    'Saint Charles': '세인트찰스',
    'Warrensburg': '워렌스버그',
    'Rolla': '롤라',
    'Kirksville': '커크스빌',
    'Bozeman': '보즈먼',
    'Missoula': '미줄라',
    'Great Falls': '그레이트폴스',
    'Havre': '하브레',
    'Omaha': '오마하',
    'Kearney': '키어니',
    'Wayne': '웨인',
    'Chadron': '샤드론',
    'Reno': '리노',
    'Las Vegas': '라스베이거스',
    'Carson City': '카슨시티',
    'Keene': '킨',
    'Plymouth': '플리머스',
    'Camden': '캠든',
    'Glassboro': '글래스보로',
    'Mahwah': '마화',
    'Teaneck': '티넥',
    'West Long Branch': '웨스트롱브랜치',
    'Santa Fe': '산타페',
    'Albuquerque': '앨버커키',
    'Las Cruces': '라스크루세스',
    'Ithaca': '이타카',
    'Potsdam': '포츠담',
    'Oneonta': '오네온타',
    'Geneseo': '제네시오',
    'Oswego': '오스위고',
    'Plattsburgh': '플래츠버그',
    'Fredonia': '프레도니아',
    'Chapel Hill': '채플힐',
    'Raleigh': '롤리',
    'Greenville': '그린빌',
    'Boone': '분',
    'Cullowhee': '컬로위',
    'Pembroke': '펨브로크',
    'Bismarck': '비스마크',
    'Minot': '마이넛',
    'Grand Forks': '그랜드포크스',
    'Canton': '캔턴',
    'Oxford': '옥스퍼드',
    'Athens': '아테네',
    'Tulsa': '털사',
    'Stillwater': '스틸워터',
    'Edmond': '에드먼드',
    'Norman': '노먼',
    'Ada': '에이다',
    'Alva': '앨바',
    'Eugene': '유진',
    'Corvallis': '코발리스',
    'Monmouth': '먼머스',
    'Ashland': '애슐랜드',
    'La Grande': '라그란데',
    'State College': '스테이트칼리지',
    'Harrisburg': '해리스버그',
    'Wilkes-Barre': '윌크스배리',
    'York': '요크',
    'Kutztown': '쿠츠타운',
    'Mansfield': '맨스필드',
    'Kingston': '킹스턴',
    'Providence': '프로비던스',
    'Newport': '뉴포트',
    'Warwick': '워릭',
    'Charleston': '찰스턴',
    'Orangeburg': '오렌지버그',
    'Rock Hill': '록힐',
    'Greenwood': '그린우드',
    'Florence': '플로렌스',
    'Spartanburg': '스파탄버그',
    'Rapid City': '래피드시티',
    'Vermillion': '버밀리언',
    'Brookings': '브루킹스',
    'Knoxville': '녹스빌',
    'Chattanooga': '채터누가',
    'Murfreesboro': '머프리스보로',
    'Johnson City': '존슨시티',
    'Cookeville': '쿡빌',
    'Lubbock': '러벅',
    'Waco': '웨이코',
    'Denton': '덴턴',
    'San Marcos': '산마르코스',
    'Nacogdoches': '나코도치스',
    'Commerce': '커머스',
    'Stephenville': '스티븐빌',
    'Huntsville': '헌츠빌',
    'Provo': '프로보',
    'Logan': '로건',
    'Cedar City': '시더시티',
    'Burlington': '벌링턴',
    'Montpelier': '몬트필리어',
    'Castleton': '캐슬턴',
    'Lynchburg': '린치버그',
    'Blacksburg': '블랙스버그',
    'Harrisonburg': '해리슨버그',
    'Radford': '래드퍼드',
    'Farmville': '팜빌',
    'Petersburg': '피터스버그',
    'Bellingham': '벨링햄',
    'Cheney': '체니',
    'Ellensburg': '엘렌즈버그',
    'Pullman': '풀먼',
    'Morgantown': '모건타운',
    'Huntington': '헌팅턴',
    'Fairmont': '페어몬트',
    'Athens': '아테네',
    'Madison': '매디슨',
    'Milwaukee': '밀워키',
    'Oshkosh': '오쉬코쉬',
    'Stevens Point': '스티븐스포인트',
    'Whitewater': '화이트워터',
    'Eau Claire': '오클레어',
    'Laramie': '라라미',
    'Cheyenne': '샤이엔'
  };
  
  // If no manual translation exists, use automated romanization
  return translations[city] || romanizeCityName(city);
};

// Automated Korean romanization for city names
const romanizeCityName = (city: string): string => {
  // Common phonetic patterns for English to Korean romanization
  const replacements: Array<[RegExp, string]> = [
    // Vowels
    [/ee/gi, '이'],
    [/oo/gi, '우'],
    [/ai/gi, '에이'],
    [/ay/gi, '에이'],
    [/ea/gi, '이'],
    [/au/gi, '오'],
    [/aw/gi, '오'],
    [/ou/gi, '아우'],
    [/ow/gi, '오'],
    [/oi/gi, '오이'],
    [/oy/gi, '오이'],
    
    // Consonant combinations
    [/ch/gi, '치'],
    [/sh/gi, '시'],
    [/th/gi, '스'],
    [/ph/gi, '프'],
    [/gh/gi, ''],
    [/ck/gi, '크'],
    [/ng/gi, 'ng'],
    
    // Common endings
    [/ville$/gi, '빌'],
    [/town$/gi, '타운'],
    [/burg$/gi, '버그'],
    [/field$/gi, '필드'],
    [/ford$/gi, '퍼드'],
    [/port$/gi, '포트'],
    [/land$/gi, '랜드'],
    [/wood$/gi, '우드'],
    [/dale$/gi, '데일'],
    [/mont$/gi, '몬트'],
    [/view$/gi, '뷰'],
    [/ton$/gi, '턴'],
    [/ington$/gi, '잉턴'],
    [/ington/gi, '잉턴'],
    
    // Individual consonants (must come after combinations)
    [/b/gi, '브'],
    [/c(?=[aou])/gi, '크'],
    [/c(?=[ei])/gi, '스'],
    [/d/gi, '드'],
    [/f/gi, '프'],
    [/g/gi, '그'],
    [/h/gi, '하'],
    [/j/gi, '지'],
    [/k/gi, '크'],
    [/l/gi, '르'],
    [/m/gi, '므'],
    [/n/gi, '느'],
    [/p/gi, '프'],
    [/q/gi, '크'],
    [/r/gi, '르'],
    [/s/gi, '스'],
    [/t/gi, '트'],
    [/v/gi, '브'],
    [/w/gi, '워'],
    [/x/gi, '크스'],
    [/y/gi, '이'],
    [/z/gi, '즈'],
    
    // Individual vowels (must come last)
    [/a/gi, '아'],
    [/e/gi, '에'],
    [/i/gi, '이'],
    [/o/gi, '오'],
    [/u/gi, '우']
  ];
  
  let result = city;
  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement);
  }
  
  // Clean up multiple consonants
  result = result.replace(/([느므르])\1+/g, '$1');
  
  // Remove any remaining non-Korean characters except spaces
  result = result.replace(/[^가-힣\s]/g, '');
  
  // Clean up extra spaces
  result = result.replace(/\s+/g, ' ').trim();
  
  return result || city; // Return original if romanization fails
};

const formatLocationDisplay = (city?: string, state?: string, language?: 'ko' | 'en'): string => {
  if (!city || !state) {
    return language === 'ko' ? '미국' : 'United States';
  }
  
  if (language === 'ko') {
    // Format: "State명 City명" (e.g., "캘리포니아주 클레어몬트")
    return `${getStateTranslation(state)} ${getCityTranslation(city)}`;
  }
  
  return `${city}, ${getStateAbbreviation(state)}`;
};

const formatSchoolSize = (sizeCategory?: string, carnegieSize?: string, language?: 'ko' | 'en'): string => {
  if (!sizeCategory) return language === 'ko' ? '정보 없음' : 'N/A';
  
  if (language === 'ko') {
    if (sizeCategory === '20,000 and above') return '대형 (20,000명 이상)';
    if (sizeCategory === '10,000 - 19,999') return '대형 (10,000-19,999명)';
    if (sizeCategory === '5,000 - 9,999') return '중형 (5,000-9,999명)';
    if (sizeCategory === '3,000 - 4,999') return '중형 (3,000-4,999명)';
    if (sizeCategory === '1,000 - 2,999') return '소형 (1,000-2,999명)';
    if (sizeCategory.includes('Under')) return '소형 (1,000명 미만)';
  }
  
  return `${carnegieSize || ''} (${sizeCategory})`.trim();
};

const translateUrbanization = (urbanization?: string, language?: 'ko' | 'en'): string => {
  if (!urbanization) return language === 'ko' ? '정보 없음' : 'N/A';
  
  // Translate urbanization categories
  if (language === 'ko') {
    if (urbanization.includes('City: Large')) return '대도시';
    if (urbanization.includes('City: Midsize')) return '중규모 도시';
    if (urbanization.includes('City: Small')) return '소도시';
    if (urbanization.includes('Suburb: Large')) return '대도시 교외';
    if (urbanization.includes('Suburb: Midsize')) return '중규모 도시 교외';
    if (urbanization.includes('Suburb: Small')) return '소도시 교외';
    if (urbanization.includes('Town: Fringe')) return '도시 인근 타운';
    if (urbanization.includes('Town: Distant')) return '원거리 타운';
    if (urbanization.includes('Town: Remote')) return '외딴 타운';
    if (urbanization.includes('Rural')) return '농촌 지역';
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
  const location = useLocation();
  const navigate = useNavigate();
  const university = getUniversityData(id || '1');
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Determine where to navigate back based on where user came from
  const backLink = (location.state as { from?: string })?.from || '/universities';

  // Handle adding university to comparison
  const handleCompare = () => {
    if (university) {
      navigate(`/compare?add=${university.id}`);
    }
  };

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
                data-testid="button-compare"
                onClick={handleCompare}
                style={{ marginTop: '16px' }}
              >
                <Plus className="h-4 w-4" />
                {t('university.compare')}
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
                data-testid="button-add-comparison"
                onClick={() => {
                  // TODO: Implement comparison list functionality
                  console.log('Add to comparison:', university.name);
                }}
              >
                <Plus className="h-5 w-5" />
                {language === 'ko' ? '비교 목록에 추가' : 'Add to Comparison List'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversityProfilePage;
