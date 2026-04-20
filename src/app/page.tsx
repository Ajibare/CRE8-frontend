'use client';

import Link from 'next/link';
import Image from 'next/image';
import { assets } from '../asset/remoteAsset';
import { FaWhatsapp, FaInstagram, FaTiktok, FaYoutube, FaTwitter, FaLinkedin } from 'react-icons/fa6';

export default function Home() {

  const categories = [
    'Design', 'Video Editing', 'Music', 'Content Creation',
    'Photography', 'Writing', 'UI/UX Design', 'Web Design',
    'Illustration', 'Digital Art', 'Fashion Design', 'Creative Direction', 'Advertising', 'Art & Craft',
    'Business & Creative Strategist',
  ];

  const prizes = [
    { amount: '5,000,000', position: 'Grand Prize' },
    { amount: '2,000,000', position: '2nd Place' },
    { amount: '1,000,000', position: '3rd Place' },
  ];

  const howItWorks = [
    { step: 1, title: 'Register', description: 'Pay 2,000 and secure your Creative ID.' },
    { step: 2, title: 'Get Auditioned', description: 'Submit your audition video .' },
    { step: 3, title: 'Compete Weekly', description: 'Take on creative challenges.' },
    { step: 4, title: 'Get Votes & Rank', description: 'Build support and climb.' },
    { step: 5, title: 'Win Big', description: 'Reach finals and win.' },
  ];

  const socialLinks = [
    { name: 'WhatsApp', url: 'https://chat.whatsapp.com/DXWUXqSKrU4Kuu2TPX503a', Icon: FaWhatsapp, color: 'hover:text-green-500' },
    { name: 'Instagram', url: 'https://www.instagram.com/funtechglobal', Icon: FaInstagram, color: 'hover:text-pink-500' },
    { name: 'TikTok', url: 'https://www.tiktok.com/@funtechglobal', Icon: FaTiktok, color: 'hover:text-white' },
    { name: 'YouTube', url: 'https://www.youtube.com/@FunTechGlobal', Icon: FaYoutube, color: 'hover:text-red-500' },
    { name: 'X/Twitter', url: 'https://x.com/FunTech2398', Icon: FaTwitter, color: 'hover:text-white' },
    { name: 'LinkedIn', url: 'https://www.linkedin.com/in/fun-tech-innovations-6a6b313b9', Icon: FaLinkedin, color: 'hover:text-blue-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      {/* Hero Section */}
      <section 
        className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden min-h-[90vh] flex items-center"
        style={{
          backgroundImage: `url(${assets.hero.background})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-violet-900/70 to-purple-900/80"></div>
        
        {/* Flare effect */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-30 pointer-events-none">
          <Image
            src={assets.hero.flare}
            alt=""
            fill
            className="object-cover object-right"
            priority
          />
        </div>

        {/* Man image - left side */}
        <div className="absolute bottom-0 left-0 w-1/3 h-3/4 hidden lg:block pointer-events-none">
          <Image
            src={assets.hero.man}
            alt="Creative Man"
            fill
            className="object-contain object-bottom"
            priority
          />
        </div>

        {/* Woman image - right side */}
        <div className="absolute bottom-0 right-0 w-1/3 h-3/4 hidden lg:block pointer-events-none">
          <Image
            src={assets.hero.woman}
            alt="Creative Woman"
            fill
            className="object-contain object-bottom"
            priority
          />
        </div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10 px-4">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center mb-6">
              <Image
                src={assets.logo}
                alt="FUNTECH Logo"
                width={150}
                height={150}
                className="w-24 h-24 object-contain drop-shadow-2xl"
                priority
              />
            </div>
            <h1 className="text-5xl sm:text-7xl font-bold text-white mb-6 drop-shadow-lg">
              Nigeria&apos;s Biggest <span className="text-violet-400">Virtual Creative Contest</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-100 mb-8 text-lg drop-shadow-md">
              Compete from anywhere. Get discovered. Win up to <span className="font-bold text-violet-400">₦5,000,000</span>
            </p>
            <p className="text-lg text-gray-200 mb-12 max-w-3xl mx-auto drop-shadow">
              Thousands of talented creatives remain unseen. This is your chance to step forward, compete, and be recognized.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* <Link
                href="/contests"
                className="bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-violet-700 hover:via-indigo-700 hover:to-violet-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                View Contests
              </Link> */}
              <Link
                href="/register/payment-first"
                className="bg-white text-violet-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-violet-600"
              >
                Register Now
              </Link>
            </div>
            {/* <Link href="#how-it-works" className="border-2 border-purple-300 text-purple-600 px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-purple-50 transition-all duration-300">
              Learn More
            </Link> */}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-16">HOW IT WORKS</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {howItWorks.map((step) => (
              <div key={step.step} className="text-center">
                <div className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  {step.step}
                </div>
                <h3 className="font-semibold text-lg text-indigo-600 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prizes */}
      <section id="prizes" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-16">PRIZES</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {prizes.map((prize, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-8 text-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-400' : 'bg-indigo-400'
                }`}>
                  <span className="text-white text-2xl font-bold">{index + 1}</span>
                </div>
                <h3 className="font-semibold text-black text-lg mb-2">{prize.position}</h3>
                <p className="text-3xl font-bold text-indigo-600">{prize.amount}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-16">CATEGORIES</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <div key={category} className="bg-white rounded-lg shadow p-4 text-center">
                <p className="font-medium text-gray-800">{category}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8">
            Ready to Showcase Your Talent?
          </h2>
          <p className="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto">
            This is not just a contest. This is a platform for discovery.
          </p>
          <Link href="/register/payment-first" className="bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition">
            Register for 2,000
          </Link>
        </div>
      </section>

      {/* Footer */}
      {/* <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Image
                src={assets.logo}
                alt="FUNTECH Logo"
                width={150}
                height={50}
                className="h-12 w-auto object-contain"
              />
            </div>
            <p className="text-gray-400 mb-6">Empowering Nigerian Creatives</p>
            
            <div className="flex justify-center gap-6 mb-6">
              {socialLinks.map((social) => {
                const Icon = social.Icon;
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-gray-400 transition ${social.color}`}
                    aria-label={social.name}
                  >
                    <Icon size={24} />
                  </a>
                );
              })}
            </div>
            
            <p className="text-gray-500 mt-4">&copy; 2024 FUNTECH. All rights reserved.</p>
          </div>
        </div>
      </footer> */}
    </div>
  );
}
