import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe';
import { TIER_CONFIG, SessionTier } from '@/types/database';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!sessionId) {
    return NextResponse.redirect(`${appUrl}/submit?error=missing_session`);
  }

  try {
    const checkoutSession = await getStripe().checkout.sessions.retrieve(sessionId);

    if (checkoutSession.payment_status !== 'paid') {
      return NextResponse.redirect(`${appUrl}/submit?error=payment_failed`);
    }

    const metadata = checkoutSession.metadata!;
    const tier = metadata.tier as SessionTier;
    const tierConfig = TIER_CONFIG[tier];

    const supabase = createServerSupabaseClient();

    // Create the session in our database
    const { data: session, error } = await supabase
      .from('sessions')
      .insert({
        client_id: metadata.user_id,
        tier,
        status: 'paid',
        repo_url: metadata.repo_url,
        goal_description: metadata.goal_description,
        stack_tags: JSON.parse(metadata.stack_tags || '[]'),
        stripe_payment_intent_id: checkoutSession.payment_intent as string,
        amount_cents: tierConfig.priceCents,
        expert_payout_cents: tierConfig.expertPayoutCents,
        platform_fee_cents: tierConfig.platformFeeCents,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create session:', error);
      return NextResponse.redirect(`${appUrl}/dashboard/client?error=session_creation_failed`);
    }

    return NextResponse.redirect(`${appUrl}/dashboard/client/session/${session.id}`);
  } catch (err) {
    console.error('Stripe success handler error:', err);
    return NextResponse.redirect(`${appUrl}/dashboard/client?error=unknown`);
  }
}
