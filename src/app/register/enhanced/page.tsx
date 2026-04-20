'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
// import { useAuthStore } from '../../store/authStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { registrationService, type BiodataFormData } from '../../../services/registrationService';

const biodataSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  category: z.string().min(1, 'Please select a category'),
  country: z.string().min(1, 'Please select your country'),
  state: z.string().min(1, 'Please select your state'),
  city: z.string().min(1, 'Please enter your city'),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  experience: z.string().max(1000, 'Experience must be less than 1000 characters').optional(),
  education: z.string().max(500, 'Education must be less than 500 characters').optional(),
  skills: z.array(z.string()).optional(),
  portfolio: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  socialLinks: z.object({
    instagram: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
    twitter: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
    facebook: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
    youtube: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
    tiktok: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
    linkedin: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  }).optional(),
});

// type BiodataFormData = z.infer<typeof biodataSchema>;

const categories = [
  'Design', 'Video Editing', 'Music', 'Content Creation',
  'Photography', 'Writing', 'UI/UX Design', 'Web Design',
  'Illustration', 'Digital Art', 'Fashion Design', 'Creative Direction', 'Advertising',
  'Art & Craft', 'Business & Creative Strategist'
];

const countries = [
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'United States', 'United Kingdom', 'Canada', 'Other'
];

const socialPlatforms = [
  { name: 'Instagram', icon: 'ig', url: 'https://instagram.com/funtechcreative', color: 'bg-pink-500' },
  { name: 'Facebook', icon: 'fb', url: 'https://facebook.com/funtechcreative', color: 'bg-blue-600' },
  { name: 'Twitter', icon: 'tw', url: 'https://twitter.com/funtechcreative', color: 'bg-sky-500' },
  { name: 'YouTube', icon: 'yt', url: 'https://youtube.com/@funtechcreative', color: 'bg-red-600' },
  { name: 'TikTok', icon: 'tt', url: 'https://tiktok.com/@funtechcreative', color: 'bg-black' },
];

export default function EnhancedRegister() {
  const router = useRouter();
  // const { register: registerUser, isLoading } = useAuthStore();
  const [step, setStep] = useState(1);
  const [referralCode, setReferralCode] = useState('');
  const [referralValid, setReferralValid] = useState(false);
  const [referrerName, setReferrerName] = useState('');
  const [socialFollowStatus, setSocialFollowStatus] = useState(
    Object.fromEntries(socialPlatforms.map(p => [p.name.toLowerCase(), false]))
  );
  const [registrationData, setRegistrationData] = useState<BiodataFormData | null>(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [amount, setAmount] = useState(2000);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<BiodataFormData>({
    resolver: zodResolver(biodataSchema),
  });

  const validateReferral = async () => {
    if (!referralCode || referralCode.length < 3) {
      alert('Referral code must be at least 3 characters');
      return;
    }

    try {
      const data = await registrationService.validateReferralCode(referralCode);
      
      if (data.valid) {
        setReferralValid(true);
        setReferrerName(data.referrer || '');
        setAmount(2000); // Payment always #2000, no discount
        alert(`Referral code applied! Referred by: ${data.referrer || 'Unknown'}`);
      } else {
        setReferralValid(false);
        setReferrerName('');
        setAmount(2000);
        alert(data.message || 'Invalid referral code');
      }
    } catch (error) {
      console.error('Referral validation error:', error);
      setReferralValid(false);
      setReferrerName('');
      setAmount(2000);
      alert('Invalid referral code');
    }
  };

  const handleSocialFollow = (platform: string) => {
    const newStatus = { ...socialFollowStatus };
    newStatus[platform] = !newStatus[platform];
    setSocialFollowStatus(newStatus);
  };

  const allSocialsFollowed = Object.values(socialFollowStatus).every(Boolean);

  const onSubmitBiodata = async (data: BiodataFormData) => {
    setRegistrationData(data);
    setStep(3); // Move to social media step
  };

  const initiatePayment = async () => {
    if (!registrationData) return;

    try {
      const payload = {
        ...registrationData,
        referralCode: referralCode || undefined,
        socialFollowStatus,
      };

      const result = await registrationService.register(payload);

      setPaymentReference(result.paymentReference);
      setAmount(result.amount);
      setStep(4); // Move to payment step
    } catch (error: any) {
      console.error('Registration error:', error);
      alert(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const completePayment = async () => {
    // In a real app, this would integrate with Paystack
    // For now, we'll simulate successful payment
    setStep(5); // Move to success step
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <VoucherStep />;
      case 2:
        return <BiodataStep />;
      case 3:
        return <SocialMediaStep />;
      case 4:
        return <PaymentStep />;
      case 5:
        return <SuccessStep />;
      default:
        return <VoucherStep />;
    }
  };

  const VoucherStep = () => (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">FUNTECH Creative Challenge</h2>
          <p className="text-gray-600">Join Nigeria's Biggest Virtual Creative Contest</p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-orange-900 mb-2">Registration Fee: #{amount}</h3>
          <p className="text-orange-700 text-sm mb-4">Complete your registration to participate in the contest.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Code (Optional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="FUNTECH01"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <button
                  onClick={validateReferral}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                >
                  Apply
                </button>
              </div>
              {referralValid && referrerName && (
                <p className="text-green-600 text-sm">Access code applied! Access by: {referrerName}</p>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => setStep(2)}
          className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
        >
          Continue to Registration
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-orange-600 hover:text-orange-700 font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );

  const BiodataStep = () => (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h2>
            <p className="text-gray-600">Tell us about yourself and your creative journey</p>
          </div>

          <form onSubmit={handleSubmit(onSubmitBiodata)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  {...register('name')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="John Doe"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="john@example.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  {...register('phone')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="+2348000000000"
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Creative Category *</label>
                <select
                  {...register('category')}
                  className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                <select
                  {...register('country')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select country</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
                {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                <input
                  {...register('state')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Lagos"
                />
                {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                <input
                  {...register('city')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Ikeja"
                />
                {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <input
                  {...register('dateOfBirth')}
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                {errors.dateOfBirth && <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  {...register('gender')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio (max 500 characters)</label>
              <textarea
                {...register('bio')}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Tell us about yourself and your creative passion..."
              />
              {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Experience (max 1000 characters)</label>
              <textarea
                {...register('experience')}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Describe your creative experience and achievements..."
              />
              {errors.experience && <p className="mt-1 text-sm text-red-600">{errors.experience.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Education (max 500 characters)</label>
              <textarea
                {...register('education')}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Your educational background..."
              />
              {errors.education && <p className="mt-1 text-sm text-red-600">{errors.education.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio URL</label>
              <input
                {...register('portfolio')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="https://yourportfolio.com"
              />
              {errors.portfolio && <p className="mt-1 text-sm text-red-600">{errors.portfolio.message}</p>}
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
              >
                Continue
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  const SocialMediaStep = () => (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Follow Us on Social Media</h2>
          <p className="text-gray-600">Follow all our social media platforms to complete your registration</p>
        </div>

        <div className="space-y-4 mb-8">
          {socialPlatforms.map((platform) => (
            <div key={platform.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${platform.color} rounded-lg flex items-center justify-center text-white font-bold`}>
                  {platform.icon.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold">{platform.name}</h3>
                  <a 
                    href={platform.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-orange-600 hover:text-orange-700 text-sm"
                  >
                    @{platform.url.split('/').pop()}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.open(platform.url, '_blank')}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Open
                </button>
                <button
                  onClick={() => handleSocialFollow(platform.name.toLowerCase())}
                  className={`px-4 py-2 rounded-lg transition ${
                    socialFollowStatus[platform.name.toLowerCase()]
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {socialFollowStatus[platform.name.toLowerCase()] ? 'Followed' : 'Follow'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <p className="text-orange-700 text-sm">
            <strong>Quick Task:</strong> Make sure you've followed all platforms before continuing. This helps us keep you updated with contest announcements and important information.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setStep(2)}
            className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Back
          </button>
          <button
            onClick={initiatePayment}
            disabled={!allSocialsFollowed}
            className={`flex-1 py-3 rounded-lg font-semibold transition ${
              allSocialsFollowed
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue to Payment
          </button>
        </div>
      </div>
    </div>
  );

  const PaymentStep = () => (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Complete Payment</h2>
          <p className="text-gray-600">Pay your registration fee to activate your account</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Registration Fee:</span>
            <span className="font-semibold">#2000</span>
          </div>
          <div className="border-t pt-2 flex justify-between">
            <span className="font-semibold">Total Amount:</span>
            <span className="font-bold text-orange-600">#{amount}</span>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-700 text-sm">
            <strong>Payment Reference:</strong> {paymentReference}
          </p>
        </div>

        <button
          onClick={completePayment}
          className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
        >
          Pay with Paystack
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Secure payment powered by Paystack
          </p>
        </div>
      </div>
    </div>
  );

  const SuccessStep = () => (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
        <p className="text-gray-600 mb-6">
          Your registration for FUNTECH Creative Challenge has been completed successfully.
        </p>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-orange-900 mb-2">What's Next?</h3>
          <ul className="text-left text-orange-700 text-sm space-y-1">
            <li>Check your email for audition details</li>
            <li>Join our WhatsApp community</li>
            <li>Prepare your portfolio for the audition</li>
            <li>Follow our social media for updates</li>
          </ul>
        </div>

        <div className="space-y-4">
          <Link
            href="/login"
            className="block w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition text-center"
          >
            Go to Login
          </Link>
          <Link
            href="/"
            className="block w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition text-center"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );

  return renderStep();
}
