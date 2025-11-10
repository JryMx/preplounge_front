import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown, Globe, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import AuthModal from './AuthModal';
import './Navbar.css';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUniversitiesMenuOpen, setIsUniversitiesMenuOpen] = useState(false);
  const [isMobileUniversitiesMenuOpen, setIsMobileUniversitiesMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
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

            {isAuthenticated && user ? (
              <div 
                className="navbar-user-menu"
                onMouseEnter={() => setIsUserMenuOpen(true)}
                onMouseLeave={() => setIsUserMenuOpen(false)}
              >
                <button className="navbar-user-button">
                  {user.photo ? (
                    <img src={user.photo} alt={user.displayName} className="navbar-user-avatar" />
                  ) : (
                    <div className="navbar-user-avatar-placeholder">
                      <User size={18} />
                    </div>
                  )}
                  <span className="navbar-user-name">{user.displayName}</span>
                  <ChevronDown size={16} />
                </button>
                {isUserMenuOpen && (
                  <div className="navbar-user-dropdown">
                    <Link 
                      to="/student-profile" 
                      className="navbar-user-dropdown-item"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User size={16} />
                      {t('nav.profile')}
                    </Link>
                    <button onClick={logout} className="navbar-user-dropdown-item">
                      <LogOut size={16} />
                      {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => setIsAuthModalOpen(true)} className="navbar-auth-button">
                <span className="navbar-auth-button-text">{t('nav.login')}</span>
              </button>
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
                {isAuthenticated && user ? (
                  <>
                    <div className="navbar-mobile-user-info">
                      {user.photo ? (
                        <img src={user.photo} alt={user.displayName} className="navbar-mobile-user-avatar" />
                      ) : (
                        <div className="navbar-mobile-user-avatar-placeholder">
                          <User size={18} />
                        </div>
                      )}
                      <span className="navbar-mobile-user-name">{user.displayName}</span>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="navbar-mobile-auth-button"
                    >
                      <LogOut size={16} />
                      {t('nav.logout')}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setIsAuthModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="navbar-mobile-auth-button"
                  >
                    {t('nav.login')}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </nav>
  );
};

export default Navbar;
