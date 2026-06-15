import { useNavigate } from 'react-router';
import { useCallback, useEffect, useState } from 'react';
import { Loading } from './Loading';
import { useAdditionalInfo } from '../hooks/useAdditionalInfo';
import { useAuth } from '../hooks/useAuth';
import { Sidebar } from './layout/Sidebar';
import { ChatInfo } from './layout/ChatInfo';
import { useNotifications } from '../hooks/useNotifications';
import { useUnreadMessages } from '../hooks/useUnreadMessages';
import { useAudioNotification } from '../hooks/useAudioNotification';
import { useModals } from '../hooks/useModals';
import { useChatState } from '../hooks/useChatState';
import { useCurrentUserProfile } from '../hooks/useCurrentUserProfile';
import { useChatActions } from '../hooks/useChatActions';
import { useNotificationSound } from '../hooks/useNotificationSound';
import { supabase } from '../db/supabase';
import { api } from '../functions/instance';
import { ModalsContainer } from './main/ModalsContainer';
import { UnlockWithPassword } from './UnlockWithPassword';
import { EmptyChatState } from './chat/EmptyChatState';
import { Test } from './layout/Test';
import { useHeartbeat } from '../hooks/useHeartbeat';

export const Main = () => {
  const { user, authUnlock, privateKey } = useAuth();
  const navigate = useNavigate();
  const [unlockPassword, setUnlockPassword] = useState('');
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  const handleUnlock = async () => {
    if (unlocking || !unlockPassword) return;
    setUnlocking(true);
    setUnlockError(null);
    const ok = await authUnlock(unlockPassword);
    setUnlocking(false);
    if (!ok) setUnlockError('Invalid password');
    else setUnlockPassword('');
    // Try to prime/resume AudioContext via this user gesture (unlock)
    try {
      void ensureMessageSoundEnabled?.();
      void ensureNotificationSound?.();
    } catch (err) {
      console.warn('Failed to prime audio on unlock:', err);
    }
  };

  const userId = user && user !== 'loading' ? user.id : undefined;

  // Custom hooks for state management
  const modals = useModals();
  const chatState = useChatState();
  const { profile, setProfile } = useCurrentUserProfile(userId);
  // Data hooks
  useAdditionalInfo(userId);
  const {
    notifications,
    isLoading: notificationsLoading,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useNotifications(userId);
  const { unreadCounts } = useUnreadMessages(
    userId,
    chatState.activeConversationId,
  );

  // use Heartbeat to update user's last_seen_at and manage presence
  useHeartbeat(userId);

  // Audio notifications
  const { ensureEnabled: ensureMessageSoundEnabled } = useAudioNotification(
    800,
    0.3,
  );
  const {
    playSound: playNotificationSound,
    ensureEnabled: ensureNotificationSound,
  } = useAudioNotification(600, 0.5);

  // Message and notification handlers
  useNotificationSound(notifications.length, playNotificationSound);

  // Chat actions
  const chatActions = useChatActions(
    userId,
    modals.openConfirmModal,
    chatState.clearActiveConversation,
  );

  const handleMessageUser = useCallback(
    async (friendUserId: string) => {
      if (!userId || chatState.isOpeningConversation) return;

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
    [chatState, userId],
  );

  useEffect(() => {
    if (user === null) navigate('/login');
  }, [user, navigate]);

  if (user === 'loading') {
    return <Loading />;
  }

  if (user != null && privateKey == null) {
    return (
      <UnlockWithPassword
        unlockPassword={unlockPassword}
        setUnlockPassword={setUnlockPassword}
        unlockError={unlockError}
        unlocking={unlocking}
        handleUnlock={handleUnlock}
      />
    );
  }
  if (user != null && privateKey != null) {
    return (
      <div className='flex w-screen h-screen bg-slate-900'>
        {/* All Modals */}
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
          onMessageUser={handleMessageUser}
          confirmModalOpen={modals.confirmModalOpen}
          confirmModalData={modals.confirmModalData}
          closeConfirmModal={modals.closeConfirmModal}
          notificationsModalOpen={modals.notificationsModalOpen}
          closeNotificationsModal={modals.closeNotificationsModal}
          notifications={notifications}
          onMarkNotificationAsRead={markNotificationAsRead}
          onMarkAllNotificationsAsRead={markAllNotificationsAsRead}
        />

        {/* Sidebar */}
        <Sidebar
          user={user}
          activeTab={chatState.activeTab}
          setActiveTab={chatState.setActiveTab}
          nickname={profile?.nickname}
          avatarUrl={profile?.avatar_url || null}
          // presenceById={presenceById}
          // ensureTargetSubscription={ensureTargetSubscription}
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
        />

        {/* Main Chat Area */}

        {!chatState.activeConversationId ? (
          <EmptyChatState />
        ) : (
          <Test
            onToggleSidebar={chatState.toggleSidebar}
            onToggleChatInfo={chatState.toggleChatInfo}
            conversationId={chatState.activeConversationId}
            currentUserId={user?.id}
          />
          // <ChatArea
          //   conversationId={chatState.activeConversationId}
          //   onMembersChange={chatState.handleMembersChange}
          //   onToggleChatInfo={chatState.toggleChatInfo}
          //   onToggleSidebar={chatState.toggleSidebar}
          //   privateKey={privateKey}
          //   // presenceById={presenceById}
          //   // ensureTargetSubscription={ensureTargetSubscription}
          //   onIncomingMessage={handleIncomingMessage}
          // />
        )}
        {/* Right Sidebar - Chat Info */}
        {chatState.isChatInfoVisible && (
          <ChatInfo
            members={chatState.conversationMembers}
            onClose={chatState.closeChatInfo}
            onViewProfile={modals.openUserProfileModal}
            onBlockUser={chatActions.handleBlockUser}
            onDeleteChat={() =>
              chatActions.handleDeleteChat(chatState.activeConversationId)
            }
          />
        )}
      </div>
    );
  }

  return null;
};
