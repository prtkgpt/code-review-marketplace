'use client';

import { Suspense } from 'react';
import { SubmitForm } from './submit-form';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

export default function SubmitPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Submit Your Project</h1>
            <p className="mt-2 text-gray-600">
              Tell us what&apos;s broken and we&apos;ll match you with an expert.
            </p>
          </div>
          <Suspense fallback={<div className="py-12 text-center text-gray-500">Loading...</div>}>
            <SubmitForm />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
