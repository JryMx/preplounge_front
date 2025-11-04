import React, { useState } from 'react';
import { User, BookOpen, Award, Target, Plus, X, Search, Calculator, CheckCircle, ClipboardList, Sparkles, Loader2 } from 'lucide-react';
import { useStudentProfile, ExtracurricularActivity, RecommendationLetter, ApplicationComponents } from '../context/StudentProfileContext';
import { useLanguage } from '../context/LanguageContext';
import './student-profile-page.css';

const StudentProfilePage: React.FC = () => {
  const { profile, updateProfile, calculateProfileScore, searchSchools } = useStudentProfile();
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'academic' | 'non-academic'>('academic');
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string>('');

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
    setAcademicData(prev => ({ ...prev, [field]: value }));
  };

  const handleNonAcademicChange = (field: string, value: string | boolean) => {
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

  const handleSaveProfile = () => {
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
  };

  const handleGenerateAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisError('');
    
    try {
      const response = await fetch('http://localhost:3001/api/analyze-profile', {
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
        throw new Error('Failed to generate analysis');
      }

      const data = await response.json();
      setAiAnalysis(data.analysis);
    } catch (error) {
      console.error('Error generating analysis:', error);
      setAnalysisError(
        language === 'ko'
          ? '분석 생성 중 오류가 발생했습니다. 다시 시도해주세요.'
          : 'An error occurred while generating the analysis. Please try again.'
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

  const searchResults = searchQuery.trim() ? searchSchools(searchQuery) : [];
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

        {(profile || Object.values(academicData).some(v => v) || Object.values(nonAcademicData).some(v => v)) && (
          <div className="profile-calculator-section" style={{marginBottom: '24px', padding: '40px 32px', borderRadius: '16px'}}>
            <div className="profile-calculator-result-no-border" style={{width: '100%', height: '100%', maxWidth: '600px', margin: '0 auto'}}>
              <div className="profile-calculator-result-content">
                <div className="profile-calculator-score-group">
                  <span className="profile-calculator-score-label">
                    {language === 'ko' ? '프로필 점수' : 'Profile Score'}
                  </span>
                  <div className="profile-calculator-score-display">
                    <span className="profile-calculator-score-value">{currentScore === 0 ? '--' : currentScore}</span>
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
              </div>
            </div>
          </div>
        )}

        {/* AI Analysis Section */}
        <div className="profile-calculator-section" style={{marginBottom: '24px', padding: '32px', borderRadius: '16px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px'}}>
            <Sparkles className="h-6 w-6" style={{color: '#FACC15'}} />
            <h2 style={{fontSize: '24px', fontWeight: '600', color: '#082F49', margin: 0}}>
              {language === 'ko' ? 'AI 프로필 분석' : 'AI Profile Analysis'}
            </h2>
          </div>
          
          <p style={{fontSize: '14px', color: 'rgba(8, 47, 73, 0.7)', marginBottom: '20px'}}>
            {language === 'ko'
              ? '프로필을 입력한 후, AI 기반 심층 분석을 받아 강점과 개선 사항을 확인하세요.'
              : 'After filling in your profile, get an AI-powered in-depth analysis to identify your strengths and areas for improvement.'}
          </p>

          <button
            onClick={handleGenerateAnalysis}
            disabled={isAnalyzing || currentScore === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              backgroundColor: currentScore === 0 ? '#E7E5E4' : '#FACC15',
              color: '#082F49',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: currentScore === 0 ? 'not-allowed' : 'pointer',
              opacity: isAnalyzing ? 0.7 : 1,
              transition: 'all 0.2s'
            }}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {language === 'ko' ? '분석 중...' : 'Analyzing...'}
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                {language === 'ko' ? 'AI 분석 생성' : 'Generate AI Analysis'}
              </>
            )}
          </button>

          {analysisError && (
            <div style={{
              marginTop: '16px',
              padding: '12px 16px',
              backgroundColor: '#FEE2E2',
              border: '1px solid #FECACA',
              borderRadius: '8px',
              color: '#991B1B',
              fontSize: '14px'
            }}>
              {analysisError}
            </div>
          )}

          {aiAnalysis && (
            <div style={{
              marginTop: '24px',
              padding: '24px',
              backgroundColor: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: '12px',
            }}>
              <div style={{
                fontSize: '14px',
                lineHeight: '1.8',
                color: '#082F49',
                whiteSpace: 'pre-wrap'
              }}>
                {aiAnalysis}
              </div>
            </div>
          )}
        </div>

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
              {language === 'ko' ? '비교과' : 'Extracurricular'}
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
                  {language === 'ko' ? '비교과 정보' : 'Extracurricular Information'}
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
                  <p style={{fontSize: '12px', color: 'rgba(8, 47, 73, 0.6)', marginTop: '8px'}}>
                    {nonAcademicData.personalStatement.length} {language === 'ko' ? '글자' : 'characters'}
                  </p>
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
                              value={activity.hoursPerWeek}
                              onChange={(e) => updateExtracurricular(activity.id, 'hoursPerWeek', parseInt(e.target.value) || 0)}
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
              {language === 'ko' ? '학교 비교' : 'School Comparison'}
            </h2>
          
            <div style={{display: 'flex', gap: '12px', marginBottom: '24px'}}>
              <div style={{flex: 1, position: 'relative'}}>
                <Search className="h-5 w-5" style={{position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(8, 47, 73, 0.4)'}} />
                <input
                  type="text"
                  placeholder={language === 'ko' ? '학교명으로 검색...' : 'Search by school name...'}
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

            {showResults && searchResults.length > 0 && (
              <div>
                <h3 className="profile-form-label" style={{marginBottom: '16px'}}>
                  {language === 'ko' ? '검색 결과' : 'Search Results'}
                </h3>
                {searchResults.map(school => (
                  <div
                    key={school.id}
                    className="extracurricular-card"
                    style={{
                      borderColor: school.category === 'safety' ? '#FACC15' : school.category === 'target' ? '#F59E0B' : '#EF4444',
                      background: school.category === 'safety' ? '#FFFBEB' : school.category === 'target' ? '#FFF7ED' : '#FEE2E2',
                      marginBottom: '16px'
                    }}
                  >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900">{school.name}</h4>
                      <p className="text-sm text-gray-600">
                        #{school.ranking} • {language === 'ko' ? '합격률' : 'Acceptance Rate'} {school.acceptanceRate}%
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        school.category === 'safety' ? 'bg-green-100 text-green-800' :
                        school.category === 'target' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {language === 'ko' ? (
                          school.category === 'safety' ? '안전권' : 
                          school.category === 'target' ? '적정권' : '도전권'
                        ) : (
                          school.category === 'safety' ? 'Safety' : 
                          school.category === 'target' ? 'Target' : 'Reach'
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4 mt-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">{language === 'ko' ? '필요 점수:' : 'Required Score:'}</span>
                      <span className="ml-2 font-bold">{school.requiredScore}/100</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">{language === 'ko' ? '내 점수:' : 'My Score:'}</span>
                      <span className="ml-2 font-bold">{currentScore}/100</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">{language === 'ko' ? '비율:' : 'Ratio:'}</span>
                      <span className="ml-2 font-bold">{school.comparisonRatio}</span>
                    </div>
                  </div>
                </div>
              ))}
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
                <p>프로필을 완성하고 비교 결과를 확인하세요.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
