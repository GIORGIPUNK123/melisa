import { api } from '../../../api/instance';

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
