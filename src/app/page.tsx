import Link from 'next/link';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import {
  Zap,
  Shield,
  Clock,
  GitBranch,
  CheckCircle,
  ArrowRight,
  Star,
  Users,
  Code2,
  Search,
  Wrench,
  Rocket,
} from 'lucide-react';
import { TIER_CONFIG, SessionTier } from '@/types/database';

const DISPLAY_TIERS: SessionTier[] = ['fix', 'build', 'ship'];

const STEPS = [
  {
    icon: GitBranch,
    title: 'Submit Your Repo',
    description:
      'Share your GitHub repo URL and describe what\'s broken or what you need built. Takes 2 minutes.',
  },
  {
    icon: Search,
    title: 'We Audit Your Code',
    description:
      'Our Vibe Audit Engine scans your project, identifies blockers, and creates a fix plan.',
  },
  {
    icon: Wrench,
    title: 'Expert Delivers a Fix',
    description:
      'A matched expert submits a PR with the fix. You review, test, and confirm it works.',
  },
  {
    icon: Rocket,
    title: 'Ship With Confidence',
    description:
      'Your project is unblocked. If the fix doesn\'t work, you get a full refund. Zero risk.',
  },
];

const PAIN_POINTS = [
  'Stripe webhooks failing silently',
  'Supabase auth redirect loops',
  'Build errors blocking deployment',
  'Database schema conflicts',
  'CORS errors on API calls',
  'Environment variables not loading',
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 to-white px-4 pb-20 pt-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm text-indigo-700">
            <Zap className="h-4 w-4" />
            The finishing layer for vibe-coded projects
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Your AI project is 80% done.
            <br />
            <span className="text-indigo-600">We ship the last 20%.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            Stuck on a Cursor, Replit, or Bolt project? VibeFix pairs AI-powered code auditing
            with vetted experts who guarantee your project ships — or you don&apos;t pay.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-8 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              Get Your Fix — From $99
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/#how-it-works"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-8 py-3 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              See How It Works
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Shield className="h-4 w-4 text-green-500" />
              Money-back guarantee
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-blue-500" />
              48-hour delivery
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500" />
              Vetted experts
            </span>
          </div>
        </div>
      </section>

      {/* Pain points */}
      <section className="border-y border-gray-200 bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-gray-900">Sound Familiar?</h2>
          <p className="mt-2 text-gray-600">
            These are the exact problems vibe coders hit every day.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {PAIN_POINTS.map((pain) => (
              <div
                key={pain}
                className="flex items-center gap-3 rounded-lg border border-red-100 bg-white p-4 text-left text-sm text-gray-700"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs text-red-600">
                  !
                </span>
                {pain}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">How VibeFix Works</h2>
            <p className="mt-2 text-gray-600">Four steps from stuck to shipped.</p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-4">
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100">
                  <step.icon className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="mt-1 text-xs font-semibold text-indigo-600">Step {i + 1}</div>
                <h3 className="mt-2 text-lg font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-gray-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Simple, Outcome-Based Pricing</h2>
            <p className="mt-2 text-gray-600">
              Pay for results, not hours. Full refund if we don&apos;t deliver.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {DISPLAY_TIERS.map((tierKey) => {
              const tier = TIER_CONFIG[tierKey];
              const isPopular = tierKey === 'build';
              return (
                <div
                  key={tierKey}
                  className={`relative rounded-xl border bg-white p-8 shadow-sm ${
                    isPopular ? 'border-indigo-600 ring-2 ring-indigo-600' : 'border-gray-200'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-semibold text-white">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-gray-900">{tier.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{tier.description}</p>
                  <div className="mt-6">
                    <span className="text-4xl font-bold text-gray-900">${tier.price}</span>
                    <span className="text-sm text-gray-500"> / project</span>
                  </div>
                  <p className="mt-2 flex items-center gap-1 text-sm text-green-600">
                    <Shield className="h-4 w-4" />
                    {tier.guarantee}
                  </p>
                  <ul className="mt-6 space-y-3">
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                      AI-powered code audit included
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                      Expert matched to your stack
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                      PR submitted to your repo
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                      Async messaging with expert
                    </li>
                  </ul>
                  <Link
                    href={`/submit?tier=${tierKey}`}
                    className={`mt-8 block w-full rounded-lg py-2.5 text-center text-sm font-medium ${
                      isPopular
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Get Started
                  </Link>
                </div>
              );
            })}
          </div>
          <p className="mt-8 text-center text-sm text-gray-500">
            Need something smaller?{' '}
            <Link href="/submit?tier=autofix" className="text-indigo-600 hover:underline">
              AutoFix at $29
            </Link>{' '}
            handles simple, well-scoped fixes with AI only.
          </p>
        </div>
      </section>

      {/* Social proof / stats */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
            <div>
              <div className="flex items-center justify-center gap-2 text-3xl font-bold text-gray-900">
                <Clock className="h-8 w-8 text-indigo-600" />
                48hrs
              </div>
              <p className="mt-2 text-sm text-gray-600">Average fix delivery time</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 text-3xl font-bold text-gray-900">
                <Users className="h-8 w-8 text-indigo-600" />
                100%
              </div>
              <p className="mt-2 text-sm text-gray-600">Money-back guarantee</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 text-3xl font-bold text-gray-900">
                <Code2 className="h-8 w-8 text-indigo-600" />
                5x
              </div>
              <p className="mt-2 text-sm text-gray-600">Faster than hiring a freelancer</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-white">Stop Being Stuck. Start Shipping.</h2>
          <p className="mt-4 text-lg text-indigo-100">
            Submit your project and get matched with an expert who&apos;ll have it working
            within days — not weeks.
          </p>
          <Link
            href="/submit"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 text-base font-medium text-indigo-600 shadow-sm hover:bg-indigo-50"
          >
            Submit Your Project
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
