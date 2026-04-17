'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../store/authStore';

export default function Success() {
  const router = useRouter();
  const { user, completeRegistration } = useAuthStore();
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const complete = async () => {
      try {
        setIsCompleting(true);
        await completeRegistration();
      } catch (error) {
        console.error('Failed to complete registration:', error);
      } finally {
        setIsCompleting(false);
      }
    };

    complete();
  }, [user, router, completeRegistration]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">You're In!</h2>
          <p className="text-gray-600">Your Creative ID has been generated</p>
        </div>

        <div className="bg-orange-50 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-2">Your Creative ID</h3>
          <div className="text-2xl font-bold text-orange-600 mb-2">
            {user.creativeId || 'Generating...'}
          </div>
          <p className="text-sm text-gray-600">Keep this ID safe. You'll need it for all contest activities.</p>
        </div>

        <div className="space-y-4">
          <Link href="/dashboard" className="block w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition">
            Go to Dashboard
          </Link>
          
          <button
            onClick={() => window.print()}
            className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Print Your ID
          </button>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">What's Next?</h4>
          <ul className="text-sm text-blue-800 space-y-1 text-left">
            <li>1. Wait for your audition schedule via email</li>
            <li>2. Prepare your best creative work</li>
            <li>3. Join the competition when it starts</li>
          </ul>
        </div>

        {isCompleting && (
          <div className="mt-4 text-sm text-gray-600">
            Finalizing your registration...
          </div>
        )}
      </div>
    </div>
  );
}
