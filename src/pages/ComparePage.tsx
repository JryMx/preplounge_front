import React, { useState } from 'react';
import { X, Plus, BookOpen, Users, DollarSign, Award, MapPin, Calendar, CheckCircle, AlertCircle, Search } from 'lucide-react';
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
  institutionType: string;
  carnegieClassification: string;
  size: number;
  endowment: number;
  graduationRate: number;
  averageEarnings: number;
}

// Mock university data
const allUniversities: University[] = [
  {
    id: '1',
    name: '하버드 대학교',
    englishName: 'Harvard University',
    location: 'Cambridge, MA',
    tuition: 54269,
    acceptanceRate: 5.4,
    satRange: '1460-1570',
    actRange: '33-35',
    image: 'https://images.pexels.com/photos/207684/pexels-photo-207684.jpeg?auto=compress&cs=tinysrgb&w=400',
    type: '사립',
    institutionType: '4년제',
    carnegieClassification: '박사 학위 수여 대학 (매우 높은 연구 활동)',
    size: 6700,
    endowment: 53200000000,
    graduationRate: 97,
    averageEarnings: 95000,
  },
  {
    id: '2',
    name: '스탠퍼드 대학교',
    englishName: 'Stanford University',
    location: 'Stanford, CA',
    tuition: 56169,
    acceptanceRate: 4.8,
    satRange: '1440-1570',
    actRange: '32-35',
    image: 'https://images.pexels.com/photos/1454360/pexels-photo-1454360.jpeg?auto=compress&cs=tinysrgb&w=400',
    type: '사립',
    institutionType: '4년제',
    carnegieClassification: '박사 학위 수여 대학 (매우 높은 연구 활동)',
    size: 7087,
    endowment: 37800000000,
    graduationRate: 94,
    averageEarnings: 94000,
  },
  {
    id: '3',
    name: '메사추세츠 공과대학교',
    englishName: 'Massachusetts Institute of Technology (MIT)',
    location: 'Cambridge, MA',
    tuition: 53790,
    acceptanceRate: 7.3,
    satRange: '1470-1570',
    actRange: '33-35',
    image: 'https://images.pexels.com/photos/1454360/pexels-photo-1454360.jpeg?auto=compress&cs=tinysrgb&w=400',
    type: '사립',
    institutionType: '4년제',
    carnegieClassification: '박사 학위 수여 대학 (매우 높은 연구 활동)',
    size: 4602,
    endowment: 27400000000,
    graduationRate: 96,
    averageEarnings: 104000,
  },
  {
    id: '4',
    name: '캘리포니아 대학교 버클리',
    englishName: 'University of California, Berkeley',
    location: 'Berkeley, CA',
    tuition: 44007,
    acceptanceRate: 17.5,
    satRange: '1330-1530',
    actRange: '30-35',
    image: 'https://images.pexels.com/photos/1454360/pexels-photo-1454360.jpeg?auto=compress&cs=tinysrgb&w=400',
    type: '공립',
    institutionType: '4년제',
    carnegieClassification: '박사 학위 수여 대학 (매우 높은 연구 활동)',
    size: 31780,
    endowment: 6200000000,
    graduationRate: 92,
    averageEarnings: 78000,
  },
];

const ComparePage: React.FC = () => {
  const [selectedUniversities, setSelectedUniversities] = useState<University[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const availableUniversities = allUniversities.filter(
    uni => !selectedUniversities.find(selected => selected.id === uni.id)
  );

  const filteredUniversities = availableUniversities.filter(uni =>
    uni.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const comparisonCategories = [
    {
      title: '기본',
      fields: [
        { key: 'location', label: '위치', format: (val: any) => val },
        { key: 'type', label: '공립/사립 + 2년제/4년제', format: (val: any, uni: University) => `${val} ${uni.institutionType}` },
        { key: 'carnegieClassification', label: '카네기 분류', format: (val: any) => val },
        { key: 'size', label: '학부 재학생 수', format: (val: any) => val.toLocaleString() + '명' },
        { key: 'endowment', label: '학교 자금', format: (val: any) => '$' + (val / 1000000000).toFixed(1) + 'B' },
        { key: 'tuition', label: '학비', format: (val: any) => `$${val.toLocaleString()}` },
      ],
    },
    {
      title: '입학 통계',
      fields: [
        { key: 'acceptanceRate', label: '합격률', format: (val: any) => `${val}%` },
        { key: 'satRange', label: 'SAT 범위', format: (val: any) => val },
        { key: 'actRange', label: 'ACT 범위', format: (val: any) => val },
      ],
    },
    {
      title: '졸업 통계',
      fields: [
        { key: 'graduationRate', label: '졸업률', format: (val: any) => `${val}%` },
        { key: 'averageEarnings', label: '졸업 후 평균 연봉', format: (val: any) => `$${val.toLocaleString()}` },
      ],
    },
  ];

  return (
    <div className="compare-page">
      <div className="compare-container">
        <div className="compare-header">
          <h1 className="compare-title">
            학교 비교하기
          </h1>
          <p className="compare-description">
            최대 4개 대학을 나란히 비교하여 합격 전략을 세워보세요.
          </p>
        </div>

        <div className="compare-selection">
          <h2 className="compare-selection-title">
            선택한 대학 ({selectedUniversities.length}/4)
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
                <h3 className="compare-selected-name">{university.name}</h3>
                <p className="compare-selected-location">{university.location}</p>
              </div>
            ))}

            {Array.from({ length: 4 - selectedUniversities.length }).map((_, index) => (
              <button
                key={index}
                className="compare-add-button"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="compare-add-icon h-8 w-8" />
                <span className="compare-add-text">대학 추가</span>
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
                      카테고리
                    </th>
                    {selectedUniversities.map(university => (
                      <th key={university.id} style={{textAlign: 'center', minWidth: '200px'}}>
                        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'}}>
                          <div style={{fontSize: '14px'}}>
                            {university.name}
                          </div>
                          <div style={{fontSize: '12px', opacity: 0.8}}>
                            {university.englishName}
                          </div>
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
                          <td>
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
              대학을 추가하여 비교를 시작하세요
            </h3>
            <p className="compare-empty-text">
              최소 2개 이상의 대학을 선택하면 상세 비교를 볼 수 있습니다.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="compare-empty-button"
            >
              <Plus className="h-5 w-5" />
              대학 추가하기
            </button>
          </div>
        )}

        {showAddModal && (
          <div className="compare-search-modal" onClick={() => setShowAddModal(false)}>
            <div className="compare-search-content" onClick={(e) => e.stopPropagation()}>
              <div className="compare-search-header">
                <h3 className="compare-search-title">대학 추가</h3>
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
                  placeholder="대학명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="compare-search-input"
                />
              </div>

              <div className="compare-search-results">
                {filteredUniversities.map(university => (
                  <button
                    key={university.id}
                    onClick={() => addUniversity(university)}
                    className="compare-search-item"
                  >
                    <div className="compare-search-item-name">{university.name}</div>
                    <div className="compare-search-item-location">{university.location}</div>
                  </button>
                ))}

                {filteredUniversities.length === 0 && (
                  <p className="compare-empty-text" style={{textAlign: 'center', padding: '40px 0'}}>
                    검색 결과가 없습니다.
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