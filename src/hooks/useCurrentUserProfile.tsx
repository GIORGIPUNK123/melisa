import { useState, useEffect } from 'react';
import { supabase } from '../db/supabase';
import { UserT } from '../types';

export const useCurrentUserProfile = (userId: string | undefined) => {
  const [profile, setProfile] = useState<UserT | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchUserProfile = async () => {
      const { data } = await supabase
        .from('users')
        .select(
          'id,email,username,nickname,avatar_url,status,created_at, iv, salt, encrypted_private_key, public_key',
        )
        .eq('id', userId)
        .single();

      if (data) setProfile(data as UserT);
    };

    fetchUserProfile();
  }, [userId]);

  return { profile, setProfile };
};
