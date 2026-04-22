'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../store/authStore';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Country, State } from 'country-state-city';
import Select from 'react-select';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  country: z.string().min(1, 'Please select a country'),
  state: z.string().min(1, 'Please select a state'),
  category: z.string().min(1, 'Please select a category'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const categories = [
  'Design', 'Video Editing', 'Music', 'Content Creation',
  'Photography', 'Writing', 'UI/UX Design', 'Web Design',
  'Illustration', 'Digital Art', 'Fashion Design', 'Creative Direction', 'Advertising',
  'Art & Craft', 'Business & Creative Strategist'
];

// Get all countries from country-state-city library
const allCountries = Country.getAllCountries();

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register: registerUser, isLoading } = useAuthStore();
  const [paymentState, setPaymentState] = useState({
    success: false,
    email: '',
    ref: '',
    referralCode: '',
  });

  const [selectedCountry, setSelectedCountry] = useState('');

  // Check for payment success from Flutterwave callback or verified status
  useEffect(() => {
    const payment = searchParams.get('payment');
    const verified = searchParams.get('verified');
    const email = searchParams.get('email');
    const ref = searchParams.get('ref');
    const referralCode = searchParams.get('referralCode');

    if ((payment === 'success' || verified === 'true') && email) {
      setPaymentState({ success: true, email, ref: ref || '', referralCode: referralCode || '' });
    }
  }, [searchParams]);

  // Don't auto-redirect - let user complete registration with paid email
  // The paymentState.email will be pre-filled in the form

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: paymentState.email,
    },
  });

  // Update form email when payment email changes
  useEffect(() => {
    if (paymentState.email) {
      setValue('email', paymentState.email);
    }
  }, [paymentState.email, setValue]);


  const onSubmit = async (data: RegisterFormData) => {
    try {
      // Include referral code from payment if available
      const registrationData = {
        ...data,
        referralCode: paymentState.referralCode || undefined,
      };
      await registerUser(registrationData);
      toast.success('Registration successful! Please login to continue.', {
        position: 'top-right',
        autoClose: 3000,
      });
      // Delay redirect to let user see the success message
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error: unknown) {
      console.error('Registration error:', error);
      const errMsg = error instanceof Error ? (error as { response?: { data?: { message?: string } } }).response?.data?.message : undefined;
      toast.error(errMsg || 'Registration failed. Please try again.', {
        position: 'top-right',
        autoClose: 5000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Enter the FUNTECH Creative Challenge</h2>
          <p className="text-gray-600">Register to compete and win amazing prizes</p>
          
          {paymentState.success && (
            <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              <p className="font-bold">Payment Successful!</p>
              <p className="text-sm">Payment Reference: {paymentState.ref}</p>
              <p className="text-sm">Please complete your registration below.</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-black mb-2">
              Full Name
            </label>
            <input
              {...register('name')}
              type="text"
              className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
              Email Address {paymentState.success && <span className="text-orange-600 text-xs">(locked - from payment)</span>}
            </label>
            <input
              {...register('email')}
              type="email"
              disabled={paymentState.success}
              className={`w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${paymentState.success ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="john@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-black mb-2">
              Phone Number
            </label>
            <input
              {...register('phone')}
              type="tel"
              className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="+234 800 000 0000"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Country
            </label>
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={allCountries.map(c => ({ value: c.isoCode, label: c.name }))}
                  placeholder="Search for a country..."
                  onChange={(option) => {
                    field.onChange(option?.value);
                    setSelectedCountry(option?.value || '');
                    setValue('state', '');
                  }}
                  value={allCountries.find(c => c.isoCode === field.value) ? { value: field.value, label: allCountries.find(c => c.isoCode === field.value)?.name } : null}
                  className="text-black"
                  classNamePrefix="select"
                />
              )}
            />
            {errors.country && (
              <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
            )}
          </div>

          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Access Code (Optional)
            </label>
            <Controller
              name="accessCode"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter access code"
                />
              )}
            />
            {errors.accessCode && (
              <p className="mt-1 text-sm text-green-600">Access code applied! Referred by: {referrerName}</p>
            )}
          </div> */}

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              State/Region
            </label>
            <Controller
              name="state"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={selectedCountry ? State.getStatesOfCountry(selectedCountry).map(s => ({ value: s.name, label: s.name })) : []}
                  placeholder={selectedCountry ? "Search for a state..." : "Select a country first"}
                  onChange={(option) => field.onChange(option?.value)}
                  value={field.value ? { value: field.value, label: field.value } : null}
                  isDisabled={!selectedCountry}
                  className="text-black"
                  classNamePrefix="select"
                />
              )}
            />
            {errors.state && (
              <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-black mb-2">
              Category
            </label>
            <select
              {...register('category')}
              className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
              Password
            </label>
            <input
              {...register('password')}
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg font-semibold transition bg-orange-600 text-white hover:bg-orange-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : 'Proceed to Secure Your Slot'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-orange-600 hover:text-orange-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default function Register() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
