// src/store/useFriendStore.ts
import { create } from 'zustand';
import { FriendT } from '../types';

interface FriendStore {
  friends: FriendT[];
  isLoading: boolean;
  setFriends: (friends: FriendT[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  removeFriendFromStore: (friendUserId: string) => void;
}

export const useFriendStore = create<FriendStore>((set) => ({
  friends: [],
  isLoading: true,
  setFriends: (friends) => set({ friends, isLoading: false }),
  setIsLoading: (isLoading) => set({ isLoading }),

  removeFriendFromStore: (friendUserId) =>
    set((state) => ({
      friends: state.friends.filter((friend) => friend.userId !== friendUserId),
    })),
}));
