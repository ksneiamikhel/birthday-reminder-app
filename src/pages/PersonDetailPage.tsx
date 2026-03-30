import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { usePeople } from '../hooks/usePeople';
import {
  daysUntilNextBirthday,
  formatBirthdayDate,
  getNextAge,
} from '../lib/birthday-utils';

export default function PersonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPerson, deletePerson } = usePeople();
  const [isDeleting, setIsDeleting] = useState(false);

  const person = id ? getPerson(id) : null;

  if (!person) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-2xl mx-auto">
          <Link
            to="/dashboard"
            className="text-indigo-600 hover:text-indigo-700 mb-8 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <p className="text-gray-600">Person not found</p>
        </div>
      </div>
    );
  }

  const daysUntil = daysUntilNextBirthday(person.birthday);
  const nextAge = getNextAge(person.birthday);

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${person.name}?`)) return;

    try {
      setIsDeleting(true);
      await deletePerson(person.id);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to delete person:', error);
      alert('Failed to delete person');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto">
        <Link
          to="/dashboard"
          className="text-indigo-600 hover:text-indigo-700 mb-8 inline-block"
        >
          ← Back to Dashboard
        </Link>

        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-8 rounded-lg mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {person.name}
              </h1>
              <p className="text-gray-600">
                {formatBirthdayDate(person.birthday)} • Turning {nextAge}
              </p>
            </div>
            <span
              className={`text-2xl font-bold px-4 py-2 rounded-lg ${
                daysUntil === 0
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-indigo-100 text-indigo-800'
              }`}
            >
              {daysUntil === 0 ? '🎉 Today!' : `${daysUntil} days`}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          {person.preferences && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                Preferences & Hobbies
              </h2>
              <p className="text-gray-700">{person.preferences}</p>
            </div>
          )}

          {Object.values(person.socialLinks).some(
            (link) => link && link !== ''
          ) && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Social Media
              </h2>
              <div className="space-y-2">
                {person.socialLinks.instagram && (
                  <a
                    href={person.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-700 block"
                  >
                    📷 Instagram
                  </a>
                )}
                {person.socialLinks.facebook && (
                  <a
                    href={person.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-700 block"
                  >
                    👤 Facebook
                  </a>
                )}
                {person.socialLinks.twitter && (
                  <a
                    href={person.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-700 block"
                  >
                    𝕏 Twitter
                  </a>
                )}
                {person.socialLinks.linkedin && (
                  <a
                    href={person.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-700 block"
                  >
                    💼 LinkedIn
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-yellow-900 mb-3">
              Gift Suggestions
            </h2>
            <p className="text-yellow-800 mb-4">
              Coming soon! Claude AI will suggest personalized gift ideas based on{' '}
              {person.name}'s preferences.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:bg-gray-400"
            >
              {isDeleting ? 'Deleting...' : 'Delete Person'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
