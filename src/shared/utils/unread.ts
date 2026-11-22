import type { ConversationT } from '../../types';

export const isConversationUnread = (
  conversation: ConversationT,
  currentUserId: string,
) => {
  const currentMember = conversation.conversationMembers?.find(
    (member) => member.id === currentUserId,
  );

  return (currentMember?.unreadCount ?? 0) > 0;
};
