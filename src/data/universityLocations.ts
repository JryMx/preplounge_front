export const universityLocations: Record<string, { en: string; ko: string }> = {
  // Ivy League and Top Universities
  "Harvard University": { en: "Massachusetts, Cambridge", ko: "메사추세츠주 케임브리지" },
  "Yale University": { en: "Connecticut, New Haven", ko: "코네티컷주 뉴헤이븐" },
  "Princeton University": { en: "New Jersey, Princeton", ko: "뉴저지주 프린스턴" },
  "Columbia University": { en: "New York, New York City", ko: "뉴욕주 뉴욕시" },
  "University of Pennsylvania": { en: "Pennsylvania, Philadelphia", ko: "펜실베이니아주 필라델피아" },
  "Cornell University": { en: "New York, Ithaca", ko: "뉴욕주 이타카" },
  "Brown University": { en: "Rhode Island, Providence", ko: "로드아일랜드주 프로비던스" },
  "Dartmouth College": { en: "New Hampshire, Hanover", ko: "뉴햄프셔주 하노버" },
  
  // Stanford and MIT
  "Stanford University": { en: "California, Stanford", ko: "캘리포니아주 스탠퍼드" },
  "Massachusetts Institute of Technology": { en: "Massachusetts, Cambridge", ko: "메사추세츠주 케임브리지" },
  
  // UC System
  "University of California-Berkeley": { en: "California, Berkeley", ko: "캘리포니아주 버클리" },
  "University of California-Los Angeles": { en: "California, Los Angeles", ko: "캘리포니아주 로스앤젤레스" },
  "University of California-San Diego": { en: "California, San Diego", ko: "캘리포니아주 샌디에이고" },
  "University of California-Irvine": { en: "California, Irvine", ko: "캘리포니아주 어바인" },
  "University of California-Davis": { en: "California, Davis", ko: "캘리포니아주 데이비스" },
  "University of California-Santa Barbara": { en: "California, Santa Barbara", ko: "캘리포니아주 산타바바라" },
  
  // Other Top Universities
  "Duke University": { en: "North Carolina, Durham", ko: "노스캐롤라이나주 더럼" },
  "Northwestern University": { en: "Illinois, Evanston", ko: "일리노이주 에번스턴" },
  "University of Chicago": { en: "Illinois, Chicago", ko: "일리노이주 시카고" },
  "Johns Hopkins University": { en: "Maryland, Baltimore", ko: "메릴랜드주 볼티모어" },
  "California Institute of Technology": { en: "California, Pasadena", ko: "캘리포니아주 패서디나" },
  "Carnegie Mellon University": { en: "Pennsylvania, Pittsburgh", ko: "펜실베이니아주 피츠버그" },
  "University of Michigan-Ann Arbor": { en: "Michigan, Ann Arbor", ko: "미시간주 앤아버" },
  "New York University": { en: "New York, New York City", ko: "뉴욕주 뉴욕시" },
  "University of Southern California": { en: "California, Los Angeles", ko: "캘리포니아주 로스앤젤레스" },
  "University of Virginia-Main Campus": { en: "Virginia, Charlottesville", ko: "버지니아주 샬러츠빌" },
  "Emory University": { en: "Georgia, Atlanta", ko: "조지아주 애틀랜타" },
  "Georgetown University": { en: "District of Columbia, Washington", ko: "워싱턴 D.C." },
  "University of North Carolina at Chapel Hill": { en: "North Carolina, Chapel Hill", ko: "노스캐롤라이나주 채플힐" },
  "Wake Forest University": { en: "North Carolina, Winston-Salem", ko: "노스캐롤라이나주 윈스턴세일럼" },
  "University of Florida": { en: "Florida, Gainesville", ko: "플로리다주 게인즈빌" },
  "Boston College": { en: "Massachusetts, Chestnut Hill", ko: "메사추세츠주 체스넛힐" },
  "Boston University": { en: "Massachusetts, Boston", ko: "메사추세츠주 보스턴" },
  "University of Texas at Austin": { en: "Texas, Austin", ko: "텍사스주 오스틴" },
  "University of Washington-Seattle Campus": { en: "Washington, Seattle", ko: "워싱턴주 시애틀" },
  "Georgia Institute of Technology-Main Campus": { en: "Georgia, Atlanta", ko: "조지아주 애틀랜타" },
  "University of Illinois Urbana-Champaign": { en: "Illinois, Champaign", ko: "일리노이주 샴페인" },
  "University of Wisconsin-Madison": { en: "Wisconsin, Madison", ko: "위스콘신주 매디슨" },
  "Vanderbilt University": { en: "Tennessee, Nashville", ko: "테네시주 내슈빌" },
  "Rice University": { en: "Texas, Houston", ko: "텍사스주 휴스턴" },
  "Washington University in St Louis": { en: "Missouri, St. Louis", ko: "미주리주 세인트루이스" },
  "Tufts University": { en: "Massachusetts, Medford", ko: "메사추세츠주 메드퍼드" },
  "Northeastern University": { en: "Massachusetts, Boston", ko: "메사추세츠주 보스턴" },
};

export function getUniversityLocation(englishName: string, language: 'en' | 'ko'): string {
  const location = universityLocations[englishName];
  if (location) {
    return language === 'ko' ? location.ko : location.en;
  }
  return language === 'ko' ? '미국' : 'United States';
}
