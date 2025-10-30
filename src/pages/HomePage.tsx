import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Target, Users, BookOpen, Trophy, Globe, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import universitiesData from '../data/universities.json';
import '../hero-section-style.css';
import './profile-calculator.css';
import './homepage-calculator.css';
import './homepage.css';

interface School {
  name: string;
  state: string;
  probability: number;
  quality_score: number;
}

interface APIResponse {
  student_profile: {
    gpa: number;
    sat_score: number | null;
    act_score: number | null;
    test_type: 'SAT' | 'ACT';
  };
  summary: {
    total_schools: number;
    total_analyzed: number;
    safety_schools: number;
    target_schools: number;
    reach_schools: number;
    prestige_schools: number;
    probability_thresholds: {
      safety: number;
      target: number;
      reach: number;
    };
  };
  recommendations: {
    safety: School[];
    target: School[];
    reach: School[];
    prestige: School[];
  };
}

const HomePage: React.FC = () => {
  const { t, language } = useLanguage();
  const [gpa, setGpa] = useState('');
  const [testType, setTestType] = useState<'SAT' | 'ACT'>('SAT');
  const [satEBRW, setSatEBRW] = useState('');
  const [satMath, setSatMath] = useState('');
  const [actScore, setActScore] = useState('');
  const [results, setResults] = useState<APIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAnalysis = async () => {
    if (!gpa) return;
    
    setLoading(true);
    setError('');
    
    try {
      let url = 'https://dev.preplounge.ai/?';
      url += `gpa=${gpa}`;
      
      if (testType === 'SAT' && satMath && satEBRW) {
        url += `&sat_math=${satMath}&sat_english=${satEBRW}`;
      } else if (testType === 'ACT' && actScore) {
        url += `&act=${actScore}`;
      } else {
        setError(language === 'ko' ? '모든 필수 항목을 입력해주세요.' : 'Please fill in all required fields.');
        setLoading(false);
        return;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      const data: APIResponse = await response.json();
      setResults(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('API error:', errorMessage, err);
      setError(language === 'ko' ? '분석 중 오류가 발생했습니다. 다시 시도해주세요.' : 'An error occurred during analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = () => {
    fetchAnalysis();
  };

  const isFormValid = () => {
    if (!gpa) return false;
    if (testType === 'SAT') return satMath && satEBRW;
    if (testType === 'ACT') return actScore;
    return false;
  };

  const extractEnglishName = (fullName: string) => {
    const match = fullName.match(/^([^(]+)/);
    return match ? match[1].trim() : fullName;
  };

  const extractKoreanName = (fullName: string) => {
    const match = fullName.match(/\(([^)]+)\)/);
    return match ? match[1] : fullName;
  };

  const getDisplayName = (fullName: string) => {
    return language === 'ko' ? extractKoreanName(fullName) : extractEnglishName(fullName);
  };

  const getDisplayState = (fullState: string) => {
    return language === 'ko' ? fullState.match(/\(([^)]+)\)/)?.[1] || fullState : fullState.split(' (')[0];
  };

  const findUniversityId = (schoolName: string): string | null => {
    const englishName = extractEnglishName(schoolName);
    const koreanName = extractKoreanName(schoolName);
    
    const university = universitiesData.find((uni: any) => 
      uni.englishName === englishName || uni.name === koreanName
    );
    
    return university ? university.id : null;
  };

  const getTopQualitySchools = (schools: School[], count: number = 3): School[] => {
    return [...schools]
      .sort((a, b) => b.quality_score - a.quality_score)
      .slice(0, count);
  };

  return (
    <div className="min-h-screen" style={{ background: '#FCF8F0' }}>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-titles">
            <p className="hero-subtitle">
              {t('home.hero.subtitle')}
            </p>
            <h1 className="hero-title">
              {t('home.hero.title')}
            </h1>
          </div>
          <p className="hero-description">
            {t('home.hero.description').split('\n').map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </p>
        </div>
        <div className="hero-buttons">
          <Link to="/student-profile" className="btn-primary" data-testid="link-predict">
            {t('home.hero.cta.predict')}
          </Link>
          <Link to="/universities" className="btn-secondary" data-testid="link-browse">
            {t('home.hero.cta.input')}
          </Link>
        </div>
      </section>

      {/* Campus Image Section */}
      <section
        className="relative bg-center bg-cover bg-no-repeat h-screen min-h-[400px] max-h-[600px] md:h-screen md:max-h-none"
        style={{
          backgroundImage: `url('https://images.pexels.com/photos/1438081/pexels-photo-1438081.jpeg?auto=compress&cs=tinysrgb&w=1600')`,
        }}
      >
      </section>

      {/* Quick Profile Calculator */}
      <section id="profile-calculator" className="profile-calculator-section">
        <div className="profile-calculator-container">
          <div className="profile-calculator-header">
            <div className="profile-calculator-title-group">
              <h2 className="profile-calculator-title">
                {t('home.calculator.title')}
              </h2>
            </div>
            <p className="profile-calculator-subtitle">
              {t('home.calculator.subtitle')}
            </p>
          </div>

          <div className="profile-calculator-content">
            {/* Left side - Input Form */}
            <div className="profile-calculator-form">
              <div className="profile-calculator-field">
                <label className="profile-calculator-label">
                  {t('home.calculator.gpa')}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4.0"
                  value={gpa}
                  onChange={(e) => setGpa(e.target.value)}
                  className="profile-calculator-input"
                  placeholder="3.8"
                  data-testid="input-gpa-home"
                />
              </div>

              <div className="profile-calculator-field">
                <label className="profile-calculator-label">
                  {language === 'ko' ? '시험 유형' : 'Test Type'}
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setTestType('SAT')}
                    className={`profile-calculator-test-toggle ${testType === 'SAT' ? 'active' : ''}`}
                    data-testid="button-test-sat-home"
                  >
                    SAT
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestType('ACT')}
                    className={`profile-calculator-test-toggle ${testType === 'ACT' ? 'active' : ''}`}
                    data-testid="button-test-act-home"
                  >
                    ACT
                  </button>
                </div>
              </div>

              {testType === 'SAT' ? (
                <>
                  <div className="profile-calculator-field">
                    <label className="profile-calculator-label">
                      {t('home.calculator.sat.math')}
                    </label>
                    <input
                      type="number"
                      min="200"
                      max="800"
                      value={satMath}
                      onChange={(e) => setSatMath(e.target.value)}
                      className="profile-calculator-input"
                      placeholder="720"
                      data-testid="input-sat-math-home"
                    />
                  </div>

                  <div className="profile-calculator-field">
                    <label className="profile-calculator-label">
                      {t('home.calculator.sat.ebrw')}
                    </label>
                    <input
                      type="number"
                      min="200"
                      max="800"
                      value={satEBRW}
                      onChange={(e) => setSatEBRW(e.target.value)}
                      className="profile-calculator-input"
                      placeholder="730"
                      data-testid="input-sat-ebrw-home"
                    />
                  </div>
                </>
              ) : (
                <div className="profile-calculator-field">
                  <label className="profile-calculator-label">
                    {language === 'ko' ? 'ACT 점수 (36점 만점)' : 'ACT Score (out of 36)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="36"
                    value={actScore}
                    onChange={(e) => setActScore(e.target.value)}
                    className="profile-calculator-input"
                    placeholder="30"
                    data-testid="input-act-home"
                  />
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={!isFormValid() || loading}
                className="profile-calculator-button"
                style={{ marginTop: '20px' }}
                data-testid="button-analyze-home"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>{language === 'ko' ? '분석 중...' : 'Analyzing...'}</span>
                  </>
                ) : (
                  <span>{language === 'ko' ? '분석 시작하기' : 'Start Analysis'}</span>
                )}
              </button>

              {error && (
                <div className="profile-calculator-error" data-testid="text-error-home">
                  {error}
                </div>
              )}
            </div>

            {/* Right side - Results Display */}
            {results && (
              <div className="profile-calculator-results">
                <div className="results-summary">
                  <h3 className="results-title" data-testid="text-results-title-home">
                    {language === 'ko' ? '분석 결과' : 'Analysis Results'}
                  </h3>
                  <div className="results-stats">
                    <div className="stat-card" data-testid="card-total-schools-home">
                      <div className="stat-value">{results.summary.total_analyzed}</div>
                      <div className="stat-label">{language === 'ko' ? '분석된 대학' : 'Schools Analyzed'}</div>
                    </div>
                    <div className="stat-card safety" data-testid="card-safety-home">
                      <div className="stat-value">{results.summary.safety_schools}</div>
                      <div className="stat-label">{language === 'ko' ? '안전권' : 'Safety'}</div>
                    </div>
                    <div className="stat-card target" data-testid="card-target-home">
                      <div className="stat-value">{results.summary.target_schools}</div>
                      <div className="stat-label">{language === 'ko' ? '적정권' : 'Target'}</div>
                    </div>
                    <div className="stat-card reach" data-testid="card-reach-home">
                      <div className="stat-value">{results.summary.reach_schools}</div>
                      <div className="stat-label">{language === 'ko' ? '상향권' : 'Reach'}</div>
                    </div>
                    <div className="stat-card prestige" data-testid="card-prestige-home">
                      <div className="stat-value">{results.summary.prestige_schools}</div>
                      <div className="stat-label">{language === 'ko' ? '명문' : 'Prestige'}</div>
                    </div>
                  </div>
                </div>

                {/* Safety Schools */}
                {results.recommendations.safety.length > 0 && (
                  <div className="school-category">
                    <h4 className="category-title safety" data-testid="title-safety-schools-home">
                      {language === 'ko' ? '안전권 대학 (상위 3개)' : 'Safety Schools (Top 3)'}
                      <span className="category-count">({results.recommendations.safety.length} {language === 'ko' ? '개 중' : 'total'})</span>
                    </h4>
                    <div className="schools-grid">
                      {getTopQualitySchools(results.recommendations.safety, 3).map((school, idx) => {
                        const universityId = findUniversityId(school.name);
                        const cardContent = (
                          <>
                            <div className="school-name">{getDisplayName(school.name)}</div>
                            <div className="school-state">{getDisplayState(school.state)}</div>
                            <div className="school-probability">
                              {language === 'ko' ? '합격 확률' : 'Admission Probability'}: <strong>{(school.probability * 100).toFixed(0)}%</strong>
                            </div>
                          </>
                        );
                        
                        return universityId ? (
                          <Link key={idx} to={`/university/${universityId}`} className="school-card clickable" data-testid={`school-safety-home-${idx}`}>
                            {cardContent}
                          </Link>
                        ) : (
                          <div key={idx} className="school-card" data-testid={`school-safety-home-${idx}`}>
                            {cardContent}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Target Schools */}
                {results.recommendations.target.length > 0 && (
                  <div className="school-category">
                    <h4 className="category-title target" data-testid="title-target-schools-home">
                      {language === 'ko' ? '적정권 대학 (상위 3개)' : 'Target Schools (Top 3)'}
                      <span className="category-count">({results.recommendations.target.length} {language === 'ko' ? '개 중' : 'total'})</span>
                    </h4>
                    <div className="schools-grid">
                      {getTopQualitySchools(results.recommendations.target, 3).map((school, idx) => {
                        const universityId = findUniversityId(school.name);
                        const cardContent = (
                          <>
                            <div className="school-name">{getDisplayName(school.name)}</div>
                            <div className="school-state">{getDisplayState(school.state)}</div>
                            <div className="school-probability">
                              {language === 'ko' ? '합격 확률' : 'Admission Probability'}: <strong>{(school.probability * 100).toFixed(0)}%</strong>
                            </div>
                          </>
                        );
                        
                        return universityId ? (
                          <Link key={idx} to={`/university/${universityId}`} className="school-card clickable" data-testid={`school-target-home-${idx}`}>
                            {cardContent}
                          </Link>
                        ) : (
                          <div key={idx} className="school-card" data-testid={`school-target-home-${idx}`}>
                            {cardContent}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Reach Schools */}
                {results.recommendations.reach.length > 0 && (
                  <div className="school-category">
                    <h4 className="category-title reach" data-testid="title-reach-schools-home">
                      {language === 'ko' ? '상향권 대학 (상위 3개)' : 'Reach Schools (Top 3)'}
                      <span className="category-count">({results.recommendations.reach.length} {language === 'ko' ? '개 중' : 'total'})</span>
                    </h4>
                    <div className="schools-grid">
                      {getTopQualitySchools(results.recommendations.reach, 3).map((school, idx) => {
                        const universityId = findUniversityId(school.name);
                        const cardContent = (
                          <>
                            <div className="school-name">{getDisplayName(school.name)}</div>
                            <div className="school-state">{getDisplayState(school.state)}</div>
                            <div className="school-probability">
                              {language === 'ko' ? '합격 확률' : 'Admission Probability'}: <strong>{(school.probability * 100).toFixed(0)}%</strong>
                            </div>
                          </>
                        );
                        
                        return universityId ? (
                          <Link key={idx} to={`/university/${universityId}`} className="school-card clickable" data-testid={`school-reach-home-${idx}`}>
                            {cardContent}
                          </Link>
                        ) : (
                          <div key={idx} className="school-card" data-testid={`school-reach-home-${idx}`}>
                            {cardContent}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Prestige Schools */}
                {results.recommendations.prestige.length > 0 && (
                  <div className="school-category">
                    <h4 className="category-title prestige" data-testid="title-prestige-schools-home">
                      {language === 'ko' ? '명문 대학 (상위 3개)' : 'Prestige Schools (Top 3)'}
                      <span className="category-count">({results.recommendations.prestige.length} {language === 'ko' ? '개 중' : 'total'})</span>
                    </h4>
                    <div className="schools-grid">
                      {getTopQualitySchools(results.recommendations.prestige, 3).map((school, idx) => {
                        const universityId = findUniversityId(school.name);
                        const cardContent = (
                          <>
                            <div className="school-name">{getDisplayName(school.name)}</div>
                            <div className="school-state">{getDisplayState(school.state)}</div>
                            <div className="school-probability">
                              {language === 'ko' ? '합격 확률' : 'Admission Probability'}: <strong>{(school.probability * 100).toFixed(0)}%</strong>
                            </div>
                          </>
                        );
                        
                        return universityId ? (
                          <Link key={idx} to={`/university/${universityId}`} className="school-card clickable" data-testid={`school-prestige-home-${idx}`}>
                            {cardContent}
                          </Link>
                        ) : (
                          <div key={idx} className="school-card" data-testid={`school-prestige-home-${idx}`}>
                            {cardContent}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Link
                  to="/student-profile"
                  className="detailed-analysis-button"
                  data-testid="button-detailed-analysis-home"
                >
                  <span>{language === 'ko' ? '더 자세한 분석 보기' : 'More Detailed Analysis'}</span>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <div className="features-header">
            <h2 className="features-title">
              {t('home.features.title')}
            </h2>
            <p className="features-subtitle">
              {t('home.features.subtitle')}
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-card-content">
                <div className="feature-title-row">
                  <h3 className="feature-card-title">
                    {t('home.features.schools.title').split('\n').map((line, i) => (
                      <span key={i}>{line}{i === 0 && <br />}</span>
                    ))}
                  </h3>
                  <div className="feature-icon-wrapper blue">
                    <Search className="feature-icon" />
                  </div>
                </div>
                <p className="feature-description">
                  {t('home.features.schools.description')}
                </p>
              </div>
              <Link to="/universities" className="feature-link blue" data-testid="link-schools-feature">
                {t('home.features.link')}
              </Link>
            </div>

            <div className="feature-card">
              <div className="feature-card-content">
                <div className="feature-title-row">
                  <h3 className="feature-card-title">
                    {t('home.features.profile.title').split('\n').map((line, i) => (
                      <span key={i}>{line}{i === 0 && <br />}</span>
                    ))}
                  </h3>
                  <div className="feature-icon-wrapper green">
                    <Target className="feature-icon" />
                  </div>
                </div>
                <p className="feature-description">
                  {t('home.features.profile.description')}
                </p>
              </div>
              <Link to="/student-profile" className="feature-link green" data-testid="link-profile-feature">
                {t('home.features.link')}
              </Link>
            </div>

            <div className="feature-card">
              <div className="feature-card-content">
                <div className="feature-title-row">
                  <h3 className="feature-card-title">
                    {t('home.features.consulting.title').split('\n').map((line, i) => (
                      <span key={i}>{line}{i === 0 && <br />}</span>
                    ))}
                  </h3>
                  <div className="feature-icon-wrapper orange">
                    <Users className="feature-icon" />
                  </div>
                </div>
                <p className="feature-description">
                  {t('home.features.consulting.description')}
                </p>
              </div>
              <Link to="/consulting" className="feature-link orange" data-testid="link-consulting-feature">
                {t('home.features.link')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Majors Section */}
      <section className="majors-section">
        <div className="majors-container">
          <div className="majors-header">
            <h2 className="majors-title">
              {t('home.majors.title')}
            </h2>
            <p className="majors-subtitle">
              {t('home.majors.subtitle').split('\n').map((line, i) => (
                <span key={i}>{line}{i === 0 && <br />}</span>
              ))}
            </p>
          </div>

          <div className="majors-grid">
            <div className="major-card">
              <div className="major-icon-wrapper indigo">
                <BookOpen className="major-icon" />
              </div>
              <div className="major-content">
                <h3 className="major-card-title">{t('home.majors.engineering')}</h3>
                <div className="major-details">
                  <p className="major-specializations">{t('home.majors.engineering.specializations')}</p>
                </div>
                <div className="major-stats">
                  <div className="major-stat-badge">
                    <span className="major-stat-text">{t('home.majors.engineering.salary')}</span>
                  </div>
                  <div className="major-stat-badge">
                    <span className="major-stat-text">{t('home.majors.engineering.employment')}</span>
                  </div>
                  <div className="major-stat-badge">
                    <span className="major-stat-text">{t('home.majors.engineering.opt')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="major-card">
              <div className="major-icon-wrapper teal">
                <Trophy className="major-icon" />
              </div>
              <div className="major-content">
                <h3 className="major-card-title">{t('home.majors.business')}</h3>
                <div className="major-details">
                  <p className="major-specializations">{t('home.majors.business.specializations')}</p>
                </div>
                <div className="major-stats">
                  <div className="major-stat-badge">
                    <span className="major-stat-text">{t('home.majors.business.salary')}</span>
                  </div>
                  <div className="major-stat-badge">
                    <span className="major-stat-text">{t('home.majors.business.employment')}</span>
                  </div>
                  <div className="major-stat-badge">
                    <span className="major-stat-text">{t('home.majors.business.networking')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="major-card">
              <div className="major-icon-wrapper amber">
                <BookOpen className="major-icon" />
              </div>
              <div className="major-content">
                <h3 className="major-card-title">{t('home.majors.liberal')}</h3>
                <div className="major-details">
                  <p className="major-specializations">{t('home.majors.liberal.specializations')}</p>
                </div>
                <div className="major-stats">
                  <div className="major-stat-badge">
                    <span className="major-stat-text">{t('home.majors.liberal.salary')}</span>
                  </div>
                  <div className="major-stat-badge">
                    <span className="major-stat-text">{t('home.majors.liberal.employment')}</span>
                  </div>
                  <div className="major-stat-badge">
                    <span className="major-stat-text">{t('home.majors.liberal.thinking')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="major-card">
              <div className="major-icon-wrapper blue">
                <Globe className="major-icon" />
              </div>
              <div className="major-content">
                <h3 className="major-card-title">{t('home.majors.natural')}</h3>
                <div className="major-details">
                  <p className="major-specializations">{t('home.majors.natural.specializations')}</p>
                </div>
                <div className="major-stats">
                  <div className="major-stat-badge">
                    <span className="major-stat-text">{t('home.majors.natural.salary')}</span>
                  </div>
                  <div className="major-stat-badge">
                    <span className="major-stat-text">{t('home.majors.natural.employment')}</span>
                  </div>
                  <div className="major-stat-badge">
                    <span className="major-stat-text">{t('home.majors.natural.graduate')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="major-card">
              <div className="major-icon-wrapper lime">
                <Search className="major-icon" />
              </div>
              <div className="major-content">
                <h3 className="major-card-title">{t('home.majors.social')}</h3>
                <div className="major-details">
                  <p className="major-specializations">{t('home.majors.social.specializations')}</p>
                </div>
                <div className="major-stats">
                  <div className="major-stat-badge">
                    <span className="major-stat-text">{t('home.majors.social.salary')}</span>
                  </div>
                  <div className="major-stat-badge">
                    <span className="major-stat-text">{t('home.majors.social.employment')}</span>
                  </div>
                  <div className="major-stat-badge">
                    <span className="major-stat-text">{t('home.majors.social.problem')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="major-card">
              <div className="major-icon-wrapper purple">
                <Users className="major-icon" />
              </div>
              <div className="major-content">
                <h3 className="major-card-title">{language === 'ko' ? '예술 (Arts)' : 'Arts'}</h3>
                <div className="major-details">
                  <p className="major-specializations">
                    {language === 'ko' ? '순수예술, 음악, 연극, 영화학, 디자인' : 'Fine Arts, Music, Theater, Film, Design'}
                  </p>
                </div>
                <div className="major-stats">
                  <div className="major-stat-badge">
                    <span className="major-stat-text">
                      {language === 'ko' ? '평균 연봉 $58,000' : 'Avg Salary $58,000'}
                    </span>
                  </div>
                  <div className="major-stat-badge">
                    <span className="major-stat-text">
                      {language === 'ko' ? '취업률 75%' : 'Employment 75%'}
                    </span>
                  </div>
                  <div className="major-stat-badge">
                    <span className="major-stat-text">
                      {language === 'ko' ? '포트폴리오 중심 전형' : 'Portfolio-Based'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="majors-cta">
            <p className="majors-cta-text">
              {language === 'ko' ? '단 3분! 나에게 딱 맞는 전공을 찾아보세요' : 'Just 3 minutes! Find the perfect major for you'}
            </p>
            <button className="majors-cta-button">
              <span className="majors-cta-button-text">
                {language === 'ko' ? '전공 찾고 대학 로드맵 준비하기' : 'Find Your Major & Plan Your College Roadmap'}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Housing Section */}
      <section className="housing-section">
        <div className="housing-container">
          <div className="housing-header-column">
            <h2 className="housing-title">
              {language === 'ko' ? (
                <>미국 대학 주변<br />집 구경하기</>
              ) : (
                <>Explore Housing<br />Near US Universities</>
              )}
            </h2>
            <p className="housing-subtitle">
              {language === 'ko' 
                ? '학교 주변, 어떤 동네가 살기 좋을까?' 
                : 'Which neighborhoods are best to live in near campus?'}
            </p>
          </div>

          <div className="housing-content-column">
            <div className="housing-search-field">
              <div className="housing-search-input-wrapper">
                <Search className="housing-search-icon" />
                <input
                  type="text"
                  placeholder={language === 'ko' ? '대학 이름으로 검색' : 'Search by university name'}
                  className="housing-search-input"
                />
                <button className="housing-search-button">
                  <span className="housing-search-button-text">
                    {language === 'ko' ? '검색' : 'Search'}
                  </span>
                </button>
              </div>
            </div>

            <div className="housing-map-container">
              <div style={{
                width: '100%',
                height: '360px',
                background: 'linear-gradient(135deg, #E0F2FE 0%, #D1FAE5 100%)',
                border: '1px solid #E7E5E4',
                borderRadius: '16px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', inset: 0, padding: '16px' }}>
                  <div style={{ position: 'absolute', top: '32px', left: '48px', background: '#ef4444', color: 'white', fontSize: '11px', padding: '4px 8px', borderRadius: '9999px', fontWeight: '500' }}>
                    H
                  </div>
                  <div style={{ position: 'absolute', top: '64px', right: '80px', background: '#3b82f6', color: 'white', fontSize: '11px', padding: '4px 8px', borderRadius: '9999px', fontWeight: '500' }}>
                    UCLA
                  </div>
                  <div style={{ position: 'absolute', bottom: '80px', left: '64px', background: '#10b981', color: 'white', fontSize: '11px', padding: '4px 8px', borderRadius: '9999px', fontWeight: '500' }}>
                    USC
                  </div>
                  <div style={{ position: 'absolute', top: '48px', right: '128px', background: 'white', padding: '4px 8px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: '600', color: '#212529' }}>
                    $200K
                  </div>
                  <div style={{ position: 'absolute', bottom: '128px', left: '96px', background: 'white', padding: '4px 8px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: '600', color: '#212529' }}>
                    $781K
                  </div>
                </div>
              </div>
            </div>

            <Link to="/housing" className="housing-cta-button">
              <span className="housing-cta-button-text">
                {language === 'ko' ? '매물 자세히 알아보기' : 'Explore Listings in Detail'}
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="homepage-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-info">
              <h3 className="footer-company-name">Habitfactory USA</h3>
              <p className="footer-address">
                Los Angeles : 3435 Wilshire Blvd Suite 1940, LA, CA 90010<br />
                Irvine : 2 Park Plaza Suite 350, Irvine, CA 92614<br />
                (213) 426-1118<br />
                info@loaning.ai
              </p>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-links">
              <a href="#" className="footer-link">NMLS #2357195</a>
              <a href="#" className="footer-link">Legal disclaimer</a>
              <a href="#" className="footer-link">Licenses</a>
            </div>
            <p className="footer-copyright">©Habitfactory USA, Inc.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;