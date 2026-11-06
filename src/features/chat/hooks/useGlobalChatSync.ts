import { useEffect } from 'react';
import { supabase } from '../../../db/supabase';
import { useChatStore } from '../../../store/useChatStore';
// import { useSound } from 'react-sounds';

export const useGlobalChatSync = (userId: string | undefined) => {
  // const { play } = useSound('notification/notification');
  const handleIncomingMessage = useChatStore(
    (state) => state.handleIncomingMessage,
  );
  const updateConversationMember = useChatStore(
    (state) => state.updateConversationMember,
  );

  useEffect(() => {
    console.log('[global sync] effect started', { userId });

    if (!userId) {
      console.log('[global sync] skipped: no user id');
      return;
    }

    // const playIfConversationIsUnmuted = async (
    //   conversationId: string | number,
    // ) => {
    //   const { data, error } = await supabase
    //     .from('conversation_members')
    //     .select('muted')
    //     .eq('conversation_id', conversationId)
    //     .eq('user_id', userId)
    //     .maybeSingle();

    //   if (error) {
    //     console.error('Failed to check conversation mute state:', error);
    //     return;
    //   }

    //   if (!data?.muted) play();
    // };

    const channel = supabase
      .channel(`global-app-sync-${userId}`)
      /* 1. Existing Message Listener */
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMsg = payload.new;
          console.log('[global sync] message inserted', newMsg);
          handleIncomingMessage(newMsg);
          if (newMsg.sender_id !== userId) {
            // void playIfConversationIsUnmuted(newMsg.conversation_id);
          }
        },
      )
      /* 2. Existing Conversation Member Listener */
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'conversation_members' },
        (payload) => {
          const updated = payload.new;
          console.log('[global sync] conversation member updated', updated);
          updateConversationMember(updated.conversation_id, {
            id: updated.user_id,
            lastReadAt: updated.last_read_at,
            lastMessageAt: updated.last_message_at,
          });
        },
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'message_reactions' },
        (payload) => {
          const newReaction = payload.new;
          console.log('[global sync] reaction inserted', newReaction);
          if (newReaction.user_id !== userId) {
            // void playIfConversationIsUnmuted(newReaction.conversation_id);
          }
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'message_reactions' },
        (payload) => {
          const updatedReaction = payload.new;
          console.log('[global sync] reaction updated', updatedReaction);
          if (updatedReaction.user_id !== userId) {
            // void playIfConversationIsUnmuted(updatedReaction.conversation_id);
          }
        },
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'message_reactions' },
        (payload) => {
          console.log('[global sync] reaction deleted', payload.old);
        },
      )
      .subscribe((status, error) => {
        console.log('[global sync] subscription status', { status, error });
      });

    return () => {
      console.log('[global sync] cleaning up channel');
      void supabase.removeChannel(channel);
    };
  }, [userId, handleIncomingMessage, updateConversationMember]);
};
