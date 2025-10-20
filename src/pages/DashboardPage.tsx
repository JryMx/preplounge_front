import React from 'react';
import { Link } from 'react-router-dom';
import { Target, TrendingUp, AlertCircle, BookOpen, Users, Award, ArrowRight, BarChart3 } from 'lucide-react';
import { useStudentProfile } from '../context/StudentProfileContext';
import { useAuth } from '../context/AuthContext';
import './dashboard-page.css';

// Mock university data for recommendations
const universityData = {
  '1': { name: 'Harvard University', ranking: 2, acceptanceRate: 5.4, image: 'https://images.pexels.com/photos/207684/pexels-photo-207684.jpeg?auto=compress&cs=tinysrgb&w=400' },
  '2': { name: 'Stanford University', ranking: 3, acceptanceRate: 4.8, image: 'https://images.pexels.com/photos/1454360/pexels-photo-1454360.jpeg?auto=compress&cs=tinysrgb&w=400' },
  '3': { name: 'MIT', ranking: 4, acceptanceRate: 7.3, image: 'https://images.pexels.com/photos/1454360/pexels-photo-1454360.jpeg?auto=compress&cs=tinysrgb&w=400' },
  '4': { name: 'UC Berkeley', ranking: 22, acceptanceRate: 17.5, image: 'https://images.pexels.com/photos/1454360/pexels-photo-1454360.jpeg?auto=compress&cs=tinysrgb&w=400' },
  '5': { name: 'NYU', ranking: 28, acceptanceRate: 21.1, image: 'https://images.pexels.com/photos/1454360/pexels-photo-1454360.jpeg?auto=compress&cs=tinysrgb&w=400' },
  '6': { name: 'Penn State', ranking: 63, acceptanceRate: 76.0, image: 'https://images.pexels.com/photos/1454360/pexels-photo-1454360.jpeg?auto=compress&cs=tinysrgb&w=400' },
};

const DashboardPage: React.FC = () => {
  const { profile, getRecommendations } = useStudentProfile();
  const { user } = useAuth();

  if (!profile || !user) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="dashboard-empty-state">
            <div className="dashboard-empty-icon">
              <BarChart3 className="h-10 w-10" style={{ color: '#F59E0B' }} />
            </div>
            <h2 className="dashboard-empty-title">프로필을 완성해주세요</h2>
            <p className="dashboard-empty-desc">
              맞춤형 대학 추천을 보려면 먼저 학업 프로필을 완성해주세요.
            </p>
            <Link to="/student-profile" className="dashboard-empty-button">
              프로필 분석 시작하기
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const recommendations = getRecommendations();
  const safetySchools = recommendations.filter(r => r.category === 'safety');
  const targetSchools = recommendations.filter(r => r.category === 'target');
  const reachSchools = recommendations.filter(r => r.category === 'reach');

  const profileStrength = () => {
    const factors = [
      profile.gpa >= 3.7,
      profile.satScore >= 1400 || profile.actScore >= 30,
      profile.extracurriculars.length >= 3,
      profile.leadership.length >= 1,
      profile.awards.length >= 1,
      profile.apCourses >= 3,
    ];
    return Math.round((factors.filter(Boolean).length / factors.length) * 100);
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-welcome">
            다시 오신 것을 환영합니다, {user.name}님!
          </h1>
          <p className="dashboard-subtitle">
            맞춤형 대학 입학 분석 및 추천 결과입니다.
          </p>
        </div>

        <div className="dashboard-stats-grid">
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-info">
              <span className="dashboard-stat-label">프로필 점수</span>
              <span className="dashboard-stat-value" style={{ color: '#3B82F6' }}>{profileStrength()}%</span>
            </div>
            <div className="dashboard-stat-icon" style={{ background: '#DBEAFE' }}>
              <BarChart3 className="h-7 w-7" style={{ color: '#3B82F6' }} />
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="dashboard-stat-info">
              <span className="dashboard-stat-label">GPA</span>
              <span className="dashboard-stat-value" style={{ color: '#10B981' }}>{profile.gpa}</span>
            </div>
            <div className="dashboard-stat-icon" style={{ background: '#DCFCE7' }}>
              <BookOpen className="h-7 w-7" style={{ color: '#10B981' }} />
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="dashboard-stat-info">
              <span className="dashboard-stat-label">SAT Score</span>
              <span className="dashboard-stat-value" style={{ color: '#F59E0B' }}>{profile.satScore || 'N/A'}</span>
            </div>
            <div className="dashboard-stat-icon" style={{ background: '#FFFBEB' }}>
              <Target className="h-7 w-7" style={{ color: '#F59E0B' }} />
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="dashboard-stat-info">
              <span className="dashboard-stat-label">활동</span>
              <span className="dashboard-stat-value" style={{ color: '#8B5CF6' }}>{profile.extracurriculars.length}</span>
            </div>
            <div className="dashboard-stat-icon" style={{ background: '#EDE9FE' }}>
              <Users className="h-7 w-7" style={{ color: '#8B5CF6' }} />
            </div>
          </div>
        </div>

        <div className="dashboard-main-content">
          <div className="dashboard-recommendations">
            <h2 className="dashboard-section-title">학교 추천</h2>

            <div className="dashboard-category">
              <div className="dashboard-category-header">
                <div className="dashboard-category-icon" style={{ background: '#DCFCE7' }}>
                  <Target className="h-5 w-5" style={{ color: '#10B981' }} />
                </div>
                <h3 className="dashboard-category-title">안전권 학교</h3>
                <span className="dashboard-category-badge" style={{ background: '#DCFCE7', color: '#10B981' }}>합격 가능성 높음</span>
              </div>
              <div className="dashboard-schools-list">
                {safetySchools.map(rec => {
                  const uni = universityData[rec.universityId as keyof typeof universityData];
                  return (
                    <div key={rec.universityId} className="dashboard-school-card" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
                      <div className="dashboard-school-content">
                        <div className="dashboard-school-left">
                          <img src={uni.image} alt={uni.name} className="dashboard-school-image" />
                          <div className="dashboard-school-info">
                            <h4 className="dashboard-school-name">{uni.name}</h4>
                            <p className="dashboard-school-meta">#{uni.ranking} • {uni.acceptanceRate}% acceptance</p>
                          </div>
                        </div>
                        <div className="dashboard-school-right">
                          <p className="dashboard-school-chance" style={{ color: '#10B981' }}>{rec.admissionChance}%</p>
                          <p className="dashboard-school-chance-label">합격 가능성</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="dashboard-category">
              <div className="dashboard-category-header">
                <div className="dashboard-category-icon" style={{ background: '#FFFBEB' }}>
                  <Target className="h-5 w-5" style={{ color: '#F59E0B' }} />
                </div>
                <h3 className="dashboard-category-title">적정권 학교</h3>
                <span className="dashboard-category-badge" style={{ background: '#FFFBEB', color: '#F59E0B' }}>적합함</span>
              </div>
              <div className="dashboard-schools-list">
                {targetSchools.map(rec => {
                  const uni = universityData[rec.universityId as keyof typeof universityData];
                  return (
                    <div key={rec.universityId} className="dashboard-school-card" style={{ background: '#FFFBEB', borderColor: '#FACC15' }}>
                      <div className="dashboard-school-content">
                        <div className="dashboard-school-left">
                          <img src={uni.image} alt={uni.name} className="dashboard-school-image" />
                          <div className="dashboard-school-info">
                            <h4 className="dashboard-school-name">{uni.name}</h4>
                            <p className="dashboard-school-meta">#{uni.ranking} • {uni.acceptanceRate}% acceptance</p>
                          </div>
                        </div>
                        <div className="dashboard-school-right">
                          <p className="dashboard-school-chance" style={{ color: '#F59E0B' }}>{rec.admissionChance}%</p>
                          <p className="dashboard-school-chance-label">합격 가능성</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="dashboard-category">
              <div className="dashboard-category-header">
                <div className="dashboard-category-icon" style={{ background: '#DBEAFE' }}>
                  <TrendingUp className="h-5 w-5" style={{ color: '#3B82F6' }} />
                </div>
                <h3 className="dashboard-category-title">도전권 학교</h3>
                <span className="dashboard-category-badge" style={{ background: '#DBEAFE', color: '#3B82F6' }}>도전 목표</span>
              </div>
              <div className="dashboard-schools-list">
                {reachSchools.map(rec => {
                  const uni = universityData[rec.universityId as keyof typeof universityData];
                  return (
                    <div key={rec.universityId} className="dashboard-school-card" style={{ background: '#EFF6FF', borderColor: '#93C5FD' }}>
                      <div className="dashboard-school-content">
                        <div className="dashboard-school-left">
                          <img src={uni.image} alt={uni.name} className="dashboard-school-image" />
                          <div className="dashboard-school-info">
                            <h4 className="dashboard-school-name">{uni.name}</h4>
                            <p className="dashboard-school-meta">#{uni.ranking} • {uni.acceptanceRate}% acceptance</p>
                            {rec.strengthenAreas.length > 0 && (
                              <div className="dashboard-school-warning" style={{ color: '#F59E0B' }}>
                                <AlertCircle className="h-4 w-4" />
                                <span>강화 필요: {rec.strengthenAreas.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="dashboard-school-right">
                          <p className="dashboard-school-chance" style={{ color: '#3B82F6' }}>{rec.admissionChance}%</p>
                          <p className="dashboard-school-chance-label">합격 가능성</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="dashboard-sidebar">
            <div className="dashboard-sidebar-card">
              <h2 className="dashboard-sidebar-title">프로필 요약</h2>

              <div>
                <div className="dashboard-profile-item">
                  <span className="dashboard-profile-label">희망 전공:</span>
                  <span className="dashboard-profile-value">{profile.intendedMajor || '미정'}</span>
                </div>

                <div className="dashboard-profile-item">
                  <span className="dashboard-profile-label">GPA:</span>
                  <span className="dashboard-profile-value">{profile.gpa}/4.0</span>
                </div>

                <div className="dashboard-profile-item">
                  <span className="dashboard-profile-label">SAT:</span>
                  <span className="dashboard-profile-value">{profile.satScore || '미응시'}</span>
                </div>

                <div className="dashboard-profile-item">
                  <span className="dashboard-profile-label">ACT:</span>
                  <span className="dashboard-profile-value">{profile.actScore || '미응시'}</span>
                </div>

                <div className="dashboard-profile-item">
                  <span className="dashboard-profile-label">TOEFL:</span>
                  <span className="dashboard-profile-value">{profile.toeflScore || '미응시'}</span>
                </div>

                <div className="dashboard-profile-item">
                  <span className="dashboard-profile-label">AP 과목:</span>
                  <span className="dashboard-profile-value">{profile.apCourses || 0}</span>
                </div>

                <div className="dashboard-profile-item">
                  <span className="dashboard-profile-label">활동:</span>
                  <span className="dashboard-profile-value">{profile.extracurriculars.length}</span>
                </div>

                <div className="dashboard-profile-item">
                  <span className="dashboard-profile-label">리더십:</span>
                  <span className="dashboard-profile-value">{profile.leadership.length}</span>
                </div>
              </div>
            </div>

            <div className="dashboard-sidebar-card">
              <h2 className="dashboard-sidebar-title">강화가 필요한 영역</h2>

              <div className="dashboard-improvement-list">
                {reachSchools.length > 0 && reachSchools[0].strengthenAreas.map((area, index) => (
                  <div key={index} className="dashboard-improvement-item" style={{ background: '#FFFBEB', border: '1px solid #FACC15' }}>
                    <AlertCircle className="h-5 w-5 dashboard-improvement-icon" style={{ color: '#F59E0B' }} />
                    <div className="dashboard-improvement-content">
                      <p className="dashboard-improvement-title" style={{ color: '#D97706' }}>{area}</p>
                      <p className="dashboard-improvement-desc" style={{ color: '#D97706' }}>
                        합격 가능성을 높이기 위해 이 영역을 개선하는 데 집중하세요.
                      </p>
                    </div>
                  </div>
                ))}

                {(!reachSchools.length || !reachSchools[0].strengthenAreas.length) && (
                  <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <div className="dashboard-success-icon">
                      <Award className="h-12 w-12" style={{ color: '#10B981' }} />
                    </div>
                    <p className="dashboard-success-text">훌륭합니다! 모든 영역에서 프로필이 강력해 보입니다.</p>
                  </div>
                )}
              </div>

              <Link to="/consulting" className="dashboard-action-button primary">
                컨설팅 프로그램 찾기
              </Link>
            </div>

            <div className="dashboard-sidebar-card">
              <h2 className="dashboard-sidebar-title">빠른 실행</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link to="/universities" className="dashboard-action-button secondary">
                  더 많은 대학교 둘러보기
                </Link>

                <Link to="/universities/compare" className="dashboard-action-button secondary">
                  학교 비교하기
                </Link>

                <Link to="/student-profile" className="dashboard-action-button secondary">
                  프로필 업데이트
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;