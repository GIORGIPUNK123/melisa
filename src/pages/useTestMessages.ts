import { useEffect, useState } from 'react';
import { supabase } from '../db/supabase';
import { useAuth } from '../features/auth/hooks/useAuth';
import { ConversationMemberT, MessageT } from '../types';
import {
  buildEncryptedChatMessageContent,
  decryptChatMessageContent,
} from '../features/chat/utils/chatCrypto';

export const useTestMessages = (conversationId: string | number) => {
  const { user, privateKey } = useAuth();
  const [messages, setMessages] = useState<MessageT[]>([]);
  const [conversationMembers, setConversationMembers] = useState<
    ConversationMemberT[]
  >([]);
  const isAuthenticated = user !== 'loading' && user !== null;

  useEffect(() => {
    if (!isAuthenticated || !conversationId) return;

    const fetchData = async () => {
      try {
        const [
          { data: membersData, error: mErr },
          { data: messagesData, error: msgErr },
        ] = await Promise.all([
          supabase
            .from('conversation_members')
            .select(
              'last_read_at, last_message_at, joined_at, muted, public_profiles(id, nickname, username, avatar_url, public_key)',
            )
            .eq('conversation_id', conversationId),
          supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true }),
        ]);

        if (mErr) throw mErr;
        if (msgErr) throw msgErr;

        // 1. Map members cleanly using destructuring
        const members: ConversationMemberT[] = (membersData || []).map(
          ({
            last_read_at,
            last_message_at,
            joined_at,
            muted,
            public_profiles: p,
          }: any) => ({
            id: p.id,
            nickname: p.nickname,
            username: p.username,
            avatarUrl: p.avatar_url,
            publicKey: p.public_key,
            lastReadAt: last_read_at,
            lastMessageAt: last_message_at,
            joinedAt: joined_at,
            muted,
          }),
        );

        // 2. Map messages and attach sender first
        const msgs: MessageT[] = await Promise.all(
          (messagesData || []).map(async (msg: any) => {
            // Find the sender first so it's available
            const sender = members.find((m) => m.id === msg.sender_id)!;
            const isImage = msg.message_type === 'image';
            return {
              id: msg.id,
              conversationId: msg.conversation_id,
              // Pass the message along with its sender property attached
              content: isImage
                ? '<image>'
                : await decryptChatMessageContent({
                    message: { ...msg, sender }, // <-- Attach sender here so chatCrypto can read message.sender.id
                    membersList: members,
                    currentUserId: user?.id || null,
                    privateKey: privateKey || null,
                  }),
              messageType: msg.message_type,
              isEdited: msg.is_edited,
              createdAt: msg.created_at,
              updatedAt: msg.updated_at,
              sender,
            };
          }),
        );

        setConversationMembers(members);
        setMessages(msgs);
      } catch (error) {
        console.error('Error fetching conversation data:', error);
      }
    };

    fetchData();
  }, [conversationId, isAuthenticated, user, privateKey]);
  // const sendMessage = async (content: string) => {
  //   buildEncryptedChatMessageContent(content,)
  // }
  return { conversationMembers, messages };
};
