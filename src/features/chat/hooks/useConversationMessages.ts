import { useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../../db/supabase';
import { ConversationMemberT, MessageT } from '../../../types';
import { decryptChatMessageContent } from '../utils/chatCrypto';
import {
  fetchConversationMembers,
  fetchConversationMessages,
} from '../utils/messageFunctions';
import { sameId } from '../../../shared/utils/ids';
import {
  decryptAndMapMessages,
  mapMembers,
  mergeMessages,
} from '../utils/messageMappers';
import { useConversationRealtime } from './useConversationRealtime';

export const useConversationMessages = (
  conversationId: string | number,
  user: User | null,
  privateKey: string | null,
  isAuthenticated: boolean,
) => {
  const [messages, setMessages] = useState<MessageT[]>([]);
  const [conversationMembers, setConversationMembers] = useState<
    ConversationMemberT[]
  >([]);
  const membersRef = useRef<ConversationMemberT[]>([]);
  membersRef.current = conversationMembers;

  const handleIncomingMessage = async (rawMessage: any) => {
    if (!sameId(rawMessage.conversation_id, conversationId)) return;

    const sender = membersRef.current.find((member) =>
      sameId(member.id, rawMessage.sender_id),
    );
    if (!sender || !user) return;

    const partialMessage: MessageT = {
      id: rawMessage.id,
      conversationId: rawMessage.conversation_id,
      content: rawMessage.content,
      messageType: rawMessage.message_type,
      isEdited: rawMessage.is_edited,
      createdAt: rawMessage.created_at,
      updatedAt: rawMessage.updated_at,
      sender,
    };

    const decryptedContent = await decryptChatMessageContent({
      message: partialMessage,
      membersList: membersRef.current,
      currentUserId: user.id,
      privateKey,
    });

    setMessages((previous) => {
      if (previous.some((message) => sameId(message.id, partialMessage.id))) {
        return previous;
      }
      return [...previous, { ...partialMessage, content: decryptedContent }];
    });
  };

  const handleMemberUpdate = (updated: any) => {
    setConversationMembers((previous) =>
      previous.map((member) =>
        sameId(member.id, updated.user_id)
          ? {
              ...member,
              ...(updated.last_read_at
                ? { lastReadAt: updated.last_read_at }
                : {}),
              ...(updated.last_read_message_id != null
                ? { lastReadMessageId: updated.last_read_message_id }
                : {}),
              ...(updated.unread_count != null
                ? { unreadCount: updated.unread_count }
                : {}),
            }
          : member,
      ),
    );
  };

  const roomChannelRef = useConversationRealtime({
    conversationId,
    userId: user?.id,
    enabled: isAuthenticated,
    onMessage: handleIncomingMessage,
    onMemberUpdate: handleMemberUpdate,
  });

  useEffect(() => {
    if (!isAuthenticated || !conversationId || !user) return;

    let isMounted = true;
    setMessages([]);
    setConversationMembers([]);
    membersRef.current = [];

    const fetchData = async () => {
      try {
        const [membersData, messagesData] = await Promise.all([
          fetchConversationMembers(supabase, conversationId),
          fetchConversationMessages(supabase, conversationId),
        ]);
        if (!isMounted) return;

        const members: ConversationMemberT[] = mapMembers(membersData);

        const loadedMessages = await decryptAndMapMessages(
          messagesData,
          members,
          user.id,
          privateKey,
        );
        if (!isMounted) return;

        setConversationMembers(members);
        setMessages((previous) =>
          mergeMessages(loadedMessages, previous, conversationId),
        );
      } catch (error) {
        console.error('Error fetching conversation data:', error);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [conversationId, isAuthenticated, user?.id, privateKey]);

  return {
    messages,
    setMessages,
    conversationMembers,
    setConversationMembers,
    membersRef,
    roomChannelRef,
  };
};
