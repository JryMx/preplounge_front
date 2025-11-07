export const universityLocations: Record<string, { en: string; ko: string }> = {
  // Ivy League and Top Universities
  "Harvard University": { en: "Cambridge, Massachusetts", ko: "케임브리지, 메사추세츠" },
  "Yale University": { en: "New Haven, Connecticut", ko: "뉴헤이븐, 코네티컷" },
  "Princeton University": { en: "Princeton, New Jersey", ko: "프린스턴, 뉴저지" },
  "Columbia University": { en: "New York City, New York", ko: "뉴욕시, 뉴욕" },
  "University of Pennsylvania": { en: "Philadelphia, Pennsylvania", ko: "필라델피아, 펜실베이니아" },
  "Cornell University": { en: "Ithaca, New York", ko: "이타카, 뉴욕" },
  "Brown University": { en: "Providence, Rhode Island", ko: "프로비던스, 로드아일랜드" },
  "Dartmouth College": { en: "Hanover, New Hampshire", ko: "하노버, 뉴햄프셔" },
  
  // Stanford and MIT
  "Stanford University": { en: "Stanford, California", ko: "스탠퍼드, 캘리포니아" },
  "Massachusetts Institute of Technology": { en: "Cambridge, Massachusetts", ko: "케임브리지, 메사추세츠" },
  
  // UC System
  "University of California-Berkeley": { en: "Berkeley, California", ko: "버클리, 캘리포니아" },
  "University of California-Los Angeles": { en: "Los Angeles, California", ko: "로스앤젤레스, 캘리포니아" },
  "University of California-San Diego": { en: "San Diego, California", ko: "샌디에이고, 캘리포니아" },
  "University of California-Irvine": { en: "Irvine, California", ko: "어바인, 캘리포니아" },
  "University of California-Davis": { en: "Davis, California", ko: "데이비스, 캘리포니아" },
  "University of California-Santa Barbara": { en: "Santa Barbara, California", ko: "산타바바라, 캘리포니아" },
  
  // Other Top Universities
  "Duke University": { en: "Durham, North Carolina", ko: "더럼, 노스캐롤라이나" },
  "Northwestern University": { en: "Evanston, Illinois", ko: "에번스턴, 일리노이" },
  "University of Chicago": { en: "Chicago, Illinois", ko: "시카고, 일리노이" },
  "Johns Hopkins University": { en: "Baltimore, Maryland", ko: "볼티모어, 메릴랜드" },
  "California Institute of Technology": { en: "Pasadena, California", ko: "패서디나, 캘리포니아" },
  "Carnegie Mellon University": { en: "Pittsburgh, Pennsylvania", ko: "피츠버그, 펜실베이니아" },
  "University of Michigan-Ann Arbor": { en: "Ann Arbor, Michigan", ko: "앤아버, 미시간" },
  "New York University": { en: "New York City, New York", ko: "뉴욕시, 뉴욕" },
  "University of Southern California": { en: "Los Angeles, California", ko: "로스앤젤레스, 캘리포니아" },
  "University of Virginia-Main Campus": { en: "Charlottesville, Virginia", ko: "샬러츠빌, 버지니아" },
  "Emory University": { en: "Atlanta, Georgia", ko: "애틀랜타, 조지아" },
  "Georgetown University": { en: "Washington, District of Columbia", ko: "워싱턴, D.C." },
  "University of North Carolina at Chapel Hill": { en: "Chapel Hill, North Carolina", ko: "채플힐, 노스캐롤라이나" },
  "Wake Forest University": { en: "Winston-Salem, North Carolina", ko: "윈스턴세일럼, 노스캐롤라이나" },
  "University of Florida": { en: "Gainesville, Florida", ko: "게인즈빌, 플로리다" },
  "Boston College": { en: "Chestnut Hill, Massachusetts", ko: "체스넛힐, 메사추세츠" },
  "Boston University": { en: "Boston, Massachusetts", ko: "보스턴, 메사추세츠" },
  "University of Texas at Austin": { en: "Austin, Texas", ko: "오스틴, 텍사스" },
  "University of Washington-Seattle Campus": { en: "Seattle, Washington", ko: "시애틀, 워싱턴" },
  "Georgia Institute of Technology-Main Campus": { en: "Atlanta, Georgia", ko: "애틀랜타, 조지아" },
  "University of Illinois Urbana-Champaign": { en: "Champaign, Illinois", ko: "샴페인, 일리노이" },
  "University of Wisconsin-Madison": { en: "Madison, Wisconsin", ko: "매디슨, 위스콘신" },
  "Vanderbilt University": { en: "Nashville, Tennessee", ko: "내슈빌, 테네시" },
  "Rice University": { en: "Houston, Texas", ko: "휴스턴, 텍사스" },
  "Washington University in St Louis": { en: "St. Louis, Missouri", ko: "세인트루이스, 미주리" },
  "Tufts University": { en: "Medford, Massachusetts", ko: "메드퍼드, 메사추세츠" },
  "Northeastern University": { en: "Boston, Massachusetts", ko: "보스턴, 메사추세츠" },
};

export function getUniversityLocation(englishName: string, language: 'en' | 'ko'): string {
  const location = universityLocations[englishName];
  if (location) {
    return language === 'ko' ? location.ko : location.en;
  }
  return language === 'ko' ? '미국' : 'United States';
}
