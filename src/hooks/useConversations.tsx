import { useState, useEffect } from 'react';
import { supabase } from '../db/supabase';

export interface Conversation {
  id: string;
  type: string;
  name?: string;
  otherUserNickname: string;
  otherUserAvatar?: string;
  otherUserId: string;
  lastMessageTime?: string;
}

export const useConversations = (userId: string | undefined) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchConversations = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      // Get all conversations the user is part of
      const { data: conversationMembers, error: membersError } = await supabase
        .from('conversation_members')
        .select(
          `
          conversation_id,
          conversations(id, type, name, created_by)
        `,
        )
        .eq('user_id', userId);

      if (membersError) throw membersError;

      // For each conversation, get the other user's info (for direct conversations)
      const convs: Conversation[] = [];

      for (const member of conversationMembers || []) {
        const conv = member.conversations as any;

        if (conv.type === 'direct') {
          // Get the other member of the direct conversation
          const { data: otherMembers } = await supabase
            .from('conversation_members')
            .select(
              `
              user_id,
              users(id, nickname, avatar_url)
            `,
            )
            .eq('conversation_id', conv.id)
            .neq('user_id', userId)
            .single();

          if (otherMembers?.users) {
            const otherUser = otherMembers.users as any;
            convs.push({
              id: conv.id,
              type: conv.type,
              otherUserNickname: otherUser.nickname,
              otherUserAvatar: otherUser.avatar_url,
              otherUserId: otherUser.id,
            });
          }
        }
      }

      setConversations(convs);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();

    if (!userId) return;

    // Subscribe to conversation members changes
    const channel = supabase
      .channel(`user_conversations:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversation_members',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchConversations();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { conversations, isLoading, fetchConversations };
};
