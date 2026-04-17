'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminService, DashboardStats } from '../../../services/adminService';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (error: any) {
      console.error('Fetch dashboard stats error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatCurrency = (num: number) => {
    return `#${num.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchDashboardStats}
            className="bg-violet-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-violet-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
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
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 mt-1">Manage your creative contest platform</p>
              </div>
              <div className="flex space-x-4">
                <Link
                  href="/admin/users"
                  className="bg-white text-violet-600 px-4 py-2 rounded-lg font-semibold hover:bg-violet-50 transition"
                >
                  Users
                </Link>
                <Link
                  href="/admin/contests"
                  className="bg-white text-violet-600 px-4 py-2 rounded-lg font-semibold hover:bg-violet-50 transition"
                >
                  Contests
                </Link>
                <Link
                  href="/admin/submissions"
                  className="bg-white text-violet-600 px-4 py-2 rounded-lg font-semibold hover:bg-violet-50 transition"
                >
                  Submissions
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Users Stats */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1m0 0h6a2 2 0 002-2v-1a2 2 0 00-2-2H3a2 2 0 00-2 2v1a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div className="text-sm text-gray-500">Users</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-gray-900">{formatNumber(stats.stats.users.total)}</div>
                <div className="text-sm text-gray-600">
                  <span className="text-green-600">{formatNumber(stats.stats.users.verified)} verified</span>
                  <span className="text-gray-400"> / </span>
                  <span className="text-orange-600">{formatNumber(stats.stats.users.pending)} pending</span>
                </div>
              </div>
            </div>

            {/* Contests Stats */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <div className="text-sm text-gray-500">Contests</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-gray-900">{formatNumber(stats.stats.contests.total)}</div>
                <div className="text-sm text-gray-600">
                  <span className="text-green-600">{formatNumber(stats.stats.contests.active)} active</span>
                  <span className="text-gray-400"> / </span>
                  <span className="text-blue-600">{formatNumber(stats.stats.contests.completed)} completed</span>
                </div>
              </div>
            </div>

            {/* Submissions Stats */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div className="text-sm text-gray-500">Submissions</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-gray-900">{formatNumber(stats.stats.submissions.total)}</div>
                <div className="text-sm text-gray-600">
                  <span className="text-green-600">{formatNumber(stats.stats.submissions.approved)} approved</span>
                  <span className="text-gray-400"> / </span>
                  <span className="text-orange-600">{formatNumber(stats.stats.submissions.pending)} pending</span>
                </div>
              </div>
            </div>

            {/* Voting Stats */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-violet-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 015.656 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div className="text-sm text-gray-500">Voting</div>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-gray-900">{formatNumber(stats.stats.voting.totalVotes)}</div>
                <div className="text-sm text-gray-600">
                  <span className="text-green-600">{formatCurrency(stats.stats.voting.totalRevenue)}</span>
                  <span className="text-gray-400"> revenue</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Users */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
              <div className="space-y-3">
                {stats.recent.users.slice(0, 5).map((user, index) => (
                  <div key={user._id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-xs font-bold text-violet-600">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.isVerified ? (
                        <span className="text-green-600">Verified</span>
                      ) : (
                        <span className="text-orange-600">Pending</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/admin/users"
                className="block w-full text-center bg-violet-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-violet-700 transition mt-4"
              >
                View All Users
              </Link>
            </div>

            {/* User Phase Management */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>🏆</span> Contest Phase Management
              </h3>
              <div className="space-y-3">
                <Link
                  href="/admin/users"
                  className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⏳</span>
                    <div>
                      <p className="font-medium text-gray-900">Pending Audition</p>
                      <p className="text-sm text-gray-600">Users waiting for audition review</p>
                    </div>
                  </div>
                  <span className="text-violet-600 font-semibold">Review →</span>
                </Link>
                
                <Link
                  href="/admin/users"
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <p className="font-medium text-gray-900">Contest Phase</p>
                      <p className="text-sm text-gray-600">Pass or fail contestants</p>
                    </div>
                  </div>
                  <span className="text-violet-600 font-semibold">Manage →</span>
                </Link>
                
                <Link
                  href="/admin/users"
                  className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🌟</span>
                    <div>
                      <p className="font-medium text-gray-900">Grand Finals</p>
                      <p className="text-sm text-gray-600">Select grand finalists</p>
                    </div>
                  </div>
                  <span className="text-violet-600 font-semibold">Manage →</span>
                </Link>
              </div>
            </div>

            {/* Recent Submissions with Actions */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Pending Submissions</h3>
                <Link
                  href="/admin/submissions/review"
                  className="text-sm text-violet-600 hover:underline"
                >
                  Review All →
                </Link>
              </div>
              <div className="space-y-3">
                {stats.recent.submissions.filter(s => s.status === 'pending').slice(0, 5).map((submission, index) => (
                  <div key={submission._id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {submission.userId?.name || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {submission.category}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          try {
                            await fetch(`/api/admin/submissions/${submission._id}/review`, { 
                              method: 'PATCH', 
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: 'approved' })
                            });
                            window.location.reload();
                          } catch (e) {
                            console.error('Approve failed', e);
                          }
                        }}
                        className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await fetch(`/api/admin/submissions/${submission._id}/review`, { 
                              method: 'PATCH', 
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: 'rejected' })
                            });
                            window.location.reload();
                          } catch (e) {
                            console.error('Reject failed', e);
                          }
                        }}
                        className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
                {stats.recent.submissions.filter(s => s.status === 'pending').length === 0 && (
                  <p className="text-gray-500 text-center py-4">No pending submissions</p>
                )}
              </div>
              <Link
                href="/admin/submissions/review"
                className="block w-full text-center bg-violet-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-violet-700 transition mt-4"
              >
                Full Submission Review
              </Link>
            </div>

            {/* Recent Votes */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Votes</h3>
              <div className="space-y-3">
                {stats.recent.votes.slice(0, 5).map((vote, index) => (
                  <div key={vote._id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-xs font-bold text-purple-600">
                          {vote.voterId?.name?.charAt(0) || 'V'}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {vote.voterId?.name || 'Anonymous'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {vote.votesCount} votes
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      <span className="text-green-600">#{vote.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/admin/analytics"
                className="block w-full text-center bg-violet-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-violet-700 transition mt-4"
              >
                View Analytics
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link
                href="/admin/contests/new"
                className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-violet-700 hover:via-indigo-700 hover:to-violet-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-center"
              >
                Create Contest
              </Link>
              <Link
                href="/admin/submissions/review"
                className="bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-700 hover:via-red-700 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-center"
              >
                Review Submissions
              </Link>
              <Link
                href="/admin/analytics"
                className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:via-emerald-700 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-center"
              >
                View Analytics
              </Link>
              <Link
                href="/admin/export"
                className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:via-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-center"
              >
                Export Data
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
