'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { User } from '@supabase/supabase-js';
import { Menu, X, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const isDashboard = pathname.startsWith('/dashboard');

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">VibeFix</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-6 md:flex">
            {!isDashboard && (
              <>
                <Link href="/#how-it-works" className="text-sm text-gray-600 hover:text-gray-900">
                  How it Works
                </Link>
                <Link href="/#pricing" className="text-sm text-gray-600 hover:text-gray-900">
                  Pricing
                </Link>
              </>
            )}
            {user ? (
              <>
                <Link href="/dashboard/client">
                  <Button variant="ghost" size="sm">Dashboard</Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">Log In</Button>
                </Link>
                <Link href="/submit">
                  <Button size="sm">Get Your Fix</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="border-t border-gray-200 pb-4 pt-2 md:hidden">
            <div className="flex flex-col gap-2">
              {!isDashboard && (
                <>
                  <Link
                    href="/#how-it-works"
                    className="px-3 py-2 text-sm text-gray-600"
                    onClick={() => setMenuOpen(false)}
                  >
                    How it Works
                  </Link>
                  <Link
                    href="/#pricing"
                    className="px-3 py-2 text-sm text-gray-600"
                    onClick={() => setMenuOpen(false)}
                  >
                    Pricing
                  </Link>
                </>
              )}
              {user ? (
                <>
                  <Link
                    href="/dashboard/client"
                    className="px-3 py-2 text-sm text-gray-600"
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="px-3 py-2 text-left text-sm text-gray-600"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="px-3 py-2 text-sm text-gray-600"
                    onClick={() => setMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/submit"
                    className={cn('px-3 py-2 text-sm font-medium text-indigo-600')}
                    onClick={() => setMenuOpen(false)}
                  >
                    Get Your Fix
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
