import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">🎂 Birthday Reminder</h1>
        <p className="text-xl text-gray-600 mb-8">
          Never forget a birthday. Get AI-powered gift suggestions delivered to Telegram.
        </p>

        <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Setup Instructions</h2>
          <ol className="text-left space-y-3 text-gray-700 mb-6">
            <li>✅ <strong>GitHub repo created:</strong> `birthday-reminder-data`</li>
            <li>✅ <strong>Personal Access Token generated</strong></li>
            <li>✅ <strong>.env.local file created</strong> with credentials</li>
          </ol>
          <p className="text-sm text-gray-600 mb-6">
            Your GitHub credentials are already configured. Ready to manage birthdays?
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition w-full"
          >
            Go to Dashboard →
          </button>
        </div>

        <p className="text-sm text-gray-600">
          Your birthday data is stored securely in your GitHub repository.
        </p>
      </div>
    </div>
  );
}
