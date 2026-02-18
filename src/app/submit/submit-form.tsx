'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TIER_CONFIG, SessionTier } from '@/types/database';
import { Shield, ArrowRight, Check } from 'lucide-react';

const STACK_OPTIONS = [
  'Next.js', 'React', 'Vue', 'Svelte', 'Node.js', 'Python', 'Supabase',
  'Firebase', 'Stripe', 'Tailwind', 'Prisma', 'TypeScript', 'PostgreSQL',
  'MongoDB', 'Vercel', 'Railway', 'Docker', 'GraphQL', 'REST API', 'Other',
];

const TIER_ORDER: SessionTier[] = ['fix', 'build', 'ship', 'autofix'];

export function SubmitForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedTier = (searchParams.get('tier') as SessionTier) || 'fix';

  const [selectedTier, setSelectedTier] = useState<SessionTier>(preselectedTier);
  const [repoUrl, setRepoUrl] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [selectedStacks, setSelectedStacks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleStack = (stack: string) => {
    setSelectedStacks((prev) =>
      prev.includes(stack) ? prev.filter((s) => s !== stack) : [...prev, stack]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!repoUrl.trim()) {
      setError('Please provide a GitHub repository URL.');
      return;
    }
    if (!goalDescription.trim()) {
      setError('Please describe what you need fixed or built.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: selectedTier,
          repo_url: repoUrl,
          goal_description: goalDescription,
          stack_tags: selectedStacks,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/auth/login');
          return;
        }
        throw new Error(data.error || 'Failed to create session');
      }

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        router.push(`/dashboard/client?session=${data.session.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-10 space-y-8">
      {/* Tier selection */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">1. Choose your tier</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {TIER_ORDER.map((tierKey) => {
            const tier = TIER_CONFIG[tierKey];
            const selected = selectedTier === tierKey;
            return (
              <button
                key={tierKey}
                type="button"
                onClick={() => setSelectedTier(tierKey)}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  selected
                    ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">{tier.name}</span>
                  {selected && <Check className="h-4 w-4 text-indigo-600" />}
                </div>
                <div className="mt-1 text-xl font-bold text-gray-900">${tier.price}</div>
                <p className="mt-1 text-xs text-gray-500">{tier.description}</p>
              </button>
            );
          })}
        </div>
        <p className="mt-2 flex items-center gap-1 text-sm text-green-600">
          <Shield className="h-4 w-4" />
          {TIER_CONFIG[selectedTier].guarantee}
        </p>
      </div>

      {/* Repo URL */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">2. Your repository</h2>
        <Input
          id="repo_url"
          label="GitHub Repository URL"
          placeholder="https://github.com/username/project"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          required
        />
      </div>

      {/* Goal */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          3. What do you need?
        </h2>
        <Textarea
          id="goal"
          label="Describe what's broken or what you need built"
          placeholder="E.g., Stripe webhooks are failing silently when a user upgrades their plan. The webhook endpoint returns 200 but the database isn't updating the user's subscription status..."
          rows={5}
          value={goalDescription}
          onChange={(e) => setGoalDescription(e.target.value)}
          required
        />
      </div>

      {/* Stack tags */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">4. Your tech stack</h2>
        <p className="mb-3 text-sm text-gray-500">Select all that apply.</p>
        <div className="flex flex-wrap gap-2">
          {STACK_OPTIONS.map((stack) => {
            const selected = selectedStacks.includes(stack);
            return (
              <button
                key={stack}
                type="button"
                onClick={() => toggleStack(stack)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  selected
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                }`}
              >
                {stack}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-gray-200 pt-6">
        <div>
          <span className="text-2xl font-bold text-gray-900">
            ${TIER_CONFIG[selectedTier].price}
          </span>
          <span className="ml-2 text-sm text-gray-500">
            {TIER_CONFIG[selectedTier].name} tier
          </span>
        </div>
        <Button type="submit" size="lg" disabled={loading} className="gap-2">
          {loading ? 'Processing...' : 'Continue to Payment'}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
