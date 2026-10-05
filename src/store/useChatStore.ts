import { create } from 'zustand';
import { supabase } from '../db/supabase';
import { ConversationT } from '../types';

interface ChatStore {
  conversations: ConversationT[];
  activeConversationId?: number | null;
  setActiveConversationId: (id: number | null) => void;
  isLoading: boolean;
  hasFetched: boolean; // Prevents re-fetching on tab switch!

  fetchConversations: (userId: string) => Promise<void>;
  setConversations: (convs: ConversationT[]) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  setActiveConversationId: (id) => set({ activeConversationId: id }),
  isLoading: false,
  hasFetched: false,

  setConversations: (conversations) => set({ conversations }),

  fetchConversations: async (userId: string) => {
    if (get().hasFetched) return;

    set({ isLoading: true });

    try {
      const { data, error } = await supabase
        .from('conversation_members')
        .select(
          `
          muted,
            conversations (
            id,
            type,
            name,
            last_message_at,
            conversation_members (
                public_profiles (
                id,
                nickname,
                username,
                avatar_url
                )
            )
            )
        `,
        )
        .eq('user_id', userId)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      const formattedConvs: ConversationT[] = (data || []).map((m: any) => {
        const otherUser = m.conversations.conversation_members.find(
          (member: any) => member.public_profiles.id !== userId,
        );
        return {
          id: m.conversations.id,
          type: m.conversations.type,
          name:
            m.conversations.name ||
            otherUser?.public_profiles?.nickname ||
            'Unknown',
          conversationMembers: m.conversations.conversation_members.map(
            (m2: any) => ({
              id: m2.public_profiles.id,
              nickname: m2.public_profiles.nickname,
              username: m2.public_profiles.username,
              avatarUrl: m2.public_profiles.avatar_url,
            }),
          ),
          muted: m.muted,
          lastMessageTime: m.conversations.last_message_at,
        };
      });

      set({
        conversations: formattedConvs,
        isLoading: false,
        hasFetched: true,
      });
    } catch (err) {
      console.error('Failed to fetch chats:', err);
      set({ isLoading: false });
    }
  },
}));
