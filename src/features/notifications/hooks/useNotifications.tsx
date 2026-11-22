import { useCallback, useEffect } from 'react';
import { supabase } from '../../../db/supabase';
import { NotificationT } from '../../../types';
import { useNotificationStore } from '../../../store/useNotificationStore';

/**
 * Standalone fetch so a panel can refresh the list without mounting a second
 * realtime subscription.
 */
export const fetchNotificationsForUser = async (
  userId: string,
  options?: { silent?: boolean },
) => {
  if (!options?.silent) useNotificationStore.getState().setLoading(true);
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Failed to fetch notifications:', error);
    useNotificationStore.getState().setLoading(false);
    return;
  }
  useNotificationStore
    .getState()
    .setNotifications((data ?? []) as NotificationT[]);
};

/**
 * Loads notifications once and keeps the notification store in sync with
 * Supabase Realtime. Mount this once from the authenticated app shell.
 */
export const useNotificationsSync = (userId?: string) => {
  const fetchNotifications = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!userId) return;
      await fetchNotificationsForUser(userId, options);
    },
    [userId],
  );

  useEffect(() => {
    if (!userId) return;

    void fetchNotifications();

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const store = useNotificationStore.getState();
          if (payload.eventType === 'INSERT') {
            const notification = payload.new as NotificationT;
            store.upsertNotification(notification);
            store.showToast(notification);
          } else if (payload.eventType === 'UPDATE') {
            store.upsertNotification(payload.new as NotificationT);
          } else if (payload.eventType === 'DELETE') {
            store.removeNotification((payload.old as NotificationT).id);
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
      useNotificationStore.getState().setNotifications([]);
    };
  }, [userId, fetchNotifications]);

  return { fetchNotifications };
};
