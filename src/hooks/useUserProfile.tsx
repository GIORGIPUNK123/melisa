import { useState, useEffect } from 'react';
import { api } from '../functions/instance';

export interface UserProfile {
  username: string;
  nickname: string;
  avatarUrl?: string | null;
  status?: string;
  createdAt: string;
}

export const useUserProfile = (username: string | null) => {
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
        setProfile(response.data.user);
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
