import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Phone, Mail, Search, Globe, Instagram, FileText } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import consultingCompaniesData from '../data/consultingCompanies.json';
import { translateConsulting } from '../utils/consultingTranslations';
import './consulting-page.css';

interface ConsultingCompany {
  id: string;
  name: string;
  location: string;
  specialties: string[];
  tags: string[];
  contact: {
    phone: string;
    email: string;
    website: string;
    instagram?: string;
    blog?: string;
    youtube?: string;
  };
  notes?: string;
}

const consultingCompanies: ConsultingCompany[] = consultingCompaniesData as ConsultingCompany[];

const ConsultingPage: React.FC = () => {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(10);

  const filteredCompanies = consultingCompanies.filter(company => {
    if (!searchTerm.trim()) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      company.name.toLowerCase().includes(searchLower) ||
      company.location.toLowerCase().includes(searchLower) ||
      company.specialties.some(s => s.toLowerCase().includes(searchLower)) ||
      company.tags.some(t => t.toLowerCase().includes(searchLower))
    );
  });

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(10);
  }, [searchTerm]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (visibleCount >= filteredCompanies.length) return;

    const scrollPosition = window.innerHeight + window.scrollY;
    const bottomPosition = document.documentElement.scrollHeight - 300;

    if (scrollPosition >= bottomPosition) {
      setVisibleCount(prev => Math.min(prev + 10, filteredCompanies.length));
    }
  }, [visibleCount, filteredCompanies.length]);

  // Add scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const visibleCompanies = filteredCompanies.slice(0, visibleCount);
  const allDisplayed = visibleCount >= filteredCompanies.length;

  return (
    <div className="consulting-page-container">
      <div className="consulting-content-wrapper">
        <div className="consulting-header">
          <h1 className="consulting-title">
            {language === 'ko' ? '컨설팅 프로그램' : 'Consulting Programs'}
          </h1>
          <p className="consulting-subtitle">
            {language === 'ko' 
              ? '프로필을 강화하고 목표 대학 입학 가능성을 높일 수 있는 컨설팅 프로그램을 찾아보세요.'
              : 'Find consulting programs to strengthen your profile and increase admission chances to your target universities.'}
          </p>
        </div>

        <div className="consulting-search-container">
          <div className="consulting-search-wrapper">
            <Search className="consulting-search-icon" />
            <input
              type="text"
              placeholder={language === 'ko' ? '학원명 또는 프로그램 태그로 검색...' : 'Search by name or tag...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="consulting-search-input"
            />
          </div>
        </div>

        <div className="consulting-results-info">
          {language === 'ko' 
            ? `전체 ${consultingCompanies.length}개 중 ${Math.min(visibleCount, filteredCompanies.length)}개의 컨설팅 프로그램을 표시하고 있습니다`
            : `Showing ${Math.min(visibleCount, filteredCompanies.length)} of ${consultingCompanies.length} consulting programs`}
        </div>

        <div className="consulting-programs-list">
          {visibleCompanies.map(company => (
            <div
              key={company.id}
              className="consulting-program-card"
            >
              <div className="consulting-program-content">
                <div className="consulting-program-header">
                  <h3 className="consulting-program-name">{company.name}</h3>

                  <div className="consulting-program-location">
                    <MapPin className="consulting-program-location-icon" />
                    <span className="consulting-program-location-text">{company.location}</span>
                  </div>
                </div>

                {(company.specialties.length > 0 || company.tags.length > 0) && (
                  <div className="consulting-program-specialties">
                    <span className="consulting-specialties-title">
                      {language === 'ko' ? '전문 분야: ' : 'Specialties: '}
                    </span>
                    <div className="consulting-specialties-tags">
                      {company.specialties.map(specialty => (
                        <div key={specialty} className="consulting-specialty-tag">
                          <span className="consulting-specialty-tag-text">{translateConsulting(specialty, language)}</span>
                        </div>
                      ))}
                      {company.tags.map(tag => (
                        <div key={tag} className="consulting-specialty-tag">
                          <span className="consulting-specialty-tag-text">{translateConsulting(tag, language)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="consulting-program-footer">
                  <div className="consulting-program-contact">
                    {company.contact.phone && (
                      <div className="consulting-program-contact-item">
                        <Phone className="consulting-program-contact-icon" />
                        <span className="consulting-program-contact-text">{company.contact.phone}</span>
                      </div>
                    )}
                    {company.contact.email && (
                      <div className="consulting-program-contact-item">
                        <Mail className="consulting-program-contact-icon" />
                        <span className="consulting-program-contact-text">{company.contact.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="consulting-program-links">
                    {company.contact.website && (
                      <a
                        href={company.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="consulting-link-button"
                        title={language === 'ko' ? '웹사이트' : 'Website'}
                      >
                        <Globe className="consulting-link-icon" />
                      </a>
                    )}
                    {company.contact.instagram && (
                      <a
                        href={company.contact.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="consulting-link-button"
                        title="Instagram"
                      >
                        <Instagram className="consulting-link-icon" />
                      </a>
                    )}
                    {company.contact.blog && (
                      <a
                        href={company.contact.blog}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="consulting-link-button"
                        title={language === 'ko' ? '블로그' : 'Blog'}
                      >
                        <FileText className="consulting-link-icon" />
                      </a>
                    )}
                  </div>
                </div>

                {company.notes && (
                  <div className="consulting-program-notes">
                    <p className="consulting-notes-text">
                      <strong>{language === 'ko' ? '비고:' : 'Note:'}</strong> {company.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {allDisplayed && filteredCompanies.length > 0 && (
          <div className="consulting-all-displayed">
            <p className="consulting-all-displayed-text">
              {language === 'ko' 
                ? '모든 컨설팅 프로그램을 표시했습니다'
                : 'All consulting programs displayed'}
            </p>
          </div>
        )}

        {filteredCompanies.length === 0 && (
          <div className="consulting-empty-state">
            <Search className="consulting-empty-icon" />
            <p className="consulting-empty-message">
              {searchTerm
                ? (language === 'ko' 
                    ? '검색 조건에 맞는 컨설팅 프로그램이 없습니다.'
                    : 'No consulting programs match your search criteria.')
                : (language === 'ko' 
                    ? '컨설팅 프로그램을 불러오는 중입니다...'
                    : 'Loading consulting programs...')}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="consulting-empty-button"
              >
                {language === 'ko' ? '검색 초기화' : 'Clear Search'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultingPage;
