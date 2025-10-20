import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Target, Users, ArrowRight, BookOpen, Trophy, Globe, Calculator, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import '../hero-section-style.css';
import './profile-calculator.css';
import './homepage-calculator.css';
import './homepage.css';

const HomePage: React.FC = () => {
  const { t } = useLanguage();
  const [gpa, setGpa] = useState('');
  const [satEBRW, setSatEBRW] = useState('');
  const [satMath, setSatMath] = useState('');
  const [showResult, setShowResult] = useState(false);

  const calculateSimpleScore = () => {
    if (!gpa || !satEBRW || !satMath) return 0;
    
    const gpaScore = (parseFloat(gpa) / 4.0) * 40; // 40% weight for GPA
    const satTotal = parseInt(satEBRW) + parseInt(satMath);
    const satScore = (satTotal / 1600) * 60; // 60% weight for SAT
    
    return Math.round(Math.min(gpaScore + satScore, 100));
  };

  const handleCalculate = () => {
    if (gpa && satEBRW && satMath) {
      setShowResult(true);
    }
  };

  const profileScore = calculateSimpleScore();
  const getScoreCategory = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'text-green-600' };
    if (score >= 80) return { label: 'Very Good', color: 'text-blue-600' };
    if (score >= 70) return { label: 'Good', color: 'text-orange-600' };
    if (score >= 60) return { label: 'Fair', color: 'text-yellow-600' };
    return { label: 'Needs Improvement', color: 'text-red-600' };
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
            {/* Left side - Input Form */}
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
                  SAT EBRW (800점 만점)
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
                  SAT Math (800점 만점)
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

            {/* Right side - Results Card */}
            <div className="homepage-calculator-result">
              <div className="homepage-calculator-result-content">
                <div className="homepage-calculator-score-group">
                  <span className="homepage-calculator-score-label">프로필 점수</span>
                  <div className="homepage-calculator-score-display">
                    <span className="homepage-calculator-score-value">
                      {(gpa && satEBRW && satMath) ? calculateSimpleScore() : '--'}
                    </span>
                    <span className="homepage-calculator-score-total">/ 100점</span>
                  </div>
                </div>

                <p className="homepage-calculator-description">
                 GPA와 SAT 점수를 기반으로 한 간단한 계산입니다.<br></br>과외활동, 에세이, 개인화된 대학 추천을 포함한 종합적인<br></br>분석을 위해서는 전체 프로필을 완성해주세요.
                </p>
              </div>

              {(gpa && satEBRW && satMath) ? (
                <Link
                  to="/student-profile"
                  className="homepage-calculator-button"
                >
                  <span className="homepage-calculator-button-text">합격 가능성 상세 분석하기</span>
                </Link>
              ) : (
                <button
                  disabled
                  className="homepage-calculator-button"
                >
                  <span className="homepage-calculator-button-text">합격 가능성 상세 분석하기</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <div className="features-header">
            <h2 className="features-title">
              핵심 서비스
            </h2>
            <p className="features-subtitle">
              프렙라운지는 국제학교 학생들의 성공적인 대입을 위한 다양한 서비스를 제공합니다.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-card-content">
                <div className="feature-title-row">
                  <h3 className="feature-card-title">학교 정보<br></br>모아보기</h3>
                  <div className="feature-icon-wrapper blue">
                    <Search className="feature-icon" />
                  </div>
                </div>
                <p className="feature-description">
                  입학에 필요한 서류와 지원 일정 등, 미국 1,200여 개 대학의 입학 정보를 한눈에 확인하세요.
                </p>
              </div>
              <Link to="/universities" className="feature-link blue">
                바로가기 →
              </Link>
            </div>

            <div className="feature-card">
              <div className="feature-card-content">
                <div className="feature-title-row">
                  <h3 className="feature-card-title">개인 맞춤<br></br>프로필 분석</h3>
                  <div className="feature-icon-wrapper green">
                    <Target className="feature-icon" />
                  </div>
                </div>
                <p className="feature-description">
                  학생의 성적과 대외활동 경력을 토대로 AI가 입학 가능성을 분석해줘요.
                </p>
              </div>
              <Link to="/student-profile" className="feature-link green">
                바로가기 →
              </Link>
            </div>

            <div className="feature-card">
              <div className="feature-card-content">
                <div className="feature-title-row">
                  <h3 className="feature-card-title">컨설팅 프로그램<br></br> 비교/추천</h3>
                  <div className="feature-icon-wrapper orange">
                    <Users className="feature-icon" />
                  </div>
                </div>
                <p className="feature-description">
                  국내 컨설팅 학원을 비교하고 프로필 강화를 위한 최적의 프로그램을 만나보세요.
                </p>
              </div>
              <Link to="/consulting" className="feature-link orange">
                바로가기 →
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
              전공 선택, 아직도 고민되시나요?
            </h2>
            <p className="majors-subtitle">
              간단한 테스트로 나에게 맞는 전공을 찾아보세요.<br></br>* 평균 연봉과 취업률은 추정치입니다.
            </p>
          </div>

          <div className="majors-grid">
            <div className="major-card">
              <div className="major-icon-wrapper indigo">
                <BookOpen className="major-icon" />
              </div>
              <div className="major-content">
                <h3 className="major-card-title">공학 (Engineering)</h3>
                <div className="major-details">
                  <p className="major-specializations">컴퓨터 과학, 전기공학, 기계공학</p>
                </div>
                <div className="major-stats">
                  <div className="major-stat-badge">
                    <span className="major-stat-text">평균 연봉 $85,000</span>
                  </div>
                  <div className="major-stat-badge">
                    <span className="major-stat-text">취업률 94%</span>
                  </div>
                  <div className="major-stat-badge">
                    <span className="major-stat-text">STEM OPT 3년 가능</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="major-card">
              <div className="major-icon-wrapper teal">
                <Trophy className="major-icon" />
              </div>
              <div className="major-content">
                <h3 className="major-card-title">경영 (Business)</h3>
                <div className="major-details">
                  <p className="major-specializations">경영학, 경제학, 금융학, 마케팅</p>
                </div>
                <div className="major-stats">
                  <div className="major-stat-badge">
                    <span className="major-stat-text">평균 연봉 $78,000</span>
                  </div>
                  <div className="major-stat-badge">
                    <span className="major-stat-text">취업률 88%</span>
                  </div>
                  <div className="major-stat-badge">
                    <span className="major-stat-text">네트워킹 기회 풍부</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="major-card">
              <div className="major-icon-wrapper amber">
                <BookOpen className="major-icon" />
              </div>
              <div className="major-content">
                <h3 className="major-card-title">인문학 (Liberal Arts)</h3>
                <div className="major-details">
                  <p className="major-specializations">문학, 철학, 역사, 언어학, 문화연구</p>
                </div>
                <div className="major-stats">
                  <div className="major-stat-badge">
                    <span className="major-stat-text">평균 연봉 $65,000</span>
                  </div>
                  <div className="major-stat-badge">
                    <span className="major-stat-text">취업률 82%</span>
                  </div>
                  <div className="major-stat-badge">
                    <span className="major-stat-text">비판적 사고력 개발</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="major-card">
              <div className="major-icon-wrapper blue">
                <Globe className="major-icon" />
              </div>
              <div className="major-content">
                <h3 className="major-card-title">자연과학 (Natural Sciences)</h3>
                <div className="major-details">
                  <p className="major-specializations">생물학, 화학, 물리학, 수학, 환경과학</p>
                </div>
                <div className="major-stats">
                  <div className="major-stat-badge">
                    <span className="major-stat-text">평균 연봉 $72,000</span>
                  </div>
                  <div className="major-stat-badge">
                    <span className="major-stat-text">취업률 85%</span>
                  </div>
                  <div className="major-stat-badge">
                    <span className="major-stat-text">대학원 진학률 높음</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="major-card">
              <div className="major-icon-wrapper lime">
                <Search className="major-icon" />
              </div>
              <div className="major-content">
                <h3 className="major-card-title">사회과학 (Social Sciences)</h3>
                <div className="major-details">
                  <p className="major-specializations">심리학, 정치학, 사회학, 국제관계학</p>
                </div>
                <div className="major-stats">
                  <div className="major-stat-badge">
                    <span className="major-stat-text">평균 연봉 $68,000</span>
                  </div>
                  <div className="major-stat-badge">
                    <span className="major-stat-text">취업률 83%</span>
                  </div>
                  <div className="major-stat-badge">
                    <span className="major-stat-text">사회 문제 해결</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="major-card">
              <div className="major-icon-wrapper purple">
                <Users className="major-icon" />
              </div>
              <div className="major-content">
                <h3 className="major-card-title">예술 (Arts)</h3>
                <div className="major-details">
                  <p className="major-specializations">순수예술, 음악, 연극, 영화학, 디자인</p>
                </div>
                <div className="major-stats">
                  <div className="major-stat-badge">
                    <span className="major-stat-text">평균 연봉 $58,000</span>
                  </div>
                  <div className="major-stat-badge">
                    <span className="major-stat-text">취업률 75%</span>
                  </div>
                  <div className="major-stat-badge">
                    <span className="major-stat-text">포트폴리오 중심 전형</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="majors-cta">
            <p className="majors-cta-text">단 3분! 나에게 딱 맞는 전공을 찾아보세요</p>
            <button className="majors-cta-button">
              <span className="majors-cta-button-text">전공 찾고 대학 로드맵 준비하기</span>
            </button>
          </div>
        </div>
      </section>

      {/* Housing Section */}
      <section className="housing-section">
        <div className="housing-container">
          <div className="housing-header-column">
            <h2 className="housing-title">
              미국 대학 주변<br></br>집 구경하기
            </h2>
            <p className="housing-subtitle">
              학교 주변, 어떤 동네가 살기 좋을까?
            </p>
          </div>

          <div className="housing-content-column">
            <div className="housing-search-field">
              <div className="housing-search-input-wrapper">
                <Search className="housing-search-icon" />
                <input
                  type="text"
                  placeholder="대학 이름으로 검색"
                  className="housing-search-input"
                />
                <button className="housing-search-button">
                  <span className="housing-search-button-text">검색</span>
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
              <span className="housing-cta-button-text">매물 자세히 알아보기</span>
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