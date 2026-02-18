import { createServerSupabaseClient } from '@/lib/supabase/server';
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

  if (session.client_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (session.status !== 'pending_review') {
    return NextResponse.json(
      { error: 'Session is not pending review' },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from('sessions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Add system message
  await supabase.from('messages').insert({
    session_id: params.id,
    sender_id: user.id,
    content: 'Session completed. The fix has been confirmed as working.',
    is_system: true,
  });

  // Update expert stats
  if (session.expert_id) {
    const { data: profile } = await supabase
      .from('expert_profiles')
      .select('sessions_completed')
      .eq('user_id', session.expert_id)
      .single();

    if (profile) {
      await supabase
        .from('expert_profiles')
        .update({
          sessions_completed: profile.sessions_completed + 1,
        })
        .eq('user_id', session.expert_id);
    }
  }

  return NextResponse.json({ success: true });
}
