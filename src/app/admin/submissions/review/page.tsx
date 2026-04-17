'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminService } from '../../../../services/adminService';
import api from '../../../../services/api';

interface Submission {
  _id: string;
  title: string;
  description: string;
  category: string;
  fileUrl: string;
  thumbnailUrl?: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    creativeId?: string;
  };
  contestId?: {
    _id: string;
    title: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function SubmissionReviewPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [feedback, setFeedback] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, [filter]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/submissions?status=${filter}&limit=50`);
      setSubmissions(response.data.data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submissionId: string) => {
    try {
      setActionLoading(true);
      await api.patch(`/admin/submissions/${submissionId}/review`, { status: 'approved' });
      await fetchSubmissions();
      alert('Submission approved successfully!');
    } catch (error) {
      console.error('Error approving submission:', error);
      alert('Failed to approve submission');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (submissionId: string, userId: string) => {
    try {
      setActionLoading(true);
      // Reject submission
      await api.patch(`/admin/submissions/${submissionId}/review`, { status: 'rejected', feedback });
      // Also fail the user in contest phase
      await api.post('/admin/users/contest-status', { 
        userId, 
        status: 'rejected', 
        feedback: feedback || 'Submission rejected - did not meet contest requirements' 
      });
      await fetchSubmissions();
      setSelectedSubmission(null);
      setFeedback('');
      alert('Submission rejected and user failed contest phase!');
    } catch (error) {
      console.error('Error rejecting submission:', error);
      alert('Failed to reject submission');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Rejected</span>;
      default:
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Pending</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Submission Review</h1>
              <p className="text-gray-600 mt-1">Approve or reject contest submissions</p>
            </div>
            <Link
              href="/admin/dashboard"
              className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition ${
                filter === status
                  ? 'bg-violet-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status} ({status === 'all' ? submissions.length : 
                submissions.filter(s => s.status === status).length})
            </button>
          ))}
        </div>

        {/* Submissions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {submissions.map((submission) => (
            <div key={submission._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Thumbnail */}
              <div className="aspect-video bg-gray-200 relative">
                {submission.thumbnailUrl ? (
                  <img
                    src={submission.thumbnailUrl}
                    alt={submission.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  {getStatusBadge(submission.status)}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 truncate">{submission.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{submission.userId.name}</p>
                <p className="text-xs text-gray-500 mb-3">{submission.category}</p>

                {/* Actions */}
                {submission.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(submission._id)}
                      disabled={actionLoading}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setSelectedSubmission(submission)}
                      disabled={actionLoading}
                      className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                )}

                <a
                  href={submission.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 block text-center text-violet-600 text-sm hover:underline"
                >
                  View Submission →
                </a>
              </div>
            </div>
          ))}
        </div>

        {submissions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No submissions found</p>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Reject Submission</h3>
            <p className="text-gray-600 mb-4">
              Rejecting this submission will also mark the user as failed in the contest phase.
            </p>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Enter feedback for the user..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 min-h-[100px] mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedSubmission(null);
                  setFeedback('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedSubmission._id, selectedSubmission.userId._id)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Reject & Fail User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
