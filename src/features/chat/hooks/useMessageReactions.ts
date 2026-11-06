import { useEffect } from 'react';
import { MessageReactionT } from '../../../types';
import { useReactionStore } from '../../../store/useReactionStore';
import { supabase } from '../../../db/supabase';
import {
  addReaction,
  fetchReactionCatalog,
  fetchReactionsForConversation,
  removeReaction,
} from '../utils/reactionFunctions';

export const useMessageReactions = (
  conversationId: number | null | undefined,
  currentUserId: string,
) => {
  const catalog = useReactionStore((state) => state.catalog);
  const setCatalog = useReactionStore((state) => state.setCatalog);
  const reactions = useReactionStore((state) => state.reactions);
  const setReactions = useReactionStore((state) => state.setReactions);

  // Pull the clean helper actions from the store
  const addReactionToStore = useReactionStore((state) => state.addReaction);
  const removeReactionFromStore = useReactionStore(
    (state) => state.removeReaction,
  );
  const removeReactionByDetails = useReactionStore(
    (state) => state.removeReactionByDetails,
  );

  useEffect(() => {
    const loadReactionData = async () => {
      if (catalog.length === 0) {
        setCatalog(await fetchReactionCatalog(supabase));
      }
      if (conversationId) {
        setReactions(
          await fetchReactionsForConversation(supabase, conversationId),
        );
      }
    };

    loadReactionData();
  }, [catalog.length, conversationId, setCatalog, setReactions]);

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`reactions-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_reactions',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          addReactionToStore(payload.new as MessageReactionT);
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'message_reactions',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          addReactionToStore(payload.new as MessageReactionT);
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'message_reactions',
        },
        (payload) => {
          const incoming = payload.old as { id: string | number };
          removeReactionFromStore(incoming.id);
        },
      )
      .subscribe((status, error) => {
        console.log('[reactions] subscription status', {
          conversationId,
          status,
          error,
        });
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, addReactionToStore, removeReactionFromStore]);

  if (!conversationId || !currentUserId) {
    return {
      catalog: [],
      reactions: [],
      toggleReaction: () => undefined,
    };
  }

  const toggleReaction = (
    userId: string,
    convId: number,
    messageId: string,
    reactionId: string,
  ) => {
    if (!userId || !convId || !messageId || !reactionId) {
      throw new Error('All parameters are required for toggling a reaction');
    }

    const reactionExists = reactions.some(
      (reaction) =>
        reaction.message_id === messageId &&
        reaction.user_id === userId &&
        reaction.reaction_id === reactionId,
    );

    if (reactionExists) {
      removeReaction(supabase, messageId, convId, userId, reactionId);
      // Optimistic remove
      removeReactionByDetails(messageId, userId, reactionId);
    } else {
      addReaction(supabase, messageId, convId, userId, reactionId);
      addReactionToStore({
        id: `${messageId}-${userId}-${reactionId}`,
        message_id: messageId,
        conversation_id: convId,
        user_id: userId,
        reaction_id: reactionId,
        created_at: new Date().toISOString(),
      });
    }
  };

  return { catalog, reactions, toggleReaction };
};
