'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { votingService, VotingBundle, VotePaymentData } from '../../../services/votingService';
import { formatDate } from '../../../utils/dateUtils';

interface Submission {
  _id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: 'image' | 'video' | 'audio' | 'document';
  fileSize: number;
  thumbnailUrl?: string;
  votes: number;
  averageRating?: number;
  tags: string[];
  submittedAt: string;
  week?: number;
  user?: {
    name: string;
    creativeId: string;
    category: string;
    profileImage: string;
  };
}

interface Contest {
  _id: string;
  title: string;
  status: string;
  settings: {
    allowVoting: boolean;
    votingCost: number;
    maxVotesPerUser: number;
    requireApprovalForSubmissions: boolean;
  };
}

function VotingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [contest, setContest] = useState<Contest | null>(null);
  const [votingBundles, setVotingBundles] = useState<VotingBundle[]>([]);
  const [selectedBundle, setSelectedBundle] = useState<VotingBundle | null>(null);
  const [userVotes, setUserVotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const submissionId = searchParams.get('submissionId');
  const contestantId = searchParams.get('contestantId');

  useEffect(() => {
    if (submissionId) {
      fetchSubmission();
    }
  }, [submissionId]);

  useEffect(() => {
    if (submission && submission.user) {
      fetchContest();
      fetchVotingBundles();
      fetchUserVotes();
    }
  }, [submission]);

  const fetchSubmission = async () => {
    try {
      const response = await fetch(`/api/submissions/${submissionId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch submission');
      }

      setSubmission(data.submission);
    } catch (error: any) {
      console.error('Fetch submission error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchContest = async () => {
    try {
      // Try to find contest by submission
      if (submission) {
        // This would need to be implemented in the backend
        // For now, we'll use a placeholder
        const response = await fetch('/api/contests/active');
        const data = await response.json();

        if (response.ok && data.contest) {
          setContest(data.contest);
        }
      }
    } catch (error: any) {
      console.error('Fetch contest error:', error);
    }
  };

  const fetchVotingBundles = async () => {
    try {
      const data = await votingService.getVotingBundles();
      setVotingBundles(data.bundles || []);
    } catch (error: any) {
      console.error('Fetch voting bundles error:', error);
    }
  };

  const fetchUserVotes = async () => {
    try {
      if (contest) {
        const data = await votingService.getUserVotingHistory(contest._id);
        setUserVotes(data.votes?.length || 0);
      }
    } catch (error: any) {
      console.error('Fetch user votes error:', error);
    }
  };

  const handleVote = async () => {
    if (!selectedBundle || !submission || !contest) {
      setError('Please select a voting package');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const voteData: VotePaymentData = {
        contestantId: submission.user?.creativeId || '',
        submissionId: submission._id,
        voteBundleType: selectedBundle.type,
        voterEmail: 'user@example.com', // This should come from user profile
        voterName: 'Voter', // This should come from user profile
      };

      const response = await votingService.initiateVotingPayment(voteData);

      if (response.success) {
        // Redirect to Flutterwave payment page
        window.location.href = response.flutterwaveData.link;
      } else {
        throw new Error('Failed to initiate payment');
      }
    } catch (error: any) {
      console.error('Vote initiation error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to initiate voting');
    } finally {
      setSubmitting(false);
    }
  };

  const getRemainingVotes = () => {
    if (!contest) return 0;
    return Math.max(0, contest.settings.maxVotesPerUser - userVotes);
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3m0 0l-3 3m0 0l-3 3m0 0l-3 3m3-3v12m0 0l3 3m-3-3h.01M6 20h12a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2zM9 10l12-3m0 0l-3 3m0 0l-3 3m0 0l-3 3"></path>
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

  const renderFilePreview = () => {
    if (!submission) return null;

    if (submission.fileType === 'image') {
      return (
        <img
          src={submission.fileUrl}
          alt={submission.title}
          className="w-full h-64 object-cover rounded-lg"
        />
      );
    } else if (submission.fileType === 'video') {
      return (
        <video
          src={submission.fileUrl}
          className="w-full h-64 object-cover rounded-lg"
          controls={false}
          muted
          loop
        />
      );
    } else {
      return (
        <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            {getFileIcon(submission.fileType)}
            <p className="text-sm text-gray-500 mt-2">{submission.fileType}</p>
          </div>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading voting page...</p>
        </div>
      </div>
    );
  }

  if (error && !submission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Submission Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/submissions/gallery"
            className="bg-violet-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-violet-700 transition"
          >
            Browse Submissions
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vote Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your vote has been recorded successfully. Thank you for supporting creative talent!
          </p>
          <div className="space-y-4">
            <Link
              href={`/submissions/gallery?contestId=${contest?._id}`}
              className="block w-full bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 text-white py-3 rounded-xl font-semibold hover:from-violet-700 hover:via-indigo-700 hover:to-violet-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-center"
            >
              View More Submissions
            </Link>
            <button
              onClick={() => {
                setSuccess(false);
                setSelectedBundle(null);
              }}
              className="block w-full border border-violet-300 text-violet-700 py-3 rounded-xl font-semibold hover:bg-violet-50 transition text-center"
            >
              Vote Again
            </button>
          </div>
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
                href="/submissions/gallery"
                className="inline-flex items-center text-violet-600 hover:text-violet-700 font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Back to Gallery
              </Link>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Vote for Creative Work
              </h1>
            </div>
          </div>
        </div>

        {/* Voting Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden">
            {/* Submission Preview */}
            <div className="relative">
              {renderFilePreview()}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium">
                Week {submission?.week || 'N/A'}
              </div>
            </div>

            {/* Submission Info */}
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-xs font-bold text-violet-600">
                      {submission?.user?.creativeId?.slice(-4) || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {submission?.user?.name || 'Anonymous'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {submission?.user?.category || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-violet-600">
                    <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 015.656 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span className="font-semibold">{submission?.votes}</span>
                  </div>
                  {submission?.averageRating && (
                    <div className="flex items-center text-yellow-500 text-sm">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81l-2.8 2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292z"></path>
                      </svg>
                      <span>{submission.averageRating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {submission?.title}
              </h2>
              
              <p className="text-gray-600 mb-4">
                {submission?.description}
              </p>

              {/* Tags */}
              {submission?.tags && submission.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {submission.tags.slice(0, 5).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-violet-100 text-violet-800"
                    >
                      {tag}
                    </span>
                  ))}
                  {submission.tags.length > 5 && (
                    <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                      +{submission.tags.length - 5}
                    </span>
                  )}
                </div>
              )}

              {/* Voting Stats */}
              <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-violet-600">{submission?.votes}</div>
                    <div className="text-sm text-gray-600">Total Votes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">{userVotes}</div>
                    <div className="text-sm text-gray-600">Your Votes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{getRemainingVotes()}</div>
                    <div className="text-sm text-gray-600">Remaining</div>
                  </div>
                </div>
              </div>

              {/* Voting Packages */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Voting Package</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {votingBundles.map((bundle) => (
                    <div
                      key={bundle.type}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                        selectedBundle?.type === bundle.type
                          ? 'border-violet-500 bg-violet-50'
                          : 'border-gray-200 hover:border-violet-300'
                      } ${!bundle.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => bundle.available && setSelectedBundle(bundle)}
                    >
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 mb-1">{bundle.votes}</div>
                        <div className="text-lg font-semibold text-violet-600 mb-1">Votes</div>
                        <div className="text-sm text-gray-600">#{bundle.price.toLocaleString()}</div>
                        <div className="text-xs text-violet-600 font-medium">
                          #{100} per vote
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 text-center mt-1">
                        {bundle.type === 'single' && 'Single Vote'}
                        {bundle.type === 'bundle_5' && '5 Votes Bundle'}
                        {bundle.type === 'bundle_10' && '10 Votes Bundle'}
                        {bundle.type === 'bundle_25' && '25 Votes Bundle'}
                      </div>
                      {!bundle.available && (
                        <div className="text-xs text-red-600 text-center mt-2">
                          Not enough votes remaining
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Vote Button */}
              <button
                onClick={handleVote}
                disabled={!selectedBundle || submitting || getRemainingVotes() === 0}
                className="w-full bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 text-white py-4 rounded-xl font-semibold hover:from-violet-700 hover:via-indigo-700 hover:to-violet-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8 8 8 0 014 8 8 0 01-4 4 4 0 022-4 4zm0 0l-4 4m0 0l4 4m-4-4a4 4 0 00-4 4 4 0 004-4 4z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 015.656 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    {selectedBundle ? (
                      `Pay #${selectedBundle.price.toLocaleString()} for ${selectedBundle.votes} votes`
                    ) : (
                      'Select a voting package'
                    )}
                  </span>
                )}
              </button>

              {/* Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Voting Information</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>Each vote helps support creative talent</li>
                  <li>You can vote up to {contest?.settings?.maxVotesPerUser || 10} times</li>
                  <li>Voting is only available during the voting phase</li>
                  <li>All votes are verified and secure</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VotingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <VotingPageContent />
    </Suspense>
  );
}
