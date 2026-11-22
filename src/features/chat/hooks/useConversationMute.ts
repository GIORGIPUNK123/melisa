import type { User } from '@supabase/supabase-js';
import { supabase } from '../../../db/supabase';

export const useConversationMute = (params: {
  conversationId: string | number;
  isAuthenticated: boolean;
  user: User | null;
  isMuted: boolean;
  setConversationMuted: (
    conversationId: string | number,
    muted: boolean,
  ) => void;
}) => {
  const {
    conversationId,
    isAuthenticated,
    user,
    isMuted,
    setConversationMuted,
  } = params;

  const toggleMute = async () => {
    if (!isAuthenticated || !user) return;

    const previousMutedState = isMuted;
    const newMutedState = !previousMutedState;

    setConversationMuted(conversationId, newMutedState);

    try {
      if (newMutedState) {
        const { error } = await supabase.from('conversation_mutes').upsert(
          {
            conversation_id: conversationId,
            user_id: user.id,
          },
          { onConflict: 'conversation_id,user_id' },
        );

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('conversation_mutes')
          .delete()
          .eq('conversation_id', conversationId)
          .eq('user_id', user.id);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Failed to toggle mute:', error);
      setConversationMuted(conversationId, previousMutedState);
    }
  };

  return { toggleMute };
};
