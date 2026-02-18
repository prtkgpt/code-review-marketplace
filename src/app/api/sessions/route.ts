import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe';
import { TIER_CONFIG, SessionTier } from '@/types/database';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sessions });
}

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { tier, repo_url, goal_description, stack_tags } = body;

  if (!tier || !repo_url || !goal_description) {
    return NextResponse.json(
      { error: 'Missing required fields: tier, repo_url, goal_description' },
      { status: 400 }
    );
  }

  const tierConfig = TIER_CONFIG[tier as SessionTier];
  if (!tierConfig) {
    return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
  }

  // Create Stripe Checkout session
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const checkoutSession = await getStripe().checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `VibeFix ${tierConfig.name}`,
            description: tierConfig.description,
          },
          unit_amount: tierConfig.priceCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      user_id: user.id,
      tier,
      repo_url,
      goal_description,
      stack_tags: JSON.stringify(stack_tags || []),
    },
    success_url: `${appUrl}/api/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/submit?tier=${tier}&cancelled=true`,
  });

  return NextResponse.json({ checkout_url: checkoutSession.url });
}
