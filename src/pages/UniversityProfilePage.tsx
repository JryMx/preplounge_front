import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Users, DollarSign, BookOpen, Calendar, FileText, Award, ArrowLeft, Plus, BarChart3 } from 'lucide-react';
import './university-profile-page.css';

// Mock university data (in a real app, this would come from an API)
const getUniversityData = (id: string) => {
  const universities = {
    '1': {
      id: '1',
      name: '하버드 대학교',
      location: '메사추세츠 케임브리지',
      commonApp: true,
      tuition: 54269,
      acceptanceRate: 5.4,
      satRange: '1460-1570',
      actRange: '33-35',
      toeflMin: 100,
      image: 'https://images.pexels.com/photos/207684/pexels-photo-207684.jpeg?auto=compress&cs=tinysrgb&w=800',
      type: '사립',
      size: '중간 (6,700 undergraduates)',
      undergraduateEnrollment: 6700,
      institutionType: '4년제 사립',
      carnegieClassification: 'R1: 박사 학위 수여',
      region: '도시',
      founded: 1636,
      graduationRate: 97,
      averageEarnings: 95000,
      degreeTypes: ['학사', '석사', '박사'],
      availableMajors: [
        'Liberal Arts and Sciences',
        'Business Administration',
        'Computer Science',
        'Engineering',
        'Medicine',
        'Law',
        'Public Health',
        'Economics',
        'Psychology',
        'Biology',
        'Chemistry',
        'Physics',
        'Mathematics',
        'History',
        'English Literature',
        'Political Science',
        'Philosophy',
        'Art History',
        'Sociology',
        'Anthropology'
      ],
      applicationRequirements: {
        secondarySchoolGPA: 'Required',
        secondarySchoolRank: 'Not required but considered if submitted',
        secondarySchoolRecord: 'Required',
        collegePrepProgram: 'Not required but considered if submitted',
        recommendations: 'Required',
        extracurricularActivities: 'Not required but considered if submitted',
        personalStatement: 'Required',
        legacyStatus: 'Not required but considered if submitted',
        admissionTestScores: 'Required',
        englishProficiencyTest: 'Required',
      },
    },
    // Add more universities as needed
  };

  return universities[id as keyof typeof universities];
};

const UniversityProfilePage: React.FC = () => {
  const { id } = useParams();
  const university = getUniversityData(id || '1');

  if (!university) {
    return (
      <div className="university-profile-not-found">
        <div className="university-profile-not-found-content">
          <h2 className="university-profile-not-found-title">학교를 찾을 수 없습니다</h2>
          <Link to="/universities" className="university-profile-not-found-link">
            학교 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="university-profile-page">
      {/* Header */}
      <div className="university-profile-header">
        <div className="university-profile-header-container">
          <Link
            to="/universities"
            className="university-profile-back-link"
          >
            <ArrowLeft className="h-4 w-4" />
            학교 목록으로 돌아가기
          </Link>

          <div className="university-profile-hero">
            <img
              src={university.image}
              alt={university.name}
              className="university-profile-image"
            />

            <div className="university-profile-hero-content">
              <div className="university-profile-title-row">
                <h1 className="university-profile-title">
                  {university.name}
                </h1>
                <div className="university-profile-badges">
                  <span className={`university-profile-badge ${
                    university.commonApp ? 'commonapp' : 'no-commonapp'
                  }`}>
                    {university.commonApp ? 'Common App 지원 가능' : '학교별 지원서 필요'}
                  </span>
                  <button className="university-profile-compare-btn">
                    <Plus className="h-4 w-4" />
                    비교하기
                  </button>
                </div>
              </div>

              <div className="university-profile-location">
                <MapPin className="h-5 w-5" />
                <span>{university.location}</span>
                <span>•</span>
                <span>{university.type}</span>
              </div>

              {/* School Details */}
              <div className="university-profile-details-grid">
                <div className="university-profile-detail-item">
                  <span className="university-profile-detail-label">위치:</span>
                  <span className="university-profile-detail-value">{university.location}</span>
                </div>
                <div className="university-profile-detail-item">
                  <span className="university-profile-detail-label">학부 재학생 수:</span>
                  <span className="university-profile-detail-value">{university.undergraduateEnrollment.toLocaleString()}</span>
                </div>
                <div className="university-profile-detail-item">
                  <span className="university-profile-detail-label">기관 유형:</span>
                  <span className="university-profile-detail-value">{university.institutionType}</span>
                </div>
                <div className="university-profile-detail-item carnegie-classification-item">
                  <span className="university-profile-detail-label">카네기 분류:</span>
                  <span className="university-profile-detail-value">{university.carnegieClassification}</span>
                  <div className="carnegie-classification-tooltip">
                    카네기 분류(Carnegie Classification)는 미국 정부의 공식 고등교육기관 분류 체계로, 대학의 규모, 학위 수여 수준, 연구 활동 등을 기준으로 구분해 대학 비교·연구나 정책 수립에 널리 활용됩니다.
                  </div>
                </div>
                <div className="university-profile-detail-item">
                  <span className="university-profile-detail-label">지역:</span>
                  <span className="university-profile-detail-value">{university.region}</span>
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
          <div className="university-profile-stat-card">
            <div className="university-profile-stat-header">
              <Users className="h-5 w-5" style={{color: '#082F49'}} />
              <span className="university-profile-stat-label">합격률</span>
            </div>
            <div className="university-profile-stat-value">{university.acceptanceRate}%</div>
          </div>

          <div className="university-profile-stat-card">
            <div className="university-profile-stat-header">
              <DollarSign className="h-5 w-5" style={{color: '#082F49'}} />
              <span className="university-profile-stat-label">등록금</span>
            </div>
            <div className="university-profile-stat-value">
              ${university.tuition.toLocaleString()}
            </div>
          </div>

          <div className="university-profile-stat-card">
            <div className="university-profile-stat-header">
              <BookOpen className="h-5 w-5" style={{color: '#082F49'}} />
              <span className="university-profile-stat-label">SAT 범위</span>
            </div>
            <div className="university-profile-stat-value">{university.satRange}</div>
          </div>

          <div className="university-profile-stat-card">
            <div className="university-profile-stat-header">
              <BookOpen className="h-5 w-5" style={{color: '#082F49'}} />
              <span className="university-profile-stat-label">ACT 범위</span>
            </div>
            <div className="university-profile-stat-value">{university.actRange}</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="university-profile-main-grid">
          {/* Left Column */}
          <div>
            {/* Application Requirements */}
            <div className="university-profile-section">
              <h2 className="university-profile-section-title">
                <FileText className="h-6 w-6" style={{color: '#082F49'}} />
                지원 요건
              </h2>

              {/* Application Requirements List */}
              <div className="university-profile-requirements-list">
                {[
                  { key: 'secondarySchoolGPA', label: '고등학교 GPA' },
                  { key: 'secondarySchoolRank', label: '고등학교 석차' },
                  { key: 'secondarySchoolRecord', label: '고등학교 성적표' },
                  { key: 'collegePrepProgram', label: '대학 준비 프로그램 이수' },
                  { key: 'recommendations', label: '추천서' },
                  { key: 'extracurricularActivities', label: '과외활동' },
                  { key: 'personalStatement', label: '자기소개서/에세이' },
                  { key: 'legacyStatus', label: '동문 자녀 여부' },
                  { key: 'admissionTestScores', label: '입학 시험 점수' },
                  { key: 'englishProficiencyTest', label: '영어 능력 시험' },
                ].map((item) => {
                  const status = university.applicationRequirements[item.key as keyof typeof university.applicationRequirements];
                  const getStatusClass = (status: string) => {
                    switch (status) {
                      case 'Required':
                        return 'required';
                      case 'Not required but considered if submitted':
                        return 'recommended';
                      case 'Not considered':
                        return 'not-considered';
                      default:
                        return 'not-considered';
                    }
                  };

                  const getStatusText = (status: string) => {
                    switch (status) {
                      case 'Required':
                        return '필수';
                      case 'Not required but considered if submitted':
                        return '선택 (제출 시 고려)';
                      case 'Not considered':
                        return '고려되지 않음';
                      default:
                        return status;
                    }
                  };

                  return (
                    <div key={item.key} className="university-profile-requirement-item">
                      <span className="university-profile-requirement-label">{item.label}</span>
                      <span className={`university-profile-requirement-status ${getStatusClass(status as string)}`}>
                        {getStatusText(status as string)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Supplemental Essay Notice */}
              <div className="university-profile-notice">
                <strong>참고:</strong> 학교에서는 자기소개서 외에 추가 에세이를 요구할 수 있습니다.
                구체적인 에세이 요건과 주제는 해당 학교의 입학처에서 확인하시기 바랍니다.
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="university-profile-sidebar">
            {/* Academic Information */}
            <div className="university-profile-section">
              <h2 className="university-profile-section-title">학업 정보</h2>

              <div>
                {/* Graduation Rate */}
                <div className="university-profile-info-item">
                  <span className="university-profile-info-label">졸업률</span>
                  <span className="university-profile-info-value success">{university.graduationRate}%</span>
                </div>

                {/* Average Earnings */}
                <div className="university-profile-info-item" style={{flexDirection: 'column', alignItems: 'flex-start'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center'}}>
                    <span className="university-profile-info-label">졸업 후 평균 연봉</span>
                    <span className="university-profile-info-value primary">${university.averageEarnings.toLocaleString()}</span>
                  </div>
                  <div className="college-scorecard-reference">
                    출처: College Scorecard
                  </div>
                </div>

                {/* Degree Types */}
                <div className="university-profile-info-item">
                  <span className="university-profile-info-label">제공 학위 유형</span>
                </div>
                <div className="university-profile-degree-tags">
                  {university.degreeTypes.map((degree, index) => (
                    <span key={index} className="university-profile-degree-tag">
                      {degree === "Bachelor's" ? '학사' :
                       degree === "Master's" ? '석사' :
                       degree === 'Doctoral' ? '박사' :
                       degree === 'Professional' ? '전문학위' : degree}
                    </span>
                  ))}
                </div>

                {/* Available Majors */}
                <div className="university-profile-info-item">
                  <span className="university-profile-info-label">개설 전공</span>
                </div>
                <div className="university-profile-majors-list">
                  {university.availableMajors.map((major, index) => (
                    <div key={index} className="university-profile-major-item">
                      {major === 'Liberal Arts and Sciences' ? '인문과학' :
                       major === 'Business Administration' ? '경영학' :
                       major === 'Computer Science' ? '컴퓨터과학' :
                       major === 'Engineering' ? '공학' :
                       major === 'Medicine' ? '의학' :
                       major === 'Law' ? '법학' :
                       major === 'Public Health' ? '보건학' :
                       major === 'Economics' ? '경제학' :
                       major === 'Psychology' ? '심리학' :
                       major === 'Biology' ? '생물학' :
                       major === 'Chemistry' ? '화학' :
                       major === 'Physics' ? '물리학' :
                       major === 'Mathematics' ? '수학' :
                       major === 'History' ? '역사학' :
                       major === 'English Literature' ? '영문학' :
                       major === 'Political Science' ? '정치학' :
                       major === 'Philosophy' ? '철학' :
                       major === 'Art History' ? '미술사' :
                       major === 'Sociology' ? '사회학' :
                       major === 'Anthropology' ? '인류학' : major}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="university-profile-section">
              <Link
                to="/student-profile"
                className="profile-calculator-button"
                style={{marginBottom: '12px', display: 'flex'}}
              >
                <BarChart3 className="h-4 w-4" />
                <span className="profile-calculator-button-text">합격 가능성 확인하기</span>
              </Link>
              <button className="university-profile-compare-btn" style={{width: '100%', justifyContent: 'center'}}>
                <Plus className="h-4 w-4" />
                비교 목록에 추가
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniversityProfilePage;