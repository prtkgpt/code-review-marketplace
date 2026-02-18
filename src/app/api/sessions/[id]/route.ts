import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: session, error } = await supabase
    .from('sessions')
    .select('*, audit_reports(*)')
    .eq('id', params.id)
    .single();

  if (error || !session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  // Check access: client, assigned expert, or admin
  if (session.client_id !== user.id && session.expert_id !== user.id) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  return NextResponse.json({ session });
}
