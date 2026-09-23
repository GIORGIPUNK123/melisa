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
      if (!options?.silent) setIsLoading(false);
    }
  }, []);

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
