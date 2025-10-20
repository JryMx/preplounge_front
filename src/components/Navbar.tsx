import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUniversitiesMenuOpen, setIsUniversitiesMenuOpen] = useState(false);
  const [isMobileUniversitiesMenuOpen, setIsMobileUniversitiesMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
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
                학교 모아보기
                <ChevronDown className="chevron-icon" />
              </button>
              {isUniversitiesMenuOpen && (
                <div className="navbar-dropdown">
                  <Link to="/universities" className="navbar-dropdown-item">
                    전체 학교 보기
                  </Link>
                  <Link to="/compare" className="navbar-dropdown-item">
                    학교 비교하기
                  </Link>
                </div>
              )}
            </div>
            <Link to="/student-profile" className="navbar-menu-link">
              프로필 분석
            </Link>
            <Link to="/consulting" className="navbar-menu-link">
              컨설팅 추천
            </Link>
            <Link to="/housing" className="navbar-menu-link">
              주거 지원
            </Link>
          </div>

          <div className="navbar-actions">
            <div className="navbar-language">
              <Globe size={16} />
              <span>English</span>
            </div>

            {isAuthenticated ? (
              <Link to="/dashboard" className="navbar-auth-button">
                <span className="navbar-auth-button-text">대시보드</span>
              </Link>
            ) : (
              <Link to="/login" className="navbar-auth-button">
                <span className="navbar-auth-button-text">로그인</span>
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
                  학교 모아보기
                  <ChevronDown className={`chevron-icon ${isMobileUniversitiesMenuOpen ? 'rotated' : ''}`} />
                </button>
                {isMobileUniversitiesMenuOpen && (
                  <div className="navbar-mobile-submenu">
                    <Link
                      to="/universities"
                      className="navbar-mobile-submenu-link"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      전체 학교 보기
                    </Link>
                    <Link
                      to="/compare"
                      className="navbar-mobile-submenu-link"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      학교 비교하기
                    </Link>
                  </div>
                )}
              </div>
              <Link
                to="/student-profile"
                className="navbar-mobile-link"
                onClick={() => setIsMenuOpen(false)}
              >
                프로필 분석
              </Link>
              <Link
                to="/consulting"
                className="navbar-mobile-link"
                onClick={() => setIsMenuOpen(false)}
              >
                컨설팅 추천
              </Link>
              <Link
                to="/housing"
                className="navbar-mobile-link"
                onClick={() => setIsMenuOpen(false)}
              >
                주거 지원
              </Link>
              <div className="navbar-mobile-divider">
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className="navbar-mobile-auth-button"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    대시보드
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="navbar-mobile-auth-button"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    로그인
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
