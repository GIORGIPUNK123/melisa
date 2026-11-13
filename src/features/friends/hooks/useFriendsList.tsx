// src/features/friends/hooks/useFriendsList.ts
import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '../../../db/supabase';
import { useFriendStore } from '../../../store/useFriendStore';
import {
  fetchFriendsList,
  getOrCreateConversationApi,
  removeFriendApi,
} from '../utils/friendsFunctions';

export const useFriendsList = (
  userId: string | undefined,
  onChanged?: () => void,
) => {
  const {
    friends,
    isLoading,
    setFriends,
    setIsLoading,
    removeFriendFromStore,
  } = useFriendStore();
  const onChangedRef = useRef(onChanged);
  onChangedRef.current = onChanged;
  const fetchGenerationRef = useRef(0);

  const fetchFriends = useCallback(async (options?: { silent?: boolean }) => {
    // Only show skeleton loading state if we don't have friends in the store yet
    if (!options?.silent && useFriendStore.getState().friends.length === 0) {
      setIsLoading(true);
    }

    const generation = ++fetchGenerationRef.current;
    const data = await fetchFriendsList();

    if (generation !== fetchGenerationRef.current) return;
    setFriends(data);
  }, []);

  const getOrCreateConversation = async (friendUserId: string) => {
    return await getOrCreateConversationApi(friendUserId);
  };

  const removeFriend = async (friendUserId: string) => {
    const success = await removeFriendApi(friendUserId);
    if (success) {
      removeFriendFromStore(friendUserId);
      onChangedRef.current?.();
    }
  };

  const isFriend = (targetUserId?: string | null) => {
    if (!targetUserId) return false;
    return friends.some((friend) => friend.userId === targetUserId);
  };

  useEffect(() => {
    if (!userId) {
      setFriends([]);
      setIsLoading(false);
      return;
    }

    fetchFriends();

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
          fetchFriends({ silent: true });
          onChangedRef.current?.();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(friendshipsChannel);
    };
  }, [fetchFriends, userId, setFriends, setIsLoading]);

  return {
    friends,
    isLoading,
    fetchFriends,
    getOrCreateConversation,
    removeFriend,
    isFriend,
  };
};
