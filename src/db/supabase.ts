import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

const globals = globalThis as typeof globalThis & {
  __melisaSupabase?: SupabaseClient;
};

export const supabase =
  globals.__melisaSupabase ??
  createClient(supabaseUrl, supabaseKey, {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });

globals.__melisaSupabase = supabase;
