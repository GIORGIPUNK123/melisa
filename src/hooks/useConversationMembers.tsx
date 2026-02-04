import { useState, useEffect } from 'react';
import { supabase } from '../db/supabase';
import { ConversationMemberT } from '../types';

export const useConversationMembers = (
  conversationId: string | null | undefined,
) => {
  const [members, setMembers] = useState<ConversationMemberT[]>([]);

  useEffect(() => {
    if (!conversationId) {
      setMembers([]);
      return;
    }

    const fetchMembers = async () => {
      try {
        const { data, error } = await supabase
          .from('conversation_members')
          .select('user_id, users!inner(id, username, nickname, avatar_url)')
          .eq('conversation_id', conversationId);

        if (error) throw error;

        const formatted = (data || []).map((m: any) => ({
          id: m.users.id,
          username: m.users.username,
          nickname: m.users.nickname,
          avatar_url: m.users.avatar_url,
        }));

        setMembers(formatted);
      } catch (err) {
        console.error('Failed to fetch members:', err);
      }
    };

    fetchMembers();

    const channel = supabase
      .channel(`members:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversation_members',
          filter: `conversation_id=eq.${conversationId}`,
        },
        fetchMembers,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  return { members };
};
