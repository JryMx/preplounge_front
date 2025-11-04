import React, { useState } from 'react';
import { X, Plus, BookOpen, Search } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import universitiesData from '../data/universities.json';
import './compare-page.css';

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
  estimatedGPA: number;
  academicInfo?: {
    graduationRate: number;
    averageEarnings?: number;
  };
}

const ComparePage: React.FC = () => {
  const { language } = useLanguage();
  const [selectedUniversities, setSelectedUniversities] = useState<University[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Load all universities from the JSON data
  const allUniversities: University[] = universitiesData.map((uni: any) => ({
    id: uni.id,
    name: uni.name,
    englishName: uni.englishName,
    location: uni.location,
    tuition: uni.tuition,
    acceptanceRate: uni.acceptanceRate,
    satRange: uni.satRange,
    actRange: uni.actRange,
    image: uni.image,
    type: uni.type,
    size: uni.size,
    estimatedGPA: uni.estimatedGPA,
    academicInfo: uni.academicInfo,
  }));

  const availableUniversities = allUniversities.filter(
    uni => !selectedUniversities.find(selected => selected.id === uni.id)
  );

  const filteredUniversities = availableUniversities
    .filter(uni => {
      if (!searchTerm.trim()) return true;
      
      const search = searchTerm.trim();
      const searchLower = search.toLowerCase();
      
      // Check Korean name (case-sensitive for Korean)
      const koreanMatch = uni.name.includes(search);
      
      // Check English name (case-insensitive)
      const englishMatch = uni.englishName.toLowerCase().includes(searchLower);
      
      return koreanMatch || englishMatch;
    })
    .sort((a, b) => {
      // Sort alphabetically by name (respecting current language)
      const nameA = language === 'ko' ? a.name : a.englishName;
      const nameB = language === 'ko' ? b.name : b.englishName;
      return nameA.localeCompare(nameB);
    });

  const addUniversity = (university: University) => {
    if (selectedUniversities.length < 4) {
      setSelectedUniversities(prev => [...prev, university]);
      setShowAddModal(false);
      setSearchTerm('');
    }
  };

  const removeUniversity = (universityId: string) => {
    setSelectedUniversities(prev => prev.filter(uni => uni.id !== universityId));
  };

  // Translation helper for school type
  const translateType = (type: string) => {
    if (language === 'ko') return type;
    const translations: { [key: string]: string } = {
      '공립': 'Public',
      '사립': 'Private',
    };
    return translations[type] || type;
  };

  // Translation helper for school size
  const translateSize = (size: string) => {
    if (language === 'ko') return size;
    const translations: { [key: string]: string } = {
      '작음 (<5,000)': 'Small (<5,000)',
      '중간 (5,000-15,000)': 'Medium (5,000-15,000)',
      '큼 (15,000+)': 'Large (15,000+)',
    };
    return translations[size] || size;
  };

  const comparisonCategories = [
    {
      title: language === 'ko' ? '기본 정보' : 'Basic Information',
      fields: [
        { 
          key: 'type', 
          label: language === 'ko' ? '학교 유형' : 'School Type', 
          format: (val: any) => translateType(val)
        },
        { 
          key: 'size', 
          label: language === 'ko' ? '학교 규모' : 'School Size', 
          format: (val: any) => translateSize(val)
        },
        { 
          key: 'tuition', 
          label: language === 'ko' ? '학비' : 'Tuition', 
          format: (val: any) => `$${val.toLocaleString()}` 
        },
      ],
    },
    {
      title: language === 'ko' ? '입학 통계' : 'Admission Statistics',
      fields: [
        { 
          key: 'acceptanceRate', 
          label: language === 'ko' ? '합격률' : 'Acceptance Rate', 
          format: (val: any) => `${val}%` 
        },
        { 
          key: 'satRange', 
          label: language === 'ko' ? 'SAT 범위' : 'SAT Range', 
          format: (val: any) => val 
        },
        { 
          key: 'actRange', 
          label: language === 'ko' ? 'ACT 범위' : 'ACT Range', 
          format: (val: any) => val 
        },
        { 
          key: 'estimatedGPA', 
          label: language === 'ko' ? '평균 GPA' : 'Average GPA', 
          format: (val: any) => val.toFixed(2) 
        },
      ],
    },
    {
      title: language === 'ko' ? '졸업 통계' : 'Graduation Statistics',
      fields: [
        { 
          key: 'graduationRate', 
          label: language === 'ko' ? '졸업률' : 'Graduation Rate', 
          format: (_val: any, uni: University) => uni.academicInfo?.graduationRate ? `${uni.academicInfo.graduationRate}%` : 'N/A'
        },
        { 
          key: 'averageEarnings', 
          label: language === 'ko' ? '졸업 후 평균 소득' : 'Average Earnings After Graduation', 
          format: (_val: any, uni: University) => uni.academicInfo?.averageEarnings ? `$${uni.academicInfo.averageEarnings.toLocaleString()}` : 'N/A'
        },
      ],
    },
  ];

  return (
    <div className="compare-page">
      <div className="compare-container">
        <div className="compare-header">
          <h1 className="compare-title">
            {language === 'ko' ? '학교 비교하기' : 'Compare Schools'}
          </h1>
          <p className="compare-description">
            {language === 'ko' 
              ? '최대 4개 대학을 나란히 비교하여 합격 전략을 세워보세요.' 
              : 'Compare up to 4 universities side by side to plan your admission strategy.'}
          </p>
        </div>

        <div className="compare-selection">
          <h2 className="compare-selection-title">
            {language === 'ko' 
              ? `선택한 대학 (${selectedUniversities.length}/4)` 
              : `Selected Universities (${selectedUniversities.length}/4)`}
          </h2>

          <div className="compare-selected-grid">
            {selectedUniversities.map(university => (
              <div key={university.id} className="compare-selected-card">
                <button
                  onClick={() => removeUniversity(university.id)}
                  className="compare-selected-remove"
                >
                  <X className="h-4 w-4" />
                </button>
                <h3 className="compare-selected-name" style={{marginTop: '16px'}}>
                  {language === 'ko' ? university.name : university.englishName}
                </h3>
              </div>
            ))}

            {Array.from({ length: 4 - selectedUniversities.length }).map((_, index) => (
              <button
                key={index}
                className="compare-add-button"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="compare-add-icon h-8 w-8" />
                <span className="compare-add-text">
                  {language === 'ko' ? '대학 추가' : 'Add University'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        {selectedUniversities.length >= 2 && (
          <div className="compare-table-wrapper">
            <div style={{overflowX: 'auto'}}>
              <table className="compare-table">
                <thead>
                  <tr>
                    <th style={{minWidth: '200px'}}>
                      {language === 'ko' ? '카테고리' : 'Category'}
                    </th>
                    {selectedUniversities.map(university => (
                      <th key={university.id} style={{textAlign: 'center', minWidth: '250px', padding: '16px'}}>
                        <div style={{fontSize: '14px', fontWeight: 700}}>
                          {language === 'ko' ? university.name : university.englishName}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {comparisonCategories.map(category => (
                    <React.Fragment key={category.title}>
                      <tr>
                        <td
                          colSpan={selectedUniversities.length + 1}
                          className="compare-table-category"
                        >
                          {category.title}
                        </td>
                      </tr>

                      {category.fields.map(field => (
                        <tr key={field.key}>
                          <td className="compare-table-label">
                            {field.label}
                          </td>
                          {selectedUniversities.map(university => (
                            <td key={university.id} style={{textAlign: 'center'}}>
                              {field.format(university[field.key as keyof University], university)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedUniversities.length < 2 && (
          <div className="compare-empty">
            <BookOpen className="compare-empty-icon" />
            <h3 className="compare-empty-title">
              {language === 'ko' 
                ? '대학을 추가하여 비교를 시작하세요' 
                : 'Add universities to start comparing'}
            </h3>
            <p className="compare-empty-text">
              {language === 'ko' 
                ? '최소 2개 이상의 대학을 선택하면 상세 비교를 볼 수 있습니다.' 
                : 'Select at least 2 universities to see detailed comparison.'}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="compare-empty-button"
            >
              <Plus className="h-5 w-5" />
              {language === 'ko' ? '대학 추가하기' : 'Add University'}
            </button>
          </div>
        )}

        {showAddModal && (
          <div className="compare-search-modal" onClick={() => setShowAddModal(false)}>
            <div className="compare-search-content" onClick={(e) => e.stopPropagation()}>
              <div className="compare-search-header">
                <h3 className="compare-search-title">
                  {language === 'ko' ? '대학 추가' : 'Add University'}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="compare-search-close"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="compare-search-input-wrapper">
                <Search className="compare-search-icon h-5 w-5" />
                <input
                  type="text"
                  placeholder={language === 'ko' ? '대학명으로 검색...' : 'Search by university name...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="compare-search-input"
                  autoFocus
                />
              </div>

              <div className="compare-search-results">
                {filteredUniversities.slice(0, 100).map(university => (
                  <button
                    key={university.id}
                    onClick={() => addUniversity(university)}
                    className="compare-search-item"
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      justifyContent: 'flex-start'
                    }}
                  >
                    <div className="compare-search-item-name">
                      {language === 'ko' ? university.name : university.englishName}
                    </div>
                  </button>
                ))}

                {filteredUniversities.length === 0 && (
                  <p className="compare-empty-text" style={{textAlign: 'center', padding: '40px 0'}}>
                    {language === 'ko' ? '검색 결과가 없습니다.' : 'No results found.'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparePage;
