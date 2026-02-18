import Link from 'next/link';
import { Zap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-indigo-600" />
              <span className="text-lg font-bold text-gray-900">VibeFix</span>
            </Link>
            <p className="mt-3 text-sm text-gray-500">
              The guaranteed finishing layer for AI-generated code. Ship in 72 hours or don&apos;t pay.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Product</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/#how-it-works" className="text-sm text-gray-500 hover:text-gray-700">How it Works</Link></li>
              <li><Link href="/#pricing" className="text-sm text-gray-500 hover:text-gray-700">Pricing</Link></li>
              <li><Link href="/submit" className="text-sm text-gray-500 hover:text-gray-700">Submit Project</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">For Experts</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/auth/login" className="text-sm text-gray-500 hover:text-gray-700">Apply as Expert</Link></li>
              <li><Link href="/dashboard/expert" className="text-sm text-gray-500 hover:text-gray-700">Expert Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Company</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="#" className="text-sm text-gray-500 hover:text-gray-700">About</Link></li>
              <li><Link href="#" className="text-sm text-gray-500 hover:text-gray-700">Privacy</Link></li>
              <li><Link href="#" className="text-sm text-gray-500 hover:text-gray-700">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} VibeFix. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
