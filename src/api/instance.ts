import axios from 'axios';
import { supabase } from '../db/supabase';

// Always same-origin. Vercel/Vite proxy /api → Render (no browser CORS).
export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
