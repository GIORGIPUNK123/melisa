import { useState, useEffect, useRef } from 'react';
import { supabase } from '../db/supabase';
import { Message, ConversationMember } from '../types';

export const useMessages = (conversationId: string | null | undefined) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const membersRef = useRef<ConversationMember[]>([]);

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
            `id, content, sender_id, created_at,
            users:sender_id(username, nickname)`,
          )
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        const formatted = (data || []).map((m: any) => ({
          id: m.id,
          content: m.content,
          sender_id: m.sender_id,
          sender_name: m.users?.nickname || m.users?.username || 'Unknown',
          created_at: m.created_at,
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

            const sender = membersRef.current.find(
              (m) => m.id === newMessageData.sender_id,
            );
            const senderName =
              sender?.nickname || sender?.username || 'Unknown';

            return [
              ...prev,
              {
                id: newMessageData.id,
                content: newMessageData.content,
                sender_id: newMessageData.sender_id,
                sender_name: senderName,
                created_at: newMessageData.created_at,
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

  const updateMembersRef = (members: ConversationMember[]) => {
    membersRef.current = members;
  };

  return { messages, setMessages, isLoading, updateMembersRef };
};
