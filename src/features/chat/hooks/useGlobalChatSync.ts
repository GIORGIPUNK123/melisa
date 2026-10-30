import { useEffect } from 'react';
import { supabase } from '../../../db/supabase';
import { useChatStore } from '../../../store/useChatStore'; // Adjust path to your store if needed
import { useSound } from 'react-sounds';

export const useGlobalChatSync = (userId: string | undefined) => {
  const { play } = useSound('notification/notification');
  const { handleIncomingMessage, updateConversationMember } = useChatStore();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('global-app-sync')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMsg = payload.new;
          handleIncomingMessage(newMsg);
          if (newMsg.sender_id !== userId) {
            play();
          }
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'conversation_members' },
        (payload) => {
          const updated = payload.new;
          updateConversationMember(updated.conversation_id, {
            id: updated.user_id,
            lastReadAt: updated.last_read_at,
            lastMessageAt: updated.last_message_at,
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, handleIncomingMessage, updateConversationMember]);
};
