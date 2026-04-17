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
import { FaWhatsapp, FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa6';
import { Clock, CheckCircle2, ExternalLink } from 'lucide-react';

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
  'Illustration', 'Digital Art', 'Fashion Design', 'Creative Direction', 'Advertising'
];

// Get all countries from country-state-city library
const allCountries = Country.getAllCountries();

const socialMediaLinks = [
  { name: 'WhatsApp', url: 'https://chat.whatsapp.com/DXWUXqSKrU4Kuu2TPX503a', Icon: FaWhatsapp, color: 'bg-green-500' },
  { name: 'Instagram', url: 'https://www.instagram.com/funtechglobal', Icon: FaInstagram, color: 'bg-pink-500' },
  { name: 'TikTok', url: 'https://www.tiktok.com/@funtechglobal', Icon: FaTiktok, color: 'bg-black' },
  { name: 'YouTube', url: 'https://www.youtube.com/@FunTechGlobal', Icon: FaYoutube, color: 'bg-red-600' },
];

const VERIFICATION_TIME = 30; // seconds user must spend on social media

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
  const [activeSocialLink, setActiveSocialLink] = useState<string | null>(null);
  const [socialTimers, setSocialTimers] = useState<Record<string, number>>({});
  const [completedSocial, setCompletedSocial] = useState<Record<string, boolean>>({});
  const [isVerifying, setIsVerifying] = useState(false);
  const allSocialVerified = socialMediaLinks.every(link => completedSocial[link.name]);

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

  // Timer effect for social media verification
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeSocialLink && !completedSocial[activeSocialLink]) {
      setIsVerifying(true);
      interval = setInterval(() => {
        setSocialTimers(prev => {
          const currentTime = (prev[activeSocialLink] || 0) + 1;
          if (currentTime >= VERIFICATION_TIME) {
            setCompletedSocial(completed => ({ ...completed, [activeSocialLink]: true }));
            setActiveSocialLink(null);
            setIsVerifying(false);
            toast.success(`${activeSocialLink} verified!`, { autoClose: 2000 });
          }
          return { ...prev, [activeSocialLink]: currentTime };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeSocialLink, completedSocial]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      // Include referral code from payment if available
      const registrationData = {
        ...data,
        referralCode: paymentState.referralCode || undefined,
        socialVerified: allSocialVerified,
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

          {/* Social Media Verification Section */}
          <div className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50">
            <h3 className="text-lg font-semibold text-black mb-2 text-center">
              Follow Us on Social Media
            </h3>
            <p className="text-sm text-gray-700 mb-2 text-center">
              Click each link, follow/like the account, and stay on the page for {VERIFICATION_TIME} seconds
            </p>
            <p className="text-xs text-orange-600 mb-4 text-center font-medium">
              We verify your engagement time to ensure genuine follows
            </p>

            <div className="grid grid-cols-2 gap-3">
              {socialMediaLinks.map((link) => {
                const Icon = link.Icon;
                const isCompleted = completedSocial[link.name];
                const isActive = activeSocialLink === link.name;
                const timer = socialTimers[link.name] || 0;
                const progress = Math.min((timer / VERIFICATION_TIME) * 100, 100);

                return (
                  <div
                    key={link.name}
                    className={`flex flex-col p-3 rounded-lg transition-all ${
                      isCompleted ? 'bg-green-100 border-2 border-green-400' :
                      isActive ? 'bg-orange-100 border-2 border-orange-400' :
                      'bg-white border-2 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${link.color} text-white`}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-black">{link.name}</p>
                      </div>
                      {isCompleted && <CheckCircle2 className="text-green-600" size={20} />}
                      {isActive && <Clock className="text-orange-600 animate-pulse" size={20} />}
                    </div>

                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => !isCompleted && setActiveSocialLink(link.name)}
                      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition ${
                        isCompleted
                          ? 'bg-green-600 text-white cursor-default'
                          : isActive
                          ? 'bg-orange-600 text-white'
                          : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                      }`}
                    >
                      {isCompleted ? (
                        <>Verified <CheckCircle2 size={16} /></>
                      ) : isActive ? (
                        <>Verifying... {timer}s <Clock size={16} className="animate-spin" /></>
                      ) : (
                        <>Open & Follow <ExternalLink size={16} /></>
                      )}
                    </a>

                    {(isActive || isCompleted) && (
                      <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-1000 ${isCompleted ? 'bg-green-500' : 'bg-orange-500'}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 text-center">
              <p className={`text-sm font-medium ${allSocialVerified ? 'text-green-600' : 'text-gray-500'}`}>
                {allSocialVerified
                  ? 'All social media accounts verified! You can now proceed'
                  : `${Object.values(completedSocial).filter(Boolean).length}/${socialMediaLinks.length} accounts verified - Complete all to continue`}
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !allSocialVerified}
            className={`w-full py-3 rounded-lg font-semibold transition ${
              allSocialVerified
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? 'Processing...' : allSocialVerified ? 'Proceed to Secure Your Slot' : 'Follow All Social Media to Continue'}
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
