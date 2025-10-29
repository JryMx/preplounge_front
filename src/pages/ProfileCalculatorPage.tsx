import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './profile-calculator.css';

const ProfileCalculatorPage: React.FC = () => {
  const { t } = useLanguage();
  const [gpa, setGpa] = useState('');
  const [satEBRW, setSatEBRW] = useState('');
  const [satMath, setSatMath] = useState('');

  const calculateSimpleScore = () => {
    if (!gpa || !satEBRW || !satMath) return 0;

    const gpaScore = (parseFloat(gpa) / 4.0) * 40;
    const satTotal = parseInt(satEBRW) + parseInt(satMath);
    const satScore = (satTotal / 1600) * 60;

    return Math.round(Math.min(gpaScore + satScore, 100));
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
            </div>

            <div className="profile-calculator-result">
              <div className="profile-calculator-result-content">
                <div className="profile-calculator-score-group">
                  <span className="profile-calculator-score-label">{t('home.calculator.score')}</span>
                  <div className="profile-calculator-score-display">
                    <span className="profile-calculator-score-value" data-testid="text-score">
                      {(gpa && satEBRW && satMath) ? calculateSimpleScore() : '--'}
                    </span>
                    <span className="profile-calculator-score-total">{t('home.calculator.score.total')}</span>
                  </div>
                </div>

                <p className="profile-calculator-description">
                  {t('home.calculator.description')}
                </p>
              </div>

              {(gpa && satEBRW && satMath) ? (
                <Link
                  to="/student-profile"
                  className="profile-calculator-button"
                  data-testid="button-analyze"
                >
                  <span className="profile-calculator-button-text">{t('home.calculator.button')}</span>
                </Link>
              ) : (
                <button
                  disabled
                  className="profile-calculator-button"
                  data-testid="button-analyze-disabled"
                >
                  <span className="profile-calculator-button-text">{t('home.calculator.button')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProfileCalculatorPage;
