import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify admin
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: session } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  // Process Stripe refund if there's a payment intent
  if (session.stripe_payment_intent_id) {
    try {
      await getStripe().refunds.create({
        payment_intent: session.stripe_payment_intent_id,
      });
    } catch (err) {
      console.error('Stripe refund error:', err);
      return NextResponse.json({ error: 'Refund processing failed' }, { status: 500 });
    }
  }

  const { error } = await supabase
    .from('sessions')
    .update({ status: 'refunded' })
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from('messages').insert({
    session_id: params.id,
    sender_id: user.id,
    content: 'A full refund has been processed for this session.',
    is_system: true,
  });

  return NextResponse.json({ success: true });
}
