import { create } from 'zustand';
import { ConversationMemberT, ConversationT } from '../types';

interface ChatStore {
  conversations: ConversationT[];
  activeConversationId?: number | null;
  setActiveConversationId: (id: number | null) => void;
  isLoading: boolean;
  hasFetched: boolean;
  setConversations: (convs: ConversationT[]) => void;
  handleIncomingMessage: (msg: any) => void;
  updateConversationMember: (
    conversationId: string | number,
    updates: Partial<ConversationMemberT>,
  ) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  conversations: [],
  activeConversationId: null,
  setActiveConversationId: (id) => set({ activeConversationId: id }),
  isLoading: false,
  hasFetched: false,
  setConversations: (conversations) => set({ conversations }),

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
