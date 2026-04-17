'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDate } from '../../utils/dateUtils';

interface Contest {
  _id: string;
  title: string;
  description: string;
  status: 'audition' | 'active' | 'voting' | 'finished';
  startDate: string;
  endDate: string;
  registrationFee: number;
  prizes: {
    first: number;
    second: number;
    third: number;
  };
  categories: string[];
  currentWeek?: number;
  totalWeeks: number;
  settings: {
    allowVoting: boolean;
    votingCost: number;
    maxVotesPerUser: number;
    requireApprovalForSubmissions: boolean;
  };
  createdAt: string;
}

export default function ContestsPage() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchContests();
  }, [filter]);

  const fetchContests = async () => {
    try {
      setLoading(true);
      const url = filter === 'all' 
        ? '/api/contests'
        : `/api/contests?status=${filter}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch contests');
      }

      setContests(data.contests || []);
    } catch (error: any) {
      console.error('Fetch contests error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'audition':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'voting':
        return 'bg-purple-100 text-purple-800';
      case 'finished':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'audition':
        return 'Audition Phase';
      case 'active':
        return 'Active';
      case 'voting':
        return 'Voting Phase';
      case 'finished':
        return 'Finished';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contests...</p>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Contests</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchContests}
            className="bg-violet-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-violet-700 transition"
          >
            Try Again
          </button>
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
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  Creative Contests
                </h1>
                <p className="text-gray-600 mt-1">Discover and participate in amazing creative challenges</p>
              </div>
              <Link
                href="/register/payment-first"
                className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-violet-700 hover:via-indigo-700 hover:to-violet-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Join Contest
              </Link>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-2">
            <div className="flex space-x-2">
              {['all', 'audition', 'active', 'voting', 'finished'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    filter === status
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white'
                      : 'text-gray-600 hover:bg-violet-50'
                  }`}
                >
                  {status === 'all' ? 'All Contests' : getStatusText(status)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contests Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {contests.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No contests found</h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? 'No contests are available at the moment.'
                  : `No ${getStatusText(filter)} contests found.`
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contests.map((contest) => (
                <div key={contest._id} className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  {/* Contest Header */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(contest.status)}`}>
                        {getStatusText(contest.status)}
                      </span>
                      <span className="text-sm text-gray-500">
                        Week {contest.currentWeek || 0}/{contest.totalWeeks}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {contest.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {contest.description}
                    </p>

                    {/* Categories */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {contest.categories.slice(0, 3).map((category) => (
                        <span
                          key={category}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-violet-100 text-violet-800"
                        >
                          {category}
                        </span>
                      ))}
                      {contest.categories.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                          +{contest.categories.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Prize Pool */}
                    <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-lg p-4 mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Prize Pool</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">1st Place:</span>
                          <span className="font-semibold text-violet-600">
                            #{(contest.prizes.first / 1000000).toFixed(1)}M
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">2nd Place:</span>
                          <span className="font-semibold text-violet-600">
                            #{(contest.prizes.second / 1000000).toFixed(1)}M
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">3rd Place:</span>
                          <span className="font-semibold text-violet-600">
                            #{(contest.prizes.third / 1000000).toFixed(1)}M
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="text-sm text-gray-600 mb-4">
                      <div className="flex justify-between mb-1">
                        <span>Start:</span>
                        <span>{formatDate(contest.startDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>End:</span>
                        <span>{formatDate(contest.endDate)}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link
                      href={`/contests/${contest._id}`}
                      className="block w-full bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 text-white py-3 rounded-xl font-semibold hover:from-violet-700 hover:via-indigo-700 hover:to-violet-700 transition-all duration-300 text-center"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
