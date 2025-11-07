import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Users, DollarSign, BookOpen, Filter, Grid2x2 as Grid, List } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { DualRangeSlider } from '../components/DualRangeSlider';
import universitiesData from '../data/universities.json';
import './universities-page.css';

interface University {
  id: string;
  name: string;
  englishName: string;
  location: string;
  city?: string;
  state?: string;
  tuition: number;
  acceptanceRate: number;
  satRange: string;
  actRange: string;
  image: string;
  type: string;
  size: string;
  estimatedGPA?: number | null;
}

// Load real university data from JSON file
const universities: University[] = universitiesData as University[];

// Helper function to translate state names to Korean
const getStateTranslation = (state: string): string => {
  const translations: Record<string, string> = {
    'Alabama': '앨라배마주', 'Alaska': '알래스카주', 'Arizona': '애리조나주', 'Arkansas': '아칸소주',
    'California': '캘리포니아주', 'Colorado': '콜로라도주', 'Connecticut': '코네티컷주',
    'Delaware': '델라웨어주', 'Florida': '플로리다주', 'Georgia': '조지아주', 'Hawaii': '하와이주',
    'Idaho': '아이다호주', 'Illinois': '일리노이주', 'Indiana': '인디애나주', 'Iowa': '아이오와주',
    'Kansas': '캔자스주', 'Kentucky': '켄터키주', 'Louisiana': '루이지애나주', 'Maine': '메인주',
    'Maryland': '메릴랜드주', 'Massachusetts': '매사추세츠주', 'Michigan': '미시간주',
    'Minnesota': '미네소타주', 'Mississippi': '미시시피주', 'Missouri': '미주리주', 'Montana': '몬태나주',
    'Nebraska': '네브래스카주', 'Nevada': '네바다주', 'New Hampshire': '뉴햄프셔주',
    'New Jersey': '뉴저지주', 'New Mexico': '뉴멕시코주', 'New York': '뉴욕주',
    'North Carolina': '노스캐롤라이나주', 'North Dakota': '노스다코타주', 'Ohio': '오하이오주',
    'Oklahoma': '오클라호마주', 'Oregon': '오리건주', 'Pennsylvania': '펜실베이니아주',
    'Rhode Island': '로드아일랜드주', 'South Carolina': '사우스캐롤라이나주',
    'South Dakota': '사우스다코타주', 'Tennessee': '테네시주', 'Texas': '텍사스주', 'Utah': '유타주',
    'Vermont': '버몬트주', 'Virginia': '버지니아주', 'Washington': '워싱턴주',
    'West Virginia': '웨스트버지니아주', 'Wisconsin': '위스콘신주', 'Wyoming': '와이오밍주',
    'District of Columbia': '워싱턴 D.C.', 'Puerto Rico': '푸에르토리코'
  };
  return translations[state] || state;
};

// Helper function to translate city names to Korean (600+ cities)
const getCityTranslation = (city: string): string => {
  const translations: Record<string, string> = {
    'New York': '뉴욕', 'Chicago': '시카고', 'Boston': '보스턴', 'Baltimore': '볼티모어',
    'Los Angeles': '로스앤젤레스', 'Washington': '워싱턴', 'Springfield': '스프링필드',
    'Houston': '휴스턴', 'Philadelphia': '필라델피아', 'Atlanta': '애틀랜타',
    'Pittsburgh': '피츠버그', 'New Orleans': '뉴올리언스', 'Portland': '포틀랜드',
    'Saint Paul': '세인트폴', 'Rochester': '로체스터', 'Madison': '매디슨',
    'Providence': '프로비던스', 'Nashville': '내슈빌', 'Milwaukee': '밀워키',
    'Denver': '덴버', 'Columbus': '컬럼버스', 'Cleveland': '클리블랜드',
    'Charleston': '찰스턴', 'Worcester': '우스터', 'Columbia': '컬럼비아',
    'Saint Louis': '세인트루이스', 'Buffalo': '버팔로', 'Brooklyn': '브루클린',
    'San Antonio': '샌안토니오', 'Jacksonville': '잭슨빌', 'San Diego': '샌디에이고',
    'Irvine': '어바인', 'Claremont': '클레어몬트', 'Athens': '아테네',
    'Richmond': '리치먼드', 'Louisville': '루이빌', 'Lexington': '렉싱턴',
    'Cambridge': '케임브리지', 'Salem': '세일럼', 'Grand Rapids': '그랜드래피즈',
    'Kansas City': '캔자스시티', 'Canton': '캔턴', 'Omaha': '오마하',
    'Bronx': '브롱크스', 'Charlotte': '샬럿', 'Dallas': '댈러스',
    'Spartanburg': '스파탄버그', 'Huntsville': '헌츠빌', 'Montgomery': '몽고메리',
    'Troy': '트로이', 'Fayetteville': '페이엣빌', 'Conway': '콘웨이',
    'Pasadena': '패서디나', 'Riverside': '리버사이드', 'San Francisco': '샌프란시스코',
    'Fairfield': '페어필드', 'New Haven': '뉴헤이븐', 'Newark': '뉴어크',
    'Wilmington': '윌밍턴', 'Daytona Beach': '데이토나비치', 'Boca Raton': '보카레이턴',
    'Lakeland': '레이크랜드', 'Gainesville': '게인즈빌', 'Mount Vernon': '마운트버논',
    'Honolulu': '호놀룰루', 'Greenville': '그린빌', 'Indianapolis': '인디애나폴리스',
    'Fort Wayne': '포트웨인', 'Fayette': '페이엇', 'Wichita': '위치타',
    'Baton Rouge': '배턴루지', 'Amherst': '앰허스트', 'Detroit': '디트로이트',
    'Minneapolis': '미니애폴리스', 'Northfield': '노스필드', 'Marshall': '마셜',
    'Jackson': '잭슨', 'Clinton': '클린턴', 'Durham': '더럼',
    'Orangeburg': '오렌지버그', 'Syracuse': '시러큐스', 'Greensboro': '그린즈버러',
    'Ashland': '애슐랜드', 'Cincinnati': '신시내티', 'Reading': '레딩',
    'Lancaster': '랭커스터', 'Erie': '이리', 'Sioux Falls': '수폴스',
    'Memphis': '멤피스', 'Abilene': '애빌린', 'Austin': '오스틴',
    'Fort Worth': '포트워스', 'Virginia Beach': '버지니아비치', 'Tacoma': '타코마',
    'Seattle': '시애틀', 'Normal': '노멀', 'Birmingham': '버밍햄',
    'Mobile': '모빌', 'Florence': '플로렌스', 'Tempe': '템피',
    'Phoenix': '피닉스', 'Arkadelphia': '아카델피아', 'Fresno': '프레즈노',
    'Fullerton': '풀러턴', 'Santa Barbara': '산타바바라', 'Colorado Springs': '콜로라도스프링스',
    'Boulder': '볼더', 'New London': '뉴런던', 'West Hartford': '웨스트하트퍼드',
    'Hartford': '하트퍼드', 'Middletown': '미들타운', 'Miami': '마이애미',
    'Tallahassee': '탤러해시', 'Miami Gardens': '마이애미가든스', 'Fort Lauderdale': '포트로더데일',
    'Tampa': '탬파', 'Decatur': '디케이터', 'Brunswick': '브런즈윅',
    'Marietta': '마리에타', 'Macon': '메이컨', 'Caldwell': '콜드웰',
    'Lewiston': '루이스턴', 'River Forest': '리버포레스트', 'Lisle': '라일',
    'Bloomington': '블루밍턴', 'Lebanon': '레바논', 'Evansville': '에번스빌',
    'Hanover': '하노버', 'Huntington': '헌팅턴', 'Terre Haute': '테러호트',
    'Notre Dame': '노트르담', 'Angola': '앙골라', 'Cedar Rapids': '시더래피즈',
    'Des Moines': '디모인', 'Dubuque': '듀뷰크', 'Berea': '베리아',
    'Danville': '댄빌', 'Williamsburg': '윌리엄즈버그', 'Georgetown': '조지타운',
    'Bowling Green': '볼링그린', 'Alexandria': '알렉산드리아', 'Hammond': '해먼드',
    'Waterville': '워터빌', 'Salisbury': '솔즈베리', 'Wellesley': '웰즐리',
    'Waltham': '월섬', 'Bridgewater': '브리지워터', 'Easton': '이스턴',
    'Adrian': '에이드리언', 'Grinnell': '그리넬', 'Oberlin': '오벌린',
    'Middlebury': '미들버리', 'Kalamazoo': '칼라마주', 'Saginaw': '새기노',
    'Flint': '플린트', 'Dulce': '둘스', 'Mankato': '맨케이토',
    'Saint Peter': '세인트피터', 'Winona': '위노나', 'Moorhead': '무어헤드',
    'Bemidji': '버미지', 'Oxford': '옥스퍼드', 'Hattiesburg': '해티즈버그',
    'Starkville': '스타크빌', 'Saint Charles': '세인트찰스', 'Warrensburg': '워렌스버그',
    'Rolla': '롤라', 'Kirksville': '커크스빌', 'Bozeman': '보즈먼',
    'Missoula': '미줄라', 'Great Falls': '그레이트폴스', 'Havre': '하브르',
    'Kearney': '키어니', 'Wayne': '웨인', 'Chadron': '샤드론',
    'Reno': '리노', 'Las Vegas': '라스베이거스', 'Carson City': '카슨시티',
    'Keene': '킨', 'Plymouth': '플리머스', 'Camden': '캠든',
    'Glassboro': '글래스보로', 'Mahwah': '마화', 'Teaneck': '티넥',
    'West Long Branch': '웨스트롱브랜치', 'Santa Fe': '산타페', 'Albuquerque': '앨버커키',
    'Las Cruces': '라스크루세스', 'Ithaca': '이타카', 'Potsdam': '포츠담',
    'Oneonta': '오네온타', 'Geneseo': '제네시오', 'Oswego': '오스위고',
    'Plattsburgh': '플래츠버그', 'Fredonia': '프레도니아', 'Chapel Hill': '채플힐',
    'Raleigh': '롤리', 'Boone': '분', 'Cullowhee': '컬로위',
    'Pembroke': '펨브로크', 'Bismarck': '비스마크', 'Minot': '마이낫',
    'Grand Forks': '그랜드포크스', 'Tulsa': '털사', 'Stillwater': '스틸워터',
    'Edmond': '에드먼드', 'Norman': '노먼', 'Ada': '에이다',
    'Alva': '앨바', 'Eugene': '유진', 'Corvallis': '코발리스',
    'Monmouth': '먼머스', 'La Grande': '라그란데', 'State College': '스테이트칼리지',
    'Harrisburg': '해리스버그', 'Wilkes-Barre': '윌크스배리', 'York': '요크',
    'Kutztown': '쿠츠타운', 'Mansfield': '맨스필드', 'Kingston': '킹스턴',
    'Newport': '뉴포트', 'Warwick': '워릭', 'Rock Hill': '록힐',
    'Greenwood': '그린우드', 'Rapid City': '래피드시티', 'Vermillion': '버밀리언',
    'Brookings': '브루킹스', 'Knoxville': '녹스빌', 'Chattanooga': '채터누가',
    'Murfreesboro': '머프리즈버러', 'Johnson City': '존슨시티', 'Cookeville': '쿡빌',
    'Lubbock': '러벅', 'Waco': '웨이코', 'Denton': '덴턴',
    'San Marcos': '산마르코스', 'Nacogdoches': '나코도치스', 'Commerce': '커머스',
    'Stephenville': '스티븐빌', 'Provo': '프로보', 'Logan': '로건',
    'Cedar City': '시더시티', 'Burlington': '벌링턴', 'Montpelier': '몬트필리어',
    'Castleton': '캐슬턴', 'Lynchburg': '린치버그', 'Blacksburg': '블랙스버그',
    'Harrisonburg': '해리슨버그', 'Radford': '래드퍼드', 'Farmville': '팜빌',
    'Petersburg': '피터스버그', 'Bellingham': '벨링햄', 'Cheney': '체니',
    'Ellensburg': '엘렌즈버그', 'Pullman': '풀먼', 'Morgantown': '모건타운',
    'Fairmont': '페어몬트', 'Oshkosh': '오시코시', 'Stevens Point': '스티븐스포인트',
    'Whitewater': '화이트워터', 'Eau Claire': '오클레어', 'Laramie': '라라미',
    'Cheyenne': '샤이엔', 'Collegeville': '칼리지빌', 'Rochester Hills': '로체스터힐스',
    'Houghton': '호턴', 'Maryville': '메리빌', 'Lawrenceville': '로렌스빌',
    'Alfred': '앨프레드', 'Queens': '퀸즈', 'Purchase': '퍼체스',
    'Poughkeepsie': '포킵시', 'Old Westbury': '올드웨스트버리', 'Winston-Salem': '윈스턴세일럼',
    'Tiffin': '티핀', 'Bethlehem': '베들레헴', 'University Park': '유니버시티파크',
    'Greensburg': '그린스버그', 'Bristol': '브리스톨', 'Henderson': '헨더슨',
    'Kenosha': '케노샤', 'La Crosse': '라크로스', 'Addison': '애디슨',
    'Tuscaloosa': '터스컬루사', 'Auburn': '오번', 'Livingston': '리빙스턴',
    'Montevallo': '몬테발로', 'Tuskegee': '터스키기', 'Juneau': '주노',
    'Prescott': '프레스콧', 'Flagstaff': '플래그스태프', 'Glendale': '글렌데일',
    'Pine Bluff': '파인블러프', 'Jonesboro': '존즈버러', 'Russellville': '러셀빌',
    'Searcy': '서시', 'Siloam Springs': '사일로엄스프링스', 'Magnolia': '매그놀리아',
    'Fort Smith': '포트스미스', 'Azusa': '아주사', 'La Mirada': '라미라다',
    'Thousand Oaks': '사우전드오크스', 'San Luis Obispo': '산루이스오비스포', 'Bakersfield': '베이커즈필드',
    'Turlock': '털록', 'San Bernardino': '샌버너디노', 'Pomona': '포모나',
    'Chico': '치코', 'Carson': '카슨', 'Hayward': '헤이워드',
    'Northridge': '노스리지', 'Berkeley': '버클리', 'Davis': '데이비스',
    'La Jolla': '라호야', 'Santa Cruz': '산타크루즈', 'Valencia': '발렌시아',
    'Orange': '오렌지', 'San Rafael': '산라파엘', 'Arcata': '아카타',
    'La Verne': '라번', 'Santa Clarita': '산타클래리타', 'Stockton': '스톡턴',
    'Malibu': '말리부', 'San Jose': '산호세', 'Cupertino': '쿠퍼티노',
    'Moraga': '모라가', 'Angwin': '앵윈', 'Atherton': '애서턴',
    'Redlands': '레들랜즈', 'Whittier': '휘티어', 'Los Gatos': '로스가토스',
    'Rohnert Park': '로너트파크', 'Santa Clara': '산타클래라', 'San Anselmo': '산안셀모',
    'Rancho Cucamonga': '랜초쿠캉가', 'Fort Collins': '포트콜린스', 'Durango': '듀랭고',
    'Pueblo': '푸에블로', 'Grand Junction': '그랜드정션', 'Greeley': '그릴리',
    'Farmington': '파밍턴', 'Storrs': '스토스', 'Coral Gables': '코럴게이블스',
    'Orlando': '올랜도', 'Saint Petersburg': '세인트피터즈버그', 'Melbourne': '멜버른',
    'Pensacola': '펜서콜라', 'Bunnell': '버넬', 'Savannah': '사바나',
    'Carrollton': '캐럴턴', 'Statesboro': '스테이츠버러', 'Milledgeville': '밀리지빌',
    'Americus': '아메리커스', 'Rome': '로마', 'Valdosta': '밸도스타',
    'Nampa': '남파', 'Pocatello': '포카텔로', 'Rexburg': '렉스버그',
    'Champaign': '샴페인', 'Abington': '애빙턴', 'Aiken': '에이컨', 'Alcorn State': '알콘스테이트',
    'Alma': '앨마', 'Altoona': '알투나', 'Anderson': '앤더슨', 'Ann Arbor': '앤아버',
    'Annandale-On-Hudson': '애넌데일온허드슨', 'Annville': '앤빌', 'Aston': '애스턴', 'Atchison': '애치슨',
    'Aurora': '오로라', 'Ave Maria': '아베마리아', 'Baldwin City': '볼드윈시티', 'Barnesville': '반즈빌',
    'Beckley': '베클리', 'Belton': '벨턴', 'Bend': '벤드', 'Berrien Springs': '베리언스프링스',
    'Beverly': '베벌리', 'Bloomsburg': '블룸스버그', 'Bluefield': '블루필드', 'Bolivar': '볼리바',
    'Bothell': '보델', 'Bowie': '보위', 'Bradford': '브래드퍼드', 'Bryn Mawr': '브린마',
    'Buies Creek': '뷰이스크릭', 'Buzzards Bay': '버저즈베이', 'California': '캘리포니아', 'Camarillo': '카마릴로',
    'Campbellsville': '캠벨스빌', 'Carlisle': '칼라일', 'Cedar Falls': '시더폴스', 'Cedarville': '시더빌',
    'Center Valley': '센터밸리', 'Chambersburg': '챔버스버그', 'Charlottesville': '샬러츠빌', 'Chester': '체스터',
    'Chesterfield': '체스터필드', 'Chickasha': '치카샤', 'Chicopee': '치코피', 'Circleville': '서클빌',
    'Clarksville': '클락스빌', 'Clemson': '클렘슨', 'Cobleskill': '코블스킬', 'Colchester': '콜체스터',
    'College Park': '칼리지파크', 'College Station': '칼리지스테이션', 'Collegedale': '칼리지데일', 'Costa Mesa': '코스타메사',
    'Cresson': '크레슨', 'Crestview Hills': '크레스트뷰힐스', 'Dahlonega': '대런가', 'Danbury': '댄버리',
    'Davenport': '대븐포트', 'Davidson': '데이비드슨', 'DeLand': '디랜드', 'Dearborn': '디어본',
    'Delhi': '델리', 'Demorest': '데모레스트', 'Dobbs Ferry': '답스페리', 'Doylestown': '도일스타운',
    'Draper': '드레이퍼', 'East Greenwich': '이스트그리니치', 'East Stroudsburg': '이스트스트라우즈버그', 'Edinburg': '에든버그',
    'Emmitsburg': '에미츠버그', 'Emory': '에모리', 'Fairfax': '페어팩스', 'Forest City': '포레스트시티',
    'Forest Grove': '포레스트그로브', 'Forest Hills': '포레스트힐스', 'Fort Kent': '포트켄트', 'Fort Myers': '포트마이어스',
    'Fort Valley': '포트밸리', 'Gaffney': '개프니', 'Gary': '개리', 'Geneva': '제네바',
    'Gettysburg': '게티즈버그', 'Glenside': '글렌사이드', 'Golden': '골든', 'Grambling': '그램블링',
    'Granville': '그랜빌', 'Greencastle': '그린캐슬', 'Greeneville': '그린빌', 'Gunnison': '거니슨',
    'Gwynedd Valley': '귀네드밸리', 'Hackettstown': '해킷츠타운', 'Hamden': '햄든', 'Hampton': '햄튼',
    'Harrogate': '해러게이트', 'Hartsville': '하츠빌', 'Haverford': '해버퍼드', 'Henniker': '헤니커',
    'Hiram': '하이램', 'Hoboken': '호보컨', 'Howell': '하웰', 'Huntingdon': '헌팅던',
    'Hyde Park': '하이드파크', 'Immaculata': '이머큘레이타', 'Indiana': '인디애나', 'Indianola': '인디애놀라',
    'Institute': '인스티튜트', 'Irving': '어빙', 'Jamaica': '자메이카', 'Janesville': '제인스빌',
    'Jefferson City': '제퍼슨시티', 'Joliet': '졸리엣', 'Kapolei': '카폴레이', 'Kerrville': '커빌',
    'Keuka Park': '큐카파크', 'Killeen': '킬린', 'Kirkland': '커클랜드', 'Lacey': '레이시',
    'Laie': '라이에', 'Lake Charles': '레이크찰스', 'Lake Forest': '레이크포레스트', 'Langhorne': '랭혼',
    'Laredo': '라레도', 'Latrobe': '라트로브', 'Laurel': '로렐', 'Lawrence': '로렌스',
    'Leavenworth': '레븐워스', 'Lewisburg': '루이스버그', 'Lincoln University': '링컨유니버시티', 'Livonia': '리보니아',
    'Lodi': '로디', 'Longmeadow': '롱메도우', 'Longview': '롱뷰', 'Lookout Mountain': '룩아웃마운틴',
    'Loretto': '로레토', 'Loudonville': '라우던빌', 'Mars Hill': '마스힐', 'Martin': '마틴',
    'McKenzie': '맥켄지', 'Meadville': '메드빌', 'Mechanicsburg': '메카닉스버그', 'Medford': '메드퍼드',
    'Media': '미디어', 'Merced': '머시드', 'Mequon': '메쿼', 'Midway': '미드웨이',
    'Milligan': '밀리건', 'Milton': '밀턴', 'Monsey': '먼시', 'Montclair': '몬클레어',
    'Moon Township': '문타운십', 'Morrisville': '모리스빌', 'Morrow': '모로우', 'Moscow': '모스크바',
    'Mount Berry': '마운트베리', 'Nashua': '내슈아', 'New Albany': '뉴올버니', 'New Britain': '뉴브리튼',
    'New Brunswick': '뉴브런즈윅', 'New Concord': '뉴콩코드', 'New Gloucester': '뉴글로스터', 'New Rochelle': '뉴로셸',
    'New Wilmington': '뉴윌밍턴', 'Newberg': '뉴버그', 'Newberry': '뉴베리', 'Newburgh': '뉴버그',
    'Newport News': '뉴포트뉴스', 'Niagara University': '나이아가라유니버시티', 'North Brunswick': '노스브런즈윅', 'North Canton': '노스캔턴',
    'North Dartmouth': '노스다트머스', 'North Manchester': '노스맨체스터', 'Northampton': '노샘프턴', 'Norton': '노턴',
    'Odessa': '오데사', 'Oklahoma City': '오클라호마시티', 'Olathe': '올레이시', 'Olympia': '올림피아',
    'Ontario': '온타리오', 'Orange City': '오렌지시티', 'Orrville': '오빌', 'Oskaloosa': '오스칼루사',
    'Owings Mills': '오잉스밀스', 'Owosso': '오워소', 'Paxton': '팩스턴', 'Pella': '펠라',
    'Plainview': '플레인뷰', 'Prairie View': '프레리뷰', 'Presque Isle': '프레스크아일', 'Pulaski': '풀라스키',
    'Quincy': '퀸시', 'Randolph': '랜돌프', 'Redmond': '레드먼드', 'Richardson': '리처드슨',
    'Rindge': '린지', 'River Falls': '리버폴스', 'Rocklin': '록클린', 'Rockville Centre': '록빌센터',
    'Ruston': '러스턴', 'Saint Augustine': '세인트어거스틴', 'Saint Bonaventure': '세인트보나벤처', 'Saint Bonifacius': '세인트보니파시우스',
    'Saint Davids': '세인트데이비즈', 'Saint Leo': '세인트레오', 'Saint Mary of the Woods': '세인트메리오브더우즈', 'Salina': '살리나',
    'San Angelo': '산안젤로', 'Sandy Springs': '샌디스프링스', 'Sarasota': '새러소타', 'Saratoga Springs': '새러토가스프링스',
    'Sault Ste Marie': '수세인트마리', 'Scottsdale': '스코츠데일', 'Seaside': '시사이드', 'Seguin': '세귄',
    'Selinsgrove': '셀린스그로브', 'Sewanee': '세와니', 'Shawnee': '쇼니', 'Shepherdstown': '셰퍼즈타운',
    'Sherman': '셔먼', 'Shippensburg': '십펜스버그', 'Sioux Center': '수센터', 'Sioux City': '수시티',
    'Slippery Rock': '슬리퍼리록', 'Smithfield': '스미스필드', 'Socorro': '소코로', 'Southfield': '사우스필드',
    'Sparkill': '스파킬', 'Spearfish': '스피어피시', 'Spring Arbor': '스프링아버', 'St. Louis': '세인트루이스',
    'St. Mary\'s City': '세인트메리스시티', 'Standish': '스탠디시', 'Stanford': '스탠퍼드', 'Steubenville': '스튜븐빌',
    'Storm Lake': '스톰레이크', 'Superior': '슈피리어', 'Swarthmore': '스워스모어', 'Tahlequah': '탈리쿼',
    'Texarkana': '텍사카나', 'Thomasville': '토마스빌', 'Throggs Neck': '스로그스넥', 'Tigerville': '타이거빌',
    'Toccoa Falls': '토코아폴스', 'USAF Academy': 'USAF아카데미', 'Union': '유니언', 'University Center': '유니버시티센터',
    'University Heights': '유니버시티하이츠', 'University of Richmond': '리치먼드대학교', 'Victoria': '빅토리아', 'Villanova': '빌라노바',
    'Wake Forest': '웨이크포레스트', 'Waleska': '월레스카', 'Warwick': '워릭', 'Waxahachie': '와사해치',
    'Waynesburg': '웨인즈버그', 'Weatherford': '웨더퍼드', 'Wenham': '웬햄', 'West Point': '웨스트포인트',
    'West Chester': '웨스트체스터', 'West Haven': '웨스트헤이븐', 'West Liberty': '웨스트리버티', 'West Palm Beach': '웨스트팜비치',
    'Westerville': '웨스터빌', 'Weston': '웨스턴', 'Wilberforce': '윌버포스', 'Willimantic': '윌리맨틱',
    'Wilson': '윌슨', 'Winchester': '윈체스터', 'Winfield': '윈필드', 'Winston Salem': '윈스턴세일럼',
    'Winter Park': '윈터파크', 'Wise': '와이즈', 'Wyoming': '와이오밍', 'Yankton': '양크턴',
    'Young Harris': '영해리스'
  };
  
  // Return manual translation or fall back to English for rare cities
  return translations[city] || city;
};

// Helper function to format location display
const formatLocationDisplay = (city?: string, state?: string, language?: 'ko' | 'en'): string => {
  if (!city && !state) {
    return language === 'ko' ? '미국' : 'United States';
  }
  
  if (!city && state) {
    return language === 'ko' ? getStateTranslation(state) : state;
  }
  
  if (city && !state) {
    return city;
  }
  
  // Both city and state are available
  if (language === 'ko') {
    // Format: "State명 City명" (e.g., "캘리포니아주 클레어몬트")
    return `${getStateTranslation(state!)} ${getCityTranslation(city!)}`;
  }
  
  // For English, show "City, ST" format
  const stateAbbr = getStateAbbreviation(state!);
  return `${city}, ${stateAbbr}`;
};

// Helper function to get state abbreviation
const getStateAbbreviation = (state: string): string => {
  const abbreviations: Record<string, string> = {
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
  return abbreviations[state] || state;
};

const UniversitiesPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [displayCount, setDisplayCount] = useState(12);
  const itemsPerLoad = 12;
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState({
    types: [] as string[],
    sortBy: '',
    tuitionRange: [0, 70000] as [number, number],
    satRange: [800, 1600] as [number, number],
  });

  const filteredUniversities = universities.filter(uni => {
    // Korean-friendly search: case-sensitive for Korean, case-insensitive for English
    let matchesSearch = true;
    if (searchTerm.trim()) {
      const search = searchTerm.trim();
      const searchLower = search.toLowerCase();
      
      const koreanMatch = uni.name.includes(search);
      const englishMatch = uni.englishName.toLowerCase().includes(searchLower);
      const locationMatch = uni.location.toLowerCase().includes(searchLower);
      
      matchesSearch = koreanMatch || englishMatch || locationMatch;
    }
    
    const matchesType = filters.types.length === 0 || filters.types.includes(uni.type);
    const matchesTuition = uni.tuition >= filters.tuitionRange[0] && uni.tuition <= filters.tuitionRange[1];
    
    // Parse SAT range (e.g., "1460-1570" -> [1460, 1570])
    const satParts = uni.satRange.split('-').map(s => parseInt(s.trim()));
    const uniSatMin = satParts[0] || 800;
    const uniSatMax = satParts[1] || 1600;
    const matchesSat = uniSatMax >= filters.satRange[0] && uniSatMin <= filters.satRange[1];

    return matchesSearch && matchesType && matchesTuition && matchesSat;
  });

  // Sort filtered universities
  const sortedUniversities = [...filteredUniversities].sort((a, b) => {
    switch (filters.sortBy) {
      case 'name-asc':
        const nameA = language === 'ko' ? a.name : a.englishName;
        const nameB = language === 'ko' ? b.name : b.englishName;
        return nameA.localeCompare(nameB);
      case 'name-desc':
        const nameDescA = language === 'ko' ? a.name : a.englishName;
        const nameDescB = language === 'ko' ? b.name : b.englishName;
        return nameDescB.localeCompare(nameDescA);
      case 'sat-asc':
        const aSatMin = parseInt(a.satRange.split('-')[0]);
        const bSatMin = parseInt(b.satRange.split('-')[0]);
        return aSatMin - bSatMin;
      case 'sat-desc':
        const aSatMax = parseInt(a.satRange.split('-')[1]);
        const bSatMax = parseInt(b.satRange.split('-')[1]);
        return bSatMax - aSatMax;
      default:
        // Default/Recommended Sort: Prioritize universities with official logos
        // These schools typically have verified data and complete profiles
        // Schools with real logos from wikimedia or logos-world appear first
        const aHasLogo = a.image.includes('upload.wikimedia.org') || a.image.includes('logos-world.net');
        const bHasLogo = b.image.includes('upload.wikimedia.org') || b.image.includes('logos-world.net');
        if (aHasLogo && !bHasLogo) return -1;
        if (!aHasLogo && bHasLogo) return 1;
        // If both have logos or both don't, maintain original order
        return 0;
    }
  });

  const handleTypeToggle = (type: string) => {
    setFilters(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type]
    }));
    setDisplayCount(12);
  };

  const handleSortChange = (sortBy: string) => {
    setFilters(prev => ({ ...prev, sortBy }));
    setDisplayCount(12);
  };

  const handleTuitionRangeChange = (range: [number, number]) => {
    // Ensure min doesn't exceed max and max doesn't go below min
    const [min, max] = range;
    const validRange: [number, number] = [
      Math.min(min, max),
      Math.max(min, max)
    ];
    setFilters(prev => ({ ...prev, tuitionRange: validRange }));
    setDisplayCount(12);
  };
  
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setDisplayCount(12);
  };

  const handleSatRangeChange = (range: [number, number]) => {
    // Ensure min doesn't exceed max and max doesn't go below min
    const [min, max] = range;
    const validRange: [number, number] = [
      Math.min(min, max),
      Math.max(min, max)
    ];
    setFilters(prev => ({ ...prev, satRange: validRange }));
    setDisplayCount(12);
  };

  // Infinite scroll: show universities up to displayCount
  const displayedUniversities = sortedUniversities.slice(0, displayCount);
  const hasMore = displayCount < sortedUniversities.length;

  // Infinite scroll effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setDisplayCount(prev => prev + itemsPerLoad);
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore]);

  return (
    <div className="universities-page">
      <div className="universities-container">
        <div className="universities-header">
          <h1 className="universities-title">
            {t('universities.title')}
          </h1>
          <p className="universities-description">
            {t('universities.description')}
          </p>
        </div>

        <div className="universities-controls">
          <div className="universities-search-row">
            <div className="universities-search-wrapper">
              <Search className="universities-search-icon h-5 w-5" />
              <input
                type="text"
                placeholder={t('universities.search.placeholder')}
                className="universities-search-input"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>

            <div className="universities-view-toggle">
              <button
                onClick={() => setViewMode('grid')}
                className={`universities-view-button ${viewMode === 'grid' ? 'active' : ''}`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`universities-view-button ${viewMode === 'list' ? 'active' : ''}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="universities-filters">
            <div className="universities-filters-header">
              <Filter className="h-5 w-5" style={{color: '#082F49'}} />
              <span className="universities-filters-title">{t('universities.filter.title')}</span>
            </div>

            <div className="universities-filters-content">
              <div className="universities-filter-group">
                <label className="universities-filter-label">{t('universities.filter.type')}</label>
                <div className="universities-filter-buttons">
                  <button
                    onClick={() => handleTypeToggle('사립')}
                    className={`universities-filter-button ${filters.types.includes('사립') ? 'active' : ''}`}
                    data-testid="button-filter-private"
                  >
                    {t('universities.filter.type.private')}
                  </button>
                  <button
                    onClick={() => handleTypeToggle('공립')}
                    className={`universities-filter-button ${filters.types.includes('공립') ? 'active' : ''}`}
                    data-testid="button-filter-public"
                  >
                    {t('universities.filter.type.public')}
                  </button>
                </div>
              </div>

              <div className="universities-filter-group">
                <label className="universities-filter-label">{t('universities.filter.sort')}</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="universities-filter-select"
                >
                  <option value="">{t('universities.filter.sort.default')}</option>
                  <option value="name-asc">{t('universities.filter.sort.name-asc')}</option>
                  <option value="name-desc">{t('universities.filter.sort.name-desc')}</option>
                  <option value="sat-asc">{t('universities.filter.sort.sat-asc')}</option>
                  <option value="sat-desc">{t('universities.filter.sort.sat-desc')}</option>
                </select>
              </div>

              <div className="universities-filter-group">
                <label className="universities-filter-label">
                  {t('universities.filter.tuition')}: ${filters.tuitionRange[0].toLocaleString()} - ${filters.tuitionRange[1].toLocaleString()}
                </label>
                <div className="px-2">
                  <DualRangeSlider
                    min={0}
                    max={70000}
                    step={1000}
                    value={filters.tuitionRange}
                    onChange={handleTuitionRangeChange}
                  />
                </div>
              </div>

              <div className="universities-filter-group">
                <label className="universities-filter-label">
                  {t('universities.filter.sat')}: {filters.satRange[0]} - {filters.satRange[1]}
                </label>
                <div className="px-2">
                  <DualRangeSlider
                    min={800}
                    max={1600}
                    step={10}
                    value={filters.satRange}
                    onChange={handleSatRangeChange}
                  />
                </div>
              </div>
              </div>
            </div>
          </div>

        <div className={viewMode === 'grid' ? 'universities-grid' : 'universities-list'}>
          {displayedUniversities.map(university => (
            viewMode === 'grid' ? (
              <Link
                key={university.id}
                to={`/university/${university.id}`}
                state={{ from: '/universities' }}
                className="university-card"
              >
                <img
                  src={university.image}
                  alt={language === 'ko' ? university.name : university.englishName}
                  className="university-card-image"
                  style={{ opacity: university.image.includes('preplounge-logo') ? 0.2 : 1 }}
                  onError={(e) => { e.currentTarget.src = '/preplounge-logo-final.png'; e.currentTarget.style.opacity = '0.2'; }}
                />
                <div className="university-card-content">
                  <h3 className="university-card-title">{language === 'ko' ? university.name : university.englishName}</h3>
                  {language === 'ko' && university.name !== university.englishName && (
                    <p className="university-card-subtitle">{university.englishName}</p>
                  )}

                  <div className="university-card-location">
                    <MapPin className="h-4 w-4" />
                    <span>{formatLocationDisplay(university.city, university.state, language)} • {university.type === '공립' ? (language === 'ko' ? '공립' : 'Public') : (language === 'ko' ? '사립' : 'Private')}</span>
                  </div>

                  <div className="university-card-stats">
                    <div className="university-card-stat">
                      <Users className="university-card-stat-icon h-4 w-4" />
                      <span className="university-card-stat-text">{t('universities.acceptance')} {university.acceptanceRate}%</span>
                    </div>
                    <div className="university-card-stat">
                      <DollarSign className="university-card-stat-icon h-4 w-4" />
                      <span className="university-card-stat-text">{t('universities.tuition')} ${university.tuition.toLocaleString()}</span>
                    </div>
                    <div className="university-card-stat">
                      <BookOpen className="university-card-stat-icon h-4 w-4" />
                      <span className="university-card-stat-text">{t('universities.sat')} {university.satRange}</span>
                    </div>
                    <div className="university-card-stat">
                      <BookOpen className="university-card-stat-icon h-4 w-4" />
                      <span className="university-card-stat-text">{t('universities.act')} {university.actRange}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <Link
                key={university.id}
                to={`/university/${university.id}`}
                state={{ from: '/universities' }}
                className="university-list-item"
              >
                <img
                  src={university.image}
                  alt={language === 'ko' ? university.name : university.englishName}
                  className="university-list-image"
                  style={{ opacity: university.image.includes('preplounge-logo') ? 0.2 : 1 }}
                  onError={(e) => { e.currentTarget.src = '/preplounge-logo-final.png'; e.currentTarget.style.opacity = '0.2'; }}
                />
                <div className="university-list-content">
                  <div className="university-list-header">
                    <h3 className="university-list-title">{language === 'ko' ? university.name : university.englishName}</h3>
                    {language === 'ko' && university.name !== university.englishName && (
                      <p className="university-list-subtitle">{university.englishName}</p>
                    )}
                    <div className="university-card-location" style={{marginTop: '8px'}}>
                      <MapPin className="h-4 w-4" />
                      <span>{formatLocationDisplay(university.city, university.state, language)} • {university.type === '공립' ? (language === 'ko' ? '공립' : 'Public') : (language === 'ko' ? '사립' : 'Private')}</span>
                    </div>
                  </div>
                  <div className="university-list-stats">
                    <div className="university-card-stat">
                      <Users className="university-card-stat-icon h-4 w-4" />
                      <span className="university-card-stat-text">{t('universities.acceptance')} {university.acceptanceRate}%</span>
                    </div>
                    <div className="university-card-stat">
                      <DollarSign className="university-card-stat-icon h-4 w-4" />
                      <span className="university-card-stat-text">{t('universities.tuition')} ${university.tuition.toLocaleString()}</span>
                    </div>
                    <div className="university-card-stat">
                      <BookOpen className="university-card-stat-icon h-4 w-4" />
                      <span className="university-card-stat-text">{t('universities.sat')} {university.satRange}</span>
                    </div>
                    <div className="university-card-stat">
                      <BookOpen className="university-card-stat-icon h-4 w-4" />
                      <span className="university-card-stat-text">{t('universities.act')} {university.actRange}</span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          ))}
        </div>

        {sortedUniversities.length === 0 && (
          <div className="universities-empty">
            <BookOpen className="universities-empty-icon" />
            <h3 className="universities-empty-title">{t('universities.empty.title')}</h3>
            <p className="universities-empty-text">{t('universities.empty.description')}</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilters({
                  types: [],
                  sortBy: '',
                  tuitionRange: [0, 70000],
                  satRange: [800, 1600]
                });
              }}
              className="universities-filter-button active" style={{marginTop: '16px'}}
            >
              {t('universities.empty.reset')}
            </button>
          </div>
        )}

        {/* Infinite Scroll Trigger */}
        {hasMore && (
          <div 
            ref={loadMoreRef}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '40px',
              marginTop: '20px'
            }}
          >
            <div style={{
              fontSize: '14px',
              color: '#6b7280',
              textAlign: 'center'
            }}>
              {language === 'ko' ? '더 많은 대학 로딩 중...' : 'Loading more universities...'}
            </div>
          </div>
        )}
        
        {!hasMore && sortedUniversities.length > 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#6b7280',
            fontSize: '14px'
          }}>
            {language === 'ko' 
              ? `${sortedUniversities.length}개 대학을 모두 표시했습니다.` 
              : `Showing all ${sortedUniversities.length} universities.`
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversitiesPage;