import { create } from 'zustand';
import { MessageReactionT, ReactionTypeT } from '../types';

export const useReactionStore = create<{
  catalog: ReactionTypeT[];
  reactions: MessageReactionT[];
  setCatalog: (catalog: ReactionTypeT[]) => void;
  setReactions: (reactions: MessageReactionT[]) => void;

  addReaction: (incoming: MessageReactionT) => void;
  removeReaction: (id: string | number) => void;
  removeReactionByDetails: (
    messageId: string,
    userId: string,
    reactionId: string,
  ) => void;
}>((set) => ({
  catalog: [],
  reactions: [],
  setCatalog: (catalog) => set({ catalog }),
  setReactions: (reactions) => set({ reactions }),

  addReaction: (incoming) =>
    set((state) => ({
      reactions: [
        ...state.reactions.filter(
          (r) =>
            r.id !== incoming.id &&
            !(
              r.message_id === incoming.message_id &&
              r.user_id === incoming.user_id &&
              r.reaction_id === incoming.reaction_id
            ),
        ),
        incoming,
      ],
    })),

  removeReaction: (id) =>
    set((state) => ({
      reactions: state.reactions.filter((r) => r.id !== id),
    })),

  removeReactionByDetails: (messageId, userId, reactionId) =>
    set((state) => ({
      reactions: state.reactions.filter(
        (reaction) =>
          !(
            reaction.message_id === messageId &&
            reaction.user_id === userId &&
            reaction.reaction_id === reactionId
          ),
      ),
    })),
}));
