'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDate, getDaysUntil, getRelativeTime } from '../../../utils/dateUtils';

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
  weeklyTasks: {
    week: number;
    title: string;
    description: string;
    dueDate: string;
    isActive: boolean;
  }[];
  settings: {
    allowVoting: boolean;
    votingCost: number;
    maxVotesPerUser: number;
    requireApprovalForSubmissions: boolean;
  };
  createdAt: string;
}

interface ContestStats {
  contest: {
    title: string;
    status: string;
    currentWeek: number;
    totalWeeks: number;
    startDate: string;
    endDate: string;
  };
  participants: number;
  prizes: {
    first: number;
    second: number;
    third: number;
  };
  categories: string[];
  settings: {
    allowVoting: boolean;
    votingCost: number;
    maxVotesPerUser: number;
    requireApprovalForSubmissions: boolean;
  };
}

export default function ContestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [contest, setContest] = useState<Contest | null>(null);
  const [stats, setStats] = useState<ContestStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchContest();
      fetchContestStats();
    }
  }, [params.id]);

  const fetchContest = async () => {
    try {
      const response = await fetch(`/api/contests/${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch contest');
      }

      setContest(data.contest);
    } catch (error: any) {
      console.error('Fetch contest error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchContestStats = async () => {
    try {
      const response = await fetch(`/api/contests/${params.id}/statistics`);
      const data = await response.json();

      if (response.ok) {
        setStats(data.statistics);
      }
    } catch (error: any) {
      console.error('Fetch contest stats error:', error);
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

  const getActiveTask = () => {
    if (!contest) return null;
    return contest.weeklyTasks.find(task => task.isActive);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contest details...</p>
        </div>
      </div>
    );
  }

  if (error || !contest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Contest Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The contest you are looking for does not exist.'}</p>
          <Link
            href="/contests"
            className="bg-violet-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-violet-700 transition"
          >
            Back to Contests
          </Link>
        </div>
      </div>
    );
  }

  const activeTask = getActiveTask();
  const daysUntilEnd = getDaysUntil(contest.endDate);

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
              {contest.status === 'active' && (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href={`/submissions/submit?contestId=${contest._id}`}
                    className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-violet-700 hover:via-indigo-700 hover:to-violet-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Submit Work
                  </Link>
                  <Link
                    href={`/submissions/gallery?contestId=${contest._id}`}
                    className="bg-white text-violet-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-violet-600"
                  >
                    View Submissions
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contest Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden">
            <div className="p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(contest.status)}`}>
                      {getStatusText(contest.status)}
                    </span>
                    <span className="text-sm text-gray-500">
                      Week {contest.currentWeek || 0}/{contest.totalWeeks}
                    </span>
                    {daysUntilEnd >= 0 && (
                      <span className="text-sm text-gray-500">
                        {daysUntilEnd} days remaining
                      </span>
                    )}
                  </div>
                  
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                    {contest.title}
                  </h1>
                  
                  <p className="text-gray-600 text-lg mb-6">
                    {contest.description}
                  </p>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {contest.categories.map((category) => (
                      <span
                        key={category}
                        className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-violet-100 text-violet-800"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Prize Pool Card */}
                <div className="lg:ml-8">
                  <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white">
                    <h3 className="text-xl font-bold mb-4">Prize Pool</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>1st Place:</span>
                        <span className="font-bold">
                          #{(contest.prizes.first / 1000000).toFixed(1)}M
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>2nd Place:</span>
                        <span className="font-bold">
                          #{(contest.prizes.second / 1000000).toFixed(1)}M
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>3rd Place:</span>
                        <span className="font-bold">
                          #{(contest.prizes.third / 1000000).toFixed(1)}M
                        </span>
                      </div>
                    </div>
                    {stats && (
                      <div className="mt-4 pt-4 border-t border-white/20">
                        <div className="flex justify-between">
                          <span>Participants:</span>
                          <span className="font-bold">{stats.participants}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contest Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-violet-50 rounded-xl p-6">
                  <div className="flex items-center mb-3">
                    <svg className="w-6 h-6 text-violet-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <h3 className="font-semibold text-gray-900">Start Date</h3>
                  </div>
                  <p className="text-gray-600">{formatDate(contest.startDate)}</p>
                </div>

                <div className="bg-indigo-50 rounded-xl p-6">
                  <div className="flex items-center mb-3">
                    <svg className="w-6 h-6 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h3 className="font-semibold text-gray-900">End Date</h3>
                  </div>
                  <p className="text-gray-600">{formatDate(contest.endDate)}</p>
                </div>

                <div className="bg-purple-50 rounded-xl p-6">
                  <div className="flex items-center mb-3">
                    <svg className="w-6 h-6 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                    </svg>
                    <h3 className="font-semibold text-gray-900">Registration Fee</h3>
                  </div>
                  <p className="text-gray-600">#{contest.registrationFee.toLocaleString()}</p>
                </div>
              </div>

              {/* Current Task */}
              {activeTask && (
                <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-2xl p-6 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Current Task - Week {activeTask.week}</h3>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      Active
                    </span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{activeTask.title}</h4>
                  <p className="text-gray-600 mb-4">{activeTask.description}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Due: {getRelativeTime(activeTask.dueDate)}
                  </div>
                </div>
              )}

              {/* All Tasks */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Weekly Tasks</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contest.weeklyTasks.map((task) => (
                    <div
                      key={task.week}
                      className={`rounded-xl p-4 border-2 ${
                        task.isActive
                          ? 'border-violet-500 bg-violet-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">Week {task.week}</h4>
                        {task.isActive && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            Active
                          </span>
                        )}
                      </div>
                      <h5 className="text-gray-900 mb-1">{task.title}</h5>
                      <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                      <p className="text-xs text-gray-500">Due: {formatDate(task.dueDate)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contest Settings */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Contest Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Voting Enabled:</span>
                    <span className={`font-medium ${contest.settings.allowVoting ? 'text-green-600' : 'text-red-600'}`}>
                      {contest.settings.allowVoting ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vote Cost:</span>
                    <span className="font-medium">#{contest.settings.votingCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Votes Per User:</span>
                    <span className="font-medium">{contest.settings.maxVotesPerUser}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Submission Approval:</span>
                    <span className={`font-medium ${contest.settings.requireApprovalForSubmissions ? 'text-orange-600' : 'text-green-600'}`}>
                      {contest.settings.requireApprovalForSubmissions ? 'Required' : 'Not Required'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
