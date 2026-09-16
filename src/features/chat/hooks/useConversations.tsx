import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../../db/supabase';
import { ConversationT } from '../../../types';
import { PostgrestError } from '@supabase/supabase-js';
import { asId } from '../../../shared/utils/ids';

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

export const useConversations = (userId: string | undefined) => {
  const [conversations, setConversations] = useState<ConversationT[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  const fetchConversations = useCallback(async (showLoading = false) => {
    const currentUserId = userIdRef.current;
    if (!currentUserId) return;

    if (showLoading) setIsLoading(true);
    try {
      const { data: conversationMembers, error: membersError } = (await supabase
        .from('conversation_members')
        .select(`last_message_at, conversations(id, type)`)
        .eq('user_id', currentUserId)) as {
        data:
          | {
              last_message_at: string | null;
              conversations: { id: string; type: string };
            }[]
          | null;
        error: PostgrestError | null;
      };

      if (membersError) throw membersError;

      const convs: ConversationT[] = [];

      for (const member of conversationMembers || []) {
        const conv = member.conversations;
        if (!conv?.id || conv.type !== 'direct') continue;

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
          ),
        });
      }

      setConversations(sortByLatestMessage(convs));
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  return { conversations, isLoading, fetchConversations, bumpConversation };
};
