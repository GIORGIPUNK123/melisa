import { useEffect, useState } from 'react';
import { supabase } from '../../db/supabase';
import { PublicProfileT } from '../../types';
import { ChatHeader } from '../chat/ChatHeader';

interface Props {
  conversationId: string;
  currentUserId: string;
  onToggleSidebar?: () => void;
  onToggleChatInfo?: () => void;
}

export const Test = ({
  conversationId,
  currentUserId,
  onToggleSidebar,
  onToggleChatInfo,
}: Props) => {
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

    (presenceChannel as any)
      .on('presence', { event: 'sync' }, () => {
        const state = (presenceChannel as any).presenceState();
        // The keys of the presence state are the userIds we passed in the config
        const onlineIds = Object.keys(state);
        setActiveUserIds(onlineIds);
      })
      .on('presence', { event: 'diff' }, (diff: any) => {})
      .subscribe(async (status: any) => {
        if (status === 'SUBSCRIBED') {
          try {
            // Track that the current user is active in this specific conversation
            await (presenceChannel as any).track({
              active_at: new Date().toISOString(),
            });
          } catch (err) {
            console.error('presence.track failed', err);
          }
        }
      });

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [conversationId, currentUserId]);
  console.log('activeUserIds:', activeUserIds);
  return (
    <div className='flex flex-col flex-1 h-screen bg-slate-900'>
      <ChatHeader
        members={members}
        currentUserId={currentUserId}
        onToggleSidebar={onToggleSidebar!}
        onToggleChatInfo={onToggleChatInfo!}
        // presenceById={props.presenceById}
      />
      {members.map((member) => (
        <li key={member.id} className='flex items-center justify-between'>
          <span className='text-sm font-medium text-slate-700'>
            {member.username}
          </span>
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              activeUserIds.includes(member.id)
                ? 'bg-green-500'
                : 'bg-slate-300'
            }`}
            title={
              activeUserIds.includes(member.id)
                ? 'Online in this chat'
                : 'Offline'
            }
          />
        </li>
      ))}
    </div>
  );
};
