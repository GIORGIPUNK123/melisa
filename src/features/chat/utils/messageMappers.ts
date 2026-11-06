import type { ConversationMemberT, MessageT } from '../../../types';
import type { ConversationMemberRow, MessageRow } from './messageFunctions';
import { decryptChatMessageContent } from './chatCrypto';
import { sameId } from '../../../shared/utils/ids';

export const mapMembers = (membersData: ConversationMemberRow[]) => {
  return membersData.map(
    ({
      last_read_at,
      last_message_at,
      joined_at,
      muted,
      public_profiles: profile,
    }) => ({
      id: profile?.id,
      nickname: profile?.nickname,
      username: profile?.username,
      avatarUrl: profile?.avatar_url,
      publicKey: profile?.public_key,
      lastReadAt: last_read_at,
      lastMessageAt: last_message_at,
      joinedAt: joined_at,
      muted,
    }),
  ) as ConversationMemberT[];
};

export const mergeMessages = (
  loadedMessages: MessageT[],
  currentMessages: MessageT[],
  conversationId: string | number,
): MessageT[] => {
  const messagesById = new Map(
    loadedMessages.map((message) => [message.id, message]),
  );

  for (const message of currentMessages) {
    if (
      sameId(message.conversationId, conversationId) &&
      !messagesById.has(message.id)
    ) {
      messagesById.set(message.id, message);
    }
  }

  return [...messagesById.values()].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
};

export const decryptAndMapMessages = async (
  messagesData: MessageRow[],
  members: ConversationMemberT[],
  currentUserId: string,
  privateKey: string | null,
): Promise<MessageT[]> => {
  const messages = await Promise.all(
    messagesData.map(async (message) => {
      const sender = members.find((member) => member.id === message.sender_id);
      if (!sender) {
        throw new Error(`Sender not found for message ${message.id}`);
      }

      return {
        id: message.id,
        conversationId: message.conversation_id,
        content: await decryptChatMessageContent({
          message: { ...message, sender } as unknown as MessageT,
          membersList: members,
          currentUserId,
          privateKey,
        }),
        messageType: message.message_type,
        isEdited: message.is_edited,
        createdAt: message.created_at,
        updatedAt: message.updated_at,
        sender,
      };
    }),
  );

  return messages.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
};
