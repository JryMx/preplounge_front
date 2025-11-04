import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Target, TrendingUp, AlertCircle, BookOpen, Users, Award, ArrowRight, BarChart3 } from 'lucide-react';
import { useStudentProfile } from '../context/StudentProfileContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './dashboard-page.css';

interface University {
  id: string;
  name: string;
  name_ko?: string;
  state?: string;
  acceptance_rate?: number;
  logo_url?: string;
}

const DashboardPage: React.FC = () => {
  const { profile, getRecommendations } = useStudentProfile();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [universities, setUniversities] = useState<Record<string, University>>({});

  // Load university data
  useEffect(() => {
    import('../data/universities.json')
      .then((data) => {
        const uniMap: Record<string, University> = {};
        data.default.forEach((uni: University) => {
          uniMap[uni.id] = uni;
        });
        setUniversities(uniMap);
      })
      .catch((error) => {
        console.error('Failed to load universities:', error);
      });
  }, []);

  // Calculate total SAT score
  const getSatScore = () => {
    if (!profile) return 0;
    return (profile.satEBRW || 0) + (profile.satMath || 0);
  };

  if (!profile || !user) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="dashboard-empty-state">
            <div className="dashboard-empty-icon">
              <BarChart3 className="h-10 w-10" style={{ color: '#F59E0B' }} />
            </div>
            <h2 className="dashboard-empty-title">{t('dashboard.empty.title')}</h2>
            <p className="dashboard-empty-desc">
              {t('dashboard.empty.desc')}
            </p>
            <Link to="/student-profile" className="dashboard-empty-button">
              {t('dashboard.empty.button')}
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
    const satScore = getSatScore();
    const factors = [
      profile.gpa >= 3.7,
      satScore >= 1400 || profile.actScore >= 30,
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
            {t('dashboard.welcome')}, {user.name}!
          </h1>
          <p className="dashboard-subtitle">
            {t('dashboard.subtitle')}
          </p>
        </div>

        <div className="dashboard-stats-grid">
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-info">
              <span className="dashboard-stat-label">{t('dashboard.stat.profile')}</span>
              <span className="dashboard-stat-value" style={{ color: '#3B82F6' }}>{profileStrength()}%</span>
            </div>
            <div className="dashboard-stat-icon" style={{ background: '#DBEAFE' }}>
              <BarChart3 className="h-7 w-7" style={{ color: '#3B82F6' }} />
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="dashboard-stat-info">
              <span className="dashboard-stat-label">{t('dashboard.stat.gpa')}</span>
              <span className="dashboard-stat-value" style={{ color: '#10B981' }}>{profile.gpa}</span>
            </div>
            <div className="dashboard-stat-icon" style={{ background: '#DCFCE7' }}>
              <BookOpen className="h-7 w-7" style={{ color: '#10B981' }} />
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="dashboard-stat-info">
              <span className="dashboard-stat-label">{t('dashboard.stat.sat')}</span>
              <span className="dashboard-stat-value" style={{ color: '#F59E0B' }}>{getSatScore() || t('dashboard.notavailable')}</span>
            </div>
            <div className="dashboard-stat-icon" style={{ background: '#FFFBEB' }}>
              <Target className="h-7 w-7" style={{ color: '#F59E0B' }} />
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="dashboard-stat-info">
              <span className="dashboard-stat-label">{t('dashboard.stat.activities')}</span>
              <span className="dashboard-stat-value" style={{ color: '#8B5CF6' }}>{profile.extracurriculars.length}</span>
            </div>
            <div className="dashboard-stat-icon" style={{ background: '#EDE9FE' }}>
              <Users className="h-7 w-7" style={{ color: '#8B5CF6' }} />
            </div>
          </div>
        </div>

        <div className="dashboard-main-content">
          <div className="dashboard-recommendations">
            <h2 className="dashboard-section-title">{t('dashboard.recommendations.title')}</h2>

            <div className="dashboard-category">
              <div className="dashboard-category-header">
                <div className="dashboard-category-icon" style={{ background: '#DCFCE7' }}>
                  <Target className="h-5 w-5" style={{ color: '#10B981' }} />
                </div>
                <h3 className="dashboard-category-title">{t('dashboard.category.safety')}</h3>
                <span className="dashboard-category-badge" style={{ background: '#DCFCE7', color: '#10B981' }}>{t('dashboard.badge.high')}</span>
              </div>
              <div className="dashboard-schools-list">
                {safetySchools.slice(0, 3).map(rec => {
                  const uni = universities[rec.universityId];
                  if (!uni) return null;
                  
                  const displayName = language === 'ko' && uni.name_ko ? uni.name_ko : uni.name;
                  
                  return (
                    <div key={rec.universityId} className="dashboard-school-card" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
                      <div className="dashboard-school-content">
                        <div className="dashboard-school-left">
                          {uni.logo_url && (
                            <img src={uni.logo_url} alt={displayName} className="dashboard-school-image" />
                          )}
                          <div className="dashboard-school-info">
                            <h4 className="dashboard-school-name">{displayName}</h4>
                            <p className="dashboard-school-meta">
                              {uni.state || ''} 
                              {uni.acceptance_rate && ` • ${uni.acceptance_rate}% ${t('dashboard.school.acceptance')}`}
                            </p>
                          </div>
                        </div>
                        <div className="dashboard-school-right">
                          <p className="dashboard-school-chance" style={{ color: '#10B981' }}>{rec.admissionChance}%</p>
                          <p className="dashboard-school-chance-label">{t('dashboard.chance')}</p>
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
                <h3 className="dashboard-category-title">{t('dashboard.category.target')}</h3>
                <span className="dashboard-category-badge" style={{ background: '#FFFBEB', color: '#F59E0B' }}>{t('dashboard.badge.suitable')}</span>
              </div>
              <div className="dashboard-schools-list">
                {targetSchools.slice(0, 3).map(rec => {
                  const uni = universities[rec.universityId];
                  if (!uni) return null;
                  
                  const displayName = language === 'ko' && uni.name_ko ? uni.name_ko : uni.name;
                  
                  return (
                    <div key={rec.universityId} className="dashboard-school-card" style={{ background: '#FFFBEB', borderColor: '#FACC15' }}>
                      <div className="dashboard-school-content">
                        <div className="dashboard-school-left">
                          {uni.logo_url && (
                            <img src={uni.logo_url} alt={displayName} className="dashboard-school-image" />
                          )}
                          <div className="dashboard-school-info">
                            <h4 className="dashboard-school-name">{displayName}</h4>
                            <p className="dashboard-school-meta">
                              {uni.state || ''} 
                              {uni.acceptance_rate && ` • ${uni.acceptance_rate}% ${t('dashboard.school.acceptance')}`}
                            </p>
                          </div>
                        </div>
                        <div className="dashboard-school-right">
                          <p className="dashboard-school-chance" style={{ color: '#F59E0B' }}>{rec.admissionChance}%</p>
                          <p className="dashboard-school-chance-label">{t('dashboard.chance')}</p>
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
                <h3 className="dashboard-category-title">{t('dashboard.category.reach')}</h3>
                <span className="dashboard-category-badge" style={{ background: '#DBEAFE', color: '#3B82F6' }}>{t('dashboard.badge.challenge')}</span>
              </div>
              <div className="dashboard-schools-list">
                {reachSchools.slice(0, 3).map(rec => {
                  const uni = universities[rec.universityId];
                  if (!uni) return null;
                  
                  const displayName = language === 'ko' && uni.name_ko ? uni.name_ko : uni.name;
                  
                  return (
                    <div key={rec.universityId} className="dashboard-school-card" style={{ background: '#EFF6FF', borderColor: '#93C5FD' }}>
                      <div className="dashboard-school-content">
                        <div className="dashboard-school-left">
                          {uni.logo_url && (
                            <img src={uni.logo_url} alt={displayName} className="dashboard-school-image" />
                          )}
                          <div className="dashboard-school-info">
                            <h4 className="dashboard-school-name">{displayName}</h4>
                            <p className="dashboard-school-meta">
                              {uni.state || ''} 
                              {uni.acceptance_rate && ` • ${uni.acceptance_rate}% ${t('dashboard.school.acceptance')}`}
                            </p>
                            {rec.strengthenAreas.length > 0 && (
                              <div className="dashboard-school-warning" style={{ color: '#F59E0B' }}>
                                <AlertCircle className="h-4 w-4" />
                                <span>{t('dashboard.strengthen')}: {rec.strengthenAreas.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="dashboard-school-right">
                          <p className="dashboard-school-chance" style={{ color: '#3B82F6' }}>{rec.admissionChance}%</p>
                          <p className="dashboard-school-chance-label">{t('dashboard.chance')}</p>
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
              <h2 className="dashboard-sidebar-title">{t('dashboard.profile.title')}</h2>

              <div>
                <div className="dashboard-profile-item">
                  <span className="dashboard-profile-label">{t('dashboard.profile.major')}:</span>
                  <span className="dashboard-profile-value">{profile.intendedMajor || t('dashboard.profile.undecided')}</span>
                </div>

                <div className="dashboard-profile-item">
                  <span className="dashboard-profile-label">{t('dashboard.stat.gpa')}:</span>
                  <span className="dashboard-profile-value">{profile.gpa}/4.0</span>
                </div>

                <div className="dashboard-profile-item">
                  <span className="dashboard-profile-label">{t('dashboard.profile.sat')}:</span>
                  <span className="dashboard-profile-value">{getSatScore() || t('dashboard.profile.nottaken')}</span>
                </div>

                <div className="dashboard-profile-item">
                  <span className="dashboard-profile-label">{t('dashboard.profile.act')}:</span>
                  <span className="dashboard-profile-value">{profile.actScore || t('dashboard.profile.nottaken')}</span>
                </div>

                <div className="dashboard-profile-item">
                  <span className="dashboard-profile-label">{t('dashboard.profile.toefl')}:</span>
                  <span className="dashboard-profile-value">{profile.toeflScore || t('dashboard.profile.nottaken')}</span>
                </div>

                <div className="dashboard-profile-item">
                  <span className="dashboard-profile-label">{t('dashboard.profile.ap')}:</span>
                  <span className="dashboard-profile-value">{profile.apCourses || 0}</span>
                </div>

                <div className="dashboard-profile-item">
                  <span className="dashboard-profile-label">{t('dashboard.profile.activities')}:</span>
                  <span className="dashboard-profile-value">{profile.extracurriculars.length}</span>
                </div>

                <div className="dashboard-profile-item">
                  <span className="dashboard-profile-label">{t('dashboard.profile.leadership')}:</span>
                  <span className="dashboard-profile-value">{profile.leadership.length}</span>
                </div>
              </div>
            </div>

            <div className="dashboard-sidebar-card">
              <h2 className="dashboard-sidebar-title">{t('dashboard.improve.title')}</h2>

              <div className="dashboard-improvement-list">
                {reachSchools.length > 0 && reachSchools[0].strengthenAreas.map((area, index) => (
                  <div key={index} className="dashboard-improvement-item" style={{ background: '#FFFBEB', border: '1px solid #FACC15' }}>
                    <AlertCircle className="h-5 w-5 dashboard-improvement-icon" style={{ color: '#F59E0B' }} />
                    <div className="dashboard-improvement-content">
                      <p className="dashboard-improvement-title" style={{ color: '#D97706' }}>{area}</p>
                      <p className="dashboard-improvement-desc" style={{ color: '#D97706' }}>
                        {t('dashboard.improve.desc')}
                      </p>
                    </div>
                  </div>
                ))}

                {(!reachSchools.length || !reachSchools[0].strengthenAreas.length) && (
                  <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <div className="dashboard-success-icon">
                      <Award className="h-12 w-12" style={{ color: '#10B981' }} />
                    </div>
                    <p className="dashboard-success-text">{t('dashboard.improve.excellent')}</p>
                  </div>
                )}
              </div>

              <Link to="/consulting" className="dashboard-action-button primary">
                {t('dashboard.improve.findconsulting')}
              </Link>
            </div>

            <div className="dashboard-sidebar-card">
              <h2 className="dashboard-sidebar-title">{t('dashboard.actions.title')}</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link to="/universities" className="dashboard-action-button secondary">
                  {t('dashboard.actions.browse')}
                </Link>

                <Link to="/universities/compare" className="dashboard-action-button secondary">
                  {t('dashboard.actions.compare')}
                </Link>

                <Link to="/student-profile" className="dashboard-action-button secondary">
                  {t('dashboard.actions.update')}
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