'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { votingService, VotePaymentData } from '../../../services/votingService';
import { api } from '../../../services/api';

interface Contestant {
  _id: string;
  name: string;
  creativeId: string;
  category: string;
  country: string;
  state: string;
  photoUrl?: string;
  totalVotes: number;
  submissions: Submission[];
  bio?: string;
}

interface Submission {
  _id: string;
  title: string;
  description: string;
  category: string;
  fileUrl: string;
  fileType: string;
  thumbnailUrl?: string;
  votes: number;
  submittedAt: string;
}

interface VoteBundle {
  _id: string;
  type: 'single' | 'bundle_5' | 'bundle_10' | 'bundle_25';
  name: string;
  votes: number;
  price: number;
  description: string;
}

export default function ContestantVotingPage() {
  const params = useParams();
  const contestantId = params.id as string;

  const [contestant, setContestant] = useState<Contestant | null>(null);
  const [bundles, setBundles] = useState<VoteBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBundle, setSelectedBundle] = useState<VoteBundle | null>(null);
  const [processing, setProcessing] = useState(false);
  const [customVotes, setCustomVotes] = useState('');
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'flutterwave'>('paystack');

  useEffect(() => {
    if (contestantId) {
      fetchContestantDetails();
      fetchVoteBundles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contestantId]);

  const fetchContestantDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/contestants/${contestantId}`);
      setContestant(response.data.contestant);
    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch contestant details';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchVoteBundles = async () => {
    try {
      const data = await votingService.getVotingBundles();
      setBundles(data.bundles || []);
    } catch {
      console.error('Failed to fetch vote bundles');
      // Keep bundles as empty array to trigger default bundles display
      setBundles([]);
    }
  };

  const handleVote = async () => {
    if (!selectedBundle && !isCustomAmount) {
      alert('Please select a vote package or enter a custom vote amount');
      return;
    }

    const votesCount = isCustomAmount ? parseInt(customVotes) || 1 : (selectedBundle?.votes || 1);
    if (isCustomAmount && (!customVotes || parseInt(customVotes) < 1)) {
      alert('Please enter a valid number of votes');
      return;
    }

    try {
      setProcessing(true);
      
      const voteData = {
        contestantId,
        submissionId: contestant?.submissions?.[0]?._id || '',
        voteBundleType: isCustomAmount ? 'custom' : selectedBundle?.type,
        votesCount: isCustomAmount ? parseInt(customVotes) : selectedBundle?.votes,
        paymentMethod: paymentMethod,
      };

      const response = await votingService.initiateVotingPayment(voteData as VotePaymentData);

      const paymentUrl = response.authorization_url || response.flutterwaveData?.link || response.data?.link;
      if (paymentUrl) {
        // Redirect to payment gateway
        window.location.href = paymentUrl;
      } else {
        console.error('Payment response:', response);
        alert('Payment initiation failed. Please try again.');
      }
    } catch (err: Error | unknown) {
      const message = err instanceof Error ? err.message : 'Failed to process vote. Please try again.';
      alert(message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (error || !contestant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error || 'Contestant not found'}</p>
          </div>
          <Link href="/contestants" className="mt-4 inline-block text-violet-600 hover:text-violet-700">
            ← Back to Contestants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              FUNTECH
            </Link>
            <Link
              href="/contestants"
              className="text-violet-600 hover:text-violet-700 font-medium"
            >
              ← Back to Contestants
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contestant Profile */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-8 text-white">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold">
                {contestant.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">{contestant.name}</h1>
                <p className="text-violet-100 mb-2">Creative ID: {contestant.creativeId}</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {contestant.category}
                  </span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {contestant.state}, {contestant.country}
                  </span>
                </div>
              </div>
              <div className="md:ml-auto text-center">
                <div className="text-4xl font-bold">{contestant.totalVotes.toLocaleString()}</div>
                <div className="text-violet-100">Total Votes</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Submissions */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Submissions</h2>
            <div className="space-y-4">
              {contestant.submissions?.map((submission) => (
                <div key={submission._id} className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg overflow-hidden">
                  <div className="aspect-video bg-gray-900">
                    {submission.fileType.startsWith('video/') ? (
                      <video
                        src={submission.fileUrl}
                        controls
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{submission.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{submission.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                        </svg>
                        {submission.votes} votes
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Voting Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Vote for {contestant.name}</h2>
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 sticky top-24">
              <p className="text-gray-600 mb-6">
                Support {contestant.name} by purchasing votes. Each vote costs ₦100. Select a bundle below:
              </p>

              {/* Vote Bundles */}
              <div className="space-y-3 mb-6">
                {!Array.isArray(bundles) || bundles.length === 0 ? (
                  // Default bundles matching backend bundle keys
                  <>
                    {[
                      { _id: '1', type: 'single', name: '1 Vote', votes: 1, price: 100, description: 'Basic support' },
                      { _id: '2', type: 'bundle_5', name: '5 Votes', votes: 5, price: 500, description: 'Show some love' },
                      { _id: '3', type: 'bundle_10', name: '10 Votes', votes: 10, price: 1000, description: 'Great support' },
                      { _id: '4', type: 'bundle_25', name: '25 Votes', votes: 25, price: 2500, description: 'Super fan package' },
                    ].map((bundle) => (
                      <button
                        key={bundle._id}
                        onClick={() => setSelectedBundle(bundle as VoteBundle)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          selectedBundle?._id === bundle._id
                            ? 'border-violet-500 bg-violet-50'
                            : 'border-gray-200 hover:border-violet-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-gray-900">{bundle.name}</div>
                            <div className="text-sm text-gray-500">{bundle.description}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-violet-600">₦{bundle.price.toLocaleString()}</div>
                            <div className="text-sm text-orange-600 font-medium">
                              {bundle.votes} {bundle.votes === 1 ? 'vote' : 'votes'}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </>
                ) : (
                  bundles.map((bundle) => (
                    <button
                      key={bundle._id}
                      onClick={() => setSelectedBundle(bundle)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        selectedBundle?._id === bundle._id
                          ? 'border-violet-500 bg-violet-50'
                          : 'border-gray-200 hover:border-violet-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">{bundle.name}</div>
                          <div className="text-sm text-gray-500">{bundle.description}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-violet-600">₦{bundle.price.toLocaleString()}</div>
                          <div className="text-sm text-orange-600 font-medium">
                            {bundle.votes} {bundle.votes === 1 ? 'vote' : 'votes'}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Custom Vote Amount */}
              <div className="space-y-3 mb-6">
                <label className="block text-sm font-medium text-gray-700">Custom Vote Amount</label>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    id="customAmount"
                    checked={isCustomAmount}
                    onChange={(e) => setIsCustomAmount(e.target.checked)}
                    className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500"
                  />
                  <label htmlFor="customAmount" className="text-sm text-gray-600">Enter custom vote amount</label>
                </div>
                {isCustomAmount && (
                  <div className="space-y-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="Number of votes (e.g., 10000)"
                      value={customVotes}
                      onChange={(e) => setCustomVotes(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                    <p className="text-sm text-gray-500">
                      Total: ₦{(parseInt(customVotes || '0') * 100).toLocaleString()} ({customVotes || 0} votes × ₦100)
                    </p>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="mb-6 border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Payment Method</h3>
                <div className="flex gap-4">
                  <button
                    onClick={() => setPaymentMethod('paystack')}
                    className={`flex-1 p-4 rounded-xl border-2 text-center transition-all ${
                      paymentMethod === 'paystack'
                        ? 'border-violet-500 bg-violet-50'
                        : 'border-gray-200 hover:border-violet-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">Paystack</div>
                    <div className="text-sm text-gray-500">Card, Bank, USSD</div>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('flutterwave')}
                    className={`flex-1 p-4 rounded-xl border-2 text-center transition-all ${
                      paymentMethod === 'flutterwave'
                        ? 'border-violet-500 bg-violet-50'
                        : 'border-gray-200 hover:border-violet-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">Flutterwave</div>
                    <div className="text-sm text-gray-500">Card, Bank, Mobile Money</div>
                  </button>
                </div>
              </div>

              {/* Vote Button */}
              <button
                onClick={handleVote}
                disabled={processing || (!selectedBundle && !isCustomAmount) || (isCustomAmount && (!customVotes || parseInt(customVotes) < 1))}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:from-violet-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Processing...' : `Vote with ${paymentMethod === 'paystack' ? 'Paystack' : 'Flutterwave'}`}
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                Secure payment powered by {paymentMethod === 'paystack' ? 'Paystack' : 'Flutterwave'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
