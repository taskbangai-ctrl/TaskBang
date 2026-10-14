import { supabase } from '../supabaseClient';

export const verifySystemHealth = async () => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;

    if (!session) {
      return { status: 'unauthenticated', message: 'User is not logged in.' };
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, balance')
      .eq('id', session.user.id)
      .single();

    if (profileError) throw profileError;

    return {
      status: 'ok',
      userId: session.user.id,
      role: profile?.role,
      balance: profile?.balance
    };
  } catch (err) {
    console.error('System health check failed:', err);
    return { status: 'error', error: err.message };
  }
};