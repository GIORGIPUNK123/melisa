import { useState } from 'react';
import { api } from '../../../api/instance';

export const useAddFriend = () => {
  const [messageResponse, setMessageResponse] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const addFriend = async (username: string) => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setIsSuccess(false);
      setMessageResponse('Please enter a username');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/friends/add', {
        username: trimmedUsername,
      });

      setIsSuccess(true);
      setMessageResponse(
        response.data.message || 'Friend request sent successfully',
      );
    } catch (err: any) {
      setIsSuccess(false);
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        'Failed to send friend request';
      setMessageResponse(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetMessageResponse = () => {
    setMessageResponse('');
    setIsSuccess(false);
  };

  return {
    messageResponse,
    isSuccess,
    addFriend,
    resetMessageResponse,
    isLoading,
  };
};
