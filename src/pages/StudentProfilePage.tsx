import React, { useState } from 'react';
import { User, Search, Calculator, Plus, X, Target } from 'lucide-react';
import { useStudentProfile, RecommendationLetter } from '../context/StudentProfileContext';
import { useLanguage } from '../context/LanguageContext';
import './student-profile-page.css';

const StudentProfilePage: React.FC = () => {
  const { profile, updateProfile, calculateProfileScore, searchSchools } = useStudentProfile();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  // Academic form data
  const [academicData, setAcademicData] = useState({
    gpa: profile?.gpa?.toString() || '',
    standardizedTest: profile?.satEBRW && profile?.satMath ? 'SAT' : profile?.actScore ? 'ACT' : '',
    satEBRW: profile?.satEBRW?.toString() || '',
    satMath: profile?.satMath?.toString() || '',
    actScore: profile?.actScore?.toString() || '',
  });

  // Legacy and citizenship data
  const [legacyStatus, setLegacyStatus] = useState(profile?.legacyStatus || false);
  const [citizenship, setCitizenship] = useState(profile?.citizenship || 'domestic');

  const [recommendationLetters, setRecommendationLetters] = useState<RecommendationLetter[]>(
    profile?.recommendationLetters || []
  );

  const handleAcademicChange = (field: string, value: string) => {
    setAcademicData(prev => ({ ...prev, [field]: value }));
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
      toeflScore: 0,
      intendedMajor: '',
      personalStatement: '',
      legacyStatus,
      citizenship: citizenship as 'domestic' | 'international',
      extracurriculars: [],
      recommendationLetters,
      applicationComponents: {
        secondarySchoolGPA: false,
        secondarySchoolRank: false,
        secondarySchoolRecord: false,
        collegePrepProgram: false,
        recommendations: false,
        extracurricularActivities: false,
        essay: false,
        testScores: false,
      },
      // Legacy fields for compatibility
      leadership: [],
      volunteering: [],
      awards: [],
    };

    updateProfile(profileData);
    setShowResults(true);
  };

  const handleSearch = () => {
    if (searchQuery.trim() && profile) {
      setShowResults(true);
    }
  };

  const searchResults = searchQuery.trim() ? searchSchools(searchQuery) : [];
  const currentScore = calculateProfileScore({
    gpa: parseFloat(academicData.gpa) || 0,
    satEBRW: academicData.standardizedTest === 'SAT' ? parseInt(academicData.satEBRW) || 0 : 0,
    satMath: academicData.standardizedTest === 'SAT' ? parseInt(academicData.satMath) || 0 : 0,
    actScore: academicData.standardizedTest === 'ACT' ? parseInt(academicData.actScore) || 0 : 0,
    apCourses: 0,
    ibScore: 0,
    toeflScore: 0,
    personalStatement: '',
    legacyStatus,
    citizenship,
    extracurriculars: [],
    recommendationLetters,
  });

  return (
    <div className="student-profile-page">
      <div className="profile-hero-section">
        <div className="profile-hero-content">
          <h1 className="profile-hero-title">
            {t('profile.hero.title')}
          </h1>
          <p className="profile-hero-description">
            {t('profile.hero.description')}
          </p>
        </div>
      </div>

      <div className="profile-container">

        {(profile || Object.values(academicData).some(v => v) || legacyStatus || citizenship !== 'domestic') && (
          <div className="profile-calculator-section" style={{marginBottom: '24px', padding: '40px 32px', borderRadius: '16px'}}>
            <div className="profile-calculator-result-no-border" style={{width: '100%', height: '100%', maxWidth: '600px', margin: '0 auto'}}>
              <div className="profile-calculator-result-content">
                <div className="profile-calculator-score-group">
                  <span className="profile-calculator-score-label">{t('profile.score.label')}</span>
                  <div className="profile-calculator-score-display">
                    <span className="profile-calculator-score-value">{currentScore === 0 ? '--' : currentScore}</span>
                    <span className="profile-calculator-score-total">/100</span>
                  </div>
                </div>
                <p className="profile-calculator-description">
                  {currentScore === 0 ? t('profile.score.needs-improvement') :
                   currentScore >= 90 ? t('profile.score.excellent') :
                   currentScore >= 80 ? t('profile.score.very-good') :
                   currentScore >= 70 ? t('profile.score.good') :
                   currentScore >= 60 ? t('profile.score.fair') : t('profile.score.needs-improvement')}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="profile-tabs-container">
          <div className="profile-tab-content">
            <h2 className="profile-section-title">{t('profile.academic.title')}</h2>

            <div className="profile-form-grid">
              <div className="profile-form-group">
                <label className="profile-form-label" data-testid="label-gpa">
                  {t('profile.academic.gpa')}
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
                  data-testid="input-gpa"
                  required
                />
              </div>

              <div className="profile-form-group full-width">
                <label className="profile-form-label" data-testid="label-test">
                  {t('profile.academic.test')}
                </label>
                <select
                  value={academicData.standardizedTest}
                  onChange={(e) => handleAcademicChange('standardizedTest', e.target.value)}
                  className="profile-form-select"
                  data-testid="select-test"
                >
                  <option value="">{t('profile.academic.test.placeholder')}</option>
                  <option value="SAT">SAT</option>
                  <option value="ACT">ACT</option>
                </select>
              </div>

              {academicData.standardizedTest === 'SAT' && (
                <>
                  <div className="profile-form-group">
                    <label className="profile-form-label" data-testid="label-sat-ebrw">
                      {t('profile.academic.sat.ebrw')}
                    </label>
                    <input
                      type="number"
                      min="200"
                      max="800"
                      value={academicData.satEBRW}
                      onChange={(e) => handleAcademicChange('satEBRW', e.target.value)}
                      className="profile-form-input"
                      placeholder="720"
                      data-testid="input-sat-ebrw"
                    />
                  </div>

                  <div className="profile-form-group">
                    <label className="profile-form-label" data-testid="label-sat-math">
                      {t('profile.academic.sat.math')}
                    </label>
                    <input
                      type="number"
                      min="200"
                      max="800"
                      value={academicData.satMath}
                      onChange={(e) => handleAcademicChange('satMath', e.target.value)}
                      className="profile-form-input"
                      placeholder="730"
                      data-testid="input-sat-math"
                    />
                  </div>
                </>
              )}

              {academicData.standardizedTest === 'ACT' && (
                <div className="profile-form-group">
                  <label className="profile-form-label" data-testid="label-act">
                    {t('profile.academic.act')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="36"
                    value={academicData.actScore}
                    onChange={(e) => handleAcademicChange('actScore', e.target.value)}
                    className="profile-form-input"
                    placeholder="32"
                    data-testid="input-act"
                  />
                </div>
              )}
            </div>

            {/* Recommendations Section */}
            <div className="extracurriculars-section" style={{marginTop: '32px'}}>
              <div className="extracurriculars-header">
                <h3 className="profile-section-title" style={{marginBottom: 0}}>{t('profile.recommendations.title')}</h3>
                <button
                  onClick={addRecommendationLetter}
                  className="profile-btn-add"
                  data-testid="button-add-recommendation"
                >
                  <Plus className="h-4 w-4" />
                  {t('profile.recommendations.add')}
                </button>
              </div>

              <div style={{marginTop: '16px'}}>
                {recommendationLetters.map((letter, index) => (
                  <div key={letter.id} className="extracurricular-card" data-testid={`card-recommendation-${letter.id}`}>
                    <button
                      onClick={() => removeRecommendationLetter(letter.id)}
                      className="extracurricular-remove-btn"
                      data-testid={`button-remove-recommendation-${letter.id}`}
                    >
                      <X className="h-5 w-5" />
                    </button>
                    <h4 className="profile-form-label" style={{marginBottom: '16px'}}>{t('profile.recommendations.letter')} {index + 1}</h4>

                    <div className="profile-form-grid">
                      <div className="profile-form-group">
                        <label className="profile-form-label" data-testid={`label-recommendation-source-${letter.id}`}>
                          {t('profile.recommendations.source')}
                        </label>
                        <select
                          value={letter.source}
                          onChange={(e) => updateRecommendationLetter(letter.id, 'source', e.target.value)}
                          className="profile-form-select"
                          data-testid={`select-recommendation-source-${letter.id}`}
                        >
                          <option value="Teacher">{t('profile.recommendations.source.teacher')}</option>
                          <option value="Counselor">{t('profile.recommendations.source.counselor')}</option>
                          <option value="Principal">{t('profile.recommendations.source.principal')}</option>
                          <option value="Coach">{t('profile.recommendations.source.coach')}</option>
                          <option value="Employer">{t('profile.recommendations.source.employer')}</option>
                          <option value="Other">{t('profile.recommendations.source.other')}</option>
                        </select>
                      </div>

                      <div className="profile-form-group">
                        <label className="profile-form-label" data-testid={`label-recommendation-depth-${letter.id}`}>
                          {t('profile.recommendations.depth')}
                        </label>
                        <select
                          value={letter.depth || 'knows somewhat'}
                          onChange={(e) => updateRecommendationLetter(letter.id, 'depth', e.target.value)}
                          className="profile-form-select"
                          data-testid={`select-recommendation-depth-${letter.id}`}
                        >
                          <option value="knows deeply">{t('profile.recommendations.depth.deep')}</option>
                          <option value="knows somewhat">{t('profile.recommendations.depth.somewhat')}</option>
                          <option value="barely knows">{t('profile.recommendations.depth.barely')}</option>
                        </select>
                      </div>

                      <div className="profile-form-group">
                        <label className="profile-form-label" data-testid={`label-recommendation-relevance-${letter.id}`}>
                          {t('profile.recommendations.relevance')}
                        </label>
                        <select
                          value={letter.relevance || 'not relevant or not available'}
                          onChange={(e) => updateRecommendationLetter(letter.id, 'relevance', e.target.value)}
                          className="profile-form-select"
                          data-testid={`select-recommendation-relevance-${letter.id}`}
                        >
                          <option value="highly relevant to intended major">{t('profile.recommendations.relevance.highly')}</option>
                          <option value="somewhat relevant to intended major">{t('profile.recommendations.relevance.somewhat')}</option>
                          <option value="not relevant or not available">{t('profile.recommendations.relevance.not')}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}

                {recommendationLetters.length === 0 && (
                  <div className="text-center py-8 text-gray-500" data-testid="empty-recommendations">
                    <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>{t('profile.recommendations.empty')}</p>
                    <p className="text-sm">{t('profile.recommendations.empty.action')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Legacy Status and Citizenship */}
            <div className="grid md:grid-cols-2 gap-6" style={{marginTop: '32px'}}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" data-testid="label-legacy">
                  {t('profile.legacy.title')}
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="legacyStatus"
                      checked={legacyStatus === true}
                      onChange={() => setLegacyStatus(true)}
                      className="mr-2"
                      data-testid="radio-legacy-yes"
                    />
                    {t('profile.legacy.yes')}
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="legacyStatus"
                      checked={legacyStatus === false}
                      onChange={() => setLegacyStatus(false)}
                      className="mr-2"
                      data-testid="radio-legacy-no"
                    />
                    {t('profile.legacy.no')}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2" data-testid="label-citizenship">
                  {t('profile.citizenship.title')}
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="citizenship"
                      checked={citizenship === 'domestic'}
                      onChange={() => setCitizenship('domestic')}
                      className="mr-2"
                      data-testid="radio-citizenship-domestic"
                    />
                    {t('profile.citizenship.domestic')}
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="citizenship"
                      checked={citizenship === 'international'}
                      onChange={() => setCitizenship('international')}
                      className="mr-2"
                      data-testid="radio-citizenship-international"
                    />
                    {t('profile.citizenship.international')}
                  </label>
                </div>
              </div>
            </div>

            <div className="profile-actions" style={{padding: '32px 0'}}>
              <button
                onClick={handleSaveProfile}
                className="profile-btn-primary"
                style={{width: '100%'}}
                data-testid="button-save-profile"
              >
                <Calculator className="h-5 w-5" />
                {t('profile.save')}
              </button>
            </div>
          </div>
        </div>

        <div className="profile-tabs-container">
          <div className="profile-tab-content">
            <h2 className="profile-section-title">{t('profile.comparison.title')}</h2>
          
            <div style={{display: 'flex', gap: '12px', marginBottom: '24px'}}>
              <div style={{flex: 1, position: 'relative'}}>
                <Search className="h-5 w-5" style={{position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(8, 47, 73, 0.4)'}} />
                <input
                  type="text"
                  placeholder={t('profile.comparison.search.placeholder')}
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
                {t('profile.comparison.search.button')}
              </button>
            </div>

            {showResults && searchResults.length > 0 && (
              <div>
                <h3 className="profile-form-label" style={{marginBottom: '16px'}}>{t('profile.comparison.results')}</h3>
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
                      <p className="text-sm text-gray-600">#{school.ranking} • {t('profile.comparison.ranking')} {school.acceptanceRate}%</p>
                    </div>
                    <div className="text-right">
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        school.category === 'safety' ? 'bg-green-100 text-green-800' :
                        school.category === 'target' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {school.category === 'safety' ? t('profile.comparison.category.safety') : 
                         school.category === 'target' ? t('profile.comparison.category.target') : t('profile.comparison.category.reach')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4 mt-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">{t('profile.comparison.required-score')}</span>
                      <span className="ml-2 font-bold">{school.requiredScore}/100</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">{t('profile.comparison.my-score')}</span>
                      <span className="ml-2 font-bold">{currentScore}/100</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">{t('profile.comparison.ratio')}</span>
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
              <p>"{searchQuery}" {t('profile.comparison.no-results')}</p>
              <p className="text-sm">{t('profile.comparison.no-results.action')}</p>
            </div>
          )}

            {!showResults && (
              <div className="text-center py-8 text-gray-500">
                <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>{t('profile.comparison.empty')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;