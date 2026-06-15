import { useState, useEffect, useRef } from 'react';
import { supabase } from '../db/supabase';
import { MessageT, PublicProfileT } from '../types';

type DecryptMessageFn = (
  message: MessageT,
  members: PublicProfileT[],
) => Promise<string>;

export const useMessages = (
  conversationId: string | null | undefined,
  decryptMessage?: DecryptMessageFn,
  onMessageInserted?: (message: MessageT) => void,
) => {
  const [messages, setMessages] = useState<MessageT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const membersRef = useRef<PublicProfileT[]>([]);
  const rawMessagesRef = useRef<MessageT[]>([]);
  const lastMessageAtRef = useRef<string | null>(null);
  const initialLoadDoneRef = useRef(false);
  const decryptMessageRef = useRef<DecryptMessageFn | undefined>(
    decryptMessage,
  );
  const onMessageInsertedRef = useRef(onMessageInserted);

  useEffect(() => {
    decryptMessageRef.current = decryptMessage;
  }, [decryptMessage]);

  useEffect(() => {
    onMessageInsertedRef.current = onMessageInserted;
  }, [onMessageInserted]);

  const decryptAndSet = async (rawMessages: MessageT[]) => {
    const activeDecryptMessage = decryptMessageRef.current;

    if (!activeDecryptMessage) {
      setMessages(rawMessages);
      return;
    }

    const decryptedMessages = await Promise.all(
      rawMessages.map(async (message) => {
        try {
          return {
            ...message,
            content: await activeDecryptMessage(message, membersRef.current),
          };
        } catch (err) {
          console.error('Failed to decrypt message:', err);
          return message;
        }
      }),
    );

    setMessages(decryptedMessages);
  };

  const upsertRawMessage = (message: MessageT) => {
    if (rawMessagesRef.current.some((msg) => msg.id === message.id)) {
      return;
    }

    rawMessagesRef.current = [...rawMessagesRef.current, message];
  };

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    initialLoadDoneRef.current = false;

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

        rawMessagesRef.current = formatted;
        lastMessageAtRef.current =
          formatted.length > 0
            ? formatted[formatted.length - 1].created_at
            : null;
        await decryptAndSet(formatted);
        initialLoadDoneRef.current = true;
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

    const ensureRealtimeAuth = async () => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (token) {
        supabase.realtime.setAuth(token);
      }
    };

    void ensureRealtimeAuth();

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

          const rawMessage: MessageT = {
            id: newMessageData.id,
            conversation_id: newMessageData.conversation_id,
            content: newMessageData.content,
            sender_id: newMessageData.sender_id,
            message_type: newMessageData.message_type,
            is_edited: newMessageData.is_edited,
            created_at: newMessageData.created_at,
            updated_at: newMessageData.updated_at,
          };

          upsertRawMessage(rawMessage);
          decryptAndSet(rawMessagesRef.current);
          if (initialLoadDoneRef.current) {
            onMessageInsertedRef.current?.(rawMessage);
          }
        },
      )
      .subscribe();

    // Polling fallback for this conversation in case realtime misses events
    let intervalId: number | null = null;
    const startPolling = () => {
      intervalId = window.setInterval(async () => {
        if (!conversationId) return;
        if (!initialLoadDoneRef.current) return;

        try {
          let query = supabase
            .from('messages')
            .select(
              'id, content, sender_id, conversation_id, message_type, is_edited, created_at, updated_at',
            )
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true })
            .limit(20);

          if (lastMessageAtRef.current) {
            query = query.gt('created_at', lastMessageAtRef.current);
          }

          const { data, error } = await query;
          if (error) return;

          const newRows = (data || []).map((m: any) => ({
            id: m.id,
            conversation_id: m.conversation_id,
            content: m.content,
            sender_id: m.sender_id,
            message_type: m.message_type,
            is_edited: m.is_edited,
            created_at: m.created_at,
            updated_at: m.updated_at,
          }));

          if (newRows.length === 0) return;

          newRows.forEach((row) => {
            upsertRawMessage(row);
            onMessageInsertedRef.current?.(row);
          });

          lastMessageAtRef.current = newRows[newRows.length - 1].created_at;
          decryptAndSet(rawMessagesRef.current);
        } catch (err) {
          console.error('Polling messages failed:', err);
        }
      }, 1000);
    };

    startPolling();

    return () => {
      supabase.removeChannel(channel);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [conversationId]);

  const updateMembersRef = (members: PublicProfileT[]) => {
    membersRef.current = members;
    if (rawMessagesRef.current.length > 0) {
      decryptAndSet(rawMessagesRef.current);
    }
  };

  return { messages, setMessages, isLoading, updateMembersRef };
};
