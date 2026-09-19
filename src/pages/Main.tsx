import { useNavigate } from 'react-router';
import { useCallback, useEffect, useState } from 'react';
import { Loading } from '../components/Loading';
import { useAdditionalInfo } from '../features/friends/hooks/useAdditionalInfo';
import { useAuth } from '../features/auth/hooks/useAuth';
import { Sidebar } from '../components/layout/Sidebar';
import { ChatInfo } from '../features/chat/components/ChatInfo';
import { useNotifications } from '../features/notifications/hooks/useNotifications';
import { useUnreadMessages } from '../features/chat/hooks/useUnreadMessages';
import { useAudioNotification } from '../features/notifications/hooks/useAudioNotification';
import { useModals } from '../shared/hooks/useModals';
import { useChatState } from '../features/chat/hooks/useChatState';
import { useCurrentUserProfile } from '../features/friends/hooks/useCurrentUserProfile';
import { useChatActions } from '../features/chat/hooks/useChatActions';
import { useNotificationSound } from '../features/notifications/hooks/useNotificationSound';
import { supabase } from '../db/supabase';
import { api } from '../api/instance';
import { ModalsContainer } from '../components/main/ModalsContainer';
import { UnlockWithPassword } from '../features/auth/components/UnlockWithPassword';
import { EmptyChatState } from '../features/chat/components/EmptyChatState';
import { ChatArea } from '../features/chat/components/ChatArea';
import { useHeartbeat } from '../features/notifications/hooks/useHeartbeat';
import { useConversations } from '../features/chat/hooks/useConversations';
import { useFriendsList } from '../features/friends/hooks/useFriendsList';
import { PublicProfileT } from '../types';

const EMPTY_MEMBERS: PublicProfileT[] = [];

export const Main = () => {
  const { user, authUnlock, authLogout, privateKey, isResolvingPrivateKey } =
    useAuth();
  const navigate = useNavigate();
  const [unlockPassword, setUnlockPassword] = useState('');
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleUnlock = async () => {
    if (unlocking || loggingOut || !unlockPassword) return;
    setUnlocking(true);
    setUnlockError(null);
    const ok = await authUnlock(unlockPassword);
    setUnlocking(false);
    if (!ok) {
      setUnlockError(
        'Wrong password for your encryption key. If you recently changed login password, try the previous one.',
      );
    } else setUnlockPassword('');

    try {
      void ensureMessageSoundEnabled?.();
      void ensureNotificationSound?.();
    } catch (err) {
      console.warn('Failed to prime audio on unlock:', err);
    }
  };

  const handleUnlockLogout = async () => {
    if (loggingOut || unlocking) return;
    setLoggingOut(true);
    setUnlockError(null);
    try {
      await authLogout();
      navigate('/login');
    } finally {
      setLoggingOut(false);
    }
  };

  const userId = user && user !== 'loading' ? user.id : undefined;

  const modals = useModals();
  const chatState = useChatState();
  const { profile, setProfile } = useCurrentUserProfile(userId);
  const { conversations, isLoading: conversationLoading, bumpConversation } =
    useConversations(userId);
  const membersForActiveChat =
    chatState.membersConversationId === chatState.activeConversationId
      ? chatState.conversationMembers
      : EMPTY_MEMBERS;
  const activeConversation = conversations.find(
    (conversation) => conversation.id === chatState.activeConversationId,
  );

  useAdditionalInfo(userId);
  const {
    notifications,
    isLoading: notificationsLoading,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useNotifications(userId);

  useHeartbeat(userId);

  const {
    playSound: playMessageSound,
    ensureEnabled: ensureMessageSoundEnabled,
  } = useAudioNotification(987, 0.32);
  const {
    playSound: playNotificationSound,
    ensureEnabled: ensureNotificationSound,
  } = useAudioNotification(784, 0.32);

  const { unreadCounts } = useUnreadMessages(
    userId,
    chatState.activeConversationId,
    playMessageSound,
  );

  useNotificationSound(notifications.length, playNotificationSound);

  const {
    friends,
    isLoading: friendsLoading,
    getOrCreateConversation,
    removeFriend,
    fetchFriends,
    isFriend,
  } = useFriendsList();

  const chatActions = useChatActions(
    userId,
    modals.openConfirmModal,
    chatState.clearActiveConversation,
    removeFriend,
    fetchFriends,
  );

  const visibleFriends = friends.filter(
    (friend) => !chatActions.hasBlock(friend.userId),
  );

  const handleMessageUser = useCallback(
    async (friendUserId: string) => {
      if (!userId || chatState.isOpeningConversation) return;

      const existingConversation = conversations.find(
        (conversation) => conversation.otherUserId === friendUserId,
      );
      if (existingConversation) {
        chatState.handleFriendSelect(existingConversation.id);
        return;
      }

      if (chatActions.hasBlock(friendUserId)) return;

      chatState.beginConversationTransition();

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;

        if (!token) return;

        const response = await api.get(
          `/friends/conversation/${friendUserId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const conversationId = response.data.conversationId;
        if (conversationId) {
          chatState.handleFriendSelect(conversationId);
        }
      } catch (err) {
        console.error('Failed to open conversation from profile:', err);
      } finally {
        chatState.endConversationTransition();
      }
    },
    [chatActions, chatState, conversations, userId],
  );

  useEffect(() => {
    if (user === null) navigate('/login');
  }, [user, navigate]);

  if (user === 'loading' || isResolvingPrivateKey) return <Loading />;

  if (user != null && privateKey == null) {
    return (
      <UnlockWithPassword
        unlockPassword={unlockPassword}
        setUnlockPassword={setUnlockPassword}
        unlockError={unlockError}
        unlocking={unlocking}
        handleUnlock={handleUnlock}
        onLogout={handleUnlockLogout}
        loggingOut={loggingOut}
      />
    );
  }

  if (user != null && privateKey != null) {
    return (
      <div className='flex h-[100dvh] w-full overflow-hidden bg-slate-900'>
        <ModalsContainer
          user={user}
          profile={profile}
          addFriendModalOpen={modals.addFriendModalOpen}
          closeAddFriendModal={modals.closeAddFriendModal}
          friendRequestsOpen={modals.friendRequestsOpen}
          closeFriendRequestsModal={modals.closeFriendRequestsModal}
          settingsOpen={modals.settingsOpen}
          closeSettingsModal={modals.closeSettingsModal}
          onProfileUpdated={setProfile}
          userProfileModalOpen={modals.userProfileModalOpen}
          selectedUsername={modals.selectedUsername}
          closeUserProfileModal={modals.closeUserProfileModal}
          onBlockUser={chatActions.handleBlockUser}
          onRemoveFriend={chatActions.handleRemoveFriend}
          onMessageUser={handleMessageUser}
          isBlocked={chatActions.isBlocked}
          hasBlock={chatActions.hasBlock}
          isFriend={isFriend}
          confirmModalOpen={modals.confirmModalOpen}
          confirmModalData={modals.confirmModalData}
          closeConfirmModal={modals.closeConfirmModal}
          notificationsModalOpen={modals.notificationsModalOpen}
          closeNotificationsModal={modals.closeNotificationsModal}
          notifications={notifications}
          onMarkNotificationAsRead={markNotificationAsRead}
          onMarkAllNotificationsAsRead={markAllNotificationsAsRead}
        />

        <Sidebar
          user={user}
          activeTab={chatState.activeTab}
          setActiveTab={chatState.setActiveTab}
          nickname={profile?.nickname}
          avatarUrl={profile?.avatar_url || null}
          notifications={notifications}
          notificationsLoading={notificationsLoading}
          onAddFriendClick={modals.openAddFriendModal}
          onFriendRequestsClick={modals.openFriendRequestsModal}
          onSettingsClick={modals.openSettingsModal}
          onNotificationsClick={modals.openNotificationsModal}
          onFriendSelect={chatState.selectConversationAndSwitchToChats}
          onViewProfile={modals.openUserProfileModal}
          activeConversationId={chatState.activeConversationId}
          isVisible={chatState.isSidebarVisible}
          onClose={chatState.closeSidebar}
          unreadCounts={unreadCounts}
          conversations={conversations}
          conversationLoading={conversationLoading}
          friends={visibleFriends}
          friendsLoading={friendsLoading}
          getOrCreateConversation={getOrCreateConversation}
          isBlocked={chatActions.isBlocked}
        />

        {!chatState.activeConversationId ? (
          <EmptyChatState />
        ) : (
          <ChatArea
            conversationId={chatState.activeConversationId}
            onToggleSidebar={chatState.toggleSidebar}
            onToggleChatInfo={chatState.toggleChatInfo}
            currentUserId={user.id}
            privateKey={privateKey}
            members={membersForActiveChat}
            conversationPreview={activeConversation}
            onConversationActivity={bumpConversation}
            onIncomingMessageSound={playMessageSound}
            isBlocked={chatActions.isBlocked}
            isBlockedBy={chatActions.isBlockedBy}
            onUnblockUser={chatActions.handleBlockUser}
          />
        )}

        {chatState.isChatInfoVisible && (
          <ChatInfo
            members={membersForActiveChat}
            onClose={chatState.closeChatInfo}
            onViewProfile={modals.openUserProfileModal}
            onBlockUser={chatActions.handleBlockUser}
            onRemoveFriend={chatActions.handleRemoveFriend}
            onDeleteChat={() =>
              chatActions.handleDeleteChat(chatState.activeConversationId)
            }
            isBlocked={chatActions.isBlocked}
            isFriend={isFriend}
          />
        )}
      </div>
    );
  }

  return null;
};
