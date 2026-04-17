'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '../../../utils/dateUtils';
import { submissionService, Submission } from '../../../services/submissionService';

function SubmissionsGalleryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [contests, setContests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedContest, setSelectedContest] = useState('');
  const [selectedWeek, setSelectedWeek] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    fetchContests();
  }, []);

  useEffect(() => {
    if (searchParams.get('contestId')) {
      setSelectedContest(searchParams.get('contestId')!);
    }
    if (searchParams.get('week')) {
      setSelectedWeek(searchParams.get('week')!);
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedContest) {
      fetchSubmissions();
    }
  }, [selectedContest, selectedWeek, page]);

  const fetchContests = async () => {
    try {
      const response = await fetch('/api/contests?status=active');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch contests');
      }

      setContests(data.contests || []);
    } catch (error: any) {
      console.error('Fetch contests error:', error);
      setError(error.message);
    }
  };

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const data = await submissionService.getContestSubmissions(
        selectedContest,
        selectedWeek ? Number(selectedWeek) : undefined,
        'approved',
        page
      );

      setSubmissions(data.submissions || []);
      setPagination(data.pagination);
    } catch (error: any) {
      console.error('Fetch submissions error:', error);
      setError(error.message);
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
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

  const renderFilePreview = (submission: Submission) => {
    if (submission.fileType === 'image') {
      return (
        <img
          src={submission.fileUrl}
          alt={submission.title}
          className="w-full h-48 object-cover rounded-lg"
        />
      );
    } else if (submission.fileType === 'video') {
      return (
        <video
          src={submission.fileUrl}
          className="w-full h-48 object-cover rounded-lg"
          controls={false}
          muted
        />
      );
    } else {
      return (
        <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            {getFileIcon(submission.fileType)}
            <p className="text-sm text-gray-500 mt-2">{submission.fileType}</p>
          </div>
        </div>
      );
    }
  };

  if (loading && page === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading submissions...</p>
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
                Submissions Gallery
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
                  className="w-full px-4 py-2 border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Week</label>
                <select
                  value={selectedWeek}
                  onChange={(e) => {
                    setSelectedWeek(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-2 border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                >
                  <option value="">All weeks</option>
                  {selectedContest && contests.find(c => c._id === selectedContest) && (
                    Array.from({ length: contests.find(c => c._id === selectedContest)?.totalWeeks || 0 }, (_, i) => i + 1).map((week) => (
                      <option key={week} value={week}>
                        Week {week}
                      </option>
                    ))
                  )}
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

        {/* Submissions Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!selectedContest ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Contest</h3>
              <p className="text-gray-600">Choose a contest to view submissions</p>
            </div>
          ) : loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading submissions...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Submissions Yet</h3>
              <p className="text-gray-600 mb-6">
                Be the first to submit your work for this contest!
              </p>
              <Link
                href="/submissions/submit"
                className="bg-violet-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-violet-700 transition"
              >
                Submit Your Work
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {submissions.map((submission) => (
                  <div
                    key={submission._id}
                    className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    {/* File Preview */}
                    <div className="relative">
                      {renderFilePreview(submission)}
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium">
                        Week {submission.week}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-xs font-bold text-violet-600">
                              {submission.user?.creativeId?.slice(-4) || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {submission.user?.name || 'Anonymous'}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {submission.user?.category || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-violet-600">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"></path>
                            </svg>
                            <span className="font-semibold">{submission.votes}</span>
                          </div>
                          {submission.averageRating && (
                            <div className="flex items-center text-yellow-500 text-sm">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                              </svg>
                              <span>{submission.averageRating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                        {submission.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {submission.description}
                      </p>

                      {/* Tags */}
                      {submission.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {submission.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-violet-100 text-violet-800"
                            >
                              {tag}
                            </span>
                          ))}
                          {submission.tags.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                              +{submission.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span>Submitted {formatDate(submission.submittedAt)}</span>
                        <span>{submission.fileSize > 1024 * 1024 
                          ? `${(submission.fileSize / (1024 * 1024)).toFixed(1)}MB`
                          : `${(submission.fileSize / 1024).toFixed(1)}KB`
                        }</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Link
                          href={`/submissions/${submission._id}`}
                          className="flex-1 bg-white text-violet-600 px-4 py-2 rounded-xl font-semibold hover:bg-violet-50 transition text-center"
                        >
                          View Details
                        </Link>
                        {contests.find(c => c._id === selectedContest)?.status === 'voting' && (
                          <Link
                            href={`/voting/vote?submissionId=${submission._id}`}
                            className="flex-1 bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-violet-700 hover:via-indigo-700 hover:to-violet-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-center"
                          >
                            Vote
                          </Link>
                        )}
                      </div>
                    </div>
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

export default function SubmissionsGalleryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SubmissionsGalleryContent />
    </Suspense>
  );
}
