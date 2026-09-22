import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../db/supabase';
import { PublicProfileT } from '../../../types';

export type GroupRole = 'admin' | 'moderator' | 'member';

export type GroupMemberAccess = {
  role: GroupRole;
  canKick: boolean;
  canChangePhoto: boolean;
  canClearMessages: boolean;
};

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
  const [memberAccess, setMemberAccess] = useState<
    Record<string, GroupMemberAccess>
  >({});
  const [groupCreatorId, setGroupCreatorId] = useState<string | null>(null);
  const [groupAvatarUrl, setGroupAvatarUrl] = useState<string | null>(null);
  const [membersVersion, setMembersVersion] = useState(0);
  const groupCreatorIdRef = useRef<string | null>(null);
  groupCreatorIdRef.current = groupCreatorId;

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
      setMemberAccess({});
      setGroupCreatorId(null);
      setGroupAvatarUrl(null);
      return;
    }

    let cancelled = false;

    const fetchInitialMembers = async () => {
      const conversationResult = await supabase
        .from('conversations')
        .select('type, created_by, avatar_url')
        .eq('id', activeConversationId)
        .maybeSingle();

      let conversation: {
        type: string | null;
        created_by: string | null;
        avatar_url: string | null;
      } | null = null;

      if (
        conversationResult.error &&
        /avatar_url/i.test(conversationResult.error.message || '')
      ) {
        const fallback = await supabase
          .from('conversations')
          .select('type, created_by')
          .eq('id', activeConversationId)
          .maybeSingle();
        conversation = fallback.data
          ? {
              type: fallback.data.type,
              created_by: fallback.data.created_by,
              avatar_url: null,
            }
          : null;
      } else if (conversationResult.data) {
        conversation = {
          type: conversationResult.data.type,
          created_by: conversationResult.data.created_by,
          avatar_url: conversationResult.data.avatar_url,
        };
      }
      const creatorId =
        conversation?.type === 'group' ? conversation.created_by || null : null;

      const withRole = await supabase
        .from('conversation_members')
        .select('user_id, role, can_kick, can_change_photo, can_clear_messages')
        .eq('conversation_id', activeConversationId);

      let memberRows = withRole.data as
        | {
            user_id: string;
            role?: string | null;
            can_kick?: boolean | null;
            can_change_photo?: boolean | null;
            can_clear_messages?: boolean | null;
          }[]
        | null;
      let memberError = withRole.error;
      if (memberError && /can_kick/i.test(memberError.message || '')) {
        const fallback = await supabase
          .from('conversation_members')
          .select('user_id, role')
          .eq('conversation_id', activeConversationId);
        memberRows = fallback.data;
        memberError = fallback.error;
      }
      if (memberError) {
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
          setMemberAccess({});
          setGroupCreatorId(creatorId);
          setGroupAvatarUrl(
            conversation?.type === 'group' ? conversation.avatar_url || null : null,
          );
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
      const access: Record<string, GroupMemberAccess> = {};
      for (const member of memberRows || []) {
        const id = String(member.user_id);
        const role: GroupRole =
          (creatorId != null && id === creatorId) || member.role === 'admin'
            ? 'admin'
            : member.role === 'moderator'
              ? 'moderator'
              : 'member';
        roles[id] = role;
        access[id] = {
          role,
          canKick: role === 'admin' || member.can_kick === true,
          canChangePhoto: role === 'admin' || member.can_change_photo === true,
          canClearMessages:
            role === 'admin' || member.can_clear_messages === true,
        };
      }

      if (!cancelled && profiles) {
        setConversationMembers(profiles);
        const isGroup = conversation?.type === 'group';
        setMemberRoles(isGroup ? roles : {});
        setMemberAccess(isGroup ? access : {});
        setGroupCreatorId(creatorId);
        setGroupAvatarUrl(isGroup ? conversation?.avatar_url || null : null);
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
          if (
            !userId ||
            (role !== 'admin' && role !== 'moderator' && role !== 'member')
          ) {
            return;
          }
          const nextRole: GroupRole =
            groupCreatorIdRef.current === userId ? 'admin' : role;
          setMemberRoles((prev) =>
            prev[userId] === nextRole ? prev : { ...prev, [userId]: nextRole },
          );
          setMemberAccess((prev) => {
            const current = prev[userId];
            const next = {
              role: nextRole,
              canKick:
                nextRole === 'admin' ||
                (payload.new.can_kick ?? current?.canKick) === true,
              canChangePhoto:
                nextRole === 'admin' ||
                (payload.new.can_change_photo ?? current?.canChangePhoto) ===
                  true,
              canClearMessages:
                nextRole === 'admin' ||
                (payload.new.can_clear_messages ?? current?.canClearMessages) ===
                  true,
            };
            if (
              current &&
              current.role === next.role &&
              current.canKick === next.canKick &&
              current.canChangePhoto === next.canChangePhoto &&
              current.canClearMessages === next.canClearMessages
            ) {
              return prev;
            }
            return { ...prev, [userId]: next };
          });
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
          setMemberAccess((prev) => {
            if (!(removedUserId in prev)) return prev;
            const next = { ...prev };
            delete next[removedUserId];
            return next;
          });
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
          filter: `id=eq.${activeConversationId}`,
        },
        (payload) => {
          const next = payload.new as {
            type?: string;
            avatar_url?: string | null;
            created_by?: string | null;
          };
          if (next.type && next.type !== 'group') return;
          if ('avatar_url' in (payload.new as object)) {
            setGroupAvatarUrl(next.avatar_url || null);
          }
          if (!next.created_by) return;
          const creatorId = String(next.created_by);
          groupCreatorIdRef.current = creatorId;
          setGroupCreatorId(creatorId);
          setMemberRoles((prev) =>
            prev[creatorId] && prev[creatorId] !== 'admin'
              ? { ...prev, [creatorId]: 'admin' }
              : prev,
          );
          setMemberAccess((prev) => {
            const current = prev[creatorId];
            if (!current || current.role === 'admin') return prev;
            return {
              ...prev,
              [creatorId]: {
                role: 'admin',
                canKick: true,
                canChangePhoto: true,
                canClearMessages: true,
              },
            };
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
    memberAccess,
    groupCreatorId,
    groupAvatarUrl,
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
