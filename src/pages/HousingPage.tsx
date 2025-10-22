import React from 'react';
import { Search, MapPin, Users } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import '../hero-section-style.css';
import './housing-page.css';

const HousingPage: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <div className="housing-page">
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-titles">
            <p className="hero-subtitle">
              {t('housing.hero.subtitle')}
            </p>
            <h1 className="hero-title">
              {t('housing.hero.title')}
            </h1>
          </div>
          <p className="hero-description">
            {t('housing.hero.description').split('\n').map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </p>
        </div>
        <div className="hero-buttons">
          <a href="https://cozying.ai/" target="_blank" rel="noopener noreferrer" className="btn-primary">
            {t('housing.hero.button')}
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
            {t('housing.search.title')}
          </h2>
          <p className="housing-search-description">
            {t('housing.search.description')}
          </p>
          <div className="housing-search-input-wrapper">
            <Search className="housing-search-icon h-5 w-5" />
            <input
              type="text"
              placeholder={t('housing.search.placeholder')}
              className="housing-search-input"
            />
          </div>
        </div>
      </section>

      <section className="housing-listings-section">
        <div className="housing-listings-container">
          <h3 className="housing-section-title">
            {t('housing.listings.title')}
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
                    {t('housing.badge.available')}
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
                  <span className="housing-card-price-period">{t('housing.price.period')}</span>
                </div>
                <div className="housing-card-amenities">
                  <span className="housing-amenity-tag">WiFi</span>
                  <span className="housing-amenity-tag">식당</span>
                  <span className="housing-amenity-tag">스터디룸</span>
                </div>
                <button className="housing-card-button">
                  {t('housing.button.details')}
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
                    {t('housing.badge.available')}
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
                  <span className="housing-card-price-period">{t('housing.price.period')}</span>
                </div>
                <div className="housing-card-amenities">
                  <span className="housing-amenity-tag">주방</span>
                  <span className="housing-amenity-tag">헬스장</span>
                  <span className="housing-amenity-tag">주차</span>
                </div>
                <button className="housing-card-button">
                  {t('housing.button.details')}
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
                    {t('housing.badge.available')}
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
                  <span className="housing-card-price-period">{t('housing.price.period')}</span>
                </div>
                <div className="housing-card-amenities">
                  <span className="housing-amenity-tag">정원</span>
                  <span className="housing-amenity-tag">공용주방</span>
                  <span className="housing-amenity-tag">세탁실</span>
                </div>
                <button className="housing-card-button">
                  {t('housing.button.details')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="housing-features-section">
        <div className="housing-features-container">
          <h2 className="housing-features-title">
            {t('housing.features.title')}
          </h2>

          <div className="housing-features-grid">
            <div className="housing-feature-item">
              <div className="housing-feature-icon-wrapper location">
                <MapPin className="h-10 w-10" style={{color: '#F59E0B'}} />
              </div>
              <h3 className="housing-feature-title">
                {t('housing.features.location.title')}
              </h3>
              <p className="housing-feature-description">
                {t('housing.features.location.description').split('\n').map((line, i) => (
                  <span key={i}>{line}{i === 0 && <br />}</span>
                ))}
              </p>
            </div>

            <div className="housing-feature-item">
              <div className="housing-feature-icon-wrapper search">
                <Search className="h-10 w-10" style={{color: '#10B981'}} />
              </div>
              <h3 className="housing-feature-title">
                {t('housing.features.search.title')}
              </h3>
              <p className="housing-feature-description">
                {t('housing.features.search.description').split('\n').map((line, i) => (
                  <span key={i}>{line}{i === 0 && <br />}</span>
                ))}
              </p>
            </div>

            <div className="housing-feature-item">
              <div className="housing-feature-icon-wrapper expert">
                <Users className="h-10 w-10" style={{color: '#F59E0B'}} />
              </div>
              <h3 className="housing-feature-title">
                {t('housing.features.expert.title')}
              </h3>
              <p className="housing-feature-description">
                {t('housing.features.expert.description')}
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
