import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../../../db/supabase';
import { sameId } from '../../../shared/utils/ids';

export const useUnreadMessages = (
  userId: string | undefined,
  activeConversationId: string | null | undefined,
  onIncomingMessage?: (conversationId: string) => void,
) => {
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const activeConversationIdRef = useRef(activeConversationId);
  activeConversationIdRef.current = activeConversationId;
  const onIncomingMessageRef = useRef(onIncomingMessage);
  onIncomingMessageRef.current = onIncomingMessage;

  const markAsRead = useCallback(
    async (conversationId: string) => {
      if (!userId || !conversationId) return;

      setUnreadCounts((prev) =>
        prev[conversationId] === 0
          ? prev
          : {
              ...prev,
              [conversationId]: 0,
            },
      );

      try {
        const { error } = await supabase
          .from('conversation_members')
          .update({ last_read_at: new Date().toISOString() })
          .eq('conversation_id', conversationId)
          .eq('user_id', userId);

        if (error) {
          console.error('Failed to mark as read:', error);
        }
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    },
    [userId],
  );

  const bumpUnread = useCallback(
    (conversationId: string) => {
      if (sameId(conversationId, activeConversationIdRef.current)) {
        void markAsRead(conversationId);
        return;
      }

      setUnreadCounts((prev) => ({
        ...prev,
        [conversationId]: (prev[conversationId] || 0) + 1,
      }));
    },
    [markAsRead],
  );

  const fetchUnreadCounts = useCallback(async () => {
    if (!userId) return;

    try {
      const { data: conversationMembers } = await supabase
        .from('conversation_members')
        .select('conversation_id, last_read_at')
        .eq('user_id', userId);

      if (!conversationMembers) return;

      const counts: Record<string, number> = {};
      const viewingId = activeConversationIdRef.current;

      for (const member of conversationMembers) {
        if (member.conversation_id === viewingId) {
          counts[member.conversation_id] = 0;
          continue;
        }

        const lastRead = member.last_read_at
          ? new Date(member.last_read_at)
          : null;

        const [{ data: messages }, { data: reactions }] = await Promise.all([
          supabase
            .from('messages')
            .select('id, sender_id, created_at')
            .eq('conversation_id', member.conversation_id)
            .neq('sender_id', userId)
            .order('created_at', { ascending: false }),
          supabase
            .from('message_reactions')
            .select('id, user_id, created_at')
            .eq('conversation_id', member.conversation_id)
            .neq('user_id', userId)
            .order('created_at', { ascending: false }),
        ]);

        const unreadMessages = messages
          ? lastRead
            ? messages.filter((msg) => new Date(msg.created_at) > lastRead)
                .length
            : messages.length
          : 0;

        const unreadReactions = reactions
          ? lastRead
            ? reactions.filter((row) => new Date(row.created_at) > lastRead)
                .length
            : reactions.length
          : 0;

        counts[member.conversation_id] = unreadMessages + unreadReactions;
      }

      if (viewingId) {
        counts[viewingId] = 0;
      }

      setUnreadCounts(counts);
    } catch (err) {
      console.error('Failed to fetch unread counts:', err);
    }
  }, [userId]);

  useEffect(() => {
    void fetchUnreadCounts();

    if (!userId) return;

    void supabase.auth.getSession().then(({ data }) => {
      const token = data.session?.access_token;
      if (token) supabase.realtime.setAuth(token);
    });

    const channel = supabase
      .channel('unread_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMessage = payload.new as {
            id?: string;
            conversation_id?: string;
            sender_id?: string;
          };

          if (
            !newMessage.sender_id ||
            sameId(newMessage.sender_id, userId) ||
            !newMessage.conversation_id
          ) {
            return;
          }

          const conversationId = String(newMessage.conversation_id);
          onIncomingMessageRef.current?.(conversationId);
          bumpUnread(conversationId);
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_reactions',
        },
        (payload) => {
          const reaction = payload.new as {
            id?: string;
            conversation_id?: string;
            user_id?: string;
          };

          if (
            !reaction.user_id ||
            sameId(reaction.user_id, userId) ||
            !reaction.conversation_id
          ) {
            return;
          }

          const conversationId = String(reaction.conversation_id);
          onIncomingMessageRef.current?.(conversationId);
          bumpUnread(conversationId);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchUnreadCounts, bumpUnread]);

  useEffect(() => {
    if (activeConversationId) {
      void markAsRead(activeConversationId);
    }
  }, [activeConversationId, markAsRead]);

  const visibleUnreadCounts = useMemo(() => {
    if (!activeConversationId) return unreadCounts;
    if (unreadCounts[activeConversationId] === 0) return unreadCounts;

    return {
      ...unreadCounts,
      [activeConversationId]: 0,
    };
  }, [unreadCounts, activeConversationId]);

  return { unreadCounts: visibleUnreadCounts, markAsRead, fetchUnreadCounts };
};
