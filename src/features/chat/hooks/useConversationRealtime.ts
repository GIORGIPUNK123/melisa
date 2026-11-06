import { useEffect, useRef } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../../../db/supabase';

type ConversationRealtimeOptions = {
  conversationId: string | number;
  userId: string | undefined;
  enabled: boolean;
  onMessage: (message: any) => void | Promise<void>;
  onBroadcastMessage?: (message: any) => void | Promise<void>;
  onMemberUpdate: (member: any) => void;
};

export const useConversationRealtime = ({
  conversationId,
  userId,
  enabled,
  onMessage,
  onBroadcastMessage,
  onMemberUpdate,
}: ConversationRealtimeOptions) => {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const handlersRef = useRef({
    onMessage,
    onBroadcastMessage,
    onMemberUpdate,
  });
  handlersRef.current = {
    onMessage,
    onBroadcastMessage,
    onMemberUpdate,
  };

  useEffect(() => {
    if (!enabled || !userId || !conversationId) return;

    let isMounted = true;
    const channel = supabase
      .channel(`room-${conversationId}`, {
        config: { broadcast: { self: false } },
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          void handlersRef.current.onMessage(payload.new);
        },
      )
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        if (!payload?.message) return;
        void handlersRef.current.onMessage(payload.message);
        void handlersRef.current.onBroadcastMessage?.(payload.message);
      })
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversation_members',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          handlersRef.current.onMemberUpdate(payload.new);
        },
      );

    channelRef.current = channel;

    void supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      const token = data.session?.access_token;
      if (token) supabase.realtime.setAuth(token);

      channel.subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('Failed to subscribe to chat updates:', status);
        }
      });
    });

    return () => {
      isMounted = false;
      channelRef.current = null;
      void supabase.removeChannel(channel);
    };
  }, [conversationId, userId, enabled]);

  return channelRef;
};
