import { useEffect } from 'react';
import { supabase } from '../db/supabase';

export const useMessageNotifications = (
  userId: string | undefined,
  lastMessageId: string | null,
  setLastMessageId: (id: string) => void,
  playSound: () => void,
) => {
  useEffect(() => {
    if (!userId) return;

    const ensureRealtimeAuth = async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (token) {
        supabase.realtime.setAuth(token);
      }
    };

    void ensureRealtimeAuth();

    console.log('[useMessageNotifications] subscribing for userId=', userId);
    const channel = supabase
      .channel('all_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload: any) => {
          console.log('[useMessageNotifications] payload received:', payload);
          const newMessage = payload.new;

          if (!newMessage) return;

          const shouldPlay = newMessage.sender_id !== userId && newMessage.id !== lastMessageId;
          console.log('[useMessageNotifications] shouldPlay=', shouldPlay);

          if (shouldPlay) {
            try {
              setLastMessageId(newMessage.id);
              console.log('[useMessageNotifications] playing sound for message', newMessage.id);
              playSound();
            } catch (err) {
              console.error('Error while attempting to play message sound:', err);
            }
          }
        },
      )
      .subscribe();
    
    // Polling fallback: check latest message every 5s in case realtime doesn't arrive
    let intervalId: number | null = null;
    const startPolling = () => {
      intervalId = window.setInterval(async () => {
        try {
          const { data: latest, error } = await supabase
            .from('messages')
            .select('id, sender_id, created_at')
            .order('created_at', { ascending: false })
            .limit(1);

          if (error) {
            console.warn('Polling latest message error:', error);
            return;
          }

          const row = (latest && latest[0]) as any | undefined;
          if (!row) return;

          if (row.id !== lastMessageId && row.sender_id !== userId) {
            console.log('[useMessageNotifications] polling detected new message', row.id);
            setLastMessageId(row.id);
            try {
              playSound();
            } catch (err) {
              console.error('Error playing sound from poll:', err);
            }
          }
        } catch (err) {
          console.error('Polling failed:', err);
        }
      }, 5000);
    };

    startPolling();

    return () => {
      supabase.removeChannel(channel);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [userId, lastMessageId, setLastMessageId, playSound]);
};
