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
          const newMessage = payload.new;

          if (
            newMessage.sender_id !== userId &&
            newMessage.id !== lastMessageId
          ) {
            setLastMessageId(newMessage.id);
            playSound();
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, lastMessageId]);
};
