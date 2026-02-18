'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import {
  Zap,
  LayoutDashboard,
  FolderOpen,
  MessageSquare,
  Settings,
  Users,
  BarChart3,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CLIENT_NAV: NavItem[] = [
  { label: 'Sessions', href: '/dashboard/client', icon: FolderOpen },
  { label: 'Messages', href: '/dashboard/client/messages', icon: MessageSquare },
  { label: 'Settings', href: '/dashboard/client/settings', icon: Settings },
];

const EXPERT_NAV: NavItem[] = [
  { label: 'Queue', href: '/dashboard/expert', icon: LayoutDashboard },
  { label: 'My Sessions', href: '/dashboard/expert/sessions', icon: FolderOpen },
  { label: 'Earnings', href: '/dashboard/expert/earnings', icon: BarChart3 },
  { label: 'Settings', href: '/dashboard/expert/settings', icon: Settings },
];

const ADMIN_NAV: NavItem[] = [
  { label: 'Overview', href: '/dashboard/admin', icon: BarChart3 },
  { label: 'Sessions', href: '/dashboard/admin/sessions', icon: FolderOpen },
  { label: 'Experts', href: '/dashboard/admin/experts', icon: Users },
  { label: 'Users', href: '/dashboard/admin/users', icon: Users },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: 'client' | 'expert' | 'admin';
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const navItems =
    role === 'admin' ? ADMIN_NAV : role === 'expert' ? EXPERT_NAV : CLIENT_NAV;

  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform md:relative md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-indigo-600" />
            <span className="text-lg font-bold text-gray-900">VibeFix</span>
          </Link>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="px-4 py-3">
          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
            {roleLabel}
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon className={cn('h-4 w-4', isActive ? 'text-indigo-600' : 'text-gray-400')} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3">
            {user?.user_metadata?.avatar_url && (
              <Image
                src={user.user_metadata.avatar_url}
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 rounded-full"
                unoptimized
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">
                {user?.user_metadata?.full_name || user?.email || 'User'}
              </p>
            </div>
            <button onClick={handleSignOut} className="text-gray-400 hover:text-gray-600">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-6">
          <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            {navItems.find((i) => i.href === pathname)?.label || 'Dashboard'}
          </h1>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
