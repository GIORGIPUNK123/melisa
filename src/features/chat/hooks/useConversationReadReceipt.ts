import { useEffect, type Dispatch, type SetStateAction } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../../db/supabase';
import { sameId } from '../../../shared/utils/ids';
import type { ConversationMemberT, MessageT } from '../../../types';

export const useConversationReadReceipt = (params: {
  conversationId: string | number;
  isAuthenticated: boolean;
  user: User | null;
  messages: MessageT[];
  membersRef: { current: ConversationMemberT[] };
  setConversationMembers: Dispatch<SetStateAction<ConversationMemberT[]>>;
}) => {
  const {
    conversationId,
    isAuthenticated,
    user,
    messages,
    membersRef,
    setConversationMembers,
  } = params;

  useEffect(() => {
    if (!isAuthenticated || !conversationId || !user || messages.length === 0) {
      return;
    }

    const latestMessage = messages[messages.length - 1];
    if (latestMessage.sender.id === user.id) return;

    const currentMember = membersRef.current.find((member) =>
      sameId(member.id, user.id),
    );
    if (
      !currentMember ||
      (currentMember.lastReadAt &&
        currentMember.lastReadAt >= latestMessage.createdAt)
    ) {
      return;
    }

    const now = new Date().toISOString();
    setConversationMembers((previous) => {
      const currentMember = previous.find((member) =>
        sameId(member.id, user.id),
      );
      if (
        !currentMember ||
        (currentMember.lastReadAt &&
          currentMember.lastReadAt >= latestMessage.createdAt)
      ) {
        return previous;
      }

      return previous.map((member) =>
        member.id === user.id ? { ...member, lastReadAt: now } : member,
      );
    });

    supabase
      .from('conversation_members')
      .update({ last_read_at: now })
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .then(({ error }) => {
        if (error) console.error('Failed to update last_read_at:', error);
      });
  }, [
    messages,
    conversationId,
    user,
    isAuthenticated,
    membersRef,
    setConversationMembers,
  ]);
};
