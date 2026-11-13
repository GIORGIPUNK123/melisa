import { useEffect } from 'react';
import { useFriendStore } from '../../../store/useFriendStore';
import { useAuth } from '../../auth/hooks/useAuth';
import { fetchFriendsList } from '../utils/friendsFunctions';
import { FriendsList } from './FriendsList';

export const FriendsArea = () => {
  const { user } = useAuth();
  const { friends, isLoading, setFriends } = useFriendStore();

  useEffect(() => {
    const loadFriends = async () => {
      const data = await fetchFriendsList();
      setFriends(data);
    };

    loadFriends();
  }, [user]);
  return (
    <div
      className={` relative flex h-full min-h-0 w-full min-w-0 overflow-hidden bg-[#080D14]`}
    >
      <div className='flex flex-col w-full min-w-0 h-full min-h-0'>
        <FriendsList
          friends={friends}
          isLoading={isLoading}
          onFriendSelect={() => {}}
          onViewProfile={() => {}}
          getOrCreateConversation={async (friendUserId: string) => {
            return new Promise((resolve) => resolve(''));
          }}
        />
      </div>
    </div>
  );
};
