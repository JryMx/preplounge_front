import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Loader2 } from 'lucide-react';
import universitiesData from '../data/universities.json';
import { getUniversityLocation } from '../data/universityLocations';
import './profile-calculator.css';

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

const ProfileCalculatorPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [gpa, setGpa] = useState('');
  const [testType, setTestType] = useState<'SAT' | 'ACT'>('SAT');
  const [satMath, setSatMath] = useState('');
  const [satEBRW, setSatEBRW] = useState('');
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

  const getDisplayLocation = (schoolName: string) => {
    const englishName = extractEnglishName(schoolName);
    return getUniversityLocation(englishName, language);
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
      <section className="profile-calculator-section">
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
                  data-testid="input-gpa"
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
                    data-testid="button-test-sat"
                  >
                    SAT
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestType('ACT')}
                    className={`profile-calculator-test-toggle ${testType === 'ACT' ? 'active' : ''}`}
                    data-testid="button-test-act"
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
                      data-testid="input-sat-math"
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
                      data-testid="input-sat-ebrw"
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
                    data-testid="input-act"
                  />
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={!isFormValid() || loading}
                className="profile-calculator-button"
                style={{ marginTop: '20px' }}
                data-testid="button-analyze"
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
                <div className="profile-calculator-error" data-testid="text-error">
                  {error}
                </div>
              )}
            </div>

            {results && (
              <div className="profile-calculator-results">
                <div className="results-summary">
                  <h3 className="results-title" data-testid="text-results-title">
                    {language === 'ko' ? '분석 결과' : 'Analysis Results'}
                  </h3>
                  <div className="results-stats">
                    <div className="stat-card" data-testid="card-total-schools">
                      <div className="stat-value">{results.summary.total_analyzed}</div>
                      <div className="stat-label">{language === 'ko' ? '분석된 대학' : 'Schools Analyzed'}</div>
                    </div>
                    <div className="stat-card safety" data-testid="card-safety">
                      <div className="stat-value">{results.summary.safety_schools}</div>
                      <div className="stat-label">{language === 'ko' ? '안전권' : 'Safety'}</div>
                    </div>
                    <div className="stat-card target" data-testid="card-target">
                      <div className="stat-value">{results.summary.target_schools}</div>
                      <div className="stat-label">{language === 'ko' ? '적정권' : 'Target'}</div>
                    </div>
                    <div className="stat-card reach" data-testid="card-reach">
                      <div className="stat-value">{results.summary.reach_schools}</div>
                      <div className="stat-label">{language === 'ko' ? '상향권' : 'Reach'}</div>
                    </div>
                    <div className="stat-card prestige" data-testid="card-prestige">
                      <div className="stat-value">{results.summary.prestige_schools}</div>
                      <div className="stat-label">{language === 'ko' ? '명문' : 'Prestige'}</div>
                    </div>
                  </div>
                </div>

                {/* Safety Schools */}
                {results.recommendations.safety.length > 0 && (
                  <div className="school-category">
                    <h4 className="category-title safety" data-testid="title-safety-schools">
                      {language === 'ko' ? '안전권 대학 (상위 12개)' : 'Safety Schools (Top 12)'}
                      <span className="category-count">({results.recommendations.safety.length} {language === 'ko' ? '개 중' : 'total'})</span>
                    </h4>
                    <div className="schools-grid">
                      {getTopQualitySchools(results.recommendations.safety, 12).map((school, idx) => {
                        const universityId = findUniversityId(school.name);
                        const cardContent = (
                          <>
                            <div className="school-name">{getDisplayName(school.name)}</div>
                            <div className="school-state">{getDisplayLocation(school.name)}</div>
                            <div className="school-probability">
                              {language === 'ko' ? '합격 확률' : 'Admission Probability'}: <strong>{(school.probability * 100).toFixed(0)}%</strong>
                            </div>
                          </>
                        );
                        
                        return universityId ? (
                          <Link key={idx} to={`/university/${universityId}`} className="school-card clickable" data-testid={`school-safety-${idx}`}>
                            {cardContent}
                          </Link>
                        ) : (
                          <div key={idx} className="school-card" data-testid={`school-safety-${idx}`}>
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
                    <h4 className="category-title target" data-testid="title-target-schools">
                      {language === 'ko' ? '적정권 대학 (상위 12개)' : 'Target Schools (Top 12)'}
                      <span className="category-count">({results.recommendations.target.length} {language === 'ko' ? '개 중' : 'total'})</span>
                    </h4>
                    <div className="schools-grid">
                      {getTopQualitySchools(results.recommendations.target, 12).map((school, idx) => {
                        const universityId = findUniversityId(school.name);
                        const cardContent = (
                          <>
                            <div className="school-name">{getDisplayName(school.name)}</div>
                            <div className="school-state">{getDisplayLocation(school.name)}</div>
                            <div className="school-probability">
                              {language === 'ko' ? '합격 확률' : 'Admission Probability'}: <strong>{(school.probability * 100).toFixed(0)}%</strong>
                            </div>
                          </>
                        );
                        
                        return universityId ? (
                          <Link key={idx} to={`/university/${universityId}`} className="school-card clickable" data-testid={`school-target-${idx}`}>
                            {cardContent}
                          </Link>
                        ) : (
                          <div key={idx} className="school-card" data-testid={`school-target-${idx}`}>
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
                    <h4 className="category-title reach" data-testid="title-reach-schools">
                      {language === 'ko' ? '상향권 대학 (상위 12개)' : 'Reach Schools (Top 12)'}
                      <span className="category-count">({results.recommendations.reach.length} {language === 'ko' ? '개 중' : 'total'})</span>
                    </h4>
                    <div className="schools-grid">
                      {getTopQualitySchools(results.recommendations.reach, 12).map((school, idx) => {
                        const universityId = findUniversityId(school.name);
                        const cardContent = (
                          <>
                            <div className="school-name">{getDisplayName(school.name)}</div>
                            <div className="school-state">{getDisplayLocation(school.name)}</div>
                            <div className="school-probability">
                              {language === 'ko' ? '합격 확률' : 'Admission Probability'}: <strong>{(school.probability * 100).toFixed(0)}%</strong>
                            </div>
                          </>
                        );
                        
                        return universityId ? (
                          <Link key={idx} to={`/university/${universityId}`} className="school-card clickable" data-testid={`school-reach-${idx}`}>
                            {cardContent}
                          </Link>
                        ) : (
                          <div key={idx} className="school-card" data-testid={`school-reach-${idx}`}>
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
                    <h4 className="category-title prestige" data-testid="title-prestige-schools">
                      {language === 'ko' ? '명문 대학 (상위 12개)' : 'Prestige Schools (Top 12)'}
                      <span className="category-count">({results.recommendations.prestige.length} {language === 'ko' ? '개 중' : 'total'})</span>
                    </h4>
                    <div className="schools-grid">
                      {getTopQualitySchools(results.recommendations.prestige, 12).map((school, idx) => {
                        const universityId = findUniversityId(school.name);
                        const cardContent = (
                          <>
                            <div className="school-name">{getDisplayName(school.name)}</div>
                            <div className="school-state">{getDisplayLocation(school.name)}</div>
                            <div className="school-probability">
                              {language === 'ko' ? '합격 확률' : 'Admission Probability'}: <strong>{(school.probability * 100).toFixed(0)}%</strong>
                            </div>
                          </>
                        );
                        
                        return universityId ? (
                          <Link key={idx} to={`/university/${universityId}`} className="school-card clickable" data-testid={`school-prestige-${idx}`}>
                            {cardContent}
                          </Link>
                        ) : (
                          <div key={idx} className="school-card" data-testid={`school-prestige-${idx}`}>
                            {cardContent}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Link
                  to="/student-profile"
                  className="profile-calculator-button"
                  style={{ marginTop: '30px' }}
                  data-testid="button-full-analysis"
                >
                  <span>{t('home.calculator.button')}</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProfileCalculatorPage;
