import { api } from '../../../api/instance';

export const checkUsername = async (username: string): Promise<boolean> => {
  try {
    const res = await api.get(
      `/auth/check-username?username=${encodeURIComponent(username)}`,
    );
    console.log('checkUsername response: ', res.data);
    return res.data.exists;
  } catch (err) {
    console.error('Error checking username:', err);
    return false;
  }
};
