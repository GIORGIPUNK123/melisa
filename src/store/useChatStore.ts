import { create } from 'zustand';
import { supabase } from '../db/supabase';
import {
  ConversationMemberT,
  ConversationT,
  MessageReactionT,
  ReactionTypeT,
} from '../types';

interface ChatStore {
  conversations: ConversationT[];
  activeConversationId?: number | null;
  setActiveConversationId: (id: number | null) => void;
  isLoading: boolean;
  hasFetched: boolean;
  fetchConversations: (userId: string) => Promise<void>;
  setConversations: (convs: ConversationT[]) => void;
  handleIncomingMessage: (msg: any) => void;
  updateConversationMember: (
    conversationId: string | number,
    updates: Partial<ConversationMemberT>,
  ) => void;
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
          last_read_at,
          last_message_at,
          joined_at,
            conversations (
            id,
            type,
            name,
            conversation_members (
                public_profiles (
                id,
                nickname,
                username,
                avatar_url,
                public_key
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
            (m2: any) => {
              const profile = m2.public_profiles;
              return {
                id: profile.id,
                nickname: profile.nickname,
                username: profile.username,
                avatarUrl: profile.avatar_url,
                publicKey: profile.public_key,
                lastReadAt: m2.last_read_at || m.last_read_at,
                lastMessageAt: m2.last_message_at || m.last_message_at,
                joinedAt: m2.joined_at || m.joined_at,
              };
            },
          ),
          muted: m.muted,
          lastMessageTime: m.last_message_at,
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

  handleIncomingMessage: (msg) => {
    set((state) => {
      const updated = state.conversations.map((conv) => {
        if (conv.id.toString() === msg.conversation_id.toString()) {
          return {
            ...conv,
            lastMessageTime: msg.created_at,
          };
        }
        return conv;
      });

      return {
        conversations: updated.sort(
          (a, b) =>
            new Date(b.lastMessageTime || 0).getTime() -
            new Date(a.lastMessageTime || 0).getTime(),
        ),
      };
    });
  },

  updateConversationMember: (
    conversationId: string | number,
    updates: Partial<ConversationMemberT>,
  ) => {
    set((state) => ({
      conversations: state.conversations.map((conv) => {
        if (conv.id.toString() === conversationId.toString()) {
          return {
            ...conv,
            muted: updates.muted !== undefined ? updates.muted : conv.muted,
            conversationMembers: conv.conversationMembers.map((m) =>
              m.id === updates.id ? { ...m, ...updates } : m,
            ),
          };
        }
        return conv;
      }),
    }));
  },
}));
