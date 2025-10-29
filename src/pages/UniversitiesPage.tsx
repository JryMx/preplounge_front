import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Users, DollarSign, BookOpen, Filter, Grid2x2 as Grid, List } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import universitiesData from '../data/universities.json';
import './universities-page.css';

interface University {
  id: string;
  name: string;
  englishName: string;
  location: string;
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

const UniversitiesPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [filters, setFilters] = useState({
    types: [] as string[],
    sortBy: '',
    tuitionRange: [0, 60000] as [number, number],
    satRange: [800, 1600] as [number, number],
  });

  const filteredUniversities = universities.filter(uni => {
    const matchesSearch = uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         uni.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         uni.location.toLowerCase().includes(searchTerm.toLowerCase());
    
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
    setCurrentPage(1);
  };

  const handleSortChange = (sortBy: string) => {
    setFilters(prev => ({ ...prev, sortBy }));
    setCurrentPage(1);
  };

  const handleTuitionRangeChange = (range: [number, number]) => {
    // Ensure min doesn't exceed max and max doesn't go below min
    const [min, max] = range;
    const validRange: [number, number] = [
      Math.min(min, max),
      Math.max(min, max)
    ];
    setFilters(prev => ({ ...prev, tuitionRange: validRange }));
    setCurrentPage(1);
  };
  
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleSatRangeChange = (range: [number, number]) => {
    // Ensure min doesn't exceed max and max doesn't go below min
    const [min, max] = range;
    const validRange: [number, number] = [
      Math.min(min, max),
      Math.max(min, max)
    ];
    setFilters(prev => ({ ...prev, satRange: validRange }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Calculate pagination
  const totalPages = Math.ceil(sortedUniversities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUniversities = sortedUniversities.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
                    <input
                      type="range"
                      min="0"
                      max="60000"
                      step="1000"
                      value={filters.tuitionRange[0]}
                      onChange={(e) => handleTuitionRangeChange([parseInt(e.target.value), filters.tuitionRange[1]])}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <input
                      type="range"
                      min="0"
                      max="60000"
                      step="1000"
                      value={filters.tuitionRange[1]}
                      onChange={(e) => handleTuitionRangeChange([filters.tuitionRange[0], parseInt(e.target.value)])}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider mt-2"
                    />
                  </div>
                </div>

              <div className="universities-filter-group">
                <label className="universities-filter-label">
                  {t('universities.filter.sat')}: {filters.satRange[0]} - {filters.satRange[1]}
                </label>
                  <div className="px-2">
                    <input
                      type="range"
                      min="800"
                      max="1600"
                      step="10"
                      value={filters.satRange[0]}
                      onChange={(e) => handleSatRangeChange([parseInt(e.target.value), filters.satRange[1]])}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <input
                      type="range"
                      min="800"
                      max="1600"
                      step="10"
                      value={filters.satRange[1]}
                      onChange={(e) => handleSatRangeChange([filters.satRange[0], parseInt(e.target.value)])}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider mt-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{marginBottom: '24px'}}>
            <p className="universities-description">
              {t('universities.results').replace('{total}', universities.length.toString()).replace('{filtered}', sortedUniversities.length.toString())}
            </p>
          </div>

        <div className={viewMode === 'grid' ? 'universities-grid' : 'universities-list'}>
          {paginatedUniversities.map(university => (
            viewMode === 'grid' ? (
              <Link
                key={university.id}
                to={`/university/${university.id}`}
                className="university-card"
              >
                <img
                  src={university.image}
                  alt={language === 'ko' ? university.name : university.englishName}
                  className="university-card-image"
                />
                <div className="university-card-content">
                  <h3 className="university-card-title">{language === 'ko' ? university.name : university.englishName}</h3>
                  {language === 'ko' && university.name !== university.englishName && (
                    <p className="university-card-subtitle">{university.englishName}</p>
                  )}

                  <div className="university-card-location">
                    <MapPin className="h-4 w-4" />
                    <span>{university.location} • {university.type === '공립' ? (language === 'ko' ? '공립' : 'Public') : (language === 'ko' ? '사립' : 'Private')}</span>
                  </div>

                  <div className="university-card-stats">
                    <div className="university-card-stat">
                      <Users className="university-card-stat-icon h-4 w-4" />
                      <span className="university-card-stat-text">{t('universities.acceptance')} {university.acceptanceRate}%</span>
                    </div>
                    <div className="university-card-stat">
                      <DollarSign className="university-card-stat-icon h-4 w-4" />
                      <span className="university-card-stat-text">${university.tuition.toLocaleString()}</span>
                    </div>
                    <div className="university-card-stat">
                      <BookOpen className="university-card-stat-icon h-4 w-4" />
                      <span className="university-card-stat-text">SAT: {university.satRange}</span>
                    </div>
                    <div className="university-card-stat">
                      <BookOpen className="university-card-stat-icon h-4 w-4" />
                      <span className="university-card-stat-text">ACT: {university.actRange}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <Link
                key={university.id}
                to={`/university/${university.id}`}
                className="university-list-item"
              >
                <img
                  src={university.image}
                  alt={language === 'ko' ? university.name : university.englishName}
                  className="university-list-image"
                />
                <div className="university-list-content">
                  <div className="university-list-header">
                    <h3 className="university-list-title">{language === 'ko' ? university.name : university.englishName}</h3>
                    {language === 'ko' && university.name !== university.englishName && (
                      <p className="university-list-subtitle">{university.englishName}</p>
                    )}
                    <div className="university-card-location" style={{marginTop: '8px'}}>
                      <MapPin className="h-4 w-4" />
                      <span>{university.location} • {university.type === '공립' ? (language === 'ko' ? '공립' : 'Public') : (language === 'ko' ? '사립' : 'Private')}</span>
                    </div>
                  </div>
                  <div className="university-list-stats">
                    <div className="university-card-stat">
                      <Users className="university-card-stat-icon h-4 w-4" />
                      <span className="university-card-stat-text">{t('universities.acceptance')} {university.acceptanceRate}%</span>
                    </div>
                    <div className="university-card-stat">
                      <DollarSign className="university-card-stat-icon h-4 w-4" />
                      <span className="university-card-stat-text">${university.tuition.toLocaleString()}</span>
                    </div>
                    <div className="university-card-stat">
                      <BookOpen className="university-card-stat-icon h-4 w-4" />
                      <span className="university-card-stat-text">SAT: {university.satRange}</span>
                    </div>
                    <div className="university-card-stat">
                      <BookOpen className="university-card-stat-icon h-4 w-4" />
                      <span className="university-card-stat-text">ACT: {university.actRange}</span>
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
              onClick={() => setFilters({
                types: [],
                sortBy: '',
                tuitionRange: [0, 60000],
                satRange: [800, 1600]
              })}
              className="universities-filter-button active" style={{marginTop: '16px'}}
            >
              {t('universities.empty.reset')}
            </button>
          </div>
        )}

        {/* Pagination Controls */}
        {sortedUniversities.length > 0 && totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
            marginTop: '40px',
            marginBottom: '40px'
          }}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: '10px 20px',
                backgroundColor: currentPage === 1 ? '#e5e7eb' : '#1e3a8a',
                color: currentPage === 1 ? '#9ca3af' : 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                fontSize: '14px'
              }}
              data-testid="button-prev-page"
            >
              {language === 'ko' ? '이전' : 'Previous'}
            </button>

            <div style={{ display: 'flex', gap: '8px' }}>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: currentPage === pageNum ? '#1e3a8a' : 'white',
                      color: currentPage === pageNum ? 'white' : '#1e3a8a',
                      border: '2px solid #1e3a8a',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '14px',
                      minWidth: '44px'
                    }}
                    data-testid={`button-page-${pageNum}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: '10px 20px',
                backgroundColor: currentPage === totalPages ? '#e5e7eb' : '#1e3a8a',
                color: currentPage === totalPages ? '#9ca3af' : 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                fontSize: '14px'
              }}
              data-testid="button-next-page"
            >
              {language === 'ko' ? '다음' : 'Next'}
            </button>

            <span style={{
              marginLeft: '16px',
              color: '#6b7280',
              fontSize: '14px'
            }}>
              {language === 'ko' 
                ? `${currentPage} / ${totalPages} 페이지` 
                : `Page ${currentPage} of ${totalPages}`
              }
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversitiesPage;