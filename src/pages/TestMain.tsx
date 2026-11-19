import { Outlet, useLocation } from 'react-router';
import { AppSidebar } from '../features/workspace/sidebar/appSidebar/AppSidebar';
import { useChatStore } from '../store/useChatStore';
import { supabase } from '../db/supabase';
import { fetchConversations } from '../features/chat/utils/conversationFunctions';
import { useEffect } from 'react';
import { useAuth } from '../features/auth/hooks/useAuth';
import { ChatArea } from '../features/chat/components/ChatArea';

export const TestMain = (props: { onlineUserIds: Set<string> }) => {
  const { user } = useAuth();
  const path = useLocation().pathname;
  const { conversations, setConversations, activeConversationId } =
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
    <div className='flex-col-reverse xl:flex-row relative flex w-full h-full min-w-0 overflow-hidden bg-[#080D14]'>
      <div className={`${activeConversationId && 'hidden'} xl:flex`}>
        <AppSidebar />
      </div>

      {/* <main className='flex overflow-hidden flex-1 min-w-0 min-h-0'> */}
      <div className='flex overflow-hidden w-full min-w-0 h-full min-h-0'>
        <Outlet />
        {path !== '/settings' && (
          <ChatArea
            conversation={activeConversation}
            onBack={() => useChatStore.getState().setActiveConversationId(null)}
            className={activeConversation ? 'flex' : 'hidden xl:flex'}
            onlineUserIds={props.onlineUserIds}
          />
        )}
      </div>
      {/* </main> */}
    </div>
  );
};
