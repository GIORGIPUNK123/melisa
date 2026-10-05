import { useEffect } from 'react';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useChatStore } from '../store/useChatStore';
import { TestSidebar } from './TestSidebar';
import { ChatArea } from '../features/chat/components/ChatArea';

export const ChatsPanel = () => {
  const { user, privateKey } = useAuth();
  const { conversations, isLoading, fetchConversations, activeConversationId } =
    useChatStore();

  useEffect(() => {
    if (user && user !== 'loading') {
      fetchConversations(user.id);
    }
  }, [user, fetchConversations]);

  if (!user || !privateKey || user === 'loading' || isLoading) {
    return <div className='flex w-full h-full'>Loading...</div>;
  }

  const activeConversation = conversations.find(
    (conv) => conv.id === activeConversationId,
  );

  console.log('conversations', conversations);

  return (
    <div className='flex w-full h-full'>
      {/* sidebar */}
      <TestSidebar conversations={conversations} isLoading={isLoading} />
      {/* chatArea */}
      <ChatArea conversation={activeConversation} />
    </div>
  );
};
