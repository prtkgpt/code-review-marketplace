import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
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

  // Get paid sessions that haven't been claimed
  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('status', 'paid')
    .is('expert_id', null)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sessions });
}
