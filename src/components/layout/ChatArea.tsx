import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { supabase } from '../../db/supabase';
import { PublicProfileT, MessageT } from '../../types';
import { ChatHeader } from '../chat/ChatHeader';
import { MessageList } from '../chat/MessageList';
import { MessageInput } from '../chat/MessageInput';
import { useMessages } from '../../hooks/useMessages';
import { useConversationMembers } from '../../hooks/useConversationMembers';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../functions/instance';
import type { PresenceMap } from '../../hooks/useHeartbeat';
import {
  buildEncryptedChatMessageContent,
  decryptChatMessageContent,
} from './chatCrypto';

export const ChatArea = (props: {
  conversationId: string;
  onMembersChange?: (members: PublicProfileT[]) => void;
  onToggleChatInfo?: () => void;
  onToggleSidebar?: () => void;
  privateKey: string;
  onIncomingMessage?: (message: MessageT) => void;
  presenceById?: PresenceMap;
  ensureTargetSubscription?: (userId: string) => void;
}) => {
  // const [messageInput, setMessageInput] = useState('');
  // const [isSending, setIsSending] = useState(false);
  const { user } = useAuth();
  const currentUser = useMemo(
    () => (user && user !== 'loading' ? user : null),
    [user],
  );
  // const messagesEndRef = useRef<HTMLDivElement>(null);
  // const inputRef = useRef<HTMLInputElement>(null);

  // const decryptMessageContent = useCallback(
  //   async (message: MessageT, membersList: PublicProfileT[]) => {
  //     return decryptChatMessageContent({
  //       message,
  //       membersList,
  //       currentUserId: currentUser?.id ?? null,
  //       privateKey: props.privateKey,
  //     });
  //   },
  //   [currentUser, props.privateKey],
  // );

  // const handleIncomingMessage = useCallback(
  //   (message: MessageT) => {
  //     if (!currentUser) return;
  //     if (message.sender_id !== currentUser.id) {
  //       props.onIncomingMessage?.(message);
  //     }
  //   },
  //   [currentUser, props.onIncomingMessage],
  // );

  // const { messages, setMessages, isLoading, updateMembersRef } = useMessages(
  //   props.conversationId,
  //   decryptMessageContent,
  //   handleIncomingMessage,
  // );
  // console.log('Decrypted messages:', messages);
  const { members, setMembers } = useConversationMembers(
    props.conversationId,
    props.presenceById,
    props.ensureTargetSubscription,
  );

  // const ensurePublicKey = useCallback(
  //   async (userId: string) => {
  //     const existing = members.find((m) => m.id === userId)?.public_key;
  //     if (existing) return existing;

  //     try {
  //       const { data } = await api.get<
  //         | { result?: { public_key?: string | null } }
  //         | { public_key?: string | null }
  //       >(`/userinfo/${userId}`);
  //       const publicKey =
  //         (data as { public_key?: string | null }).public_key ??
  //         (data as { result?: { public_key?: string | null } }).result
  //           ?.public_key ??
  //         null;
  //       if (publicKey) {
  //         setMembers((prev) =>
  //           prev.map((m) =>
  //             m.id === userId ? { ...m, public_key: publicKey } : m,
  //           ),
  //         );
  //       }
  //       return publicKey;
  //     } catch (err) {
  //       console.error('Failed to fetch public key:', err);
  //       return null;
  //     }
  //   },
  //   [members, setMembers],
  // );

  // useEffect(() => {
  //   updateMembersRef(members);
  //   props.onMembersChange?.(members);
  // }, [members]);

  // useEffect(() => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  // }, [messages]);

  // useEffect(() => {
  //   if (props.conversationId) {
  //     setTimeout(() => {
  //       messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  //     }, 100);
  //   }
  // }, [props.conversationId]);

  // const handleSendMessage = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!messageInput.trim() || !props.conversationId || !currentUser) return;

  //   const messageContent = messageInput.trim();
  //   const recipient = members.find((m) => m.id !== currentUser.id);
  //   if (!recipient) {
  //     alert('No recipient found for this conversation.');
  //     return;
  //   }

  //   const senderPublicKey = await ensurePublicKey(currentUser.id);
  //   const recipientPublicKey = await ensurePublicKey(recipient.id);
  //   const tempId = `temp-${Date.now()}`;

  //   if (!senderPublicKey || !recipientPublicKey) {
  //     alert('Missing encryption keys for this conversation.');
  //     return;
  //   }

  //   try {
  //     const encryptedContent = buildEncryptedChatMessageContent(
  //       messageContent,
  //       senderPublicKey,
  //       recipientPublicKey,
  //       props.privateKey,
  //     );

  //     setMessageInput('');
  //     setIsSending(true);

  //     const now = new Date().toISOString();
  //     const tempMessage: MessageT = {
  //       id: tempId,
  //       conversation_id: props.conversationId,
  //       content: messageContent,
  //       sender_id: currentUser.id,
  //       message_type: 'text',
  //       is_edited: false,
  //       created_at: now,
  //       updated_at: now,
  //     };
  //     setMessages((prev) => [...prev, tempMessage]);

  //     const { data, error } = await supabase
  //       .from('messages')
  //       .insert({
  //         conversation_id: props.conversationId,
  //         sender_id: currentUser.id,
  //         content: encryptedContent,
  //         message_type: 'text',
  //       })
  //       .select()
  //       .single();
  //     const { data: updateTimeData, error: updateError } = await supabase
  //       .from('conversation_members')
  //       .update({ last_message_at: new Date().toISOString() })
  //       .eq('conversation_id', props.conversationId)
  //       .eq('user_id', currentUser.id);
  //     if (error) throw error;
  //     if (updateError)
  //       console.error('Failed to update last_message_at:', updateError);
  //     if (data) {
  //       setMessages((prev) =>
  //         prev.map((msg) =>
  //           msg.id === tempId
  //             ? { ...msg, id: data.id, created_at: data.created_at }
  //             : msg,
  //         ),
  //       );
  //     }

  //     setTimeout(() => inputRef.current?.focus(), 0);
  //   } catch (err) {
  //     console.error('Failed to send message:', err);
  //     setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
  //     setMessageInput(messageContent);
  //     alert('Failed to send message. Please try again.');
  //   } finally {
  //     setIsSending(false);
  //   }
  // };

  return (
    <div className='flex flex-col flex-1 h-screen bg-slate-900'>
      <ChatHeader
        members={members}
        currentUserId={currentUser?.id}
        onToggleSidebar={props.onToggleSidebar!}
        onToggleChatInfo={props.onToggleChatInfo!}
        presenceById={props.presenceById}
      />

      <div className='flex-1 p-4 space-y-4 overflow-y-auto md:p-6'>
        {/* <MessageList
          messages={messages}
          members={members}
          currentUserId={currentUser?.id}
          isLoading={isLoading}
          messagesEndRef={messagesEndRef}
        /> */}
      </div>

      {/* <MessageInput
        value={messageInput}
        onChange={setMessageInput}
        onSubmit={handleSendMessage}
        disabled={isSending}
        inputRef={inputRef}
      /> */}
    </div>
  );
};
