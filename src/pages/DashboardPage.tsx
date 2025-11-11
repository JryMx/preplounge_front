import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Target, TrendingUp, AlertCircle, BookOpen, Users, Award, ArrowRight, BarChart3, X, Heart } from 'lucide-react';
import { useStudentProfile } from '../context/StudentProfileContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useFavorites } from '../context/FavoritesContext';
import universitiesData from '../data/universities.json';
import './dashboard-page.css';

const DashboardPage: React.FC = () => {
  const { profile, getRecommendations } = useStudentProfile();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { favorites } = useFavorites();
  const navigate = useNavigate();
  
  const [showModal, setShowModal] = useState(false);
  const [modalCategory, setModalCategory] = useState<'safety' | 'target' | 'reach' | 'prestige' | null>(null);

  // Get favorited universities
  const favoriteUniversities = universitiesData.filter((uni: any) => 
    favorites.includes(uni.id)
  );

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

  // Helper function to parse bilingual text (names and states)
  const parseBilingualText = (text: string | undefined, lang: string) => {
    if (!text) return '';
    
    // Format: "English Text (Korean Text)"
    const match = text.match(/^(.+?)\s*\(([^)]+)\)$/);
    
    if (match) {
      const [, englishText, koreanText] = match;
      return lang === 'ko' ? koreanText.trim() : englishText.trim();
    }
    
    // No parentheses found, return as-is
    return text;
  };

  const recommendations = getRecommendations();
  
  // Sort schools by quality score (highest first)
  const safetySchools = recommendations
    .filter(r => r.category === 'safety')
    .sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0));
  const targetSchools = recommendations
    .filter(r => r.category === 'target')
    .sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0));
  const reachSchools = recommendations
    .filter(r => r.category === 'reach')
    .sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0));
  const prestigeSchools = recommendations
    .filter(r => r.category === 'prestige')
    .sort((a, b) => (b.qualityScore || 0) - (a.qualityScore || 0));

  // Handle school card click
  const handleSchoolClick = (universityId: string) => {
    navigate(`/universities/${universityId}`, { state: { from: '/dashboard' } });
  };

  // Open modal with specific category
  const openModal = (category: 'safety' | 'target' | 'reach' | 'prestige') => {
    setModalCategory(category);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setModalCategory(null);
  };

  // Get schools for modal
  const getModalSchools = () => {
    if (modalCategory === 'safety') return safetySchools;
    if (modalCategory === 'target') return targetSchools;
    if (modalCategory === 'reach') return reachSchools;
    if (modalCategory === 'prestige') return prestigeSchools;
    return [];
  };

  // Get modal title
  const getModalTitle = () => {
    if (modalCategory === 'safety') return t('dashboard.category.safety');
    if (modalCategory === 'target') return t('dashboard.category.target');
    if (modalCategory === 'reach') return t('dashboard.category.reach');
    if (modalCategory === 'prestige') return t('dashboard.category.prestige');
    return '';
  };

  // Get category color
  const getCategoryColor = (category: 'safety' | 'target' | 'reach' | 'prestige') => {
    if (category === 'safety') return { bg: '#F0FDF4', border: '#BBF7D0', text: '#10B981' };
    if (category === 'target') return { bg: '#FFFBEB', border: '#FACC15', text: '#F59E0B' };
    if (category === 'reach') return { bg: '#EFF6FF', border: '#93C5FD', text: '#3B82F6' };
    if (category === 'prestige') return { bg: '#FFFBEB', border: '#FACC15', text: '#D97706' };
    return { bg: '#F0FDF4', border: '#BBF7D0', text: '#10B981' };
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-welcome">
            {t('dashboard.welcome')}, {user.displayName}!
          </h1>
          <p className="dashboard-subtitle">
            {t('dashboard.subtitle')}
          </p>
        </div>

        <div className="dashboard-stats-grid">
          <div className="dashboard-stat-card">
            <div className="dashboard-stat-info">
              <span className="dashboard-stat-label">{t('dashboard.stat.profile')}</span>
              <span className="dashboard-stat-value" style={{ color: '#3B82F6' }}>{profile.profileScore || 0}</span>
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
              <span className="dashboard-stat-value" style={{ color: '#F59E0B' }}>
                {getSatScore() > 0 ? getSatScore() : t('dashboard.notavailable')}
              </span>
            </div>
            <div className="dashboard-stat-icon" style={{ background: '#FFFBEB' }}>
              <Target className="h-7 w-7" style={{ color: '#F59E0B' }} />
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="dashboard-stat-info">
              <span className="dashboard-stat-label">{t('dashboard.stat.act')}</span>
              <span className="dashboard-stat-value" style={{ color: '#EC4899' }}>
                {profile.actScore || t('dashboard.notavailable')}
              </span>
            </div>
            <div className="dashboard-stat-icon" style={{ background: '#FCE7F3' }}>
              <Target className="h-7 w-7" style={{ color: '#EC4899' }} />
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
            {/* Favorite Schools */}
            {favoriteUniversities.length > 0 && (
              <>
                <h2 className="dashboard-section-title">{t('dashboard.favorites.title')}</h2>
                <div className="dashboard-category">
                  <div className="dashboard-category-header">
                    <div className="dashboard-category-icon" style={{ background: '#FEE2E2' }}>
                      <Heart className="h-5 w-5" style={{ color: '#EF4444' }} />
                    </div>
                    <h3 className="dashboard-category-title">{t('dashboard.favorites.saved')}</h3>
                    <span className="dashboard-category-badge" style={{ background: '#FEE2E2', color: '#EF4444' }}>
                      {favoriteUniversities.length}
                    </span>
                  </div>
                  <div className="dashboard-schools-list">
                    {favoriteUniversities.map((uni: any) => {
                      const displayName = language === 'ko' ? uni.name : uni.englishName;
                      const displayLocation = language === 'ko' ? uni.location : uni.englishLocation;
                      
                      return (
                        <div 
                          key={uni.id} 
                          className="dashboard-school-card" 
                          style={{ background: '#FEF2F2', borderColor: '#FECACA', cursor: 'pointer' }}
                          onClick={() => navigate(`/universities/${uni.id}`)}
                        >
                          <div className="dashboard-school-content">
                            <div className="dashboard-school-left">
                              <div className="dashboard-school-info">
                                <h4 className="dashboard-school-name">{displayName}</h4>
                                {displayLocation && (
                                  <p className="dashboard-school-meta">{displayLocation}</p>
                                )}
                              </div>
                            </div>
                            <div className="dashboard-school-right">
                              <p className="dashboard-school-chance" style={{ color: '#EF4444' }}>
                                {uni.acceptanceRate}%
                              </p>
                              <p className="dashboard-school-chance-label">{t('dashboard.school.acceptance')}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            <h2 className="dashboard-section-title">{t('dashboard.recommendations.title')}</h2>

            {/* Safety Schools */}
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
                  const displayName = parseBilingualText(rec.universityName, language);
                  const displayState = parseBilingualText(rec.universityState, language);
                  
                  return (
                    <div 
                      key={rec.universityId} 
                      className="dashboard-school-card" 
                      style={{ background: '#F0FDF4', borderColor: '#BBF7D0', cursor: 'pointer' }}
                      onClick={() => handleSchoolClick(rec.universityId)}
                    >
                      <div className="dashboard-school-content">
                        <div className="dashboard-school-left">
                          <div className="dashboard-school-info">
                            <h4 className="dashboard-school-name">{displayName}</h4>
                            {displayState && (
                              <p className="dashboard-school-meta">{displayState}</p>
                            )}
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
              {safetySchools.length > 3 && (
                <button 
                  className="dashboard-see-all-button"
                  onClick={() => openModal('safety')}
                >
                  {language === 'ko' ? '모두 보기' : 'See All'} ({safetySchools.length})
                </button>
              )}
            </div>

            {/* Target Schools */}
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
                  const displayName = parseBilingualText(rec.universityName, language);
                  const displayState = parseBilingualText(rec.universityState, language);
                  
                  return (
                    <div 
                      key={rec.universityId} 
                      className="dashboard-school-card" 
                      style={{ background: '#FFFBEB', borderColor: '#FACC15', cursor: 'pointer' }}
                      onClick={() => handleSchoolClick(rec.universityId)}
                    >
                      <div className="dashboard-school-content">
                        <div className="dashboard-school-left">
                          <div className="dashboard-school-info">
                            <h4 className="dashboard-school-name">{displayName}</h4>
                            {displayState && (
                              <p className="dashboard-school-meta">{displayState}</p>
                            )}
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
              {targetSchools.length > 3 && (
                <button 
                  className="dashboard-see-all-button"
                  onClick={() => openModal('target')}
                >
                  {language === 'ko' ? '모두 보기' : 'See All'} ({targetSchools.length})
                </button>
              )}
            </div>

            {/* Reach Schools */}
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
                  const displayName = parseBilingualText(rec.universityName, language);
                  const displayState = parseBilingualText(rec.universityState, language);
                  
                  return (
                    <div 
                      key={rec.universityId} 
                      className="dashboard-school-card" 
                      style={{ background: '#EFF6FF', borderColor: '#93C5FD', cursor: 'pointer' }}
                      onClick={() => handleSchoolClick(rec.universityId)}
                    >
                      <div className="dashboard-school-content">
                        <div className="dashboard-school-left">
                          <div className="dashboard-school-info">
                            <h4 className="dashboard-school-name">{displayName}</h4>
                            {displayState && (
                              <p className="dashboard-school-meta">{displayState}</p>
                            )}
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
              {reachSchools.length > 3 && (
                <button 
                  className="dashboard-see-all-button"
                  onClick={() => openModal('reach')}
                >
                  {language === 'ko' ? '모두 보기' : 'See All'} ({reachSchools.length})
                </button>
              )}
            </div>

            {/* Prestige Schools */}
            {prestigeSchools.length > 0 && (
              <div className="dashboard-category">
                <div className="dashboard-category-header">
                  <div className="dashboard-category-icon" style={{ background: '#FEF3C7' }}>
                    <Award className="h-5 w-5" style={{ color: '#FACC15' }} />
                  </div>
                  <h3 className="dashboard-category-title">{t('dashboard.category.prestige')}</h3>
                  <span className="dashboard-category-badge" style={{ background: '#FEF3C7', color: '#D97706' }}>Elite</span>
                </div>
                <div className="dashboard-schools-list">
                  {prestigeSchools.slice(0, 3).map(rec => {
                    const displayName = parseBilingualText(rec.universityName, language);
                    const displayState = parseBilingualText(rec.universityState, language);
                    
                    return (
                      <div 
                        key={rec.universityId} 
                        className="dashboard-school-card" 
                        style={{ background: '#FFFBEB', borderColor: '#FACC15', cursor: 'pointer' }}
                        onClick={() => handleSchoolClick(rec.universityId)}
                      >
                        <div className="dashboard-school-content">
                          <div className="dashboard-school-left">
                            <div className="dashboard-school-info">
                              <h4 className="dashboard-school-name">{displayName}</h4>
                              {displayState && (
                                <p className="dashboard-school-meta">{displayState}</p>
                              )}
                            </div>
                          </div>
                          <div className="dashboard-school-right">
                            <p className="dashboard-school-chance" style={{ color: '#D97706' }}>{rec.admissionChance}%</p>
                            <p className="dashboard-school-chance-label">{t('dashboard.chance')}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {prestigeSchools.length > 3 && (
                  <button 
                    className="dashboard-see-all-button"
                    onClick={() => openModal('prestige')}
                  >
                    {language === 'ko' ? '모두 보기' : 'See All'} ({prestigeSchools.length})
                  </button>
                )}
              </div>
            )}
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
                  <span className="dashboard-profile-label">{t('dashboard.profile.toefl')}:</span>
                  <span className="dashboard-profile-value">{profile.toeflScore || t('dashboard.profile.nottaken')}</span>
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

                <Link to="/compare" className="dashboard-action-button secondary">
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

      {/* See All Modal */}
      {showModal && modalCategory && (
        <div className="dashboard-modal-overlay" onClick={closeModal}>
          <div className="dashboard-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="dashboard-modal-header">
              <h3 className="dashboard-modal-title">{getModalTitle()}</h3>
              <button className="dashboard-modal-close" onClick={closeModal}>
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="dashboard-modal-body">
              {getModalSchools().map(rec => {
                const displayName = parseBilingualText(rec.universityName, language);
                const displayState = parseBilingualText(rec.universityState, language);
                const colors = getCategoryColor(modalCategory);
                
                return (
                  <div 
                    key={rec.universityId} 
                    className="dashboard-modal-school-card" 
                    style={{ background: colors.bg, borderColor: colors.border, cursor: 'pointer' }}
                    onClick={() => {
                      closeModal();
                      handleSchoolClick(rec.universityId);
                    }}
                  >
                    <div className="dashboard-school-content">
                      <div className="dashboard-school-left">
                        <div className="dashboard-school-info">
                          <h4 className="dashboard-school-name">{displayName}</h4>
                          {displayState && (
                            <p className="dashboard-school-meta">{displayState}</p>
                          )}
                          {rec.strengthenAreas.length > 0 && (
                            <div className="dashboard-school-warning" style={{ color: '#F59E0B' }}>
                              <AlertCircle className="h-4 w-4" />
                              <span>{t('dashboard.strengthen')}: {rec.strengthenAreas.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="dashboard-school-right">
                        <p className="dashboard-school-chance" style={{ color: colors.text }}>{rec.admissionChance}%</p>
                        <p className="dashboard-school-chance-label">{t('dashboard.chance')}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
