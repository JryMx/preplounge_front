import React from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Home, Building2, Users } from 'lucide-react';
import '../hero-section-style.css';
import './housing-page.css';

const HousingPage: React.FC = () => {
  return (
    <div className="housing-page">
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-titles">
            <p className="hero-subtitle">
              Searching for your Dream Home
            </p>
            <h1 className="hero-title">
              캠퍼스 근처, 완벽한 집을 찾아보세요.
            </h1>
          </div>
          <p className="hero-description">
            대학 주변의 모든 매물을 한눈에!<br></br>온라인으로 쉽고 간편하게 원하는 조건에 맞는 집을 구경하세요.
          </p>
        </div>
        <div className="hero-buttons">
          <a href="https://cozying.ai/" target="_blank" rel="noopener noreferrer" className="btn-primary">
            지금 바로 매물 찾기
          </a>
        </div>
      </section>

      <div
        className="housing-hero-image"
        style={{
          backgroundImage: `url('https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1600')`,
        }}
      ></div>

      <section className="housing-search-section">
        <div className="housing-search-container">
          <h2 className="housing-search-title">
            원하는 조건으로 간편하게 검색
          </h2>
          <p className="housing-search-description">
            필터 하나만 클릭하면 딱 맞는 집이 나타납니다
          </p>
          <div className="housing-search-input-wrapper">
            <Search className="housing-search-icon h-5 w-5" />
            <input
              type="text"
              placeholder="대학교 지역을 입력하세요."
              className="housing-search-input"
            />
          </div>
        </div>
      </section>

      <section className="housing-listings-section">
        <div className="housing-listings-container">
          <h3 className="housing-section-title">
            하버드 근처 새로 나온 집
          </h3>

          <div className="housing-grid">
            <div className="housing-card">
              <img
                src="https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Harvard Dormitory"
                className="housing-card-image"
              />
              <div className="housing-card-content">
                <div className="housing-card-header">
                  <h4 className="housing-card-title">Harvard Yard Dormitory</h4>
                  <span className="housing-badge available">
                    입주가능
                  </span>
                </div>
                <div className="housing-card-location">
                  <MapPin className="h-4 w-4" />
                  <span>Cambridge, MA</span>
                  <span className="housing-card-location-separator">•</span>
                  <span>On Campus</span>
                </div>
                <div className="housing-card-price-container">
                  <span className="housing-card-price">$1,800</span>
                  <span className="housing-card-price-period">/월</span>
                </div>
                <div className="housing-card-amenities">
                  <span className="housing-amenity-tag">WiFi</span>
                  <span className="housing-amenity-tag">식당</span>
                  <span className="housing-amenity-tag">스터디룸</span>
                </div>
                <button className="housing-card-button">
                  자세히 보기
                </button>
              </div>
            </div>

            <div className="housing-card">
              <img
                src="https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Modern Studio"
                className="housing-card-image"
              />
              <div className="housing-card-content">
                <div className="housing-card-header">
                  <h4 className="housing-card-title">Modern Studio Near Harvard</h4>
                  <span className="housing-badge available">
                    입주가능
                  </span>
                </div>
                <div className="housing-card-location">
                  <MapPin className="h-4 w-4" />
                  <span>Cambridge, MA</span>
                  <span className="housing-card-location-separator">•</span>
                  <span>0.3 miles</span>
                </div>
                <div className="housing-card-price-container">
                  <span className="housing-card-price">$2,400</span>
                  <span className="housing-card-price-period">/월</span>
                </div>
                <div className="housing-card-amenities">
                  <span className="housing-amenity-tag">주방</span>
                  <span className="housing-amenity-tag">헬스장</span>
                  <span className="housing-amenity-tag">주차</span>
                </div>
                <button className="housing-card-button">
                  자세히 보기
                </button>
              </div>
            </div>

            <div className="housing-card">
              <img
                src="https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Shared House"
                className="housing-card-image"
              />
              <div className="housing-card-content">
                <div className="housing-card-header">
                  <h4 className="housing-card-title">Cozy Shared House</h4>
                  <span className="housing-badge available">
                    입주가능
                  </span>
                </div>
                <div className="housing-card-location">
                  <MapPin className="h-4 w-4" />
                  <span>Cambridge, MA</span>
                  <span className="housing-card-location-separator">•</span>
                  <span>0.8 miles</span>
                </div>
                <div className="housing-card-price-container">
                  <span className="housing-card-price">$1,500</span>
                  <span className="housing-card-price-period">/월</span>
                </div>
                <div className="housing-card-amenities">
                  <span className="housing-amenity-tag">정원</span>
                  <span className="housing-amenity-tag">공용주방</span>
                  <span className="housing-amenity-tag">세탁실</span>
                </div>
                <button className="housing-card-button">
                  자세히 보기
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="housing-features-section">
        <div className="housing-features-container">
          <h2 className="housing-features-title">
            더 쉽고 빠르게 집을 찾는 방법
          </h2>

          <div className="housing-features-grid">
            <div className="housing-feature-item">
              <div className="housing-feature-icon-wrapper location">
                <MapPin className="h-10 w-10" style={{color: '#F59E0B'}} />
              </div>
              <h3 className="housing-feature-title">
                대학교 주변 매물만 모아서
              </h3>
              <p className="housing-feature-description">
                대학교 지역을 검색하면 캠퍼스 주변 매물만 자동으로 필터링됩니다.
                수천 개의 불필요한 매물 대신 정말 필요한 집만 찾아보세요.
              </p>
            </div>

            <div className="housing-feature-item">
              <div className="housing-feature-icon-wrapper search">
                <Search className="h-10 w-10" style={{color: '#10B981'}} />
              </div>
              <h3 className="housing-feature-title">
                원하는 조건으로 검색
              </h3>
              <p className="housing-feature-description">
                예산, 방 개수, 거리, 집 타입 등 원하는 조건을 선택하면 딱 맞는 매물만 보여드립니다.
                복잡한 검색 없이 클릭 몇 번으로 완벽한 집을 찾으세요.
              </p>
            </div>

            <div className="housing-feature-item">
              <div className="housing-feature-icon-wrapper expert">
                <Users className="h-10 w-10" style={{color: '#F59E0B'}} />
              </div>
              <h3 className="housing-feature-title">
                처음이라면 전문가와 상담
              </h3>
              <p className="housing-feature-description">
                미국 집 구하기가 처음이라 막막하신가요? 현지 부동산 전문가와 카카오톡으로 편하게 상담할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

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

export default HousingPage;
