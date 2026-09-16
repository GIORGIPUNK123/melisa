import { useState } from 'react';
import { api } from '../../../api/instance';

export const useAddFriend = () => {
  const [messageResponse, setMessageResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const addFriend = async (username: string) => {
    setIsLoading(true);
    try {
      const { data: sessionData } = await (
        window as any
      ).supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        setMessageResponse('Not authenticated');
        setIsLoading(false);
        return;
      }

      const response = await api.post(
        '/friends/add',
        { username },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setMessageResponse(response.data.message || 'Friend request sent');
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || 'Failed to send friend request';
      setMessageResponse(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetMessageResponse = () => {
    setMessageResponse('');
  };

  return { messageResponse, addFriend, resetMessageResponse, isLoading };
};
