import { useEffect } from 'react';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useFriendsList } from '../features/friends/hooks/useFriendsList';
import { useChatStore } from '../store/useChatStore';
import { fetchConversations } from '../features/chat/utils/conversationFunctions';
import { supabase } from '../db/supabase';
import { TestSidebar } from './TestSidebar';
import { ChatArea } from '../features/chat/components/ChatArea';
import { useFriendStore } from '../store/useFriendStore';
import { getOrCreateConversationApi } from '../features/friends/utils/friendsFunctions';

export const FriendsPanel = (props: { onlineUserIds: Set<string> }) => {
  const { user } = useAuth();
  const { isLoading: isLoadingFriends } = useFriendsList(user?.id);

  const {
    conversations,
    isLoading: isLoadingChats,
    setConversations,
    activeConversationId,
  } = useChatStore();
  const friends = useFriendStore((state) => state.friends);
  const handleFriendClick = async (conversationId: number) => {
    try {
      useChatStore.getState().setActiveConversationId(conversationId);
      // const conversation = await getOrCreateConversationApi(friendId);
      // if (conversation) {
      //   useChatStore.getState().setActiveConversationId(parseInt(conversation));
      // }
    } catch (error) {
      console.error('Error getting or creating conversation:', error);
    }
  };
  useEffect(() => {
    let isMounted = true;
    const loadConversations = async () => {
      if (!user) return;
      // Skip fetching if conversations already exist in store
      if (useChatStore.getState().conversations.length > 0) return;

      const data = await fetchConversations(supabase, user.id);
      if (isMounted) {
        setConversations(data);
      }
    };
    loadConversations();
    return () => {
      isMounted = false;
    };
  }, [user, setConversations]);

  const activeConversation = conversations.find(
    (conv) => conv.id === activeConversationId,
  );

  return (
    // <div className='flex overflow-hidden w-full min-w-0 h-full min-h-0'>
    <TestSidebar
      title='Friends'
      currentUserId={user?.id}
      conversations={conversations}
      friends={friends}
      isLoading={isLoadingFriends} // Only rely on friends loading state here
      className={activeConversation ? 'hidden xl:flex' : 'flex'}
      showTabs={false}
      activeTab='friends'
      handleFriendClick={handleFriendClick}
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
