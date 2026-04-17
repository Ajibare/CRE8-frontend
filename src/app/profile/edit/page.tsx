'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../../store/authStore';
import { profileService, Profile, UpdateProfileData } from '../../../services/profileService';

const categories = [
  'Design',
  'Video Editing',
  'Music',
  'Content Creation',
  'Photography',
  'Writing',
  'UI/UX Design',
  'Web Design',
  'Illustration',
  'Digital Art',
  'Fashion Design',
  'Creative Direction',
  'Advertising'
];

const experienceLevels = [
  'Beginner (0-1 years)',
  'Intermediate (1-3 years)',
  'Advanced (3-5 years)',
  'Expert (5+ years)',
  'Professional (10+ years)'
];

export default function EditProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'image' | 'password'>('profile');
  
  const [formData, setFormData] = useState<UpdateProfileData>({
    name: '',
    phone: '',
    bio: '',
    country: '',
    state: '',
    city: '',
    dateOfBirth: '',
    gender: '',
    experience: '',
    education: '',
    skills: [],
    portfolio: '',
    socialLinks: {
      instagram: '',
      twitter: '',
      linkedin: '',
      portfolio: ''
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const profile = await profileService.getProfile();
      
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        country: profile.country || '',
        state: profile.state || '',
        city: profile.city || '',
        dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '',
        gender: profile.gender || '',
        experience: profile.experience || '',
        education: profile.education || '',
        skills: profile.skills || [],
        portfolio: profile.portfolio || '',
        socialLinks: {
          instagram: profile.socialLinks?.instagram || '',
          twitter: profile.socialLinks?.twitter || '',
          linkedin: profile.socialLinks?.linkedin || '',
          portfolio: profile.socialLinks?.portfolio || ''
        }
      });

      if (profile.profileImage) {
        setImagePreview(profile.profileImage);
      }
      
      setError('');
    } catch (error: any) {
      console.error('Fetch profile error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills?.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills?.filter(s => s !== skill) || []
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const updatedProfile = await profileService.updateProfile(formData);
      setUser(updatedProfile);
      setSuccess('Profile updated successfully!');
    } catch (error: any) {
      console.error('Update profile error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const saveImage = async () => {
    if (!imageFile) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const imageUrl = await profileService.updateProfileImage(imageFile);
      setUser({ ...user!, profileImage: imageUrl });
      setSuccess('Profile image updated successfully!');
      setImageFile(null);
    } catch (error: any) {
      console.error('Update image error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to update profile image');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await profileService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setSuccess('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      console.error('Change password error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-violet-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center text-violet-600 hover:text-violet-700 font-medium mr-4"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                  Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  Edit Profile
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tab Navigation */}
          <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-2 mb-6">
            <div className="flex space-x-2">
              {[
                { id: 'profile', label: 'Profile Info', icon: 'user' },
                { id: 'image', label: 'Profile Image', icon: 'camera' },
                { id: 'password', label: 'Password', icon: 'lock' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white'
                      : 'text-gray-600 hover:bg-violet-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            </div>
          )}

          {/* Profile Info Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
                    placeholder="Your phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full px-4 py-3 border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
                    placeholder="Your country"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State/Region</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-4 py-3 border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
                    placeholder="Your state/region"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-4 py-3 border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
                    placeholder="Your city"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="w-full px-4 py-3 border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full px-4 py-3 border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                  <select
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    className="w-full px-4 py-3 border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
                  >
                    <option value="">Select experience</option>
                    {experienceLevels.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
                    placeholder="Tell us about yourself and your creative journey..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
                  <input
                    type="text"
                    value={formData.education}
                    onChange={(e) => handleInputChange('education', e.target.value)}
                    className="w-full px-4 py-3 border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
                    placeholder="Your education background"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      className="flex-1 px-4 py-3 border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
                      placeholder="Add a skill and press Enter"
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="bg-violet-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-violet-700 transition"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills?.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-violet-100 text-violet-800"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-2 text-violet-600 hover:text-violet-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio URL</label>
                  <input
                    type="url"
                    value={formData.portfolio}
                    onChange={(e) => handleInputChange('portfolio', e.target.value)}
                    className="w-full px-4 py-3 border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
                    placeholder="https://yourportfolio.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Links</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                  <input
                    type="url"
                    value={formData.socialLinks?.instagram}
                    onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                    className="w-full px-4 py-3 border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
                    placeholder="https://instagram.com/yourusername"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                  <input
                    type="url"
                    value={formData.socialLinks?.twitter}
                    onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                    className="w-full px-4 py-3 border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
                    placeholder="https://twitter.com/yourusername"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                  <input
                    type="url"
                    value={formData.socialLinks?.linkedin}
                    onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                    className="w-full px-4 py-3 border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
                    placeholder="https://linkedin.com/in/yourusername"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio Website</label>
                  <input
                    type="url"
                    value={formData.socialLinks?.portfolio}
                    onChange={(e) => handleSocialLinkChange('portfolio', e.target.value)}
                    className="w-full px-4 py-3 border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-violet-700 hover:via-indigo-700 hover:to-violet-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </div>
          )}

          {/* Profile Image Tab */}
          {activeTab === 'image' && (
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8">
              <div className="text-center">
                <div className="mb-6">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile Preview"
                      className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-violet-200"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-violet-100 flex items-center justify-center mx-auto border-4 border-violet-200">
                      <svg className="w-16 h-16 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 011 8 0zM12 14a7 7 0 00-7 7 7 7 0 000 14z"></path>
                      </svg>
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload New Profile Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-3 border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
                  />
                  <p className="text-sm text-gray-500 mt-2">Maximum file size: 5MB. Supported formats: JPG, PNG, GIF</p>
                </div>

                {imageFile && (
                  <button
                    onClick={saveImage}
                    disabled={saving}
                    className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-violet-700 hover:via-indigo-700 hover:to-violet-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Uploading...' : 'Upload Image'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8">
              <div className="max-w-md mx-auto space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-4 py-3 border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
                    placeholder="Enter your current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-4 py-3 border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
                    placeholder="Enter your new password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-4 py-3 border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
                    placeholder="Confirm your new password"
                  />
                </div>

                <button
                  onClick={changePassword}
                  disabled={saving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                  className="w-full bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-violet-700 hover:via-indigo-700 hover:to-violet-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
