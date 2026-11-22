import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../../db/supabase';
import { sameId } from '../../../shared/utils/ids';
import type { ConversationMemberT, MessageT } from '../../../types';

export const useConversationReadReceipt = (params: {
  conversationId: string | number;
  isAuthenticated: boolean;
  user: User | null;
  messages: MessageT[];
  setConversationMembers: Dispatch<SetStateAction<ConversationMemberT[]>>;
  markAsRead: (updates: Partial<ConversationMemberT>) => void;
}) => {
  const {
    conversationId,
    isAuthenticated,
    user,
    messages,
    setConversationMembers,
    markAsRead,
  } = params;

  const lastMarkedRef = useRef<string | null>(null);
  const [visibilityTick, setVisibilityTick] = useState(0);

  // Re-check when the tab becomes visible again, even if no new message arrived.
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setVisibilityTick((tick) => tick + 1);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !conversationId || !user) return;
    if (document.visibilityState !== 'visible') return;

    // Optimistic messages use the client clock; only act on persisted ones.
    const latestMessage = [...messages]
      .reverse()
      .find((message) => !String(message.id).startsWith('temp-'));
    if (!latestMessage) return;

    const key = `${conversationId}:${latestMessage.id}:${visibilityTick}`;
    if (lastMarkedRef.current === key) return;
    lastMarkedRef.current = key;

    const parsedId = Number(latestMessage.id);
    const updates = {
      unreadCount: 0,
      lastReadMessageId: Number.isNaN(parsedId) ? 0 : parsedId,
      lastReadAt: new Date().toISOString(),
    };

    setConversationMembers((previous) =>
      previous.map((member) =>
        sameId(member.id, user.id) ? { ...member, ...updates } : member,
      ),
    );
    markAsRead(updates);

    void supabase
      .rpc('mark_conversation_read', {
        p_conversation_id: Number(conversationId),
      })
      .then(({ error }) => {
        if (error) {
          lastMarkedRef.current = null;
          console.error('Failed to mark as read:', error);
        }
      });
  }, [
    messages,
    conversationId,
    user,
    isAuthenticated,
    setConversationMembers,
    markAsRead,
    visibilityTick,
  ]);
};
