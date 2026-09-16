import { useEffect, useMemo, useState } from 'react';
import { PublicProfileT } from '../../../types';
import { supabase } from '../../../db/supabase';

export const useConversationMembers = (
  conversationId: string | null | undefined,
  currentUserId: string | null | undefined,
) => {
  const [members, setMembers] = useState<PublicProfileT[]>([]);
  const [activeUserIds, setActiveUserIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!conversationId) {
      setMembers([]);
      return;
    }

    const fetchInitialMembers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('conversation_members')
          .select('user_id')
          .eq('conversation_id', conversationId);

        if (!error && data) {
          const userIds = data.map((m) => m.user_id);

          const { data: profiles, error: profilesError } = await supabase
            .from('public_profiles')
            .select('*')
            .in('id', userIds);

          if (profilesError) {
            console.error('Failed to fetch member profiles:', profilesError);
            return;
          }

          setMembers(profiles);
        }
      } catch (err) {
        console.error('Error fetching members:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialMembers();

    const dbChannel = supabase
      .channel(`db_members_${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_members',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMember: PublicProfileT = {
            id: payload.new.user_id,
            username: payload.new.username,
            nickname: payload.new.nickname,
            avatar_url: payload.new.avatar_url || undefined,
            status: payload.new.status,
            created_at: payload.new.created_at,
            updated_at: payload.new.updated_at,
            public_key: payload.new.public_key || undefined,
          };
          setMembers((prev) => [...prev, newMember]);
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'conversation_members',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMembers((prev) => prev.filter((m) => m.id !== payload.old.id));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(dbChannel);
    };
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId || !currentUserId) return;

    const presenceChannel = supabase.channel(
      `conversation_presence_${conversationId}`,
      {
        config: {
          presence: { key: currentUserId },
        },
      },
    );

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const onlineIds = Object.keys(state);
        setActiveUserIds(onlineIds);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ active_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [conversationId, currentUserId]);

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      if (a.id === currentUserId) return -1;
      if (b.id === currentUserId) return 1;
      return 0;
    });
  }, [members, currentUserId]);

  return {
    members: sortedMembers,
    activeUserIds,
    isLoading,
  };
};
