import { useState } from 'react';
import { supabase } from '../db/supabase';
import { UserType } from '../types';
import { PostgrestError, User } from '@supabase/supabase-js';

export const useAddFriend = () => {
  const [messageResponse, setMessageResponse] = useState<string>('');

  const getOtherUser = async (
    username: string
  ): Promise<{ user: UserType | null; error: PostgrestError | null }> => {
    const { data: user, error } = await supabase
      .from('user')
      .select()
      .eq('user_username', username)
      .single();

    return { user, error };
  };

  const addFriend = async (user: User, username: string) => {
    console.log('username: ', username);
    const { user: otherUser, error: otherUserError } = await getOtherUser(
      username
    );

    if (otherUser) {
      await supabase
        .from('friends')
        .insert([{ sender_id: user.id, receiver_id: otherUser.user_auth_id }])
        .select();

      setMessageResponse('Friend request sent');
    } else {
      console.log('error: ', otherUserError);
      setMessageResponse('User not found');
    }
  };
  const resetMessageResponse = () => {
    setMessageResponse('');
  };

  return { messageResponse, addFriend, resetMessageResponse };
};
