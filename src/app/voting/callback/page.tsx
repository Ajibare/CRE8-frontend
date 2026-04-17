'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cre-8-backend.vercel.app';

function VotingCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Verifying your vote...');

  useEffect(() => {
    const verifyPayment = async () => {
      const txRef = searchParams.get('tx_ref');
      const transactionId = searchParams.get('transaction_id');
      const paymentStatus = searchParams.get('status');

      if (!txRef) {
        setStatus('error');
        setMessage('Invalid payment reference');
        return;
      }

      if (paymentStatus === 'successful' || paymentStatus === 'completed') {
        try {
          // Call backend to verify payment and record votes
          const response = await axios.get(`${API_URL}/api/voting/callback`, {
            params: { transaction_id: transactionId, tx_ref: txRef }
          });

          if (response.data.success) {
            setStatus('success');
            setMessage(`Payment verified! ${response.data.votesCount || ''} votes recorded.`);
          } else {
            setStatus('error');
            setMessage(response.data.message || 'Payment verification failed');
          }
        } catch (error: any) {
          console.error('Verification error:', error);
          setStatus('error');
          setMessage(error.response?.data?.message || 'Failed to verify payment');
        }
      } else {
        setStatus('error');
        setMessage(`Payment ${paymentStatus || 'failed'}`);
      }

      // Redirect to contestants after showing status
      setTimeout(() => {
        router.push('/contestants');
      }, 3000);
    };

    verifyPayment();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 text-center">
        {status === 'processing' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-violet-600 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Processing Your Vote</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Vote Recorded!</h2>
            <p className="text-gray-600">Redirecting to leaderboard...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Issue</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => router.push('/contestants')}
              className="text-violet-600 hover:text-violet-700 font-medium"
            >
              ← Back to Contestants
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function VotingCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <VotingCallbackContent />
    </Suspense>
  );
}
