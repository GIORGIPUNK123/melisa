import { create } from 'zustand';

interface PresenceStore {
  onlineUserIds: Set<string>;
  setOnlineUserIds: (ids: Set<string>) => void;
  isUserOnline: (userId: string) => boolean;
}

export const usePresenceStore = create<PresenceStore>((set, get) => ({
  onlineUserIds: new Set<string>(),

  setOnlineUserIds: (ids) => set({ onlineUserIds: ids }),

  isUserOnline: (userId) => get().onlineUserIds.has(userId),
}));
