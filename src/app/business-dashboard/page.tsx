'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import Link from 'next/link';
import { FaUpload, FaUser, FaVideo, FaSignOutAlt } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import VideoUploadModal from './VideoUploadModal';

export default function BusinessDashboard() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [showVideoModal, setShowVideoModal] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.category !== 'Business Support Program') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!user || user.category !== 'Business Support Program') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900">Business Support Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">ID: {user.creativeId}</span>
              <button
                onClick={logout}
                className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Business Info Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                <FaUser className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user.businessName || 'Your Business'}</h2>
                <p className="text-gray-600">Business ID: {user.creativeId}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                <p className="text-gray-900 font-medium">{user.businessName || 'Not set'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                <p className="text-gray-900 font-medium">{user.businessType || 'Not set'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <p className="text-gray-900 font-medium">{user.businessLocation || 'Not set'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900 font-medium">{user.email}</p>
              </div>
            </div>

            <Link
              href="/dashboard/edit-profile"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              <FaUser /> Edit Business Profile
            </Link>
          </div>

          {/* Video Upload Section */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-xl p-6 text-white">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaVideo /> Business Video
            </h3>
            <p className="text-blue-100 mb-6">
              Upload a short video introducing your business, what you do, and how you can help customers.
            </p>
            
            {user.businessMedia ? (
              <div className="space-y-4">
                <div className="rounded-lg overflow-hidden bg-black">
                  <video 
                    src={user.businessMedia} 
                    controls 
                    className="w-full aspect-video object-cover"
                  />
                </div>
                <button
                  onClick={() => setShowVideoModal(true)}
                  className="w-full bg-white text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
                >
                  <FaUpload className="inline mr-2" /> Replace Video
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowVideoModal(true)}
                className="w-full bg-white text-blue-600 py-4 rounded-lg font-semibold hover:bg-blue-50 transition flex items-center justify-center gap-2"
              >
                <FaUpload className="text-xl" /> Upload Video
              </button>
            )}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Your Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
              <h4 className="font-semibold text-blue-900 mb-2">Business Development Resources</h4>
              <p className="text-sm text-blue-700">Access tools and resources to grow your business.</p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
              <h4 className="font-semibold text-blue-900 mb-2">Visibility Opportunities</h4>
              <p className="text-sm text-blue-700">Get featured across our platforms and network.</p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
              <h4 className="font-semibold text-blue-900 mb-2">Consideration for Support</h4>
              <p className="text-sm text-blue-700">Eligible for funding and mentorship programs.</p>
            </div>
          </div>
        </div>
      </main>

      {showVideoModal && (
        <VideoUploadModal 
          onClose={() => setShowVideoModal(false)} 
          userId={user.id}
        />
      )}
    </div>
  );
}
