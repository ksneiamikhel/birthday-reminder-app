import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePeople } from '../hooks/usePeople';
import { daysUntilNextBirthday, formatBirthdayDate, sortByUpcomingBirthday } from '../lib/birthday-utils';

export default function Dashboard() {
  const { gitHubUsername } = useAuth();
  const { people, isLoading, error } = usePeople();

  const upcomingPeople = sortByUpcomingBirthday(people).slice(0, 10);

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">🎂 Birthday Reminders</h1>
            <p className="text-gray-600">GitHub: {gitHubUsername}</p>
          </div>
          <Link
            to="/people/new"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            + Add Person
          </Link>
        </div>

        {isLoading && <p className="text-gray-600">Loading your birthdays...</p>}

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
            <p className="text-red-800">Error: {error.message}</p>
          </div>
        )}

        {!isLoading && people.length === 0 && (
          <div className="bg-gray-100 rounded-lg p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">No birthdays added yet</p>
            <Link
              to="/people/new"
              className="text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              Add your first person →
            </Link>
          </div>
        )}

        {!isLoading && people.length > 0 && (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Upcoming Birthdays ({upcomingPeople.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingPeople.map((person) => {
                  const days = daysUntilNextBirthday(person.birthday);
                  return (
                    <Link
                      key={person.id}
                      to={`/people/${person.id}`}
                      className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-6 hover:shadow-lg transition cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{person.name}</h3>
                        <span className="bg-indigo-600 text-white text-sm px-3 py-1 rounded-full font-semibold">
                          {days === 0 ? '🎉 Today!' : `in ${days}d`}
                        </span>
                      </div>
                      <p className="text-gray-600">{formatBirthdayDate(person.birthday)}</p>
                      {person.preferences && (
                        <p className="text-gray-500 text-sm mt-3 line-clamp-2">
                          {person.preferences}
                        </p>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {people.length > upcomingPeople.length && (
              <p className="text-gray-600 text-sm mb-8">
                Showing {upcomingPeople.length} of {people.length} birthdays
              </p>
            )}
          </>
        )}

        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link
            to="/settings"
            className="text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            ⚙️ Settings
          </Link>
        </div>
      </div>
    </div>
  );
}
