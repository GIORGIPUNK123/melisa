import { useState, useEffect } from 'react';
import { api } from '../functions/instance';
import { supabase } from '../db/supabase';

export interface Friend {
  friendshipId: string;
  userId: string;
  username: string;
  nickname: string;
  avatarUrl?: string | null;
  status?: string;
}

export const useFriendsList = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFriends = async () => {
    setIsLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) return;

      const response = await api.get('/friends/list', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFriends(response.data.friends || []);
    } catch (err) {
      console.error('Failed to fetch friends list:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getOrCreateConversation = async (friendUserId: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) return null;

      const response = await api.get(`/friends/conversation/${friendUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.conversationId;
    } catch (err) {
      console.error('Failed to get or create conversation:', err);
      return null;
    }
  };

  useEffect(() => {
    fetchFriends();

    // Set up real-time subscription for friendships table
    const setupSubscription = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel(`friendships:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'friendships',
            filter: `or(user_id.eq.${user.id},receiver_id.eq.${user.id})`,
          },
          () => {
            // Refetch when friendships change
            fetchFriends();
          },
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'friendships',
            filter: `or(user_id.eq.${user.id},receiver_id.eq.${user.id})`,
          },
          () => {
            // Refetch when friendships are deleted
            fetchFriends();
          },
        )
        .subscribe();

      return channel;
    };

    let channelPromise = setupSubscription();

    return () => {
      channelPromise.then((channel) => {
        if (channel) supabase.removeChannel(channel);
      });
    };
  }, []);

  return {
    friends,
    isLoading,
    fetchFriends,
    getOrCreateConversation,
  };
};
