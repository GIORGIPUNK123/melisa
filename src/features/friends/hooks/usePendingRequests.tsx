import { useCallback, useEffect } from 'react';
import { api } from '../../../api/instance';
import { supabase } from '../../../db/supabase';
import { useRequestStore, PendingRequest } from '../../../store/useRequestStore';

/**
 * Standalone fetch so a panel can refresh the list without mounting a second
 * realtime subscription.
 */
export const fetchPendingRequests = async (options?: { silent?: boolean }) => {
  if (!options?.silent) useRequestStore.getState().setLoading(true);
  try {
    const response = await api.get('/friends/pending');
    useRequestStore
      .getState()
      .setRequests(response.data.sent || [], response.data.received || []);
  } catch (error) {
    console.error('Failed to fetch pending requests:', error);
    if (!options?.silent) useRequestStore.getState().setLoading(false);
  }
};

/**
 * Loads pending friend requests once and keeps the request store in sync with
 * Supabase Realtime. Mount this once from the authenticated app shell.
 */
export const usePendingRequestsSync = (userId?: string) => {
  const fetchRequests = useCallback(
    (options?: { silent?: boolean }) => fetchPendingRequests(options),
    [],
  );

  useEffect(() => {
    if (!userId) return;

    void fetchRequests();

    const channel = supabase
      .channel(`friend-requests:${userId}`)
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
      useRequestStore.getState().setRequests([], []);
    };
  }, [userId, fetchRequests]);

  return { fetchRequests };
};

export type { PendingRequest };
