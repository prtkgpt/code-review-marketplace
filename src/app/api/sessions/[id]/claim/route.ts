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

  // Verify user is an expert
  const { data: expertProfile } = await supabase
    .from('expert_profiles')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  if (!expertProfile) {
    return NextResponse.json({ error: 'Not an active expert' }, { status: 403 });
  }

  const { data: session } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  if (session.status !== 'paid') {
    return NextResponse.json(
      { error: 'Session is not available for claiming' },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from('sessions')
    .update({
      expert_id: user.id,
      status: 'matched',
    })
    .eq('id', params.id)
    .eq('status', 'paid'); // Optimistic lock

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Add system message
  await supabase.from('messages').insert({
    session_id: params.id,
    sender_id: user.id,
    content: 'An expert has been matched to this session.',
    is_system: true,
  });

  return NextResponse.json({ success: true });
}
