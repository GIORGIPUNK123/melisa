import { useCallback } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  selectIsConversationMuted,
  useChatStore,
} from '../../../store/useChatStore';
import type { ConversationMemberT } from '../../../types';
import { useConversationMessages } from './useConversationMessages';
import { useConversationReadReceipt } from './useConversationReadReceipt';
import { useChatFileActions } from './useChatFileActions';
import { useSendMessage } from './useSendMessage';
import { useConversationMute } from './useConversationMute';

export const useMessages = (conversationId: string | number) => {
  const { user, privateKey, isLoadingSession, profile } = useAuth();
  const isAuthenticated = user !== null && isLoadingSession === false;
  const isMuted = useChatStore(selectIsConversationMuted(conversationId));
  const setConversationMuted = useChatStore(
    (state) => state.setConversationMuted,
  );
  const updateConversationMember = useChatStore(
    (state) => state.updateConversationMember,
  );
  const userId = user?.id;
  const markAsRead = useCallback(
    (updates: Partial<ConversationMemberT>) => {
      if (!userId) return;
      updateConversationMember(conversationId, {
        id: userId,
        ...updates,
      });
    },
    [conversationId, userId, updateConversationMember],
  );
  const conversation = useConversationMessages(
    conversationId,
    user,
    privateKey,
    isAuthenticated,
  );

  useConversationReadReceipt({
    conversationId,
    isAuthenticated,
    user,
    messages: conversation.messages,
    setConversationMembers: conversation.setConversationMembers,
    markAsRead,
  });

  const { openChatFile } = useChatFileActions({
    isAuthenticated,
    privateKey,
    user,
    conversationMembers: conversation.conversationMembers,
  });
  const { sendMessage } = useSendMessage({
    conversationId,
    isAuthenticated,
    privateKey,
    user,
    profile,
    conversationMembers: conversation.conversationMembers,
    setMessages: conversation.setMessages,
    roomChannelRef: conversation.roomChannelRef,
  });
  const { toggleMute } = useConversationMute({
    conversationId,
    isAuthenticated,
    user,
    isMuted,
    setConversationMuted,
  });

  return {
    conversationMembers: conversation.conversationMembers,
    messages: conversation.messages,
    openChatFile,
    sendMessage,
    toggleMute,
  };
};
