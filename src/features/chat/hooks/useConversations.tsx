import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../../db/supabase';
import { ConversationT } from '../../../types';
import { PostgrestError } from '@supabase/supabase-js';
import { asId } from '../../../shared/utils/ids';

const MEMBERSHIP_WITH_MUTE =
  'muted, last_message_at, conversations(id, type, name, avatar_url, last_message_at)';
const MEMBERSHIP_WITHOUT_ACTIVITY =
  'muted, last_message_at, conversations(id, type, name)';
const MEMBERSHIP_WITHOUT_MUTE = 'last_message_at, conversations(id, type, name)';

type ConversationRow = {
  id: string;
  type: string;
  name?: string | null;
  avatar_url?: string | null;
  last_message_at?: string | null;
};

type MembershipRow = {
  muted?: boolean | null;
  last_message_at: string | null;
  conversations: ConversationRow | ConversationRow[] | null;
};

let loggedMissingMuteColumn = false;

const isMissingMutedColumn = (error: PostgrestError | null) => {
  if (!error) return false;
  const message = error.message || '';
  return (
    error.code === '42703' ||
    error.code === 'PGRST204' ||
    (/muted/i.test(message) && /does not exist|schema cache/i.test(message))
  );
};

const conversationFromRow = (row: MembershipRow['conversations']) => {
  if (!row) return null;
  return Array.isArray(row) ? row[0] : row;
};

const latestTimestamp = (...values: (string | null | undefined)[]) => {
  const times = values
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value).getTime())
    .filter((value) => !Number.isNaN(value));

  if (times.length === 0) return undefined;
  return new Date(Math.max(...times)).toISOString();
};

const sortByLatestMessage = (conversations: ConversationT[]) =>
  [...conversations].sort((a, b) => {
    const aTime = new Date(a.lastMessageTime || '').getTime() || 0;
    const bTime = new Date(b.lastMessageTime || '').getTime() || 0;
    return bTime - aTime;
  });

type PendingMute = {
  muted: boolean;
  revision: number;
};

const logMissingMuteColumn = () => {
  if (loggedMissingMuteColumn) return;
  loggedMissingMuteColumn = true;
  console.error(
    'Chat mute needs conversation_members.muted. Run: alter table public.conversation_members add column if not exists muted boolean not null default false;',
  );
};

export const useConversations = (userId: string | undefined) => {
  const [conversations, setConversations] = useState<ConversationT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [muteAvailable, setMuteAvailable] = useState(true);
  const [muteError, setMuteError] = useState<{
    conversationId: string;
    message: string;
  } | null>(null);
  const [savingMuteId, setSavingMuteId] = useState<string | null>(null);
  const userIdRef = useRef(userId);
  userIdRef.current = userId;
  const conversationsRef = useRef(conversations);
  conversationsRef.current = conversations;
  const muteColumnAvailableRef = useRef(true);
  const muteRevisionRef = useRef(0);
  const pendingMuteRef = useRef<Map<string, PendingMute>>(new Map());
  const confirmedMuteRevisionRef = useRef<Map<string, number>>(new Map());

  const markMuteUnavailable = useCallback(() => {
    muteColumnAvailableRef.current = false;
    setMuteAvailable(false);
    logMissingMuteColumn();
  }, []);

  const fetchConversations = useCallback(async (showLoading = false) => {
    const currentUserId = userIdRef.current;
    if (!currentUserId) return;

    if (showLoading) setIsLoading(true);
    const fetchRevision = muteRevisionRef.current;
    try {
      const selection = muteColumnAvailableRef.current
        ? MEMBERSHIP_WITH_MUTE
        : MEMBERSHIP_WITHOUT_MUTE;

      let { data: conversationMembers, error: membersError } = (await supabase
        .from('conversation_members')
        .select(selection)
        .eq('user_id', currentUserId)) as {
        data: MembershipRow[] | null;
        error: PostgrestError | null;
      };

      if (
        membersError &&
        /conversations\.avatar_url/i.test(membersError.message || '')
      ) {
        const withoutPhoto = (await supabase
          .from('conversation_members')
          .select(selection.replace(', avatar_url', ''))
          .eq('user_id', currentUserId)) as {
          data: MembershipRow[] | null;
          error: PostgrestError | null;
        };
        conversationMembers = withoutPhoto.data;
        membersError = withoutPhoto.error;
      }

      if (
        membersError &&
        /conversations\.last_message_at/i.test(membersError.message || '')
      ) {
        const withoutActivity = (await supabase
          .from('conversation_members')
          .select(
            muteColumnAvailableRef.current
              ? MEMBERSHIP_WITHOUT_ACTIVITY
              : MEMBERSHIP_WITHOUT_MUTE,
          )
          .eq('user_id', currentUserId)) as {
          data: MembershipRow[] | null;
          error: PostgrestError | null;
        };
        conversationMembers = withoutActivity.data;
        membersError = withoutActivity.error;
      }

      if (membersError && isMissingMutedColumn(membersError)) {
        markMuteUnavailable();
        const fallback = (await supabase
          .from('conversation_members')
          .select(MEMBERSHIP_WITHOUT_MUTE)
          .eq('user_id', currentUserId)) as {
          data: MembershipRow[] | null;
          error: PostgrestError | null;
        };
        conversationMembers = fallback.data;
        membersError = fallback.error;
      }

      if (membersError) throw membersError;

      const convs: ConversationT[] = [];

      for (const member of conversationMembers || []) {
        const conv = conversationFromRow(member.conversations);
        if (!conv?.id || (conv.type !== 'direct' && conv.type !== 'group')) {
          continue;
        }

        if (conv.type === 'group') {
          const groupName = conv.name?.trim() || 'Group';
          convs.push({
            id: asId(conv.id),
            type: conv.type,
            name: groupName,
            otherUserNickname: groupName,
            otherUserAvatar: conv.avatar_url || undefined,
            otherUserId: '',
            lastMessageTime: latestTimestamp(
              member.last_message_at,
              conv.last_message_at,
            ),
            muted: member.muted === true,
          });
          continue;
        }

        const { data: otherMember } = await supabase
          .from('conversation_members')
          .select('user_id, last_message_at')
          .eq('conversation_id', conv.id)
          .neq('user_id', currentUserId)
          .maybeSingle();

        if (!otherMember?.user_id) continue;

        const { data: profile } = await supabase
          .from('public_profiles')
          .select('id, nickname, avatar_url')
          .eq('id', otherMember.user_id)
          .maybeSingle();

        if (!profile) continue;

        convs.push({
          id: asId(conv.id),
          type: conv.type,
          otherUserNickname: profile.nickname,
          otherUserAvatar: profile.avatar_url || undefined,
          otherUserId: asId(profile.id),
          lastMessageTime: latestTimestamp(
            member.last_message_at,
            otherMember.last_message_at,
            conv.last_message_at,
          ),
          muted: member.muted === true,
        });
      }

      const merged = convs.map((conversation) => {
        const pending = pendingMuteRef.current.get(conversation.id);
        const confirmed =
          confirmedMuteRevisionRef.current.get(conversation.id) ?? 0;
        const serverMuted = conversation.muted;

        if (pending && pending.revision > fetchRevision) {
          return { ...conversation, muted: pending.muted };
        }

        if (confirmed > fetchRevision) {
          const local = conversationsRef.current.find(
            (row) => row.id === conversation.id,
          );
          return {
            ...conversation,
            muted: local?.muted ?? pending?.muted ?? serverMuted,
          };
        }

        if (pending && pending.muted !== serverMuted) {
          return { ...conversation, muted: pending.muted };
        }

        if (pending && pending.muted === serverMuted) {
          confirmedMuteRevisionRef.current.set(conversation.id, pending.revision);
          pendingMuteRef.current.delete(conversation.id);
        }

        return conversation;
      });

      setConversations(sortByLatestMessage(merged));
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [markMuteUnavailable]);

  useEffect(() => {
    void fetchConversations(true);

    if (!userId) return;

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
          void fetchConversations();
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        () => {
          void fetchConversations();
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
        },
        (payload) => {
          const row = payload.new as {
            id?: string | number;
            name?: string | null;
            avatar_url?: string | null;
          };
          if (row?.id == null) return;
          const id = asId(row.id);
          setConversations((prev) =>
            prev.map((conversation) => {
              if (conversation.id !== id || conversation.type !== 'group') {
                return conversation;
              }
              return {
                ...conversation,
                otherUserNickname:
                  row.name?.trim() || conversation.otherUserNickname,
                otherUserAvatar:
                  'avatar_url' in (payload.new as object)
                    ? row.avatar_url || undefined
                    : conversation.otherUserAvatar,
              };
            }),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchConversations]);

  const bumpConversation = useCallback((conversationId: string) => {
    const id = asId(conversationId);

    setConversations((prev) => {
      if (!prev.some((conversation) => conversation.id === id)) {
        void fetchConversations();
        return prev;
      }

      return sortByLatestMessage(
        prev.map((conversation) =>
          conversation.id === id
            ? { ...conversation, lastMessageTime: new Date().toISOString() }
            : conversation,
        ),
      );
    });
  }, [fetchConversations]);

  const setConversationMuted = useCallback(
    async (conversationId: string, muted: boolean) => {
      const currentUserId = userIdRef.current;
      const id = asId(conversationId);
      if (!currentUserId) return false;

      if (!muteColumnAvailableRef.current) {
        setMuteError({
          conversationId: id,
          message:
            'Mute is not saved yet. Add the muted column in Supabase, then try again.',
        });
        return false;
      }

      const previousMuted = Boolean(
        conversationsRef.current.find((conversation) => conversation.id === id)
          ?.muted,
      );

      const revision = ++muteRevisionRef.current;
      pendingMuteRef.current.set(id, { muted, revision });
      setMuteError(null);
      setSavingMuteId(id);
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === id ? { ...conversation, muted } : conversation,
        ),
      );

      const { data: updatedRows, error } = await supabase
        .from('conversation_members')
        .update({ muted })
        .eq('conversation_id', id)
        .eq('user_id', currentUserId)
        .select('conversation_id');

      setSavingMuteId((current) => {
        const pending = pendingMuteRef.current.get(id);
        if (pending && pending.revision !== revision) return current;
        return current === id ? null : current;
      });

      if (!error && updatedRows && updatedRows.length > 0) return true;

      const pending = pendingMuteRef.current.get(id);
      if (!pending || pending.revision !== revision) return false;

      pendingMuteRef.current.delete(id);
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === id
            ? { ...conversation, muted: previousMuted }
            : conversation,
        ),
      );

      if (isMissingMutedColumn(error)) {
        markMuteUnavailable();
        setMuteError({
          conversationId: id,
          message:
            'Mute is not saved yet. Add the muted column in Supabase, then try again.',
        });
      } else {
        console.error('Failed to update chat mute:', error);
        setMuteError({
          conversationId: id,
          message: 'Could not update mute. Try again.',
        });
      }

      return false;
    },
    [markMuteUnavailable],
  );

  return {
    conversations,
    isLoading,
    fetchConversations,
    bumpConversation,
    setConversationMuted,
    muteAvailable,
    muteError,
    savingMuteId,
  };
};
