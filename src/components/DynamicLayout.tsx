'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

// Routes that should NOT show navbar/footer
const hideLayoutRoutes = [
  '/dashboard',
  '/admin',
  '/voting/callback',
];

export default function DynamicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Check if current path should hide layout
  const shouldHideLayout = hideLayoutRoutes.some(route => 
    pathname?.startsWith(route)
  );

  if (shouldHideLayout) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
}
