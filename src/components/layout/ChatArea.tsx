import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../db/supabase';
import { PublicProfileT, MessageT } from '../../types';
import { ChatHeader } from '../chat/ChatHeader';
import { MessageList } from '../chat/MessageList';
import { MessageInput } from '../chat/MessageInput';
import { EmptyChatState } from '../chat/EmptyChatState';
import { useMessages } from '../../hooks/useMessages';
import { useConversationMembers } from '../../hooks/useConversationMembers';

export const ChatArea = (props: {
  conversationId?: string | null;
  onMembersChange?: (members: PublicProfileT[]) => void;
  onToggleChatInfo?: () => void;
  onToggleSidebar?: () => void;
}) => {
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, setMessages, isLoading, updateMembersRef } = useMessages(
    props.conversationId,
  );
  const { members } = useConversationMembers(props.conversationId);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);
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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !props.conversationId || !currentUser) return;

    const messageContent = messageInput.trim();
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
          content: messageContent,
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
