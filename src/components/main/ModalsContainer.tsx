import { User } from '@supabase/supabase-js';
import { AddFriendsModal } from '../modals/AddFriendsModal';
import { FriendRequestsModal } from '../modals/FriendRequestsModal';
import { SettingsModal } from '../modals/SettingsModal';
import { UserProfileModal } from '../modals/UserProfileModal';
import { ConfirmModal } from '../modals/ConfirmModal';
import { NotificationsModal } from '../modals/NotificationsModal';
import { UserT, NotificationT } from '../../types';
import { ConfirmModalData } from '../../hooks/useModals';

interface ModalsContainerProps {
  user: User;
  profile: UserT | null;

  // Add Friend Modal
  addFriendModalOpen: boolean;
  closeAddFriendModal: () => void;

  // Friend Requests Modal
  friendRequestsOpen: boolean;
  closeFriendRequestsModal: () => void;

  // Settings Modal
  settingsOpen: boolean;
  closeSettingsModal: () => void;
  onProfileUpdated: (profile: UserT) => void;

  // User Profile Modal
  userProfileModalOpen: boolean;
  selectedUsername: string | null;
  closeUserProfileModal: () => void;
  onBlockUser: (username: string) => void;
  onMessageUser: (userId: string) => void;

  // Confirm Modal
  confirmModalOpen: boolean;
  confirmModalData: ConfirmModalData | null;
  closeConfirmModal: () => void;

  // Notifications Modal
  notificationsModalOpen: boolean;
  closeNotificationsModal: () => void;
  notifications: NotificationT[];
  onMarkNotificationAsRead: (id: string) => void;
  onMarkAllNotificationsAsRead: () => void;
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
  onMessageUser,
  confirmModalOpen,
  confirmModalData,
  closeConfirmModal,
  notificationsModalOpen,
  closeNotificationsModal,
  notifications,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
}: ModalsContainerProps) => {
  return (
    <>
      <UserProfileModal
        isOpen={userProfileModalOpen}
        onClose={closeUserProfileModal}
        username={selectedUsername}
        onBlockUser={onBlockUser}
        onMessageUser={onMessageUser}
      />

      <ConfirmModal
        isOpen={confirmModalOpen}
        title={confirmModalData?.title || ''}
        message={confirmModalData?.message || ''}
        confirmText={
          confirmModalData?.title === 'Delete Chat' ? 'Delete' : 'Block'
        }
        cancelText='Cancel'
        danger={true}
        onConfirm={() => {
          confirmModalData?.onConfirm();
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
