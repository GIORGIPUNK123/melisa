import { useEffect } from 'react';
import { supabase } from '../../../db/supabase';
import { useAuthStore } from '../../../store/useAuthStore';

export const useInitAuth = () => {
  const initializeAuth = useAuthStore((s) => s.initializeAuth);
  const fetchUserProfile = useAuthStore((s) => s.fetchUserProfile);

  useEffect(() => {
    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        useAuthStore.setState({ user: session.user });
        void fetchUserProfile(session.user.id);
      } else {
        useAuthStore.setState({ user: null, profile: null, privateKey: null });
      }
    });

    return () => subscription.unsubscribe();
  }, [initializeAuth, fetchUserProfile]);
};
