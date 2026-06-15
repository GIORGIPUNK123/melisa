import { useState, useEffect } from 'react';
import { supabase } from '../db/supabase';
import { ConversationT } from '../types';
import { PostgrestError } from '@supabase/supabase-js';
import { QueryData } from '@supabase/supabase-js';
export const useConversations = (userId: string | undefined) => {
  const [conversations, setConversations] = useState<ConversationT[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchConversations = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      // Get all conversations the user is part of
      const { data: conversationMembers, error: membersError } = (await supabase
        .from('conversation_members')
        .select(`conversations(id, type)`)
        .eq('user_id', userId)) as {
        data: { conversations: { id: string; type: string } }[] | null;
        error: PostgrestError | null;
      };
      // console.log('conversationMembers: ', conversationMembers);
      if (membersError) throw membersError;

      // For each conversation, get the other user's info (for direct conversations)
      const convs: ConversationT[] = [];
      // console.log('Conversation Members:', conversationMembers);
      for (const member of conversationMembers || []) {
        const conv = member.conversations;

        if (conv.type === 'direct') {
          // Get the other member of the direct conversation
          const { data: otherMembers } = await supabase
            .from('conversation_members')
            .select(`last_message_at, users(id, nickname, avatar_url)`)
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
              lastMessageTime: otherMembers.last_message_at,
            });
          }
        }
      }
      convs.sort((a, b) => {
        const aTime = new Date(a.lastMessageTime || '').getTime() || 0;
        const bTime = new Date(b.lastMessageTime || '').getTime() || 0;
        return bTime - aTime;
      });
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
