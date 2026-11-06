import type { SupabaseClient } from '@supabase/supabase-js';
import { MessageReactionT, ReactionTypeT } from '../../../types';

const REACTION_CATALOG_COLUMNS = 'uid, reaction, name';

export const fetchReactionCatalog = async (
  supabase: SupabaseClient,
): Promise<ReactionTypeT[]> => {
  try {
    const { data, error } = await supabase
      .from('reactions')
      .select(REACTION_CATALOG_COLUMNS);

    if (error) throw error;
    return (data || []) as ReactionTypeT[];
  } catch (err) {
    console.error('Failed to fetch reaction catalog:', err);
    return [];
  }
};

export const fetchReactionsForConversation = async (
  supabase: SupabaseClient,
  conversationId: number,
): Promise<MessageReactionT[]> => {
  try {
    const { data, error } = await supabase
      .from('message_reactions')
      .select('*')
      .eq('conversation_id', conversationId);

    if (error) throw error;
    return (data || []) as MessageReactionT[];
  } catch (err) {
    console.error('Failed to fetch reactions for conversation:', err);
    return [];
  }
};

export const addReaction = async (
  supabase: SupabaseClient,
  msgId: string,
  convId: number,
  userId: string,
  reactionId: string,
): Promise<void> => {
  try {
    const { data: existing, error: fetchError } = await supabase
      .from('message_reactions')
      .select('id')
      .match({
        message_id: msgId,
        conversation_id: convId,
        user_id: userId,
        reaction_id: reactionId,
      })
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (!existing) {
      const { error: insertError } = await supabase
        .from('message_reactions')
        .insert({
          message_id: msgId,
          conversation_id: convId,
          user_id: userId,
          reaction_id: reactionId,
        });

      if (insertError) throw insertError;
    }
  } catch (err) {
    console.error('Failed to add reaction:', err);
  }
};

export const removeReaction = async (
  supabase: SupabaseClient,
  msgId: string,
  convId: number,
  userId: string,
  reactionId: string,
): Promise<void> => {
  try {
    const { error } = await supabase.from('message_reactions').delete().match({
      message_id: msgId,
      conversation_id: convId,
      user_id: userId,
      reaction_id: reactionId,
    });

    if (error) throw error;
  } catch (err) {
    console.error('Failed to remove reaction:', err);
  }
};
