'use client';

import { useState, useEffect } from 'react';

interface AnalyticsData {
  votesOverTime: {
    labels: string[];
    data: number[];
  };
  submissionsByContest: {
    labels: string[];
    data: number[];
  };
  voteDistribution: {
    labels: string[];
    data: number[];
  };
  performanceMetrics: {
    totalSubmissions: number;
    totalVotes: number;
    averageVotesPerSubmission: number;
    bestPerformingSubmission: {
      title: string;
      votes: number;
    };
    votingTrend: 'up' | 'down' | 'stable';
    trendPercentage: number;
  };
}

interface UserAnalyticsProps {
  userId: string;
}

export default function UserAnalytics({ userId }: UserAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [userId, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // In production, this would be an API call
      // const response = await api.get(`/analytics/user/${userId}?range=${timeRange}`);
      
      // Mock data for demonstration
      const mockAnalytics: AnalyticsData = {
        votesOverTime: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
          data: [12, 19, 35, 42, 58, 67]
        },
        submissionsByContest: {
          labels: ['Creative Design 2024', 'Photography Challenge', 'Video Editing Contest'],
          data: [5, 3, 2]
        },
        voteDistribution: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
          data: [15, 20, 18, 25, 22, 30]
        },
        performanceMetrics: {
          totalSubmissions: 10,
          totalVotes: 233,
          averageVotesPerSubmission: 23.3,
          bestPerformingSubmission: {
            title: 'Creative Logo Design',
            votes: 67
          },
          votingTrend: 'up',
          trendPercentage: 45
        }
      };

      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Fetch analytics error:', error);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded-xl"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-6 text-center">
        <p className="text-gray-600">No analytics data available yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Performance Analytics</h3>
          <p className="text-sm text-gray-600">Track your creative journey</p>
        </div>
        
        {/* Time range selector */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {[
            { value: '7d', label: '7 Days' },
            { value: '30d', label: '30 Days' },
            { value: '90d', label: '90 Days' },
            { value: 'all', label: 'All Time' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeRange(option.value as '7d' | '30d' | '90d' | 'all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
                timeRange === option.value
                  ? 'bg-white text-violet-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4">
          <div className="text-3xl font-bold text-violet-600">
            {analytics.performanceMetrics.totalSubmissions}
          </div>
          <div className="text-sm text-gray-600">Submissions</div>
        </div>
        
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4">
          <div className="text-3xl font-bold text-violet-600">
            {analytics.performanceMetrics.totalVotes}
          </div>
          <div className="text-sm text-gray-600">Total Votes</div>
        </div>
        
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4">
          <div className="text-3xl font-bold text-violet-600">
            {analytics.performanceMetrics.averageVotesPerSubmission.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">Avg Votes/Sub</div>
        </div>
        
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4">
          <div className="flex items-center">
            <div className="text-3xl font-bold text-violet-600">
              {analytics.performanceMetrics.trendPercentage}%
            </div>
            <span className={`ml-2 text-sm ${
              analytics.performanceMetrics.votingTrend === 'up'
                ? 'text-green-600'
                : analytics.performanceMetrics.votingTrend === 'down'
                ? 'text-red-600'
                : 'text-gray-600'
            }`}>
              {analytics.performanceMetrics.votingTrend === 'up' ? '📈' : 
               analytics.performanceMetrics.votingTrend === 'down' ? '📉' : '➡️'}
            </span>
          </div>
          <div className="text-sm text-gray-600">Vote Trend</div>
        </div>
      </div>

      {/* Best performing submission */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 mb-6 border border-yellow-200">
        <div className="flex items-center">
          <span className="text-3xl mr-3">🏆</span>
          <div>
            <h4 className="font-semibold text-gray-900">Best Performing Submission</h4>
            <p className="text-sm text-gray-600">
              &quot;{analytics.performanceMetrics.bestPerformingSubmission.title}&quot; with{' '}
              {analytics.performanceMetrics.bestPerformingSubmission.votes} votes
            </p>
          </div>
        </div>
      </div>

      {/* Simple Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Votes Over Time */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h4 className="font-semibold text-gray-900 mb-4">Votes Over Time</h4>
          <div className="space-y-3">
            {analytics?.votesOverTime.labels.map((label, index) => {
              const value = analytics.votesOverTime.data[index];
              const maxValue = Math.max(...analytics.votesOverTime.data);
              return (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-16">{label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ width: `${(value / maxValue) * 100}%` }}
                    >
                      <span className="text-xs text-white font-medium">{value}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submissions by Contest */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h4 className="font-semibold text-gray-900 mb-4">Submissions by Contest</h4>
          <div className="space-y-4">
            {analytics?.submissionsByContest.labels.map((label, index) => {
              const value = analytics.submissionsByContest.data[index];
              const maxValue = Math.max(...analytics.submissionsByContest.data);
              const colors = ['bg-violet-500', 'bg-indigo-500', 'bg-purple-500'];
              return (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 truncate">{label}</span>
                    <span className="font-semibold text-violet-600">{value}</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div
                      className={`${colors[index % colors.length]} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${(value / maxValue) * 100}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Vote Distribution */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <h4 className="font-semibold text-gray-900 mb-4">Vote Distribution</h4>
        <div className="flex flex-wrap gap-4 justify-center">
          {analytics?.voteDistribution.labels.map((label, index) => {
            const value = analytics.voteDistribution.data[index];
            const total = analytics.voteDistribution.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            const colors = ['bg-violet-600', 'bg-indigo-600', 'bg-purple-600', 'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'];
            return (
              <div key={label} className="flex flex-col items-center">
                <div
                  className={`w-20 h-20 ${colors[index % colors.length]} rounded-full flex items-center justify-center text-white font-bold text-lg mb-2`}
                  style={{ opacity: 0.8 + (index * 0.03) }}
                >
                  {percentage}%
                </div>
                <span className="text-sm text-gray-600">{label}</span>
                <span className="text-xs text-gray-500">{value} votes</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights section */}
      <div className="mt-6 bg-violet-50 rounded-xl p-4">
        <h4 className="font-semibold text-violet-900 mb-3">💡 Insights</h4>
        <ul className="space-y-2 text-sm text-violet-800">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            Your submissions are performing {analytics.performanceMetrics.votingTrend === 'up' ? 'above' : 'below'} average
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            Most votes come from week {analytics.voteDistribution.data.indexOf(Math.max(...analytics.voteDistribution.data)) + 1}
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            Consider submitting earlier in the week for more exposure
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            Sharing on social media can increase your votes by up to 40%
          </li>
        </ul>
      </div>
    </div>
  );
}
