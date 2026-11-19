import { create } from 'zustand';
import { supabase } from '../db/supabase';
import { NotificationT } from '../types';

interface NotificationStore {
  notifications: NotificationT[];
  isLoading: boolean;
  toast: NotificationT | null;
  setNotifications: (notifications: NotificationT[]) => void;
  setLoading: (isLoading: boolean) => void;
  upsertNotification: (notification: NotificationT) => void;
  removeNotification: (id: string) => void;
  showToast: (notification: NotificationT) => void;
  dismissToast: () => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
}

const byNewest = (a: NotificationT, b: NotificationT) =>
  new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  isLoading: false,
  toast: null,

  setNotifications: (notifications) =>
    set({ notifications: [...notifications].sort(byNewest), isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),

  upsertNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications.filter((n) => n.id !== notification.id)].sort(
        byNewest,
      ),
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  showToast: (notification) => set({ toast: notification }),
  dismissToast: () => set({ toast: null }),

  markAsRead: async (id) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    if (error) {
      console.error('Failed to mark notification as read:', error);
      return;
    }
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n,
      ),
      toast: state.toast?.id === id ? { ...state.toast, is_read: true } : state.toast,
    }));
  },

  markAllAsRead: async (userId) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    if (error) {
      console.error('Failed to mark all notifications as read:', error);
      return;
    }
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
      toast: state.toast ? { ...state.toast, is_read: true } : null,
    }));
  },
}));
