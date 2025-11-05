import React, { useState, useRef } from 'react';
import { User, BookOpen, Award, Target, Plus, X, Search, Calculator, CheckCircle, ClipboardList, Loader2 } from 'lucide-react';
import { useStudentProfile, ExtracurricularActivity, RecommendationLetter, ApplicationComponents } from '../context/StudentProfileContext';
import { useLanguage } from '../context/LanguageContext';
import universitiesData from '../data/universities.json';
import './student-profile-page.css';

interface School {
  name: string;
  state: string;
  probability: number;
  quality_score: number;
  category?: 'safety' | 'target' | 'reach' | 'prestige';
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
  };
  recommendations: {
    safety: School[];
    target: School[];
    reach: School[];
    prestige: School[];
  };
}

interface AnalysisResult {
  strengths: string[];
  weaknesses: string[];
}

// Helper function to match API school name to database ID
const findUniversityId = (bilingualName: string): string | null => {
  // API returns names like "Harvard University (하버드 대학교)"
  // Extract English name (before parenthesis)
  const englishMatch = bilingualName.match(/^([^(]+)/);
  const englishName = englishMatch ? englishMatch[1].trim() : '';
  
  // Extract Korean name (inside parenthesis)
  const koreanMatch = bilingualName.match(/\(([^)]+)\)/);
  const koreanName = koreanMatch ? koreanMatch[1].trim() : '';
  
  // Search for matching university in database
  const university = universitiesData.find((uni: any) => {
    const dbEnglish = uni.englishName?.toLowerCase() || '';
    const dbKorean = uni.name?.toLowerCase() || '';
    const searchEnglish = englishName.toLowerCase();
    const searchKorean = koreanName.toLowerCase();
    
    // Match either English or Korean name
    return (searchEnglish && dbEnglish.includes(searchEnglish)) || 
           (searchKorean && dbKorean.includes(searchKorean)) ||
           (searchEnglish && dbEnglish === searchEnglish);
  });
  
  return university ? university.id : null;
};

const StudentProfilePage: React.FC = () => {
  const { profile, updateProfile, calculateProfileScore, searchSchools } = useStudentProfile();
  const { language } = useLanguage();

  const profileScoreRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'academic' | 'non-academic'>('academic');
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | AnalysisResult>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string>('');
  const [apiResults, setApiResults] = useState<APIResponse | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string>('');
  const [visibleSchools, setVisibleSchools] = useState<{[key: string]: number}>({
    safety: 3,
    target: 3,
    reach: 3,
    prestige: 3
  });

  const [applicationComponents, setApplicationComponents] = useState<ApplicationComponents>(
    profile?.applicationComponents || {
      secondarySchoolGPA: false,
      secondarySchoolRank: false,
      secondarySchoolRecord: false,
      collegePrepProgram: false,
      recommendations: false,
      extracurricularActivities: false,
      essay: false,
      testScores: false,
    }
  );

  const [academicData, setAcademicData] = useState({
    gpa: profile?.gpa?.toString() || '',
    highSchoolType: '',
    standardizedTest: profile?.satEBRW && profile?.satMath ? 'SAT' : profile?.actScore ? 'ACT' : '',
    satEBRW: profile?.satEBRW?.toString() || '',
    satMath: profile?.satMath?.toString() || '',
    actScore: profile?.actScore?.toString() || '',
    englishProficiencyTest: profile?.toeflScore ? 'TOEFL iBT' : '',
    englishTestScore: profile?.toeflScore?.toString() || '',
    intendedMajor: profile?.intendedMajor || '',
  });

  const [nonAcademicData, setNonAcademicData] = useState({
    personalStatement: profile?.personalStatement || '',
    legacyStatus: profile?.legacyStatus || false,
    citizenship: profile?.citizenship || 'domestic',
  });

  const [extracurriculars, setExtracurriculars] = useState<ExtracurricularActivity[]>(
    profile?.extracurriculars || []
  );

  const [recommendationLetters, setRecommendationLetters] = useState<RecommendationLetter[]>(
    profile?.recommendationLetters || []
  );

  const handleAcademicChange = (field: string, value: string) => {
    if (field === 'gpa') {
      const numValue = parseFloat(value);
      if (value && (numValue < 0 || numValue > 4.0)) {
        return;
      }
    }
    setAcademicData(prev => ({ ...prev, [field]: value }));
  };

  const handleNonAcademicChange = (field: string, value: string | boolean) => {
    if (field === 'personalStatement' && typeof value === 'string') {
      const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
      if (wordCount > 650) {
        return;
      }
    }
    setNonAcademicData(prev => ({ ...prev, [field]: value }));
  };

  const handleApplicationComponentChange = (component: keyof ApplicationComponents, value: boolean) => {
    setApplicationComponents(prev => ({ ...prev, [component]: value }));
  };

  const addExtracurricular = () => {
    const newActivity: ExtracurricularActivity = {
      id: Date.now().toString(),
      type: 'Other',
      name: '',
      description: '',
      grades: [],
      recognitionLevel: 'Local',
      hoursPerWeek: 0,
    };
    setExtracurriculars(prev => [...prev, newActivity]);
  };

  const updateExtracurricular = (id: string, field: keyof ExtracurricularActivity, value: any) => {
    setExtracurriculars(prev =>
      prev.map(activity =>
        activity.id === id ? { ...activity, [field]: value } : activity
      )
    );
  };

  const removeExtracurricular = (id: string) => {
    setExtracurriculars(prev => prev.filter(activity => activity.id !== id));
  };

  const addRecommendationLetter = () => {
    const newLetter: RecommendationLetter = {
      id: Date.now().toString(),
      source: 'Teacher',
      depth: 'knows somewhat',
      relevance: 'not relevant or not available',
    };
    setRecommendationLetters(prev => [...prev, newLetter]);
  };

  const updateRecommendationLetter = (id: string, field: keyof RecommendationLetter, value: string) => {
    setRecommendationLetters(prev =>
      prev.map(letter =>
        letter.id === id ? { ...letter, [field]: value } : letter
      )
    );
  };

  const removeRecommendationLetter = (id: string) => {
    setRecommendationLetters(prev => prev.filter(letter => letter.id !== id));
  };

  const handleSaveProfile = async () => {
    // Set loading states immediately
    setApiLoading(true);
    setIsAnalyzing(true);
    setApiError('');
    setAnalysisError('');
    
    const profileData = {
      gpa: parseFloat(academicData.gpa) || 0,
      satEBRW: academicData.standardizedTest === 'SAT' ? parseInt(academicData.satEBRW) || 0 : 0,
      satMath: academicData.standardizedTest === 'SAT' ? parseInt(academicData.satMath) || 0 : 0,
      actScore: academicData.standardizedTest === 'ACT' ? parseInt(academicData.actScore) || 0 : 0,
      apCourses: 0,
      ibScore: 0,
      toeflScore: academicData.englishProficiencyTest === 'TOEFL iBT' ? parseInt(academicData.englishTestScore) || 0 : 0,
      intendedMajor: academicData.intendedMajor,
      personalStatement: nonAcademicData.personalStatement,
      legacyStatus: nonAcademicData.legacyStatus,
      citizenship: nonAcademicData.citizenship as 'domestic' | 'international',
      extracurriculars,
      recommendationLetters,
      applicationComponents,
      leadership: [],
      volunteering: [],
      awards: [],
    };

    updateProfile(profileData);
    setShowResults(true);
    
    // Scroll to profile score section
    setTimeout(() => {
      profileScoreRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
    
    // Fetch school recommendations from PrepLounge API
    try {
      let apiUrl = 'https://dev.preplounge.ai/?';
      apiUrl += `gpa=${profileData.gpa}`;
      
      if (academicData.standardizedTest === 'SAT' && academicData.satMath && academicData.satEBRW) {
        apiUrl += `&sat_math=${academicData.satMath}&sat_english=${academicData.satEBRW}`;
      } else if (academicData.standardizedTest === 'ACT' && academicData.actScore) {
        apiUrl += `&act=${academicData.actScore}`;
      }

      const apiResponse = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!apiResponse.ok) {
        throw new Error(`API request failed: ${apiResponse.status} ${apiResponse.statusText}`);
      }
      
      const apiData: APIResponse = await apiResponse.json();
      console.log('API Response:', apiData);
      setApiResults(apiData);
      
      // Save ALL API recommendations to profile context (not just top 5)
      // Map API school names to real database IDs
      const allRecommendations = [
        ...(apiData.recommendations.safety || []).map((school, index) => {
          const universityId = findUniversityId(school.name);
          return {
            universityId: universityId || `safety-${index}`, // Use real DB ID
            universityName: school.name, // Full bilingual name
            universityState: school.state || '', // State from API
            category: 'safety' as const,
            admissionChance: Math.round(school.probability * 100),
            strengthenAreas: [],
          };
        }),
        ...(apiData.recommendations.target || []).map((school, index) => {
          const universityId = findUniversityId(school.name);
          return {
            universityId: universityId || `target-${index}`,
            universityName: school.name,
            universityState: school.state || '',
            category: 'target' as const,
            admissionChance: Math.round(school.probability * 100),
            strengthenAreas: [],
          };
        }),
        ...(apiData.recommendations.reach || []).map((school, index) => {
          const universityId = findUniversityId(school.name);
          return {
            universityId: universityId || `reach-${index}`,
            universityName: school.name,
            universityState: school.state || '',
            category: 'reach' as const,
            admissionChance: Math.round(school.probability * 100),
            strengthenAreas: [],
          };
        }),
        ...(apiData.recommendations.prestige || []).map((school, index) => {
          const universityId = findUniversityId(school.name);
          return {
            universityId: universityId || `prestige-${index}`,
            universityName: school.name,
            universityState: school.state || '',
            category: 'prestige' as const,
            admissionChance: Math.round(school.probability * 100),
            strengthenAreas: [],
          };
        }),
      ];
      
      console.log(`Saved ${allRecommendations.length} total schools for search`);
      
      updateProfile({
        ...profileData,
        recommendations: allRecommendations,
      });
      
      // Reset visible schools to initial state (3 per category)
      setVisibleSchools({
        safety: 3,
        target: 3,
        reach: 3,
        prestige: 3
      });
    } catch (error) {
      console.error('Error fetching school recommendations:', error);
      setApiError(
        language === 'ko'
          ? '학교 추천을 가져오는 중 오류가 발생했습니다.'
          : 'An error occurred while fetching school recommendations.'
      );
      setApiResults(null);
    } finally {
      setApiLoading(false);
    }
    
    // Generate AI analysis
    try {
      const response = await fetch('/api/analyze-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          academicData,
          nonAcademicData,
          extracurriculars,
          recommendationLetters,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || 'Failed to generate analysis';
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setAiAnalysis(data.analysis);
    } catch (error) {
      console.error('Error generating analysis:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setAnalysisError(
        language === 'ko'
          ? '분석 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
          : `An error occurred while generating the analysis. ${errorMessage.includes('timeout') ? 'The request timed out. Please try again.' : 'Please try again later.'}`
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim() && profile) {
      setShowResults(true);
    }
  };

  const parseSchoolName = (name: string): string => {
    if (!name) return 'Unknown School';
    
    // Remove Korean text (in parentheses) when in English mode
    if (language === 'en') {
      return name.replace(/\s*\([^)]*[\uAC00-\uD7A3][^)]*\)/g, '').trim();
    }
    
    return name;
  };

  const parseLocation = (location: string): string => {
    if (!location) return '';
    
    // Remove Korean text (in parentheses) when in English mode
    if (language === 'en') {
      return location.replace(/\s*\([^)]*[\uAC00-\uD7A3][^)]*\)/g, '').trim();
    }
    
    return location;
  };

  const loadMoreSchools = (category: string) => {
    setVisibleSchools(prev => ({
      ...prev,
      [category]: prev[category] + 5
    }));
  };

  const searchResults = searchQuery.trim() ? searchSchools(searchQuery, language) : [];
  const currentScore = calculateProfileScore({
    ...academicData,
    ...nonAcademicData,
    extracurriculars,
    recommendationLetters,
    gpa: parseFloat(academicData.gpa) || 0,
    satEBRW: academicData.standardizedTest === 'SAT' ? parseInt(academicData.satEBRW) || 0 : 0,
    satMath: academicData.standardizedTest === 'SAT' ? parseInt(academicData.satMath) || 0 : 0,
    actScore: academicData.standardizedTest === 'ACT' ? parseInt(academicData.actScore) || 0 : 0,
    apCourses: 0,
    ibScore: 0,
    toeflScore: academicData.englishProficiencyTest === 'TOEFL iBT' ? parseInt(academicData.englishTestScore) || 0 : 0,
  });

  return (
    <div className="student-profile-page">
      <div className="profile-hero-section">
        <div className="profile-hero-content">
          <h1 className="profile-hero-title">
            {language === 'ko' ? '프로필 분석' : 'Profile Analysis'}
          </h1>
          <p className="profile-hero-description">
            {language === 'ko' 
              ? '교과 및 비교과 프로필을 완성하여 종합적인 프로필 점수와 개인 맞춤 대학 추천을 받아보세요.'
              : 'Complete your academic and extracurricular profile to receive a comprehensive profile score and personalized university recommendations.'}
          </p>
          <div style={{
            marginTop: '24px',
            padding: '16px 20px',
            backgroundColor: 'rgba(250, 204, 21, 0.1)',
            border: '1px solid rgba(250, 204, 21, 0.3)',
            borderRadius: '12px',
            fontSize: '14px',
            lineHeight: '1.6',
            color: '#082F49'
          }}>
            {language === 'ko' ? (
              <>
                예측 결과는 입력된 정보와 공개 데이터를 기반으로 제공되는 참고용 자료입니다.
                본 결과는 전문적인 판단이나 확정적인 근거로 사용할 수 없으며, 실제 합격 여부는 지원 경쟁률 등 다양한 요인에 따라 달라질 수 있습니다.
              </>
            ) : (
              <>
                The prediction results are provided based on the entered data and public information for reference purposes only.
                They should not be used as professional advice or definitive guidance, as actual admission outcomes may vary depending on multiple factors such as competition levels.
              </>
            )}
          </div>
        </div>
      </div>

      <div className="profile-container">

        {showResults && (
          <div ref={profileScoreRef} className="profile-calculator-section" style={{marginBottom: '24px', padding: '40px 32px', borderRadius: '16px'}}>
            <div className="profile-calculator-result-no-border" style={{width: '100%', height: '100%', maxWidth: '600px', margin: '0 auto'}}>
              
              {/* Loading Animation */}
              {isAnalyzing && (
                <div className="analysis-loading-container">
                  <div className="analysis-loading-pulse">
                    <div className="pulse-ring pulse-ring-1"></div>
                    <div className="pulse-ring pulse-ring-2"></div>
                    <div className="pulse-ring pulse-ring-3"></div>
                    <Loader2 className="analysis-spinner" size={32} />
                  </div>
                  <h3 className="analysis-loading-title">
                    {language === 'ko' ? '프로필 분석 중...' : 'Analyzing Your Profile...'}
                  </h3>
                  <p className="analysis-loading-subtitle">
                    {language === 'ko' ? '잠시만 기다려 주세요, 프로필을 분석하고 있습니다' : 'Give us a minute, we\'re analyzing your profile'}
                  </p>
                  <div className="analysis-loading-dots">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </div>
              )}

              {/* Results - Only show after analysis is complete */}
              {!isAnalyzing && aiAnalysis && (
                <div className="profile-calculator-result-content analysis-results-fade-in">
                  <div className="profile-calculator-score-group">
                    <span className="profile-calculator-score-label">
                      {language === 'ko' ? '프로필 점수' : 'Profile Score'}
                    </span>
                    <div className="profile-calculator-score-display score-pop-in">
                      <span className="profile-calculator-score-value">{currentScore}</span>
                      <span className="profile-calculator-score-total">/100</span>
                    </div>
                </div>
                <p className="profile-calculator-description">
                  {language === 'ko' ? (
                    currentScore === 0 ? '개선 필요' :
                    currentScore >= 90 ? '우수함' :
                    currentScore >= 80 ? '매우 좋음' :
                    currentScore >= 70 ? '좋음' :
                    currentScore >= 60 ? '보통' : '개선 필요'
                  ) : (
                    currentScore === 0 ? 'Needs Improvement' :
                    currentScore >= 90 ? 'Excellent' :
                    currentScore >= 80 ? 'Very Good' :
                    currentScore >= 70 ? 'Good' :
                    currentScore >= 60 ? 'Fair' : 'Needs Improvement'
                  )}
                </p>
                
                <div className="ai-analysis-container">
                  <div className="ai-analysis-header">
                    <span className="ai-analysis-icon">✨</span>
                    <span className="ai-analysis-title">
                      {language === 'ko' ? '프로필 분석 결과' : 'Here\'s Our Analysis of Your Profile'}
                    </span>
                  </div>
                  
                  {typeof aiAnalysis === 'string' ? (
                    <p className="ai-analysis-text">{aiAnalysis}</p>
                  ) : aiAnalysis && typeof aiAnalysis === 'object' && 'strengths' in aiAnalysis && 'weaknesses' in aiAnalysis ? (
                    <div className="ai-analysis-table">
                      <div className="ai-analysis-column strengths-column">
                        <div className="ai-analysis-column-header strengths-header">
                          <span className="ai-analysis-column-icon">💪</span>
                          <span className="ai-analysis-column-title">
                            {language === 'ko' ? '강점' : 'Strengths'}
                          </span>
                        </div>
                        <ul className="ai-analysis-list">
                          {aiAnalysis.strengths.map((strength: string, idx: number) => (
                            <li key={idx} className="ai-analysis-item strengths-item">{strength}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="ai-analysis-column weaknesses-column">
                        <div className="ai-analysis-column-header weaknesses-header">
                          <span className="ai-analysis-column-icon">📈</span>
                          <span className="ai-analysis-column-title">
                            {language === 'ko' ? '개선할 점' : 'Areas to Improve'}
                          </span>
                        </div>
                        <ul className="ai-analysis-list">
                          {aiAnalysis.weaknesses.map((weakness: string, idx: number) => (
                            <li key={idx} className="ai-analysis-item weaknesses-item">{weakness}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <p className="ai-analysis-text">{JSON.stringify(aiAnalysis)}</p>
                  )}
                </div>
                </div>
              )}
              
              {/* Error Display */}
              {!isAnalyzing && analysisError && (
                <div className="analysis-error-container">
                  {analysisError}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="application-checker-section">
          <div className="application-checker-header">
            <ClipboardList className="h-6 w-6" style={{color: '#082F49'}} />
            <h2 className="application-checker-title">
              {language === 'ko' ? '지원서 구성 요소 체크리스트' : 'Application Components Checklist'}
            </h2>
          </div>

          <p className="application-checker-description">
            {language === 'ko' ? (
              <>
                완료했거나 가지고 있는 항목을 체크하세요. 지원 준비 상태를 확인하는 데 도움이 됩니다.<br></br>
                모든 항목이 필수는 아니며 학교마다 요구 사항이 다를 수 있습니다.
              </>
            ) : (
              <>
                Check the items you have completed or possess. This helps you assess your application readiness.<br></br>
                Not all items are required, and requirements vary by school.
              </>
            )}
          </p>

          <div className="application-components-grid">
              {[
                { key: 'secondarySchoolGPA', labelKo: '고등학교 GPA', labelEn: 'Secondary school GPA' },
                { key: 'secondarySchoolRank', labelKo: '고등학교 석차', labelEn: 'Secondary school rank' },
                { key: 'secondarySchoolRecord', labelKo: '고등학교 성적표', labelEn: 'Secondary school transcript' },
                { key: 'collegePrepProgram', labelKo: '대학 준비 프로그램', labelEn: 'College-preparatory program' },
                { key: 'recommendations', labelKo: '추천서', labelEn: 'Recommendations' },
                { key: 'extracurricularActivities', labelKo: '대외활동', labelEn: 'Extracurricular activities' },
                { key: 'essay', labelKo: '자기소개서/에세이', labelEn: 'Personal statement or essay' },
                { key: 'testScores', labelKo: '시험 점수', labelEn: 'Test scores' },
              ].map((component) => (
                <div
                  key={component.key}
                  className={`application-component-card ${
                    applicationComponents[component.key as keyof ApplicationComponents] ? 'checked' : ''
                  }`}
                  onClick={() => handleApplicationComponentChange(
                    component.key as keyof ApplicationComponents,
                    !applicationComponents[component.key as keyof ApplicationComponents]
                  )}
                >
                  <div className="application-component-content">
                    <div className="application-component-checkbox">
                      {applicationComponents[component.key as keyof ApplicationComponents] && (
                        <CheckCircle className="h-4 w-4" style={{color: '#082F49'}} />
                      )}
                    </div>
                    <div className="application-component-info">
                      <h3 className="application-component-label">
                        {language === 'ko' ? component.labelKo : component.labelEn}
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="profile-tabs-container">
          <div className="profile-tabs-nav">
            <button
              onClick={() => setActiveTab('academic')}
              className={`profile-tab-button ${activeTab === 'academic' ? 'active' : ''}`}
            >
              <BookOpen className="h-5 w-5" />
              {language === 'ko' ? '교과' : 'Academic'}
            </button>
            <button
              onClick={() => setActiveTab('non-academic')}
              className={`profile-tab-button ${activeTab === 'non-academic' ? 'active' : ''}`}
            >
              <Award className="h-5 w-5" />
              {language === 'ko' ? '비교과 및 에세이' : 'Essay & Extracurricular'}
            </button>
          </div>

          <div className="profile-tab-content">
            {activeTab === 'academic' && (
              <div>
                <h2 className="profile-section-title">
                  {language === 'ko' ? '교과 정보' : 'Academic Information'}
                </h2>

                <div className="profile-form-grid">
                  <div className="profile-form-group">
                    <label className="profile-form-label">
                      {language === 'ko' ? 'GPA (4.0 만점) *' : 'GPA (out of 4.0) *'}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="4.0"
                      value={academicData.gpa}
                      onChange={(e) => handleAcademicChange('gpa', e.target.value)}
                      className="profile-form-input"
                      placeholder="3.8"
                      required
                    />
                    <p style={{fontSize: '12px', color: 'rgba(8, 47, 73, 0.6)', marginTop: '4px'}}>
                      {language === 'ko' ? '0.0 - 4.0 범위로 입력하세요' : 'Enter a value between 0.0 and 4.0'}
                    </p>
                  </div>

                  <div className="profile-form-group">
                    <label className="profile-form-label">
                      {language === 'ko' ? '희망 전공' : 'Intended Major'}
                    </label>
                    <select
                      value={academicData.intendedMajor}
                      onChange={(e) => handleAcademicChange('intendedMajor', e.target.value)}
                      className="profile-form-select"
                    >
                      <option value="">{language === 'ko' ? '전공을 선택하세요' : 'Select a major'}</option>
                      <option value="Computer Science">{language === 'ko' ? '컴퓨터과학' : 'Computer Science'}</option>
                      <option value="Engineering">{language === 'ko' ? '공학' : 'Engineering'}</option>
                      <option value="Business">{language === 'ko' ? '경영학' : 'Business'}</option>
                      <option value="Medicine">{language === 'ko' ? '의학' : 'Medicine'}</option>
                      <option value="Liberal Arts">{language === 'ko' ? '인문학' : 'Liberal Arts'}</option>
                      <option value="Sciences">{language === 'ko' ? '자연과학' : 'Sciences'}</option>
                      <option value="Mathematics">{language === 'ko' ? '수학' : 'Mathematics'}</option>
                      <option value="Other">{language === 'ko' ? '기타' : 'Other'}</option>
                    </select>
                  </div>

                  <div className="profile-form-group full-width">
                    <label className="profile-form-label">
                      {language === 'ko' ? '입학 시험' : 'Standardized Test'}
                    </label>
                    <select
                      value={academicData.standardizedTest}
                      onChange={(e) => handleAcademicChange('standardizedTest', e.target.value)}
                      className="profile-form-select">
                      <option value="">{language === 'ko' ? '시험을 선택하세요 (선택사항)' : 'Select a test (optional)'}</option>
                      <option value="SAT">SAT</option>
                      <option value="ACT">ACT</option>
                    </select>
                  </div>

                  {academicData.standardizedTest === 'SAT' && (
                    <>
                      <div className="profile-form-group">
                        <label className="profile-form-label">
                          {language === 'ko' ? 'SAT EBRW (800점 만점)' : 'SAT EBRW (out of 800)'}
                        </label>
                        <input
                          type="number"
                          min="200"
                          max="800"
                          value={academicData.satEBRW}
                          onChange={(e) => handleAcademicChange('satEBRW', e.target.value)}
                          className="profile-form-input"
                          placeholder="720"
                        />
                      </div>

                      <div className="profile-form-group">
                        <label className="profile-form-label">
                          {language === 'ko' ? 'SAT Math (800점 만점)' : 'SAT Math (out of 800)'}
                        </label>
                        <input
                          type="number"
                          min="200"
                          max="800"
                          value={academicData.satMath}
                          onChange={(e) => handleAcademicChange('satMath', e.target.value)}
                          className="profile-form-input"
                          placeholder="730"
                        />
                      </div>
                    </>
                  )}

                  {academicData.standardizedTest === 'ACT' && (
                    <div className="profile-form-group">
                      <label className="profile-form-label">
                        {language === 'ko' ? 'ACT 점수 (36점 만점)' : 'ACT Score (out of 36)'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="36"
                        value={academicData.actScore}
                        onChange={(e) => handleAcademicChange('actScore', e.target.value)}
                        className="profile-form-input"
                        placeholder="32"
                      />
                    </div>
                  )}

                  <div className="profile-form-group full-width">
                    <label className="profile-form-label">
                      {language === 'ko' ? '영어 능력 시험 (국제학생용)' : 'English Proficiency Test (for international students)'}
                    </label>
                    <select
                      value={academicData.englishProficiencyTest}
                      onChange={(e) => handleAcademicChange('englishProficiencyTest', e.target.value)}
                      className="profile-form-select"
                    >
                      <option value="">{language === 'ko' ? '시험을 선택하세요 (선택사항)' : 'Select a test (optional)'}</option>
                      <option value="TOEFL iBT">TOEFL iBT</option>
                      <option value="IELTS">IELTS</option>
                      <option value="Cambridge">Cambridge</option>
                      <option value="PTE Academic Test">PTE Academic Test</option>
                      <option value="Duolingo English Test">Duolingo English Test</option>
                    </select>
                  </div>

                  {academicData.englishProficiencyTest && (
                    <div className="profile-form-group full-width">
                      <label className="profile-form-label">
                        {academicData.englishProficiencyTest} {language === 'ko' ? '점수' : 'Score'}
                        {academicData.englishProficiencyTest === 'TOEFL iBT' && (language === 'ko' ? ' (120점 만점)' : ' (out of 120)')}
                        {academicData.englishProficiencyTest === 'IELTS' && (language === 'ko' ? ' (9.0점 만점)' : ' (out of 9.0)')}
                        {academicData.englishProficiencyTest === 'Cambridge' && (language === 'ko' ? ' (A1-C2 레벨)' : ' (A1-C2 level)')}
                        {academicData.englishProficiencyTest === 'PTE Academic Test' && (language === 'ko' ? ' (90점 만점)' : ' (out of 90)')}
                        {academicData.englishProficiencyTest === 'Duolingo English Test' && (language === 'ko' ? ' (160점 만점)' : ' (out of 160)')}
                      </label>
                      <input
                        type={academicData.englishProficiencyTest === 'Cambridge' ? 'text' : 'number'}
                        min={academicData.englishProficiencyTest === 'IELTS' ? '0' : '0'}
                        max={
                          academicData.englishProficiencyTest === 'TOEFL iBT' ? '120' :
                          academicData.englishProficiencyTest === 'IELTS' ? '9' :
                          academicData.englishProficiencyTest === 'PTE Academic Test' ? '90' :
                          academicData.englishProficiencyTest === 'Duolingo English Test' ? '160' : undefined
                        }
                        step={academicData.englishProficiencyTest === 'IELTS' ? '0.5' : '1'}
                        value={academicData.englishTestScore}
                        onChange={(e) => handleAcademicChange('englishTestScore', e.target.value)}
                        className="profile-form-input"
                        placeholder={
                          academicData.englishProficiencyTest === 'TOEFL iBT' ? '105' :
                          academicData.englishProficiencyTest === 'IELTS' ? '7.5' :
                          academicData.englishProficiencyTest === 'Cambridge' ? 'C1' :
                          academicData.englishProficiencyTest === 'PTE Academic Test' ? '65' :
                          academicData.englishProficiencyTest === 'Duolingo English Test' ? '120' : ''
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'non-academic' && (
              <div>
                <h2 className="profile-section-title">
                  {language === 'ko' ? '비교과 정보 및 에세이' : 'Essay & Extracurricular Information'}
                </h2>

                <div className="profile-form-group full-width" style={{marginBottom: '32px'}}>
                  <label className="profile-form-label">
                    {language === 'ko' ? '자기소개서 (Common App 에세이)' : 'Personal Statement (Common App Essay)'}
                  </label>
                  <textarea
                    value={nonAcademicData.personalStatement}
                    onChange={(e) => handleNonAcademicChange('personalStatement', e.target.value)}
                    className="profile-form-textarea"
                    rows={8}
                    placeholder={language === 'ko' ? '자기소개서를 작성하세요...' : 'Write your personal statement...'}
                  />
                  {(() => {
                    const wordCount = nonAcademicData.personalStatement.trim() 
                      ? nonAcademicData.personalStatement.trim().split(/\s+/).length 
                      : 0;
                    const isNearLimit = wordCount > 600;
                    const isAtLimit = wordCount >= 650;
                    return (
                      <p style={{
                        fontSize: '12px', 
                        color: isAtLimit ? '#EF4444' : isNearLimit ? '#F59E0B' : 'rgba(8, 47, 73, 0.6)', 
                        marginTop: '8px',
                        fontWeight: isAtLimit ? '600' : '400'
                      }}>
                        {wordCount} / 650 {language === 'ko' ? '단어' : 'words'}
                        {isAtLimit && (
                          <span style={{marginLeft: '8px'}}>
                            ({language === 'ko' ? '최대 단어 수 도달' : 'Maximum word limit reached'})
                          </span>
                        )}
                      </p>
                    );
                  })()}
                </div>

                <div className="extracurriculars-section">
                  <div className="extracurriculars-header">
                    <h3 className="profile-section-title" style={{marginBottom: 0}}>
                      {language === 'ko' ? '대외활동' : 'Extracurricular Activities'}
                    </h3>
                    <button
                      onClick={addExtracurricular}
                      className="profile-btn-add"
                    >
                      <Plus className="h-4 w-4" />
                      {language === 'ko' ? '활동 추가' : 'Add Activity'}
                    </button>
                  </div>

                  <div style={{marginTop: '16px'}}>
                    {extracurriculars.map((activity, index) => (
                      <div key={activity.id} className="extracurricular-card">
                        <button
                          onClick={() => removeExtracurricular(activity.id)}
                          className="extracurricular-remove-btn"
                        >
                          <X className="h-5 w-5" />
                        </button>
                        <h4 className="profile-form-label" style={{marginBottom: '16px'}}>
                          {language === 'ko' ? `활동 ${index + 1}` : `Activity ${index + 1}`}
                        </h4>

                        <div className="profile-form-grid">
                          <div className="profile-form-group">
                            <label className="profile-form-label">
                              {language === 'ko' ? '활동 유형' : 'Activity Type'}
                            </label>
                            <select
                              value={activity.type}
                              onChange={(e) => updateExtracurricular(activity.id, 'type', e.target.value)}
                              className="profile-form-select"
                            >
                              <option value="Sports">{language === 'ko' ? '스포츠' : 'Sports'}</option>
                              <option value="Arts">{language === 'ko' ? '예술' : 'Arts'}</option>
                              <option value="Community Service">{language === 'ko' ? '봉사활동' : 'Community Service'}</option>
                              <option value="Research">{language === 'ko' ? '연구' : 'Research'}</option>
                              <option value="Academic Clubs">{language === 'ko' ? '학술 동아리' : 'Academic Clubs'}</option>
                              <option value="Leadership">{language === 'ko' ? '리더십' : 'Leadership'}</option>
                              <option value="Work Experience">{language === 'ko' ? '근무 경험' : 'Work Experience'}</option>
                              <option value="Other">{language === 'ko' ? '기타' : 'Other'}</option>
                            </select>
                          </div>

                          <div className="profile-form-group">
                            <label className="profile-form-label">
                              {language === 'ko' ? '활동명' : 'Activity Name'}
                            </label>
                            <input
                              type="text"
                              value={activity.name}
                              onChange={(e) => updateExtracurricular(activity.id, 'name', e.target.value)}
                              className="profile-form-input"
                              placeholder={language === 'ko' ? '예: 축구부' : 'e.g., Soccer Club'}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {language === 'ko' ? '참여 학년 (해당하는 모든 학년 선택)' : 'Participation Grades (select all applicable)'}
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                              {['9', '10', '11', '12'].map(grade => (
                                <label key={grade} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={activity.grades?.includes(grade) || false}
                                    onChange={(e) => {
                                      const currentGrades = activity.grades || [];
                                      const newGrades = e.target.checked
                                        ? [...currentGrades, grade]
                                        : currentGrades.filter(g => g !== grade);
                                      updateExtracurricular(activity.id, 'grades', newGrades);
                                    }}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                                  />
                                  <span className="text-sm">{grade}{language === 'ko' ? '학년' : 'th'}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="profile-form-group">
                            <label className="profile-form-label">
                              {language === 'ko' ? '인정 수준' : 'Recognition Level'}
                            </label>
                            <select
                              value={activity.recognitionLevel}
                              onChange={(e) => updateExtracurricular(activity.id, 'recognitionLevel', e.target.value)}
                              className="profile-form-select"
                            >
                              <option value="Local">{language === 'ko' ? '지역' : 'Local'}</option>
                              <option value="Regional">{language === 'ko' ? '광역' : 'Regional'}</option>
                              <option value="National">{language === 'ko' ? '전국' : 'National'}</option>
                              <option value="International">{language === 'ko' ? '국제' : 'International'}</option>
                            </select>
                          </div>

                          <div className="profile-form-group">
                            <label className="profile-form-label">
                              {language === 'ko' ? '주당 시간' : 'Hours per Week'}
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="40"
                              value={activity.hoursPerWeek || ''}
                              onChange={(e) => {
                                const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                                updateExtracurricular(activity.id, 'hoursPerWeek', isNaN(val) ? 0 : val);
                              }}
                              className="profile-form-input"
                              placeholder="10"
                            />
                          </div>
                        </div>

                        <div className="profile-form-group full-width" style={{marginTop: '16px'}}>
                          <label className="profile-form-label">
                            {language === 'ko' ? '설명' : 'Description'}
                          </label>
                          <textarea
                            value={activity.description}
                            onChange={(e) => updateExtracurricular(activity.id, 'description', e.target.value)}
                            className="profile-form-textarea"
                            rows={2}
                            placeholder={language === 'ko' ? '역할과 성과를 설명하세요...' : 'Describe your role and achievements...'}
                          />
                        </div>
                      </div>
                    ))}

                    {extracurriculars.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>{language === 'ko' ? '아직 추가된 대외활동이 없습니다.' : 'No extracurricular activities added yet.'}</p>
                        <p className="text-sm">{language === 'ko' ? '"활동 추가"를 클릭하여 시작하세요.' : 'Click "Add Activity" to get started.'}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="extracurriculars-section">
                  <div className="extracurriculars-header">
                    <h3 className="profile-section-title" style={{marginBottom: 0}}>
                      {language === 'ko' ? '추천서' : 'Recommendation Letters'}
                    </h3>
                    <button
                      onClick={addRecommendationLetter}
                      className="profile-btn-add"
                    >
                      <Plus className="h-4 w-4" />
                      {language === 'ko' ? '추천서 추가' : 'Add Recommendation'}
                    </button>
                  </div>

                  <div style={{marginTop: '16px'}}>
                    {recommendationLetters.map((letter, index) => (
                      <div key={letter.id} className="extracurricular-card">
                        <button
                          onClick={() => removeRecommendationLetter(letter.id)}
                          className="extracurricular-remove-btn"
                        >
                          <X className="h-5 w-5" />
                        </button>
                        <h4 className="profile-form-label" style={{marginBottom: '16px'}}>
                          {language === 'ko' ? `추천서 ${index + 1}` : `Recommendation ${index + 1}`}
                        </h4>

                        <div className="profile-form-grid">
                          <div className="profile-form-group">
                            <label className="profile-form-label">
                              {language === 'ko' ? '추천인' : 'Recommender'}
                            </label>
                            <select
                              value={letter.source}
                              onChange={(e) => updateRecommendationLetter(letter.id, 'source', e.target.value)}
                              className="profile-form-select"
                            >
                              <option value="Teacher">{language === 'ko' ? '교사' : 'Teacher'}</option>
                              <option value="Counselor">{language === 'ko' ? '상담교사' : 'Counselor'}</option>
                              <option value="Principal">{language === 'ko' ? '교장' : 'Principal'}</option>
                              <option value="Coach">{language === 'ko' ? '코치' : 'Coach'}</option>
                              <option value="Employer">{language === 'ko' ? '고용주' : 'Employer'}</option>
                              <option value="Other">{language === 'ko' ? '기타' : 'Other'}</option>
                            </select>
                          </div>

                          <div className="profile-form-group">
                            <label className="profile-form-label">
                              {language === 'ko' ? '관계의 깊이' : 'Depth of Relationship'}
                            </label>
                            <select
                              value={letter.depth || 'knows somewhat'}
                              onChange={(e) => updateRecommendationLetter(letter.id, 'depth', e.target.value)}
                              className="profile-form-select"
                            >
                              <option value="knows deeply">{language === 'ko' ? '깊이 알고 있음' : 'Knows deeply'}</option>
                              <option value="knows somewhat">{language === 'ko' ? '어느 정도 알고 있음' : 'Knows somewhat'}</option>
                              <option value="barely knows">{language === 'ko' ? '거의 모름' : 'Barely knows'}</option>
                            </select>
                          </div>

                          <div className="profile-form-group">
                            <label className="profile-form-label">
                              {language === 'ko' ? '과목/분야 관련성' : 'Subject/Field Relevance'}
                            </label>
                            <select
                              value={letter.relevance || 'not relevant or not available'}
                              onChange={(e) => updateRecommendationLetter(letter.id, 'relevance', e.target.value)}
                              className="profile-form-select"
                            >
                              <option value="highly relevant to intended major">{language === 'ko' ? '희망 전공과 매우 관련 있음' : 'Highly relevant to intended major'}</option>
                              <option value="somewhat relevant to intended major">{language === 'ko' ? '희망 전공과 어느 정도 관련 있음' : 'Somewhat relevant to intended major'}</option>
                              <option value="not relevant or not available">{language === 'ko' ? '관련 없음 또는 해당 없음' : 'Not relevant or not available'}</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}

                    {recommendationLetters.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>{language === 'ko' ? '아직 추가된 추천서가 없습니다.' : 'No recommendation letters added yet.'}</p>
                        <p className="text-sm">{language === 'ko' ? '"추천서 추가"를 클릭하여 시작하세요.' : 'Click "Add Recommendation" to get started.'}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ko' ? '가족 내 동문 여부' : 'Legacy Status'}
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="legacyStatus"
                          checked={nonAcademicData.legacyStatus === true}
                          onChange={() => handleNonAcademicChange('legacyStatus', true)}
                          className="mr-2"
                        />
                        {language === 'ko' ? '예' : 'Yes'}
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="legacyStatus"
                          checked={nonAcademicData.legacyStatus === false}
                          onChange={() => handleNonAcademicChange('legacyStatus', false)}
                          className="mr-2"
                        />
                        {language === 'ko' ? '아니오' : 'No'}
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'ko' ? '시민권' : 'Citizenship'}
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="citizenship"
                          checked={nonAcademicData.citizenship === 'domestic'}
                          onChange={() => handleNonAcademicChange('citizenship', 'domestic')}
                          className="mr-2"
                        />
                        {language === 'ko' ? '국내' : 'Domestic'}
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="citizenship"
                          checked={nonAcademicData.citizenship === 'international'}
                          onChange={() => handleNonAcademicChange('citizenship', 'international')}
                          className="mr-2"
                        />
                        {language === 'ko' ? '국제' : 'International'}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="profile-actions" style={{padding: '0 32px 32px'}}>
            <button
              onClick={handleSaveProfile}
              disabled={!academicData.gpa || parseFloat(academicData.gpa) === 0}
              className="profile-btn-primary" style={{width: '100%'}}
            >
              <Calculator className="h-5 w-5" />
              {language === 'ko' ? '프로필 점수 계산하기' : 'Calculate Profile Score'}
            </button>
          </div>
        </div>

        <div className="profile-tabs-container">
          <div className="profile-tab-content">
            <h2 className="profile-section-title">
              {language === 'ko' ? '학교 추천 및 비교' : 'School Recommendations & Comparison'}
            </h2>
          
            <div style={{display: 'flex', gap: '12px', marginBottom: '24px'}}>
              <div style={{flex: 1, position: 'relative'}}>
                <Search className="h-5 w-5" style={{position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(8, 47, 73, 0.4)'}} />
                <input
                  type="text"
                  placeholder={language === 'ko' ? '특정 학교명으로 검색하기 (선택사항)' : 'Search for a specific school (optional)'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="profile-form-input"
                  style={{width: '100%', paddingLeft: '48px'}}
                />
              </div>
              <button
                onClick={handleSearch}
                className="profile-btn-primary"
              >
                {language === 'ko' ? '검색' : 'Search'}
              </button>
            </div>

            {/* Automatic recommendations when profile exists and no search */}
            {!searchQuery.trim() && showResults && apiResults && (
              <div>
                <h3 className="profile-form-label" style={{marginBottom: '16px'}}>
                  {language === 'ko' ? '내 프로필 점수에 맞는 추천 학교' : 'Recommended Schools for Your Profile'}
                </h3>
                <p style={{fontSize: '14px', color: '#64748B', marginBottom: '24px'}}>
                  {language === 'ko' 
                    ? '안전권: 합격 가능성이 높은 학교 | 적정권: 합격 가능성이 적당한 학교 | 도전권: 합격이 도전적인 학교 | 명문권: 최상위 학교'
                    : 'Safety: High chance of admission | Target: Moderate chance | Reach: Competitive | Prestige: Top-tier schools'}
                </p>
                
                {/* Loading state */}
                {apiLoading && (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" style={{color: '#FACC15'}} />
                    <p className="text-gray-600">
                      {language === 'ko' ? '학교 추천을 가져오는 중...' : 'Fetching school recommendations...'}
                    </p>
                  </div>
                )}
                
                {/* Error state */}
                {apiError && (
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#FEE2E2',
                    border: '1px solid #FECACA',
                    borderRadius: '12px',
                    color: '#991B1B',
                    fontSize: '14px',
                    marginBottom: '16px'
                  }}>
                    {apiError}
                  </div>
                )}
                
                {/* Display recommendations from API */}
                {!apiLoading && !apiError && apiResults && (
                  <>
                    {['safety', 'target', 'reach', 'prestige'].map(category => {
                      const schools = apiResults.recommendations[category as keyof typeof apiResults.recommendations];
                      if (!schools || schools.length === 0) return null;
                      
                      const visibleCount = visibleSchools[category];
                      const displayedSchools = schools.slice(0, visibleCount);
                      const hasMore = schools.length > visibleCount;
                      const remainingCount = schools.length - visibleCount;
                      
                      return (
                        <div key={category} style={{ marginBottom: '32px' }}>
                          <h4 className="text-lg font-semibold mb-3" style={{ color: '#082F49' }}>
                            {language === 'ko' ? (
                              category === 'safety' ? '안전권 학교' : 
                              category === 'target' ? '적정권 학교' : 
                              category === 'reach' ? '도전권 학교' : '명문권 학교'
                            ) : (
                              category === 'safety' ? 'Safety Schools' : 
                              category === 'target' ? 'Target Schools' : 
                              category === 'reach' ? 'Reach Schools' : 'Prestige Schools'
                            )}
                            <span className="ml-2 text-sm font-normal text-gray-500">
                              ({displayedSchools.length}/{schools.length})
                            </span>
                          </h4>
                          
                          {displayedSchools.map((school, index) => (
                            <div
                              key={`${category}-${index}`}
                              className="extracurricular-card"
                              style={{
                                borderColor: category === 'safety' ? '#10B981' : category === 'target' ? '#F59E0B' : category === 'reach' ? '#EF4444' : '#8B5CF6',
                                background: category === 'safety' ? '#ECFDF5' : category === 'target' ? '#FFF7ED' : category === 'reach' ? '#FEE2E2' : '#F5F3FF',
                                marginBottom: '12px'
                              }}
                            >
                              <div className="flex justify-between items-start">
                                <div style={{ flex: 1 }}>
                                  <h4 className="font-semibold text-gray-900">{parseSchoolName(school.name)}</h4>
                                  <p className="text-sm text-gray-600">
                                    {school.state && parseLocation(school.state)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                    category === 'safety' ? 'bg-green-100 text-green-800' :
                                    category === 'target' ? 'bg-orange-100 text-orange-800' :
                                    category === 'reach' ? 'bg-red-100 text-red-800' :
                                    'bg-purple-100 text-purple-800'
                                  }`}>
                                    {language === 'ko' ? (
                                      category === 'safety' ? '안전권' : 
                                      category === 'target' ? '적정권' : 
                                      category === 'reach' ? '도전권' : '명문권'
                                    ) : (
                                      category === 'safety' ? 'Safety' : 
                                      category === 'target' ? 'Target' : 
                                      category === 'reach' ? 'Reach' : 'Prestige'
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="mt-4 text-sm">
                                <div>
                                  <span className="font-medium text-gray-600">{language === 'ko' ? '합격 가능성' : 'Admission Probability'}:</span>
                                  <span className="ml-2 font-bold text-lg" style={{ color: '#082F49' }}>
                                    {typeof school.probability === 'number' 
                                      ? `${(school.probability * 100).toFixed(1)}%` 
                                      : 'N/A'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {hasMore && (
                            <div className="text-center mt-3">
                              <button
                                onClick={() => loadMoreSchools(category)}
                                className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                                style={{
                                  backgroundColor: '#FCF8F0',
                                  color: '#082F49',
                                  border: '1px solid #FACC15',
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.backgroundColor = '#FACC15';
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.backgroundColor = '#FCF8F0';
                                }}
                              >
                                {language === 'ko' 
                                  ? `더 보기 (${remainingCount}개 남음)` 
                                  : `Load More (${remainingCount} remaining)`}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            )}

            {/* Search results when user searches */}
            {searchQuery.trim() && searchResults.length > 0 && (
              <div>
                <h3 className="profile-form-label" style={{marginBottom: '16px'}}>
                  {language === 'ko' ? '검색 결과' : 'Search Results'}
                </h3>
                {searchResults.map(school => {
                  const hasApiData = school.category !== undefined;
                  const categoryColor = 
                    school.category === 'safety' ? '#10B981' : 
                    school.category === 'target' ? '#F59E0B' : 
                    school.category === 'reach' ? '#EF4444' : 
                    school.category === 'prestige' ? '#8B5CF6' : '#D1D5DB';
                  const categoryBg = 
                    school.category === 'safety' ? '#ECFDF5' : 
                    school.category === 'target' ? '#FFF7ED' : 
                    school.category === 'reach' ? '#FEE2E2' : 
                    school.category === 'prestige' ? '#F5F3FF' : '#F9FAFB';
                  
                  return (
                    <div
                      key={school.id}
                      className="extracurricular-card"
                      style={{
                        borderColor: categoryColor,
                        background: categoryBg,
                        marginBottom: '12px'
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div style={{ flex: 1 }}>
                          <h4 className="font-semibold text-gray-900">{school.name}</h4>
                          <p className="text-sm text-gray-600">
                            #{school.ranking} • {language === 'ko' ? '합격률' : 'Acceptance Rate'} {school.acceptanceRate}%
                          </p>
                        </div>
                        {hasApiData && (
                          <div className="text-right">
                            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                              school.category === 'safety' ? 'bg-green-100 text-green-800' :
                              school.category === 'target' ? 'bg-orange-100 text-orange-800' :
                              school.category === 'reach' ? 'bg-red-100 text-red-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {language === 'ko' ? (
                                school.category === 'safety' ? '안전권' : 
                                school.category === 'target' ? '적정권' : 
                                school.category === 'reach' ? '도전권' : '명문권'
                              ) : (
                                school.category === 'safety' ? 'Safety' : 
                                school.category === 'target' ? 'Target' : 
                                school.category === 'reach' ? 'Reach' : 'Prestige'
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {hasApiData && (
                        <div className="mt-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">{language === 'ko' ? '합격 가능성' : 'Admission Probability'}:</span>
                            <span className="ml-2 font-bold text-lg" style={{ color: '#082F49' }}>
                              {school.admissionProbability}%
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {!hasApiData && (
                        <div className="mt-4 text-sm text-gray-500">
                          {language === 'ko' 
                            ? '프로필 점수를 계산하면 합격 가능성을 확인할 수 있습니다.' 
                            : 'Calculate your profile score to see admission probability.'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

          {showResults && searchResults.length === 0 && searchQuery.trim() && (
            <div className="text-center py-8 text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>
                {language === 'ko' 
                  ? `"${searchQuery}"와 일치하는 학교를 찾을 수 없습니다` 
                  : `No schools found matching "${searchQuery}"`}
              </p>
              <p className="text-sm">
                {language === 'ko' ? '다른 이름으로 검색해보세요.' : 'Try searching with a different name.'}
              </p>
            </div>
          )}

            {!showResults && (
              <div className="text-center py-8 text-gray-500">
                <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>
                  {language === 'ko' 
                    ? '프로필 점수를 먼저 계산하면 맞춤 학교 추천을 받을 수 있습니다.'
                    : 'Calculate your profile score first to see personalized school recommendations.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
