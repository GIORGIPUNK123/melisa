import { useEffect } from 'react';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useChatStore } from '../store/useChatStore';
import { TestSidebar } from './TestSidebar';
import { fetchConversations } from '../features/chat/utils/conversationFunctions';
import { supabase } from '../db/supabase';

export const ChatsPanel = (props: { onlineUserIds: Set<string> }) => {
  const { user } = useAuth();
  const { conversations, isLoading, setConversations, activeConversationId } =
    useChatStore();

  useEffect(() => {
    const loadConversations = async () => {
      const data = await fetchConversations(supabase, user!.id);
      setConversations(data);
    };

    loadConversations();
  }, [user]);

  const activeConversation = conversations.find(
    (conv) => conv.id === activeConversationId,
  );

  return (
    <TestSidebar
      currentUserId={user?.id}
      conversations={conversations}
      isLoading={isLoading}
      className={activeConversation ? 'hidden xl:flex' : 'flex'}
      showTabs={true}
      activeTab='messages'
      onlineUserIds={props.onlineUserIds}
    />
  );
};
