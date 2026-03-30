import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { usePeople } from '../hooks/usePeople';
import type { Person } from '../types';

export default function AddPersonPage() {
  const navigate = useNavigate();
  const { addPerson, isLoading, error } = usePeople();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    birthday: '',
    preferences: '',
    socialLinks: {
      instagram: '',
      facebook: '',
      twitter: '',
      linkedin: '',
      other: [] as string[],
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSocialLinkChange = (
    field: keyof typeof formData.socialLinks,
    value: string
  ) => {
    if (field === 'other') return; // Skip for now
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.birthday) {
      alert('Please fill in name and birthday');
      return;
    }

    try {
      setIsSaving(true);
      const newPerson: Omit<Person, 'id' | 'createdAt' | 'updatedAt'> = {
        name: formData.name,
        birthday: formData.birthday,
        preferences: formData.preferences,
        socialLinks: formData.socialLinks,
      };

      await addPerson(newPerson);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to add person:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/dashboard" className="text-indigo-600 hover:text-indigo-700 mb-8 inline-block">
          ← Back to Dashboard
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Add a New Person</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6">
            <p className="text-red-800">Error: {error.message}</p>
          </div>
        )}

        {isLoading && <p className="text-gray-600 mb-6">Loading...</p>}

        <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50 p-8 rounded-lg">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Alice Smith"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Birthday <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              name="birthday"
              value={formData.birthday}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Preferences & Hobbies
            </label>
            <textarea
              name="preferences"
              value={formData.preferences}
              onChange={handleChange}
              placeholder="e.g., Loves hiking, photography, specialty coffee, sci-fi novels"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
            <p className="text-sm text-gray-500 mt-2">
              This helps Claude suggest better gifts
            </p>
          </div>

          <div className="border-t border-gray-300 pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Social Media (Optional)</h3>
            <div className="space-y-4">
              {['instagram', 'facebook', 'twitter', 'linkedin'].map((field) => (
                <div key={field}>
                  <label className="block text-gray-700 text-sm mb-1 capitalize">
                    {field}
                  </label>
                  <input
                    type="url"
                    placeholder={`https://${field}.com/...`}
                    value={
                      formData.socialLinks[
                        field as keyof typeof formData.socialLinks
                      ] as string
                    }
                    onChange={(e) =>
                      handleSocialLinkChange(
                        field as keyof typeof formData.socialLinks,
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-gray-400"
          >
            {isSaving ? 'Adding...' : 'Add Person'}
          </button>
        </form>
      </div>
    </div>
  );
}
