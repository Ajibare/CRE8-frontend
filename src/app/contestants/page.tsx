'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
// import assets from '@';
import assets from '@/asset/remoteAsset';

interface Contestant {
  _id: string;
  name: string;
  creativeId: string;
  category: string;
  country: string;
  state: string;
  photoUrl?: string;
  totalVotes: number;
  submissionCount: number;
  rank: number;
}

export default function ContestantsPage() {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    'all',
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
  ];

  useEffect(() => {
    fetchContestants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const fetchContestants = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    if (!apiUrl) {
      setError('API URL is not configured');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${apiUrl}/api/contestants?category=${selectedCategory}`
      );
      if (!response.ok) throw new Error('Failed to fetch contestants');
      const data = await response.json();
      setContestants(data.contestants || []);
    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load contestants';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredContestants = contestants.filter((contestant) =>
    contestant?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contestant?.creativeId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 pt-8">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Contestants Leaderboard
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Vote for your favorite creative talents! Browse through contestants, view their profiles, and cast your vote to help them win.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name or Creative ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 text-black py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              />
            </div>
            {/* Category Filter */}
            <div className="md:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 text-black rounded-lg border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Contestants Table */}
        {!loading && !error && (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Rank</th>
                    <th className="px-6 py-4 text-left font-semibold">Contestant</th>
                    <th className="px-6 py-4 text-left font-semibold">Category</th>
                    <th className="px-6 py-4 text-left font-semibold">Location</th>
                    <th className="px-6 py-4 text-center font-semibold">Submissions</th>
                    <th className="px-6 py-4 text-center font-semibold">Votes</th>
                    <th className="px-6 py-4 text-center font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredContestants.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        No contestants found
                      </td>
                    </tr>
                  ) : (
                    filteredContestants.map((contestant) => (
                      <tr
                        key={contestant._id}
                        className="hover:bg-violet-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="text-2xl font-bold">
                            {getRankBadge(contestant.rank)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {contestant.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{contestant.name}</p>
                              <p className="text-sm text-violet-600">ID: {contestant.creativeId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-[12px] font-medium">
                            {contestant.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {contestant.state}, {contestant.country}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-semibold text-gray-900">
                            {contestant.submissionCount}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-bold">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                            </svg>
                            {contestant.totalVotes.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Link
                            href={`/contestants/${contestant._id}`}
                            className="inline-block bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:from-violet-700 hover:to-indigo-700 transition-all"
                          >
                            Vote
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Voting Info */}
        <div className="mt-8 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold mb-2">How to Vote</h3>
              <p className="text-violet-100">
                Click the Vote button next to any contestant. You&apos;ll be redirected to a secure payment page to complete your vote (₦100 per vote).
              </p>
            </div>
            {/* <div className="flex items-center gap-2 text-sm text-violet-100">
              <span>Powered by</span>
              <span className="font-semibold">Paystack</span>
              <span>&</span>
              <span className="font-semibold">Flutterwave</span>
            </div> */}
          </div>
        </div>
      </div>
    // </div>
  );
}
