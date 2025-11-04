import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './login-page.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError(t('login.error.invalid'));
      }
    } catch (err) {
      setError(t('login.error.general'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-content-wrapper">
        <div className="login-header">
          <div className="login-icon-wrapper">
            <LogIn className="login-icon" />
          </div>
          <h1 className="login-title">{t('login.title')}</h1>
          <p className="login-subtitle">
            {t('login.subtitle')}
          </p>
        </div>

        <form className="login-form-container" onSubmit={handleSubmit}>
          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <div className="login-form-group">
            <label htmlFor="email" className="login-label">
              {t('login.email')}
            </label>
            <div className="login-input-wrapper">
              <Mail className="login-input-icon" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
                placeholder={t('login.email.placeholder')}
              />
            </div>
          </div>

          <div className="login-form-group">
            <label htmlFor="password" className="login-label">
              {t('login.password')}
            </label>
            <div className="login-input-wrapper">
              <Lock className="login-input-icon" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
                placeholder={t('login.password.placeholder')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="login-password-toggle"
              >
                {showPassword ? (
                  <EyeOff className="login-password-toggle-icon" />
                ) : (
                  <Eye className="login-password-toggle-icon" />
                )}
              </button>
            </div>
          </div>

          <div className="login-options-row">
            <div className="login-checkbox-wrapper">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="login-checkbox"
              />
              <label htmlFor="remember-me" className="login-checkbox-label">
                {t('login.remember')}
              </label>
            </div>

            <a href="#" className="login-forgot-link">
              {t('login.forgot')}
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="login-submit-button"
          >
            <span className="login-submit-button-text">
              {isLoading ? t('login.loading') : t('login.button')}
            </span>
          </button>

          <div className="login-signup-prompt">
            {t('login.signup.prompt')}{' '}
            <Link to="/signup" className="login-signup-link">
              {t('login.signup.link')}
            </Link>
          </div>
        </form>

        <div className="login-demo-box">
          <p className="login-demo-title">{t('login.demo.title')}</p>
          <p className="login-demo-text">{t('login.demo.email')}</p>
          <p className="login-demo-text">{t('login.demo.password')}</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
