import { createServerSupabaseClient } from '@/lib/supabase/server';
import { TIER_CONFIG, SessionTier } from '@/types/database';
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

  const { data: session } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  if (session.expert_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (session.status !== 'matched') {
    return NextResponse.json(
      { error: 'Session is not in matched state' },
      { status: 400 }
    );
  }

  const tierConfig = TIER_CONFIG[session.tier as SessionTier];
  const deadline = new Date();
  deadline.setHours(deadline.getHours() + tierConfig.deadlineHours);

  const { error } = await supabase
    .from('sessions')
    .update({
      status: 'in_progress',
      deadline_at: deadline.toISOString(),
    })
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from('messages').insert({
    session_id: params.id,
    sender_id: user.id,
    content: `Expert has started working. Deadline: ${deadline.toLocaleDateString()}.`,
    is_system: true,
  });

  return NextResponse.json({ success: true });
}
