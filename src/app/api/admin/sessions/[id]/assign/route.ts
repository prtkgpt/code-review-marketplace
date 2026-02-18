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

  // Verify admin
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { expert_id } = await request.json();

  if (!expert_id) {
    return NextResponse.json({ error: 'expert_id required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('sessions')
    .update({
      expert_id,
      status: 'matched',
    })
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from('messages').insert({
    session_id: params.id,
    sender_id: user.id,
    content: 'An expert has been assigned by the VibeFix team.',
    is_system: true,
  });

  return NextResponse.json({ success: true });
}
