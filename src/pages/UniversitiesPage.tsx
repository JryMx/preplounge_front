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

// Helper function to get city translation (basic version - just return English for brevity)
const getCityTranslation = (city: string): string => {
  // For list view, showing English city name is clearer and more concise
  // Full Korean city translations are available on the detail page
  return city;
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