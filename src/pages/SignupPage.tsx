import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './signup-page.css';

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const { signup } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = t('signup.error.name');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('signup.error.email.required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('signup.error.email.invalid');
    }

    if (!formData.password) {
      newErrors.password = t('signup.error.password.required');
    } else if (formData.password.length < 6) {
      newErrors.password = t('signup.error.password.short');
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('signup.error.password.mismatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const success = await signup(formData.email, formData.password, formData.name);
      if (success) {
        navigate('/student-profile');
      }
    } catch (err) {
      setErrors({ general: t('signup.error.general') });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-page-container">
      <div className="signup-content-wrapper">
        <div className="signup-header">
          <div className="signup-icon-wrapper">
            <UserPlus className="signup-icon" />
          </div>
          <h1 className="signup-title">{t('signup.title')}</h1>
          <p className="signup-subtitle">
            {t('signup.subtitle')}
          </p>
        </div>

        <form className="signup-form-container" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="signup-error">
              {errors.general}
            </div>
          )}

          <div className="signup-form-group">
            <label htmlFor="name" className="signup-label">
              {t('signup.name')}
            </label>
            <div className="signup-input-wrapper">
              <User className="signup-input-icon" />
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={handleChange}
                className={`signup-input ${errors.name ? 'error' : ''}`}
                placeholder={t('signup.name.placeholder')}
              />
            </div>
            {errors.name && <p className="signup-field-error">{errors.name}</p>}
          </div>

          <div className="signup-form-group">
            <label htmlFor="email" className="signup-label">
              {t('signup.email')}
            </label>
            <div className="signup-input-wrapper">
              <Mail className="signup-input-icon" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`signup-input ${errors.email ? 'error' : ''}`}
                placeholder={t('signup.email.placeholder')}
              />
            </div>
            {errors.email && <p className="signup-field-error">{errors.email}</p>}
          </div>

          <div className="signup-form-group">
            <label htmlFor="password" className="signup-label">
              {t('signup.password')}
            </label>
            <div className="signup-input-wrapper">
              <Lock className="signup-input-icon" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`signup-input ${errors.password ? 'error' : ''}`}
                placeholder={t('signup.password.placeholder')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="signup-password-toggle"
              >
                {showPassword ? (
                  <EyeOff className="signup-password-toggle-icon" />
                ) : (
                  <Eye className="signup-password-toggle-icon" />
                )}
              </button>
            </div>
            {errors.password && <p className="signup-field-error">{errors.password}</p>}
          </div>

          <div className="signup-form-group">
            <label htmlFor="confirmPassword" className="signup-label">
              {t('signup.confirm')}
            </label>
            <div className="signup-input-wrapper">
              <Lock className="signup-input-icon" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`signup-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder={t('signup.confirm.placeholder')}
              />
            </div>
            {errors.confirmPassword && <p className="signup-field-error">{errors.confirmPassword}</p>}
          </div>

          <div className="signup-terms-wrapper">
            <input
              id="agree-terms"
              name="agree-terms"
              type="checkbox"
              required
              className="signup-checkbox"
            />
            <label htmlFor="agree-terms" className="signup-terms-label">
              {t('signup.terms.agree')}{' '}
              <a href="#" className="signup-terms-link">
                {t('signup.terms.service')}
              </a>{' '}
              {t('signup.terms.and')}{' '}
              <a href="#" className="signup-terms-link">
                {t('signup.terms.privacy')}
              </a>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="signup-submit-button"
          >
            <span className="signup-submit-button-text">
              {isLoading ? t('signup.loading') : t('signup.button')}
            </span>
          </button>

          <div className="signup-login-prompt">
            {t('signup.login.prompt')}{' '}
            <Link to="/login" className="signup-login-link">
              {t('signup.login.link')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
