'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { profileService, Profile } from '../../../services/profileService';
import { submissionService, Submission } from '../../../services/submissionService';
import { formatDate } from '../../../utils/dateUtils';

interface PortfolioStats {
  totalSubmissions: number;
  approvedSubmissions: number;
  totalVotes: number;
  averageRating: number;
  contestParticipations: number;
  weeksCompleted: number;
}

export default function PortfolioPage() {
  const params = useParams();
  const userId = params.userId as string;
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<PortfolioStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'gallery' | 'about' | 'stats'>('gallery');

  useEffect(() => {
    fetchPortfolioData();
  }, [userId]);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      
      // Fetch profile and submissions in parallel
      const [profileData, userSubmissions] = await Promise.all([
        profileService.getPublicProfile(userId),
        submissionService.getUserSubmissions()
      ]);
      
      setProfile(profileData);
      
      // Filter submissions to only show approved ones for public portfolio
      const approvedSubmissions = userSubmissions.submissions?.filter(
        (s: Submission) => s.status === 'approved'
      ) || [];
      
      setSubmissions(approvedSubmissions);
      
      // Calculate stats
      const totalVotes = approvedSubmissions.reduce((sum: number, s: Submission) => sum + (s.votes || 0), 0);
      const averageRating = approvedSubmissions.length > 0
        ? approvedSubmissions.reduce((sum: number, s: Submission) => sum + (s.averageRating || 0), 0) / approvedSubmissions.length
        : 0;
      
      // Get unique contests
      const contestIds = [...new Set(approvedSubmissions.map((s: Submission) => s.contestId))];
      const weeksCompleted = approvedSubmissions.length;
      
      setStats({
        totalSubmissions: approvedSubmissions.length,
        approvedSubmissions: approvedSubmissions.length,
        totalVotes,
        averageRating: Math.round(averageRating * 10) / 10,
        contestParticipations: contestIds.length,
        weeksCompleted
      });
      
      setError('');
    } catch (err: any) {
      console.error('Fetch portfolio error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch portfolio');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        );
      case 'video':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
          </svg>
        );
      case 'audio':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3m0 0l-3 3m0 0l-3 3m3-3v12m0 0l3 3m-3-3h.01M6 20h12a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2zM9 10l12-3m0 0l-3 3m0 0l-3 3m3-3v12m0 0l3 3m-3-3h.01"></path>
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Portfolio Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'This user portfolio is not available.'}</p>
          <Link
            href="/submissions/gallery"
            className="bg-violet-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-violet-700 transition"
          >
            Browse Gallery
          </Link>
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
              <Link
                href="/submissions/gallery"
                className="inline-flex items-center text-violet-600 hover:text-violet-700 font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Back to Gallery
              </Link>
            </div>
          </div>
        </div>

        {/* Profile Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt={profile.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  profile.name.charAt(0)
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{profile.name}</h1>
                <p className="text-violet-600 font-semibold mb-1">Creative ID: {profile.creativeId}</p>
                <p className="text-gray-600 mb-3">{profile.category}</p>
                
                {profile.bio && (
                  <p className="text-gray-700 mb-4 max-w-2xl">{profile.bio}</p>
                )}

                {/* Social Links */}
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  {profile.socialLinks?.instagram && (
                    <a
                      href={profile.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                      Instagram
                    </a>
                  )}
                  {profile.socialLinks?.twitter && (
                    <a
                      href={profile.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                      Twitter
                    </a>
                  )}
                  {profile.socialLinks?.linkedin && (
                    <a
                      href={profile.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      LinkedIn
                    </a>
                  )}
                  {profile.portfolio && (
                    <a
                      href={profile.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
                      </svg>
                      Portfolio
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-violet-600">{stats.totalSubmissions}</div>
                <div className="text-sm text-gray-600">Submissions</div>
              </div>
              <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-violet-600">{stats.totalVotes}</div>
                <div className="text-sm text-gray-600">Total Votes</div>
              </div>
              <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-violet-600">{stats.contestParticipations}</div>
                <div className="text-sm text-gray-600">Contests</div>
              </div>
              <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-violet-600">{stats.averageRating.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Avg Rating</div>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-2 mb-6">
            <div className="flex space-x-2">
              {[
                { id: 'gallery', label: 'Gallery' },
                { id: 'about', label: 'About' },
                { id: 'stats', label: 'Stats' }
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

          {/* Gallery Tab */}
          {activeTab === 'gallery' && (
            <div className="space-y-6">
              {submissions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Submissions Yet</h3>
                  <p className="text-gray-600">This creative hasn't submitted any work yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {submissions.map((submission) => (
                    <div key={submission._id} className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                      {/* Preview */}
                      <div className="aspect-video bg-gray-100">
                        {submission.fileType === 'image' ? (
                          <img
                            src={submission.fileUrl}
                            alt={submission.title}
                            className="w-full h-full object-cover"
                          />
                        ) : submission.fileType === 'video' ? (
                          <video
                            src={submission.fileUrl}
                            className="w-full h-full object-cover"
                            controls={false}
                            muted
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                              {getFileIcon(submission.fileType)}
                              <p className="text-sm text-gray-500 mt-2">{submission.fileType}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1">{submission.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{submission.description}</p>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>Week {submission.week}</span>
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 015.656 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            {submission.votes} votes
                          </span>
                        </div>

                        {submission.averageRating && (
                          <div className="flex items-center mt-2">
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-4 h-4 ${i < Math.round(submission.averageRating || 0) ? 'fill-current' : 'text-gray-300'}`}
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-sm text-gray-600 ml-2">
                              {submission.averageRating.toFixed(1)}
                            </span>
                          </div>
                        )}

                        <Link
                          href={`/voting/vote?submissionId=${submission._id}`}
                          className="block w-full mt-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 text-white py-2 rounded-lg font-semibold hover:from-violet-700 hover:via-indigo-700 hover:to-violet-700 transition-all duration-300 text-center"
                        >
                          Vote for this Work
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">About {profile.name}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Background</h3>
                  <div className="space-y-2 text-gray-700">
                    {profile.experience && (
                      <p><span className="font-medium">Experience:</span> {profile.experience}</p>
                    )}
                    {profile.education && (
                      <p><span className="font-medium">Education:</span> {profile.education}</p>
                    )}
                    {profile.country && (
                      <p><span className="font-medium">Location:</span> {profile.city}, {profile.state}, {profile.country}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills</h3>
                  {profile.skills && profile.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No skills listed yet.</p>
                  )}
                </div>
              </div>

              {profile.bio && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Bio</h3>
                  <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                </div>
              )}
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && stats && (
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Performance Stats</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-violet-50 rounded-xl p-6">
                  <div className="text-4xl font-bold text-violet-600 mb-2">{stats.totalSubmissions}</div>
                  <div className="text-gray-700 font-medium">Total Submissions</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {stats.weeksCompleted} weeks completed
                  </div>
                </div>

                <div className="bg-violet-50 rounded-xl p-6">
                  <div className="text-4xl font-bold text-violet-600 mb-2">{stats.totalVotes}</div>
                  <div className="text-gray-700 font-medium">Total Votes Received</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Avg {stats.totalSubmissions > 0 ? (stats.totalVotes / stats.totalSubmissions).toFixed(1) : 0} per submission
                  </div>
                </div>

                <div className="bg-violet-50 rounded-xl p-6">
                  <div className="text-4xl font-bold text-violet-600 mb-2">{stats.contestParticipations}</div>
                  <div className="text-gray-700 font-medium">Contests Entered</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Active participant
                  </div>
                </div>

                <div className="bg-violet-50 rounded-xl p-6">
                  <div className="text-4xl font-bold text-violet-600 mb-2">{stats.averageRating.toFixed(1)}</div>
                  <div className="text-gray-700 font-medium">Average Rating</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Out of 5.0 stars
                  </div>
                </div>

                <div className="bg-violet-50 rounded-xl p-6">
                  <div className="text-4xl font-bold text-violet-600 mb-2">
                    {profile.createdAt ? formatDate(profile.createdAt) : 'N/A'}
                  </div>
                  <div className="text-gray-700 font-medium">Member Since</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
