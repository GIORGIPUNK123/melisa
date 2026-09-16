import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../../db/supabase';

export const getBlockButtonLabel = (blocked: boolean) =>
  blocked ? '🚫 Unblock' : '🚫 Block User';

export const useBlockedUsers = (userId: string | undefined) => {
  const [blockedIds, setBlockedIds] = useState<string[]>([]);

  const fetchBlocks = useCallback(async () => {
    if (!userId) {
      setBlockedIds([]);
      return;
    }

    const { data, error } = await supabase
      .from('blocks')
      .select('blocked_user_id')
      .eq('blocker_id', userId);

    if (error) {
      console.error('Failed to load blocks:', error);
      return;
    }

    setBlockedIds((data ?? []).map((row) => row.blocked_user_id));
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchBlocks]);

  const isBlocked = useCallback(
    (id?: string | null) => Boolean(id && blockedIds.includes(id)),
    [blockedIds],
  );

  const blockUser = async (blockedUserId: string) => {
    if (!userId) throw new Error('Not authenticated');

    const { error } = await supabase.from('blocks').insert({
      blocker_id: userId,
      blocked_user_id: blockedUserId,
    });
    if (error) throw error;

    setBlockedIds((prev) =>
      prev.includes(blockedUserId) ? prev : [...prev, blockedUserId],
    );
  };

  const unblockUser = async (blockedUserId: string) => {
    if (!userId) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('blocks')
      .delete()
      .eq('blocker_id', userId)
      .eq('blocked_user_id', blockedUserId);
    if (error) throw error;

    setBlockedIds((prev) => prev.filter((id) => id !== blockedUserId));
  };

  return { isBlocked, blockUser, unblockUser };
};
