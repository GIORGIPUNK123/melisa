import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../db/supabase';
import { PublicProfileT, MessageT } from '../../types';
import { ChatHeader } from '../chat/ChatHeader';
import { MessageList } from '../chat/MessageList';
import { MessageInput } from '../chat/MessageInput';
import { EmptyChatState } from '../chat/EmptyChatState';
import { useMessages } from '../../hooks/useMessages';
import { useConversationMembers } from '../../hooks/useConversationMembers';
import {
  box,
  box_open,
  randomBytes,
  decodeUTF8,
  encodeUTF8,
  encodeBase64,
  decodeBase64,
} from 'tweetnacl-ts';
import { api } from '../../functions/instance';

export const ChatArea = (props: {
  conversationId?: string | null;
  onMembersChange?: (members: PublicProfileT[]) => void;
  onToggleChatInfo?: () => void;
  onToggleSidebar?: () => void;
  privateKey: string;
  onIncomingMessage?: (message: MessageT) => void;
}) => {
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // E2EE enabled: decrypt messages for display

  const decryptMessageContent = useCallback(
    async (message: MessageT, membersList: PublicProfileT[]) => {
      if (!message.content.startsWith('enc:')) {
        return message.content;
      }

      if (!currentUser || !props.privateKey) {
        return '[Encrypted message: locked]';
      }

      const senderId = message.sender_id;
      const senderPublicKey = membersList.find((m) => m.id === senderId)
        ?.public_key;
      const selfPublicKey = membersList.find((m) => m.id === currentUser.id)
        ?.public_key;

      if (!senderPublicKey || !selfPublicKey) {
        return '[Encrypted message: missing key]';
      }

      if (message.content.startsWith('enc:v2:')) {
        const parts = message.content.split(':');
        if (parts.length < 6) {
          return '[Encrypted message: invalid payload]';
        }

        const nonceSelf = decodeBase64(parts[2]);
        const cipherSelf = decodeBase64(parts[3]);
        const noncePeer = decodeBase64(parts[4]);
        const cipherPeer = decodeBase64(parts[5]);

        const nonce = senderId === currentUser.id ? nonceSelf : noncePeer;
        const cipher = senderId === currentUser.id ? cipherSelf : cipherPeer;
        const pubKey = senderId === currentUser.id ? selfPublicKey : senderPublicKey;

        const opened = box_open(
          cipher,
          nonce,
          decodeBase64(pubKey),
          decodeBase64(props.privateKey),
        );

        if (!opened) {
          return '[Encrypted message: failed to decrypt]';
        }

        return encodeUTF8(opened);
      }

      if (message.content.startsWith('enc:v1:')) {
        const parts = message.content.split(':');
        if (parts.length < 4) {
          return '[Encrypted message: invalid payload]';
        }

        if (senderId === currentUser.id) {
          return '[Encrypted message: sender copy not available]';
        }

        const nonce = decodeBase64(parts[2]);
        const cipher = decodeBase64(parts[3]);
        const opened = box_open(
          cipher,
          nonce,
          decodeBase64(senderPublicKey),
          decodeBase64(props.privateKey),
        );

        if (!opened) {
          return '[Encrypted message: failed to decrypt]';
        }

        return encodeUTF8(opened);
      }

      return '[Encrypted message: unknown format]';
    },
    [currentUser, props.privateKey],
  );

  const handleIncomingMessage = useCallback(
    (message: MessageT) => {
      if (!currentUser) return;
      if (message.sender_id !== currentUser.id) {
        props.onIncomingMessage?.(message);
      }
    },
    [currentUser, props.onIncomingMessage],
  );

  const { messages, setMessages, isLoading, updateMembersRef } = useMessages(
    props.conversationId,
    decryptMessageContent,
    handleIncomingMessage,
  );
  const { members, setMembers } = useConversationMembers(props.conversationId);

  const ensurePublicKey = useCallback(
    async (userId: string) => {
      const existing = members.find((m) => m.id === userId)?.public_key;
      if (existing) return existing;

      try {
        const { data } = await api.get<
          { result?: { public_key?: string | null } } | { public_key?: string | null }
        >(`/userinfo/${userId}`);
        const publicKey =
          (data as { public_key?: string | null }).public_key ??
          (data as { result?: { public_key?: string | null } }).result
            ?.public_key ??
          null;
        if (publicKey) {
          setMembers((prev) =>
            prev.map((m) => (m.id === userId ? { ...m, public_key: publicKey } : m)),
          );
        }
        return publicKey;
      } catch (err) {
        console.error('Failed to fetch public key:', err);
        return null;
      }
    },
    [members, setMembers],
  );

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setCurrentUser(session?.user ?? null);
    };
    getUser();
  }, []);

  useEffect(() => {
    updateMembersRef(members);
    props.onMembersChange?.(members);
  }, [members]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (props.conversationId) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [props.conversationId]);

  // console.log('currentUser:', currentUser);
  // console.log('privateKey: ', privateKey);
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !props.conversationId || !currentUser) return;

    const messageContent = messageInput.trim();
    const recipient = members.find((m) => m.id !== currentUser.id);
    if (!recipient) {
      alert('No recipient found for this conversation.');
      return;
    }

    const senderPublicKey = await ensurePublicKey(currentUser.id);
    const recipientPublicKey = await ensurePublicKey(recipient.id);

    if (!senderPublicKey || !recipientPublicKey) {
      alert('Missing encryption keys for this conversation.');
      return;
    }

    let encryptedContent = '';
    try {
      const nonceSelf = randomBytes(24);
      const noncePeer = randomBytes(24);

      const cipherSelf = box(
        decodeUTF8(messageContent),
        nonceSelf,
        decodeBase64(senderPublicKey),
        decodeBase64(props.privateKey),
      );

      const cipherPeer = box(
        decodeUTF8(messageContent),
        noncePeer,
        decodeBase64(recipientPublicKey),
        decodeBase64(props.privateKey),
      );

      encryptedContent = `enc:v2:${encodeBase64(nonceSelf)}:${encodeBase64(
        cipherSelf,
      )}:${encodeBase64(noncePeer)}:${encodeBase64(cipherPeer)}`;
    } catch (err) {
      console.error('Encryption failed:', err);
      alert('Failed to encrypt message.');
      return;
    }

    setMessageInput('');
    setIsSending(true);

    const tempId = `temp-${Date.now()}`;
    const now = new Date().toISOString();
    const tempMessage: MessageT = {
      id: tempId,
      conversation_id: props.conversationId,
      content: messageContent,
      sender_id: currentUser.id,
      message_type: 'text',
      is_edited: false,
      created_at: now,
      updated_at: now,
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: props.conversationId,
          sender_id: currentUser.id,
          content: encryptedContent,
          message_type: 'text',
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId
              ? { ...msg, id: data.id, created_at: data.created_at }
              : msg,
          ),
        );
      }

      setTimeout(() => inputRef.current?.focus(), 0);
    } catch (err) {
      console.error('Failed to send message:', err);
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      setMessageInput(messageContent);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  if (!props.conversationId) {
    return <EmptyChatState />;
  }

  return (
    <div className='flex flex-col flex-1 h-screen bg-slate-900'>
      <ChatHeader
        members={members}
        currentUserId={currentUser?.id}
        onToggleSidebar={props.onToggleSidebar!}
        onToggleChatInfo={props.onToggleChatInfo!}
      />

      <div className='flex-1 p-4 space-y-4 overflow-y-auto md:p-6'>
        <MessageList
          messages={messages}
          members={members}
          currentUserId={currentUser?.id}
          isLoading={isLoading}
          messagesEndRef={messagesEndRef}
        />
      </div>

      <MessageInput
        value={messageInput}
        onChange={setMessageInput}
        onSubmit={handleSendMessage}
        disabled={isSending}
        inputRef={inputRef}
      />
    </div>
  );
};
