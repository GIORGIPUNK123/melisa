import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../../../db/supabase';
import {
  MessageReactionT,
  ReactionChipT,
  ReactionTypeT,
} from '../../../types';
import { asId, sameId } from '../../../shared/utils/ids';

type ReactionRow = MessageReactionT & {
  reactions?: ReactionTypeT | ReactionTypeT[] | null;
};

const normalizeReactionRow = (row: ReactionRow): MessageReactionT => {
  const nested = Array.isArray(row.reactions)
    ? row.reactions[0]
    : row.reactions;

  return {
    id: asId(row.id),
    message_id: asId(row.message_id),
    conversation_id: asId(row.conversation_id),
    user_id: asId(row.user_id),
    reaction_id: asId(row.reaction_id),
    created_at: row.created_at,
    reaction: nested
      ? {
          uid: asId(nested.uid),
          reaction: nested.reaction,
          name: nested.name,
        }
      : row.reaction ?? null,
  };
};

const buildChips = (
  rows: MessageReactionT[],
  currentUserId: string,
  catalog: ReactionTypeT[],
): ReactionChipT[] => {
  const byReaction = new Map<string, ReactionChipT>();
  const catalogById = new Map(catalog.map((item) => [item.uid, item]));

  for (const row of rows) {
    const reactionId = row.reaction_id;
    const fromCatalog = catalogById.get(reactionId);
    const emoji =
      fromCatalog?.reaction || row.reaction?.reaction || row.reaction?.name || '';
    const name = fromCatalog?.name || row.reaction?.name || 'reaction';
    if (!emoji) continue;

    const existing = byReaction.get(reactionId);

    if (existing) {
      existing.count += 1;
      if (sameId(row.user_id, currentUserId)) {
        existing.reactedByMe = true;
      }
    } else {
      byReaction.set(reactionId, {
        reactionId,
        emoji,
        name,
        count: 1,
        reactedByMe: sameId(row.user_id, currentUserId),
      });
    }
  }

  return [...byReaction.values()].sort((a, b) => b.count - a.count);
};

export const useMessageReactions = (
  conversationId: string | null | undefined,
  currentUserId: string,
) => {
  const conversationKey = conversationId ? asId(conversationId) : '';
  const [rows, setRows] = useState<MessageReactionT[]>([]);
  const [catalog, setCatalog] = useState<ReactionTypeT[]>([]);

  const heartReaction = useMemo(
    () =>
      catalog.find(
        (item) =>
          item.name.toLowerCase() === 'heart' ||
          item.reaction === '❤️' ||
          item.reaction.includes('❤'),
      ) ||
      catalog[0] ||
      null,
    [catalog],
  );

  useEffect(() => {
    let cancelled = false;

    const loadCatalog = async () => {
      const { data, error } = await supabase
        .from('reactions')
        .select('uid, reaction, name');

      if (cancelled) return;
      if (error) {
        console.error('Failed to load reactions catalog:', error);
        return;
      }

      setCatalog(
        (data || [])
          .map((item) => ({
            uid: asId(item.uid),
            reaction: item.reaction,
            name: item.name,
          }))
          .sort((a, b) => {
            const order = ['heart', 'love', 'haha', 'sad', 'cry', 'angry'];
            const rank = (name: string) => {
              const index = order.indexOf(name.toLowerCase());
              return index === -1 ? order.length : index;
            };
            return rank(a.name) - rank(b.name);
          }),
      );
    };

    void loadCatalog();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!conversationKey) {
      setRows([]);
      return;
    }

    let cancelled = false;

    const fetchReactions = async () => {
      const { data, error } = await supabase
        .from('message_reactions')
        .select(
          'id, message_id, conversation_id, user_id, reaction_id, created_at, reactions ( uid, reaction, name )',
        )
        .eq('conversation_id', conversationKey);

      if (cancelled) return;
      if (error) {
        console.error('Failed to fetch message reactions:', error);
        return;
      }

      setRows((data || []).map((row) => normalizeReactionRow(row as ReactionRow)));
    };

    void fetchReactions();

    void supabase.auth.getSession().then(({ data }) => {
      const token = data.session?.access_token;
      if (token) supabase.realtime.setAuth(token);
    });

    const channel = supabase
      .channel(`reactions:${conversationKey}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions',
          filter: `conversation_id=eq.${conversationKey}`,
        },
        async (payload) => {
          if (payload.eventType === 'DELETE') {
            const oldRow = payload.old as { id?: string };
            if (!oldRow?.id) return;
            setRows((prev) =>
              prev.filter((row) => !sameId(row.id, oldRow.id)),
            );
            return;
          }

          const incoming = payload.new as ReactionRow;
          if (!incoming?.id) return;

          let reaction = incoming.reaction;
          if (!reaction && incoming.reaction_id) {
            const fromCatalog = catalog.find((item) =>
              sameId(item.uid, incoming.reaction_id),
            );
            if (fromCatalog) {
              reaction = fromCatalog;
            } else {
              const { data } = await supabase
                .from('reactions')
                .select('uid, reaction, name')
                .eq('uid', incoming.reaction_id)
                .maybeSingle();
              if (data) {
                reaction = {
                  uid: asId(data.uid),
                  reaction: data.reaction,
                  name: data.name,
                };
              }
            }
          }

          const normalized = normalizeReactionRow({
            ...incoming,
            reaction,
          });

          setRows((prev) => {
            const without = prev.filter(
              (row) => !sameId(row.id, normalized.id),
            );
            if (payload.eventType === 'UPDATE') {
              return [
                ...without.filter(
                  (row) =>
                    !(
                      sameId(row.message_id, normalized.message_id) &&
                      sameId(row.user_id, normalized.user_id)
                    ),
                ),
                normalized,
              ];
            }
            return [...without, normalized];
          });
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [conversationKey, catalog]);

  const chipsByMessageId = useMemo(() => {
    const map = new Map<string, ReactionChipT[]>();
    const grouped = new Map<string, MessageReactionT[]>();

    for (const row of rows) {
      const key = row.message_id;
      const list = grouped.get(key) || [];
      list.push(row);
      grouped.set(key, list);
    }

    for (const [messageId, list] of grouped) {
      map.set(messageId, buildChips(list, currentUserId, catalog));
    }

    return map;
  }, [rows, currentUserId, catalog]);

  const getMyReaction = useCallback(
    (messageId: string) =>
      rows.find(
        (row) =>
          sameId(row.message_id, messageId) &&
          sameId(row.user_id, currentUserId),
      ) || null,
    [rows, currentUserId],
  );

  const removeMyReaction = useCallback(
    async (messageId: string) => {
      if (!currentUserId || messageId.startsWith('temp-')) return;

      const existing = getMyReaction(messageId);
      if (!existing) return;

      setRows((prev) => prev.filter((row) => !sameId(row.id, existing.id)));

      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('id', existing.id)
        .eq('user_id', currentUserId);

      if (error) {
        console.error('Failed to remove reaction:', error);
        setRows((prev) => [...prev, existing]);
      }
    },
    [currentUserId, getMyReaction],
  );

  const setReaction = useCallback(
    async (messageId: string, reactionId: string) => {
      if (!conversationKey || !currentUserId) return;
      if (messageId.startsWith('temp-')) return;

      const chosen =
        catalog.find((item) => sameId(item.uid, reactionId)) || null;
      if (!chosen) return;

      const existing = getMyReaction(messageId);

      if (existing && sameId(existing.reaction_id, chosen.uid)) {
        await removeMyReaction(messageId);
        return;
      }

      if (existing) {
        const previous = existing;
        const optimistic: MessageReactionT = {
          ...existing,
          reaction_id: chosen.uid,
          reaction: chosen,
        };
        setRows((prev) =>
          prev.map((row) =>
            sameId(row.id, existing.id) ? optimistic : row,
          ),
        );

        const { error } = await supabase
          .from('message_reactions')
          .update({ reaction_id: chosen.uid })
          .eq('id', existing.id)
          .eq('user_id', currentUserId);

        if (error) {
          console.error('Failed to update reaction:', error);
          setRows((prev) =>
            prev.map((row) =>
              sameId(row.id, existing.id) ? previous : row,
            ),
          );
        }
        return;
      }

      const tempId = `temp-reaction-${Date.now()}`;
      const optimistic: MessageReactionT = {
        id: tempId,
        message_id: asId(messageId),
        conversation_id: conversationKey,
        user_id: asId(currentUserId),
        reaction_id: chosen.uid,
        created_at: new Date().toISOString(),
        reaction: chosen,
      };
      setRows((prev) => [...prev, optimistic]);

      const { data, error } = await supabase
        .from('message_reactions')
        .insert({
          message_id: messageId,
          user_id: currentUserId,
          reaction_id: chosen.uid,
        })
        .select(
          'id, message_id, conversation_id, user_id, reaction_id, created_at, reactions ( uid, reaction, name )',
        )
        .single();

      if (error) {
        console.error('Failed to add reaction:', error);
        setRows((prev) => prev.filter((row) => row.id !== tempId));
        return;
      }

      if (data) {
        const saved = normalizeReactionRow(data as ReactionRow);
        setRows((prev) => [
          ...prev.filter((row) => row.id !== tempId),
          saved,
        ]);
      }
    },
    [
      catalog,
      conversationKey,
      currentUserId,
      getMyReaction,
      removeMyReaction,
    ],
  );

  const toggleHeart = useCallback(
    async (messageId: string) => {
      if (!heartReaction) return;
      await setReaction(messageId, heartReaction.uid);
    },
    [heartReaction, setReaction],
  );

  return {
    catalog,
    chipsByMessageId,
    toggleHeart,
    setReaction,
    removeMyReaction,
  };
};
