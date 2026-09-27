import { User } from '@supabase/supabase-js';
import { AddFriendsModal } from '../../friends/modals/AddFriendsModal';
import { FriendRequestsModal } from '../../friends/modals/FriendRequestsModal';
import { UserProfileModal } from '../../friends/modals/UserProfileModal';
import { ConfirmModal } from '../../../components/modals/ConfirmModal';
import { NotificationsModal } from '../../notifications/modals/NotificationsModal';
import { UserT, NotificationT, FriendT } from '../../../types';
import { ConfirmModalData } from '../../../shared/hooks/useModals';
import { CreateGroupModal } from '../../chat/components/CreateGroupModal';

interface WorkspaceModalsProps {
  user: User;
  profile: UserT | null;
  addFriendModalOpen: boolean;
  closeAddFriendModal: () => void;
  friendRequestsOpen: boolean;
  closeFriendRequestsModal: () => void;
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
  onFriendsChanged?: () => void;
  onGroupCreated: (conversationId: string) => void;
}

export const WorkspaceModals = ({
  user,
  profile,
  addFriendModalOpen,
  closeAddFriendModal,
  friendRequestsOpen,
  closeFriendRequestsModal,
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
  onFriendsChanged,
  onGroupCreated,
}: WorkspaceModalsProps) => {
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
        onFriendsChanged={onFriendsChanged}
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
    </>
  );
};
