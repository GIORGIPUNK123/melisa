import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { AxiosError } from 'axios';
import { supabase } from '../db/supabase';
import { api } from '../functions/instance';

export const useAuth = () => {
  const [user, setUser] = useState<'loading' | User | null>('loading');
  const [authError, setAuthError] = useState<string | null>(null);

  // Fetch the current user from Supabase
  const fetchUser = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
  }, []);

  // Handle login
  const authLogin = useCallback(async (email: string, password: string) => {
    setUser('loading');
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthError(error.message);
        setUser(null);
        return false;
      }

      setUser(data.user);
      return true;
    } catch (err: any) {
      setAuthError(err.message || 'Login Error');
      setUser(null);
      return false;
    }
  }, []);

  // Handle registration
  const authRegister = useCallback(
    async (
      email: string,
      password: string,
      username: string,
      nickname: string,
    ) => {
      setUser('loading');
      setAuthError(null);
      try {
        const response = await api.post('/auth/register', {
          email,
          password,
          username,
          nickname,
        });

        setUser(null); // User needs to verify email first
        return true;
      } catch (err: unknown) {
        const axiosError = err as AxiosError<{ error?: string }>;
        const errorMessage =
          axiosError.response?.data?.error || 'Registration Error';
        setAuthError(errorMessage);
        setUser(null);
        return false;
      }
    },
    [],
  );

  // Handle logout
  const authLogout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  // Fetch user on initial mount
  useEffect(() => {
    fetchUser();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [fetchUser]);

  return { authLogin, authLogout, authError, fetchUser, authRegister, user };
};
