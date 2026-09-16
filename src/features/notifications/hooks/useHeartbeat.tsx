import { useEffect } from 'react';
import { supabase } from '../../../db/supabase';

export const useHeartbeat = (currentUserId: string | undefined) => {
  useEffect(() => {
    if (!currentUserId || currentUserId === 'loading') {
      return;
    }

    const updateHeartbeat = async () => {
      try {
        await supabase
          .from('users')
          .update({ last_seen_at: new Date().toISOString() })
          .eq('id', currentUserId);
      } catch (err) {
        console.warn('Heartbeat update network failure:', err);
      }
    };

    updateHeartbeat();
    const interval = setInterval(updateHeartbeat, 60000);

    return () => {
      clearInterval(interval);
    };
  }, [currentUserId]);
};
