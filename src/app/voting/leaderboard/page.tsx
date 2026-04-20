'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { votingService, LeaderboardEntry } from '../../../services/votingService';
import { formatDate } from '../../../utils/dateUtils';

function LeaderboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [contests, setContests] = useState<any[]>([]);
  const [selectedContest, setSelectedContest] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
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
    'Advertising',
    'Art & Craft',
    'Business & Creative Strategist'
  ];
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    fetchContests();
  }, []);

  useEffect(() => {
    if (searchParams.get('contestId')) {
      setSelectedContest(searchParams.get('contestId')!);
    }
    if (searchParams.get('category')) {
      setSelectedCategory(searchParams.get('category')!);
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedContest) {
      fetchLeaderboard();
    }
  }, [selectedContest, selectedCategory, page]);

  const fetchContests = async () => {
    try {
      const response = await fetch('/api/contests?status=voting');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch contests');
      }

      setContests(data.contests || []);
      if (!selectedContest && data.contests.length > 0) {
        setSelectedContest(data.contests[0]._id);
      }
    } catch (error: any) {
      console.error('Fetch contests error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await votingService.getContestLeaderboard(
        selectedContest,
        selectedCategory || undefined,
        page
      );

      setLeaderboard(data.leaderboard || []);
      setPagination(data.pagination);
    } catch (error: any) {
      console.error('Fetch leaderboard error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getRankDisplay = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 1:
        return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return 'https://cdn-icons-png.flaticon.com/png/512/845/845-1.png';
      case 2:
        return 'https://cdn-icons-png.flaticon.com/png/512/845/845-2.png';
      case 3:
        return 'https://cdn-icons-png.flaticon.com/png/512/845/845-3.png';
      default:
        return null;
    }
  };

  if (loading && page === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
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
              <Link
                href="/contests"
                className="inline-flex items-center text-violet-600 hover:text-violet-700 font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Back to Contests
              </Link>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Contest Leaderboard
              </h1>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contest</label>
                <select
                  value={selectedContest}
                  onChange={(e) => {
                    setSelectedContest(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
                >
                  <option value="">Select a contest...</option>
                  {contests.map((contest) => (
                    <option key={contest._id} value={contest._id}>
                      {contest.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all duration-200"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <Link
                  href="/submissions/submit"
                  className="w-full bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 text-white px-6 py-2 rounded-xl font-semibold hover:from-violet-700 hover:via-indigo-700 hover:to-violet-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-center"
                >
                  Submit Work
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!selectedContest ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 012-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Contest</h3>
              <p className="text-gray-600">Choose a contest to view the leaderboard</p>
            </div>
          ) : loading && page === 1 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading leaderboard...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 012-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Votes Yet</h3>
              <p className="text-gray-600">
                Be the first to vote for creative submissions!
              </p>
              <Link
                href={`/submissions/gallery?contestId=${selectedContest}`}
                className="bg-violet-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-violet-700 transition"
              >
                Browse Submissions
              </Link>
            </div>
          ) : (
            <>
              {/* Top 3 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {leaderboard.slice(0, 3).map((entry, index) => (
                  <div
                    key={entry.contestantId}
                    className={`relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 ${getRankDisplay(index)}`}
                  >
                    {/* Rank Badge */}
                    <div className={`absolute top-4 left-4 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${getRankDisplay(index)}`}>
                      {index + 1}
                    </div>

                    {/* Rank Icon */}
                    {getRankIcon(index + 1) && (
                      <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white flex items-center justify-center">
                        <img
                          src={getRankIcon(index + 1)!}
                          alt={`Rank ${index + 1}`}
                          className="w-6 h-6"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-6 pt-16">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-xs font-bold text-violet-600">
                            {entry.contestant.creativeId?.slice(-4) || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg">
                            {entry.contestant.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {entry.contestant.category || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="text-center mb-4">
                        <div className="text-3xl font-bold text-violet-600 mb-1">
                          {entry.totalVotes.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Total Votes</div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-center text-sm">
                        <div>
                          <div className="text-lg font-semibold text-gray-900">
                            #{(entry.totalAmount / 1000).toFixed(1)}K
                          </div>
                          <div className="text-xs text-gray-500">Total Amount</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-gray-900">
                            {entry.voteCount}
                          </div>
                          <div className="text-xs text-gray-500">Vote Count</div>
                        </div>
                      </div>

                      <Link
                        href={`/voting/vote?submissionId=${entry.submissionId}`}
                        className="block w-full bg-white text-violet-600 px-4 py-2 rounded-lg font-semibold hover:bg-violet-50 transition text-center"
                      >
                        View & Vote
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Rest of Leaderboard */}
              <div className="space-y-4">
                {leaderboard.slice(3).map((entry, index) => (
                  <div
                    key={entry.contestantId}
                    className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-xs font-bold text-gray-600">
                            #{index + 4}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {entry.contestant.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {entry.contestant.category || 'N/A'} ({entry.contestant.creativeId})
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          {entry.totalVotes.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          #{(entry.totalAmount / 1000).toFixed(1)}K
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/voting/vote?submissionId=${entry.submissionId}`}
                      className="block w-full bg-white text-violet-600 px-4 py-2 rounded-lg font-semibold hover:bg-violet-50 transition text-center"
                    >
                      View & Vote
                    </Link>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-8">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 bg-white border border-violet-300 rounded-lg font-medium hover:bg-violet-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-gray-600">
                    Page {page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.pages}
                    className="px-4 py-2 bg-white border border-violet-300 rounded-lg font-medium hover:bg-violet-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LeaderboardContent />
    </Suspense>
  );
}
