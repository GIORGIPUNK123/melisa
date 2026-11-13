import { api } from '../../../api/instance';
import { FriendT } from '../../../types';

export const fetchFriendsList = async (): Promise<FriendT[]> => {
  try {
    const response = await api.get('/friends/list');
    return response.data.friends || [];
  } catch (err) {
    console.error('Failed to fetch friends list:', err);
    return [];
  }
};

export const getOrCreateConversationApi = async (
  friendUserId: string,
): Promise<string | null> => {
  try {
    const response = await api.get(`/friends/conversation/${friendUserId}`);
    return response.data.conversationId;
  } catch (err) {
    console.error('Failed to get or create conversation:', err);
    return null;
  }
};

export const removeFriendApi = async (
  friendUserId: string,
): Promise<boolean> => {
  try {
    await api.delete(`/friends/with/${friendUserId}`);
    return true;
  } catch (err) {
    console.error('Failed to remove friend:', err);
    return false;
  }
};

export const checkUsername = async (username: string): Promise<boolean> => {
  try {
    const res = await api.get(
      `/auth/check-username?username=${encodeURIComponent(username)}`,
    );
    return res.data.exists;
  } catch (err) {
    console.error('Error checking username:', err);
    return false;
  }
};

export const getUserIdByUsername = async (
  username: string,
): Promise<string | null> => {
  try {
    const res = await api.get(
      `/friends/profile/${encodeURIComponent(username)}`,
    );
    return res.data.user?.id ?? null;
  } catch (err) {
    console.error('Error getting user id by username:', err);
    return null;
  }
};
