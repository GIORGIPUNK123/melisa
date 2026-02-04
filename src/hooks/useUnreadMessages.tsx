import { useState, useEffect } from 'react';
import { supabase } from '../db/supabase';

export const useUnreadMessages = (
  userId: string | undefined,
  activeConversationId: string | null | undefined,
) => {
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const fetchUnreadCounts = async () => {
    if (!userId) return;

    try {
      // Get all conversations the user is part of
      const { data: conversationMembers } = await supabase
        .from('conversation_members')
        .select('conversation_id, last_read_at')
        .eq('user_id', userId);

      if (!conversationMembers) return;

      const counts: Record<string, number> = {};

      // For each conversation, count unread messages
      for (const member of conversationMembers) {
        const { data: messages } = await supabase
          .from('messages')
          .select('id, sender_id, created_at')
          .eq('conversation_id', member.conversation_id)
          .neq('sender_id', userId)
          .order('created_at', { ascending: false });

        if (messages) {
          // Count messages after last_read_at or all messages if never read
          const unreadCount = member.last_read_at
            ? messages.filter(
                (msg) =>
                  new Date(msg.created_at) > new Date(member.last_read_at),
              ).length
            : messages.length;

          counts[member.conversation_id] = unreadCount;
        }
      }

      setUnreadCounts(counts);
    } catch (err) {
      console.error('Failed to fetch unread counts:', err);
    }
  };

  // Mark conversation as read when viewing it
  const markAsRead = async (conversationId: string) => {
    if (!userId) return;

    try {
      await supabase
        .from('conversation_members')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', userId);

      // Update local state
      setUnreadCounts((prev) => ({
        ...prev,
        [conversationId]: 0,
      }));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  useEffect(() => {
    fetchUnreadCounts();

    if (!userId) return;

    // Subscribe to new messages
    const channel = supabase
      .channel('unread_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchUnreadCounts();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Mark active conversation as read
  useEffect(() => {
    if (activeConversationId) {
      markAsRead(activeConversationId);
    }
  }, [activeConversationId]);

  return { unreadCounts, markAsRead, fetchUnreadCounts };
};
