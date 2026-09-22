import { useState, useEffect } from 'react';
import { supabase } from '../../../db/supabase';
import { PublicProfileT } from '../../../types';

export type GroupRole = 'admin' | 'member';

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
  const [memberRoles, setMemberRoles] = useState<Record<string, GroupRole>>({});
  const [groupCreatorId, setGroupCreatorId] = useState<string | null>(null);
  const [membersVersion, setMembersVersion] = useState(0);

  useEffect(() => {
    if (!activeConversationId) {
      setIsSidebarVisible(true);
    }
  }, [activeConversationId]);

  useEffect(() => {
    if (!activeConversationId) {
      setConversationMembers([]);
      setMembersConversationId(null);
      setMemberRoles({});
      setGroupCreatorId(null);
      return;
    }

    let cancelled = false;

    const fetchInitialMembers = async () => {
      const { data: conversation } = await supabase
        .from('conversations')
        .select('type, created_by')
        .eq('id', activeConversationId)
        .maybeSingle();

      const creatorId =
        conversation?.type === 'group' ? conversation.created_by || null : null;

      const withRole = await supabase
        .from('conversation_members')
        .select('user_id, role')
        .eq('conversation_id', activeConversationId);

      let memberRows = withRole.data as
        | { user_id: string; role?: string | null }[]
        | null;
      if (withRole.error) {
        const fallback = await supabase
          .from('conversation_members')
          .select('user_id')
          .eq('conversation_id', activeConversationId);
        if (fallback.error || !fallback.data) {
          console.error('Failed to fetch conversation members:', fallback.error);
          return;
        }
        memberRows = fallback.data;
      }

      const userIds = (memberRows || []).map((member) => member.user_id);
      if (userIds.length === 0) {
        if (!cancelled) {
          setConversationMembers([]);
          setMemberRoles({});
          setGroupCreatorId(creatorId);
          setMembersConversationId(activeConversationId);
        }
        return;
      }

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

      const roles: Record<string, GroupRole> = {};
      for (const member of memberRows || []) {
        const admin =
          member.role === 'admin' ||
          (creatorId != null && member.user_id === creatorId);
        roles[String(member.user_id)] = admin ? 'admin' : 'member';
      }

      if (!cancelled && profiles) {
        setConversationMembers(profiles);
        setMemberRoles(conversation?.type === 'group' ? roles : {});
        setGroupCreatorId(creatorId);
        setMembersConversationId(activeConversationId);
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
        () => {
          void fetchInitialMembers();
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversation_members',
          filter: `conversation_id=eq.${activeConversationId}`,
        },
        (payload) => {
          const userId = String(payload.new.user_id || '');
          const role = payload.new.role;
          if (!userId || (role !== 'admin' && role !== 'member')) return;
          setMemberRoles((prev) =>
            prev[userId] === role ? prev : { ...prev, [userId]: role },
          );
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
          const removedUserId = payload.old.user_id
            ? String(payload.old.user_id)
            : '';
          if (!removedUserId) {
            void fetchInitialMembers();
            return;
          }
          setConversationMembers((prev) =>
            prev.filter((member) => member.id !== removedUserId),
          );
          setMemberRoles((prev) => {
            if (!(removedUserId in prev)) return prev;
            const next = { ...prev };
            delete next[removedUserId];
            return next;
          });
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
  }, [activeConversationId, membersVersion]);

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
    memberRoles,
    groupCreatorId,
    refreshConversationMembers: () => setMembersVersion((version) => version + 1),
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
