import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUniversitiesMenuOpen, setIsUniversitiesMenuOpen] = useState(false);
  const [isMobileUniversitiesMenuOpen, setIsMobileUniversitiesMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  
  const toggleLanguage = () => {
    setLanguage(language === 'ko' ? 'en' : 'ko');
  };


  return (
    <nav className="navbar-container">
      <div className="navbar-content">
        <div className="navbar-inner">
          <div className="navbar-logo">
            <Link to="/">
              <img
                src="/logo-2.svg"
                alt="PrepLounge"
              />
            </Link>
          </div>

          <div className="navbar-desktop-nav">
            <div
              className="navbar-menu-item"
              onMouseEnter={() => setIsUniversitiesMenuOpen(true)}
              onMouseLeave={() => setIsUniversitiesMenuOpen(false)}
            >
              <button className="navbar-menu-button">
                {t('nav.universities')}
                <ChevronDown className="chevron-icon" />
              </button>
              {isUniversitiesMenuOpen && (
                <div className="navbar-dropdown">
                  <Link to="/universities" className="navbar-dropdown-item">
                    {t('nav.universities.all')}
                  </Link>
                  <Link to="/compare" className="navbar-dropdown-item">
                    {t('nav.universities.compare')}
                  </Link>
                </div>
              )}
            </div>
            <Link to="/student-profile" className="navbar-menu-link" data-testid="link-profile">
              {t('nav.profile')}
            </Link>
            <Link to="/consulting" className="navbar-menu-link">
              {t('nav.consulting')}
            </Link>
            <Link to="/housing" className="navbar-menu-link">
              {t('nav.housing')}
            </Link>
          </div>

          <div className="navbar-actions">
            <button onClick={toggleLanguage} className="navbar-language" data-testid="button-language">
              <Globe size={16} />
              <span>{t('nav.language')}</span>
            </button>

            {isAuthenticated ? (
              <Link to="/dashboard" className="navbar-auth-button">
                <span className="navbar-auth-button-text">{t('nav.dashboard')}</span>
              </Link>
            ) : (
              <Link to="/login" className="navbar-auth-button">
                <span className="navbar-auth-button-text">{t('nav.login')}</span>
              </Link>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="navbar-mobile-button"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="navbar-mobile-nav">
            <div className="navbar-mobile-content">
              <div>
                <button
                  onClick={() => setIsMobileUniversitiesMenuOpen(!isMobileUniversitiesMenuOpen)}
                  className="navbar-mobile-menu-button"
                >
                  {t('nav.universities')}
                  <ChevronDown className={`chevron-icon ${isMobileUniversitiesMenuOpen ? 'rotated' : ''}`} />
                </button>
                {isMobileUniversitiesMenuOpen && (
                  <div className="navbar-mobile-submenu">
                    <Link
                      to="/universities"
                      className="navbar-mobile-submenu-link"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t('nav.universities.all')}
                    </Link>
                    <Link
                      to="/compare"
                      className="navbar-mobile-submenu-link"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t('nav.universities.compare')}
                    </Link>
                  </div>
                )}
              </div>
              <Link
                to="/student-profile"
                className="navbar-mobile-link"
                onClick={() => setIsMenuOpen(false)}
                data-testid="link-profile-mobile"
              >
                {t('nav.profile')}
              </Link>
              <Link
                to="/consulting"
                className="navbar-mobile-link"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.consulting')}
              </Link>
              <Link
                to="/housing"
                className="navbar-mobile-link"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.housing')}
              </Link>
              <div className="navbar-mobile-divider">
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className="navbar-mobile-auth-button"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav.dashboard')}
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="navbar-mobile-auth-button"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav.login')}
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
