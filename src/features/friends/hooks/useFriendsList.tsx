import { useState, useEffect } from 'react';
import { api } from '../../../api/instance';
import { supabase } from '../../../db/supabase';
import { FriendT } from '../../../types';

export const useFriendsList = () => {
  const [friends, setFriends] = useState<FriendT[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const removeFriend = async (friendUserId: string) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    if (!token) {
      throw new Error('Not authenticated');
    }

    await api.delete(`/friends/with/${friendUserId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setFriends((current) =>
      current.filter((friend) => friend.userId !== friendUserId),
    );
  };

  const isFriend = (userId?: string | null) => {
    if (!userId) return false;
    return friends.some((friend) => friend.userId === userId);
  };

  useEffect(() => {
    fetchFriends();

    const statusChannel = supabase
      .channel('friends_status_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_presence',
        },
        (payload) => {
          const presence = payload.new as {
            user_id?: string;
            last_seen_at?: string | null;
            appear_offline?: boolean;
          };
          if (!presence?.user_id) return;

          const timeChanged =
            payload.old?.last_seen_at !== presence.last_seen_at;
          const privacyChanged =
            payload.old?.appear_offline !== presence.appear_offline;
          if (!timeChanged && !privacyChanged) return;

          setFriends((currentFriends) => {
            const friendExists = currentFriends.some(
              (f) => f.userId === presence.user_id,
            );
            if (!friendExists) return currentFriends;

            return currentFriends.map((friend) =>
              friend.userId === presence.user_id
                ? {
                    ...friend,
                    last_seen_at: presence.last_seen_at,
                    appear_offline: presence.appear_offline,
                  }
                : friend,
            );
          });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(statusChannel);
    };
  }, []);

  return {
    friends,
    isLoading,
    fetchFriends,
    getOrCreateConversation,
    removeFriend,
    isFriend,
  };
};
