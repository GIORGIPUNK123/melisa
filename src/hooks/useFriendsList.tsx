import { useState, useEffect } from 'react';
import { api } from '../functions/instance';
import { supabase } from '../db/supabase';
import { FriendT } from '../types';

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

  useEffect(() => {
    fetchFriends();

    const statusChannel = supabase
      .channel('friends_status_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
        },
        (payload) => {
          if (!payload?.old || !payload?.new) return;

          // 1. Check if last_seen_at actually changed
          const timeChanged =
            payload.old.last_seen_at !== payload.new.last_seen_at;
          const privacyChanged =
            payload.old.appear_offline !== payload.new.appear_offline;

          // If neither of these presence tokens changed, drop the execution early!
          if (!timeChanged && !privacyChanged) return;

          // 2. Only update state if it passes the presence check
          setFriends((currentFriends) => {
            const friendExists = currentFriends.some(
              (f) => f.userId === payload.new.id,
            );
            if (!friendExists) return currentFriends;

            return currentFriends.map((friend) =>
              friend.userId === payload.new.id
                ? {
                    ...friend,
                    last_seen_at: payload.new.last_seen_at,
                    appear_offline: payload.new.appear_offline,
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
  };
};
