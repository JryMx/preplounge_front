import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './login-page.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
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
        setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch (err) {
      setError('오류가 발생했습니다. 다시 시도해 주세요.');
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
          <h1 className="login-title">로그인</h1>
          <p className="login-subtitle">
            프렙라운지에 다시 오신 것을 환영합니다
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
              이메일
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
                placeholder="이메일 주소를 입력하세요"
              />
            </div>
          </div>

          <div className="login-form-group">
            <label htmlFor="password" className="login-label">
              비밀번호
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
                placeholder="비밀번호를 입력하세요"
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
                로그인 상태 유지
              </label>
            </div>

            <a href="#" className="login-forgot-link">
              비밀번호를 잊으셨나요?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="login-submit-button"
          >
            <span className="login-submit-button-text">
              {isLoading ? '로그인 중...' : '로그인'}
            </span>
          </button>

          <div className="login-signup-prompt">
            아직 계정이 없으신가요?{' '}
            <Link to="/signup" className="login-signup-link">
              회원가입
            </Link>
          </div>
        </form>

        <div className="login-demo-box">
          <p className="login-demo-title">데모 계정 정보:</p>
          <p className="login-demo-text">이메일: 유효한 이메일 형식</p>
          <p className="login-demo-text">비밀번호: 임의의 비밀번호</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
