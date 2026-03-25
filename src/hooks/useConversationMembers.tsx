import { useState, useEffect } from 'react';
import { supabase } from '../db/supabase';
import { PublicProfileT } from '../types';
import { api } from '../functions/instance';

export const useConversationMembers = (
  conversationId: string | null | undefined,
) => {
  const [members, setMembers] = useState<PublicProfileT[]>([]);

  useEffect(() => {
    if (!conversationId) {
      setMembers([]);
      return;
    }

    const fetchMembers = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        const response = await api.get<{
          conversationMembers: PublicProfileT[];
        }>(`/conversations/members/${conversationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setMembers(response.data.conversationMembers);
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

  // Subscribe to status changes for conversation members
  useEffect(() => {
    if (!conversationId || members.length === 0) return;

    const memberIds = members.map((m) => m.id);

    const statusChannel = supabase
      .channel(`members-status:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
        },
        (payload) => {
          const { id, status } = payload.new as {
            id: string;
            status: 'online' | 'offline' | 'away';
          };

          // Only update if this user is a member of the conversation
          if (memberIds.includes(id)) {
            setMembers((prev) =>
              prev.map((member) =>
                member.id === id ? { ...member, status } : member,
              ),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(statusChannel);
    };
  }, [conversationId, members]);

  return { members };
};
