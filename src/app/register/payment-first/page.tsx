'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { FlutterwaveService } from '../../../services/flutterwaveService';
import { paymentService } from '../../../services/paymentService';
import { registrationService } from '../../../services/registrationService';
import { assets } from '@/asset/remoteAsset';
import Image from 'next/image';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const paymentSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  referralCode: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

export default function PaymentFirstRegistration() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [referralValid, setReferralValid] = useState(false);
  const [referrerName, setReferrerName] = useState('');
  const [amount, setAmount] = useState(2000);
  const [_paymentReference, _setPaymentReference] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [_paymentSuccessful, _setPaymentSuccessful] = useState(false);
  const [registrationData, setRegistrationData] = useState<PaymentFormData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'flutterwave'>('paystack');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  });

  const email = watch('email');
  const referralCode = watch('referralCode');


  // Validate referral code
  const validateReferral = async () => {
    if (!referralCode || referralCode.length < 3) {
      toast.error('Access code must be at least 3 characters');
      return;
    }

    try {
      const data = await registrationService.validateReferralCode(referralCode);
      
      if (data.valid) {
        setReferralValid(true);
        setReferrerName(data.referrer || '');
        setAmount(2000); // Payment always #2000, no discount
        toast.success(`Access code applied! Referred by: ${data.referrer || 'Unknown'}`);
      } else {
        setReferralValid(false);
        setReferrerName('');
        setAmount(2000);
        toast.error(data.message || 'Invalid access code');
      }
    } catch (error) {
      console.error('Referral validation error:', error);
      setReferralValid(false);
      setReferrerName('');
      setAmount(2000);
      toast.error('Invalid access code');
    }
  };

  // Initialize payment
  const initializePayment = async (data: PaymentFormData) => {
    try {
      setIsProcessing(true);

      let paymentLink: string | undefined;
      let reference: string | undefined;

      if (paymentMethod === 'paystack') {
        // Initiate payment with Paystack
        const paymentData = await paymentService.initializeRegistrationPayment({
          email: data.email,
          referralCode: data.referralCode,
        });
        paymentLink = paymentData?.data?.paymentLink;
        reference = paymentData?.data?.reference;
      } else {
        // Initiate payment with Flutterwave
        const paymentData = await FlutterwaveService.initiatePayment(data.email, data.referralCode);
        paymentLink = (paymentData as { data?: { paymentLink?: string } })?.data?.paymentLink;
        reference = (paymentData as { data?: { reference?: string } })?.data?.reference;
      }

      if (!paymentLink) {
        throw new Error('No payment link received');
      }

      // Save registration data for after payment
      setRegistrationData(data);
      _setPaymentReference(reference || '');

      // Redirect to payment gateway hosted checkout
      window.location.href = paymentLink;

    } catch (error: Error | unknown) {
      console.error('Payment initialization error:', error);
      alert((error instanceof Error ? error.message : 'Failed to initialize payment'));
      setIsProcessing(false);
    }
  };

  // Complete registration after payment
  const completeRegistration = async (biodata: Record<string, unknown>) => {
    try {
      const payload = {
        ...biodata,
        email: registrationData?.email,
        referralCode: registrationData?.referralCode,
        paymentReference: _paymentReference,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await registrationService.register(payload as any);
      
      // Redirect to success page
      router.push('/success');
    } catch (error: Error | unknown) {
      console.error('Registration error:', error);
      alert((error instanceof Error && 'response' in error) ? (error as { response?: { data?: { message?: string } } }).response?.data?.message : 'Registration failed. Please try again.');
    }
  };

  const PaymentStep = () => (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background elements - pointer-events-none allows clicks through */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>
      
      <div className="max-w-md w-full bg-white/25 backdrop-blur-lg rounded-2xl shadow-2xl p-8 relative z-10 border border-violet-100 mt-4 mb-4">
        {/* Header with gradient text */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            {/* <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg"> */}
              {/* <span className="text-white font-bold text-xl"> */}
                <Image 
                src={assets.nav_logo} 
                alt="Funtech Creative"
                 width={200} 
                 height={200}
                  />
              {/* </span> */}
            {/* </div> */}
          </div>
          <h2 className="text-4xl font-bold text-indigo-600 mb-2">
            FUNTECH Creative Challenge
          </h2>
          <p className="text-gray-600 text-lg">Unlock your creative journey with secure payment</p>
        </div>

        {/* Payment Method Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
            Choose Payment Method
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('paystack')}
              className={`py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                paymentMethod === 'paystack'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-400'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Paystack
              </span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('flutterwave')}
              className={`py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                paymentMethod === 'flutterwave'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-400'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Flutterwave
              </span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(initializePayment)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <div className="relative">
              <input
                {...register('email')}
                type="email"
                className="w-full px-4 py-4 border-2 border-violet-200 rounded-xl focus:ring-4 focus:ring-violet-500 focus:border-violet-500 bg-white/90 backdrop-blur-sm transition-all duration-300 text-gray-800 placeholder-gray-400"
                placeholder="john@example.com"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Access Code (Optional)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  {...register('referralCode')}
                  type="text"
                  maxLength={10}
                  className="w-full px-4 py-4 border-2 border-violet-200 rounded-xl focus:ring-4 focus:ring-violet-500 focus:border-violet-500 bg-white/90 backdrop-blur-sm transition-all duration-300 text-gray-800 placeholder-gray-400"
                  placeholder="FUNTECH01"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
              </div>
              <button
                type="button"
                onClick={validateReferral}
                className="px-6 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:from-violet-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
              >
                Apply Code
              </button>
            </div>
            {referralValid && referrerName && (
              <p className="mt-1 text-sm text-green-600">Access code applied! Referred by: {referrerName}</p>
            )}
          </div>

          <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-2xl p-6 border border-violet-200 shadow-inner">
            <div className="flex justify-between mb-3">
              <span className="text-gray-700 font-medium">Registration Fee:</span>
              <span className="font-bold text-gray-900">#2000</span>
            </div>
            <div className="border-t border-violet-200 pt-4 flex justify-between">
              <span className="font-bold text-gray-900 text-lg">Total Amount:</span>
              <span className="font-bold text-2xl text-indigo-600 bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text ">#{amount}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing || !email}
            className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
              paymentMethod === 'paystack'
                ? 'bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 text-white hover:from-blue-700 hover:via-cyan-700 hover:to-blue-700'
                : 'bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 text-white hover:from-violet-700 hover:via-indigo-700 hover:to-violet-700'
            }`}
          >
            <span className="flex items-center justify-center">
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-6 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Pay with {paymentMethod === 'paystack' ? 'Paystack' : 'Flutterwave'}
                </>
              )}
            </span>
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Secure payment powered by {paymentMethod === 'paystack' ? 'Paystack' : 'Flutterwave'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Already paid?{' '}
            <Link href="/login" className="text-orange-600 hover:text-orange-700 font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );

  const RegistrationStep = () => {
    const [formData, setFormData] = useState({
      name: '',
      phone: '',
      category: '',
      country: '',
      state: '',
      city: '',
      dateOfBirth: '',
      gender: '',
      bio: '',
      experience: '',
      education: '',
      skills: '',
      portfolio: '',
      socialLinks: {
        instagram: '',
        twitter: '',
        facebook: '',
        youtube: '',
        tiktok: '',
        linkedin: '',
      },
    });

    const categories = [
      'Design', 'Video Editing', 'Music', 'Content Creation',
      'Photography', 'Writing', 'UI/UX Design', 'Web Design',
      'Illustration', 'Digital Art', 'Fashion Design', 'Creative Direction', 'Advertising'
    ];

    const countries = [
      'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'United States', 'United Kingdom', 'Canada', 'Other'
    ];

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      completeRegistration(formData);
    };

    return (
      <>
        <ToastContainer position="top-right" autoClose={5000} />
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Registration</h2>
              <p className="text-gray-600">Payment confirmed! Please fill in your details</p>
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mt-4">
                Payment Reference: {_paymentReference}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="+2348000000000"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Creative Category *</label>
                  <select
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                  <select
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                  >
                    <option value="">Select country</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Lagos"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Ikeja"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
              >
                Complete Registration
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
    );
  };

  return step === 1 ? <PaymentStep /> : <RegistrationStep />;
}
