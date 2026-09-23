import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../../../api/instance';
import { supabase } from '../../../db/supabase';
import { FriendT } from '../../../types';

export const useFriendsList = (onChanged?: () => void) => {
  const [friends, setFriends] = useState<FriendT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const onChangedRef = useRef(onChanged);
  onChangedRef.current = onChanged;
  const fetchGenerationRef = useRef(0);

  const fetchFriends = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) setIsLoading(true);
    const generation = ++fetchGenerationRef.current;
    try {
      const response = await api.get('/friends/list');

      if (generation !== fetchGenerationRef.current) return;
      setFriends(response.data.friends || []);
    } catch (err) {
      console.error('Failed to fetch friends list:', err);
    } finally {
      if (generation === fetchGenerationRef.current) setIsLoading(false);
    }
  }, []);

  const getOrCreateConversation = async (friendUserId: string) => {
    try {
      const response = await api.get(`/friends/conversation/${friendUserId}`);

      return response.data.conversationId;
    } catch (err) {
      console.error('Failed to get or create conversation:', err);
      return null;
    }
  };

  const removeFriend = async (friendUserId: string) => {
    await api.delete(`/friends/with/${friendUserId}`);

    setFriends((current) =>
      current.filter((friend) => friend.userId !== friendUserId),
    );
    onChangedRef.current?.();
  };

  const isFriend = (userId?: string | null) => {
    if (!userId) return false;
    return friends.some((friend) => friend.userId === userId);
  };

  useEffect(() => {
    void fetchFriends();

    const friendshipsChannel = supabase
      .channel('friends-list')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
        },
        () => {
          void fetchFriends({ silent: true });
          onChangedRef.current?.();
        },
      )
      .subscribe();

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
      void supabase.removeChannel(friendshipsChannel);
      void supabase.removeChannel(statusChannel);
    };
  }, [fetchFriends]);

  return {
    friends,
    isLoading,
    fetchFriends,
    getOrCreateConversation,
    removeFriend,
    isFriend,
  };
};
