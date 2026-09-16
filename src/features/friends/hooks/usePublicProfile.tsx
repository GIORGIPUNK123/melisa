import { useState, useEffect } from 'react';
import { api } from '../../../api/instance';

export interface UserProfile {
  id: string;
  username: string;
  nickname: string;
  avatarUrl?: string | null;
  status?: string;
  createdAt: string;
  lastSeenAt?: string | null;
  appearOffline?: boolean;
}

export const usePublicProfile = (username: string | null) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) {
      setProfile(null);
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get(`/friends/profile/${username}`);
        const user = response.data.user;

        setProfile({
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          avatarUrl: user.avatar_url,
          status: user.status,
          createdAt: user.created_at,
          lastSeenAt: user.last_seen_at,
          appearOffline: user.appear_offline,
        });
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load profile');
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  return { profile, isLoading, error };
};
