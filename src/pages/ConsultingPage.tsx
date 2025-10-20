import React, { useState } from 'react';
import { MapPin, Star, Phone, Mail, Search, Users } from 'lucide-react';
import './consulting-page.css';

interface ConsultingProgram {
  id: string;
  name: string;
  location: string;
  duration: string;
  image: string;
  specialties: string[];
  services: string[];
  description: string;
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  strengths: string[];
}

const consultingPrograms: ConsultingProgram[] = [
  {
    id: '1',
    name: 'Seoul Academic Consulting',
    location: '서울시 강남구',
    duration: '6개월',
    image: 'https://images.pexels.com/photos/1181625/pexels-photo-1181625.jpeg?auto=compress&cs=tinysrgb&w=400',
    specialties: ['SAT 준비', '에세이 작성', '면접 코칭'],
    services: [
      '개인 맞춤 학습 계획',
      '주간 모의고사',
      '에세이 검토 및 편집',
      '면접 준비',
      '대학 목록 전략',
      '지원 일정 관리',
    ],
    description: '아이비리그 출신 전문 상담사들이 최상위권 대학 입학을 위한 프리미엄 컨설팅 서비스를 제공합니다.',
    contact: {
      phone: '02-1234-5678',
      email: 'info@seoulacademic.com',
      website: 'www.seoulacademic.com',
    },
    strengths: ['SAT 점수', '에세이 작성', '면접 기술'],
  },
  {
    id: '2',
    name: 'GlobalEd Consulting',
    location: '서울시 중구',
    duration: '8개월',
    image: 'https://images.pexels.com/photos/1181625/pexels-photo-1181625.jpeg?auto=compress&cs=tinysrgb&w=400',
    specialties: ['STEM 프로그램', '연구 프로젝트', '리더십 개발'],
    services: [
      'STEM 연구 멘토링',
      '리더십 프로젝트 개발',
      '과외활동 기획',
      '추천서 전략',
      '장학금 지원',
      '비자 신청 지원',
    ],
    description: '연구 기관과의 강력한 네트워크를 통해 STEM 교육에 중점을 둔 인턴십 기회를 제공합니다.',
    contact: {
      phone: '02-9876-5432',
      email: 'contact@globaled.co.kr',
      website: 'www.globaled.co.kr',
    },
    strengths: ['과외 활동', '리더십 경험', '연구 경험'],
  },
  {
    id: '3',
    name: 'Elite Prep Academy',
    location: '서울시 서초구',
    duration: '12개월',
    image: 'https://images.pexels.com/photos/1181625/pexels-photo-1181625.jpeg?auto=compress&cs=tinysrgb&w=400',
    specialties: ['아이비리그 준비', '프리미엄 상담', '종합 개발'],
    services: [
      '일대일 상담',
      '아이비리그 동문 멘토링',
      '프리미엄 에세이 워크샵',
      '모의 면접 세션',
      '표준화 시험 준비',
      '대학 방문 계획',
    ],
    description: '제한된 정원으로 최상위권 대학 입학을 위한 집중적인 지원을 제공하는 독점 프로그램입니다.',
    contact: {
      phone: '02-5555-7777',
      email: 'admissions@eliteprep.kr',
      website: 'www.eliteprep.kr',
    },
    strengths: ['GPA', 'SAT 점수', '전반적 프로필 개발'],
  },
  {
    id: '4',
    name: 'Bridge Education Center',
    location: '서울시 마포구',
    duration: '5개월',
    image: 'https://images.pexels.com/photos/1181625/pexels-photo-1181625.jpeg?auto=compress&cs=tinysrgb&w=400',
    specialties: ['영어 능력', '문화 적응', '인문학'],
    services: [
      '영어 능력 향상',
      '문화 오리엔테이션',
      '인문학 준비',
      '지역 봉사 프로젝트',
      '유학 준비',
      '재정 지원 안내',
    ],
    description: '국제 교육을 위한 문화 적응과 영어 능력 향상에 중점을 둔 종합 지원 서비스입니다.',
    contact: {
      phone: '02-3333-9999',
      email: 'info@bridgeedu.com',
      website: 'www.bridgeedu.com',
    },
    strengths: ['TOEFL 점수', '문화 적응', '인문학 준비'],
  },
];

const ConsultingPage: React.FC = () => {
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const popularTags = [
    'SAT 준비',
    '에세이 작성',
    '면접 코칭',
    'STEM 프로그램',
    '아이비리그 준비',
    '영어 능력',
    '리더십 개발',
    '연구 프로젝트',
    '장학금 지원',
    '문화 적응'
  ];

  const filteredPrograms = consultingPrograms.filter(program => {
    if (!searchTerm.trim() && selectedTags.length === 0) return true;

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm.trim() || (
      program.name.toLowerCase().includes(searchLower) ||
      program.location.toLowerCase().includes(searchLower) ||
      program.specialties.some(s => s.toLowerCase().includes(searchLower)) ||
      program.description.toLowerCase().includes(searchLower)
    );

    const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => {
      const tagLower = tag.toLowerCase();
      return (
        program.specialties.some(s => s.toLowerCase().includes(tagLower)) ||
        program.services.some(s => s.toLowerCase().includes(tagLower)) ||
        program.description.toLowerCase().includes(tagLower)
      );
    });

    return matchesSearch && matchesTags;
  });

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
  };

  const toggleProgramSelection = (programId: string) => {
    setSelectedPrograms(prev =>
      prev.includes(programId)
        ? prev.filter(id => id !== programId)
        : prev.length < 3 ? [...prev, programId] : prev
    );
  };

  return (
    <div className="consulting-page-container">
      <div className="consulting-content-wrapper">
        <div className="consulting-header">
          <h1 className="consulting-title">
            컨설팅 프로그램
          </h1>
          <p className="consulting-subtitle">
            프로필을 강화하고 목표 대학 입학 가능성을 높일 수 있는
            컨설팅 프로그램을 찾아보세요.
          </p>
        </div>

        <div className="consulting-notice-banner">
          <img
            src="https://images.pexels.com/photos/1181625/pexels-photo-1181625.jpeg?auto=compress&cs=tinysrgb&w=600"
            alt="입학 세미나"
            className="consulting-notice-image"
          />

          <div className="consulting-notice-content">
            <div>
              <div className="consulting-notice-badge">
                <span className="consulting-notice-badge-text">공지사항</span>
              </div>
              <h2 className="consulting-notice-title">
                MM/DD OO학원 입학 세미나
              </h2>
            </div>

            <button className="consulting-notice-button">
              <span className="consulting-notice-button-text">자세히 보기</span>
            </button>
          </div>
        </div>

        <div className="consulting-search-container">
          <div className="consulting-search-wrapper">
            <Search className="consulting-search-icon" />
            <input
              type="text"
              placeholder="학원명 또는 프로그램 태그로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="consulting-search-input"
            />
          </div>
        </div>

        <div className="consulting-tags-container">
          <div className="consulting-tags-header">
            <h3 className="consulting-tags-title">추천 태그</h3>
            {(selectedTags.length > 0 || searchTerm) && (
              <button
                onClick={clearAllFilters}
                className="consulting-tags-clear"
              >
                모든 필터 초기화
              </button>
            )}
          </div>

          <div className="consulting-tags-grid">
            {popularTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`consulting-tag ${selectedTags.includes(tag) ? 'active' : ''}`}
              >
                <span className="consulting-tag-text">{tag}</span>
              </button>
            ))}
          </div>

          {selectedTags.length > 0 && (
            <div className="consulting-selected-tags">
              <span className="consulting-selected-tags-label">선택된 태그:</span>
              <div className="consulting-selected-tags-list">
                {selectedTags.map(tag => (
                  <div key={tag} className="consulting-selected-tag">
                    <span className="consulting-selected-tag-text">{tag}</span>
                    <button
                      onClick={() => toggleTag(tag)}
                      className="consulting-selected-tag-remove"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="consulting-results-info">
          전체 {consultingPrograms.length}개 중 {filteredPrograms.length}개의 컨설팅 프로그램을 표시하고 있습니다
        </div>

        <div className="consulting-programs-list">
          {filteredPrograms.map(program => (
            <div
              key={program.id}
              className={`consulting-program-card ${selectedPrograms.includes(program.id) ? 'selected' : ''}`}
            >
              <img
                src={program.image}
                alt={program.name}
                className="consulting-program-image"
              />

              <div className="consulting-program-content">
                <div className="consulting-program-header">
                  <h3 className="consulting-program-name">{program.name}</h3>

                  <div className="consulting-program-location">
                    <MapPin className="consulting-program-location-icon" />
                    <span className="consulting-program-location-text">{program.location}</span>
                  </div>
                </div>

                <p className="consulting-program-description">{program.description}</p>

                <div className="consulting-program-specialties">
                  {program.specialties.map(specialty => (
                    <div key={specialty} className="consulting-specialty-tag">
                      <span className="consulting-specialty-tag-text">{specialty}</span>
                    </div>
                  ))}
                </div>

                <div className="consulting-program-footer">
                  <div className="consulting-program-contact">
                    <div className="consulting-program-contact-item">
                      <Phone className="consulting-program-contact-icon" />
                      <span className="consulting-program-contact-text">{program.contact.phone}</span>
                    </div>
                    <div className="consulting-program-contact-item">
                      <Mail className="consulting-program-contact-icon" />
                      <span className="consulting-program-contact-text">{program.contact.email}</span>
                    </div>
                  </div>

                  <div className="consulting-program-actions">
                    <button className="consulting-program-contact-button">
                      <span className="consulting-program-contact-button-text">문의하기</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPrograms.length === 0 && (
          <div className="consulting-empty-state">
            <Search className="consulting-empty-icon" />
            <p className="consulting-empty-message">
              {searchTerm || selectedTags.length > 0
                ? '검색 조건에 맞는 컨설팅 프로그램이 없습니다.'
                : '컨설팅 프로그램을 불러오는 중입니다...'}
            </p>
            {(searchTerm || selectedTags.length > 0) && (
              <button
                onClick={clearAllFilters}
                className="consulting-empty-button"
              >
                모든 필터 초기화
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultingPage;
