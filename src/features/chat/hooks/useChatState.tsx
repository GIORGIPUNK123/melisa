import { useState, useEffect } from 'react';
import { supabase } from '../../../db/supabase';
import { PublicProfileT } from '../../../types';

export const useChatState = () => {
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [conversationMembers, setConversationMembers] = useState<
    PublicProfileT[]
  >([]);
  const [membersConversationId, setMembersConversationId] = useState<
    string | null
  >(null);
  const [isChatInfoVisible, setIsChatInfoVisible] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [activeTab, setActiveTab] = useState<'chats' | 'friends'>('chats');
  const [isOpeningConversation, setIsOpeningConversation] = useState(false);

  useEffect(() => {
    if (!activeConversationId) {
      setIsSidebarVisible(true);
    }
  }, [activeConversationId]);

  useEffect(() => {
    if (!activeConversationId) {
      setConversationMembers([]);
      setMembersConversationId(null);
      return;
    }

    let cancelled = false;

    const fetchInitialMembers = async () => {
      const { data, error } = await supabase
        .from('conversation_members')
        .select('user_id')
        .eq('conversation_id', activeConversationId);

      if (!error && data) {
        const userIds = data.map((m) => m.user_id);

        const { data: profiles, error: profilesError } = await supabase
          .from('public_profiles')
          .select(
            'id, username, nickname, avatar_url, status, created_at, updated_at, last_seen_at, appear_offline, public_key',
          )
          .in('id', userIds);

        if (profilesError) {
          console.error('Failed to fetch member profiles:', profilesError);
          return;
        }
        if (!cancelled && profiles) {
          setConversationMembers(profiles);
          setMembersConversationId(activeConversationId);
        }
      }
    };

    fetchInitialMembers();

    const dbChannel = supabase
      .channel(`db_members_${activeConversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_members',
          filter: `conversation_id=eq.${activeConversationId}`,
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
            last_seen_at: payload.new.last_seen_at,
            appear_offline: payload.new.appear_offline,
            public_key: payload.new.public_key || undefined,
          };
          setConversationMembers((prev) => [...prev, newMember]);
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'conversation_members',
          filter: `conversation_id=eq.${activeConversationId}`,
        },
        (payload) => {
          setConversationMembers((prev) =>
            prev.filter((m) => m.id !== payload.old.id),
          );
        },
      )
      .subscribe();

    const presenceChannel = supabase
      .channel(`member_presence_${activeConversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_presence',
        },
        (payload) => {
          const presence = payload.new as {
            user_id?: string;
            last_seen_at?: string | null;
            appear_offline?: boolean;
          };
          if (!presence?.user_id) return;

          setConversationMembers((prev) => {
            if (!prev.some((member) => member.id === presence.user_id)) {
              return prev;
            }

            return prev.map((member) =>
              member.id === presence.user_id
                ? {
                    ...member,
                    last_seen_at: presence.last_seen_at,
                    appear_offline: presence.appear_offline,
                  }
                : member,
            );
          });
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(dbChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [activeConversationId]);

  const handleFriendSelect = (conversationId: string) => {
    setActiveConversationId(conversationId);
  };

  const toggleChatInfo = () => {
    setIsChatInfoVisible(!isChatInfoVisible);
  };

  const beginConversationTransition = () => {
    setActiveTab('chats');
    setIsSidebarVisible(false);
    setIsOpeningConversation(true);
  };

  const endConversationTransition = () => {
    setIsOpeningConversation(false);
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const closeSidebar = () => {
    setIsSidebarVisible(false);
  };

  const closeChatInfo = () => {
    setIsChatInfoVisible(false);
  };

  const selectConversationAndSwitchToChats = (conversationId: string) => {
    handleFriendSelect(conversationId);
    closeSidebar();
  };

  const clearActiveConversation = () => {
    setActiveConversationId(null);
    setConversationMembers([]);
    setMembersConversationId(null);
    setIsOpeningConversation(false);
    setIsChatInfoVisible(false);
  };

  return {
    activeConversationId,
    conversationMembers,
    membersConversationId,
    isChatInfoVisible,
    isSidebarVisible,
    activeTab,
    setActiveTab,
    handleFriendSelect,
    toggleChatInfo,
    toggleSidebar,
    closeSidebar,
    closeChatInfo,
    beginConversationTransition,
    endConversationTransition,
    isOpeningConversation,
    selectConversationAndSwitchToChats,
    clearActiveConversation,
  };
};
