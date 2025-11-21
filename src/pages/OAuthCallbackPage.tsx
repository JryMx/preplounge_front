import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getBackendURL } from '../lib/backendUrl';
import { useAuth } from '../context/AuthContext';

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { checkAuth } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');
      const userId = searchParams.get('userId');
      const name = searchParams.get('name');
      const email = searchParams.get('email');
      const provider = searchParams.get('provider') || 'google';
      const success = searchParams.get('success');

      if (success === 'false') {
        setError('Authentication failed');
        setTimeout(() => navigate('/login?error=oauth_failed'), 2000);
        return;
      }

      if (!accessToken || !userId) {
        setError('Missing authentication data');
        setTimeout(() => navigate('/login?error=missing_data'), 2000);
        return;
      }

      try {
        const response = await fetch(`${getBackendURL()}/api/v1/auth/session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            accessToken,
            refreshToken,
            userId,
            name,
            email,
            provider,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create session');
        }

        const data = await response.json();
        
        if (data.success) {
          await checkAuth();
          navigate('/dashboard');
        } else {
          throw new Error('Session creation failed');
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError('Failed to complete authentication');
        setTimeout(() => navigate('/login?error=session_failed'), 2000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, checkAuth]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <div className="text-gray-600">Redirecting to login...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <div className="text-gray-600">Completing authentication...</div>
      </div>
    </div>
  );
}
