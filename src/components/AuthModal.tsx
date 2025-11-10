import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getBackendURL } from '../lib/backendUrl';
import '../styles/auth-modal.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { checkAuth } = useAuth();

  if (!isOpen) return null;

  const handleGoogleLogin = () => {
    window.location.href = `${getBackendURL()}/api/auth/google`;
  };

  const handleKakaoLogin = () => {
    window.location.href = `${getBackendURL()}/api/auth/kakao`;
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = mode === 'signin' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'signin' 
        ? { email, password }
        : { email, password, name };

      const response = await fetch(`${getBackendURL()}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        await checkAuth();
        onClose();
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="auth-modal-header">
          <h2>Welcome to PrepLounge</h2>
          <p>Sign in to save your profile and track your college journey</p>
        </div>

        <div className="auth-modal-tabs">
          <button
            className={`auth-tab ${mode === 'signin' ? 'active' : ''}`}
            onClick={() => { setMode('signin'); setError(''); }}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => { setMode('signup'); setError(''); }}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleEmailAuth} className="auth-form">
          {mode === 'signup' && (
            <div className="auth-input-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
          )}

          <div className="auth-input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="auth-input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              minLength={6}
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-submit-button" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <div className="auth-modal-buttons">
          <button className="auth-button google-button" onClick={handleGoogleLogin}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <button className="auth-button kakao-button" onClick={handleKakaoLogin}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="#000000"
                d="M12 3C6.477 3 2 6.477 2 10.75c0 2.76 1.833 5.18 4.578 6.557l-1.143 4.196c-.073.269.215.49.455.35l4.917-2.865C11.187 19.025 11.59 19 12 19c5.523 0 10-3.477 10-7.75S17.523 3 12 3z"
              />
            </svg>
            Continue with Kakao
          </button>
        </div>

        <div className="auth-modal-footer">
          <p>
            By continuing, you agree to PrepLounge's Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
