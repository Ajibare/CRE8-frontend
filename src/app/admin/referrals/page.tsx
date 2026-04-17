'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';

interface ReferralStats {
  totalRegisteredUsers: number;
  totalReferredUsers: number;
  organicUsers: number;
  referralBreakdown: {
    code: string;
    count: number;
    users: { name: string; email: string; registeredAt: string }[];
  }[];
  summary: {
    codesWithUsers: number;
    codesWithoutUsers: number;
    topPerformingCode: { code: string; count: number };
  };
}

export default function ReferralStatsPage() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/referrals/statistics');
      setStats(response.data.data);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Failed to load referral statistics');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL || 'https://cre-8-backend.vercel.app/api'}/referrals/export`, '_blank');
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!stats) return null;

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Referral Statistics</h1>
        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Export to CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 rounded-xl p-6">
          <p className="text-sm text-gray-600 mb-1">Total Registered Users</p>
          <p className="text-3xl font-bold text-blue-600">{stats.totalRegisteredUsers}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-6">
          <p className="text-sm text-gray-600 mb-1">Referred Users</p>
          <p className="text-3xl font-bold text-green-600">{stats.totalReferredUsers}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-6">
          <p className="text-sm text-gray-600 mb-1">Organic Users</p>
          <p className="text-3xl font-bold text-gray-600">{stats.organicUsers}</p>
        </div>
      </div>

      {/* Summary Info */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Codes with users:</span>
            <span className="font-semibold ml-2">{stats.summary.codesWithUsers}</span>
          </div>
          <div>
            <span className="text-gray-600">Codes without users:</span>
            <span className="font-semibold ml-2">{stats.summary.codesWithoutUsers}</span>
          </div>
          <div>
            <span className="text-gray-600">Top performing code:</span>
            <span className="font-semibold ml-2 text-green-600">
              {stats.summary.topPerformingCode.code} ({stats.summary.topPerformingCode.count} users)
            </span>
          </div>
        </div>
      </div>

      {/* Referral Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <h2 className="text-xl font-semibold p-6 border-b">Referral Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.referralBreakdown.map((item) => (
                <tr key={item.code} className={item.count > 0 ? 'bg-green-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{item.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`font-bold ${item.count > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                      {item.count}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.count > 0 ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                        No Users
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
