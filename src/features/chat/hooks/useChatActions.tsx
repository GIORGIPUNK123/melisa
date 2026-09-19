import { supabase } from '../../../db/supabase';
import { getUserIdByUsername } from '../../friends/api/getUserIdByUsername';
import { useBlockedUsers } from '../../friends/hooks/useBlockedUsers';

export const useChatActions = (
  userId: string | undefined,
  openConfirmModal: (data: {
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void;
  }) => void,
  clearActiveConversation: () => void,
  removeFriend?: (friendUserId: string) => Promise<void>,
  refreshFriends?: () => Promise<void> | void,
) => {
  const { isBlocked, isBlockedBy, hasBlock, blockUser, unblockUser } =
    useBlockedUsers(userId);

  const handleBlockUser = (username: string, targetUserId?: string) => {
    const currentlyBlocked = isBlocked(targetUserId);

    openConfirmModal({
      title: currentlyBlocked ? 'Unblock User' : 'Block User',
      message: currentlyBlocked
        ? `Unblock @${username}? You will be able to message each other again.`
        : `Block @${username}? Neither of you will be able to message or send friend requests.`,
      confirmText: currentlyBlocked ? 'Unblock' : 'Block',
      onConfirm: async () => {
        try {
          const blockedUserId =
            targetUserId || (await getUserIdByUsername(username));
          if (!blockedUserId) {
            throw new Error('User not found');
          }

          if (currentlyBlocked) {
            await unblockUser(blockedUserId);
          } else {
            await blockUser(blockedUserId);
            clearActiveConversation();
          }
          await refreshFriends?.();
        } catch (error) {
          console.error('Failed to update block:', error);
          alert(
            currentlyBlocked
              ? 'Failed to unblock user. Please try again.'
              : 'Failed to block user. Please try again.',
          );
        }
      },
    });
  };

  const handleRemoveFriend = (username: string, friendUserId?: string) => {
    if (!removeFriend) return;

    openConfirmModal({
      title: 'Remove Friend',
      message: `Remove @${username} from your friends? You can send a new request later.`,
      confirmText: 'Remove',
      onConfirm: async () => {
        try {
          const targetId =
            friendUserId || (await getUserIdByUsername(username));
          if (!targetId) {
            throw new Error('User not found');
          }

          await removeFriend(targetId);
        } catch (error) {
          console.error('Failed to remove friend:', error);
          alert('Failed to remove friend. Please try again.');
        }
      },
    });
  };

  const handleDeleteChat = async (activeConversationId: string | null) => {
    if (!activeConversationId || !userId) return;

    openConfirmModal({
      title: 'Delete Chat',
      message:
        'Are you sure you want to delete this chat? This action cannot be undone.',
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          await supabase
            .from('conversation_members')
            .delete()
            .eq('conversation_id', activeConversationId)
            .eq('user_id', userId);

          clearActiveConversation();
        } catch (error) {
          console.error('Failed to delete chat:', error);
          alert('Failed to delete chat. Please try again.');
        }
      },
    });
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

  return {
    isBlocked,
    isBlockedBy,
    hasBlock,
    handleBlockUser,
    handleRemoveFriend,
    handleDeleteChat,
    handleMarkNotificationAsRead,
    handleMarkAllNotificationsAsRead,
  };
};
