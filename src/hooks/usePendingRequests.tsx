import { useState, useEffect } from 'react';
import { api } from '../functions/instance';
import { supabase } from '../db/supabase';

export interface PendingRequest {
  friendshipId: string;
  username: string;
  nickname: string;
  avatarUrl?: string | null;
  status?: string;
  createdAt: string;
}

export const usePendingRequests = () => {
  const [sentRequests, setSentRequests] = useState<PendingRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<PendingRequest[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) return;

      const response = await api.get('/friends/pending', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSentRequests(response.data.sent || []);
      setReceivedRequests(response.data.received || []);
    } catch (err) {
      console.error('Failed to fetch pending requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelRequest = async (friendshipId: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) return false;

      await api.delete(`/friends/request/${friendshipId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSentRequests((prev) =>
        prev.filter((r) => r.friendshipId !== friendshipId),
      );
      return true;
    } catch (err) {
      console.error('Failed to cancel request:', err);
      return false;
    }
  };

  const acceptRequest = async (friendshipId: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) return false;

      await api.post(
        `/friends/request/${friendshipId}/accept`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setReceivedRequests((prev) =>
        prev.filter((r) => r.friendshipId !== friendshipId),
      );
      return true;
    } catch (err) {
      console.error('Failed to accept request:', err);
      return false;
    }
  };

  const rejectRequest = async (friendshipId: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) return false;

      await api.delete(`/friends/request/${friendshipId}/reject`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setReceivedRequests((prev) =>
        prev.filter((r) => r.friendshipId !== friendshipId),
      );
      return true;
    } catch (err) {
      console.error('Failed to reject request:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchRequests();

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
            event: '*',
            schema: 'public',
            table: 'friendships',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            // Refetch when sent requests change
            fetchRequests();
          },
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'friendships',
            filter: `receiver_id=eq.${user.id}`,
          },
          () => {
            // Refetch when received requests change
            fetchRequests();
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
    sentRequests,
    receivedRequests,
    isLoading,
    fetchRequests,
    cancelRequest,
    acceptRequest,
    rejectRequest,
  };
};
