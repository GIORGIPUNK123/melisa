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
    // <div className='flex overflow-hidden w-full min-w-0 h-full min-h-0'>
    <TestSidebar
      currentUserId={user?.id}
      conversations={conversations}
      isLoading={isLoading}
      className={activeConversation ? 'hidden xl:flex' : 'flex'}
      showTabs={true}
      activeTab='messages'
      onlineUserIds={props.onlineUserIds}
    />
    // {/* <ChatArea
    //   conversation={activeConversation}
    //   onBack={() => useChatStore.getState().setActiveConversationId(null)}
    //   className={activeConversation ? 'flex' : 'hidden xl:flex'}
    // /> */}
    // </div>
  );
};
