import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(
  'https://iaruujazfjhekvxheuaq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhcnV1amF6ZmpoZWt2eGhldWFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ3MDI2ODUsImV4cCI6MjA0MDI3ODY4NX0.wOqA8LEZJ2kaXe_oDSaIiCBiMQXVy_SpFhreLGBuHk4'
);
