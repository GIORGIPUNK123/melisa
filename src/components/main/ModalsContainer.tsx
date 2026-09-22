import { User } from '@supabase/supabase-js';
import { AddFriendsModal } from '../../features/friends/modals/AddFriendsModal';
import { FriendRequestsModal } from '../../features/friends/modals/FriendRequestsModal';
import { SettingsModal } from '../modals/SettingsModal';
import { UserProfileModal } from '../../features/friends/modals/UserProfileModal';
import { ConfirmModal } from '../modals/ConfirmModal';
import { NotificationsModal } from '../../features/notifications/modals/NotificationsModal';
import { UserT, NotificationT, FriendT } from '../../types';
import { ConfirmModalData } from '../../shared/hooks/useModals';
import { CreateGroupModal } from '../../features/chat/components/CreateGroupModal';

interface ModalsContainerProps {
  user: User;
  profile: UserT | null;
  addFriendModalOpen: boolean;
  closeAddFriendModal: () => void;
  friendRequestsOpen: boolean;
  closeFriendRequestsModal: () => void;
  settingsOpen: boolean;
  closeSettingsModal: () => void;
  onProfileUpdated: (profile: UserT) => void;
  userProfileModalOpen: boolean;
  selectedUsername: string | null;
  closeUserProfileModal: () => void;
  onBlockUser: (username: string, userId?: string) => void;
  onRemoveFriend?: (username: string, userId?: string) => void;
  onMessageUser: (userId: string) => void;
  isBlocked?: (userId?: string | null) => boolean;
  hasBlock?: (userId?: string | null) => boolean;
  isFriend?: (userId?: string | null) => boolean;
  confirmModalOpen: boolean;
  confirmModalData: ConfirmModalData | null;
  closeConfirmModal: () => void;
  notificationsModalOpen: boolean;
  closeNotificationsModal: () => void;
  notifications: NotificationT[];
  onMarkNotificationAsRead: (id: string) => void;
  onMarkAllNotificationsAsRead: () => void;
  groupModalOpen: boolean;
  closeGroupModal: () => void;
  friends: FriendT[];
  privateKey: string;
  onGroupCreated: (conversationId: string) => void;
}

export const ModalsContainer = ({
  user,
  profile,
  addFriendModalOpen,
  closeAddFriendModal,
  friendRequestsOpen,
  closeFriendRequestsModal,
  settingsOpen,
  closeSettingsModal,
  onProfileUpdated,
  userProfileModalOpen,
  selectedUsername,
  closeUserProfileModal,
  onBlockUser,
  onRemoveFriend,
  onMessageUser,
  isBlocked,
  hasBlock,
  isFriend,
  confirmModalOpen,
  confirmModalData,
  closeConfirmModal,
  notificationsModalOpen,
  closeNotificationsModal,
  notifications,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
  groupModalOpen,
  closeGroupModal,
  friends,
  privateKey,
  onGroupCreated,
}: ModalsContainerProps) => {
  return (
    <>
      <UserProfileModal
        isOpen={userProfileModalOpen}
        onClose={closeUserProfileModal}
        username={selectedUsername}
        onBlockUser={onBlockUser}
        onRemoveFriend={onRemoveFriend}
        onMessageUser={onMessageUser}
        isBlocked={isBlocked}
        hasBlock={hasBlock}
        isFriend={isFriend}
      />

      <ConfirmModal
        isOpen={confirmModalOpen}
        title={confirmModalData?.title || ''}
        message={confirmModalData?.message || ''}
        confirmText={confirmModalData?.confirmText || 'Confirm'}
        cancelText='Cancel'
        danger={true}
        onConfirm={() => {
          confirmModalData?.onConfirm();
          closeConfirmModal();
        }}
        onCancel={closeConfirmModal}
      />

      <NotificationsModal
        isOpen={notificationsModalOpen}
        onClose={closeNotificationsModal}
        notifications={notifications}
        onMarkAsRead={onMarkNotificationAsRead}
        onMarkAllAsRead={onMarkAllNotificationsAsRead}
      />

      <AddFriendsModal
        isOpen={addFriendModalOpen}
        setIsOpen={(open) => !open && closeAddFriendModal()}
        user={user}
      />

      <FriendRequestsModal
        isOpen={friendRequestsOpen}
        onClose={closeFriendRequestsModal}
      />

      <CreateGroupModal
        isOpen={groupModalOpen}
        onClose={closeGroupModal}
        friends={friends}
        selfId={user.id}
        selfPublicKey={profile?.public_key}
        privateKey={privateKey}
        onCreated={onGroupCreated}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={closeSettingsModal}
        user={user}
        profile={profile}
        onProfileUpdated={onProfileUpdated}
      />
    </>
  );
};
