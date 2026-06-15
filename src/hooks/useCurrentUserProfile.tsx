import { useState, useEffect } from 'react';
import { supabase } from '../db/supabase';
import { UserT } from '../types';

export const useCurrentUserProfile = (userId: string | undefined) => {
  const [profile, setProfile] = useState<UserT | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchUserProfile = async () => {
      const { data, error } = await supabase
        .from('users')
        .select(
          'id,email,username,nickname,avatar_url,status,appear_offline,created_at, iv, salt, encrypted_private_key, public_key',
        )
        .eq('id', userId)
        .single();

      if (error) {
        const message = String(error.message || '').toLowerCase();
        if (message.includes('appear_offline')) {
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('users')
            .select(
              'id,email,username,nickname,avatar_url,status,created_at, iv, salt, encrypted_private_key, public_key',
            )
            .eq('id', userId)
            .single();

          if (fallbackError) {
            console.error(
              'Failed to fetch current user profile:',
              fallbackError,
            );
            return;
          }

          if (fallbackData) setProfile(fallbackData as UserT);
          return;
        }

        console.error('Failed to fetch current user profile:', error);
        return;
      }
      if (data) setProfile(data as UserT);
    };

    fetchUserProfile();

    const channel = supabase
      .channel(`self-profile:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          const updated = payload.new as UserT;
          setProfile((prev) => (prev ? { ...prev, ...updated } : updated));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { profile, setProfile };
};
