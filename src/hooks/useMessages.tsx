import { useState, useEffect, useRef } from 'react';
import { supabase } from '../db/supabase';
import { MessageT, ConversationMemberT } from '../types';

export const useMessages = (conversationId: string | null | undefined) => {
  const [messages, setMessages] = useState<MessageT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const membersRef = useRef<ConversationMemberT[]>([]);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('messages')
          .select(
            `id, content, sender_id, conversation_id, message_type, is_edited, created_at, updated_at`,
          )
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        const formatted = (data || []).map((m: any) => ({
          id: m.id,
          conversation_id: m.conversation_id,
          content: m.content,
          sender_id: m.sender_id,
          message_type: m.message_type,
          is_edited: m.is_edited,
          created_at: m.created_at,
          updated_at: m.updated_at,
        }));

        setMessages(formatted);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessageData = payload.new as any;

          setMessages((prev) => {
            if (prev.some((msg) => msg.id === newMessageData.id)) {
              return prev;
            }

            return [
              ...prev,
              {
                id: newMessageData.id,
                conversation_id: newMessageData.conversation_id,
                content: newMessageData.content,
                sender_id: newMessageData.sender_id,
                message_type: newMessageData.message_type,
                is_edited: newMessageData.is_edited,
                created_at: newMessageData.created_at,
                updated_at: newMessageData.updated_at,
              },
            ];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const updateMembersRef = (members: ConversationMemberT[]) => {
    membersRef.current = members;
  };

  return { messages, setMessages, isLoading, updateMembersRef };
};
