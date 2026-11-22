import { create } from 'zustand';
import { sameId } from '../shared/utils/ids';
import { ConversationMemberT, ConversationT } from '../types';

const timestampValue = (value?: string) => {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const sortByLatestMessage = (conversations: ConversationT[]) =>
  [...conversations].sort(
    (a, b) =>
      timestampValue(b.lastMessageAt) - timestampValue(a.lastMessageAt),
  );

export interface ChatStore {
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
  setConversationLastMessageAt: (
    conversationId: string | number,
    timestamp: string,
  ) => void;
  setConversationMuted: (
    conversationId: string | number,
    muted: boolean,
  ) => void;
}

export const selectIsConversationMuted =
  (conversationId: string | number) => (state: ChatStore) =>
    state.conversations.find((conv) => sameId(conv.id, conversationId))?.muted ??
    false;

export const useChatStore = create<ChatStore>((set) => ({
  conversations: [],
  activeConversationId: null,
  setActiveConversationId: (id) => set({ activeConversationId: id }),
  isLoading: false,
  hasFetched: false,
  setConversations: (conversations) => set({ conversations }),

  handleIncomingMessage: (msg) => {
    set((state) => ({
      conversations: sortByLatestMessage(
        state.conversations.map((conv) =>
          sameId(conv.id, msg.conversation_id)
            ? { ...conv, lastMessageAt: msg.created_at }
            : conv,
        ),
      ),
    }));
  },

  updateConversationMember: (
    conversationId: string | number,
    updates: Partial<ConversationMemberT>,
  ) => {
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        sameId(conv.id, conversationId)
          ? {
              ...conv,
              conversationMembers: conv.conversationMembers.map((m) =>
                sameId(m.id, updates.id) ? { ...m, ...updates } : m,
              ),
            }
          : conv,
      ),
    }));
  },

  setConversationLastMessageAt: (conversationId, timestamp) => {
    set((state) => ({
      conversations: sortByLatestMessage(
        state.conversations.map((conv) =>
          sameId(conv.id, conversationId)
            ? { ...conv, lastMessageAt: timestamp }
            : conv,
        ),
      ),
    }));
  },

  setConversationMuted: (conversationId, muted) => {
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        sameId(conv.id, conversationId) ? { ...conv, muted } : conv,
      ),
    }));
  },
}));
