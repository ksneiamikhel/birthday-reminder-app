import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle OAuth callback
    console.log('Auth callback received');
    // TODO: Parse OAuth tokens and store them
    setTimeout(() => navigate('/dashboard'), 1000);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Authenticating...</p>
    </div>
  );
}
