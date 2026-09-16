import { useEffect, useRef } from 'react';
import { supabase } from '../../../db/supabase';

export const useMessageNotifications = (
  userId: string | undefined,
  activeConversationId: string | null | undefined,
  playSound: () => void,
) => {
  const playSoundRef = useRef(playSound);
  playSoundRef.current = playSound;

  const activeConversationIdRef = useRef(activeConversationId);
  activeConversationIdRef.current = activeConversationId;

  const lastPlayedIdRef = useRef<string | null>(null);

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

    const channel = supabase
      .channel('all_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMessage = payload.new as {
            id?: string;
            sender_id?: string;
            conversation_id?: string;
          };

          if (!newMessage?.id) return;
          if (newMessage.sender_id === userId) return;
          if (newMessage.id === lastPlayedIdRef.current) return;

          lastPlayedIdRef.current = newMessage.id;
          void playSoundRef.current();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);
};
