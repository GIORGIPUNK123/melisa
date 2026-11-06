import type { RealtimeChannel, User } from '@supabase/supabase-js';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import { supabase } from '../../../db/supabase';
import type {
  ConversationMemberT,
  MessageT,
  PublicProfileT,
} from '../../../types';
import { buildEncryptedChatMessageContent } from '../utils/chatCrypto';

export const useSendMessage = (params: {
  conversationId: string | number;
  isAuthenticated: boolean;
  privateKey: string | null;
  user: User | null;
  profile: PublicProfileT | null;
  conversationMembers: ConversationMemberT[];
  setMessages: Dispatch<SetStateAction<MessageT[]>>;
  roomChannelRef: MutableRefObject<RealtimeChannel | null>;
}) => {
  const {
    conversationId,
    isAuthenticated,
    privateKey,
    user,
    profile,
    conversationMembers,
    setMessages,
    roomChannelRef,
  } = params;

  const sendMessage = async (messageText: string) => {
    if (!isAuthenticated || !privateKey || !user || !profile) return;

    const recipient = conversationMembers.find((member) => member.id !== user.id);
    const recipientPublicKey = recipient?.publicKey || profile.public_key;

    if (!recipientPublicKey || !profile.public_key) {
      console.error('Missing public key for message encryption');
      return;
    }

    const encryptedContent = buildEncryptedChatMessageContent(
      messageText,
      profile.public_key,
      recipientPublicKey,
      privateKey,
    );
    const tempId = `temp-${Date.now()}`;
    const now = new Date().toISOString();

    setMessages((previous) => [
      ...previous,
      {
        id: tempId,
        conversationId: conversationId.toString(),
        content: messageText,
        messageType: 'text',
        isEdited: false,
        createdAt: now,
        updatedAt: now,
        sender: {
          id: user.id,
          nickname: profile.nickname,
          username: profile.username,
          avatarUrl: profile.avatar_url || undefined,
          publicKey: profile.public_key,
        },
      },
    ]);

    try {
      const [messageResult, memberResult] = await Promise.all([
        supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            sender_id: user.id,
            content: encryptedContent,
            message_type: 'text',
          })
          .select()
          .single(),
        supabase
          .from('conversation_members')
          .update({ last_message_at: now, last_read_at: now })
          .eq('conversation_id', conversationId)
          .eq('user_id', user.id),
      ]);

      if (messageResult.error) throw messageResult.error;
      if (memberResult.error) {
        console.error('Failed to update last_message_at:', memberResult.error);
      }

      if (messageResult.data) {
        const savedMessage = messageResult.data;
        setMessages((previous) =>
          previous.map((message) =>
            message.id === tempId
              ? {
                  ...message,
                  id: savedMessage.id,
                  createdAt: savedMessage.created_at,
                  updatedAt: savedMessage.updated_at,
                }
              : message,
          ),
        );

        await roomChannelRef.current?.send({
          type: 'broadcast',
          event: 'message',
          payload: { message: savedMessage },
        });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages((previous) =>
        previous.filter((message) => message.id !== tempId),
      );
    }
  };

  return { sendMessage };
};
