import { useState, useEffect } from 'react';
import { supabase } from '../../../db/supabase';
import { UserT } from '../../../types';
import { api } from '../../../api/instance';

export const useAdditionalInfo = (userId: string | undefined) => {
  const [messageResponse, setMessageResponse] = useState<string>('');
  const [hasUsername, setHasUsername] = useState<boolean>(true);

  const getUser = async (): Promise<{
    user: UserT | null;
    error: string | null;
  }> => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        return { user: null, error: 'Not authenticated' };
      }

      const response = await api.get('/friends/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      return { user: response.data.user as UserT, error: null };
    } catch (err: any) {
      return { user: null, error: err.message };
    }
  };

  const addAdditionalInfo = async (username: string, nickname: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        setMessageResponse('Not authenticated');
        return;
      }

      const { user: currUser, error: currUserError } = await getUser();
      if (currUserError) {
        throw new Error(currUserError);
      }

      if (currUser) {
        if (currUser.username) {
          setHasUsername(true);
          setMessageResponse('Username already exists');
        } else {
          await api.put(
            '/friends/settings',
            { username, nickname },
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          setMessageResponse('Additional info added successfully');
        }
      } else {
        setMessageResponse('User not found');
      }
    } catch (error: any) {
      console.error('Error:', error);
      setMessageResponse(
        error.message || 'An error occurred while adding additional info',
      );
    }
  };

  const resetMessageResponse = () => {
    setMessageResponse('');
  };

  // Automatically check for username when the hook is initialized
  useEffect(() => {
    if (!userId) return; // Skip if userId is undefined

    const checkForUsername = async () => {
      const { user: currUser } = await getUser();
      // console.log('check for username currUser: ', currUser);
      if ((currUser && !currUser.username) || !currUser) {
        console.log(`username doesn't exist`);
        setHasUsername(false); // Username doesn't exist, open modal
      } else {
        console.log('else ');
        setHasUsername(true); // Username exists, no need to open modal
      }
    };

    checkForUsername();
  }, [userId]);

  return {
    messageResponse,
    addAdditionalInfo,
    resetMessageResponse,
    hasUsername,
  };
};
