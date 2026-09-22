import { useState } from 'react';

export interface ConfirmModalData {
  title: string;
  message: string;
  confirmText?: string;
  onConfirm: () => void;
}

export const useModals = () => {
  const [addFriendModalOpen, setAddFriendModalOpen] = useState(false);
  const [friendRequestsOpen, setFriendRequestsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userProfileModalOpen, setUserProfileModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);
  const [confirmModalData, setConfirmModalData] =
    useState<ConfirmModalData | null>(null);

  const openAddFriendModal = () => setAddFriendModalOpen(true);
  const closeAddFriendModal = () => setAddFriendModalOpen(false);

  const openFriendRequestsModal = () => setFriendRequestsOpen(true);
  const closeFriendRequestsModal = () => setFriendRequestsOpen(false);

  const openSettingsModal = () => setSettingsOpen(true);
  const closeSettingsModal = () => setSettingsOpen(false);

  const openNotificationsModal = () => setNotificationsModalOpen(true);
  const closeNotificationsModal = () => setNotificationsModalOpen(false);

  const openGroupModal = () => setGroupModalOpen(true);
  const closeGroupModal = () => setGroupModalOpen(false);

  const openUserProfileModal = (username: string) => {
    setSelectedUsername(username);
    setUserProfileModalOpen(true);
  };
  const closeUserProfileModal = () => {
    setUserProfileModalOpen(false);
    setSelectedUsername(null);
  };

  const openConfirmModal = (data: ConfirmModalData) => {
    setConfirmModalData(data);
    setConfirmModalOpen(true);
  };
  const closeConfirmModal = () => {
    setConfirmModalOpen(false);
    setConfirmModalData(null);
  };

  return {
    addFriendModalOpen,
    openAddFriendModal,
    closeAddFriendModal,
    friendRequestsOpen,
    openFriendRequestsModal,
    closeFriendRequestsModal,
    settingsOpen,
    openSettingsModal,
    closeSettingsModal,
    notificationsModalOpen,
    openNotificationsModal,
    closeNotificationsModal,
    groupModalOpen,
    openGroupModal,
    closeGroupModal,
    userProfileModalOpen,
    selectedUsername,
    openUserProfileModal,
    closeUserProfileModal,
    confirmModalOpen,
    confirmModalData,
    openConfirmModal,
    closeConfirmModal,
  };
};
