'use client';

import { useRouter } from 'next/navigation';
import { FaPalette, FaBriefcase, FaXmark } from 'react-icons/fa6';

interface RegisterTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RegisterTypeModal({ isOpen, onClose }: RegisterTypeModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleCreativeClick = () => {
    onClose();
    router.push('/register');
  };

  const handleBusinessClick = () => {
    onClose();
    router.push('/register/payment-first');
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative animate-in fade-in zoom-in duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <FaXmark className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Path</h2>
          <p className="text-gray-600">Select the type of registration that suits you</p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Creative Option */}
          <button
            onClick={handleCreativeClick}
            className="group bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl p-6 text-left hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-start gap-4">
              <div className="bg-white/20 rounded-lg p-3 group-hover:bg-white/30 transition">
                <FaPalette className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">Creative Contest</h3>
                <p className="text-violet-100 text-sm mb-3">
                  Join the creative competition, showcase your talent, and win big prizes
                </p>
                <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                  <span className="text-white font-semibold text-sm">FREE</span>
                </div>
              </div>
            </div>
          </button>

          {/* Business Support Option */}
          <button
            onClick={handleBusinessClick}
            className="group bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-6 text-left hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-start gap-4">
              <div className="bg-white/20 rounded-lg p-3 group-hover:bg-white/30 transition">
                <FaBriefcase className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">Business Support</h3>
                <p className="text-amber-100 text-sm mb-3">
                  Get business support, networking opportunities, and promotional benefits
                </p>
                <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                  <span className="text-white font-semibold text-sm">₦2,000</span>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Footer note */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Already have an account? <a href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">Login</a></p>
        </div>
      </div>
    </div>
  );
}
