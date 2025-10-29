import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Users, DollarSign, BookOpen, ArrowLeft, Plus } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import universitiesData from '../data/universities.json';
import './university-profile-page.css';

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

const universities: University[] = universitiesData as University[];

const getUniversityData = (id: string) => {
  return universities.find(uni => uni.id === id);
};

const translateSize = (size: string, language: 'ko' | 'en'): string => {
  if (language === 'ko') return size;
  
  if (size === '큼 (15,000+)') return 'Large (15,000+)';
  if (size === '중간 (5,000-15,000)') return 'Medium (5,000-15,000)';
  if (size === '작음 (<5,000)') return 'Small (<5,000)';
  
  return size;
};

const UniversityProfilePage: React.FC = () => {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const university = getUniversityData(id || '1');

  if (!university) {
    return (
      <div className="university-profile-not-found">
        <div className="university-profile-not-found-content">
          <h2 className="university-profile-not-found-title">{t('university.notfound.title')}</h2>
          <Link to="/universities" className="university-profile-not-found-link">
            {t('university.notfound.back')}
          </Link>
        </div>
      </div>
    );
  }

  const universityName = language === 'ko' ? university.name : university.englishName;
  const alternativeName = language === 'ko' ? university.englishName : university.name;

  return (
    <div className="university-profile-page">
      {/* Header */}
      <div className="university-profile-header">
        <div className="university-profile-header-container">
          <Link
            to="/universities"
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
            />

            <div className="university-profile-hero-content">
              <div className="university-profile-title-row">
                <h1 className="university-profile-title" data-testid="text-university-name">
                  {universityName}
                </h1>
                <div className="university-profile-badges">
                  <span className="university-profile-badge commonapp" data-testid="badge-commonapp">
                    {t('university.commonapp.yes')}
                  </span>
                  <button className="university-profile-compare-btn" data-testid="button-compare">
                    <Plus className="h-4 w-4" />
                    {t('university.compare')}
                  </button>
                </div>
              </div>

              <div className="university-profile-location" data-testid="text-location">
                <MapPin className="h-5 w-5" />
                <span>{university.location}</span>
                <span>•</span>
                <span>{university.type === '공립' ? (language === 'ko' ? '공립' : 'Public') : (language === 'ko' ? '사립' : 'Private')}</span>
              </div>

              {/* School Details */}
              <div className="university-profile-details-grid">
                <div className="university-profile-detail-item">
                  <span className="university-profile-detail-label">{t('university.location')}:</span>
                  <span className="university-profile-detail-value">{university.location}</span>
                </div>
                <div className="university-profile-detail-item">
                  <span className="university-profile-detail-label">{t('university.type')}:</span>
                  <span className="university-profile-detail-value">{university.type === '공립' ? (language === 'ko' ? '공립' : 'Public') : (language === 'ko' ? '사립' : 'Private')}</span>
                </div>
                <div className="university-profile-detail-item">
                  <span className="university-profile-detail-label">{t('university.size')}:</span>
                  <span className="university-profile-detail-value">{translateSize(university.size, language)}</span>
                </div>
              </div>
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
              <div className="requirement-item">
                <span className="requirement-name">{language === 'ko' ? '고등학교 GPA' : 'High School GPA'}</span>
                <span className="requirement-badge required" data-testid="badge-gpa-required">
                  {language === 'ko' ? '필수' : 'Required'}
                </span>
              </div>
              <div className="requirement-item">
                <span className="requirement-name">{language === 'ko' ? '고등학교 석차' : 'High School Rank'}</span>
                <span className="requirement-badge optional" data-testid="badge-rank-optional">
                  {language === 'ko' ? '선택 (예외 시 고려)' : 'Optional (Considered in exceptions)'}
                </span>
              </div>
              <div className="requirement-item">
                <span className="requirement-name">{language === 'ko' ? '고등학교 성적표' : 'High School Transcript'}</span>
                <span className="requirement-badge required" data-testid="badge-transcript-required">
                  {language === 'ko' ? '필수' : 'Required'}
                </span>
              </div>
              <div className="requirement-item">
                <span className="requirement-name">{language === 'ko' ? '대학 준비 프로그램 이수' : 'College Prep Program Completion'}</span>
                <span className="requirement-badge optional" data-testid="badge-prep-optional">
                  {language === 'ko' ? '선택 (예외 시 고려)' : 'Optional (Considered in exceptions)'}
                </span>
              </div>
              <div className="requirement-item">
                <span className="requirement-name">{language === 'ko' ? '추천서' : 'Recommendation'}</span>
                <span className="requirement-badge required" data-testid="badge-recommendation-required">
                  {language === 'ko' ? '필수' : 'Required'}
                </span>
              </div>
              <div className="requirement-item">
                <span className="requirement-name">{language === 'ko' ? '과외활동' : 'Extracurricular Activities'}</span>
                <span className="requirement-badge optional" data-testid="badge-extracurricular-optional">
                  {language === 'ko' ? '선택 (예외 시 고려)' : 'Optional (Considered in exceptions)'}
                </span>
              </div>
              <div className="requirement-item">
                <span className="requirement-name">{language === 'ko' ? '자기소개서/에세이' : 'Personal Statement/Essay'}</span>
                <span className="requirement-badge required" data-testid="badge-essay-required">
                  {language === 'ko' ? '필수' : 'Required'}
                </span>
              </div>
              <div className="requirement-item">
                <span className="requirement-name">{language === 'ko' ? '등록 자녀 여부' : 'Legacy Status'}</span>
                <span className="requirement-badge optional" data-testid="badge-legacy-optional">
                  {language === 'ko' ? '선택 (예외 시 고려)' : 'Optional (Considered in exceptions)'}
                </span>
              </div>
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
              <div className="academic-info-item">
                <span className="academic-info-label">{language === 'ko' ? '졸업률' : 'Graduation Rate'}</span>
                <span className="academic-info-value graduation-rate" data-testid="text-graduation-rate">97%</span>
              </div>

              {/* Average Salary */}
              <div className="academic-info-item">
                <span className="academic-info-label">{language === 'ko' ? '졸업 후 평균 연봉' : 'Average Salary After Graduation'}</span>
                <div className="academic-info-value-wrapper">
                  <span className="academic-info-value" data-testid="text-average-salary">$95,000</span>
                  <span className="academic-info-source">
                    {language === 'ko' ? '출처: College Scorecard' : 'Source: College Scorecard'}
                  </span>
                </div>
              </div>

              {/* Degree Types */}
              <div className="academic-info-item">
                <span className="academic-info-label">{language === 'ko' ? '제공 학위 유형' : 'Degree Types Offered'}</span>
                <div className="degree-types" data-testid="section-degree-types">
                  <span className="degree-badge">{language === 'ko' ? '학사' : 'Bachelor\'s'}</span>
                  <span className="degree-badge">{language === 'ko' ? '석사' : 'Master\'s'}</span>
                  <span className="degree-badge">{language === 'ko' ? '박사' : 'Doctoral'}</span>
                </div>
              </div>

              {/* Available Majors */}
              <div className="academic-info-item">
                <span className="academic-info-label">{language === 'ko' ? '개설 전공' : 'Available Majors'}</span>
                <div className="majors-list" data-testid="section-majors">
                  <div className="major-item">{language === 'ko' ? '인문과학' : 'Humanities'}</div>
                  <div className="major-item">{language === 'ko' ? '경영학' : 'Business'}</div>
                  <div className="major-item">{language === 'ko' ? '컴퓨터과학' : 'Computer Science'}</div>
                  <div className="major-item">{language === 'ko' ? '공학' : 'Engineering'}</div>
                  <div className="major-item">{language === 'ko' ? '의학' : 'Medicine'}</div>
                  <div className="major-item">{language === 'ko' ? '법학' : 'Law'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversityProfilePage;
