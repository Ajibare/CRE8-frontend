'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const adminLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/admin/submissions', label: 'Submissions', icon: '📝' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/referrals', label: 'Referrals', icon: '🎁' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Public admin routes that don't require authentication
  const publicAdminRoutes = ['/admin/login', '/admin/register'];
  const isPublicRoute = publicAdminRoutes.includes(pathname);

  useEffect(() => {
    // Allow public access to login and register pages
    if (isPublicRoute) {
      setIsLoading(false);
      return;
    }

    // Check if user is admin for protected routes
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      router.push('/login');
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'admin') {
        router.push('/');
        return;
      }
      setIsAuthenticated(true);
      setIsLoading(false);
    } catch {
      router.push('/login');
      return;
    }
  }, [router, pathname, isPublicRoute]);

  // For public routes (login/register), render children without admin layout
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated && !isPublicRoute) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-40">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-violet-600">Admin Panel</h1>
        </div>
        <nav className="px-4 pb-4">
          <ul className="space-y-2">
            {adminLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    pathname === link.href
                      ? 'bg-violet-100 text-violet-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>{link.icon}</span>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              router.push('/login');
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <span>🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
