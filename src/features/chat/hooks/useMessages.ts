import { useAuth } from '../../auth/hooks/useAuth';
import { useChatStore } from '../../../store/useChatStore';
import { useConversationMessages } from './useConversationMessages';
import { useConversationReadReceipt } from './useConversationReadReceipt';
import { useChatFileActions } from './useChatFileActions';
import { useSendMessage } from './useSendMessage';
import { useConversationMute } from './useConversationMute';

export const useMessages = (conversationId: string | number) => {
  const { user, privateKey, isLoadingSession, profile } = useAuth();
  const isAuthenticated = user !== null && isLoadingSession === false;
  const updateConversationMember = useChatStore(
    (state) => state.updateConversationMember,
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
    membersRef: conversation.membersRef,
    setConversationMembers: conversation.setConversationMembers,
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
    conversationMembers: conversation.conversationMembers,
    setConversationMembers: conversation.setConversationMembers,
    updateConversationMember,
  });

  return {
    conversationMembers: conversation.conversationMembers,
    messages: conversation.messages,
    openChatFile,
    sendMessage,
    toggleMute,
  };
};
