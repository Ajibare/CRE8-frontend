'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../store/authStore';
import { submissionService } from '../../services/submissionService';
import { votingService } from '../../services/votingService';
import { contestPhaseService, getPhaseDisplayText, getPhaseColor } from '../../services/contestPhaseService';
import { formatDate } from '../../utils/dateUtils';
import Image from 'next/image';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  creativeId?: string;
  category?: string;
  country?: string;
  state?: string;
  profileImage?: string;
  isVerified: boolean;
  isApproved: boolean;
  auditionStatus?: string;
  bio?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    portfolio?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Submission {
  _id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: 'image' | 'video' | 'audio' | 'document';
  fileSize: number;
  thumbnailUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  votes: number;
  averageRating?: number;
  tags: string[];
  category?: string;
  submittedAt: string;
  createdAt?: string;
  week: number;
  contestId: string;
  contest?: {
    title: string;
    status: string;
  };
}

interface Vote {
  _id: string;
  votesCount: number;
  amount: number;
  voteBundle: {
    votes: number;
    price: number;
    type: string;
  };
  createdAt: string;
  contestant?: {
    name: string;
    creativeId: string;
    category: string;
    profileImage: string;
  };
  submission?: {
    title: string;
  };
}

export default function UserDashboard() {
  const router = useRouter();
  const { user, completeRegistration } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'submissions' | 'voting' | 'profile'>('overview');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    totalVotes: 0,
    averageRating: 0,
    contestParticipation: 0
  });
  const [phaseInfo, setPhaseInfo] = useState<{ phase: string; auditionStart: string; contestStart: string; contestEnd: string } | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  // Contest starts May 1st
  const CONTEST_START_DATE = new Date('2025-05-01T00:00:00');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = CONTEST_START_DATE.getTime() - now.getTime();
      
      if (diff <= 0) {
        setCountdown(null);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const isContestStarted = () => {
    return new Date() >= CONTEST_START_DATE;
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await submissionService.getUserSubmissions();
      setSubmissions(data.submissions || []);
      setError('');
    } catch (error: any) {
      console.error('Fetch user data error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPhase = async () => {
    try {
      const phase = await contestPhaseService.getPhaseInfo();
      setPhaseInfo(phase);
    } catch (error) {
      console.error('Failed to fetch phase info:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      fetchPhase();
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'submissions') {
      fetchSubmissions();
    } else if (activeTab === 'voting') {
      fetchVotes();
    }
  }, [activeTab]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const data = await submissionService.getUserSubmissions();
      setSubmissions(data.submissions || []);
      setError('');
    } catch (error: any) {
      console.error('Fetch user data error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const data = await submissionService.getUserSubmissions();
      setSubmissions(data.submissions || []);
    } catch (error: any) {
      console.error('Fetch submissions error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  const fetchVotes = async () => {
    try {
      setLoading(true);
      const data = await votingService.getUserVotingHistory();
      setVotes(data.votes || []);
    } catch (error: any) {
      console.error('Fetch votes error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to fetch voting history');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubmission = async (submissionId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      await submissionService.deleteSubmission(submissionId);
      // Refresh submissions list
      await fetchSubmissions();
      alert('Submission deleted successfully');
    } catch (error: any) {
      console.error('Delete submission error:', error);
      alert(error.response?.data?.message || error.message || 'Failed to delete submission');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'pending':
        return 'Pending Review';
      default:
        return status;
    }
  };

  const renderFilePreview = (submission: Submission) => {
    if (submission.fileType === 'image') {
      return (
        <Image
          src={submission.fileUrl}
          alt={submission.title}
          className="w-full h-32 object-cover rounded-lg"
        />
      );
    } else if (submission.fileType === 'video') {
      return (
        <video
          src={submission.fileUrl}
          className="w-full h-32 object-cover rounded-lg"
          controls={false}
          muted
        />
      );
    } else {
      return (
        <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            {getFileIcon(submission.fileType)}
            <p className="text-sm text-gray-500 mt-1">{submission.fileType}</p>
          </div>
        </div>
      );
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
      {/* Animated background elements */}
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
                <div className="w-12 h-12 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-sm font-bold text-white">
                    {user.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
                    Welcome back, {user.name}!
                  </h1>
                  <p className="text-sm text-gray-600">
                    {user.creativeId && `Creative ID: ${user.creativeId}`}
                    {user.category && ` | ${user.category}`}
                  </p>
                </div>
              </div>
              <Link
                href="/login"
                className="bg-white text-violet-600 px-4 py-2 rounded-lg font-semibold hover:bg-violet-50 transition"
              >
                Logout
              </Link>
            </div>
          </div>
        </div>

        {/* Contest Phase Banner - Hidden until May 1st for CONTEST phase */}
        {phaseInfo && (phaseInfo.phase !== 'CONTEST' || isContestStarted()) && (
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 pt-4">
            <div className={`rounded-xl p-3 ${getPhaseColor(phaseInfo.phase)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">{getPhaseDisplayText(phaseInfo.phase)}</p>
                  {phaseInfo.phase === 'AUDITION' && (
                    <p className="text-xs mt-1 opacity-80">Submit one video by May 31st</p>
                  )}
                  {phaseInfo.phase === 'CONTEST' && isContestStarted() && (
                    <p className="text-xs mt-1 opacity-80">Selected contestants: one video per week</p>
                  )}
                </div>
                {isContestStarted() ? (
                  <Link
                    href="/submissions/submit"
                    className="px-3 py-1.5 bg-white rounded-lg text-xs font-medium hover:bg-gray-50 transition"
                  >
                    Submit Work
                  </Link>
                ) : (
                  <div className="text-xs text-center">
                    {countdown && (
                      <div className="bg-white/80 rounded-lg px-2 py-1">
                        <p className="font-semibold text-violet-700">Opens in:</p>
                        <p className="text-violet-600 font-mono">
                          {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4">
          <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-1.5">
            <div className="flex space-x-1">
              {[
                { id: 'overview', label: 'Overview', icon: 'home' },
                { id: 'submissions', label: 'My Submissions', icon: 'document' },
                { id: 'profile', label: 'Profile', icon: 'user' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center px-2 sm:px-3 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white'
                      : 'text-gray-600 hover:bg-violet-50'
                  }`}
                >
                  <svg className="w-4 h-4 mr-1 sm:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {tab.id === 'overview' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M13 5l7 7-7-7M3 12l2 2m0 0l7-7-7-7"></path>
                    )}
                    {tab.id === 'submissions' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    )}
                    {tab.id === 'voting' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 015.656 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    )}
                    {tab.id === 'profile' && (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 011-8 0zM12 14a7 7 0 00-7 7 7 7 0 000 14z"></path>
                    )}
                  </svg>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
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

          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Profile Overview */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Creative ID</label>
                      <div className="text-lg font-semibold text-violet-600">
                        {user.creativeId || 'Not Generated'}
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <div className="text-lg font-semibold text-gray-900">
                        {user.category || 'Not Selected'}
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          user.isVerified && user.isApproved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {user.isVerified && user.isApproved ? 'Active' : 'Pending'}
                        </span>
                        <span className="text-sm text-gray-500">
                          Member since {formatDate(user.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                      <div className="text-gray-900">
                        <p className="mb-1 font-medium">{user.phone || 'No phone provided'}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    {user.bio && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                        <p className="text-gray-900">{user.bio}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{submissions.length}</div>
                  <div className="text-sm text-gray-600">Submissions</div>
                </div>

                <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-violet-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 015.656 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{votes.length}</div>
                  <div className="text-sm text-gray-600">Total Votes</div>
                </div>

                <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0l8-8m-8 8V3m0 0l8 8m0-8L3 3m0 0L3 11m0 0h8"></path>
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    #{submissions.reduce((sum, s) => sum + (s.votes || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600">Votes Received</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 gap-4">
                  {isContestStarted() ? (
                    <Link
                      href="/submissions/submit"
                      className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-violet-700 hover:via-indigo-700 hover:to-violet-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-center"
                    >
                      Submit New Work
                    </Link>
                  ) : (
                    <div className="bg-gray-100 text-gray-500 px-6 py-3 rounded-xl font-semibold text-center cursor-not-allowed">
                      <p>Submission Opens May 1st</p>
                      {countdown && (
                        <p className="text-xs mt-1 font-mono">
                          {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'submissions' && (
            <div className="space-y-6">
              {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading submissions...</p>
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Submissions Yet</h3>
                    <p className="text-gray-600 mb-6 text-sm sm:text-base max-w-md mx-auto">
                      Share your creative work with the community. Submit your first entry now!
                    </p>
                    {isContestStarted() ? (
                      <Link
                        href="/submissions/submit"
                        className="inline-block bg-violet-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-violet-700 transition"
                      >
                        Submit Your First Work
                      </Link>
                    ) : (
                      <div className="inline-block bg-gray-300 text-gray-500 px-6 py-3 rounded-lg font-semibold cursor-not-allowed">
                        <p>Opens May 1st</p>
                        {countdown && (
                          <p className="text-xs font-mono mt-1">
                            {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {submissions.map((submission) => (
                      <div key={submission._id} className="bg-white rounded-xl shadow-md p-4 sm:p-5 hover:shadow-lg transition-all duration-300 border border-gray-100">
                        <div className="flex flex-col h-full">
                          {/* File Preview */}
                          {submission.fileUrl && (
                            <div className="mb-3">
                              {renderFilePreview(submission)}
                            </div>
                          )}

                          <div className="flex items-start justify-between gap-3 mb-3">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-1 flex-1">{submission.title}</h3>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700 shrink-0">
                              {submission.votes || 0} votes
                            </span>
                          </div>

                          <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">{submission.description}</p>

                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mt-auto pt-3 border-t border-gray-100">
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path>
                              </svg>
                              {submission.category}
                            </span>
                            <span className="hidden sm:inline text-gray-300">|</span>
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                              </svg>
                              {formatDate(submission.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Profile Header Card */}
              <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl shadow-xl p-6 sm:p-8 text-white">
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  <div className="text-center sm:text-left">
                    <h2 className="text-2xl sm:text-3xl font-bold">{user.name}</h2>
                    <p className="text-violet-100 mt-1">{user.email}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                      {user.category || 'Creative'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                      </svg>
                    </div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                  </div>
                  <div className="text-gray-900 font-medium">{user.phone || 'Not provided'}</div>
                </div>

                <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                      </svg>
                    </div>
                    <label className="text-sm font-medium text-gray-500">Category</label>
                  </div>
                  <div className="text-gray-900 font-medium">{user.category || 'Not Selected'}</div>
                </div>

                {user.country && (
                  <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                      <label className="text-sm font-medium text-gray-500">Country</label>
                    </div>
                    <div className="text-gray-900 font-medium">{user.country}</div>
                  </div>
                )}

                {user.state && (
                  <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                      </div>
                      <label className="text-sm font-medium text-gray-500">State</label>
                    </div>
                    <div className="text-gray-900 font-medium">{user.state}</div>
                  </div>
                )}
              </div>

              {/* Bio Section */}
              {user.bio && (
                <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </div>
                    <label className="text-sm font-medium text-gray-500">Bio</label>
                  </div>
                  <div className="text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-4">{user.bio}</div>
                </div>
              )}
                  {user.socialLinks && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Social Links</label>
                      <div className="space-y-2">
                        {user.socialLinks.instagram && (
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-pink-600 mr-2" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 6.971 2.584 8.726 4.051 1.755 1.467 3.03 2.828 3.032.828 0 0 .548.453 1.069 0 1.518-.355 3.222-.848 4.743-.774 1.518-1.467 3.032-2.828 3.032-2.828 0 0 .548.453 1.069 0 1.518-.355 3.222-.848 4.743-.774 1.518-1.467 3.032-2.828 3.032-2.828 0 0 .548.453 1.069 0 1.518-.355 3.222-.848 4.743-.774 1.518-1.467 3.032-2.828 3.032-2.828 0 0 .548.453 1.069 0 1.518-.355 3.222-.848 4.743-.774 1.518-1.467 3.032-2.828 3.032-2.828 0 0 .548.453 1.069 0 1.518-.355 3.222-.848 4.743-.774 1.518-1.467 3.032-2.828 3.032-2.828 0 0 .548.453 1.069 0 1.518-.355 3.222-.848 4.743-.774 1.518-1.467 3.032-2.828 3.032-2.828 0 0 .548.453 1.069 0 1.518-.355 3.222-.848 4.743-.774 1.518-1.467 3.032-2.828 3.032-2.828 0 0 .548.453 1.069 0 1.518-.355 3.222-.848 4.743-.774 1.518-1.467 3.032-2.828 3.032-2.828 0 0 .548.453 1.069 0 1.518-.355 3.222-.848 4.743-.774 1.518-1.467 3.032-2.828 3.032-2.828 0 0 .548.453 1.069 0 1.518-.355 3.222-.848 4.743-.774 1.518-1.467 3.032-2.828 3.032-2.828z"></path>
                            </svg>
                            <a
                              href={user.socialLinks.instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-pink-600 hover:text-pink-700"
                            >
                              Instagram
                            </a>
                          </div>
                        )}
                        {user.socialLinks.twitter && (
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23 3a10.9 10.9 0 01-3.14 0l-4.24 4.24a10.9 10.9 0 01-3.14 0l-4.24-4.24A10.9 10.9 0 013.86 3.14L14.14 14.14a10.9 10.9 0 013.86-3.14l4.24-4.24a10.9 10.9 0 013.86 3.14L14.14 14.14 10.9 10.9 0 01-3.14 0l-4.24-4.24A10.9 10.9 0 013.86-3.14L14.14 14.14l-4.24 4.24a10.9 10.9 0 01-3.14 0l-4.24-4.24z"></path>
                            </svg>
                            <a
                              href={user.socialLinks.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-500"
                            >
                              Twitter
                            </a>
                          </div>
                        )}
                        {user.socialLinks.linkedin && (
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-blue-700 mr-2" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19 0h-14v14h14V0zM16.5 8.5a1.5 1.5 0 00-3 0V6a1.5 1.5 0 013 0h-3z"></path>
                              <path d="M16.5 8.5a1.5 1.5 0 00-3 0V6a1.5 1.5 0 013 0h-3z"></path>
                              <path d="M16.5 8.5a1.5 1.5 0 00-3 0V6a1.5 1.5 0 013 0h-3z"></path>
                            </svg>
                            <a
                              href={user.socialLinks.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-700 hover:text-blue-800"
                            >
                              LinkedIn
                            </a>
                          </div>
                        )}
                        {user.socialLinks.portfolio && (
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V8a2 2 0 00-2-2h-1zm-4 0a1 1 0 00-1 1v10a1 1 0 001 1h1a1 1 0 001-1V7a1 1 0 00-1-1h-1zm0 0a1 1 0 00-1 1v10a1 1 0 001 1h1a1 1 0 001-1V7a1 1 0 00-1-1h-1z"></path>
                            </svg>
                            <a
                              href={user.socialLinks.portfolio}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-gray-700"
                            >
                              Portfolio
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Member Since</span>
                    <span className="text-sm text-gray-900">{formatDate(user.createdAt)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Last Updated</span>
                    <span className="text-sm text-gray-900">{formatDate(user.updatedAt)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Account Status</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.isVerified && user.isApproved
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {user.isVerified && user.isApproved ? 'Active' : 'Pending Approval'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
