import { useEffect, useRef } from 'react';
import { supabase } from '../../../db/supabase';
import { sameId } from '../../../shared/utils/ids';
import { useChatStore } from '../../../store/useChatStore';
import { useAudioNotification } from '../../notifications/hooks/useAudioNotification';
import type { ConversationMemberT } from '../../../types';

export const useGlobalChatSync = (userId: string | undefined) => {
  const handleIncomingMessage = useChatStore(
    (state) => state.handleIncomingMessage,
  );
  const updateConversationMember = useChatStore(
    (state) => state.updateConversationMember,
  );
  const setConversationLastMessageAt = useChatStore(
    (state) => state.setConversationLastMessageAt,
  );

  const { playSound } = useAudioNotification('notification/notification');
  const playSoundRef = useRef(playSound);
  playSoundRef.current = playSound;

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`global-app-sync-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const message = payload.new;
          handleIncomingMessage(message);

          // The open chat plays its own sound through the room channel.
          if (sameId(message.sender_id, userId)) return;

          const state = useChatStore.getState();
          if (
            document.visibilityState === 'visible' &&
            sameId(state.activeConversationId, message.conversation_id)
          ) {
            return;
          }

          const conversation = state.conversations.find((conv) =>
            sameId(conv.id, message.conversation_id),
          );
          if (conversation?.muted) return;

          void playSoundRef.current();
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'conversation_members' },
        (payload) => {
          const updated = payload.new;
          const updates: Partial<ConversationMemberT> = {
            id: updated.user_id,
          };
          if (updated.last_read_at) updates.lastReadAt = updated.last_read_at;
          if (updated.last_read_message_id != null)
            updates.lastReadMessageId = updated.last_read_message_id;
          if (updated.unread_count != null)
            updates.unreadCount = updated.unread_count;

          updateConversationMember(updated.conversation_id, updates);
          if (updated.last_message_at) {
            setConversationLastMessageAt(
              updated.conversation_id,
              updated.last_message_at,
            );
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [
    userId,
    handleIncomingMessage,
    updateConversationMember,
    setConversationLastMessageAt,
  ]);
};
