'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email');
  const ref = searchParams.get('ref');
  const referralCode = searchParams.get('referralCode');
  const [countdown, setCountdown] = useState(5);

  // Auto-redirect to registration with referral code after payment
  useEffect(() => {
    if (email && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (email && countdown === 0) {
      // Redirect to registration with payment data
      const params = new URLSearchParams();
      params.set('paymentSuccess', 'true');
      params.set('email', email);
      if (ref) params.set('ref', ref);
      if (referralCode) params.set('referralCode', referralCode);
      router.push(`/register?${params.toString()}`);
    }
  }, [email, ref, referralCode, countdown, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center px-4">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-20 w-56 h-56 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center relative z-10">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>

        <p className="text-gray-600 mb-6">
          Thank you for your payment. We&apos;ve sent a verification link to your email.
        </p>

        {email && (
          <div className="bg-orange-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Payment Email:</p>
            <p className="font-semibold text-gray-900">{email}</p>
          </div>
        )}

        {referralCode && (
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Access Code:</p>
            <p className="font-semibold text-green-800">{referralCode}</p>
          </div>
        )}

        <div className="text-center mb-4">
          <p className="text-gray-600">Redirecting to registration in {countdown} seconds...</p>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-blue-900 mb-2">What&apos;s Next?</h3>
            <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
              <li>Check your email inbox (and spam folder)</li>
              <li>Click the verification link we sent</li>
              <li>Complete your registration</li>
              <li>Login to your account</li>
            </ol>
          </div>

          <Link
            href={`/register?paymentSuccess=true&email=${encodeURIComponent(email || '')}&ref=${encodeURIComponent(ref || '')}&referralCode=${encodeURIComponent(referralCode || '')}`}
            className="block w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
          >
            Complete Registration
          </Link>

          <button
            onClick={() => window.open('https://gmail.com', '_blank')}
            className="block w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Open Gmail
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Didn&apos;t receive the email? Check your spam folder or contact support.
        </p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
