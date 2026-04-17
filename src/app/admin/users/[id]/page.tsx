'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { adminService } from '../../../../services/adminService';
import api from '../../../../services/api';

interface UserDetails {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  creativeId?: string;
  category?: string;
  country?: string;
  state?: string;
  isVerified: boolean;
  isApproved: boolean;
  profileImage?: string;
  auditionStatus: 'pending' | 'approved' | 'rejected';
  isSelectedForContest: boolean;
  isGrandFinalist: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Submission {
  _id: string;
  title: string;
  description: string;
  category: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  thumbnailUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  feedback?: string;
}

interface Activity {
  _id: string;
  type: 'submission' | 'vote' | 'login' | 'registration' | 'status_change';
  description: string;
  createdAt: string;
  metadata?: any;
}

export default function UserDetailsPage() {
  const params = useParams();
  const userId = params.id as string;
  
  const [user, setUser] = useState<UserDetails | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<Submission | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [currentAction, setCurrentAction] = useState<{phase: 'audition' | 'contest', status: 'approved' | 'rejected'} | null>(null);

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      // Fetch user details
      const userResponse = await adminService.getUserById(userId);
      setUser(userResponse.user);
      
      // Fetch user submissions
      const submissionsResponse = await adminService.getUserSubmissions(userId);
      setSubmissions(submissionsResponse.submissions || []);
      
      // Fetch user activity/audit log
      const activityResponse = await adminService.getUserActivity(userId);
      setActivities(activityResponse.activities || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'submission':
        return '📤';
      case 'vote':
        return '🗳️';
      case 'login':
        return '🔑';
      case 'registration':
        return '📝';
      case 'status_change':
        return '⚡';
      default:
        return '📌';
    }
  };

  const handlePassFail = (phase: 'audition' | 'contest', status: 'approved' | 'rejected') => {
    setCurrentAction({ phase, status });
    if (status === 'rejected') {
      setShowFeedbackModal(true);
    } else {
      executeAction(phase, status, '');
    }
  };

  const executeAction = async (phase: 'audition' | 'contest', status: 'approved' | 'rejected', feedbackText: string) => {
    try {
      setActionLoading(true);
      const endpoint = phase === 'audition' ? '/admin/users/audition-status' : '/admin/users/contest-status';
      await api.post(endpoint, {
        userId,
        status,
        feedback: feedbackText
      });
      
      // Refresh user data
      await fetchUserDetails();
      
      // Close modal and reset
      setShowFeedbackModal(false);
      setFeedback('');
      setCurrentAction(null);
      
      alert(`User ${status === 'approved' ? 'passed' : 'failed'} ${phase} phase successfully!`);
    } catch (error: any) {
      console.error('Action error:', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const submitFeedback = () => {
    if (currentAction) {
      executeAction(currentAction.phase, currentAction.status, feedback);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error || 'User not found'}</p>
          </div>
          <Link href="/admin/dashboard" className="mt-4 inline-block text-violet-600 hover:text-violet-700">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/dashboard"
                className="text-violet-600 hover:text-violet-700 font-medium"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                User Details
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 sticky top-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full bg-violet-100 flex items-center justify-center text-3xl">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    '👤'
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Creative ID</span>
                  <span className="font-medium">{user.creativeId || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium capitalize">{user.category || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Phone</span>
                  <span className="font-medium">{user.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Country</span>
                  <span className="font-medium">{user.country || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">State</span>
                  <span className="font-medium">{user.state || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Status</span>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${user.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {user.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${user.isApproved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.isApproved ? 'Approved' : 'Not Approved'}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Joined</span>
                  <span className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-medium">{new Date(user.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contest Phase Management */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span>🏆</span>
                Contest Phase Management
              </h2>
              
              {/* Audition Phase */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Audition Phase</h3>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.auditionStatus === 'approved' ? 'bg-green-100 text-green-800' :
                    user.auditionStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.auditionStatus === 'approved' ? '✅ Passed' :
                     user.auditionStatus === 'rejected' ? '❌ Failed' :
                     '⏳ Pending'}
                  </span>
                  {user.auditionStatus === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePassFail('audition', 'approved')}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                      >
                        Pass
                      </button>
                      <button
                        onClick={() => handlePassFail('audition', 'rejected')}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                      >
                        Fail
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Contest Phase */}
              {user.auditionStatus === 'approved' && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Contest Phase</h3>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      user.isSelectedForContest ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.isSelectedForContest ? '✅ Selected for Contest' : '⏳ Waiting for Selection'}
                    </span>
                    {user.isSelectedForContest && !user.isGrandFinalist && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePassFail('contest', 'approved')}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                        >
                          Pass to Grand Final
                        </button>
                        <button
                          onClick={() => handlePassFail('contest', 'rejected')}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                        >
                          Fail
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Grand Final Phase */}
              {user.isGrandFinalist && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Grand Final Phase</h3>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    🌟 Grand Finalist
                  </span>
                </div>
              )}
            </div>

            {/* Submissions Section */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span>🎬</span>
                Submissions ({submissions.length})
              </h2>

              {submissions.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No submissions yet</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {submissions.map((submission) => (
                    <div key={submission._id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                      <div 
                        className="relative h-40 bg-gray-100 cursor-pointer"
                        onClick={() => setSelectedVideo(submission)}
                      >
                        {submission.thumbnailUrl ? (
                          <img src={submission.thumbnailUrl} alt={submission.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-violet-100">
                            <svg className="w-12 h-12 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                            submission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {submission.status}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1 truncate">{submission.title}</h3>
                        <p className="text-xs text-gray-500 mb-2 capitalize">{submission.category}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                          <span>{formatFileSize(submission.fileSize)}</span>
                          <span>{new Date(submission.submittedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedVideo(submission)}
                            className="flex-1 bg-violet-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDownload(submission.fileUrl, `${submission.title}.${submission.fileType}`)}
                            className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Activity/Audit Log Section */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span>📋</span>
                Activity Log
              </h2>

              {activities.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No activity recorded</p>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {activities.map((activity) => (
                    <div key={activity._id} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-xl flex-shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.createdAt).toLocaleString()}
                        </p>
                        {activity.metadata && (
                          <div className="mt-2 text-xs text-gray-600 bg-white p-2 rounded">
                            <pre className="whitespace-pre-wrap">{JSON.stringify(activity.metadata, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-lg">{selectedVideo.title}</h3>
              <button
                onClick={() => setSelectedVideo(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <video
                src={selectedVideo.fileUrl}
                controls
                className="w-full max-h-[60vh] rounded-lg"
                poster={selectedVideo.thumbnailUrl}
              />
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleDownload(selectedVideo.fileUrl, `${selectedVideo.title}.${selectedVideo.fileType}`)}
                  className="bg-violet-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-violet-700 transition"
                >
                  Download Video
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && currentAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">
              {currentAction.status === 'rejected' ? 'Provide Feedback' : 'Confirm Action'}
            </h3>
            <p className="text-gray-600 mb-4">
              {currentAction.status === 'rejected'
                ? `Please provide feedback for why the user is failing the ${currentAction.phase} phase:`
                : `Are you sure you want to pass this user to the next stage?`}
            </p>
            {currentAction.status === 'rejected' && (
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Enter feedback for the user..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[100px] mb-4"
              />
            )}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setFeedback('');
                  setCurrentAction(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={submitFeedback}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
