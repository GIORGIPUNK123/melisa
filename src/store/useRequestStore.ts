import { create } from 'zustand';
import { api } from '../api/instance';

export interface PendingRequest {
  friendshipId: string;
  username: string;
  nickname: string;
  avatarUrl?: string | null;
  status?: string;
  createdAt: string;
}

interface RequestStore {
  sentRequests: PendingRequest[];
  receivedRequests: PendingRequest[];
  isLoading: boolean;
  setRequests: (
    sentRequests: PendingRequest[],
    receivedRequests: PendingRequest[],
  ) => void;
  setLoading: (isLoading: boolean) => void;
  cancelRequest: (friendshipId: string) => Promise<boolean>;
  acceptRequest: (friendshipId: string) => Promise<boolean>;
  rejectRequest: (friendshipId: string) => Promise<boolean>;
}

const removeFrom = (requests: PendingRequest[], friendshipId: string) =>
  requests.filter((request) => request.friendshipId !== friendshipId);

export const useRequestStore = create<RequestStore>((set) => ({
  sentRequests: [],
  receivedRequests: [],
  isLoading: false,

  setRequests: (sentRequests, receivedRequests) =>
    set({ sentRequests, receivedRequests, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),

  cancelRequest: async (friendshipId) => {
    try {
      await api.delete(`/friends/request/${friendshipId}`);
      set((state) => ({
        sentRequests: removeFrom(state.sentRequests, friendshipId),
      }));
      return true;
    } catch (error) {
      console.error('Failed to cancel friend request:', error);
      return false;
    }
  },

  acceptRequest: async (friendshipId) => {
    try {
      await api.post(`/friends/request/${friendshipId}/accept`, {});
      set((state) => ({
        receivedRequests: removeFrom(state.receivedRequests, friendshipId),
      }));
      return true;
    } catch (error) {
      console.error('Failed to accept friend request:', error);
      return false;
    }
  },

  rejectRequest: async (friendshipId) => {
    try {
      await api.delete(`/friends/request/${friendshipId}/reject`);
      set((state) => ({
        receivedRequests: removeFrom(state.receivedRequests, friendshipId),
      }));
      return true;
    } catch (error) {
      console.error('Failed to reject friend request:', error);
      return false;
    }
  },
}));
