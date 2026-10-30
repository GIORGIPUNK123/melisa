import { useEffect, useState, useRef } from 'react';
import { supabase } from '../db/supabase';
import { useAuth } from '../features/auth/hooks/useAuth';
import { ConversationMemberT, MessageT } from '../types';
import {
  decryptChatMessageContent,
  buildEncryptedChatMessageContent,
} from '../features/chat/utils/chatCrypto';
import {
  downloadChatFile,
  openChatFileBytes,
  type ChatFilePayload,
} from '../features/chat/utils/chatFiles';
import { useChatStore } from '../store/useChatStore'; // adjust path to your store
export const useTestMessages = (conversationId: string | number) => {
  const { user, privateKey, isLoadingSession, profile } = useAuth();
  const [messages, setMessages] = useState<MessageT[]>([]);
  const [conversationMembers, setConversationMembers] = useState<
    ConversationMemberT[]
  >([]);

  // Keep a ref of members so Realtime callbacks never read stale state
  const membersRef = useRef<ConversationMemberT[]>([]);
  membersRef.current = conversationMembers;

  // Use isLoadingSession instead of 'loading' string comparison
  const isAuthenticated = user !== null && isLoadingSession === false;

  useEffect(() => {
    if (!isAuthenticated || !conversationId || !user) return;

    let isMounted = true;

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
        if (!isMounted) return;

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

        const msgs: MessageT[] = await Promise.all(
          (messagesData || []).map(async (msg: any) => {
            const sender = members.find((m) => m.id === msg.sender_id)!;
            return {
              id: msg.id,
              conversationId: msg.conversation_id,
              content: await decryptChatMessageContent({
                message: { ...msg, sender },
                membersList: members,
                currentUserId: user.id,
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

        // 🚀 Only update last_read_at on initial fetch if our read cursor is behind the latest message
        if (msgs.length > 0) {
          const latestMsg = msgs[msgs.length - 1];
          const currentMember = members.find((m) => m.id === user.id);

          if (
            currentMember &&
            (!currentMember.lastReadAt ||
              currentMember.lastReadAt < latestMsg.createdAt)
          ) {
            const now = new Date().toISOString();

            setConversationMembers((prev) =>
              prev.map((m) =>
                m.id === user.id ? { ...m, lastReadAt: now } : m,
              ),
            );

            supabase
              .from('conversation_members')
              .update({ last_read_at: now })
              .eq('conversation_id', conversationId)
              .eq('user_id', user.id)
              .then(({ error }) => {
                if (error)
                  console.error(
                    'Failed to update last_read_at on open:',
                    error,
                  );
              });
          }
        }
      } catch (error) {
        console.error('Error fetching conversation data:', error);
      }
    };

    fetchData();

    // 🚀 Setup Supabase Realtime channel for live messages & member updates in this room
    const channel = supabase
      .channel(`room-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const rawMsg = payload.new;
          const sender = membersRef.current.find(
            (m) => m.id === rawMsg.sender_id,
          );
          if (!sender) return;

          // Construct a correctly mapped message object matching MessageT structure
          const partialMessage: MessageT = {
            id: rawMsg.id,
            conversationId: rawMsg.conversation_id,
            content: rawMsg.content,
            messageType: rawMsg.message_type,
            isEdited: rawMsg.is_edited,
            createdAt: rawMsg.created_at,
            updatedAt: rawMsg.updated_at,
            sender,
          };

          const decryptedContent = await decryptChatMessageContent({
            message: partialMessage,
            membersList: membersRef.current,
            currentUserId: user.id,
            privateKey: privateKey || null,
          });
          const newMsg: MessageT = {
            id: rawMsg.id,
            conversationId: rawMsg.conversation_id,
            content: decryptedContent,
            messageType: rawMsg.message_type,
            isEdited: rawMsg.is_edited,
            createdAt: rawMsg.created_at,
            updatedAt: rawMsg.updated_at,
            sender,
          };

          // Avoid duplicates if message was already added via optimistic UI
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversation_members',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updated = payload.new;
          setConversationMembers((prev) =>
            prev.map((m) =>
              m.id === updated.user_id
                ? {
                    ...m,
                    lastReadAt: updated.last_read_at,
                    lastMessageAt: updated.last_message_at,
                  }
                : m,
            ),
          );
        },
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [conversationId, isAuthenticated, user, privateKey]);

  // 🚀 Auto-update last_read_at when viewing the chat and new messages arrive
  useEffect(() => {
    if (!isAuthenticated || !conversationId || !user || messages.length === 0)
      return;

    const latestMsg = messages[messages.length - 1];
    const isFromPeer = latestMsg.sender.id !== user.id;

    if (isFromPeer) {
      const currentMember = membersRef.current.find((m) => m.id === user.id);

      // Only write to DB if our current read cursor is older than the latest message
      if (
        currentMember &&
        (!currentMember.lastReadAt ||
          currentMember.lastReadAt < latestMsg.createdAt)
      ) {
        const now = new Date().toISOString();

        // Optimistically update local state so UI updates instantly
        setConversationMembers((prev) =>
          prev.map((m) => (m.id === user.id ? { ...m, lastReadAt: now } : m)),
        );

        // Persist the new high-water mark to Supabase
        supabase
          .from('conversation_members')
          .update({ last_read_at: now })
          .eq('conversation_id', conversationId)
          .eq('user_id', user.id)
          .then(({ error }) => {
            if (error) console.error('Failed to update last_read_at:', error);
          });
      }
    }
  }, [messages, conversationId, user, isAuthenticated]);

  const openChatFile = async (payload: ChatFilePayload) => {
    if (!isAuthenticated || !privateKey || !user) {
      throw new Error('Chat is locked');
    }
    const cipher = await downloadChatFile(payload.path);
    const plain = openChatFileBytes(cipher, payload, {
      privateKey,
      groupKey: null,
      members: conversationMembers,
      currentUserId: user.id,
    });

    if (!plain) throw new Error('Could not decrypt file');

    return new Blob([plain as any], {
      type: payload.mime || 'application/octet-stream',
    });
  };

  const sendMessage = async (messageText: string) => {
    if (!isAuthenticated || !privateKey || !user || !profile) return;

    const recipient = conversationMembers.find((m) => m.id !== user.id);
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

    const tempMessage: MessageT = {
      id: tempId,
      conversationId: conversationId.toString(),
      content: messageText, // Plaintext for immediate rendering
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
    };

    setMessages((prev) => [...prev, tempMessage]);

    try {
      const [msgResult, memberResult] = await Promise.all([
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
          .update({
            last_message_at: now,
            last_read_at: now,
          })
          .eq('conversation_id', conversationId)
          .eq('user_id', user.id),
      ]);

      if (msgResult.error) throw msgResult.error;
      if (memberResult.error) {
        console.error('Failed to update last_message_at:', memberResult.error);
      }

      if (msgResult.data) {
        const saved = msgResult.data;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId
              ? {
                  ...msg,
                  id: saved.id,
                  createdAt: saved.created_at,
                  updatedAt: saved.updated_at,
                }
              : msg,
          ),
        );
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
    }
  };
  const updateConversationMemberInStore = useChatStore(
    (state) => state.updateConversationMember,
  );
  const toggleMute = async () => {
    if (!isAuthenticated || !user) return;

    const currentMember = conversationMembers.find((m) => m.id === user.id);
    const newMutedState = !currentMember?.muted;

    // 1. Optimistically update local hook state
    setConversationMembers((prev) =>
      prev.map((m) => (m.id === user.id ? { ...m, muted: newMutedState } : m)),
    );

    // 2. Update global Zustand store so parent components/sidebar reflect it instantly
    if (updateConversationMemberInStore) {
      updateConversationMemberInStore(conversationId, {
        id: user.id,
        muted: newMutedState,
      });
    }

    try {
      // 3. Persist to Supabase
      const { error } = await supabase
        .from('conversation_members')
        .update({ muted: newMutedState })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (err) {
      console.error('Failed to toggle mute:', err);
      // Revert local & store state on error
      setConversationMembers((prev) =>
        prev.map((m) =>
          m.id === user.id ? { ...m, muted: !newMutedState } : m,
        ),
      );
      if (updateConversationMemberInStore) {
        updateConversationMemberInStore(conversationId, {
          id: user.id,
          muted: !newMutedState,
        });
      }
    }
  };

  return {
    conversationMembers,
    messages,
    openChatFile,
    sendMessage,
    toggleMute,
  };
};
