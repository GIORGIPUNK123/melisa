import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../db/supabase';
import { MessageT, PublicProfileT } from '../../../types';
import { buildEncryptedChatMessageContent } from '../utils/chatCrypto';
import { asId, sameId } from '../../../shared/utils/ids';

type DecryptMessageFn = (args: {
  message: MessageT;
  membersList: PublicProfileT[];
  currentUserId: string;
  privateKey: string;
}) => Promise<string>;

const messagesCache = new Map<string, MessageT[]>();

const memberIdsKey = (members: PublicProfileT[]) =>
  members
    .map((member) => member.id)
    .filter(Boolean)
    .slice()
    .sort()
    .join(',');

const normalizeMessage = (message: MessageT): MessageT => ({
  ...message,
  id: asId(message.id),
  conversation_id: asId(message.conversation_id),
  sender_id: asId(message.sender_id),
});

const sortMessages = (messages: MessageT[]) =>
  [...messages].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

const mergeServerAndLocal = (server: MessageT[], local: MessageT[]) => {
  const byId = new Map<string, MessageT>();

  for (const message of server) {
    byId.set(message.id, message);
  }

  for (const message of local) {
    if (message.id.startsWith('temp-')) {
      const alreadyOnServer = server.some(
        (row) =>
          sameId(row.sender_id, message.sender_id) &&
          Math.abs(
            new Date(row.created_at).getTime() -
              new Date(message.created_at).getTime(),
          ) < 8000,
      );
      if (!alreadyOnServer) {
        byId.set(message.id, message);
      }
      continue;
    }

    if (!byId.has(message.id)) {
      byId.set(message.id, message);
    }
  }

  return sortMessages([...byId.values()]);
};

export const useMessages = (
  conversationId: string | null | undefined,
  members: PublicProfileT[],
  currentUserId: string,
  privateKey: string,
  decryptMessage?: DecryptMessageFn,
  onMessageInserted?: (message: MessageT) => void,
) => {
  const conversationKey = conversationId ? asId(conversationId) : '';
  const membersKey = memberIdsKey(members);

  const [messages, setMessages] = useState<MessageT[]>(() =>
    conversationKey ? (messagesCache.get(conversationKey) ?? []) : [],
  );
  const [isLoading, setIsLoading] = useState(
    () => Boolean(conversationKey) && !messagesCache.has(conversationKey),
  );
  const [isSending, setIsSending] = useState(false);

  const decryptMessageRef = useRef(decryptMessage);
  const onMessageInsertedRef = useRef(onMessageInserted);
  const membersRef = useRef(members);
  const currentUserIdRef = useRef(currentUserId);

  useEffect(() => {
    decryptMessageRef.current = decryptMessage;
    onMessageInsertedRef.current = onMessageInserted;
    membersRef.current = members;
    currentUserIdRef.current = currentUserId;
  }, [decryptMessage, onMessageInserted, members, currentUserId]);

  const processMessages = async (
    rawMessages: MessageT[],
    membersList: PublicProfileT[],
  ) => {
    if (!decryptMessageRef.current) {
      return rawMessages.map(normalizeMessage);
    }

    return Promise.all(
      rawMessages.map(async (msg) => {
        const normalized = normalizeMessage(msg);
        try {
          const decryptedContent = await decryptMessageRef.current!({
            message: normalized,
            membersList,
            currentUserId: currentUserIdRef.current,
            privateKey,
          });
          return { ...normalized, content: decryptedContent };
        } catch (err) {
          console.error('Decryption failed for message:', normalized.id, err);
          return normalized;
        }
      }),
    );
  };

  useEffect(() => {
    if (!conversationKey) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    const cached = messagesCache.get(conversationKey);
    if (cached) {
      setMessages(cached);
      setIsLoading(false);
    } else {
      setMessages([]);
      setIsLoading(true);
    }

    if (!membersKey) return;

    let cancelled = false;

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationKey)
          .order('created_at', { ascending: true });

        if (error) throw error;
        if (cancelled || !data) return;

        const processed = await processMessages(
          data as MessageT[],
          membersRef.current,
        );
        if (cancelled) return;

        setMessages((prev) => {
          const next = mergeServerAndLocal(processed, prev);
          messagesCache.set(conversationKey, next);
          return next;
        });
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void fetchMessages();

    return () => {
      cancelled = true;
    };
  }, [conversationKey, membersKey, privateKey]);

  useEffect(() => {
    if (!conversationKey || !membersKey) return;

    void supabase.auth.getSession().then(({ data }) => {
      const token = data.session?.access_token;
      if (token) supabase.realtime.setAuth(token);
    });

    const channel = supabase
      .channel(`room:${conversationKey}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationKey}`,
        },
        async (payload) => {
          const incoming = normalizeMessage(payload.new as MessageT);
          const isOwn = sameId(incoming.sender_id, currentUserIdRef.current);

          setMessages((prev) => {
            if (prev.some((message) => sameId(message.id, incoming.id))) {
              return prev;
            }

            if (isOwn) {
              const tempIndex = prev.findIndex(
                (message) =>
                  message.id.startsWith('temp-') &&
                  sameId(message.sender_id, incoming.sender_id),
              );

              if (tempIndex >= 0) {
                const next = [...prev];
                next[tempIndex] = {
                  ...next[tempIndex],
                  id: incoming.id,
                  created_at: incoming.created_at,
                  updated_at: incoming.updated_at,
                };
                messagesCache.set(conversationKey, next);
                return next;
              }
            }

            const next = [...prev, incoming];
            messagesCache.set(conversationKey, next);
            return next;
          });

          if (decryptMessageRef.current && incoming.content.startsWith('enc:')) {
            try {
              const decryptedContent = await decryptMessageRef.current({
                message: incoming,
                membersList: membersRef.current,
                currentUserId: currentUserIdRef.current,
                privateKey,
              });
              setMessages((prev) => {
                const next = prev.map((message) =>
                  sameId(message.id, incoming.id) &&
                  message.content.startsWith('enc:')
                    ? { ...message, content: decryptedContent }
                    : message,
                );
                messagesCache.set(conversationKey, next);
                return next;
              });
            } catch (err) {
              console.error('Realtime context decryption failure:', err);
            }
          }

          if (!isOwn) {
            onMessageInsertedRef.current?.(incoming);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationKey, membersKey, privateKey]);

  const ensurePublicKey = async (userId: string): Promise<string | null> => {
    const member = membersRef.current.find((item) => sameId(item.id, userId));
    if (member?.public_key) return member.public_key;

    const { data } = await supabase
      .from('public_profiles')
      .select('public_key')
      .eq('id', userId)
      .single();

    return data?.public_key || null;
  };

  const sendMessage = async (text: string) => {
    const messageContent = text.trim();
    if (!messageContent || !conversationKey || !currentUserId || !privateKey) {
      return;
    }

    const recipient = membersRef.current.find(
      (member) => !sameId(member.id, currentUserId),
    );
    if (!recipient) {
      alert('No recipient found for this conversation.');
      return;
    }

    const { data: blockRows, error: blockError } = await supabase
      .from('blocks')
      .select('id')
      .or(
        `and(blocker_id.eq.${currentUserId},blocked_user_id.eq.${recipient.id}),and(blocker_id.eq.${recipient.id},blocked_user_id.eq.${currentUserId})`,
      )
      .limit(1);

    if (blockError) {
      console.error('Failed to check block status:', blockError);
    }

    if (blockRows && blockRows.length > 0) {
      alert("You can't message this user.");
      return;
    }

    setIsSending(true);
    const tempId = `temp-${Date.now()}`;

    try {
      const senderPublicKey = await ensurePublicKey(currentUserId);
      const recipientPublicKey = await ensurePublicKey(recipient.id);

      if (!senderPublicKey || !recipientPublicKey) {
        throw new Error('Missing encryption keys for this conversation.');
      }

      const encryptedContent = buildEncryptedChatMessageContent(
        messageContent,
        senderPublicKey,
        recipientPublicKey,
        privateKey,
      );

      const now = new Date().toISOString();
      const tempMessage: MessageT = {
        id: tempId,
        conversation_id: conversationKey,
        content: messageContent,
        sender_id: asId(currentUserId),
        message_type: 'text',
        is_edited: false,
        created_at: now,
        updated_at: now,
      };

      setMessages((prev) => {
        const next = [...prev, tempMessage];
        messagesCache.set(conversationKey, next);
        return next;
      });

      const [msgResult, memberResult] = await Promise.all([
        supabase
          .from('messages')
          .insert({
            conversation_id: conversationKey,
            sender_id: currentUserId,
            content: encryptedContent,
            message_type: 'text',
          })
          .select()
          .single(),
        supabase
          .from('conversation_members')
          .update({ last_message_at: new Date().toISOString() })
          .eq('conversation_id', conversationKey)
          .eq('user_id', currentUserId),
      ]);

      if (msgResult.error) throw msgResult.error;
      if (memberResult.error) {
        console.error('Failed to update last_message_at:', memberResult.error);
      }

      if (msgResult.data) {
        const saved = normalizeMessage(msgResult.data as MessageT);
        setMessages((prev) => {
          const alreadyConfirmed = prev.some((message) =>
            sameId(message.id, saved.id),
          );
          const next = alreadyConfirmed
            ? prev.filter((message) => message.id !== tempId)
            : prev.map((message) =>
                message.id === tempId
                  ? {
                      ...message,
                      id: saved.id,
                      created_at: saved.created_at,
                      updated_at: saved.updated_at,
                    }
                  : message,
              );
          messagesCache.set(conversationKey, next);
          return next;
        });
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setMessages((prev) => {
        const next = prev.filter((message) => message.id !== tempId);
        messagesCache.set(conversationKey, next);
        return next;
      });
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return {
    messages,
    setMessages,
    isLoading,
    sendMessage,
    isSending,
  };
};
