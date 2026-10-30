import { useEffect } from 'react';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useChatStore } from '../store/useChatStore';
import { TestSidebar } from './TestSidebar';
import { ChatArea } from '../features/chat/components/ChatArea';

export const ChatsPanel = () => {
  const { user, privateKey, isLoadingSession } = useAuth();
  const { conversations, isLoading, fetchConversations, activeConversationId } =
    useChatStore();

  useEffect(() => {
    if (user) {
      fetchConversations(user.id);
    }
  }, [user, fetchConversations]);

  // Handle session loading and chat loading cleanly together
  if (isLoadingSession || isLoading) {
    return <div className='flex w-full h-full'>Loading...</div>;
  }

  // Handle unauthenticated states or locked private keys
  if (!user || !privateKey) {
    return (
      <div className='flex w-full h-full'>
        Please log in and unlock your private key.
      </div>
    );
  }

  const activeConversation = conversations.find(
    (conv) => conv.id === activeConversationId,
  );

  console.log('conversations', conversations);

  return (
    <div className='flex w-full h-full'>
      {/* sidebar */}
      <TestSidebar
        currentUserId={user?.id}
        conversations={conversations}
        isLoading={isLoading}
      />
      {/* chatArea */}
      <ChatArea conversation={activeConversation} />
    </div>
  );
};
