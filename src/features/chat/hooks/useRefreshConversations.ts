import { useCallback, useRef } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useChatStore } from '../../../store/useChatStore';
import { fetchConversations } from '../utils/conversationFunctions';
import { supabase } from '../../../db/supabase';

/**
 * Re-fetches the conversation list in place. Concurrent refreshes share the
 * same request, and a failure keeps the existing list instead of blanking it.
 */
export const useRefreshConversations = () => {
  const { user } = useAuth();
  const setConversations = useChatStore((state) => state.setConversations);
  const inFlightRef = useRef(false);

  return useCallback(async () => {
    if (!user?.id || inFlightRef.current) return;

    inFlightRef.current = true;
    try {
      const data = await fetchConversations(supabase, user.id);
      setConversations(data);
    } catch (error) {
      console.error('Failed to refresh conversations', error);
    } finally {
      inFlightRef.current = false;
    }
  }, [user?.id, setConversations]);
};
