import type { User } from '@supabase/supabase-js';
import type { Dispatch, SetStateAction } from 'react';
import { supabase } from '../../../db/supabase';
import type { ConversationMemberT } from '../../../types';

export const useConversationMute = (params: {
  conversationId: string | number;
  isAuthenticated: boolean;
  user: User | null;
  conversationMembers: ConversationMemberT[];
  setConversationMembers: Dispatch<SetStateAction<ConversationMemberT[]>>;
  updateConversationMember: (
    conversationId: string | number,
    updates: Partial<ConversationMemberT>,
  ) => void;
}) => {
  const {
    conversationId,
    isAuthenticated,
    user,
    conversationMembers,
    setConversationMembers,
    updateConversationMember,
  } = params;

  const toggleMute = async () => {
    if (!isAuthenticated || !user) return;

    const currentMember = conversationMembers.find(
      (member) => member.id === user.id,
    );
    const newMutedState = !currentMember?.muted;

    setConversationMembers((previous) =>
      previous.map((member) =>
        member.id === user.id ? { ...member, muted: newMutedState } : member,
      ),
    );
    updateConversationMember(conversationId, {
      id: user.id,
      muted: newMutedState,
    });

    try {
      const { error } = await supabase
        .from('conversation_members')
        .update({ muted: newMutedState })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to toggle mute:', error);
      setConversationMembers((previous) =>
        previous.map((member) =>
          member.id === user.id
            ? { ...member, muted: !newMutedState }
            : member,
        ),
      );
      updateConversationMember(conversationId, {
        id: user.id,
        muted: !newMutedState,
      });
    }
  };

  return { toggleMute };
};
