import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function SettingsPage() {
  const { gitHubUsername, gitHubRepo } = useAuth();

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto">
        <Link
          to="/dashboard"
          className="text-indigo-600 hover:text-indigo-700 mb-8 inline-block"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Settings</h1>

        <div className="space-y-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">GitHub Account</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>Username:</strong> {gitHubUsername}
              </p>
              <p>
                <strong>Repository:</strong> {gitHubRepo}
              </p>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Your birthday data is stored in this private GitHub repository.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">
              🤖 Telegram Bot Setup
            </h2>
            <p className="text-blue-800 mb-4">
              Connect your Telegram account to receive birthday notifications 7 days before each birthday.
            </p>

            <div className="bg-white p-4 rounded border border-blue-300 mb-4">
              <p className="text-sm font-semibold text-gray-900 mb-3">
                <strong>Follow these steps:</strong>
              </p>
              <ol className="list-decimal ml-5 space-y-2 text-sm text-gray-700">
                <li>
                  Open Telegram and search for:{' '}
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    @birthday_reminder_ksneiamikhel_bot
                  </code>
                </li>
                <li>Click "Start" or send the message: <code className="bg-gray-100 px-2 py-1 rounded">/start</code></li>
                <li>The bot will confirm your connection ✅</li>
                <li>
                  You'll receive notifications 7 days before each birthday with gift suggestions 🎁
                </li>
              </ol>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
              <p className="text-yellow-800 text-sm">
                <strong>💡 Note:</strong> The bot is currently in local development mode.
                Once deployed to Vercel, notifications will work automatically!
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Deployment</h2>
            <p className="text-gray-600 mb-3">
              Ready to deploy your Birthday Reminder to the internet?
            </p>
            <div className="bg-blue-50 p-4 rounded text-sm text-gray-700 space-y-2">
              <p>
                <strong>Next Steps:</strong>
              </p>
              <ul className="list-disc ml-5 space-y-1">
                <li>Push your code to GitHub</li>
                <li>Deploy to Vercel (free)</li>
                <li>Enable daily birthday checks with Vercel Cron</li>
                <li>Telegram notifications will start working!</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
            <p className="text-gray-600">
              Birthday Reminder v0.1.0 | Data stored securely in GitHub | Notifications via Telegram
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
