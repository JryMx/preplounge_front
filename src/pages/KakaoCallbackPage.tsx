import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBackendURL } from '../lib/backendUrl';

export default function KakaoCallbackPage() {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        
        const success = params.get('success');
        const accessToken = params.get('accessToken');
        const refreshToken = params.get('refreshToken');
        const userId = params.get('userId');
        const name = params.get('name');
        const email = params.get('email');
        const role = params.get('role');
        const partner = params.get('partner');

        console.log('Kakao OAuth callback received:', { success, userId, email });

        if (success === 'false' || !accessToken || !userId) {
          console.error('OAuth authentication failed or missing required parameters');
          navigate('/?error=authentication_failed');
          return;
        }

        const response = await fetch(`${getBackendURL()}/api/auth/session`, {
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
            role,
            partner,
            provider: 'kakao',
          }),
        });

        if (!response.ok) {
          console.error('Session creation failed:', response.status);
          throw new Error('Failed to create session');
        }

        const data = await response.json();
        console.log('Session created successfully:', data);

        await checkAuth();
        navigate('/dashboard');
      } catch (error) {
        console.error('Error handling OAuth callback:', error);
        navigate('/?error=session_failed');
      }
    };

    handleCallback();
  }, [navigate, checkAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Completing Kakao authentication...</p>
      </div>
    </div>
  );
}
