import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { Loading } from './Loading';
import { AddFriendsModal } from './AddFriendsModal';
import { useAdditionalInfo } from '../hooks/useAdditionalInfo';
import { useAuth } from '../hooks/useAuth';
import { Sidebar } from './Sidebar';
import { ChatArea } from './ChatArea';
import { ChatInfo } from './ChatInfo';
import { supabase } from '../db/supabase';
import { SettingsModal } from './SettingsModal';
import { UserT, ConversationMember } from '../types';
import { useNotifications } from '../hooks/useNotifications';
import { FriendRequestsModal } from './FriendRequestsModal';
import { UserProfileModal } from './UserProfileModal';
import { ConfirmModal } from './ConfirmModal';
import { NotificationsModal } from './NotificationsModal';
import { useUnreadMessages } from '../hooks/useUnreadMessages';
import { useAudioNotification } from '../hooks/useAudioNotification';
import { useMessageNotifications } from '../hooks/useMessageNotifications';

export const Main = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [addFriendModalOpen, setAddFriendModalOpen] = useState(false);
  const [friendRequestsOpen, setFriendRequestsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profile, setProfile] = useState<UserT | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [conversationMembers, setConversationMembers] = useState<ConversationMember[]>([]);
  const [isChatInfoVisible, setIsChatInfoVisible] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [activeTab, setActiveTab] = useState<'chats' | 'friends'>('chats');
  const [userProfileModalOpen, setUserProfileModalOpen] = useState(false);
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmModalData, setConfirmModalData] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);
  const [lastNotificationCount, setLastNotificationCount] = useState(0);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  
  const userId = user && user !== 'loading' ? user.id : undefined;
  useAdditionalInfo(userId);
  
  const { notifications, isLoading: notificationsLoading } = useNotifications(userId);
  const { unreadCounts } = useUnreadMessages(userId, activeConversationId);
  const { playSound: playMessageSound } = useAudioNotification(800, 0.3);
  const { playSound: playNotificationSound } = useAudioNotification(600, 0.5);

  useMessageNotifications(userId, lastMessageId, setLastMessageId, playMessageSound);

  useMessageNotifications(userId, lastMessageId, setLastMessageId, playMessageSound);

  useEffect(() => {
    if (!activeConversationId) {
      setIsSidebarVisible(true);
    }
  }, [activeConversationId]);

  useEffect(() => {
    if (notifications.length > lastNotificationCount && lastNotificationCount > 0) {
      playNotificationSound();
    }
    setLastNotificationCount(notifications.length);
  }, [notifications.length]);

  useEffect(() => {
    if (!userId) return;

    const fetchUserProfile = async () => {
      const { data } = await supabase
        .from('users')
        .select('id,email,username,nickname,avatar_url,status,created_at')
        .eq('id', userId)
        .single();

      if (data) setProfile(data as UserT);
    };

    fetchUserProfile();
  }, [userId]);

  useEffect(() => {
    if (user === null) navigate('/login');
  }, [user, navigate]);

  const handleFriendSelect = (conversationId: string) => {
    setActiveConversationId(conversationId);
  };

  const handleMembersChange = (members: ConversationMember[]) => {
    setConversationMembers(members);
  };

  const handleViewProfile = (username: string) => {
    setSelectedUsername(username);
    setUserProfileModalOpen(true);
  };

  const handleBlockUser = (username: string) => {
    setConfirmModalData({
      title: 'Block User',
      message: `Are you sure you want to block @${username}? They will no longer be able to send you messages or see your profile.`,
      onConfirm: () => {
        console.log('Blocking user:', username);
        setConfirmModalOpen(false);
      },
    });
    setConfirmModalOpen(true);
  };

  const handleDeleteChat = async () => {
    if (!activeConversationId || !userId) return;

    setConfirmModalData({
      title: 'Delete Chat',
      message: 'Are you sure you want to delete this chat? This action cannot be undone.',
      onConfirm: async () => {
        try {
          // Delete conversation member record for current user
          await supabase
            .from('conversation_members')
            .delete()
            .eq('conversation_id', activeConversationId)
            .eq('user_id', userId);

          // Clear active conversation
          setActiveConversationId(null);
          setConversationMembers([]);
          setConfirmModalOpen(false);
        } catch (error) {
          console.error('Failed to delete chat:', error);
          alert('Failed to delete chat. Please try again.');
        }
      },
    });
    setConfirmModalOpen(true);
  };

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
  };

  const handleMarkAllNotificationsAsRead = async () => {
    if (!userId) return;
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
  };

  if (user === 'loading') {
    return <Loading />;
  }

  if (user != null) {
    return (
      <div className='flex w-screen h-screen bg-slate-900'>
        {/* Modals */}
        {/* <AdditionalInfoModal isOpen={!hasUsername} user={user} /> */}
        <UserProfileModal
          isOpen={userProfileModalOpen}
          onClose={() => setUserProfileModalOpen(false)}
          username={selectedUsername}
          onBlockUser={handleBlockUser}
        />
        <ConfirmModal
          isOpen={confirmModalOpen}
          title={confirmModalData?.title || ''}
          message={confirmModalData?.message || ''}
          confirmText={confirmModalData?.title === 'Delete Chat' ? 'Delete' : 'Block'}
          cancelText='Cancel'
          danger={true}
          onConfirm={() => {
            confirmModalData?.onConfirm();
          }}
          onCancel={() => setConfirmModalOpen(false)}
        />
        <NotificationsModal
          isOpen={notificationsModalOpen}
          onClose={() => setNotificationsModalOpen(false)}
          notifications={notifications}
          onMarkAsRead={handleMarkNotificationAsRead}
          onMarkAllAsRead={handleMarkAllNotificationsAsRead}
        />
        <AddFriendsModal
          isOpen={addFriendModalOpen}
          setIsOpen={setAddFriendModalOpen}
          user={user}
        />
        <FriendRequestsModal
          isOpen={friendRequestsOpen}
          onClose={() => setFriendRequestsOpen(false)}
        />
        <SettingsModal
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          user={user}
          profile={profile}
          onProfileUpdated={(updated) => setProfile(updated)}
        />

        {/* Sidebar */}
        <Sidebar
          user={user}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          // username={profile?.username}
          nickname={profile?.nickname}
          avatarUrl={profile?.avatar_url || null}
          notifications={notifications}
          notificationsLoading={notificationsLoading}
          onAddFriendClick={() => setAddFriendModalOpen(true)}
          onFriendRequestsClick={() => setFriendRequestsOpen(true)}
          onSettingsClick={() => setSettingsOpen(true)}
          onNotificationsClick={() => setNotificationsModalOpen(true)}
          onFriendSelect={(conversationId) => {
            setActiveTab('chats');
            handleFriendSelect(conversationId);
            setIsSidebarVisible(false);
          }}
          onViewProfile={handleViewProfile}
          activeConversationId={activeConversationId}
          isVisible={isSidebarVisible}
          onClose={() => setIsSidebarVisible(false)}
          unreadCounts={unreadCounts}
        />

        {/* Main Chat Area */}
        <ChatArea
          conversationId={activeConversationId}
          onMembersChange={handleMembersChange}
          onToggleChatInfo={() => setIsChatInfoVisible(!isChatInfoVisible)}
          onToggleSidebar={() => setIsSidebarVisible(!isSidebarVisible)}
        />

        {/* Right Sidebar - Chat Info */}
        {isChatInfoVisible && (
          <ChatInfo
            hasActiveConversation={!!activeConversationId}
            members={conversationMembers}
            isVisible={isChatInfoVisible}
            onClose={() => setIsChatInfoVisible(false)}
            onViewProfile={handleViewProfile}
            onBlockUser={handleBlockUser}
            onDeleteChat={handleDeleteChat}
          />
        )}
      </div>
    );
  }

  return null;
};
