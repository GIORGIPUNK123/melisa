import type { User } from '@supabase/supabase-js';
import { supabase } from '../../../db/supabase';
import { api } from '../../../api/instance';

export const isInvalidSessionError = (error: unknown): boolean => {
  const authError = error as {
    status?: number;
    statusCode?: number;
    __isAuthError?: number;
    message?: string;
  } | null;
  const status =
    authError?.status ?? authError?.statusCode ?? authError?.__isAuthError;
  const message = String(authError?.message ?? '').toLowerCase();

  return (
    status === 401 ||
    status === 403 ||
    message.includes('jwt') ||
    message.includes('session') ||
    message.includes('invalid') ||
    message.includes('forbidden')
  );
};

export const getCurrentUser = async (): Promise<User | null> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;

  return data.user ?? null;
};

export const login = async (email: string, password: string): Promise<User> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Login failed');

  return data.user;
};

export const register = async (
  email: string,
  password: string,
  username: string,
  nickname: string,
) => {
  await api.post('/auth/register', { email, password, username, nickname });
};

export const logout = async () => {
  await supabase.auth.signOut();
};
