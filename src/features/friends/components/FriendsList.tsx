import { MouseEvent } from 'react';
import { FriendT } from '../../../types';
import { isUserOnline } from '../../../shared/utils/presence';
import { useTickingNow } from '../../../shared/hooks/useTickingNow';

const getInitials = (nickname: string) => nickname.charAt(0).toUpperCase();

const FriendRow = ({
  friend,
  nowMs,
  onFriendSelect,
  onViewProfile,
  onOpenConversation,
}: {
  friend: FriendT;
  nowMs: number;
  onFriendSelect: (conversationId: string) => void;
  onViewProfile: (username: string) => void;
  onOpenConversation: (friendUserId: string) => Promise<string | null>;
}) => {
  const isOnline = isUserOnline(
    friend.last_seen_at,
    friend.appear_offline,
    nowMs,
  );

  const handleFriendClick = async () => {
    if (friend.conversationId) {
      onFriendSelect(friend.conversationId);
      return;
    }

    const conversationId = await onOpenConversation(friend.userId);
    if (conversationId) {
      onFriendSelect(conversationId);
    }
  };

  const handleViewProfile = (e: MouseEvent) => {
    e.stopPropagation();
    onViewProfile(friend.username);
  };

  return (
    <div className='relative group'>
      <button
        onClick={handleFriendClick}
        className='flex items-center w-full gap-3 p-3 text-left transition-colors rounded-lg hover:bg-slate-800'
      >
        {friend.avatarUrl ? (
          <img
            src={friend.avatarUrl}
            alt={friend.nickname}
            className='flex-shrink-0 object-cover w-10 h-10 rounded-full'
          />
        ) : (
          <div className='flex items-center justify-center flex-shrink-0 w-10 h-10 text-sm font-semibold text-slate-100 rounded-full bg-slate-700'>
            {getInitials(friend.nickname)}
          </div>
        )}
        <div className='flex-1 min-w-0'>
          <div className='font-medium text-white truncate'>
            {friend.nickname}
          </div>
          <div className='text-xs truncate text-slate-400'>
            @{friend.username}
          </div>
        </div>
        <div
          className={`h-2 w-2 rounded-full flex-shrink-0 ${
            isOnline ? 'bg-emerald-500' : 'bg-slate-500'
          }`}
          title={isOnline ? 'online' : 'offline'}
        />
      </button>

      <button
        onClick={handleViewProfile}
        className='absolute p-2 transition-all -translate-y-1/2 rounded-lg right-2 top-1/2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white opacity-100 lg:opacity-0 lg:group-hover:opacity-100'
        title='View Profile'
      >
        <svg
          className='w-4 h-4'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
          />
        </svg>
      </button>
    </div>
  );
};

export const FriendsList = (props: {
  onFriendSelect: (conversationId: string) => void;
  onViewProfile: (username: string) => void;
  ensureTargetSubscription?: (userId: string) => void;
  friends: FriendT[];
  isLoading: boolean;
  getOrCreateConversation: (friendUserId: string) => Promise<string | null>;
}) => {
  const {
    friends,
    isLoading,
    getOrCreateConversation,
    onViewProfile,
    onFriendSelect,
  } = props;
  const nowMs = useTickingNow();

  return (
    <div className='flex flex-col h-full'>
      <h3 className='px-4 py-3 text-sm tracking-wider uppercase border-b text-slate-400 border-slate-700'>
        Friends ({friends.length})
      </h3>

      {isLoading ? (
        <div className='flex items-center justify-center py-8 text-slate-400'>
          Loading friends...
        </div>
      ) : friends.length === 0 ? (
        <div className='flex items-center justify-center py-8 text-sm text-slate-400'>
          No friends yet
        </div>
      ) : (
        <div className='flex-1 p-2 space-y-1 overflow-y-auto'>
          {friends.map((friend) => (
            <FriendRow
              key={friend.friendshipId}
              friend={friend}
              nowMs={nowMs}
              onFriendSelect={onFriendSelect}
              onViewProfile={onViewProfile}
              onOpenConversation={getOrCreateConversation}
            />
          ))}
        </div>
      )}
    </div>
  );
};
