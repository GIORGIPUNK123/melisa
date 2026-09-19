import { useCallback, useEffect, useState } from 'react';
import { api } from '../../../api/instance';
import { supabase } from '../../../db/supabase';

export const getBlockButtonLabel = (blocked: boolean) =>
  blocked ? 'Unblock' : 'Block user';

export const useBlockedUsers = (userId: string | undefined) => {
  const [blockedIds, setBlockedIds] = useState<string[]>([]);
  const [blockedByIds, setBlockedByIds] = useState<string[]>([]);

  const fetchBlocks = useCallback(async () => {
    if (!userId) {
      setBlockedIds([]);
      setBlockedByIds([]);
      return;
    }

    const { data, error } = await supabase
      .from('blocks')
      .select('blocker_id, blocked_user_id')
      .or(`blocker_id.eq.${userId},blocked_user_id.eq.${userId}`);

    if (error) {
      console.error('Failed to load blocks:', error);
      return;
    }

    const mine: string[] = [];
    const theirs: string[] = [];

    for (const row of data ?? []) {
      if (row.blocker_id === userId) {
        mine.push(row.blocked_user_id);
      } else if (row.blocked_user_id === userId) {
        theirs.push(row.blocker_id);
      }
    }

    setBlockedIds(mine);
    setBlockedByIds(theirs);
  }, [userId]);

  useEffect(() => {
    fetchBlocks();
    if (!userId) return;

    const channel = supabase
      .channel(`blocks:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blocks',
          filter: `blocker_id=eq.${userId}`,
        },
        () => {
          fetchBlocks();
        },
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'blocks',
          filter: `blocked_user_id=eq.${userId}`,
        },
        () => {
          fetchBlocks();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchBlocks]);

  const isBlocked = useCallback(
    (id?: string | null) => Boolean(id && blockedIds.includes(id)),
    [blockedIds],
  );

  const isBlockedBy = useCallback(
    (id?: string | null) => Boolean(id && blockedByIds.includes(id)),
    [blockedByIds],
  );

  const hasBlock = useCallback(
    (id?: string | null) => isBlocked(id) || isBlockedBy(id),
    [isBlocked, isBlockedBy],
  );

  const blockUser = async (blockedUserId: string) => {
    if (!userId) throw new Error('Not authenticated');

    await api.post('/friends/block', { userId: blockedUserId });

    setBlockedIds((prev) =>
      prev.includes(blockedUserId) ? prev : [...prev, blockedUserId],
    );
  };

  const unblockUser = async (blockedUserId: string) => {
    if (!userId) throw new Error('Not authenticated');

    await api.delete(`/friends/block/${blockedUserId}`);

    setBlockedIds((prev) => prev.filter((id) => id !== blockedUserId));
  };

  return { isBlocked, isBlockedBy, hasBlock, blockUser, unblockUser };
};
