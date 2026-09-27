import { useCallback, useEffect, useRef } from 'react';
import { useNotifications } from '../features/notifications/hooks/useNotifications';
import { useUnreadMessages } from '../features/chat/hooks/useUnreadMessages';
import { useAudioNotification } from '../features/notifications/hooks/useAudioNotification';
import { useModals } from '../shared/hooks/useModals';
import { useChatState } from '../features/chat/hooks/useChatState';
import { useCurrentUserProfile } from '../features/friends/hooks/useCurrentUserProfile';
import { useChatActions } from '../features/chat/hooks/useChatActions';
import { useNotificationSound } from '../features/notifications/hooks/useNotificationSound';
import { api } from '../api/instance';
import { WorkspaceModals } from '../features/workspace/components/WorkspaceModals';
import { EmptyChatState } from '../features/chat/components/EmptyChatState';
import { ChatArea } from '../features/chat/components/ChatArea';
import { useHeartbeat } from '../features/notifications/hooks/useHeartbeat';
import { useConversations } from '../features/chat/hooks/useConversations';
import { useFriendsList } from '../features/friends/hooks/useFriendsList';
import type { User } from '@supabase/supabase-js';
import type { PublicProfileT } from '../types';
import { Sidebar } from '../features/workspace/components/Sidebar';
import { ChatInfo } from '../features/chat/components/ChatInfo';
import { GroupSettings } from '../features/chat/components/GroupSettings';
import { asId, sameId } from '../shared/utils/ids';

const EMPTY_MEMBERS: PublicProfileT[] = [];

export const AuthenticatedMain = (props: {
  user: User;
  privateKey: string;
}) => {
  const { user, privateKey } = props;
  const userId = user.id;
  const seenConversationIdsRef = useRef<Set<string>>(new Set());
  const modals = useModals();
  const chatState = useChatState();
  const { profile, setProfile } = useCurrentUserProfile(userId);
  const {
    conversations,
    isLoading: conversationLoading,
    bumpConversation,
    fetchConversations,
    setConversationMuted,
    muteAvailable,
    muteError,
    savingMuteId,
  } = useConversations(userId);
  const membersForActiveChat =
    chatState.membersConversationId === chatState.activeConversationId
      ? chatState.conversationMembers
      : EMPTY_MEMBERS;
  const activeConversation = conversations.find(
    (conversation) => conversation.id === chatState.activeConversationId,
  );

  useEffect(() => {
    if (conversationLoading) return;
    const ids = new Set(conversations.map((conversation) => conversation.id));
    const activeId = chatState.activeConversationId;
    if (
      activeId &&
      seenConversationIdsRef.current.has(activeId) &&
      !ids.has(activeId)
    ) {
      chatState.clearActiveConversation();
    }
    seenConversationIdsRef.current = ids;
  }, [conversations, conversationLoading, chatState]);

  const {
    notifications,
    isLoading: notificationsLoading,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useNotifications(userId);
  useHeartbeat(userId);

  const { playSound: playMessageSound } =
    useAudioNotification('ui/success_bling');
  const { playSound: playNotificationSound } = useAudioNotification(
    'notification/notification',
  );
  const mutedConversationIdsRef = useRef<Set<string>>(new Set());
  mutedConversationIdsRef.current = new Set(
    conversations
      .filter((conversation) => conversation.muted)
      .map((conversation) => conversation.id),
  );

  const playIncomingChatSound = useCallback(
    (conversationId: string) => {
      if (mutedConversationIdsRef.current.has(asId(conversationId))) return;
      void playMessageSound();
    },
    [playMessageSound],
  );
  const activeMuteError =
    muteError &&
    sameId(muteError.conversationId, chatState.activeConversationId)
      ? muteError.message
      : null;
  const handleToggleMute = useCallback(() => {
    if (!activeConversation) return;
    void setConversationMuted(activeConversation.id, !activeConversation.muted);
  }, [activeConversation, setConversationMuted]);
  const { unreadCounts } = useUnreadMessages(
    userId,
    chatState.activeConversationId,
    playIncomingChatSound,
  );
  useNotificationSound(notifications.length, playNotificationSound);

  const refreshConversations = useCallback(() => {
    void fetchConversations();
  }, [fetchConversations]);
  const {
    friends,
    isLoading: friendsLoading,
    getOrCreateConversation,
    removeFriend,
    fetchFriends,
    isFriend,
  } = useFriendsList(userId, refreshConversations);
  const seenFriendNoticeRef = useRef<string | null>(null);
  const friendNoticesReadyRef = useRef(false);

  useEffect(() => {
    if (notificationsLoading) return;
    const notice = notifications.find(
      (item) =>
        item.type === 'friend_accepted' || item.type === 'friend_request',
    );
    if (!friendNoticesReadyRef.current) {
      friendNoticesReadyRef.current = true;
      seenFriendNoticeRef.current = notice?.id ?? null;
      return;
    }
    if (!notice || notice.id === seenFriendNoticeRef.current) return;
    seenFriendNoticeRef.current = notice.id;
    void fetchFriends({ silent: true });
    void fetchConversations();
  }, [notifications, notificationsLoading, fetchFriends, fetchConversations]);

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
      if (chatState.isOpeningConversation) return;
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
        const response = await api.get(`/friends/conversation/${friendUserId}`);
        if (response.data.conversationId) {
          chatState.handleFriendSelect(response.data.conversationId);
        }
      } catch (err) {
        console.error('Failed to open conversation from profile:', err);
      } finally {
        chatState.endConversationTransition();
      }
    },
    [chatActions, chatState, conversations],
  );

  return (
    <div className='relative flex h-full w-full min-w-0 overflow-hidden bg-slate-900'>
      <WorkspaceModals
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
        groupModalOpen={modals.groupModalOpen}
        closeGroupModal={modals.closeGroupModal}
        friends={visibleFriends}
        privateKey={privateKey}
        onFriendsChanged={() => {
          void fetchFriends({ silent: true });
          void fetchConversations();
        }}
        onGroupCreated={async (conversationId) => {
          await fetchConversations();
          chatState.setActiveTab('chats');
          chatState.selectConversationAndSwitchToChats(conversationId);
          modals.closeGroupModal();
        }}
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
        onCreateGroup={modals.openGroupModal}
        onRefresh={async () => {
          await Promise.all([
            fetchFriends({ silent: true }),
            fetchConversations(),
          ]);
        }}
      />
      {!chatState.activeConversationId ? (
        <EmptyChatState />
      ) : (
        <ChatArea
          conversationId={chatState.activeConversationId!}
          onToggleSidebar={chatState.toggleSidebar}
          onToggleChatInfo={chatState.toggleChatInfo}
          currentUserId={user.id}
          privateKey={privateKey}
          members={membersForActiveChat}
          conversationPreview={activeConversation}
          groupAvatarUrl={chatState.groupAvatarUrl}
          groupAvatarReady={
            activeConversation?.type === 'group' &&
            chatState.membersConversationId === chatState.activeConversationId
          }
          onConversationActivity={bumpConversation}
          onIncomingMessageSound={playIncomingChatSound}
          muted={Boolean(activeConversation?.muted)}
          muteAvailable={muteAvailable}
          muteSaving={sameId(savingMuteId, chatState.activeConversationId)}
          muteError={activeMuteError}
          onToggleMute={handleToggleMute}
          isBlocked={chatActions.isBlocked}
          isBlockedBy={chatActions.isBlockedBy}
          onUnblockUser={chatActions.handleBlockUser}
        />
      )}
      {chatState.isChatInfoVisible && activeConversation?.type === 'group' && (
        <GroupSettings
          members={membersForActiveChat}
          memberAccess={chatState.memberAccess}
          creatorId={chatState.groupCreatorId}
          conversationId={chatState.activeConversationId!}
          groupName={activeConversation.otherUserNickname || 'Group'}
          avatarUrl={
            chatState.membersConversationId === chatState.activeConversationId
              ? chatState.groupAvatarUrl
              : activeConversation.otherUserAvatar
          }
          currentUserId={user.id}
          friends={visibleFriends}
          privateKey={privateKey}
          muted={Boolean(activeConversation.muted)}
          muteSaving={sameId(savingMuteId, chatState.activeConversationId)}
          muteError={activeMuteError}
          onClose={chatState.closeChatInfo}
          onToggleMute={handleToggleMute}
          onViewProfile={modals.openUserProfileModal}
          onMembersChanged={chatState.refreshConversationMembers}
          onPhotoUpdated={() => void fetchConversations()}
          onRenamed={() => void fetchConversations()}
          onLeft={() => {
            chatState.clearActiveConversation();
            void fetchConversations();
          }}
          onDeleted={() => {
            chatState.clearActiveConversation();
            void fetchConversations();
          }}
          onConfirm={modals.openConfirmModal}
        />
      )}
      {chatState.isChatInfoVisible && activeConversation?.type !== 'group' && (
        <ChatInfo
          members={membersForActiveChat}
          onClose={chatState.closeChatInfo}
          onViewProfile={modals.openUserProfileModal}
          onBlockUser={chatActions.handleBlockUser}
          onRemoveFriend={chatActions.handleRemoveFriend}
          onDeleteChat={() =>
            chatActions.handleDeleteChat(chatState.activeConversationId)
          }
          conversationId={chatState.activeConversationId}
          friends={visibleFriends}
          privateKey={privateKey}
          onConfirmAction={modals.openConfirmModal}
          muted={Boolean(activeConversation?.muted)}
          muteSaving={sameId(savingMuteId, chatState.activeConversationId)}
          muteError={activeMuteError}
          onToggleMute={handleToggleMute}
          isBlocked={chatActions.isBlocked}
          isFriend={isFriend}
        />
      )}
    </div>
  );
};
