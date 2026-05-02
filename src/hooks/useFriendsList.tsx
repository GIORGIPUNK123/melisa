import { useState, useEffect } from 'react';
import { api } from '../functions/instance';
import { supabase } from '../db/supabase';
import { FriendT } from '../types';

export const useFriendsList = () => {
  const [friends, setFriends] = useState<FriendT[]>([]);
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
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
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

  // Subscribe to status changes of all friends
  useEffect(() => {
    if (friends.length === 0) return;

    const friendIds = friends.map((f) => f.userId);

    const statusChannel = supabase
      .channel('friends-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'public_profiles',
        },
        (payload) => {
          const { id, status } = payload.new as {
            id: string;
            status: 'online' | 'offline' | 'away';
          };

          // Only update if this user is in our friends list
          if (friendIds.includes(id)) {
            setFriends((prev) =>
              prev.map((friend) =>
                friend.userId === id ? { ...friend, status } : friend,
              ),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(statusChannel);
    };
  }, [friends]);

  return {
    friends,
    isLoading,
    fetchFriends,
    getOrCreateConversation,
  };
};
