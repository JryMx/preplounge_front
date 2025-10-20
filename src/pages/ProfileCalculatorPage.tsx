import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './profile-calculator.css';

const ProfileCalculatorPage: React.FC = () => {
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
                합격 가능성 미리보기
              </h2>
            </div>
            <p className="profile-calculator-subtitle">
              성적 정보를 입력하고 프로필 점수를 확인해 보세요.
            </p>
          </div>

          <div className="profile-calculator-content">
            <div className="profile-calculator-form">
              <div className="profile-calculator-field">
                <label className="profile-calculator-label">
                  GPA (4.0점 만점)
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
                />
              </div>

              <div className="profile-calculator-field">
                <label className="profile-calculator-label">
                  SAT Math (800점 만점)
                </label>
                <input
                  type="number"
                  min="200"
                  max="800"
                  value={satMath}
                  onChange={(e) => setSatMath(e.target.value)}
                  className="profile-calculator-input"
                  placeholder="720"
                />
              </div>

              <div className="profile-calculator-field">
                <label className="profile-calculator-label">
                  SAT English (800점 만점)
                </label>
                <input
                  type="number"
                  min="200"
                  max="800"
                  value={satEBRW}
                  onChange={(e) => setSatEBRW(e.target.value)}
                  className="profile-calculator-input"
                  placeholder="730"
                />
              </div>
            </div>

            <div className="profile-calculator-result">
              <div className="profile-calculator-result-content">
                <div className="profile-calculator-score-group">
                  <span className="profile-calculator-score-label">프로필 점수</span>
                  <div className="profile-calculator-score-display">
                    <span className="profile-calculator-score-value">
                      {(gpa && satEBRW && satMath) ? calculateSimpleScore() : '--'}
                    </span>
                    <span className="profile-calculator-score-total">/ 100점</span>
                  </div>
                </div>

                <p className="profile-calculator-description">
                 GPA와 SAT를 기반으로 한 간단한 계산입니다.<br></br>과외활동, 에세이, 개인화된 대학 추천을 포함한 종합적인<br></br>분석을 위해서는 전체 프로필을 완성해주세요.
                </p>
              </div>

              {(gpa && satEBRW && satMath) ? (
                <Link
                  to="/student-profile"
                  className="profile-calculator-button"
                >
                  <span className="profile-calculator-button-text">합격 가능성 상세 분석하기</span>
                </Link>
              ) : (
                <button
                  disabled
                  className="profile-calculator-button"
                >
                  <span className="profile-calculator-button-text">합격 가능성 상세 분석하기</span>
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
