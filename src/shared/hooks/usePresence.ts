import { useEffect } from 'react';
import { supabase } from '../../db/supabase';
import { usePresenceStore } from '../../store/usePresenceStore';

export function usePresence(userId: string | undefined) {
  const setOnlineUserIds = usePresenceStore((s) => s.setOnlineUserIds);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase.channel('global-presence', {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    const syncPresenceState = () => {
      const state = channel.presenceState();
      const activeIds = new Set(Object.keys(state));
      setOnlineUserIds(activeIds);
    };

    channel
      .on('presence', { event: 'sync' }, syncPresenceState)
      .on('presence', { event: 'join' }, syncPresenceState)
      .on('presence', { event: 'leave' }, syncPresenceState)
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({});
          syncPresenceState();
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, setOnlineUserIds]);
}
