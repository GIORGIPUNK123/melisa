import { useEffect, useState } from 'react';
import { PublicProfileT } from '../types';
import { supabase } from '../db/supabase';

export const useConversationMembers = (conversationId: string) => {
  const [members, setMembers] = useState<PublicProfileT[]>([]);
  const [activeUserIds, setActiveUserIds] = useState<string[]>([]);

  console.log('Conversation Members:', members);

  // 1. Fetch initial members and listen for database changes (someone getting added/removed)
  useEffect(() => {
    const fetchInitialMembers = async () => {
      const { data, error } = await supabase
        .from('conversation_members')
        .select('user_id') // Assuming a relation to a profiles table
        .eq('conversation_id', conversationId);

      if (!error && data) {
        // data is an array of conversation member records
        const userIds = data.map((m) => m.user_id);

        // Fetch user profiles for these IDs
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
    };

    fetchInitialMembers();

    const dbChannel = supabase
      .channel(`db_members_${conversationId}`)
      // if new member is added to the conversation
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
      // if a member is removed from the conversation
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'conversation_members',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          // Remove the user from the UI if they are kicked/leave
          setMembers((prev) => prev.filter((m) => m.id !== payload.old.id));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(dbChannel);
    };
  }, [conversationId]);

  // 2. Track Presence (Who is actively looking at this chat right now)
  useEffect(() => {
    // Dynamically scope the channel to the specific conversation ID
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
        // The keys of the presence state are the userIds we passed in the config
        const onlineIds = Object.keys(state);
        setActiveUserIds(onlineIds);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track that the current user is active in this specific conversation
          await presenceChannel.track({ active_at: new Date().toISOString() });
        }
      });

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [conversationId, currentUserId]);
  export { members };
};
