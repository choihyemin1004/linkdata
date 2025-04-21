import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Validate connection and auth status
export const validateConnection = async () => {
  try {
    // Check if we have a session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      throw sessionError;
    }

    // Test database connection only if we have a session
    if (session) {
      const { error } = await supabase
        .from('links')
        .select('id')
        .limit(1);

      if (error) {
        throw error;
      }
    }

    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
};