import { useCallback, useEffect, useState } from 'react';
import { api } from '../../../api/instance';
import { supabase } from '../../../db/supabase';

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

  const fetchRequests = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) setIsLoading(true);
    try {
      const response = await api.get('/friends/pending');

      setSentRequests(response.data.sent || []);
      setReceivedRequests(response.data.received || []);
    } catch (err) {
      console.error('Failed to fetch pending requests:', err);
    } finally {
      if (!options?.silent) setIsLoading(false);
    }
  }, []);

  const cancelRequest = async (friendshipId: string) => {
    try {
      await api.delete(`/friends/request/${friendshipId}`);

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
      await api.post(`/friends/request/${friendshipId}/accept`, {});

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
      await api.delete(`/friends/request/${friendshipId}/reject`);

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
    void fetchRequests();

    const channel = supabase
      .channel('friend-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friendships',
        },
        () => {
          void fetchRequests({ silent: true });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [fetchRequests]);

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
