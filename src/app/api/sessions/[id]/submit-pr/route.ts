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

  const { pr_url } = await request.json();

  if (!pr_url) {
    return NextResponse.json({ error: 'PR URL is required' }, { status: 400 });
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

  if (session.status !== 'in_progress') {
    return NextResponse.json(
      { error: 'Session is not in progress' },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from('sessions')
    .update({
      status: 'pending_review',
      pr_url,
    })
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from('messages').insert({
    session_id: params.id,
    sender_id: user.id,
    content: `Pull request submitted for review: ${pr_url}`,
    is_system: true,
  });

  return NextResponse.json({ success: true });
}
