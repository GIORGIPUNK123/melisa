import { supabase } from '../db/supabase';

export const useChatActions = (
  userId: string | undefined,
  openConfirmModal: (data: {
    title: string;
    message: string;
    onConfirm: () => void;
  }) => void,
  clearActiveConversation: () => void,
) => {
  const handleBlockUser = (username: string) => {
    openConfirmModal({
      title: 'Block User',
      message: `Are you sure you want to block @${username}? They will no longer be able to send you messages or see your profile.`,
      onConfirm: () => {
        console.log('Blocking user:', username);
      },
    });
  };

  const handleDeleteChat = async (activeConversationId: string | null) => {
    if (!activeConversationId || !userId) return;

    openConfirmModal({
      title: 'Delete Chat',
      message:
        'Are you sure you want to delete this chat? This action cannot be undone.',
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
    handleBlockUser,
    handleDeleteChat,
    handleMarkNotificationAsRead,
    handleMarkAllNotificationsAsRead,
  };
};
