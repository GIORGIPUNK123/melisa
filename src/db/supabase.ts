import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

const globals = globalThis as typeof globalThis & {
  __charaSupabase?: SupabaseClient;
};

// Vite HMR re-runs this module and would otherwise create a second GoTrue
// client. Two clients fight over the same Navigator LockManager lock and
// throw: "Acquiring an exclusive Navigator LockManager lock ... immediately failed".
export const supabase =
  globals.__charaSupabase ??
  createClient(supabaseUrl, supabaseKey, {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });

globals.__charaSupabase = supabase;

if (typeof window !== 'undefined') {
  (window as any).supabase = supabase;
}
