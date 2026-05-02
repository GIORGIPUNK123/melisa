import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { Loading } from './Loading';
import { useAdditionalInfo } from '../hooks/useAdditionalInfo';
import { useAuth } from '../hooks/useAuth';
import { Sidebar } from './layout/Sidebar';
import { ChatArea } from './layout/ChatArea';
import { ChatInfo } from './layout/ChatInfo';
import { useNotifications } from '../hooks/useNotifications';
import { useUnreadMessages } from '../hooks/useUnreadMessages';
import { useAudioNotification } from '../hooks/useAudioNotification';
import { useModals } from '../hooks/useModals';
import { useChatState } from '../hooks/useChatState';
import { useCurrentUserProfile } from '../hooks/useCurrentUserProfile';
import { useChatActions } from '../hooks/useChatActions';
import { useNotificationSound } from '../hooks/useNotificationSound';
import { ModalsContainer } from './main/ModalsContainer';

export const Main = () => {
  const { user, authUnlock, privateKey } = useAuth();
  const navigate = useNavigate();
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  const [unlockPassword, setUnlockPassword] = useState('');
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  const userId = user && user !== 'loading' ? user.id : undefined;

  // Custom hooks for state management
  const modals = useModals();
  const chatState = useChatState();
  const { profile, setProfile } = useCurrentUserProfile(userId);

  // Data hooks
  useAdditionalInfo(userId);
  const { notifications, isLoading: notificationsLoading } =
    useNotifications(userId);
  const { unreadCounts } = useUnreadMessages(
    userId,
    chatState.activeConversationId,
  );

  // Audio notifications
  const {
    playSound: playMessageSound,
    ensureEnabled: ensureMessageSoundEnabled,
  } = useAudioNotification(800, 0.3);
  const { playSound: playNotificationSound, ensureEnabled: ensureNotificationSound } = useAudioNotification(600, 0.5);

  // Message and notification handlers
  useNotificationSound(notifications.length, playNotificationSound);

  // Chat actions
  const chatActions = useChatActions(
    userId,
    modals.openConfirmModal,
    chatState.clearActiveConversation,
  );

  useEffect(() => {
    if (user === null) navigate('/login');
  }, [user, navigate]);

  if (user === 'loading') {
    return <Loading />;
  }

  if (user != null && privateKey == null) {
    return (
      <div className='flex items-center justify-center w-screen h-screen bg-slate-900'>
        <div className='p-6 bg-slate-800 rounded shadow'>
          <h3 className='text-white mb-3'>Unlock your private key</h3>
          <input
            type='password'
            placeholder='Enter password'
            value={unlockPassword}
            onChange={(e) => setUnlockPassword(e.target.value)}
            className='w-full p-2 mb-3 rounded'
            autoFocus
          />
          <div className='flex gap-2'>
            <button
              onClick={async () => {
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
              }}
              disabled={unlocking || !unlockPassword}
              className='px-3 py-2 bg-blue-600 text-white rounded'
            >
              {unlocking ? 'Unlocking...' : 'Unlock'}
            </button>
          </div>
          {unlockError && (
            <div className='mt-2 text-red-400'>{unlockError}</div>
          )}
        </div>
      </div>
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
          confirmModalOpen={modals.confirmModalOpen}
          confirmModalData={modals.confirmModalData}
          closeConfirmModal={modals.closeConfirmModal}
          notificationsModalOpen={modals.notificationsModalOpen}
          closeNotificationsModal={modals.closeNotificationsModal}
          notifications={notifications}
          onMarkNotificationAsRead={chatActions.handleMarkNotificationAsRead}
          onMarkAllNotificationsAsRead={
            chatActions.handleMarkAllNotificationsAsRead
          }
        />

        {/* Sidebar */}
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
        />

        {/* Main Chat Area */}
        <ChatArea
          conversationId={chatState.activeConversationId}
          onMembersChange={chatState.handleMembersChange}
          onToggleChatInfo={chatState.toggleChatInfo}
          onToggleSidebar={chatState.toggleSidebar}
          privateKey={privateKey}
          onIncomingMessage={(message) => {
            if (!userId) return;
            if (message.sender_id !== userId && message.id !== lastMessageId) {
              setLastMessageId(message.id);
              playMessageSound();
            }
          }}
        />

        {/* Right Sidebar - Chat Info */}
        {chatState.isChatInfoVisible && (
          <ChatInfo
            hasActiveConversation={!!chatState.activeConversationId}
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
