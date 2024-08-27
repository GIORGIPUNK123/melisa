import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../db/supabase';

export const useAuth = () => {
  const [user, setUser] = useState<'loading' | User | null>('loading');
  const [authError, setAuthError] = useState<string | null>(null);

  // Fetch the current user
  const fetchUser = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
  }, []);
  // Handle login
  const authLogin = useCallback(async (email: string, password: string) => {
    setUser('loading');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setAuthError(error.message);
        throw error.message;
      }
      setUser(data.user);
    } catch (err) {
      console.error('Login error:', err);
      setAuthError('login Error');
      setUser(null);
    }
  }, []);
  const authRegister = useCallback(async (email: string, password: string) => {
    setUser('loading');
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setAuthError(error.message);
        throw error.message;
      }

      return true;
    } catch (err) {
      console.error('registration error:', err);
      setAuthError('registration Error');
      setUser(null);
      return false;
    }
  }, []);

  // Fetch user on initial mount
  useEffect(() => {
    fetchUser();
  }, []);

  return { authLogin, authError, fetchUser, authRegister, user };
};
